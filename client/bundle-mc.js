/* Generated from client/index.js by scripts/build-client.mjs — do not edit by hand.
 * Regenerate with: npm run build:client
 */
window.__ModuleLoader__.load({
  id: "@weibaohui/dsh-gaokao",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
    var React = require("react")
    'use strict'

    /**
     * dsh-gaokao — Client half
     *
     * 梦回高三：桌面右下角一块可拖拽的小黑板，粉笔字写着"距离高考还有 N 天"。
     * 点黑板翻开练习本知识卡，随机展示一张 Markdown 知识点卡。
     *  - 🎲 随机 / ⏮ 上一个 / ⏭ 下一个（历史前进后退，到顶再抽新卡）
     *  - ❤ 收藏（⭐ 收藏夹）/ 📥 加入复习（📖 复习清单，掌握后移出）
     *  - 正文 [[wikilink]] 与底部"关联知识点" chips 都可点击跳转
     *  - ⚙ 重点学习学科勾选（只随机选中学科）+ 自定义高考日期
     *  - 会话事件联动：回合结束/工具报错时黑板一震，自动浮现知识点
     */

    const STYLE = `
    @keyframes gk-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px) rotate(-2deg)}45%{transform:translateX(4px) rotate(1.5deg)}70%{transform:translateX(-3px)}100%{transform:translateX(0)}}
    @keyframes gk-pop{0%{transform:scale(.96) translateY(6px);opacity:0}100%{transform:scale(1) translateY(0);opacity:1}}
    .gk-root{position:fixed;right:172px;bottom:262px;z-index:1200;
      font:13px/1.75 "Kaiti SC","STKaiti","KaiTi","FangSong","Songti SC","SimSun",serif;user-select:none}
    /* ── 小黑板（整体大小由设置里的缩放滑杆控制，transform 等比缩放） ── */
    .gk-stage{cursor:grab;filter:drop-shadow(0 4px 10px rgba(0,0,0,.35));transform-origin:bottom right}
    .gk-stage:active{cursor:grabbing}
    .gk-root.gk-shake .gk-stage{animation:gk-shake .6s ease}
    .gk-board{position:relative;width:168px;height:112px;box-sizing:border-box;border-radius:6px;
      border:6px solid #7d5a36;border-bottom-width:8px;
      background:#26423a;
      box-shadow:inset 0 0 18px rgba(0,0,0,.4);
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:6px 4px 14px}
    .gk-bline{color:#e8e4d5;letter-spacing:4px;font-size:12.5px;opacity:.9}
    .gk-bnum{color:#faf8f0;font-size:37px;font-weight:700;line-height:1.05;letter-spacing:1px}
    .gk-bnum.gk-bnum-red{color:#e88d7c}
    .gk-bsub{color:#d8c07a;font-size:11.5px;letter-spacing:3px;opacity:.9}
    .gk-tray{position:absolute;left:6px;right:6px;bottom:-8px;height:8px;border-radius:0 0 4px 4px;
      background:#6b4a28;display:flex;align-items:center;gap:6px;padding:0 10px}
    .gk-chalk{width:22px;height:4px;border-radius:2px;background:#f0ede2}
    .gk-eraser{margin-left:auto;width:24px;height:7px;border-radius:2px;background:#4a5563;
      border-top:2px solid #b8b0a2}
    /* ── 知识卡：练习本（横线纸 + 红栏线，右下角拖角调大小） ── */
    .gk-card{position:absolute;right:-6px;bottom:calc(100% + 18px);width:392px;height:520px;resize:both;box-sizing:border-box;
      min-width:320px;min-height:340px;max-width:min(94vw,960px);max-height:88vh;
      display:flex;flex-direction:column;overflow:hidden;color:#2c3a4a;border-radius:5px;color-scheme:light;
      background:repeating-linear-gradient(#fdfcf7 0 27px,#dbe7f3 27px 28px);
      border:1px solid #b9c4d2;box-shadow:0 14px 44px rgba(0,0,0,.5);
      animation:gk-pop .22s ease}
    .gk-card.gk-align-left{right:auto;left:-6px}
    .gk-card.gk-below{bottom:auto;top:calc(100% + 18px)}
    .gk-card::before{content:"";position:absolute;top:0;bottom:0;left:34px;width:1.5px;background:rgba(226,110,100,.45);pointer-events:none}
    /* 顶部 */
    .gk-head{display:flex;align-items:center;gap:9px;padding:12px 14px 8px 44px;flex-shrink:0;
      background:linear-gradient(#fdfcf7,rgba(253,252,247,0))}
    .gk-chip{flex-shrink:0;font-size:11px;border-radius:4px;padding:2px 8px;color:#fff;letter-spacing:2px;
      box-shadow:0 1px 3px rgba(0,0,0,.25)}
    .gk-grade{flex-shrink:0;font-size:11px;color:#7a8aa0;border:1px solid #c3cdd9;border-radius:9px;padding:1px 8px;letter-spacing:1px}
    .gk-htext{flex:1;min-width:0}
    .gk-title{font-size:18.5px;font-weight:700;color:#24313f;letter-spacing:1px;
      white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gk-sub{font-size:11px;color:#8b98a9;letter-spacing:.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gk-days{flex-shrink:0;text-align:center;font-size:10.5px;color:#b3563e;border:1px dashed rgba(179,86,62,.5);
      border-radius:6px;padding:3px 7px;line-height:1.4;background:rgba(253,252,247,.8)}
    .gk-days b{font-size:15px}
    .gk-close{flex-shrink:0;width:24px;height:24px;border:none;background:transparent;color:#9aa7b6;font-size:15px;cursor:pointer;border-radius:6px}
    .gk-close:hover{background:rgba(179,86,62,.1);color:#b3563e}
    .gk-origin{display:flex;align-items:center;gap:6px;padding:2px 16px 0 44px;font-size:11px;color:#b3563e;letter-spacing:1.5px;flex-shrink:0}
    .gk-origin::before{content:"✎";font-size:12px}
    /* 正文 */
    .gk-body{flex:1;min-height:0;overflow-y:auto;padding:6px 20px 10px 46px;scrollbar-width:thin;scrollbar-color:#b9c4d2 transparent;
      font-size:13.5px;line-height:28px}
    .gk-body h1,.gk-body h2,.gk-body h3,.gk-body h4{margin:10px 0 2px;line-height:28px;color:#1f3a5f;letter-spacing:1px}
    .gk-body h1{font-size:17px;border-bottom:2px solid #7fa3c8;padding-bottom:2px}
    .gk-body h2{font-size:15.5px;border-bottom:1px dashed #a9bdcf;padding-bottom:2px}
    .gk-body h3{font-size:14px;color:#2d5a8a}
    .gk-body h4{font-size:13.5px;color:#3c6b9c}
    .gk-body p{margin:0}
    .gk-body ul,.gk-body ol{margin:0;padding-left:22px}
    .gk-body code{background:rgba(63,110,160,.1);border:1px solid rgba(63,110,160,.18);border-radius:4px;
      padding:0 5px;font:12.5px/1.6 "SF Mono",Menlo,Consolas,monospace;color:#2d5a8a}
    .gk-body pre{background:#2b3a33;color:#e8f0e4;border-radius:6px;padding:8px 12px;overflow-x:auto;
      font:12.5px/1.7 "SF Mono",Menlo,Consolas,monospace}
    .gk-body pre code{background:none;border:none;color:inherit;padding:0}
    .gk-body blockquote{margin:2px 0;padding:2px 12px;border-left:3px solid #e0b64f;color:#6b5a2e;background:rgba(224,182,79,.08)}
    .gk-body hr{border:none;border-top:1px dashed #a9bdcf;margin:8px 0}
    .gk-body b,.gk-body strong{color:#b3563e}
    .gk-wiki{color:#2d6fd2;cursor:pointer;border-bottom:1px dashed rgba(45,111,210,.55);padding:0 1px}
    .gk-wiki:hover{background:rgba(45,111,210,.12)}
    .gk-wiki.gk-wiki-miss{color:#a3aebc;border-bottom-color:rgba(163,174,188,.5);cursor:default;text-decoration:line-through}
    /* 关联知识点 chips */
    .gk-rel{padding:4px 20px 8px 46px;flex-shrink:0;border-top:1px dashed #c3cdd9;background:rgba(242,246,251,.96)}
    .gk-rel-t{font-size:11px;color:#7a8aa0;letter-spacing:2px;margin-bottom:4px}
    .gk-relrow{display:flex;flex-wrap:wrap;gap:5px;max-height:64px;overflow-y:auto;scrollbar-width:thin}
    .gk-relchip{font-size:11.5px;color:#2d5a8a;background:#fff;border:1px solid #b8cbe0;border-radius:10px;
      padding:1px 9px;cursor:pointer;font-family:inherit;letter-spacing:.5px}
    .gk-relchip:hover{background:#2d5a8a;color:#fff}
    .gk-relchip .gk-rs{color:#8b98a9;font-size:10px;margin-right:3px}
    .gk-relchip:hover .gk-rs{color:#cfe0f2}
    /* 底部工具栏 */
    .gk-foot{display:flex;align-items:center;gap:3px;padding:7px 10px;border-top:1px solid #c3cdd9;
      background:rgba(233,238,245,.75);flex-shrink:0}
    .gk-foot .gk-spacer{flex:1}
    .gk-btn{border:1px solid transparent;background:transparent;color:#4a5b70;font-size:14px;cursor:pointer;border-radius:8px;
      padding:4px 7px;line-height:1;font-family:inherit}
    .gk-btn:hover{background:rgba(45,90,138,.1)}
    .gk-btn.gk-on{color:#b3563e}
    .gk-chipx{border:1px solid #b9c4d2;background:transparent;color:#5a6b80;font-size:10.5px;border-radius:9px;padding:2px 7px;
      cursor:pointer;font-family:inherit;letter-spacing:1px}
    .gk-chipx.gk-on{background:#2d5a8a;border-color:#2d5a8a;color:#fff}
    /* 列表面板（收藏夹/复习清单/设置） */
    .gk-panel{flex:1;min-height:0;overflow-y:auto;padding:4px 14px 10px 44px;scrollbar-width:thin;scrollbar-color:#b9c4d2 transparent}
    .gk-row{display:flex;align-items:center;gap:8px;padding:6px 4px;border-bottom:1px dashed #c9d4e0;cursor:pointer}
    .gk-row:hover{background:rgba(45,90,138,.06)}
    .gk-row .gk-rk{flex-shrink:0;font-size:10px;color:#fff;border-radius:4px;padding:1px 6px;letter-spacing:1px}
    .gk-row .gk-rt{flex:1;font-size:13.5px;color:#2c3a4a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .gk-row .gk-rg{flex-shrink:0;font-size:10.5px;color:#96a3b3}
    .gk-row .gk-rd{flex-shrink:0;color:#b3bdc9;font-size:11px}
    .gk-row .gk-rd:hover{color:#b3563e}
    .gk-empty{text-align:center;color:#96a3b3;font-size:12.5px;padding:26px 0}
    .gk-setbar{display:flex;align-items:center;gap:8px;padding:4px 0 8px;border-bottom:1px dashed #c9d4e0}
    .gk-sethint{flex:1;font-size:10.5px;color:#96a3b3;letter-spacing:1px;text-align:right}
    .gk-setrow{display:flex;align-items:center;gap:9px;padding:7px 2px;border-bottom:1px dashed #dde5ee;cursor:pointer;font-size:13.5px;color:#2c3a4a}
    .gk-setrow:hover{background:rgba(45,90,138,.05)}
    .gk-setrow input{accent-color:#2d5a8a;cursor:pointer}
    .gk-setk{flex:1;letter-spacing:1px}
    .gk-setc{font-size:11px;color:#96a3b3}
    .gk-setdate{display:flex;align-items:center;gap:8px;padding:9px 2px;font-size:12.5px;color:#4a5b70;flex-wrap:nowrap}
    .gk-setdate span:first-child{white-space:nowrap;letter-spacing:1px}
    .gk-setdate input{flex:1;min-width:0;font:12px/1.4 inherit;padding:3px 7px;border:1px solid #b9c4d2;border-radius:6px;color:#2c3a4a;background:#fff}
    `

    /** 学科配色（低饱和素色） */
    const SUBJECT_COLORS = {
      语文: '#9e5b4c', 数学: '#3f6391', 英语: '#6d5b96', 物理: '#44808e',
      化学: '#4d8759', 生物: '#7c8f49', 历史: '#83704c', 地理: '#4c7d63', 政治: '#96616f',
    }
    const subjectColor = (s) => SUBJECT_COLORS[s] || '#5d6b7d'

    const LS_FAVS = 'gk-favs'
    const LS_REVIEW = 'gk-review'
    const LS_RECENT = 'gk-recent'
    const LS_HIST = 'gk-hist'
    const LS_AUTO = 'gk-auto'
    const LS_SIZE = 'gk-size'
    const LS_SUBJECTS = 'gk-subjects'
    const LS_EXAM = 'gk-exam-date'
    const LS_ZOOM = 'gk-zoom'

    function ensureStyle() {
      const id = 'dsh-gaokao-style-v3'
      if (!document.getElementById(id)) {
        document.querySelectorAll('style[id^="dsh-gaokao-style"]').forEach((n) => n.remove())
        const tag = document.createElement('style')
        tag.id = id
        tag.textContent = STYLE
        document.head.appendChild(tag)
      }
    }

    /** 会话事件 → 弹出缘起语 */
    const ORIGINS = {
      turn_end: '讲完这题，抽背一个知识点——',
      tool_error: '卡壳了？翻翻课本压压惊——',
      turn_abort: '课间十分钟，来一题——',
      user_msg: '老师提问时间到——',
    }

    const lsGet = (k, dft) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? dft } catch { return dft } }
    const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }

    const recentStore = {
      list() { return lsGet(LS_RECENT, []) },
      push(id) {
        const list = this.list().filter((x) => x !== id)
        list.unshift(id)
        lsSet(LS_RECENT, list.slice(0, 12))
      },
    }

    /** 简易 Markdown 渲染：标题/列表/引用/代码块/分割线/粗体/行内码/[[wikilink]] */
    function renderMd(src, wikiLink) {
      const React = require('react')
      const lines = String(src || '').split(/\r?\n/)
      const out = []
      let i = 0
      let key = 0

      const inline = (text) => {
        const parts = []
        const re = /(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]]+\]\])/g
        let last = 0
        let m
        let k = 0
        while ((m = re.exec(text))) {
          if (m.index > last) parts.push(text.slice(last, m.index))
          const tok = m[0]
          if (tok.startsWith('**')) {
            parts.push(React.createElement('b', { key: `b${k++}` }, tok.slice(2, -2)))
          } else if (tok.startsWith('`')) {
            parts.push(React.createElement('code', { key: `c${k++}` }, tok.slice(1, -1)))
          } else {
            const inner = tok.slice(2, -2)
            const [target, label] = inner.split('|').map((s) => s.trim())
            const hit = wikiLink && wikiLink(target)
            parts.push(React.createElement('span', {
              key: `w${k++}`,
              className: 'gk-wiki' + (hit ? '' : ' gk-wiki-miss'),
              title: hit ? `翻到：${hit.title}` : '知识库里还没有这张卡',
              onClick: hit ? (ev) => { ev.stopPropagation(); hit.open() } : undefined,
            }, label || target))
          }
          last = m.index + tok.length
        }
        if (last < text.length) parts.push(text.slice(last))
        return parts
      }

      while (i < lines.length) {
        const line = lines[i]
        const t = line.trim()
        if (!t) { i++; continue }
        if (t === '---' || t === '***') { out.push(React.createElement('hr', { key: key++ })); i++; continue }
        const fence = t.match(/^```(\w*)/)
        if (fence) {
          const buf = []
          i++
          while (i < lines.length && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++ }
          i++
          out.push(React.createElement('pre', { key: key++ }, React.createElement('code', null, buf.join('\n'))))
          continue
        }
        const h = t.match(/^(#{1,4})\s+(.+)$/)
        if (h) {
          const lvl = h[1].length
          out.push(React.createElement(`h${lvl}`, { key: key++ }, inline(h[2])))
          i++
          continue
        }
        if (t.startsWith('> ')) {
          const buf = []
          while (i < lines.length && lines[i].trim().startsWith('> ')) { buf.push(lines[i].trim().slice(2)); i++ }
          out.push(React.createElement('blockquote', { key: key++ }, buf.map((b, j) => React.createElement('p', { key: j }, inline(b)))))
          continue
        }
        if (/^[-*]\s+/.test(t)) {
          const items = []
          while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s+/, '')); i++ }
          out.push(React.createElement('ul', { key: key++ }, items.map((it, j) => React.createElement('li', { key: j }, inline(it)))))
          continue
        }
        if (/^\d+[.、]\s*/.test(t)) {
          const items = []
          while (i < lines.length && /^\d+[.、]\s*/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+[.、]\s*/, '')); i++ }
          out.push(React.createElement('ol', { key: key++ }, items.map((it, j) => React.createElement('li', { key: j }, inline(it)))))
          continue
        }
        // 普通段落：合并连续非特殊行
        const buf = [line]
        i++
        while (i < lines.length) {
          const nt = lines[i].trim()
          if (!nt || nt.startsWith('#') || nt.startsWith('> ') || /^[-*]\s+/.test(nt) || /^\d+[.、]\s*/.test(nt) || nt.startsWith('```') || nt === '---') break
          buf.push(lines[i])
          i++
        }
        out.push(React.createElement('p', { key: key++ }, inline(buf.join(' '))))
      }
      return out
    }

    /** 正文开头的一级标题若与卡名重复则剥掉（卡头已经显示了） */
    function stripOwnTitle(body, title) {
      const lines = String(body || '').split(/\r?\n/)
      for (let i = 0; i < lines.length; i++) {
        const t = lines[i].trim()
        if (!t) continue
        const m = t.match(/^#\s+(.+?)\s*$/)
        if (m && title && m[1].replace(/[*`]/g, '').trim() === title.trim()) {
          lines.splice(i, 1)
          return lines.join('\n')
        }
        break
      }
      return body
    }

    module.exports = {
      inject: ['slots'],

      apply(ctx) {
        const slots = ctx.get('slots')
        if (slots === undefined) return
        ensureStyle()
        const React = require('react')
        const { useState, useEffect, useCallback } = React

        const api = (p) => fetch(`/dsh-gaokao/api/${p}`).then((r) => r.json())

        /** 倒计时：本地按 examDate 每日自算（设置里可自定义日期） */
        const daysFrom = (examDate) => {
          if (!examDate) return null
          const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(examDate)
          if (!m) return null
          const exam = new Date(+m[1], +m[2] - 1, +m[3])
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          return Math.max(0, Math.round((exam - today) / 86400000))
        }

        function App() {
          const [open, setOpen] = useState(false)
          const [card, setCard] = useState(null)
          const [loved, setLoved] = useState(false)
          const [inReview, setInReview] = useState(false)
          const [favs, setFavs] = useState(() => lsGet(LS_FAVS, []))
          const [review, setReview] = useState(() => lsGet(LS_REVIEW, []))
          const [panel, setPanel] = useState('body')          // body | favs | review | settings
          const [auto, setAuto] = useState(() => localStorage.getItem(LS_AUTO) !== 'off')
          const [size, setSize] = useState(() => {
            const s = lsGet(LS_SIZE, {})
            return {
              w: Math.min(960, Math.max(320, Number(s.w) || 392)),
              h: Math.min(840, Math.max(340, Number(s.h) || 520)),
            }
          })
          const [subjects, setSubjects] = useState(() => lsGet(LS_SUBJECTS, null))  // null=全部
          const [subjectStats, setSubjectStats] = useState([])  // [[subject, count], ...]
          const [examDate, setExamDate] = useState(null)        // 服务端给定的高考日
          const [customExam, setCustomExam] = useState(() => localStorage.getItem(LS_EXAM) || '')
          const [zoom, setZoom] = useState(() => {
            const v = Number(localStorage.getItem(LS_ZOOM))
            return Number.isFinite(v) && v >= 0.6 && v <= 1.5 ? v : 0.8   // 默认比原始小两号
          })
          const [days, setDays] = useState(null)
          const [origin, setOrigin] = useState(null)
          const [fx, setFx] = useState('')
          const [pos, setPos] = useState(undefined)
          const [below, setBelow] = useState(false)
          const [alignLeft, setAlignLeft] = useState(false)
          const [cardMaxH, setCardMaxH] = useState(0)   // 0 = 不限制
          const [hist, setHist] = useState(() => lsGet(LS_HIST, { ids: [], i: -1 }))
          const lastFeedId = React.useRef(0)
          const lastAutoAt = React.useRef(0)
          const autoRef = React.useRef(auto)
          autoRef.current = auto
          const subjectsRef = React.useRef(subjects)
          subjectsRef.current = subjects
          const stageRef = React.useRef(undefined)
          const cardRef = React.useRef(undefined)
          const drag = React.useRef(undefined)
          const fxTimer = React.useRef(0)

          const shake = () => {
            setFx('gk-shake')
            if (fxTimer.current) clearTimeout(fxTimer.current)
            fxTimer.current = setTimeout(() => setFx(''), 640)
          }

          const queryFor = () => {
            const p = new URLSearchParams()
            if (subjectsRef.current && subjectsRef.current.length) p.set('subjects', subjectsRef.current.join(','))
            return p
          }

          // 本地卡池：批量拉取，随机/事件都从这里出卡
          const poolRef = React.useRef([])
          const refreshBundle = useCallback(async () => {
            try {
              const p = queryFor()
              p.set('n', '30')
              p.set('exclude', recentStore.list().join(','))
              const r = await api(`bundle?${p}`)
              if (r && r.cards && r.cards.length) {
                poolRef.current = r.cards
                return true
              }
            } catch {}
            return false
          }, [])

          /** 展示一张卡并压入历史（历史截断到当前位再压，保证 ⏭ 语义） */
          const showCard = useCallback((c, pushHist = true) => {
            setCard(c)
            recentStore.push(c.id)
            if (pushHist) {
              setHist((h) => {
                const ids = h.ids.slice(0, h.i + 1)
                if (ids[ids.length - 1] !== c.id) ids.push(c.id)
                const next = { ids: ids.slice(-200), i: Math.min(ids.length, 200) - 1 }
                lsSet(LS_HIST, next)
                return next
              })
            }
          }, [])

          const draw = useCallback(async () => {
            if (!poolRef.current.length) await refreshBundle()
            const c = poolRef.current.shift()
            if (c) { showCard(c); return }
            try {
              const p = queryFor()
              p.set('exclude', recentStore.list().join(','))
              const r = await api(`draw?${p}`)
              if (r && r.card) showCard(r.card)
            } catch {}
          }, [refreshBundle, showCard])

          const openById = useCallback(async (id, pushHist = true) => {
            // 池里先找，找不到再走 API（池里卡片字段完整，省一次请求）
            const pooled = poolRef.current.find((c) => c.id === id)
            if (pooled) { showCard(pooled, pushHist); return }
            try {
              const r = await api(`card?id=${encodeURIComponent(id)}`)
              if (r && r.card) showCard(r.card, pushHist)
            } catch {}
          }, [showCard])

          // 上一个 / 下一个：沿浏览历史走；下一个到顶 = 再抽一张新卡
          const goPrev = useCallback(() => {
            setHist((h) => {
              if (h.i <= 0) return h
              const next = { ...h, i: h.i - 1 }
              lsSet(LS_HIST, next)
              openById(next.ids[next.i], false)
              return next
            })
          }, [openById])
          const goNext = useCallback(() => {
            setHist((h) => {
              if (h.i >= h.ids.length - 1) {
                draw()
                return h
              }
              const next = { ...h, i: h.i + 1 }
              lsSet(LS_HIST, next)
              openById(next.ids[next.i], false)
              return next
            })
          }, [draw, openById])

          // 启动：学科统计 + 高考日
          useEffect(() => {
            api('status').then((r) => {
              setSubjectStats(Object.entries(r.subjects || {}).sort((a, b) => b[1] - a[1]))
              if (r.exam && r.exam.examDate) setExamDate(r.exam.examDate)
            }).catch(() => {})
          }, [])

          // 倒计时：优先自定义日期，其次服务端；每日自算 + 整点校时
          useEffect(() => {
            const compute = () => setDays(daysFrom(customExam || examDate))
            compute()
            const iv = setInterval(compute, 1800000)
            return () => clearInterval(iv)
          }, [customExam, examDate])

          useEffect(() => { if (open && !card) draw() }, [open])

          // ── 事件联动：仅在联动开启且页面可见时轮询（30s 一轮），关闭零请求 ──
          useEffect(() => {
            if (!auto) return
            let alive = true
            const react = (ev) => {
              let why = null
              if (ev.kind === 'turn_end' || ev.kind === 'tool_error' || ev.kind === 'turn_abort') why = ev.kind
              else if (ev.kind === 'user_msg' && Math.random() < 0.25) why = ev.kind
              if (!why) return
              const now = Date.now()
              if (now - lastAutoAt.current < 90000) return
              lastAutoAt.current = now
              shake()
              setOrigin(why)
              setPanel('body')
              setOpen(true)
              draw()
            }
            const tick = () => {
              if (document.hidden) return
              api(`feed?after=${lastFeedId.current}`).then((r) => {
                for (const ev of r.events || []) {
                  lastFeedId.current = Math.max(lastFeedId.current, ev.id)
                  if (ev.kind === 'turn_start') refreshBundle()
                  react(ev)
                }
              }).catch(() => {})
            }
            // 开启时先对齐水位（只进位不反应），避免积压事件连发
            api('feed?after=0').then((r) => {
              if (!alive) return
              for (const ev of r.events || []) lastFeedId.current = Math.max(lastFeedId.current, ev.id)
            }).catch(() => {})
            const iv = setInterval(tick, 30000)
            // 回到前台只补水位，不对离线期间的旧事件弹卡
            const onVis = () => {
              if (document.hidden) return
              api(`feed?after=${lastFeedId.current}`).then((r) => {
                for (const ev of r.events || []) lastFeedId.current = Math.max(lastFeedId.current, ev.id)
              }).catch(() => {})
            }
            document.addEventListener('visibilitychange', onVis)
            return () => { alive = false; clearInterval(iv); document.removeEventListener('visibilitychange', onVis) }
          }, [auto, draw, refreshBundle])

          // 卡池预热与定时补充（手动抽卡也吃这个池子）
          useEffect(() => {
            refreshBundle()
            const bv = setInterval(() => refreshBundle(), 300000)
            return () => clearInterval(bv)
          }, [refreshBundle])

          // 自动浮现的卡：16 秒无操作自动收起
          useEffect(() => {
            if (!open || !origin) return
            const t = setTimeout(() => setOpen(false), 16000)
            return () => clearTimeout(t)
          }, [open, origin, card])

          // 卡片尺寸记忆
          useEffect(() => {
            if (!open || !cardRef.current) return
            const el = cardRef.current
            let lastSave = 0
            const ro = new ResizeObserver(() => {
              const w = el.offsetWidth
              const h = el.offsetHeight
              setSize((s) => (s.w === w && s.h === h ? s : { w, h }))
              const now = Date.now()
              if (now - lastSave > 300) {
                lastSave = now
                lsSet(LS_SIZE, { w, h })
              }
            })
            ro.observe(el)
            return () => ro.disconnect()
          }, [open])

          // 卡片展开方向随黑板位置自适应（哪边空间大往哪边开，边缘避让）
          useEffect(() => {
            if (!open || !stageRef.current) return
            const r = stageRef.current.getBoundingClientRect()
            const vh = window.innerHeight || 800
            const goBelow = (vh - r.bottom) > r.top
            setBelow(goBelow)
            const avail = (goBelow ? vh - r.bottom : r.top) - 26
            setCardMaxH(Math.max(340, Math.min(840, avail)))
            setAlignLeft(r.left < 430)
          }, [open, pos])

          const manualTouch = () => { setOrigin(null) }

          useEffect(() => {
            setLoved(!!card && favs.some((f) => f.id === card.id))
            setInReview(!!card && review.some((f) => f.id === card.id))
          }, [card, favs, review])

          const snap = (c) => ({ id: c.id, title: c.title, subject: c.subject, grade: c.grade, summary: c.summary })

          const toggleFav = () => {
            if (!card) return
            setFavs((prev) => {
              const has = prev.some((f) => f.id === card.id)
              const next = has ? prev.filter((f) => f.id !== card.id) : [snap(card), ...prev]
              lsSet(LS_FAVS, next)
              return next
            })
          }

          const toggleReview = () => {
            if (!card) return
            setReview((prev) => {
              const has = prev.some((f) => f.id === card.id)
              const next = has ? prev.filter((f) => f.id !== card.id) : [snap(card), ...prev]
              lsSet(LS_REVIEW, next)
              return next
            })
          }

          /** 正文 [[wikilink]] 命中检测：当前卡 related 已解析 + 让宿主按标题找 */
          const wikiLink = useCallback((target) => {
            if (!card) return null
            const hit = (card.related || []).find((r) => r.title === target || r.id === target || r.id.endsWith('/' + target))
            if (!hit) return null
            return { title: hit.title, open: () => { manualTouch(); setPanel('body'); openById(hit.id) } }
          }, [card, openById])

          // 重点学科勾选：空选 = 全部
          const pickSubject = (s) => {
            const all = subjectStats.map(([k]) => k)
            const cur = subjectsRef.current || all
            const next0 = cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]
            const next = next0.length ? next0 : null
            subjectsRef.current = next
            setSubjects(next)
            lsSet(LS_SUBJECTS, next || [])
            poolRef.current = []
            refreshBundle()
          }
          const allSubjects = () => {
            subjectsRef.current = null
            setSubjects(null)
            lsSet(LS_SUBJECTS, [])
            poolRef.current = []
            refreshBundle()
          }

          const listPanel = (list, storeKey, setList, emptyText) => React.createElement('div', { className: 'gk-panel' },
            list.length === 0 && React.createElement('div', { className: 'gk-empty' }, emptyText),
            list.map((f) => React.createElement('div', {
              key: f.id, className: 'gk-row',
              onClick: () => { manualTouch(); setPanel('body'); openById(f.id) },
              title: f.summary || '',
            },
              React.createElement('span', { className: 'gk-rk', style: { background: subjectColor(f.subject) } }, f.subject || '卡'),
              React.createElement('span', { className: 'gk-rt' }, f.title),
              React.createElement('span', { className: 'gk-rg' }, f.grade || ''),
              React.createElement('span', {
                className: 'gk-rd', title: '移出',
                onClick: (ev) => {
                  ev.stopPropagation()
                  const next = list.filter((x) => x.id !== f.id)
                  lsSet(storeKey, next)
                  setList(next)
                },
              }, '✖'))))

          // ── 黑板拖拽（拖动后松手不算点击）──
          const onDown = (e) => {
            if (e.button !== 0) return
            const box = stageRef.current.getBoundingClientRect()
            drag.current = { dx: e.clientX - box.left, dy: e.clientY - box.top, sx: e.clientX, sy: e.clientY, moved: false }
          }
          useEffect(() => {
            const move = (e) => {
              if (!drag.current) return
              // 4px 阈值：手抖/光标归位产生的微移不算拖拽
              if (!drag.current.moved) {
                const d = drag.current
                if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) <= 4) return
                d.moved = true
              }
              setPos({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy })
            }
            const up = () => {
              const d = drag.current
              drag.current = undefined
              if (d && !d.moved) {
                shake()
                setOrigin(null)
                setOpen((v) => !v)
              }
            }
            window.addEventListener('mousemove', move)
            window.addEventListener('mouseup', up)
            return () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
          }, [])

          const related = (card && card.related) || []
          const cardCls = 'gk-card' + (below ? ' gk-below' : '') + (alignLeft ? ' gk-align-left' : '')
          const daysText = days === null ? '—' : String(days)

          return React.createElement('div', {
            className: 'gk-root' + (fx ? ' ' + fx : ''),
            style: pos ? { right: 'auto', bottom: 'auto', left: pos.x, top: pos.y } : undefined,
          },
            open && React.createElement('div', {
              ref: cardRef,
              className: cardCls,
              style: { width: size.w, height: size.h, maxHeight: cardMaxH || undefined },
              onMouseDown: manualTouch,
            },
              React.createElement('div', { className: 'gk-head' },
                React.createElement('span', {
                  className: 'gk-chip',
                  style: { background: subjectColor(card && card.subject) },
                }, card ? card.subject : '课本'),
                React.createElement('span', { className: 'gk-grade' }, card ? card.grade : '高中'),
                React.createElement('div', { className: 'gk-htext' },
                  React.createElement('div', { className: 'gk-title' }, card ? card.title : '梦回高三'),
                  React.createElement('div', { className: 'gk-sub' },
                    card ? [card.summary].filter(Boolean).join('') : '翻开课本，全是重点')),
                React.createElement('div', { className: 'gk-days', title: examDate ? `高考日：${customExam || examDate}` : '' },
                  React.createElement('div', null, '距高考'),
                  React.createElement('b', null, daysText), '天'),
                React.createElement('button', {
                  className: 'gk-close', title: '收起',
                  onClick: () => { setPanel('body'); setOpen(false) },
                }, '✕')),
              origin && React.createElement('div', { className: 'gk-origin' }, ORIGINS[origin] || '缘起'),
              panel === 'favs'
                ? listPanel(favs, LS_FAVS, setFavs, '还没有收藏，遇到重要的知识点点个 ❤ 吧')
                : panel === 'review'
                  ? listPanel(review, LS_REVIEW, setReview, '复习清单是空的：看卡时点 📥 加入复习，掌握了再移出')
                  : panel === 'settings'
                    ? React.createElement('div', { className: 'gk-panel' },
                        React.createElement('div', { className: 'gk-setbar' },
                          React.createElement('button', {
                            className: 'gk-chipx' + (!subjects ? ' gk-on' : ''), onClick: allSubjects,
                          }, '全选'),
                          React.createElement('span', { className: 'gk-sethint' },
                            (!subjects || !subjects.length)
                              ? '未勾选 = 全部学科参与随机'
                              : `重点学科：${subjects.length} / ${subjectStats.length}`)),
                        subjectStats.map(([s, count]) => React.createElement('label', { key: s, className: 'gk-setrow' },
                          React.createElement('input', {
                            type: 'checkbox',
                            checked: !subjects || subjects.includes(s),
                            onChange: () => pickSubject(s),
                          }),
                          React.createElement('span', { className: 'gk-chip', style: { background: subjectColor(s) } }, s),
                          React.createElement('span', { className: 'gk-setk' }),
                          React.createElement('span', { className: 'gk-setc' }, `${count} 张`))),
                        React.createElement('div', { className: 'gk-setdate' },
                          React.createElement('span', null, '黑板大小'),
                          React.createElement('input', {
                            type: 'range', min: 60, max: 150, step: 5,
                            value: Math.round(zoom * 100),
                            style: { accentColor: '#2d5a8a', cursor: 'pointer' },
                            onChange: (e) => {
                              const v = Number(e.target.value) / 100
                              setZoom(v)
                              lsSet(LS_ZOOM, v)
                            },
                          }),
                          React.createElement('span', { className: 'gk-setc' }, `${Math.round(zoom * 100)}%`)),
                        React.createElement('div', { className: 'gk-setdate' },
                          React.createElement('span', null, '高考日期'),
                          React.createElement('input', {
                            type: 'text', placeholder: examDate || 'YYYY-MM-DD', defaultValue: customExam,
                            onBlur: (e) => {
                              const v = e.target.value.trim()
                              const ok = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''
                              setCustomExam(ok)
                              try { ok ? localStorage.setItem(LS_EXAM, ok) : localStorage.removeItem(LS_EXAM) } catch {}
                              e.target.value = ok
                            },
                          }),
                          React.createElement('span', { className: 'gk-setc', style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, '留空=自动取下一届6/7')))
                    : React.createElement(React.Fragment, null,
                        React.createElement('div', { className: 'gk-body' },
                          card
                            ? renderMd(stripOwnTitle(card.body, card.title), wikiLink)
                            : React.createElement('div', { className: 'gk-empty' }, '翻书中……')),
                        related.length > 0 && React.createElement('div', { className: 'gk-rel' },
                          React.createElement('div', { className: 'gk-rel-t' }, '关联知识点'),
                          React.createElement('div', { className: 'gk-relrow' },
                            related.map((r) => React.createElement('button', {
                              key: r.id, className: 'gk-relchip',
                              title: `${r.subject} · ${r.grade}`,
                              onClick: () => { manualTouch(); openById(r.id) },
                            },
                              React.createElement('span', { className: 'gk-rs' }, r.subject),
                              r.title))))),
              React.createElement('div', { className: 'gk-foot' },
                React.createElement('button', {
                  className: 'gk-btn' + (loved ? ' gk-on' : ''),
                  title: loved ? '取消收藏' : '收藏', onClick: () => { setPanel('body'); toggleFav() },
                }, loved ? '❤️' : '🤍'),
                React.createElement('button', { className: 'gk-btn', title: '随机抽一张', onClick: () => { setPanel('body'); draw() } }, '🎲'),
                React.createElement('button', { className: 'gk-btn', title: '上一个（浏览历史）', onClick: goPrev }, '⏮'),
                React.createElement('button', { className: 'gk-btn', title: '下一个（历史到顶则抽新卡）', onClick: goNext }, '⏭'),
                React.createElement('button', {
                  className: 'gk-btn' + (inReview ? ' gk-on' : ''),
                  title: inReview ? '掌握了，移出复习清单' : '没记住？加入复习清单',
                  onClick: () => { setPanel('body'); toggleReview() },
                }, inReview ? '📤' : '📥'),
                React.createElement('button', {
                  className: 'gk-btn', title: '复习清单',
                  onClick: () => setPanel((v) => (v === 'review' ? 'body' : 'review')),
                }, panel === 'review' ? '📖' : `📖${review.length || ''}`),
                React.createElement('button', {
                  className: 'gk-btn', title: '收藏夹',
                  onClick: () => setPanel((v) => (v === 'favs' ? 'body' : 'favs')),
                }, panel === 'favs' ? '📖' : `⭐${favs.length || ''}`),
                React.createElement('button', {
                  className: 'gk-btn', title: auto ? '事件联动：开（AI 干活时自动抽背）' : '事件联动：关',
                  onClick: () => {
                    const next = !auto
                    setAuto(next)
                    try { localStorage.setItem(LS_AUTO, next ? 'on' : 'off') } catch {}
                  },
                }, auto ? '🔔' : '🔕'),
                React.createElement('button', {
                  className: 'gk-btn' + (panel === 'settings' ? ' gk-on' : ''),
                  title: '设置：重点学科 / 高考日期',
                  onClick: () => setPanel((v) => (v === 'settings' ? 'body' : 'settings')),
                }, '⚙'),
                React.createElement('div', { className: 'gk-spacer' }))),
            React.createElement('div', {
              ref: stageRef, className: 'gk-stage',
              title: `距离高考还有 ${daysText} 天（点击翻开知识卡，拖动换位）`,
              style: { transform: `scale(${zoom})` },
              onMouseDown: onDown,
            },
              React.createElement('div', { className: 'gk-board' },
                React.createElement('div', { className: 'gk-bline' }, '距离高考还有'),
                React.createElement('div', { className: 'gk-bnum' + (days !== null && days <= 100 ? ' gk-bnum-red' : '') }, daysText),
                React.createElement('div', { className: 'gk-bsub' }, '天'),
                React.createElement('div', { className: 'gk-tray' },
                  React.createElement('span', { className: 'gk-chalk' }),
                  React.createElement('span', { className: 'gk-eraser' })))),
          )
        }

        slots.inject('sidebar.footer.action', () => slots.register(
          { name: 'sidebar.footer.action', id: '@weibaohui/dsh-gaokao', order: 99 },
          () => React.createElement(App, null)
        ))
      },
    }

    return module.exports
  }
})
