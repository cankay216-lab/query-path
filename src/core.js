// ---------- Core: helpers, state, saving, Claude ----------
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toLocaleDateString('sv-SE');
const addDays = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toLocaleDateString('sv-SE'); };
const fmtDate = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—';
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const clone = (o) => JSON.parse(JSON.stringify(o));
const safeUrl = (u) => /^https?:\/\//i.test(String(u || '').trim()) ? String(u).trim() : '';

const DEFAULTS = {
  profile: { ai: 'claude', name: '', city: '', roles: [], english: 'B2', hours: 15, startDate: '', background: DEFAULT_BACKGROUND, skills: 'SQL, T-SQL, SQL Server, HTML, CSS, JavaScript, Svelte, Git', cv: '', github: '', linkedin: '', email: '' },
  progress: { roadmap: {}, solved: {}, steps: {}, notes: {}, links: {} },
  projects: { custom: [] },
  jobs: { list: [], dismissed: [] },
  practice: { generated: [], mistakes: {} },
  oss: { contribs: [], dismissed: [] },
  meta: { lastBackup: '', feedVisit: '', prevFeedVisit: '' },
  coach: { threads: { general: [], mock_sql: [], mock_hr: [], cv: [] } },
  portfolio: { headline: '', about: '', accent: '#2443c9', include: {}, blurbs: {} },
  scripts: { list: [] }
};
const DOC_KEYS = Object.keys(DEFAULTS);
const S = {};
const ui = { labEx: null, labOut: {}, revealed: {}, hint: {}, labAi: {}, reviewOut: {}, openJob: null, jobFilter: null, addingJob: false, coachMode: 'general', busy: {}, pfTab: 'edit' };

