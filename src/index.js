'use strict'

/**
 * dsh-gaokao — Host half
 *
 * 梦回高三：扫描 data/（或插件配置 dataDir 指向的外部目录）下的 Markdown
 * 知识卡，构建 学科/年级/关联 索引，供 web 客户端的小黑板 + 知识卡消费。
 *
 * 知识卡 = 一个 .md 文件，目录即学科/年级（可被 frontmatter 覆盖）：
 *   data/物理/高一/牛顿第一定律.md
 *     ---
 *     subject: 物理        # 可选，缺省取第一级文件夹名
 *     grade: 高一          # 可选，缺省取第二级文件夹名
 *     tags: [力学]         # 可选
 *     related: [牛顿第二定律]  # 可选，可写标题或卡片 id
 *     ---
 *     # 牛顿第一定律        # 标题取首个一级标题（或 frontmatter title）
 *     正文 Markdown……关联写 [[牛顿第二定律]] 也能被解析成链接。
 *
 * HTTP API（/dsh-gaokao/api/*）：
 *   GET /draw?subject=&grade=&subjects=a,b&exclude=id1,id2   随机抽一张
 *   GET /bundle?n=30&subjects=&exclude=                      批量随机（客户端本地池）
 *   GET /card?id=                                            按 id 取整张
 *   GET /status                                              概况 + 高考日期/倒计时
 *   GET /reload                                              重新扫描目录（热加载）
 *   GET /feed?after=N                                        会话事件流（联动用）
 *
 * 零 npm 依赖：只用 node 内置模块，经注入的 `webServer` 挂路由。
 */

const fs = require('node:fs')
const path = require('node:path')

const BUNDLED_DATA_DIR = path.join(__dirname, '..', 'data')

const ARRAY_KEYS = new Set(['tags', 'related'])

