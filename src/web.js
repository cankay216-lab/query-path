// ---------- Website edition: AI hand-off, daily feeds, backups, install ----------

// ----- Prompts sent to her own AI account -----
function coachPrompt(mode, firstMessage) {
  const M = COACH_MODES[mode] || COACH_MODES.general;
  const cv = mode === 'cv' && S.profile.cv ? '\n\nHER SAVED CV TEXT:\n' + S.profile.cv.slice(0, 5000) : '';
  return `${COACH_BASE}\n${M.instr}\n\n${learnerContext()}${cv}\n\n--- Her first message ---\n${firstMessage}`;
}
function taskPrompt(task) { return `${COACH_BASE}\n\n${learnerContext()}\n\n${task}`; }
function coachInstructions() {
  const p = S.profile;
  return `${COACH_BASE}

ABOUT ME
${p.name ? 'Name: ' + p.name + '. ' : ''}Location: ${p.city || 'Poland'}. English: ${p.english}. Target roles: ${p.roles.length ? p.roles.join(', ') : 'junior roles centred on SQL'}.
Background: ${p.background}
Skills: ${p.skills}

HOW TO HELP ME
- SQL questions: teach with a small T-SQL example, then ask me one quick question to check I understood.
- Mock technical interview (when I ask): one question at a time; after each answer give a verdict, what was good, what was missing and a short model answer; after 8 questions summarise my weak topics.
- Behavioral interview: one question at a time, feedback with the STAR method, then a stronger version of my answer in my own voice.
- CV and cover letters: one page, projects above education, results-focused bullets, keywords from the ad, the RODO clause; give the top 3 changes and rewritten bullets.
- I will sometimes paste a "progress update" from my study app. Use it to tailor your advice.`;
}

