// ---------- Router, events, Lab engine, AI actions ----------
function parseRoute() {
  const h = (location.hash || '').slice(1) || 'home';
  if (h.startsWith('project-')) return { view: 'project', arg: h.slice(8) };
  return { view: NAV.some((n) => n[0] === h) ? h : 'home' };
}
function render() {
  const r = parseRoute(); const main = $('#main'); const top = main.scrollTop;
  renderRail(r.view);
  const V = { home: viewHome, roadmap: viewRoadmap, lab: viewLab, projects: viewProjects, coach: viewCoach, jobs: viewJobs, opensource: viewOpenSource, portfolio: viewPortfolio, toolkit: viewToolkit, profile: viewProfile };
  main.innerHTML = r.view === 'project' ? viewProject(r.arg) : V[r.view]();
  main.scrollTop = top;
  afterRender(r.view);
}
let lastView = null;
function afterRender(view) {
  if (view === 'lab') { const ed = $('#ed'); if (ed) { ed.addEventListener('keydown', editorKeys); ed.addEventListener('input', () => setDraft(ui.labEx, ed.value)); } ensureSql().catch(() => {}); }
  if (view === 'coach') { const m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight; const ci = $('#coachIn'); if (ci) { ci.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); coachSend(); } }); ci.addEventListener('input', () => { ui.coachDraft = ci.value; }); } }
  if (view === 'portfolio') updatePreview();
  if (view === 'roadmap' && ui.scrollWeek) { const el = $('#week-' + ui.scrollWeek); ui.scrollWeek = null; if (el) el.scrollIntoView({ block: 'start' }); }
  if (view !== lastView && view !== 'project') $('#main').scrollTop = 0;
  lastView = view;
}
window.addEventListener('hashchange', () => { $('#main').scrollTop = 0; render(); });

function setPath(path, value) {
  const parts = path.split('.'); const doc = parts.shift(); let o = S[doc];
  for (let i = 0; i < parts.length - 1; i++) { if (!o[parts[i]] || typeof o[parts[i]] !== 'object') o[parts[i]] = {}; o = o[parts[i]]; }
  o[parts[parts.length - 1]] = value; save(doc);
}
let previewTimer = null;
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.dataset.bind) {
    let v = t.type === 'number' ? Number(t.value) || 0 : t.value;
    setPath(t.dataset.bind, v);
    if (t.dataset.bind === 'profile.name') renderRail(parseRoute().view);
    if (t.dataset.preview) { clearTimeout(previewTimer); previewTimer = setTimeout(updatePreview, 250); }
  }
  if (t.dataset.obind) {
    const c = S.oss.contribs.find((x) => x.id === t.dataset.id); if (c) { c[t.dataset.obind] = t.value; c.updated = Date.now(); save('oss'); }
  }
  if (t.dataset.jbind) {
    const j = S.jobs.list.find((x) => x.id === t.dataset.id); if (!j) return;
    j[t.dataset.jbind] = t.value; j.updated = Date.now(); save('jobs');
  }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.bind && t.dataset.render) render();
  if (t.dataset.obind === 'status') render();
  if (t.dataset.jbind === 'status') {
    const j = S.jobs.list.find((x) => x.id === t.dataset.id); if (!j) return;
    j.status = t.value; j.updated = Date.now();
    if (t.value === 'applied' && !j.applied) { j.applied = today(); if (!j.followUp) j.followUp = addDays(today(), 7); }
    save('jobs'); render();
  }
});

