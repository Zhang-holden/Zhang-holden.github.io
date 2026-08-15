# 界面与字体打磨实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 升级全站字体为 Inter + 中文系统回退,基础字号 14→16px、行高 1.5→1.7,主色微调为炭灰 #5A636A,打磨侧边导航 hover/active 过渡,并清理 3 处代码瑕疵。

**Architecture:** Jekyll 静态站点。全部改动集中在 Sass 变量/样式与两个 include/JS 文件:字体与主色通过 `_variables.scss` 变量生效(主题派生色自动跟随 `mix()`);导航视觉在 `_sidebar.scss` 增强;空 class 修复用 Liquid 条件渲染;打印死代码从 `_print.scss` 删除;高亮偏移在 `nav-highlight.js` 收紧。无布局结构调整。

**Tech Stack:** Jekyll (kramdown GFM)、Sass、Liquid、jQuery 1.12.4(已打包于 main.min.js)、Google Fonts Inter、GitHub Pages。

## Global Constraints

- **构建环境**:本机无 Ruby/Jekyll。无法 `jekyll serve` 本地验证。所有验证步骤使用 PowerShell 静态检查;最终由 GitHub Pages 部署后线上确认。
- **工作目录**:`C:\Users\wulih\Desktop\新建文件夹\Zhang-holden.github.io`
- **不得改动**:`assets/js/main.min.js`、`assets/js/_main.js`、`google_scholar_crawler/`、`.github/workflows/`、`_data/navigation.yml`(4 项不变)、页面布局结构(`_layouts/`)、正文内容与作者信息。
- **链接规则**:沿用已上线行为——站内导航当前页跳转,外链显式 `target="_blank"`。本计划不触碰任何链接。
- **提交规则**:每个任务完成并验证后提交;提交信息使用仓库现有风格(短小、祈使句)。仅当用户已批准本计划及执行方式后才执行 git 提交与 push。
- **PowerShell 引号注意**:验证命令避免在 `python -c "..."` 内嵌 `\"`(PS 5.1 解析会崩),一律使用 `Select-String` 或单引号包裹。
- **锚点事实**(线上已验证):`#about-me`、`#-news`、`#-educations` 存在,侧边导航 4 项与高亮逻辑已上线且正常。

---

### Task 1: 字体排版(Inter Web Font + 字号行高)

**Files:**
- Modify: `_sass/_variables.scss:9,17`
- Modify: `_includes/head.html:1`
- Modify: `_sass/_base.scss:15-16`
- Modify: `_sass/_reset.scss:11`

**Interfaces:**
- Consumes: 无(第一个任务)
- Produces: `$sans-serif` 变为 Inter 优先栈(标题/正文自动跟随);`$doc-font-size = 16`;`head.html` 含 Google Fonts Inter 加载;正文行高 1.7。Task 2 依赖本任务后的变量文件状态(同文件继续改主色)。

- [ ] **Step 1: 更新 _variables.scss 字体变量**

`_sass/_variables.scss` 第 9 行:

```scss
$doc-font-size              : 14;
```

改为:

```scss
$doc-font-size              : 16;
```

第 17 行:

```scss
$sans-serif                 : "Trebuchet MS", Helvetica, sans-serif;
```

改为:

```scss
$sans-serif                 : "Inter", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
```

其余行(第 18 行起的注释、备用栈)保持不动。

- [ ] **Step 2: head.html 添加 Inter 加载**

`_includes/head.html` 第 1 行 `<meta charset="utf-8">` 之后、第 3 行 `{% include seo.html %}` 之前插入:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

文件开头最终为:

```html
<meta charset="utf-8">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">

{% include seo.html %}
```

- [ ] **Step 3: _base.scss 行高 + _reset.scss 根字号**

`_sass/_base.scss` 第 15-16 行:

```scss
  font-family: $global-font-family;
  line-height: 1.5;
```

将 `line-height: 1.5;` 改为 `line-height: 1.7;`。其余不动。

同一步骤中,`_sass/_reset.scss` 第 11 行 html 根字号由硬编码 `15px` 改为由 `$doc-font-size` 驱动:

```scss
  font-size: 15px;
```

改为:

```scss
  font-size: #{$doc-font-size}px;
```