function mergeDefaults(def, val) {
  if (!val || typeof val !== 'object' || Array.isArray(def)) return val ?? clone(def);
  const out = clone(def);
  for (const k of Object.keys(val)) out[k] = (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k])) ? mergeDefaults(def[k], val[k]) : val[k];
  return out;
}
function lsGet(k) { try { return JSON.parse(localStorage.getItem('qp:' + k)); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem('qp:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }

function loadLocal() {
  for (const k of DOC_KEYS) S[k] = mergeDefaults(DEFAULTS[k], lsGet(k));
  if (!S.profile.startDate) S.profile.startDate = today();
  const u = lsGet('ui'); if (u && u.labEx) ui.labEx = u.labEx;
}

// ----- Saving: everything stays on this device (plus backup files she downloads) -----
let storageOk = true;
try { localStorage.setItem('qp:test', '1'); localStorage.removeItem('qp:test'); } catch (e) { storageOk = false; }
function setSaveState() {
  const el = $('#saveState'); if (!el) return;
  if (!storageOk) { el.className = 'save busy'; el.innerHTML = '<i></i>Not saving: private mode?'; return; }
  el.className = 'save cloud'; el.innerHTML = '<i></i>Saved on this device';
  const b = $('#backupState'); if (b) b.textContent = S.meta.lastBackup ? 'Last backup: ' + fmtDate(S.meta.lastBackup) : 'No backup yet';
}
function save(k) { S[k]._t = Date.now(); lsSet(k, S[k]); if (k === 'meta') setSaveState(); }

// ----- AI hand-off: open her own free Claude or ChatGPT account with the full prompt -----
const AI_SITES = {
  claude: { name: 'Claude', url: (q) => 'https://claude.ai/new?q=' + encodeURIComponent(q), home: 'https://claude.ai/new' },
  chatgpt: { name: 'ChatGPT', url: (q) => 'https://chatgpt.com/?q=' + encodeURIComponent(q), home: 'https://chatgpt.com/' }
};
async function openInAi(site, prompt) {
  const A = AI_SITES[site] || AI_SITES.claude; let copied = false;
  try { await navigator.clipboard.writeText(prompt); copied = true; } catch (e) { /* clipboard blocked */ }
  const full = A.url(prompt), url = full.length <= 7000 ? full : A.home;
  const w = window.open(url, '_blank'); if (w) w.opener = null;
  S.profile.ai = site; save('profile');
  if (url === A.home) toast(copied ? `Prompt copied. Paste it into ${A.name} with Ctrl+V (Cmd+V on a Mac) and send.` : `Opened ${A.name}. Copy the prompt with the Copy button and paste it there.`, 6000);
  else toast(copied ? `Opened ${A.name}. If the message box is empty, paste with Ctrl+V.` : `Opened ${A.name}.`, 4500);
}
function aiModal(o) {
  const pref = S.profile.ai || 'claude';
  const d = document.createElement('div'); d.className = 'dialog';
  d.innerHTML = `<div class="card wide" role="dialog" aria-modal="true" aria-labelledby="aiT">
    <div class="row between"><h3 id="aiT">${esc(o.title)}</h3><button class="btn sm ghost" data-x="close">Close</button></div>
    <p class="muted small">${esc(o.intro || 'This opens a new chat in your own free AI account with everything already written for it: your profile, your progress and the task. Then just keep the conversation going there.')}</p>
    <div class="row"><button class="btn ${pref === 'claude' ? 'primary' : ''}" data-ai="claude">Open in Claude</button><button class="btn ${pref === 'chatgpt' ? 'primary' : ''}" data-ai="chatgpt">Open in ChatGPT</button><button class="btn ghost" data-x="copy">Copy prompt</button></div>
    <details><summary class="small muted" style="cursor:pointer">See exactly what will be sent</summary><pre class="code" style="white-space:pre-wrap;max-height:220px;overflow:auto;margin-top:8px">${esc(o.prompt)}</pre></details>
    ${o.paste ? `<div class="stack" style="border-top:1px solid var(--line);padding-top:12px"><label class="f" for="aiPaste">${esc(o.paste.label)}</label><textarea id="aiPaste" placeholder="${esc(o.paste.placeholder || 'Paste the full answer here…')}" style="min-height:140px"></textarea><div class="row"><button class="btn primary" data-x="import">${esc(o.paste.button || 'Import')}</button></div><div id="aiMsg"></div></div>` : ''}
  </div>`;
  const close = () => { d.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  d.addEventListener('click', async (e) => {
    const ai = e.target.closest('[data-ai]'); if (ai) { openInAi(ai.dataset.ai, o.prompt); return; }
    const x = e.target.closest('[data-x]'); if (!x) return;
    if (x.dataset.x === 'close') close();
    else if (x.dataset.x === 'copy') copyText(o.prompt, 'Prompt');
    else if (x.dataset.x === 'import') {
      const text = ($('#aiPaste', d).value || '').trim(); const msg = $('#aiMsg', d);
      if (!text) { msg.innerHTML = '<div class="verdict no">Paste the AI\'s answer first.</div>'; return; }
      x.disabled = true; msg.innerHTML = '<div class="verdict info">Working…</div>';
      let res; try { res = await o.paste.onImport(text); } catch (err) { res = { error: String((err && err.message) || err) }; }
      x.disabled = false;
      if (res && res.ok) { close(); toast(res.message || 'Done', 4000); } else msg.innerHTML = `<div class="verdict no">${esc((res && res.error) || 'That did not work. Check you pasted the whole answer.')}</div>`;
    }
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(d); $('[data-ai="' + pref + '"]', d).focus();
}
function parseLooseJson(t) {
  const s = String(t || ''); const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a < 0 || b < 0) throw new Error('I could not find the { } part in that text. Copy the AI\'s whole answer and try again.');
  try { return JSON.parse(s.slice(a, b + 1)); } catch (e) { throw new Error('The answer looks cut off or changed. Ask the AI to "reply again with only the JSON" and paste that.'); }
}
const stripTags = (h) => String(h || '').replace(/<[^>]+>/g, '');

// ----- Small markdown renderer for coach answers (escapes everything first) -----
function md(src) {
  const blocks = [];
  let s = String(src || '').replace(/```[a-zA-Z]*\n?([\s\S]*?)```/g, (m, code) => { blocks.push(code.replace(/\n$/, '')); return '\n@@B' + (blocks.length - 1) + '@@\n'; });
  const inline = (t) => esc(t)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<i>$2</i>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const lines = s.split('\n'); const out = []; let list = null, para = [];
  const flushP = () => { if (para.length) { out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; } };
  const flushL = () => { if (list) { out.push(`<${list.t}>` + list.items.map((i) => '<li>' + inline(i) + '</li>').join('') + `</${list.t}>`); list = null; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    let m;
    if ((m = l.match(/^@@B(\d+)@@$/))) { flushP(); flushL(); out.push('<pre><code>' + esc(blocks[+m[1]]) + '</code></pre>'); continue; }
    if (!l.trim()) { flushP(); flushL(); continue; }
    if ((m = l.match(/^#{1,4}\s+(.*)/))) { flushP(); flushL(); out.push('<h3>' + inline(m[1]) + '</h3>'); continue; }
    if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { flushP(); if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { flushP(); if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = l.match(/^>\s?(.*)/))) { flushP(); flushL(); out.push('<blockquote>' + inline(m[1]) + '</blockquote>'); continue; }
    if (list && /^\s{2,}/.test(raw)) { list.items[list.items.length - 1] += ' ' + l.trim(); continue; }
    flushL(); para.push(l);
  }
  flushP(); flushL();
  return out.join('');
}

// ----- UI helpers -----
function toast(msg, ms) {
  const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), ms || 2400);
}
function confirmBox(title, text, okLabel, danger) {
  return new Promise((res) => {
    const d = document.createElement('div'); d.className = 'dialog';
    d.innerHTML = `<div class="card" role="dialog" aria-modal="true" aria-labelledby="dlgT"><h3 id="dlgT">${esc(title)}</h3><p class="muted">${esc(text)}</p><div class="row" style="justify-content:flex-end"><button class="btn" data-x="0">Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" data-x="1">${esc(okLabel || 'Confirm')}</button></div></div>`;
    const done = (v) => { d.remove(); res(v); };
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (b) done(b.dataset.x === '1'); else if (e.target === d) done(false); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') done(false); });
    document.body.appendChild(d); $('[data-x="1"]', d).focus();
  });
}
async function copyText(text, label) {
  try { await navigator.clipboard.writeText(text); toast((label || 'Text') + ' copied'); }
  catch (e) {
    const d = document.createElement('div'); d.className = 'dialog';
    d.innerHTML = `<div class="card"><h3>Copy this</h3><p class="muted small">Your browser blocked automatic copying. The text is selected: press Ctrl+C (or Cmd+C).</p><textarea id="cpyTa" style="min-height:200px">${esc(text)}</textarea><div class="row" style="justify-content:flex-end"><button class="btn primary" data-x>Done</button></div></div>`;
    d.addEventListener('click', (ev) => { if (ev.target.closest('[data-x]') || ev.target === d) d.remove(); });
    document.body.appendChild(d); const ta = $('#cpyTa', d); ta.focus(); ta.select();
  }
}

// ----- Derived numbers -----
function currentWeek() {
  const start = new Date((S.profile.startDate || today()) + 'T12:00:00');
  const diff = Math.floor((new Date(today() + 'T12:00:00') - start) / 86400000);
  return Math.min(12, Math.max(1, Math.floor(diff / 7) + 1));
}
function weekProgress(w) { const t = ROADMAP[w - 1].tasks; const d = t.filter((x) => S.progress.roadmap[x[0]]).length; return { done: d, total: t.length }; }
function allProjects() { return PROJECTS.concat(S.projects.custom || []); }
function findProject(id) { return allProjects().find((p) => p.id === id); }
function projProgress(p) { const st = S.progress.steps[p.id] || {}; const d = p.steps.filter((_, i) => st[i]).length; return { done: d, total: p.steps.length }; }
function allExercises() { return EXERCISES.concat((S.practice && S.practice.generated) || []); }
function solvedCount() { return EXERCISES.filter((e) => S.progress.solved[e.id]).length; }
function topicStats() { return TOPICS.map((t) => { const ex = EXERCISES.filter((e) => e.topic === t.id); return { ...t, total: ex.length, done: ex.filter((e) => S.progress.solved[e.id]).length }; }); }
function jobCounts() { const c = {}; STATUSES.forEach((s) => c[s.id] = 0); (S.jobs.list || []).forEach((j) => { c[j.status] = (c[j.status] || 0) + 1; }); return c; }
function sentCount() { return (S.jobs.list || []).filter((j) => j.status !== 'saved').length; }

function learnerContext() {
  const p = S.profile, wk = currentWeek(), c = jobCounts();
  const weak = topicStats().filter((t) => t.done < t.total).map((t) => `${t.name} ${t.done}/${t.total}`).join(', ') || 'all topics complete';
  const projs = allProjects().map((pr) => { const g = projProgress(pr); return `${pr.code} ${pr.title}: ${g.done}/${g.total} steps`; }).join('; ');
  return `ABOUT THE LEARNER
Name: ${p.name || '(not given)'} | Location: ${p.city || 'Poland'} | English: ${p.english} | Time available: about ${p.hours} h/week
Target roles: ${p.roles.length ? p.roles.join(', ') : 'not chosen yet (junior roles centred on SQL)'}
Background: ${p.background}
Skills: ${p.skills}

PROGRESS
12-week plan: week ${wk}, "${ROADMAP[wk - 1].title}" (${ROADMAP[wk - 1].goal})
SQL practice: ${solvedCount()}/${EXERCISES.length} built-in exercises solved. Unfinished topics: ${weak}. Extra generated exercises: ${(S.practice.generated || []).filter((e) => S.progress.solved[e.id]).length}/${(S.practice.generated || []).length} solved.
Exercises she got wrong at least once: ${allExercises().filter((e) => (S.practice.mistakes || {})[e.id]).map((e) => e.title + (S.progress.solved[e.id] ? ' (solved later)' : ' (still open)')).slice(-12).join(', ') || 'none yet'}
Portfolio projects: ${projs}
Open source: first-contribution guide ${Object.values(S.progress.steps.oss || {}).filter(Boolean).length}/9 steps; contributions: ${(S.oss.contribs || []).map((c) => `${c.repo || '?'} "${c.title || ''}" (${c.status})`).join(', ') || 'none yet'}
Job search: ${sentCount()} applications sent; HR screens ${c.screen}, technical ${c.tech}, final rounds ${c.final}, offers ${c.offer}, rejections ${c.rejected}`;
}
const COACH_BASE = `You are a warm, direct career coach and senior SQL Server mentor for a recent IT graduate in Poland looking for her first SQL-focused job. She studies with an app called Query Path (a 12-week plan, a SQL practice lab on a fictional Polish online-shop database, guided portfolio projects, a job tracker). You cannot see the app; the snapshot below is copied from it. You know the Polish IT job market (service centres in Kraków, Wrocław, Łódź, Warsaw; justjoin.it, No Fluff Jobs, pracuj.pl; UoP vs B2B contracts; the RODO clause on CVs) and you prefer SQL Server / T-SQL examples. Be encouraging but honest, concrete and brief. Reply in the language she writes in (Polish or English). Use short markdown: bullets, bold, code blocks for SQL. Never invent facts about specific companies.`;