// ----- Click actions -----
const ACTIONS = {
  'toggle-task': (el) => { S.progress.roadmap[el.dataset.id] = el.checked; save('progress'); render(); },
  'week-open': (el, e) => { ui.scrollWeek = el.dataset.w; if (location.hash === '#roadmap') { e.preventDefault(); render(); } },
  'lab-go': (el) => { ui.labEx = el.dataset.id; location.hash = 'lab'; },
  'lab-select': (el) => { ui.labEx = el.dataset.id; render(); $('#main').scrollTop = 0; },
  'lab-run': () => labRun(),
  'lab-check': () => labCheck(),
  'lab-hint': () => { ui.hint[ui.labEx] = true; render(); },
  'lab-solution': async () => { if (await confirmBox('Show the solution?', 'Try for a few more minutes first: struggling a bit is how it sticks. You can still solve it yourself afterwards.', 'Show solution')) { ui.revealed[ui.labEx] = true; render(); } },
  'lab-ask': () => labAsk(),
  'gen-ex': () => genExercises(),
  'gen-del': async (el) => { if (await confirmBox('Remove this exercise?', 'It will be deleted from "Made for you".', 'Remove', true)) { S.practice.generated = S.practice.generated.filter((e) => e.id !== el.dataset.id); save('practice'); ui.labEx = 'generate'; render(); } },
  'feed-add': (el) => feedAdd(el.dataset.url),
  'feed-hide': (el) => { S.jobs.dismissed = (S.jobs.dismissed || []).concat(el.dataset.id).slice(-500); save('jobs'); render(); },
  'oss-add': () => { S.oss.contribs.push({ id: uid(), repo: '', title: '', status: 'exploring', issue: '', pr: '', notes: '', updated: Date.now() }); save('oss'); render(); },
  'oss-del': async (el) => { if (await confirmBox('Delete this contribution?', 'It will be removed from your list and portfolio.', 'Delete', true)) { S.oss.contribs = S.oss.contribs.filter((c) => c.id !== el.dataset.id); save('oss'); render(); } },
  'oss-track': (el) => { const it = ossFeedItems().find((i) => i.url === el.dataset.url); if (!it) return; S.oss.contribs.push({ id: uid(), repo: it.repo, title: it.title, status: 'exploring', issue: it.url, pr: '', notes: '', updated: Date.now() }); save('oss'); toast('Added to My contributions'); render(); },
  'oss-hide': (el) => { S.oss.dismissed = (S.oss.dismissed || []).concat(el.dataset.id).slice(-500); save('oss'); render(); },
  'oss-ai': (el) => ossAi(el.dataset.kind),
  'feed-all': () => { ui.feedAll = !ui.feedAll; render(); },
  'lab-reset-db': () => { if (SQLmod) { sandboxDb = freshDb(); ui.labOut.sandbox = '<div class="verdict info">Database reset to the original data.</div>'; render(); } },
  'lab-save-script': () => { const name = ($('#scriptName').value || '').trim() || 'Script ' + ((S.scripts.list || []).length + 1); S.scripts.list.unshift({ id: uid(), name, sql: $('#ed').value, at: today() }); save('scripts'); toast('Script saved'); render(); },
  'lab-load-script': (el) => { const s = S.scripts.list.find((x) => x.id === el.dataset.id); if (s) { setDraft('sandbox', s.sql); render(); } },
  'lab-del-script': async (el) => { if (await confirmBox('Delete this script?', 'This cannot be undone.', 'Delete', true)) { S.scripts.list = S.scripts.list.filter((x) => x.id !== el.dataset.id); save('scripts'); render(); } },
  'ins': (el) => { const ed = $('#ed'); if (!ed) return; const a = ed.selectionStart, b = ed.selectionEnd; ed.value = ed.value.slice(0, a) + el.dataset.text + ed.value.slice(b); ed.focus(); ed.selectionStart = ed.selectionEnd = a + el.dataset.text.length; setDraft(ui.labEx, ed.value); },
  'step-toggle': (el, e) => { e.stopPropagation(); const st = S.progress.steps[el.dataset.pid] || (S.progress.steps[el.dataset.pid] = {}); st[el.dataset.i] = el.checked; save('progress'); render(); },
  'copy': (el) => copyText(el.dataset.text, el.dataset.label),
  'proj-review': (el) => projReview(el.dataset.pid),
  'proj-delete': async (el) => { if (await confirmBox('Delete this tailored project?', 'Its steps, notes and links will be removed.', 'Delete', true)) { S.projects.custom = S.projects.custom.filter((p) => p.id !== el.dataset.pid); save('projects'); location.hash = 'projects'; } },
  'gen-project': () => genProject($('#genAd').value, $('#genCompany').value, null),
  'coach-mode': (el) => { ui.coachMode = el.dataset.mode; ui.coachErr = null; render(); },
  'coach-new': async () => { if (await confirmBox('Start a new conversation?', 'The current conversation in this mode will be cleared.', 'Start new')) { S.coach.threads[ui.coachMode] = []; save('coach'); ui.coachErr = null; render(); } },
  'coach-starter': (el) => { const t = el.dataset.text; if (t.endsWith('\n\n')) { ui.coachDraft = t; render(); const ci = $('#coachIn'); ci.focus(); ci.selectionStart = ci.value.length; } else coachSend(t); },
  'coach-send': () => coachSend(),
  'coach-start': (el) => { ui.coachMode = el.dataset.mode; location.hash = 'coach'; },
  'coach-practice-project': (el) => { const p = findProject(el.dataset.pid); ui.coachMode = 'mock_hr'; location.hash = 'coach'; setTimeout(() => coachSend(`Interview me about my portfolio project "${p.title}" (${p.summary}). Ask one question at a time, like a real interviewer would, and give feedback on how I explain it. Talking points I want to cover: ${p.talk.join('; ')}.`), 50); },
  'practice-q': (el) => { ui.coachMode = el.dataset.cat === 'Behavioral' ? 'mock_hr' : 'mock_sql'; location.hash = 'coach'; setTimeout(() => coachSend(`Ask me this interview question, wait for my answer, then give feedback and a model answer: "${el.dataset.q}"`), 50); },
  'job-add': () => { ui.addingJob = true; render(); $('#nj-company') && $('#nj-company').focus(); },
  'job-cancel-new': () => { ui.addingJob = false; render(); },
  'job-save-new': () => {
    const g = (k) => ($('#nj-' + k) || {}).value || '';
    const j = { id: uid(), company: g('company').trim(), role: g('role').trim(), city: g('city'), link: g('link'), salary: g('salary'), status: g('status') || 'saved', applied: g('applied'), followUp: g('followUp'), ad: g('ad'), notes: g('notes'), updated: Date.now() };
    if (!j.company && !j.role) { toast('Add at least a company or role'); return; }
    if (j.status !== 'saved' && !j.applied) j.applied = today();
    if (j.applied && !j.followUp && j.status === 'applied') j.followUp = addDays(j.applied, 7);
    S.jobs.list.push(j); save('jobs'); ui.addingJob = false; ui.openJob = j.id; render();
  },
  'job-open': (el) => { ui.openJob = ui.openJob === el.dataset.id ? null : el.dataset.id; render(); },
  'job-del': async (el) => { if (await confirmBox('Delete this job?', 'The ad text, notes and analysis will be removed.', 'Delete', true)) { S.jobs.list = S.jobs.list.filter((j) => j.id !== el.dataset.id); save('jobs'); render(); } },
  'job-filter': (el) => { ui.jobFilter = el.dataset.st && ui.jobFilter !== el.dataset.st ? el.dataset.st : null; render(); },
  'job-analyze': (el) => jobAnalyze(el.dataset.id),
  'job-gen': (el) => { const j = S.jobs.list.find((x) => x.id === el.dataset.id); if (j) genProject(j.ad, j.company, j); },
  'jobs-csv': () => {
    const cols = ['company', 'role', 'city', 'status', 'applied', 'followUp', 'salary', 'link', 'notes'];
    const q = (v) => '"' + String(v ?? '').replace(/"/g, '""').replace(/\n/g, ' ') + '"';
    copyText([cols.join(',')].concat(S.jobs.list.map((j) => cols.map((c) => q(c === 'status' ? (STATUSES.find((s) => s.id === j.status) || {}).name : j[c])).join(','))).join('\n'), 'CSV');
  },
  'pf-accent': (el) => { S.portfolio.accent = el.dataset.c; save('portfolio'); render(); },
  'pf-include': (el) => { S.portfolio.include[el.dataset.pid] = el.checked; save('portfolio'); updatePreview(); },
  'pf-copy': () => copyText(portfolioHtml(), 'Portfolio HTML'),
  'pf-ai': () => portfolioAi(),
  'role-toggle': (el) => { const r = el.dataset.role, roles = S.profile.roles; S.profile.roles = roles.includes(r) ? roles.filter((x) => x !== r) : roles.concat(r); save('profile'); render(); },
  'export': () => { const data = {}; DOC_KEYS.forEach((k) => data[k] = S[k]); copyText(JSON.stringify({ app: 'query-path', v: 1, data }), 'Backup'); },
  'import': async () => {
    let parsed; try { parsed = JSON.parse($('#importTa').value); } catch (e) { toast('That does not look like a backup'); return; }
    if (!parsed || parsed.app !== 'query-path' || !parsed.data) { toast('That does not look like a Query Path backup'); return; }
    if (!(await confirmBox('Restore this backup?', 'It replaces everything currently saved here.', 'Restore'))) return;
    DOC_KEYS.forEach((k) => { if (parsed.data[k]) { S[k] = mergeDefaults(DEFAULTS[k], parsed.data[k]); save(k); } }); toast('Backup restored'); render();
  },
  'reset-all': async () => {
    if (!(await confirmBox('Reset everything?', 'All progress, projects, jobs, coach conversations and scripts will be deleted. Copy a backup first if unsure.', 'Reset everything', true))) return;
    DOC_KEYS.forEach((k) => { S[k] = clone(DEFAULTS[k]); if (k === 'profile') S.profile.startDate = today(); save(k); }); lsSet('drafts', {}); toast('Everything reset'); location.hash = 'home'; render();
  }
};
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACTIONS[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'BUTTON' || (el.tagName === 'A' && el.dataset.act !== 'week-open')) e.preventDefault();
  fn(el, e);
});

