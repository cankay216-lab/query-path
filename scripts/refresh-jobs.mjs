// Daily job refresh for Query Path.
// Reads justjoin.it's public listing pages for junior SQL / data / support / analytics roles,
// keeps the relevant ones in Poland or remote, and updates site/data/jobs.json.
// Runs in GitHub Actions (see .github/workflows/deploy.yml). No dependencies: Node 20+.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = process.env.JOBS_OUT || new URL('../site/data/jobs.json', import.meta.url);
const PAGES = [
  ['sql', 'https://justjoin.it/job-offers/all-locations/sql?experience-level=junior'],
  ['data', 'https://justjoin.it/job-offers/all-locations/data?experience-level=junior'],
  ['analytics', 'https://justjoin.it/job-offers/all-locations/analytics?experience-level=junior'],
  ['support', 'https://justjoin.it/job-offers/all-locations/support?experience-level=junior']
];
const KEEP_DAYS = 6;        // drop an opening after it has been missing from the listings this long
const MAX_ITEMS = 150;
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 QueryPathPersonalJobFeed/1.0';

const POLISH_PLACES = ['warszawa', 'warsaw', 'krakow', 'cracow', 'wroclaw', 'gdansk', 'gdynia', 'sopot', 'trojmiasto', 'tricity', 'poznan', 'lodz', 'katowice', 'gliwice', 'zabrze', 'bytom', 'sosnowiec', 'chorzow', 'tychy', 'ruda-slaska', 'dabrowa-gornicza', 'bielsko-biala', 'czestochowa', 'lublin', 'rzeszow', 'szczecin', 'bydgoszcz', 'torun', 'olsztyn', 'bialystok', 'kielce', 'opole', 'zielona-gora', 'gorzow', 'radom', 'plock', 'elblag', 'koszalin', 'slupsk', 'legnica', 'walbrzych', 'kalisz', 'konin', 'leszno', 'pila', 'tarnow', 'nowy-sacz', 'krosno', 'przemysl', 'zamosc', 'siedlce', 'gizycko', 'radzymin', 'piaseczno', 'pruszkow', 'strykow', 'niepolomice', 'skawina', 'swarzedz', 'otwock', 'legionowo', 'marki', 'zielonka', 'wieliczka', 'mikolow', 'jaworzno', 'rybnik', 'jastrzebie', 'kedzierzyn', 'stalowa-wola', 'mielec', 'pulawy', 'ostrow', 'gniezno', 'inowroclaw', 'wloclawek', 'grudziadz', 'starogard', 'tczew', 'wejherowo', 'rumia', 'pruszcz'];
const LANG_RE = /german|niemiec|deutsch|italian|w[lł]osk|hebrew|french|francusk|czech|czesk|dutch|niderl|spanish|hiszpa|portug|swedish|szwedz|norweg|danish|du[nń]sk|finnish|fi[nń]sk|japanese|turkish|hungarian|w[eę]giersk|slovak|s[lł]owack|romanian|rumu[nń]/i;
const ROLE_RE = /sql|data|dane|danych|\bbi\b|power ?bi|analyst|analityk|analityczk|analytic|report|raport|etl|database|bazodan|baz danych|dba|support|wsparci|service ?desk|helpdesk|application|aplikacj|administrat|consultant|konsultant|wdro[zż]e|trainee|sta[zż]yst|sta[zż]\b|intern|graduate|absolwent|qa\b|tester|serwisant|specjalist/i;
const NOT_RE = /project manager|scrum|product owner|sales|marketing|recruit|devops|\bjava\b|\.net|c#|\bphp\b|\bruby\b|golang|\bgo developer|\bios\b|android|frontend|front-end|backend|back-end|fullstack|full-stack|embedded|\baml\b|\bkyc\b|fraud|cyber|security|bezpiecze|\brpa\b|robot|motion capture|\bux\b|ui designer|network engineer|\bran engineer|\bnoc\b|content moderator|trust ?& ?safety|senior|\bmid\b|\blead\b|kierownik|manager/i;
const SUPPORTISH = /support|wsparci|service ?desk|helpdesk|administrat|serwis|konsultant|consultant|specjalist|it engineer/i;

