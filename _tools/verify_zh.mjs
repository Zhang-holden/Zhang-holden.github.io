// Bilingual (EN/ZH) verification harness — source assertions + real Liquid render.
// Run: node _tools/verify_zh.mjs   (exit 0 = green, 1 = red)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid } from 'liquidjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));

const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

// ---------- S1/S5: source artifacts ----------
for (const f of [
  '_data/navigation_zh.yml',
  '_pages/zh/index.md',
  '_pages/zh/mission-bay-adaptation.md',
  '_pages/zh/rescued-flour-lca.md',
  'files/resume-zh.pdf',
]) check(exists(f), `MISSING file: ${f}`);

if (exists('files/resume-zh.pdf')) {
  const buf = fs.readFileSync(path.join(root, 'files/resume-zh.pdf'));
  check(buf.slice(0, 5).toString('ascii') === '%PDF-', 'resume-zh.pdf bad header');
}

// ---------- S1: ZH nav data ----------
if (exists('_data/navigation_zh.yml')) {
  const nav = read('_data/navigation_zh.yml');
  for (const t of ['关于', '查看我的简历', 'LCA 项目', 'Mission Bay 项目']) check(nav.includes(t), `nav_zh missing title: ${t}`);
  check(nav.includes('/zh/#about-me'), 'nav_zh missing /zh/#about-me');
  check(nav.includes('/zh/projects/rescued-flour-lca/'), 'nav_zh missing zh LCA url');
  check(nav.includes('/zh/projects/mission-bay-adaptation/'), 'nav_zh missing zh MB url');
  check(nav.includes('/files/resume-zh.pdf'), 'nav_zh missing resume url');
  check(!nav.includes('Courses'), 'nav_zh must NOT contain Courses');
  const iA = nav.indexOf('关于'), iR = nav.indexOf('查看我的简历'), iL = nav.indexOf('LCA 项目');
  check(iA >= 0 && iR > iA && iL > iR, 'nav_zh order: 关于 -> 查看我的简历 -> LCA 项目');
}

// ---------- S1/S5: ZH page front matter ----------
const pageChecks = {
  '_pages/zh/index.md': ['permalink: /zh/', 'lang: zh', "id='about-me'", '/zh/projects/rescued-flour-lca/', '/zh/projects/mission-bay-adaptation/'],
  '_pages/zh/mission-bay-adaptation.md': ['permalink: /zh/projects/mission-bay-adaptation/', 'lang: zh', '基础设施课程研究项目'],
  '_pages/zh/rescued-flour-lca.md': ['permalink: /zh/projects/rescued-flour-lca/', 'lang: zh'],
};
for (const [f, tokens] of Object.entries(pageChecks)) {
  if (!exists(f)) continue;
  const c = read(f);
  for (const t of tokens) check(c.includes(t), `${f} missing: ${t}`);
  check(!c.includes('/courses-transcripts/'), `${f} should not reference courses`);
}

// ---------- S2/S3: sidebar logic tokens ----------
if (exists('_includes/sidebar.html')) {
  const sb = read('_includes/sidebar.html');
  for (const t of ["page.lang == 'zh'", 'site.data.navigation_zh.main', "page.url == '/courses-transcripts/'", 'lang-switch']) {
    check(sb.includes(t), `sidebar missing token: ${t}`);
  }
}

// ---------- ZH author profile: Chinese labels, no English name ----------
if (exists('_includes/author-profile.html')) {
  const ap = read('_includes/author-profile.html');
  for (const t of ['邮箱', '电话（中国）', '电话（新西兰）', '微信']) check(ap.includes(t), `author-profile missing zh label: ${t}`);
  check(ap.includes("page.lang == 'zh'"), 'author-profile missing lang switch');
}

// ---------- i18n: layout + seo ----------
if (exists('_layouts/default.html')) {
  check(read('_layouts/default.html').includes('lang="{{ page.lang | default: \'en\' }}"'), 'default.html lang not localized');
}
if (exists('_includes/seo.html')) {
  const s = read('_includes/seo.html');
  check(s.includes('zh_CN'), 'seo.html missing zh_CN');
  check(s.includes('个人主页'), 'seo.html missing zh page title');
}

// ---------- S4: EN invariants ----------
if (exists('_data/navigation.yml')) {
  const en = read('_data/navigation.yml');
  check(en.includes('View My CV'), 'EN nav lost View My CV');
  check(en.includes('/files/CV_Haochen_Zhang.pdf'), 'EN nav CV url changed');
  check(en.includes('Courses'), 'EN nav lost Courses');
}
if (exists('_config.yml')) {
  check(/^\s*-\s*resume\s*$/m.test(read('_config.yml')), 'config missing resume exclude');
}

// ---------- Liquid render checks ----------
const engine = new Liquid();