// ----- SQL engine (SQLite compiled to JavaScript, runs in the browser) -----
let SQLmod = null, baseBytes = null, sandboxDb = null, sqlLoading = null; const refCache = {};
function ensureSql() {
  if (baseBytes) return Promise.resolve();
  if (!sqlLoading) sqlLoading = (async () => {
    for (let i = 0; i < 100 && typeof window.initSqlJs !== 'function'; i++) await new Promise((r) => setTimeout(r, 100));
    if (typeof window.initSqlJs !== 'function') throw new Error('The SQL engine did not load. Check your connection and reload the page.');
    SQLmod = await window.initSqlJs();
    const db = new SQLmod.Database(); db.exec(buildSeedSQL()); baseBytes = db.export(); db.close();
    sandboxDb = freshDb();
  })();
  sqlLoading.catch(() => { sqlLoading = null; });
  return sqlLoading;
}
function freshDb() { const d = new SQLmod.Database(baseBytes); d.run('PRAGMA foreign_keys = ON;'); return d; }
function lastResult(res) { return res.length ? res[res.length - 1] : null; }
function tableHtml(r, limit) {
  if (!r) return '';
  const rows = r.values.slice(0, limit || 200);
  return `<div class="results"><table class="t"><thead><tr>${r.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((v) => v === null ? '<td class="null">NULL</td>' : typeof v === 'number' ? `<td class="num">${esc(Number.isInteger(v) ? v : Math.round(v * 10000) / 10000)}</td>` : `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function friendlyErr(msg) {
  const m = String(msg || '');
  let tip = '';
  if (/no such column/i.test(m)) tip = 'Check the column name and which table it belongs to (see the schema on the right). With joins, prefix it: o.order_date.';
  else if (/no such table/i.test(m)) tip = 'Check the table name in the schema panel.';
  else if (/syntax error/i.test(m)) tip = 'Look just before the word in quotes: a missing comma, a missing closing bracket, or a keyword in the wrong order (SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY).';
  else if (/ambiguous/i.test(m)) tip = 'Two joined tables have a column with this name. Prefix it with the table alias.';
  else if (/FOREIGN KEY/i.test(m)) tip = 'Another table still references these rows. Remove or change the child rows first.';
  else if (/misuse of aggregate/i.test(m)) tip = 'Aggregates (SUM, COUNT…) cannot go in WHERE. Use HAVING, or compute them in a subquery first.';
  return `<div class="verdict no"><b>Error:</b> ${esc(m)}${tip ? `<div class="small" style="margin-top:4px;font-weight:400">${esc(tip)}</div>` : ''}</div>`;
}
function showOut(html) { ui.labOut[ui.labEx] = html; const o = $('#labOut'); if (o) o.innerHTML = html; }
async function labRun() {
  const ed = $('#ed'); if (!ed) return; const sql = ed.value; setDraft(ui.labEx, sql);
  showOut('<div class="verdict info">Loading the practice database…</div>');
  try { await ensureSql(); } catch (e) { showOut(friendlyErr(e.message)); return; }
  const ex = exById(ui.labEx);
  const db = ui.labEx === 'sandbox' ? sandboxDb : freshDb();
  const t0 = performance.now();
  try {
    const res = db.exec(sql); const ms = Math.round(performance.now() - t0); const r = lastResult(res);
    if (r) showOut(`<div class="row between small muted" style="margin-bottom:6px"><span>${r.values.length} row${r.values.length === 1 ? '' : 's'}${r.values.length > 200 ? ' (showing 200)' : ''} · ${ms} ms${res.length > 1 ? ` · showing the last of ${res.length} result sets` : ''}</span></div>${tableHtml(r)}`);
    else if (ex && ex.type === 'dml') { const v = lastResult(db.exec(ex.verify)); showOut(`<div class="verdict info">Statements ran (${db.getRowsModified()} row${db.getRowsModified() === 1 ? '' : 's'} changed by the last one). This is what the checker will look at:</div>${tableHtml(v, 50)}`); }
    else showOut(`<div class="verdict info">Done. ${db.getRowsModified()} row${db.getRowsModified() === 1 ? '' : 's'} changed by the last statement. ${ms} ms</div>`);
  } catch (e) { showOut(friendlyErr(e.message)); }
  if (db !== sandboxDb) db.close();
}
function normCell(v) {
  if (v === null || v === undefined) return '∅';
  if (typeof v === 'number') return (Math.round(v * 100) / 100).toFixed(2);
  if (/^-?\d+(\.\d+)?$/.test(v)) return (Math.round(Number(v) * 100) / 100).toFixed(2);
  return String(v).trim();
}
function rowsKey(r) { return (r ? r.values : []).map((row) => row.map(normCell).join('\u0001')); }
function refResult(ex) {
  if (refCache[ex.id]) return refCache[ex.id];
  const db = freshDb(); let r;
  if (ex.type === 'dml') { db.exec(ex.solution); r = lastResult(db.exec(ex.verify)); } else r = lastResult(db.exec(ex.solution));
  db.close(); return (refCache[ex.id] = r);
}
async function labCheck() {
  const ex = exById(ui.labEx), ed = $('#ed'); if (!ex || !ed) return;
  const sql = ed.value; setDraft(ex.id, sql);
  showOut('<div class="verdict info">Checking…</div>');
  try { await ensureSql(); } catch (e) { showOut(friendlyErr(e.message)); return; }
  const expected = refResult(ex); const db = freshDb(); let got;
  try {
    if (ex.type === 'dml') { db.exec(sql); got = lastResult(db.exec(ex.verify)); }
    else got = lastResult(db.exec(sql));
  } catch (e) { db.close(); showOut(friendlyErr(e.message)); return; }
  db.close();
  const ecols = expected ? expected.columns.length : 0, gcols = got ? got.columns.length : 0;
  const ek = rowsKey(expected), gk = rowsKey(got);
  let verdict, ok = false;
  if (!got && ex.type !== 'dml') verdict = 'Your SQL did not return any result set. The task needs a SELECT.';
  else if (gcols !== ecols) verdict = `Expected ${ecols} column${ecols === 1 ? '' : 's'}, your query returns ${gcols}. Check which columns the task asks for.`;
  else if (gk.length !== ek.length) verdict = `Expected ${ek.length} row${ek.length === 1 ? '' : 's'}, your query returns ${gk.length}. Check your filters${ex.topic === 'joins' ? ' and join type' : ''}.`;
  else {
    const same = ex.ordered ? gk.every((k, i) => k === ek[i]) : [...gk].sort().join('\n') === [...ek].sort().join('\n');
    if (same) ok = true;
    else if (ex.ordered && [...gk].sort().join('\n') === [...ek].sort().join('\n')) verdict = 'The rows are right but in the wrong order. Look at the ORDER BY the task asks for.';
    else { const mism = gk.findIndex((k) => !ek.includes(k)); verdict = `Right shape, but some values differ${mism >= 0 ? ` (for example your row ${mism + 1})` : ''}. Check your conditions, rounding and which rows are included.`; }
  }
  if (ok) {
    const first = !S.progress.solved[ex.id];
    S.progress.solved[ex.id] = { at: today(), sql }; save('progress');
    const next = EXERCISES.find((e) => !S.progress.solved[e.id]);
    ui.labOut[ex.id] = `<div class="verdict ok">Correct${first ? '. Nice work.' : ' again.'} ${ex.tsql ? '' : ''}</div>
      <div class="card tight flat"><p class="small"><b>In SQL Server:</b> ${esc(ex.tsql)}</p></div>${tableHtml(got, 50)}
      ${next ? `<div class="row" style="margin-top:8px"><button class="btn primary" data-act="lab-select" data-id="${next.id}">Next: ${esc(next.title)}</button></div>` : '<div class="verdict ok">That was the last unsolved exercise. Every Lab exercise is done.</div>'}`;
    render();
  } else {
    S.practice.mistakes[ex.id] = (S.practice.mistakes[ex.id] || 0) + 1; save('practice');
    showOut(`<div class="verdict no">${esc(verdict)}</div>${got ? `<p class="small muted" style="margin:8px 0 4px">Your result:</p>${tableHtml(got, 30)}` : ''}`);
  }
}
function editorKeys(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); labRun(); return; }
  if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); const t = e.target, a = t.selectionStart; t.value = t.value.slice(0, a) + '  ' + t.value.slice(t.selectionEnd); t.selectionStart = t.selectionEnd = a + 2; setDraft(ui.labEx, t.value); }
}