const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/Ł/g, 'L').toLowerCase();
const today = new Date().toISOString().slice(0, 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const decodeEntities = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');

async function getPage(url) {
  if (process.env.JOBS_FIXTURE) return readFile(process.env.JOBS_FIXTURE, 'utf8'); // local tests only
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'pl,en;q=0.8' } });
      if (res.ok) return await res.text();
      console.log(`  ${url} -> HTTP ${res.status} (attempt ${attempt})`);
    } catch (e) { console.log(`  ${url} -> ${e.message} (attempt ${attempt})`); }
    await sleep(3000 * attempt);
  }
  return '';
}

// Find the smallest JSON object around position `pos` that contains a "title" field.
function objectAround(text, pos) {
  let start = pos;
  for (let level = 0; level < 5; level++) {
    let depth = 0, i = start - 1;
    for (; i >= 0; i--) { const c = text[i]; if (c === '}') depth++; else if (c === '{') { if (depth === 0) break; depth--; } }
    if (i < 0) return null;
    let d = 0, j = i;
    for (; j < text.length; j++) { const c = text[j]; if (c === '{') d++; else if (c === '}') { d--; if (d === 0) break; } }
    const chunk = text.slice(i, j + 1);
    try { const obj = JSON.parse(chunk); if (obj && typeof obj === 'object' && obj.title) return obj; } catch (e) { /* not clean JSON at this level */ }
    start = i;
  }
  return null;
}