// S1-S5: sidebar.html
if (exists('_includes/sidebar.html')) {
  const sidebar = read('_includes/sidebar.html').replace(/\{%\s*include[^%]*%\}/g, '');
  const EN_NAV = [
    { title: 'About', url: '/#about-me' },
    { title: 'Courses', url: '/courses-transcripts/' },
    { title: 'LCA Project', url: '/projects/rescued-flour-lca/' },
    { title: 'Mission Bay Project', url: '/projects/mission-bay-adaptation/' },
    { title: 'View My CV', url: '/files/CV_Haochen_Zhang.pdf' },
  ];
  const ZH_NAV = [
    { title: '关于', url: '/zh/#about-me' },
    { title: '查看我的简历', url: '/files/resume-zh.pdf' },
    { title: 'LCA 项目', url: '/zh/projects/rescued-flour-lca/' },
    { title: 'Mission Bay 项目', url: '/zh/projects/mission-bay-adaptation/' },
  ];
  const cases = [
    { name: 'EN home', page: { url: '/', author_profile: true }, expect: { switchHref: '/zh/', label: '中文', titles: ['About', 'Courses', 'LCA Project', 'Mission Bay Project', 'View My CV'] } },
    { name: 'EN courses', page: { url: '/courses-transcripts/', author_profile: true }, expect: { switchHref: '/zh/' } },
    { name: 'EN project', page: { url: '/projects/rescued-flour-lca/', author_profile: true }, expect: { switchHref: '/zh/projects/rescued-flour-lca/' } },
    { name: 'ZH home', page: { url: '/zh/', lang: 'zh', author_profile: true }, expect: { switchHref: '/', label: 'English', titles: ['关于', '查看我的简历', 'LCA 项目', 'Mission Bay 项目'], noCourses: true } },
    { name: 'ZH project', page: { url: '/zh/projects/mission-bay-adaptation/', lang: 'zh', author_profile: true }, expect: { switchHref: '/projects/mission-bay-adaptation/' } },
  ];
  for (const c of cases) {
    let html = '';
    try {
      html = await engine.parseAndRender(sidebar, { page: c.page, site: { data: { navigation: { main: EN_NAV }, navigation_zh: { main: ZH_NAV } } } });
    } catch (e) {
      check(false, `${c.name}: liquid render error: ${e.message}`);
      continue;
    }
    if (c.expect.switchHref) check(html.includes(`href="${c.expect.switchHref}"`), `${c.name}: missing switch href ${c.expect.switchHref}`);
    if (c.expect.label) check(html.includes(c.expect.label), `${c.name}: missing label ${c.expect.label}`);
    if (c.expect.titles) for (const t of c.expect.titles) check(html.includes(`>${t}<`), `${c.name}: missing nav title ${t}`);
    if (c.expect.noCourses) check(!html.includes('/courses-transcripts/'), `${c.name}: must not contain courses`);
    if (c.name === 'ZH home') {
      const iAbout = html.indexOf('>关于<'), iResume = html.indexOf('>查看我的简历<'), iLca = html.indexOf('>LCA 项目<');
      check(iAbout >= 0 && iResume > iAbout && iLca > iResume, 'ZH home: nav order must be 关于 -> 查看我的简历 -> LCA 项目');
    }
  }
}

// ZH/EN author profile
if (exists('_includes/author-profile.html')) {
  const ap = read('_includes/author-profile.html');
  const AUTHOR = { name: 'Haochen Zhang', name_cn: '张皓琛', email: 'holden4study@gmail.com', whatsapp_cn: '+86 19198026326', whatsapp_nz: '+64 0204798452', wechat: 'wulihaochen233', avatar: '/images/m1.jpg' };
  const site = { author: AUTHOR, data: { authors: {} } };
  let zhAp = '', enAp = '';
  try {
    zhAp = await engine.parseAndRender(ap, { page: { lang: 'zh', author_profile: true }, site });
    enAp = await engine.parseAndRender(ap, { page: { author_profile: true }, site });
  } catch (e) {
    check(false, `author-profile: liquid render error: ${e.message}`);
  }
  if (zhAp) {
    check(!zhAp.includes('Haochen Zhang'), 'author-profile zh: must NOT show English name');
    check(zhAp.includes('张皓琛'), 'author-profile zh: missing 张皓琛');
    for (const t of ['邮箱', '电话（中国）', '电话（新西兰）', '微信']) check(zhAp.includes(t), `author-profile zh missing label: ${t}`);
  }
  if (enAp) {
    check(enAp.includes('Haochen Zhang'), 'author-profile en: lost English name');
    for (const t of ['Email', 'Phone (CN)', 'Phone (NZ)', 'WeChat']) check(enAp.includes(t), `author-profile en missing label: ${t}`);
  }
}

// ---------- Report ----------
if (fails.length) {
  console.log(`FAIL (${fails.length}):`);
  for (const f of fails) console.log(`  - ${f}`);
  process.exit(1);
} else {
  console.log('PASS: all ZH checks green');
}
