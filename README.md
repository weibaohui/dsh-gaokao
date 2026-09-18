# @weibaohui/dsh-gaokao

> **⚠️ 本项目仅供个人研究学习，不公开发布。** This project is for personal research and study only, not publicly distributed.

[![DSH plugin](https://img.shields.io/badge/dsh-plugin-green)](https://github.com/topics/dsh-plugin)
[![npm version](https://img.shields.io/npm/v/@weibaohui/dsh-gaokao)](https://www.npmjs.com/package/@weibaohui/dsh-gaokao)

**梦回高三**：右下角浮着一块可拖拽的小黑板，粉笔字写着"距离高考还有 N 天"——AI 干活的间隙它自己一震，为你翻开一张练习本知识卡，抽背一个知识点。

![黑板倒计时 · 抽卡背知识点 · 关联跳转 · 重点学科](docs/demo.gif)

## 事件联动

知识卡通过会话事件流感知你在做什么，在恰好的时机递上一张：

| 会话事件 | 弹卡缘起 |
|---|---|
| 回合结束 | 【讲完这题，抽背一个知识点——】 |
| 工具报错 | 【卡壳了？翻翻课本压压惊——】 |
| 回合中止 | 【课间十分钟，来一题——】 |
| 道友提问 | （25% 概率）【老师提问时间到——】 |

防打扰三件套：90 秒内最多自动弹出一次、16 秒无操作自动收起、页脚 🔔 随时可关。联动关闭或页面不可见时**零轮询**，开启时也只 30 秒一轮轻量事件流。

## 核心功能

- **小黑板倒计时**：默认自动指向下一届 6 月 7 日（考完 6 月 10 日自动滚到下一届），≤100 天数字变红；⚙ 里可自定义高考日期；按住可拖到任意位置
- **知识卡**：点黑板翻开练习本（横线纸 + 红栏线），Markdown 渲染（标题/列表/代码/引用/粗体），卡头学科章 + 年级 + 倒计时徽章；右下角拖拽调大小（自动记住）
- **🎲 随机 / ⏮ 上一个 / ⏭ 下一个**：沿浏览历史前进后退，到顶自动再抽新卡；近期 12 张不重复
- **❤ 收藏 / 📥 复习**：重点卡片收藏（⭐ 收藏夹回看），记不牢的加入复习清单（📖），掌握了再移出；localStorage 持久化
- **关联跳转**：卡片底部"关联知识点" chips 与正文 `[[wikilink]]` 都可点击翻卡，知识库里还没有的卡灰显提示
- **重点学科**：⚙ 勾选想主攻的学科，随机只出选中的；学科章低饱和素色，端庄不花哨
- **开放知识卡框架**：插件只提供运行骨架，内容全是普通 Markdown 文件——按文件夹放好、符合格式就自动加载，任何人可贡献或导入自己的知识库
- **低频批量拉取**：每 5 分钟一次批量取 30 张存本地池，抽卡基本不产生请求压力

## 安装

```bash
dsh plugin --profile web add @weibaohui/dsh-gaokao -w
```

装完重启 `dsh web` 即生效。26 张种子知识卡（语数英物化生 × 高一~高三）已随包内置，无需任何配置。

## 使用

1. 打开 Web UI → 右下角找到 **小黑板**，点它翻开知识卡（首次自动抽一张）；拖住黑板可挪位置
2. **🎲 随机**：从当前学科范围再抽一张；**⏮/⏭** 在看过的卡之间前进后退
3. **❤ 收藏**：重点知识点收藏；⭐ 打开收藏夹回看
4. **📥 复习**：没记住的加入复习清单；📖 打开清单逐张过，掌握后点 📤 移出
5. ⚙ 勾选重点学科、改高考日期；🔔 开关事件联动

## 知识卡格式（贡献指南）

一条知识点 = 一个 `.md` 文件，目录层级即**学科 / 年级**：

```
data/
  物理/高一/牛顿第一定律.md
  数学/高二/等差数列.md
```

```markdown
---
title: 牛顿第一定律        # 可选，缺省取正文第一个 # 一级标题
subject: 物理              # 可选，缺省取第一级文件夹名
grade: 高一                # 可选，缺省取第二级文件夹名
tags: [力学, 运动学]       # 可选
related: [牛顿第二定律]     # 可选，写卡片标题或 id 均可
---

# 牛顿第一定律

**内容**：一切物体总保持匀速直线运动状态或静止状态……

关联知识点用 [[牛顿第二定律]] 写在正文里也行，会自动变成可点击链接。
```

规则只有几条：

- 跳过 `README.md`、`.` 开头文件和 `_` 开头目录，其余 `.md` 全部加载
- frontmatter 全部可选；关联（`related` 或 `[[wikilink]]`）按**标题或 id** 解析，解析不到的灰显
- 卡片 id 默认是相对路径（如 `物理/高一/牛顿第一定律`），也可用 frontmatter `id:` 指定
- 改了文件后 `curl "http://127.0.0.1:3080/dsh-gaokao/api/reload"` 热刷新，不用重启

### 导入自己的知识库

插件配置里用 `dataDir` 指向你的目录（结构同上）：

```yaml
config:
  dataDir: /Users/you/my-knowledge-base   # 按 学科/年级/*.md 组织
  examDate: "2027-06-07"                   # 可选，自定义高考日期
```

## 开发

```bash
npm run build:client  # 重建 client/bundle-mc.js
npm run check         # 语法检查
npm test              # smoke 测试
```

HTTP API（/dsh-gaokao/api/*）：`/draw` 随机抽一张、`/bundle?n=30` 批量抽取、`/card?id=` 取整张、`/feed?after=N` 会话事件流、`/status`（含高考倒计时）、`/reload`。

发版：`npm version patch && git push --follow-tags`，再 `gh release create vX.Y.Z --generate-notes` 触发 npm Trusted Publishing（OIDC 免 token）。

## 致谢

骨架复用自 [dsh-code-poem](https://github.com/weibaohui/dsh-code-poem)（代码如诗）。

## 联系我 :飞书群

![link](https://foruda.gitee.com/images/1774880015525784725/4fd67005_77493.png "link")