// Strategy 1: offer data embedded as JSON in the page (Next.js data, escaped or plain).
function fromJson(html, slug) {
  const variants = [html, html.replace(/\\"/g, '"').replace(/\\\\/g, '\\')];
  for (const text of variants) {
    const idx = text.indexOf(`"slug":"${slug}"`);
    if (idx < 0) continue;
    const o = objectAround(text, idx);
    if (!o) continue;
    const skills = Array.isArray(o.requiredSkills) ? o.requiredSkills.map((s) => (typeof s === 'string' ? s : s && (s.name || s.skill))).filter(Boolean) : [];
    const loc = o.city || (Array.isArray(o.multilocation) && o.multilocation[0] && o.multilocation[0].city) || '';
    const extra = Array.isArray(o.multilocation) && o.multilocation.length > 1 ? ` +${o.multilocation.length - 1}` : '';
    return { title: o.title, company: o.companyName || o.company || '', city: loc + extra, mode: o.workplaceType || (o.remote ? 'remote' : ''), level: o.experienceLevel || '', skills, published: o.publishedAt || '' };
  }
  return null;
}

// Strategy 2: the visible offer card (an <a> linking to the offer).
function fromAnchor(html, slug) {
  const re = new RegExp(`<a[^>]+href="[^"]*/job-offer/${slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>([\\s\\S]*?)</a>`, 'i');
  const m = html.match(re); if (!m) return null;
  const inner = m[1];
  const h = inner.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
  const parts = inner.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').split(/<[^>]+>/).map((t) => decodeEntities(t).trim()).filter(Boolean);
  const uniq = parts.filter((t, i) => parts.indexOf(t) === i);
  const title = h ? decodeEntities(h[1].replace(/<[^>]+>/g, '')).trim() : '';
  if (!title && !uniq.length) return null;
  const rest = uniq.filter((t) => t !== title);
  const modeWord = rest.find((t) => /^(remote|hybrid|office|zdalna|hybrydowa|stacjonarna)$/i.test(t)) || '';
  const noise = /left$|salary|undisclosed|^\d|usd|pln|eur|junior|permanent|full-time|b2b|contract|mandate|new$|^\+\d/i;
  const words = rest.filter((t) => !noise.test(t) && t !== modeWord);
  return { title: title || words[0] || '', company: words.find((t) => t !== title) || '', city: words.find((t, i) => i > 0 && t !== title) || '', mode: modeWord, level: 'junior', skills: rest.filter((t) => /^[A-Za-z#+.\- ]{2,25}$/.test(t) && !noise.test(t)).slice(0, 8), published: '' };
}

// Strategy 3: only the link is known; make a readable title from the slug.
function fromSlug(slug) {
  const words = slug.replace(/-[0-9a-f]{8}$/, '').split('-').filter(Boolean);
  return { title: words.slice(0, Math.min(words.length, 8)).join(' '), company: '', city: '', mode: '', level: 'junior', skills: [], published: '', weak: true };
}

function classify(title, skills) {
  const ti = fold(title), all = fold(title + ' ' + skills.join(' '));
  const sql = /sql|database|baz danych|bazodan/.test(all);
  if (/trainee|intern|sta[zż]|stazyst|graduate|absolwent/.test(ti)) return /graduate|absolwent/.test(ti) ? 'Graduate programme' : 'Trainee';
  if (/data engineer|inzynier danych|etl developer|big data/.test(ti)) return 'Data engineer';
  if (/developer|programist|programmer|\bdba\b/.test(ti) && sql) return 'Database developer';
  if (/support|wsparci|service desk|helpdesk|administrat|serwis|specialist|specjalist|it engineer|wdroz|implementation/.test(ti)) return sql ? 'Support / SQL' : 'Support';
  if (/power ?bi|tableau|\bdax\b|reporting|raport|\bbi\b/.test(all)) return 'Data / BI analyst';
  if (/data analyst|analityk danych|analityczka danych|data quality|data scien|danych/.test(ti)) return 'Data analyst';
  return 'Analyst';
}
function summarize(info, role) {
  const skills = info.skills.slice(0, 5);
  const stretch = role === 'Data engineer' || /scien/i.test(info.title) ? ' A stretch role.' : '';
  return (skills.length ? 'Skills: ' + skills.join(', ') + '.' : 'Junior role listed under SQL, data or support.') + stretch;
}
function normMode(m) { const f = fold(m); if (/remote|zdal/.test(f)) return 'remote'; if (/hybr/.test(f)) return 'hybrid'; if (/office|stacjon|onsite/.test(f)) return 'onsite'; return 'unknown'; }

// A role counts only if SQL, BI or data work shows up in its title or listed skills.
function dataEvidence(title, skills) {
  const t = fold(title + ' ' + (skills || []).join(' '));
  return /sql|database|baz danych|bazodan|power ?bi|\bbi\b|tableau|\bdax\b|looker|\betl\b|data|dane|danych|pandas|snowflake|databricks|warehouse|hurtowni|graduate|absolwent|application support/.test(t);
}
function inPoland(info, slug) {
  const c = fold(info.city);
  if (c) return /polska|poland/.test(c) || POLISH_PLACES.some((p) => c.includes(p) || c.includes(p.replace(/-/g, ' ')));
  return POLISH_PLACES.some((p) => new RegExp('(^|-)' + p + '(-|$)').test(slug));
}
function relevant(category, slug, info) {
  const text = info.title + ' ' + slug;
  if (LANG_RE.test(fold(text))) return 'language';
  if (info.level && !/junior|trainee|intern/i.test(info.level)) return 'level';
  if (!inPoland(info, slug)) return 'not in Poland';
  if (NOT_RE.test(info.title)) return 'other role';
  if (!ROLE_RE.test(fold(text))) return 'not a SQL/data role';
  if (!info.company || /apply today|check it out/i.test(info.title + ' ' + info.company)) return 'advert';
  if (/data entry|wprowadzanie danych/i.test(info.title)) return 'other role';
  if (!dataEvidence(info.title, info.skills)) return 'no SQL or data skills';
  const hasSql = /sql/i.test(slug + ' ' + info.title + ' ' + info.skills.join(' '));
  if ((category === 'support' || SUPPORTISH.test(info.title)) && !hasSql && !/application support|data|analyst|analityk/i.test(info.title)) return 'support without SQL';
  return '';
}

async function main() {
  let prev = { items: [] };
  try { prev = JSON.parse(await readFile(OUT, 'utf8')); } catch (e) { console.log('No previous jobs.json, starting fresh.'); }
  const prevByUrl = new Map((prev.items || []).map((i) => [i.url, i]));

  const found = new Map(); let pagesOk = 0;
  for (const [category, url] of PAGES) {
    const html = await getPage(url);
    if (!html) { console.log(`[${category}] could not load the page`); continue; }
    pagesOk++;
    const slugs = [...new Set([...html.matchAll(/\/job-offer\/([a-z0-9][a-z0-9-]{6,250})/g)].map((m) => m[1]))];
    const stats = { json: 0, anchor: 0, slug: 0, kept: 0, skipped: {} };
    for (const slug of slugs) {
      const offerUrl = 'https://justjoin.it/job-offer/' + slug;
      if (found.has(offerUrl)) continue;
      let info = fromJson(html, slug); if (info) stats.json++;
      if (!info) { info = fromAnchor(html, slug); if (info) stats.anchor++; }
      if (!info) { info = fromSlug(slug); stats.slug++; }
      info.skills = info.skills || [];
      const why = relevant(category, slug, info);
      if (why) { stats.skipped[why] = (stats.skipped[why] || 0) + 1; continue; }
      if (info.weak && !prevByUrl.has(offerUrl) && !/sql|data|dane|analyst|analityk|bi/.test(slug)) { stats.skipped['unclear'] = (stats.skipped['unclear'] || 0) + 1; continue; }
      const role = classify(info.title, info.skills);
      found.set(offerUrl, { id: slug.slice(0, 80), title: info.title.slice(0, 160), company: info.company.slice(0, 100), city: info.city.slice(0, 80), mode: normMode(info.mode), url: offerUrl, summary: summarize(info, role), role_type: role, skills: info.skills.slice(0, 8) });
      stats.kept++;
    }
    console.log(`[${category}] ${slugs.length} offer links; parsed from data ${stats.json}, from cards ${stats.anchor}, from link only ${stats.slug}; kept ${stats.kept}; skipped ${JSON.stringify(stats.skipped)}`);
    if (!process.env.JOBS_FIXTURE) await sleep(2500);
  }

  if (!pagesOk || !found.size) {
    console.log('Nothing usable was found today. Keeping the existing list unchanged.');
    prev.lastError = `${today}: no openings could be read from justjoin.it`;
    await writeFile(OUT, JSON.stringify(prev, null, 1));
    process.exit(1);
  }

  const merged = [];
  for (const [url, item] of found) {
    const old = prevByUrl.get(url);
    // Keep the nicer hand-written summary from earlier runs when the new one is generic.
    merged.push({ ...item, summary: old && old.summary && !/^Skills:|^Junior role listed/.test(old.summary) ? old.summary : item.summary, title: item.title || (old && old.title) || '', company: item.company || (old && old.company) || '', city: item.city || (old && old.city) || '', firstSeen: old ? old.firstSeen : today, lastSeen: today });
  }
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86400000).toISOString().slice(0, 10);
  const keepOld = (o) => !LANG_RE.test(fold(o.title)) && !NOT_RE.test(o.title || '') && (!o.skills || !o.skills.length || dataEvidence(o.title, o.skills));
  for (const old of prev.items || []) if (!found.has(old.url) && (old.lastSeen || old.firstSeen || '') >= cutoff && keepOld(old)) merged.push(old);
  // The same offer posted for several cities becomes one row ("Kraków +6").
  const byKey = new Map(), deduped = [];
  for (const it of merged) {
    const key = fold(it.title) + '|' + fold(it.company);
    const first = byKey.get(key);
    if (!first) { byKey.set(key, { item: it, extra: 0 }); deduped.push(it); continue; }
    first.extra++; first.item.city = String(first.item.city).replace(/ \+\d+$/, '') + ' +' + first.extra;
    if ((it.firstSeen || '') < (first.item.firstSeen || '')) first.item.firstSeen = it.firstSeen;
  }
  merged.length = 0; merged.push(...deduped);
  merged.sort((a, b) => (b.firstSeen || '').localeCompare(a.firstSeen || '') || (b.lastSeen || '').localeCompare(a.lastSeen || ''));
  const out = { updatedAt: new Date().toISOString(), region: 'All of Poland + remote', source: 'justjoin.it', items: merged.slice(0, MAX_ITEMS) };
  await writeFile(OUT, JSON.stringify(out, null, 1));
  const fresh = merged.filter((i) => i.firstSeen === today).length;
  console.log(`Saved ${out.items.length} openings (${fresh} new today).`);
}

if (process.argv[2] === '--test') {
  // Used by the local tests: node scripts/refresh-jobs.mjs --test <html-file>
  const html = await readFile(process.argv[3], 'utf8');
  const slugs = [...new Set([...html.matchAll(/\/job-offer\/([a-z0-9][a-z0-9-]{6,250})/g)].map((m) => m[1]))];
  for (const slug of slugs) {
    const info = fromJson(html, slug) || fromAnchor(html, slug) || fromSlug(slug); info.skills = info.skills || [];
    console.log(JSON.stringify({ slug, how: fromJson(html, slug) ? 'json' : fromAnchor(html, slug) ? 'card' : 'slug', title: info.title, company: info.company, city: info.city, mode: normMode(info.mode), role: classify(info.title, info.skills), skip: relevant(process.argv[4] || 'sql', slug, info) || null }));
  }
} else {
  await main();
}