(Sass 插值渲染为 16px;`$doc-font-size` 为无单位数字,可直接插值。此改动使 `$doc-font-size = 16` 真正生效——此前它仅喂给未使用的 em() mixin,渲染字号停留在硬编码 15px。)

- [ ] **Step 4: 静态验证**

Run:
```powershell
Select-String -Path _includes/head.html -Pattern "fonts.googleapis|fonts.gstatic" | Measure-Object   # 预期:2(preconnect ×2)
Select-String -Path _includes/head.html -Pattern "css2\?family=Inter" | ForEach-Object { $_.Line }    # 预期:Inter stylesheet 行
Select-String -Path _sass/_variables.scss -Pattern "Inter|doc-font-size" | ForEach-Object { $_.Line } # 预期:含 Inter 栈行与 ": 16"
Select-String -Path _sass/_base.scss -Pattern "line-height: 1.7" | ForEach-Object { $_.Line }         # 预期:1 处
```
Expected: Inter 加载 3 行齐全;变量已更新;行高 1.7 就位。

- [ ] **Step 5: Commit**

```bash
git add _sass/_variables.scss _includes/head.html _sass/_base.scss
git commit -m "Add Inter web font and improve base typography"
```

---

### Task 2: 配色炭灰 + 侧边导航视觉

**Files:**
- Modify: `_sass/_variables.scss:66`
- Modify: `_sass/_sidebar.scss`(`.sidebar__nav .nav__list` 块)

**Interfaces:**
- Consumes: Task 1 的 `$sans-serif`/`$doc-font-size`(同文件,仅改第 66 行)。
- Produces: `$primary-color = #5A636A`(导航高亮 pill、按钮、hover 派生色自动跟随);`.sidebar__nav` 链接 hover 变主色 + 平滑过渡、间距 0.35em、active pill 过渡。Task 3 无依赖。

- [ ] **Step 1: 主色改炭灰**

`_sass/_variables.scss` 第 66 行:

```scss
$primary-color              : #7a8288;
```

改为:

```scss
$primary-color              : #5A636A;
```

