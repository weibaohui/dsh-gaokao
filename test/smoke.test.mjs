import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const mod = require(join(root, 'src/index.js'))
const { KnowledgeStore, BUNDLED_DATA_DIR, parseFrontmatter, examInfo } = mod.__test

test('frontmatter 解析：行内数组 / 列表块 / 缺省', () => {
  const a = parseFrontmatter('---\ntags: [力学, 运动学]\nrelated: [牛顿第二定律]\n---\n# 标题\n正文')
  assert.deepEqual(a.meta.tags, ['力学', '运动学'])
  assert.deepEqual(a.meta.related, ['牛顿第二定律'])
  assert.ok(a.body.startsWith('# 标题'))

  const b = parseFrontmatter('---\nrelated:\n  - 甲\n  - 乙\n---\n正文')
  assert.deepEqual(b.meta.related, ['甲', '乙'])

  const c = parseFrontmatter('# 没有头\n正文')
  assert.deepEqual(c.meta, {})
  assert.ok(c.body.startsWith('# 没有头'))
})

test('打包数据集可扫描加载并自动带出学科/年级', () => {
  const store = new KnowledgeStore(BUNDLED_DATA_DIR)
  const n = store.build()
  assert.ok(n >= 15, `种子知识卡应 ≥ 15，实际 ${n}`)
  const c = store.byId('物理/精要/牛顿第一定律')
  assert.ok(c, '按默认 id（相对路径）应能取到卡')
  assert.equal(c.subject, '物理')
  assert.equal(c.grade, '精要')
  assert.equal(c.title, '牛顿第一定律')
  assert.ok(c.summary.length > 0)
})

test('关联解析：frontmatter related 与正文 [[wikilink]] 都解析成真实卡片', () => {
  const store = new KnowledgeStore(BUNDLED_DATA_DIR)
  store.build()
  const c = store.byId('物理/精要/牛顿第一定律')
  const ids = c.related.map((r) => r.id)
  assert.ok(ids.includes('物理/精要/牛顿第二定律'), `related 应含牛顿第二定律，实际 ${ids}`)
  // 正文里的 [[牛顿第二定律]] 也计入了，去重后不应重复
  assert.equal(ids.filter((x) => x === '物理/精要/牛顿第二定律').length, 1)
  // 引用不存在的卡进入 relatedMissing
  const missing = store.cards.find((x) => x.id === '语文/精要/劝学')
  assert.ok(missing.related.some((r) => r.id === '语文/精要/师说'), '劝学应关联师说')
})

test('随机抽取：学科过滤 + 重点学科集合 + 排除', () => {
  const store = new KnowledgeStore(BUNDLED_DATA_DIR)
  store.build()
  for (let i = 0; i < 20; i++) {
    const c = store.draw({ subject: '数学' })
    assert.equal(c.subject, '数学')
  }
  const set = new Set(['物理', '化学'])
  for (let i = 0; i < 30; i++) {
    const c = store.draw({ subjects: set })
    assert.ok(set.has(c.subject), `重点学科过滤后只应出物理/化学，实际 ${c.subject}`)
  }
  const one = store.draw({ subject: '物理' })
  const another = store.draw({ subject: '物理', exclude: [one.id] })
  assert.notEqual(another.id, one.id)
})

test('高考倒计时：默认指向 6 月 7 日，自定义日期生效', () => {
  const auto = examInfo({})
  assert.ok(/^\d{4}-06-07$/.test(auto.examDate), `默认高考日应为 6 月 7 日，实际 ${auto.examDate}`)
  assert.ok(auto.daysLeft >= 0 && auto.daysLeft <= 366)
  const custom = examInfo({ examDate: '2027-06-07' })
  assert.equal(custom.examDate, '2027-06-07')
})

test('status 概况包含学科统计与考试信息', () => {
  const store = new KnowledgeStore(BUNDLED_DATA_DIR)
  store.build()
  const st = store.status({})
  assert.ok(st.subjects['物理'] >= 3)
  assert.ok(st.exam.examDate)
})

test('会话事件流入 feed 且可增量拉取', () => {
  assert.equal(mod.name, 'dsh-gaokao')
  const routes = []
  const handlers = {}
  const ctx = {
    logger: { info: () => {}, warn: () => {} },
    effect(fn) { const d = fn(); if (typeof d === 'function') handlers.dispose = d },
    on(ev, fn) { handlers[ev] = fn; return () => { delete handlers[ev] } },
    webServer: { register: (r) => routes.push(r) },
  }
  mod.apply(ctx, {})
  const session = { id: 's1' }
  handlers['session/event'](session, { type: 'user/message', data: { source: { kind: 'user' }, content: 'hi' } })
  handlers['session/event'](session, { type: 'tool/result', data: { name: 'Bash', message: { isError: true } } })
  handlers['session/event'](session, { type: 'turn/end', data: {} })
  const route = routes[0]
  const req = { method: 'GET', url: '/dsh-gaokao/api/feed?after=0', on: () => {} }
  return new Promise((resolve) => {
    const res = {
      writeHead() {}, end(body) {
        const { events } = JSON.parse(body)
        assert.deepEqual(events.map((e) => e.kind), ['user_msg', 'tool_error', 'turn_end'])
        resolve()
      },
    }
    route.handler(req, res)
  })
})