/** 极简 frontmatter 解析：支持 key: value、[a, b] 行内数组、- 列表块。 */
function parseFrontmatter(src) {
  const text = String(src).replace(/^﻿/, '')
  if (!/^---[ \t]*\r?\n/.test(text)) return { meta: {}, body: text }
  const close = text.indexOf('\n---', 4)
  if (close === -1) return { meta: {}, body: text }
  const raw = text.slice(4, close)
  const body = text.slice(close + 4).replace(/^\r?\n/, '')
  const meta = {}
  let curKey = null
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z_一-龥][\w一-龥-]*)\s*:\s*(.*)$/)
    if (m && !/^\s/.test(line)) {
      curKey = m[1]
      const v = m[2].trim()
      if (v === '') {
        meta[curKey] = ARRAY_KEYS.has(curKey) ? [] : ''
      } else if (v.startsWith('[') && v.endsWith(']')) {
        meta[curKey] = v.slice(1, -1).split(/[,，]/).map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
      } else {
        meta[curKey] = v.replace(/^["']|["']$/g, '')
      }
    } else {
      const li = line.match(/^\s*-\s+(.+)$/)
      if (li && curKey) {
        if (!Array.isArray(meta[curKey])) meta[curKey] = []
        meta[curKey].push(li[1].trim().replace(/^["']|["']$/g, ''))
      }
    }
  }
  for (const k of ARRAY_KEYS) {
    if (typeof meta[k] === 'string') meta[k] = meta[k] ? meta[k].split(/[,，]/).map((s) => s.trim()).filter(Boolean) : []
  }
  return { meta, body }
}

/** 去掉 Markdown 记号，取纯文本（做摘要用）。 */
function plainText(s) {
  return String(s)
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/[*`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 高考倒计时：默认每年 6 月 7 日开考；过了 6 月 9 日则指向下一届。 */
function examInfo(config) {
  const now = new Date()
  let exam
  if (config.examDate && /^\d{4}-\d{2}-\d{2}$/.test(config.examDate)) {
    const [y, m, d] = config.examDate.split('-').map(Number)
    exam = new Date(y, m - 1, d)
  } else {
    exam = new Date(now.getFullYear(), 5, 7)          // 6 月 7 日
    const endOfExam = new Date(now.getFullYear(), 5, 10) // 考完（6/10 零点）滚到下一届
    if (now >= endOfExam) exam = new Date(now.getFullYear() + 1, 5, 7)
  }
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const daysLeft = Math.round((exam - today) / 86400000)
  const pad = (n) => String(n).padStart(2, '0')
  return {
    examDate: `${exam.getFullYear()}-${pad(exam.getMonth() + 1)}-${pad(exam.getDate())}`,
    daysLeft: Math.max(0, daysLeft),
    inExam: now >= exam && now < new Date(exam.getFullYear(), exam.getMonth(), exam.getDate() + 3),
  }
}

/** Markdown 知识卡库：递归扫描目录，构建 id/标题 双索引并解析关联。 */
class KnowledgeStore {
  constructor(dataDir) {
    this.dataDir = dataDir
    this.cards = []
    this.byIdMap = new Map()
    this.byTitle = new Map()     // 标题/文件名 → id（关联解析用）
    this.bySubject = new Map()
  }

  /** 递归收集 .md 文件（跳过 README、点开头、下划线开头目录）。 */
  _walk(dir, out = []) {
    let ents
    try { ents = fs.readdirSync(dir, { withFileTypes: true }) } catch { return out }
    for (const ent of ents) {
      if (ent.name.startsWith('.')) continue
      const p = path.join(dir, ent.name)
      if (ent.isDirectory()) {
        if (ent.name.startsWith('_')) continue
        this._walk(p, out)
      } else if (/\.md$/i.test(ent.name) && !/^readme(\..+)?\.md$/i.test(ent.name)) {
        out.push(p)
      }
    }
    return out
  }

  build() {
    const files = this._walk(this.dataDir)
    const cards = []
    for (const file of files) {
      let src
      try { src = fs.readFileSync(file, 'utf8') } catch { continue }
      const { meta, body } = parseFrontmatter(src)
      const rel = path.relative(this.dataDir, file).replace(/\\/g, '/').replace(/\.md$/i, '')
      const segs = rel.split('/')
      const h1 = body.match(/^#\s+(.+?)\s*$/m)
      const title = meta.title || (h1 && h1[1].trim()) || segs[segs.length - 1]
      const subject = meta.subject || (segs.length > 1 ? segs[0] : '未分类')
      const grade = meta.grade || (segs.length > 2 ? segs[1] : '通用')
      // 摘要：第一条非标题、非空行
      let summary = ''
      for (const line of body.split(/\r?\n/)) {
        const t = line.trim()
        if (!t || t.startsWith('#') || t === '---') continue
        summary = plainText(t).slice(0, 90)
        if (summary) break
      }
      // 正文里的 [[wikilink]]（支持 [[目标|显示名]]）也计入关联
      const wiki = []
      for (const m of body.matchAll(/\[\[([^\]]+)\]\]/g)) {
        wiki.push(m[1].split('|')[0].trim())
      }
      const relatedRaw = [...new Set([...(meta.related || []), ...wiki])].filter(Boolean)
      cards.push({
        id: String(meta.id || rel),
        title,
        subject,
        grade,
        tags: meta.tags || [],
        summary,
        body,
        relatedRaw,
      })
    }
    // id 去重（撞名加序号）
    const seen = new Map()
    for (const c of cards) {
      if (seen.has(c.id)) {
        const n = seen.get(c.id) + 1
        seen.set(c.id, n)
        c.id = `${c.id}#${n}`
      } else seen.set(c.id, 1)
    }
    this.cards = cards
    this.byIdMap = new Map(cards.map((c) => [c.id, c]))
    this.byTitle = new Map()
    for (const c of cards) {
      if (!this.byTitle.has(c.title)) this.byTitle.set(c.title, c.id)
      const base = c.id.split('/').pop()
      if (!this.byTitle.has(base)) this.byTitle.set(base, c.id)
    }
    // 解析关联：relatedRaw → 真实卡片引用 + 未命中名单
    for (const c of cards) {
      c.related = []
      c.relatedMissing = []
      for (const r of c.relatedRaw) {
        const id = this.byIdMap.has(r) ? r : this.byTitle.get(r)
        if (id && id !== c.id) {
          const t = this.byIdMap.get(id)
          if (!c.related.some((x) => x.id === id)) {
            c.related.push({ id: t.id, title: t.title, subject: t.subject, grade: t.grade })
          }
        } else if (!id) {
          c.relatedMissing.push(r)
        }
      }
    }
    this.bySubject = new Map()
    for (const c of cards) {
      if (!this.bySubject.has(c.subject)) this.bySubject.set(c.subject, [])
      this.bySubject.get(c.subject).push(c)
    }
    return cards.length
  }

  draw({ subject, grade, subjects, exclude = [] } = {}) {
    let pool = this.cards
    if (subjects && subjects.size) pool = pool.filter((c) => subjects.has(c.subject))
    if (subject && subject !== 'all' && subject !== '全部') pool = pool.filter((c) => c.subject === subject)
    if (grade && grade !== 'all' && grade !== '全部') pool = pool.filter((c) => c.grade === grade)
    if (!pool.length) return undefined
    const ex = new Set(exclude)
    if (ex.size) {
      const fresh = pool.filter((c) => !ex.has(c.id))
      if (fresh.length) pool = fresh
    }
    return pool[Math.floor(Math.random() * pool.length)]
  }

  byId(id) { return this.byIdMap.get(id) }

  status(config) {
    const subjects = {}
    const grades = {}
    for (const c of this.cards) {
      subjects[c.subject] = (subjects[c.subject] || 0) + 1
      grades[c.grade] = (grades[c.grade] || 0) + 1
    }
    return {
      total: this.cards.length,
      subjects,
      grades,
      dataDir: this.dataDir,
      exam: examInfo(config || {}),
    }
  }
}

/** 客户端需要的卡片载荷（relatedRaw 不外发，换成解析后的 related）。 */
function cardPayload(c) {
  if (!c) return c
  return {
    id: c.id,
    title: c.title,
    subject: c.subject,
    grade: c.grade,
    tags: c.tags,
    summary: c.summary,
    body: c.body,
    related: c.related,
    relatedMissing: c.relatedMissing,
  }
}

module.exports = {
  name: 'dsh-gaokao',
  inject: ['webServer'],

  __test: { KnowledgeStore, BUNDLED_DATA_DIR, parseFrontmatter, examInfo, plainText },

  apply(ctx, rawConfig) {
    const config = rawConfig && typeof rawConfig === 'object' ? rawConfig : {}
    const dataDir = config.dataDir || BUNDLED_DATA_DIR
    const store = new KnowledgeStore(dataDir)
    try {
      const n = store.build()
      ctx.logger?.info?.(`[dsh-gaokao] 知识卡加载完成：${n} 张（${dataDir}）`)
    } catch (err) {
      ctx.logger?.warn?.(`[dsh-gaokao] 知识卡加载失败：${err.message}（${dataDir}）`)
    }

    // ── 事件联动：订阅会话事件流，AI 干活时客户端随机弹出知识点 ──────────
    const feed = []
    let feedSeq = 0
    const FEED_MAX = 60
    const feedPush = (kind, extra = {}) => {
      feedSeq += 1
      feed.push({ id: feedSeq, at: new Date().toISOString(), kind, ...extra })
      if (feed.length > FEED_MAX) feed.splice(0, feed.length - FEED_MAX)
    }

    ctx.effect(() => {
      const onSessionEvent = (session, event) => {
        try {
          const sessionId = session && session.id
          const base = { sessionId: typeof sessionId === 'string' ? sessionId : undefined }
          switch (event && event.type) {
            case 'user/message': {
              const src = event.data && event.data.source
              if (src && src.kind !== 'user') return
              const text = typeof (event.data && event.data.content) === 'string'
                ? event.data.content
                : ''
              feedPush('user_msg', { ...base, text: text.replace(/\s+/g, ' ').slice(0, 80) })
              break
            }
            case 'tool/call':
              feedPush('tool_call', { ...base, tool: (event.data && event.data.name) || 'tool' })
              break
            case 'tool/result': {
              const tool = (event.data && event.data.name) || ''
              const failed = !!(event.data && ((event.data.message && event.data.message.isError === true) || event.data.error !== undefined))
              feedPush(failed ? 'tool_error' : 'tool_ok', { ...base, tool })
              break
            }
            case 'turn/end':
              feedPush('turn_end', base)
              break
            case 'turn/start':
              feedPush('turn_start', base)
              break
          }
        } catch (e) {
          ctx.logger?.warn?.(`[dsh-gaokao] session/event handler: ${e && e.message}`)
        }
      }
      const dispose = ctx.on('session/event', onSessionEvent)
      return () => { try { dispose() } catch {} }
    }, 'dsh-gaokao: session/event subscription')

    const sendJson = (res, status, payload) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(payload))
    }

    const subjectsParam = (url) => {
      const set = new Set((url.searchParams.get('subjects') || '').split(',').map((s) => s.trim()).filter(Boolean))
      return set.size ? set : undefined
    }

    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: '/dsh-gaokao/api',
      handler: async (req, res) => {
        try {
          const url = new URL(req.url || '/', 'http://dsh.local')
          const p = url.pathname.replace(/\/+$/, '')
          if (req.method === 'GET' && p.endsWith('/draw')) {
            if (!store.cards.length) { sendJson(res, 503, { error: '知识卡为空' }); return }
            const exclude = (url.searchParams.get('exclude') || '').split(',').filter(Boolean)
            const c = store.draw({
              subject: url.searchParams.get('subject'),
              grade: url.searchParams.get('grade'),
              subjects: subjectsParam(url),
              exclude,
            })
            if (!c) { sendJson(res, 404, { error: '该范围下没有知识卡' }); return }
            sendJson(res, 200, { card: cardPayload(c) })
            return
          }
          if (req.method === 'GET' && p.endsWith('/bundle')) {
            if (!store.cards.length) { sendJson(res, 503, { error: '知识卡为空' }); return }
            const n = Math.min(60, Math.max(1, Number(url.searchParams.get('n') || 30)))
            const ex = new Set((url.searchParams.get('exclude') || '').split(',').filter(Boolean))
            let pool = store.cards
            const subjects = subjectsParam(url)
            if (subjects) pool = pool.filter((c) => subjects.has(c.subject))
            const subject = url.searchParams.get('subject')
            if (subject && subject !== 'all' && subject !== '全部') pool = pool.filter((c) => c.subject === subject)
            const fresh = ex.size ? pool.filter((c) => !ex.has(c.id)) : pool
            if (fresh.length >= n) pool = fresh
            const picked = pool.slice()
            for (let i = picked.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1))
              ;[picked[i], picked[j]] = [picked[j], picked[i]]
            }
            sendJson(res, 200, { cards: picked.slice(0, n).map(cardPayload) })
            return
          }
          if (req.method === 'GET' && p.endsWith('/card')) {
            const c = store.byId(url.searchParams.get('id') || '')
            if (!c) { sendJson(res, 404, { error: '知识卡不存在' }); return }
            sendJson(res, 200, { card: cardPayload(c) })
            return
          }
          if (req.method === 'GET' && p.endsWith('/status')) {
            sendJson(res, 200, store.status(config))
            return
          }
          if (req.method === 'GET' && p.endsWith('/feed')) {
            const after = Number(url.searchParams.get('after') || 0)
            sendJson(res, 200, { events: feed.filter((ev) => ev.id > after) })
            return
          }
          if (req.method === 'GET' && p.endsWith('/reload')) {
            const n = store.build()
            sendJson(res, 200, { reloaded: true, total: n })
            return
          }
          sendJson(res, 404, { error: 'unknown api' })
        } catch (err) {
          sendJson(res, 500, { error: String(err && err.message || err) })
        }
      },
    }), 'dsh-gaokao: api route')
  },
}
