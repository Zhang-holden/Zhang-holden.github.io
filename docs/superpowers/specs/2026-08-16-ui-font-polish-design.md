# 界面与字体打磨设计

- **日期**: 2026-08-16
- **状态**: 待用户审阅
- **仓库**: Zhang-holden/Zhang-holden.github.io(AcadHomepage / Minimal Mistakes Jekyll 主题)

## 背景与目标

侧边导航改版(2026-08-16-sidebar-navigation)已完成并上线。用户要求:检查代码错误、优化代码、全面打磨界面与字体。

**错误检查结论**(已完成):部署正常、无功能性错误。此前线上显示旧版是 GitHub Pages CDN 缓存(10 分钟 max-age)所致,重新抓取确认新版已上线。发现以下可优化点:

1. `_includes/sidebar.html` 渲染出空 `class=""` 属性(无效但冗余)。
2. `_sass/_print.scss:10` 存在 `.masthead` 死代码(该 class 已从 HTML 删除,仅剩打印隐藏规则引用)。
3. `assets/js/nav-highlight.js` 高亮偏移 120px 按"有顶部栏"假设设定,顶部栏已移除,可收紧。
4. 主题字体 `"Trebuchet MS"` 老旧;基础字号 14px 偏小;主色为灰色 `#7a8288` 较平淡。

**用户已确认的设计决策**:

- 优化范围:**全面打磨**(字体 + 配色 + 侧边导航视觉 + 排版)
- 主色方向:**炭灰微调** `#5A636A`(保持克制学术风)
- 字体方案:**Inter Web Font**(Google Fonts, `display=swap`)+ 中文系统字体回退

## 现状诊断

当前主题变量(`_sass/_variables.scss`):

| 变量 | 当前值 | 问题 |
|---|---|---|
| `$sans-serif` | `"Trebuchet MS", Helvetica, sans-serif` | Trebuchet MS 老旧,跨平台观感差 |
| `$doc-font-size` | `14`(仅变量,未生效) | 实际渲染基础字号为 `_sass/_reset.scss` 硬编码的 `15px`;变量仅喂给未使用的 em() mixin |
| `$primary-color` | `#7a8288` | 灰,与背景对比弱 |
| `$link-color` | `#224b8d` | 保留(与炭灰协调) |

排版基础(`_sass/_base.scss`):正文 `line-height: 1.5`;标题 `line-height: 1.2`,层级 h1=1.4em / h2=1.2em / h3=1em(克制合理,保留)。

## 设计方案

### 1. 字体排版

- **`_sass/_variables.scss`**:
  - `$sans-serif` 改为:`"Inter", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif`
  - `$doc-font-size`: `14` → `16`
  - (`$sans-serif-narrow`、`$header-font-family`、`$global-font-family` 均引用 `$sans-serif`,自动跟随)
- **`_includes/head.html`**(`<meta charset>` 之后):添加 Inter 加载:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

  400 常规正文 + 600/700 标题与加粗;`display=swap` 无阻塞渲染。中文**不加载** Web 字体(体积大),走系统回退。
- **`_sass/_base.scss`**:正文 `line-height: 1.5` → `1.7`。标题层级与行高不动。
- **`_sass/_reset.scss`**:html 根字号由硬编码 `font-size: 15px` 改为 `font-size: #{$doc-font-size}px`(`$doc-font-size` 插值渲染 16px,变量首次真正生效,替换此前硬编码 15px)。

### 2. 配色(炭灰微调)

- **`_sass/_variables.scss`**:`$primary-color`: `#7a8288` → `#5A636A`
- 影响:导航高亮 pill、按钮、`$masthead-link-color` 系列(已无 masthead,无实际影响)、hover 派生色自动跟随 `mix()`。
- `$link-color`(深蓝 `#224b8d`)与 `$border-color` 等其余颜色**不动**。

### 3. 侧边导航视觉

`_sass/_sidebar.scss` 中 `.sidebar__nav` 块增强:

- 链接 hover:`text-decoration: none`(覆盖主题默认下划线,选择器特异性更高)+ `color: $primary-color` + `transition: color 0.2s ease-in-out`
- 链接垂直间距:`padding: 0.25em 0` → `0.35em 0`
- 高亮 pill(`.active`):`transition: background-color 0.2s ease-in-out`(切换平滑,主题 pill 样式保留,颜色自动为炭灰)
- 导航字号保持 `1rem`

### 4. 代码优化

- **`_includes/sidebar.html`**:空 `class=""` 修复——Liquid 条件渲染:

```liquid
<li><a href="{{ link.url }}"{% if link.url == page.url %} class="active"{% endif %}>{{ link.title }}</a></li>
```

- **`_sass/_print.scss`**:第 10 行删除 `.masthead,`(该 class 已不存在)。
- **`assets/js/nav-highlight.js`**:`window.pageYOffset + 120` → `+ 90`(顶部栏已移除,区块切换点更贴近实际)。

## 文件变更清单

| 文件 | 操作 |
|---|---|
| `_sass/_variables.scss` | `$sans-serif` 字体栈、`$doc-font-size` 14→16、`$primary-color` → `#5A636A` |
| `_includes/head.html` | 添加 Google Fonts Inter 加载(3 行) |
| `_sass/_base.scss` | 正文 `line-height` 1.5→1.7 |
| `_sass/_reset.scss` | html 根字号改由 `$doc-font-size` 驱动(15px → 16px) |
| `_sass/_sidebar.scss` | 导航 hover/active 过渡与间距 |
| `_includes/sidebar.html` | 空 `class=""` 修复 |
| `_sass/_print.scss` | 删除 `.masthead` 死代码 |
| `assets/js/nav-highlight.js` | 高亮偏移 120→90 |

**不改动**:`main.min.js`、`_data/navigation.yml`(4 项不变)、页面布局结构、正文内容、作者信息、`google_scholar_crawler/`。

## 影响范围

- 全站字体/字号/行高变化:所有页面排版比例微调,全局一致。
- 主色变化:导航高亮、按钮、hover 派生色自动跟随。
- 中文文本:走系统字体(PingFang SC / Microsoft YaHei / Noto Sans SC),不增加中文 Web 字体请求。
- 性能:新增 1 个 Google Fonts CSS 请求(preconnect 加速),`display=swap` 避免阻塞渲染;站点本就加载 cdnjs MathJax,可接受。

## 验证方式

1. 静态检查:每项变更组内验证(Select-String / node --check),与侧边导航改版相同的流程。
2. push 后线上验收:
   - 字体:Inter 生效(Windows/macOS 一致),中文正常回退显示。
   - 侧边导航:hover 颜色过渡、active pill 为炭灰且切换平滑。
   - 正文 16px、行高 1.7,阅读舒适。
   - 高亮切换位置准确(约在区块交界处)。
3. 回归检查:导航锚点当前页跳转、外链新标签、子页面静态高亮不受影响。
