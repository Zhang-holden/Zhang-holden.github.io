// Remote verification for the live bilingual site (S1-S5).
// Run: node _tools/verify_zh_remote.mjs
const BASE = 'https://zhang-holden.github.io';
const fails = [];
const check = (cond, msg) => { if (!cond) fails.push(msg); };

async function get(p) {
  const res = await fetch(BASE + p, { redirect: 'follow' });
  const text = await res.text();
  return { status: res.status, text, headers: res.headers };
}

// S1: Chinese homepage
const zh = await get('/zh/');
check(zh.status === 200, `S1 /zh/ status=${zh.status}`);
for (const t of ['关于', 'LCA 项目', 'Mission Bay 项目', '简历']) check(zh.text.includes(t), `S1 /zh/ missing nav title: ${t}`);
check(zh.text.includes('/files/resume-zh.pdf'), 'S1 /zh/ missing resume link');
check(!zh.text.includes('/courses-transcripts/'), 'S1 /zh/ must NOT contain courses');
check(zh.text.includes('lang="zh"'), 'S1 /zh/ html lang not zh');
check(zh.text.includes('zh_CN'), 'S1 /zh/ og:locale not zh_CN');
check(zh.text.includes('English'), 'S1 /zh/ missing English switcher label');
check(zh.text.includes("id='about-me'") || zh.text.includes('id="about-me"'), 'S1 /zh/ missing about-me anchor');

// S2/S4: English homepage unchanged + switcher
const en = await get('/');
check(en.status === 200, `S2 / status=${en.status}`);
check(en.text.includes('href="/zh/"'), 'S2 / missing switcher -> /zh/');
check(en.text.includes('中文'), 'S2 / missing 中文 label');
check(en.text.includes('lang="en"'), 'S4 / html lang not en');
check(en.text.includes('View My CV'), 'S4 / lost View My CV');
check(en.text.includes('/files/CV_Haochen_Zhang.pdf'), 'S4 / CV url changed');
check(en.text.includes('Courses'), 'S4 / lost Courses');

// S3: EN courses switcher -> /zh/
const courses = await get('/courses-transcripts/');
check(courses.status === 200, `S3 courses status=${courses.status}`);
check(courses.text.includes('href="/zh/"'), 'S3 courses switcher not /zh/');
check(!courses.text.includes('/zh/courses-transcripts/'), 'S3 broken zh courses link');

// S5: ZH project pages + switcher back to EN
const mb = await get('/zh/projects/mission-bay-adaptation/');
check(mb.status === 200, `S5 zh MB status=${mb.status}`);
check(mb.text.includes('lang="zh"'), 'S5 zh MB lang not zh');
check(mb.text.includes('href="/projects/mission-bay-adaptation/"'), 'S5 zh MB switcher not -> EN');
check(mb.text.includes('返回首页'), 'S5 zh MB missing back link');
check(mb.text.includes('/images/mission_bay_risk_matrix.png'), 'S5 zh MB lost risk matrix image');

const lca = await get('/zh/projects/rescued-flour-lca/');
check(lca.status === 200, `S5 zh LCA status=${lca.status}`);
check(lca.text.includes('lang="zh"'), 'S5 zh LCA lang not zh');
check(lca.text.includes('/files/projects/rescued-flour/Final_Report.pdf'), 'S5 zh LCA lost report link');

const enMb = await get('/projects/mission-bay-adaptation/');
check(enMb.text.includes('href="/zh/projects/mission-bay-adaptation/"'), 'S5 EN MB switcher not -> zh');

// PDF asset
const pdf = await fetch(BASE + '/files/resume-zh.pdf');
check(pdf.status === 200, `PDF status=${pdf.status}`);
const ct = pdf.headers.get('content-type') || '';
check(ct.includes('pdf'), `PDF content-type=${ct}`);

if (fails.length) {
  console.log(`REMOTE FAIL (${fails.length}):`);
  for (const f of fails) console.log(`  - ${f}`);
  process.exit(1);
}
console.log('REMOTE PASS: all S1-S5 green');