// ----- Coach page -----
function viewCoach() {
  const pref = S.profile.ai || 'claude';
  return `<div class="page">
    <div class="head"><span class="eyebrow">Coach</span><h1>Your SQL mentor and career coach</h1>
      <p class="lede">The coach runs in your own free Claude or ChatGPT account. Each button opens a new chat that already knows your profile, your progress in this app and what you want to practise. Then you simply keep talking there.</p></div>
    <div class="card tight flat"><div class="row between"><span class="small"><b>Open chats in</b></span><div class="row">${Object.keys(AI_SITES).map((k) => `<button class="chip ${pref === k ? 'sel' : ''}" data-act="ai-pref" data-ai="${k}">${AI_SITES[k].name}</button>`).join('')}</div></div>
      <p class="small muted">Both have free plans. Free plans have message limits that reset after a few hours, which is enough for daily practice. Sign in to the one you choose once, in this browser.</p></div>
    <div class="grid g2">${Object.entries(COACH_MODES).map(([k, m]) => `<div class="card"><h3>${esc(m.name)}</h3><p class="muted small">${esc(m.intro)}</p>
      <div class="stack">${m.starters.map((s) => `<button class="btn sm" style="justify-content:flex-start;white-space:normal;text-align:left" data-act="coach-open" data-mode="${k}" data-text="${esc(s)}">${esc(s.split('\n')[0])}</button>`).join('')}</div></div>`).join('')}</div>
    <div class="card"><h3>Ask your own question</h3>
      <textarea id="coachIn" placeholder="e.g. I don't understand when to use HAVING instead of WHERE" aria-label="Your question">${esc(ui.coachDraft || '')}</textarea>
      <div class="row"><label class="small muted" for="coachMode">Mode</label><select id="coachMode" style="max-width:240px">${Object.entries(COACH_MODES).map(([k, m]) => `<option value="${k}" ${ui.coachMode === k ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select>
        <button class="btn primary" data-act="coach-own">Open with my question</button></div></div>
    <div class="card"><h3>Make it a permanent coach (optional)</h3>
      <p class="small muted">In Claude, create a Project and paste these as its instructions. In ChatGPT, use a Project or Settings → Personalization → Custom instructions. Then every chat there already knows you. Once a week, paste a progress update so its advice stays current.</p>
      <div class="row"><button class="btn" data-act="copy" data-text="${esc(coachInstructions())}" data-label="Coach instructions">Copy coach instructions</button><button class="btn" data-act="copy-progress">Copy progress update</button></div></div>
  </div>`;
}

// ----- AI actions (all open her own AI account; JSON answers can be pasted back) -----
function labAsk() {
  const ex = exById(ui.labEx), ed = $('#ed'); if (!ex || !ed) return;
  const out = $('#labOut') ? $('#labOut').innerText.slice(0, 1500) : '';
  aiModal({ title: 'Ask the coach about this exercise', prompt: taskPrompt(`She is working on a SQL exercise in her app's practice Lab (SQLite engine in the browser; she is learning for SQL Server).\n\n${DB_FACTS}\n\nEXERCISE: ${ex.title}: ${stripTags(ex.prompt)}\n\nHER CURRENT SQL:\n${ed.value}\n\nWHAT THE LAB SHOWS UNDER HER QUERY (result or error):\n${out}\n\nGive a short, encouraging hint that moves her one step forward. Point at the specific problem in her SQL if there is one. Do NOT write the full solution unless she asks for it in a later message. Max 150 words.`) });
}
function genExercises() {
  const topic = $('#genTopic').value, level = +$('#genLevel').value, count = +$('#genCount').value, focus = ($('#genFocus').value || '').trim();
  ui.genEx = { topic, level, count, focus };
  const T = TOPICS.find((t) => t.id === topic);
  const prompt = `You write SQL practice exercises for a junior preparing for SQL and data job interviews in Poland. They will be loaded into a practice app and checked automatically.\n\n${DB_FACTS}\n\nWrite ${count} NEW exercises. Topic: ${T ? T.name + ' (' + T.blurb + ')' : 'mixed review across joins, aggregation, subqueries/CTEs and window functions'}. Difficulty: ${['', 'easy', 'medium', 'hard'][level]}.${focus ? ' Extra focus she asked for: ' + focus + '.' : ''}\nDo not repeat these existing exercises: ${allExercises().map((e) => e.title).join('; ')}\n\nRules:\n- Realistic questions a manager, analyst or support engineer at this shop would ask.\n- Each is solvable with ONE read-only SELECT statement (CTEs and window functions allowed) that runs in SQLite.\n- The prompt names the exact output columns, any rounding (e.g. ROUND to 2 decimals), and, if order matters, the full ORDER BY including tie-breakers. Answers must not depend on today's date.\n- The result has between 1 and 200 rows.\n- hint: one sentence pointing at the technique, without giving the query.\n- tsql: one sentence on how the solution differs in SQL Server, or "Identical in SQL Server."\n\nReply with ONLY this JSON and nothing else:\n{"exercises":[{"title": "max 40 characters", "prompt": "...", "hint": "...", "solution": "...", "ordered": true, "tsql": "..."}]}`;
  aiModal({ title: 'Get new exercises from your AI', intro: '1. Open the chat and send the prompt. 2. Copy the whole answer it gives. 3. Paste it below. The app tests every solution on the practice database before adding it.', prompt,
    paste: { label: 'Paste the AI\'s full answer here', button: 'Test and add exercises', onImport: (text) => importExercises(text, T ? topic : 'mixed', level) } });
}
async function importExercises(text, topic, level) {
  const v = parseLooseJson(text);
  await ensureSql();
  const { good, bad } = validateGen(Array.isArray(v.exercises) ? v.exercises : []);
  if (!good.length) return { error: 'None of the solutions passed testing' + (bad.length ? ': ' + bad.slice(0, 3).map((b) => `"${b.ex.title}": ${b.error}`).join('; ') + '. Tell the AI these errors and ask it to fix the solutions, then paste its new answer.' : '. Ask the AI to reply again with only the JSON.') };
  const added = good.map((ex) => ({ id: 'g' + uid(), topic, level, gen: true, title: String(ex.title).slice(0, 60), prompt: String(ex.prompt), hint: String(ex.hint || 'Start by deciding which tables you need.'), solution: String(ex.solution), ordered: !!ex.ordered, tsql: String(ex.tsql || '') }));
  S.practice.generated = (S.practice.generated || []).concat(added).slice(-200); save('practice');
  ui.labEx = added[0].id; render();
  return { ok: true, message: `${added.length} new exercise${added.length === 1 ? '' : 's'} added under "Made for you"${bad.length ? `; ${bad.length} skipped because the solution failed testing` : ''}.` };
}
function projReview(pid) {
  const p = findProject(pid), text = (($('#revText') || {}).value || '').trim(), si = +(($('#revStep') || {}).value ?? -1);
  if (!text) { toast('Paste something to review first'); return; }
  const step = si >= 0 ? `Step ${si + 1}: ${p.steps[si].t}. Instructions: ${p.steps[si].d} Deliverable: ${p.steps[si].out}` : 'The project overall.';
  aiModal({ title: 'Get a review of your work', prompt: taskPrompt(`She is building the portfolio project "${p.title}": ${p.summary}\nCURRENT STEP: ${step}\n\nWHAT SHE WANTS REVIEWED:\n${text.slice(0, 6000)}\n\nReview it like a kind senior colleague doing a code review: **What works** (2-3 bullets), **Fix before publishing** (the most important issues, each with a concrete fix, with T-SQL where useful), **Nice to have** (max 2), **Interview angle** (one sentence on how to talk about this part). Under 350 words.`) });
}
function jobAnalyze(id) {
  const j = S.jobs.list.find((x) => x.id === id); if (!j) return;
  if (!(j.ad || '').trim()) { ui.jobErr = { id, msg: 'Paste the job ad text first, then analyze it.' }; render(); return; }
  ui.jobErr = null;
  aiModal({ title: 'Analyze this job ad', prompt: taskPrompt(`JOB AD (${j.company || 'company not given'}, ${j.role || ''}):\n${j.ad.slice(0, 6000)}\n\nAnalyze this ad for her. Markdown with these bold labels:\n**Fit**: strong / medium / stretch, and why in 2 sentences.\n**What they really want**: 4-5 bullets in plain words.\n**Gaps to close**: up to 4, each with the fastest way to close it.\n**Keywords for your CV**: a comma-separated list using the ad's wording.\n**Projects to highlight**: which of her projects to mention, and how.\n**Questions they may ask**: 5 likely interview questions.\nUnder 400 words.`),
    paste: { label: 'Optional: paste the analysis here to keep it with this job', button: 'Save analysis', onImport: (text) => { j.analysis = text.slice(0, 20000); j.updated = Date.now(); save('jobs'); render(); return { ok: true, message: 'Analysis saved with this job' }; } } });
}
function genProject(ad, company, job) {
  ad = (ad || '').trim(); company = (company || '').trim();
  const fail = (msg) => { if (job) ui.jobErr = { id: job.id, msg }; else ui.genErr = msg; render(); };
  if (ad.length < 80) { fail('Paste the full job ad first (at least a few lines with the requirements).'); return; }
  ui.genErr = null; if (job) ui.jobErr = null;
  aiModal({ title: 'Design a tailored project', intro: '1. Open the chat and send the prompt. 2. Copy the whole answer. 3. Paste it below and the project appears in your Projects, with steps you can tick off.',
    prompt: taskPrompt(`JOB AD${company ? ' at ' + company : ''}:\n${ad.slice(0, 6000)}\n\nDesign ONE small portfolio project tailored to this job that she can finish in one or two weekends with free tools (SQL Server Developer edition, SSMS, Power BI Desktop, GitHub; Svelte only if the ad values frontend). It must mirror the company's domain and the ad's tech stack, use public or generated data (never the company's private data), and give her something specific to mention in the application.\n\nReply with ONLY this JSON and nothing else:\n{"title": "max 60 characters", "summary": "2 sentences", "why": "why this impresses this employer, 2 sentences", "skills": ["4-7 short items"], "hours": "e.g. 8–12 h", "steps": [{"t": "short imperative title", "d": "2-3 sentences of concrete instructions", "out": "deliverable"}], "readme": ["5-8 README section titles"], "talk": ["3-4 interview talking points"], "pitch": "one sentence for her application"}`),
    paste: { label: 'Paste the AI\'s full answer here', button: 'Add project', onImport: (text) => importTailored(text, company, job) } });
}
function importTailored(text, company, job) {
  const v = parseLooseJson(text);
  if (!v || !v.title || !Array.isArray(v.steps) || !v.steps.length) return { error: 'The project is missing a title or steps. Ask the AI to reply again with the complete JSON.' };
  const n = (S.projects.custom || []).length + 1;
  const p = { id: 'c' + uid(), code: 'T' + n, title: String(v.title).slice(0, 80), tag: 'Tailored' + (company ? ' · ' + company : ''), role: (job && job.role) || 'This specific job', summary: String(v.summary || ''), why: String(v.why || '') + (v.pitch ? ' Pitch for your application: "' + String(v.pitch) + '"' : ''),
    skills: (Array.isArray(v.skills) ? v.skills : []).map(String).slice(0, 8), hours: String(v.hours || '8–12 h'), steps: v.steps.slice(0, 8).map((s) => ({ t: String(s.t || s.title || 'Step'), d: String(s.d || s.detail || ''), out: String(s.out || s.deliverable || '') })),
    readme: (Array.isArray(v.readme) ? v.readme : ['Overview', 'How to run', 'Results']).map(String), talk: (Array.isArray(v.talk) ? v.talk : []).map(String), company, jobId: job ? job.id : null };
  S.projects.custom.push(p); save('projects');
  if (job) { job.projectId = p.id; job.updated = Date.now(); save('jobs'); }
  setTimeout(() => { location.hash = 'project-' + p.id; }, 50);
  return { ok: true, message: 'Tailored project added' };
}
function portfolioAi() {
  const done = allProjects().filter((p) => projProgress(p).done > 0).map((p) => p.title).join(', ') || 'projects in progress: clinic database, Polish public data analysis, Svelte app';
  aiModal({ title: 'Write your portfolio intro', prompt: taskPrompt(`Projects she has worked on: ${done}\n\nWrite her portfolio intro. Reply with ONLY this JSON: {"headline": "max 70 characters, role-focused, e.g. Junior SQL Developer · SQL Server, T-SQL, Power BI", "about": "60-90 words, first person, warm and specific, mentions her frontend internship as a strength, no clichés like passionate or hard-working"}`),
    paste: { label: 'Paste the AI\'s answer here', button: 'Use this intro', onImport: (text) => { const v = parseLooseJson(text); if (!v.headline && !v.about) return { error: 'No headline or about text found in that answer.' }; if (v.headline) S.portfolio.headline = String(v.headline).slice(0, 120); if (v.about) S.portfolio.about = String(v.about).slice(0, 1500); save('portfolio'); render(); return { ok: true, message: 'Intro updated' }; } } });
}
function ossAi(kind) {
  const text = (($('#ossText') || {}).value || '').trim();
  if (!text) { toast('Paste the issue, code or PR description first'); return; }
  const task = {
    explain: 'She pasted a GitHub issue (maybe with code) from an open source project. Explain in plain words: what the problem is; which part of the codebase is likely involved; the skills needed; an honest difficulty rating for a first contribution (easy / medium / hard); and a step-by-step plan for the fix, including how to test it. If it is too hard for a first contribution, say so kindly and describe what kind of issue to look for instead. Under 350 words.',
    claim: 'Draft a short GitHub comment (3-5 sentences, friendly, professional English) asking to work on this issue. Show she understood it, outline the planned approach in one or two sentences, and ask one clarifying question if useful. No over-apologising and no "I am a beginner" disclaimers. Put the comment in a code block so she can copy it, then at most two short tips.',
    pr: 'She pasted a draft pull request description (maybe with the diff). Review it against open source norms: a clear title, a link to the issue ("Fixes #123"), what changed and why, how it was tested, small scope. List the top improvements, then give a rewritten version in a code block.'
  }[kind];
  aiModal({ title: { explain: 'Explain this issue', claim: 'Draft your comment', pr: 'Review your PR description' }[kind], prompt: taskPrompt(`${task}\n\nWHAT SHE PASTED:\n${text.slice(0, 6000)}`) });
}

// ----- Extra click actions -----
Object.assign(ACTIONS, {
  'ai-pref': (el) => { S.profile.ai = el.dataset.ai; save('profile'); render(); },
  'coach-open': (el) => {
    const mode = el.dataset.mode, text = el.dataset.text;
    if (text.endsWith('\n\n')) { ui.coachMode = mode; ui.coachDraft = text; render(); const ci = $('#coachIn'); if (ci) { ci.focus(); ci.selectionStart = ci.value.length; } toast('Paste your text after the first line, then press "Open with my question"', 4500); return; }
    aiModal({ title: COACH_MODES[mode].name, prompt: coachPrompt(mode, text) });
  },
  'coach-own': () => { const t = ($('#coachIn').value || '').trim(); if (!t) { toast('Write your question first'); return; } const mode = $('#coachMode').value; ui.coachMode = mode; ui.coachDraft = t; aiModal({ title: COACH_MODES[mode].name, prompt: coachPrompt(mode, t) }); },
  'coach-start': (el) => { const mode = el.dataset.mode; if (mode === 'mock_sql') aiModal({ title: COACH_MODES.mock_sql.name, prompt: coachPrompt('mock_sql', COACH_MODES.mock_sql.starters[0]) }); else { ui.coachMode = mode; location.hash = 'coach'; } },
  'copy-progress': () => copyText(`Progress update from my study app (${fmtDate(today())}):\n\n${learnerContext()}`, 'Progress update'),
  'practice-q': (el) => { const mode = el.dataset.cat === 'Behavioral' ? 'mock_hr' : 'mock_sql'; aiModal({ title: 'Practise this question', prompt: coachPrompt(mode, `Ask me this interview question, wait for my answer, then give feedback and a model answer: "${el.dataset.q}"`) }); },
  'coach-practice-project': (el) => { const p = findProject(el.dataset.pid); aiModal({ title: 'Practise explaining your project', prompt: coachPrompt('mock_hr', `Interview me about my portfolio project "${p.title}" (${p.summary}). Ask one question at a time, like a real interviewer, and give feedback on how I explain it. Talking points I want to cover: ${p.talk.join('; ')}.`) }); },
  'pf-download': () => downloadFile('index.html', portfolioHtml(), 'text/html'),
  'backup-download': () => { downloadFile(`query-path-backup-${today()}.json`, backupJson(), 'application/json'); S.meta.lastBackup = today(); save('meta'); render(); toast('Backup downloaded. Keep it somewhere safe, like Google Drive or email it to yourself.', 5000); },
  'backup-pick': () => { const f = $('#importFile'); if (f) f.click(); },
  'feed-role': (el) => { ui.feedRole = el.dataset.role || null; render(); },
  'install': async () => {
    if (deferredInstall) { deferredInstall.prompt(); try { await deferredInstall.userChoice; } catch (e) { /* dismissed */ } deferredInstall = null; updateInstallBtn(); }
    else { location.hash = 'profile'; setTimeout(() => { const el = $('#installHelp'); if (el) el.scrollIntoView({ block: 'center' }); }, 100); }
  }
});
ACTIONS['export'] = () => copyText(backupJson(), 'Backup');
function backupJson() { const data = {}; DOC_KEYS.forEach((k) => { data[k] = S[k]; }); return JSON.stringify({ app: 'query-path', v: 2, savedAt: new Date().toISOString(), data }); }
function downloadFile(name, content, type) {
  const blob = new Blob([content], { type }); const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
document.addEventListener('change', (e) => {
  if (e.target.id !== 'importFile' || !e.target.files || !e.target.files[0]) return;
  const r = new FileReader();
  r.onload = () => { const ta = $('#importTa'); if (ta) { ta.value = String(r.result || ''); ACTIONS['import'](); } };
  r.readAsText(e.target.files[0]); e.target.value = '';
});

// ----- Daily feeds (written by the GitHub Action into data/*.json) -----
const ROLE_GROUPS = [['Database', /database/i], ['Analyst & BI', /analyst|\bbi\b/i], ['Support', /support/i], ['Data engineer', /engineer/i], ['Trainee & graduate', /trainee|graduate|intern/i]];
function roleGroup(rt) { const g = ROLE_GROUPS.find(([, re]) => re.test(rt || '')); return g ? g[0] : 'Other'; }
function feedItems() {
  const seen = new Set(), dismissed = new Set(S.jobs.dismissed || []), tracked = new Set((S.jobs.list || []).map((j) => (j.link || '').trim()));
  const out = [];
  for (const run of (ui.feed || [])) for (const it of (Array.isArray(run.items) ? run.items : [])) {
    const url = safeUrl(it && it.url); if (!url || seen.has(url)) continue; seen.add(url);
    out.push({ title: String(it.title || 'Untitled role'), company: String(it.company || ''), city: String(it.city || ''), mode: String(it.mode || ''), summary: String(it.summary || ''), role_type: String(it.role_type || ''), firstSeen: String(it.firstSeen || ''), id: String(it.id || url), url });
  }
  return out.filter((i) => !dismissed.has(i.id) && !tracked.has(i.url)).sort((a, b) => (b.firstSeen > a.firstSeen ? 1 : b.firstSeen < a.firstSeen ? -1 : 0));
}
function isNewItem(i) { const prev = ui.feedVisitBaseline ?? S.meta.feedVisit ?? ''; return !!i.firstSeen && i.firstSeen > (prev || ''); }
function newFeedCount() { return feedItems().filter(isNewItem).length; }
function feedRow(i) {
  return `<div class="jobrow feedrow"><div class="who"><b>${esc(i.title)}</b><span class="small muted">${esc(i.company)}${i.city ? ' · ' + esc(i.city) : ''}${i.mode && i.mode !== 'unknown' ? ' · ' + esc(i.mode) : ''}</span></div>
    <span class="small muted">${isNewItem(i) ? '<span class="chip mark">New</span> ' : ''}${esc(i.summary)} ${i.role_type ? `<span class="chip acc">${esc(i.role_type)}</span>` : ''} ${i.firstSeen ? `<span class="chip">since ${esc(fmtDate(i.firstSeen))}</span>` : ''}</span>
    <span class="row"><a class="btn sm ghost" href="${esc(i.url)}" target="_blank" rel="noopener">Open</a><button class="btn sm primary" data-act="feed-add" data-url="${esc(i.url)}">Add to tracker</button><button class="btn sm ghost" data-act="feed-hide" data-id="${esc(i.id)}">Hide</button></span></div>`;
}
function feedSection() {
  const last = (ui.feed || [])[0];
  if (!last) {
    const msg = ui.feedState === 'error' ? 'Could not load the latest openings. Check your internet connection; the list comes back when you are online.'
      : ui.feedState === 'file' ? 'Openings appear when the app runs from its website address, not from a file on your computer.'
      : ui.feedState === 'ok' ? 'The daily job refresh has not run yet. It runs every morning; openings appear here after the first run.' : 'Loading openings…';
    return `<div class="card tight flat"><h3>New openings</h3><p class="small muted">${msg}</p></div>`;
  }
  const all = feedItems(), role = ui.feedRole, items = role ? all.filter((i) => roleGroup(i.role_type) === role) : all;
  const show = ui.feedAll ? items : items.slice(0, 10), nNew = all.filter(isNewItem).length;
  const groups = ROLE_GROUPS.map(([g]) => g).filter((g) => all.some((i) => roleGroup(i.role_type) === g));
  return `<div class="card"><div class="row between"><div class="stack" style="gap:2px"><h2>New openings</h2><span class="small muted">Refreshed daily from justjoin.it · last update ${esc(fmtDate(String(last.runAt || '').slice(0, 10)))}${last.region ? ' · ' + esc(String(last.region)) : ''}</span></div>
      <span class="row">${nNew ? `<span class="chip mark">${nNew} new since your last look</span>` : ''}<span class="chip ${all.length ? 'acc' : 'good'}">${all.length ? all.length + ' to review' : 'All reviewed'}</span></span></div>
    ${groups.length > 1 ? `<div class="row"><button class="chip ${!role ? 'sel' : ''}" data-act="feed-role" data-role="">All</button>${groups.map((g) => `<button class="chip ${role === g ? 'sel' : ''}" data-act="feed-role" data-role="${esc(g)}">${esc(g)}</button>`).join('')}</div>` : ''}
    <div>${items.length ? show.map(feedRow).join('') : '<p class="muted">Nothing to review here right now. New openings arrive with tomorrow morning\'s refresh.</p>'}</div>
    ${items.length > 10 ? `<button class="btn sm ghost" data-act="feed-all">${ui.feedAll ? 'Show fewer' : 'Show all ' + items.length}</button>` : ''}
    <p class="small muted">Openings come from justjoin.it only; pracuj.pl and No Fluff Jobs don't allow automated reading, so keep email alerts on there. Links expire after a few weeks.</p></div>`;
}
function ossWhy(repo) { for (const g of OSS_REPOS) for (const r of g.items) if (r.repo.toLowerCase() === String(repo || '').toLowerCase()) return r.name + ': ' + r.how; return ''; }
let feedLoadedAt = 0;
async function loadFeeds(force) {
  if (!force && Date.now() - feedLoadedAt < 20 * 60 * 1000) return;
  feedLoadedAt = Date.now();
  if (location.protocol === 'file:') { ui.feedState = 'file'; return; }
  const get = async (p) => { const r = await fetch(p + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); };
  try {
    const j = await get('data/jobs.json');
    ui.feed = j && (j.updatedAt || (j.items || []).length) ? [{ runAt: j.updatedAt || '', region: j.region || '', items: Array.isArray(j.items) ? j.items : [] }] : [];
    ui.feedState = 'ok';
  } catch (e) { ui.feedState = 'error'; }
  try {
    const o = await get('data/oss.json');
    ui.ossFeed = o && o.updatedAt ? [{ runAt: o.updatedAt, items: (Array.isArray(o.items) ? o.items : []).map((x) => ({ ...x, age: x.created ? 'opened ' + fmtDate(String(x.created).slice(0, 10)) : '', why: ossWhy(x.repo) })) }] : [];
  } catch (e) { /* optional */ }
  const v = parseRoute().view;
  if (['home', 'jobs', 'opensource'].includes(v) && !ui.openJob && !ui.addingJob && !document.querySelector('.dialog')) render();
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') loadFeeds(); });

// ----- Today page with a backup reminder -----
function viewHome() {
  const has = solvedCount() > 0 || (S.jobs.list || []).length > 0 || Object.keys(S.progress.roadmap).length > 0;
  const last = S.meta.lastBackup, stale = !last || (new Date(today()) - new Date(last)) / 86400000 > 14;
  const card = has && stale ? `<div class="card flat"><div class="row between"><div class="stack"><h3>Back up your progress</h3><p class="muted small">Everything is saved in this browser. ${last ? 'Your last backup was ' + esc(fmtDate(last)) + '.' : 'You have no backup yet.'} A backup file protects it if the browser is cleared and lets you move to another device.</p></div><button class="btn primary" data-act="backup-download">Download backup</button></div></div>` : '';
  return viewHomeBase().replace('<div class="page">', '<div class="page">' + card);
}

// ----- Profile page (device saving, backups, install help) -----
function viewProfile() {
  const p = S.profile;
  const f = (k, label, type, ph) => `<label class="f">${label}<input type="${type || 'text'}" data-bind="profile.${k}" value="${esc(p[k])}" placeholder="${esc(ph || '')}"></label>`;
  return `<div class="page">
    <div class="head"><span class="eyebrow">Profile</span><h1>About you</h1><p class="lede">Everything you open in the coach starts with this, and the portfolio uses it. Keep it honest and current.</p></div>
    <div class="card"><div class="grid g3">${f('name', 'First name', 'text', 'e.g. Ania')}${f('city', 'City', 'text', 'e.g. Wrocław')}
      <label class="f">English level<select data-bind="profile.english">${['A2', 'B1', 'B2', 'C1', 'C2'].map((l) => `<option ${p.english === l ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
      ${f('hours', 'Hours per week for this', 'number')}${f('startDate', 'Plan start date', 'date')}${f('email', 'Email for portfolio', 'email')}
      ${f('github', 'GitHub profile', 'url', 'https://github.com/…')}${f('linkedin', 'LinkedIn profile', 'url', 'https://linkedin.com/in/…')}
      <label class="f">Coach opens in<select data-bind="profile.ai">${Object.entries(AI_SITES).map(([k, a]) => `<option value="${k}" ${p.ai === k ? 'selected' : ''}>${a.name}</option>`).join('')}</select></label></div>
      <div class="stack"><span class="small" style="font-weight:600;color:var(--muted)">Target roles</span><div class="row">${ROLE_OPTIONS.map((r) => `<button class="chip ${p.roles.includes(r) ? 'sel' : ''}" data-act="role-toggle" data-role="${esc(r)}">${esc(r)}</button>`).join('')}</div></div>
      <label class="f">Background<textarea data-bind="profile.background">${esc(p.background)}</textarea></label>
      <label class="f">Skills (comma separated)<input type="text" data-bind="profile.skills" value="${esc(p.skills)}"></label>
      <label class="f">CV text (optional: the CV coach includes it automatically)<textarea data-bind="profile.cv" style="min-height:140px">${esc(p.cv)}</textarea></label></div>
    <div class="card"><h3>Your data and backups</h3>
      <p class="small muted">Everything is saved privately in this browser on this device. Nothing is uploaded anywhere. Download a backup now and then: it protects your progress if the browser data is cleared, and it is how you move to another device (download here, restore there).</p>
      <p class="small"><b>${S.meta.lastBackup ? 'Last backup: ' + esc(fmtDate(S.meta.lastBackup)) : 'No backup yet'}</b></p>
      <div class="row"><button class="btn primary" data-act="backup-download">Download backup</button><button class="btn" data-act="backup-pick">Restore from a backup file</button><input type="file" id="importFile" accept=".json,application/json" hidden><button class="btn ghost danger" data-act="reset-all">Reset everything</button></div>
      <details><summary class="small muted" style="cursor:pointer">Other ways: copy and paste a backup</summary><div class="stack" style="margin-top:8px"><div class="row"><button class="btn sm" data-act="export">Copy backup text</button></div>
        <label class="f">Restore from pasted text<textarea id="importTa" placeholder="Paste a backup here…" style="min-height:60px"></textarea></label><div class="row"><button class="btn sm" data-act="import">Restore</button></div></div></details></div>
    <div class="card" id="installHelp"><h3>Install as an app</h3>
      <ul class="small" style="margin:0;padding-left:20px;display:grid;gap:4px">
        <li><b>Laptop (Chrome or Edge):</b> the install icon at the right end of the address bar, or the "Install app" button in the menu on the left.</li>
        <li><b>Android (Chrome):</b> menu ⋮ → "Install app" or "Add to Home screen".</li>
        <li><b>iPhone (Safari):</b> Share button → "Add to Home Screen".</li></ul>
      <p class="small muted">Installed or not, it is the same app with the same saved data in that browser. The SQL Lab also works offline.</p></div>
  </div>`;
}

// ----- After each render -----
function afterRender(view) {
  if (view === 'lab') { const ed = $('#ed'); if (ed) { ed.addEventListener('keydown', editorKeys); ed.addEventListener('input', () => setDraft(ui.labEx, ed.value)); } ensureSql().catch(() => {}); }
  if (view === 'coach') { const ci = $('#coachIn'); if (ci) ci.addEventListener('input', () => { ui.coachDraft = ci.value; }); }
  if (view === 'portfolio') updatePreview();
  if (view === 'roadmap' && ui.scrollWeek) { const el = $('#week-' + ui.scrollWeek); ui.scrollWeek = null; if (el) el.scrollIntoView({ block: 'start' }); }
  if (view === 'jobs' && lastView !== 'jobs' && (ui.feed || []).length) {
    ui.feedVisitBaseline = S.meta.feedVisit || '';
    if (S.meta.feedVisit !== today()) { S.meta.feedVisit = today(); save('meta'); }
  }
  if (view !== 'jobs') ui.feedVisitBaseline = undefined;
  if (view !== lastView && view !== 'project') $('#main').scrollTop = 0;
  lastView = view;
  setSaveState();
}

// ----- Install & offline -----
let deferredInstall = null;
function updateInstallBtn() { const b = $('#installBtn'); if (b) b.hidden = !deferredInstall; }
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; updateInstallBtn(); });
window.addEventListener('appinstalled', () => { deferredInstall = null; updateInstallBtn(); toast('Installed. You can open Query Path from your apps now.', 4000); });

function bootWeb() {
  setSaveState();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* not supported */ }
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
  loadFeeds(true);
}

// ----- Start -----
loadLocal();
render();
bootWeb();