// ----- AI actions -----
const DB_FACTS = `TABLES (SQLite):
${SCHEMA_DOC.map((t) => `${t.t}(${t.cols.map((c) => c[0] + ' ' + c[1]).join(', ')})`).join('\n')}
FACTS: 304 customers (ids 1-304; 301-304 are duplicate sign-ups that share an email with an earlier customer); cities: Warszawa, Kraków, Wrocław, Gdańsk, Poznań, Łódź, Katowice, Lublin, Szczecin, Rzeszów; phone is NULL for some. 73 customers never ordered. 1,600 orders, order_id 1001-2600, order_date 2024-01-01 to 2026-10-31 stored as 'YYYY-MM-DD' text; status in ('delivered','shipped','cancelled','returned'); channel in ('web','mobile_app','marketplace'). order_items has quantity and unit_price (sometimes 10% below list price). 41 products in 5 categories (Books, Coffee & Tea, Board Games, Stationery, Electronics); 4 inactive products were never ordered. 20 employees in 5 departments (Management, Sales, Customer Support, Warehouse, IT & Data) with a manager_id hierarchy; salary is monthly PLN. Dates are text: use strftime(), julianday(), date().`;
function validateGen(list) {
  const good = [], bad = [];
  for (const ex of list) {
    if (!ex || !ex.title || !ex.prompt || !ex.solution) continue;
    const sql = String(ex.solution).replace(/--.*$/gm, '').trim();
    if (!/^(with|select)\b/i.test(sql) || /\b(insert|update|delete|drop|alter|create|pragma|attach)\b/i.test(sql)) { bad.push({ ex, error: 'The solution must be one read-only SELECT statement.' }); continue; }
    const db = freshDb();
    try {
      const res = db.exec(sql);
      if (res.length === 0) throw new Error('Returned 0 rows; it needs 1-200 rows.');
      if (res.length > 1) throw new Error('Contains more than one statement.');
      const n = res[0].values.length; if (n > 200) throw new Error('Returned ' + n + ' rows; it needs 1-200 rows.');
      good.push(ex);
    } catch (e) { bad.push({ ex, error: String(e.message) }); }
    finally { db.close(); }
  }
  return { good, bad };
}
function feedAdd(url) {
  const it = feedItems().find((i) => i.url === url); if (!it) return;
  const j = { id: uid(), company: it.company, role: it.title, city: [it.city, it.mode && it.mode !== 'unknown' ? it.mode : ''].filter(Boolean).join(', '), link: it.url, salary: '', status: 'saved', applied: '', followUp: '',
    ad: `${it.summary}\n\n(Found by the daily job refresh. Open the link and paste the full ad here before it disappears.)`, notes: '', updated: Date.now() };
  S.jobs.list.push(j); save('jobs'); toast('Added to your tracker'); render();
}

function updatePreview() { const f = $('#pfPrev'); if (f) f.srcdoc = portfolioHtml(); }

// ----- Boot -----