`$link-color`(#224b8d)、`$border-color` 等其余颜色不动。

- [ ] **Step 2: 侧边导航样式增强**

`_sass/_sidebar.scss` 中 `.sidebar__nav` 块当前的 `.nav__list` 子块:

```scss
  .nav__list {
    font-size: 1rem;

    a {
      padding: 0.25em 0;
    }
  }
```

整块替换为:

```scss
  .nav__list {
    font-size: 1rem;

    a {
      padding: 0.35em 0;
      text-decoration: none;
      -webkit-transition: color 0.2s ease-in-out;
      transition: color 0.2s ease-in-out;

      &:hover {
        color: $primary-color;
        text-decoration: none;
      }
    }

    .active {
      -webkit-transition: background-color 0.2s ease-in-out;
      transition: background-color 0.2s ease-in-out;
    }
  }
```

注意:`.sidebar__nav .nav__list a:hover` 选择器特异性(0,3,1)高于主题 `.nav__list a:hover`(0,2,1),下划线被 `text-decoration: none` 覆盖;`.active` 的 pill 填充色/圆角仍由主题 `.nav__list .active` 提供(自动为炭灰),本块只追加过渡。

- [ ] **Step 3: 静态验证**

Run:
```powershell
Select-String -Path _sass/_variables.scss -Pattern "#5A636A" | ForEach-Object { $_.Line }        # 预期:1 处
Select-String -Path _sass/_sidebar.scss -Pattern "0.35em|transition|hover" | Measure-Object       # 预期:4 处以上
Select-String -Path _sass/_sidebar.scss -Pattern "text-decoration: none" | Measure-Object         # 预期:2 处
```
Expected: 主色已改;导航块含间距/过渡/hover 规则;无下划线残留。

- [ ] **Step 4: Commit**

```bash
git add _sass/_variables.scss _sass/_sidebar.scss
git commit -m "Deepen primary color to charcoal and polish sidebar nav"
```

---

### Task 3: 代码优化(空 class、打印死代码、高亮偏移)

**Files:**
- Modify: `_includes/sidebar.html:7`
- Modify: `_sass/_print.scss:10`
- Modify: `assets/js/nav-highlight.js:14`

**Interfaces:**
- Consumes: 无(独立清理)。导航项与高亮机制已在线上运行,本任务不改变行为,仅移除冗余。
- Produces: 链接无空 `class=""`;打印样式无 `.masthead` 死代码;高亮偏移 90px。

- [ ] **Step 1: sidebar.html 空 class 修复**

`_includes/sidebar.html` 第 7 行:

```liquid
          <li><a href="{{ link.url }}" class="{% if link.url == page.url %}active{% endif %}">{{ link.title }}</a></li>
```

改为:

```liquid
          <li><a href="{{ link.url }}"{% if link.url == page.url %} class="active"{% endif %}>{{ link.title }}</a></li>
```

效果:子页面 Courses & Transcripts 项仍渲染 `class="active"`;主页所有链接不再带空 class 属性。

- [ ] **Step 2: _print.scss 删除 masthead 死代码**

`_sass/_print.scss` 第 9-11 行:

```scss
@media print {
  .masthead,
  .toc,
```

改为:

```scss
@media print {
  .toc,
```

- [ ] **Step 3: nav-highlight.js 偏移收紧**

`assets/js/nav-highlight.js` 第 27 行:

```js
      var pos = window.pageYOffset + 120; // offset matches smooth-scroll (-20) + header slack
```

改为:

```js
      var pos = window.pageYOffset + 90; // offset slack; no fixed header anymore
```

- [ ] **Step 4: 静态验证**

Run:
```powershell
node --check assets/js/nav-highlight.js   # 预期:无输出,退出码 0
Select-String -Path _includes/sidebar.html -Pattern 'class=""'    # 预期:无输出
Select-String -Path _includes/sidebar.html -Pattern 'class="active"' | ForEach-Object { $_.Line }  # 预期:条件渲染行存在
Select-String -Path _sass/_print.scss -Pattern "masthead"         # 预期:无输出
Select-String -Path assets/js/nav-highlight.js -Pattern "+ 90" | ForEach-Object { $_.Line }         # 预期:偏移行
git status --short                                                # 预期:仅上述 3 文件改动,main.min.js 不在列表
```
Expected: JS 语法 OK;无空 class;打印文件无 masthead;偏移已改;变更范围正确。

- [ ] **Step 5: Commit**

```bash
git add _includes/sidebar.html _sass/_print.scss assets/js/nav-highlight.js
git commit -m "Clean up empty class, dead print rule, and highlight offset"
```

---

### Task 4: 全量验证 + 线上确认

**Files:**
- 无修改,仅验证

**Interfaces:**
- Consumes: 所有前序任务产物
- Produces: 验收结论

- [ ] **Step 1: 工作区完整性检查**

Run:
```powershell
git status --short
git log --oneline -6
```
Expected: 3 个新提交(对应 Task 1-3,位于规格提交 befe94d 之后),工作区干净(仅 `docs/superpowers/` 计划/规格文档未跟踪属预期,不提交)。

- [ ] **Step 2: 变更内容终审(与规格对照)**

Run:
```powershell
git diff HEAD~3 --stat
```
Expected: 变更文件为 `_sass/_variables.scss`、`_includes/head.html`、`_sass/_base.scss`、`_sass/_reset.scss`、`_sass/_sidebar.scss`、`_includes/sidebar.html`、`_sass/_print.scss`、`assets/js/nav-highlight.js` —— 与设计规格文件变更清单 8 个文件逐项一致;`main.min.js`、`_data/navigation.yml`、`_layouts/` 不在列表。

- [ ] **Step 3: 提交并触发 GitHub Pages 部署**

```powershell
git push
```
(需用户确认后执行。推送后 GitHub Pages 自动重建站点,约 1-3 分钟;注意 CDN 缓存 max-age=600 秒,验收前若看到旧页面属缓存,加 `?v=` 查询串或稍候。)

- [ ] **Step 4: 线上验收(用户操作)**

访问 `https://zhang-holden.github.io/` 检查:
1. 正文/标题为 Inter(Windows/macOS 一致),中文(如"张皓琛")正常回退显示
2. 正文字号明显增大(16px)、行距更宽松(1.7)
3. 侧边导航链接 hover:主色过渡,无下划线
4. 滚动页面:当前区块 pill 为炭灰 `#5A636A`,切换平滑
5. 高亮切换位置准确(约在区块交界处,偏移 90px)
6. 回归:点击 About/News/Educations 当前页内滚动;外链新标签;`/courses-transcripts/` 子页面此项静态高亮

Expected: 全部通过。
