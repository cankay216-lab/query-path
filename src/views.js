// ---------- Views ----------
const NAV = [
  ['home', 'Today'], ['roadmap', '12-week plan'], ['lab', 'SQL Lab'], ['projects', 'Projects'], ['opensource', 'Open source'], ['coach', 'Coach'],
  ['jobs', 'Job tracker'], ['portfolio', 'Portfolio'], ['toolkit', 'Toolkit'], ['profile', 'Profile']
];
function renderRail(view) {
  const rTotal = ROADMAP.reduce((a, w) => a + w.tasks.length, 0), rDone = Object.values(S.progress.roadmap).filter(Boolean).length;
  const pDone = allProjects().filter((p) => { const g = projProgress(p); return g.done === g.total; }).length;
  const ct = { opensource: String((S.oss.contribs || []).filter((c) => c.status === 'merged').length || ''), roadmap: `${rDone}/${rTotal}`, lab: `${solvedCount()}/${EXERCISES.length}`, projects: `${pDone}/${allProjects().length}`, jobs: String(sentCount()), home: 'wk ' + currentWeek() };
  $('#nav').innerHTML = NAV.map(([id, label]) => (id === 'toolkit' ? '<div class="sep"></div>' : '') +
    `<a href="#${id}" class="${view === id || (view === 'project' && id === 'projects') ? 'on' : ''}">${label}<span class="ct">${ct[id] || ''}</span></a>`).join('');
  $('#forName').textContent = S.profile.name ? 'for ' + S.profile.name : 'SQL career studio';
}

function checkItem(id, label, done, link) {
  return `<div class="check ${done ? 'done' : ''}"><input type="checkbox" id="c-${id}" data-act="toggle-task" data-id="${id}" ${done ? 'checked' : ''}><label for="c-${id}">${esc(label)}</label>${link ? `<a class="go" href="#${link}">Open</a>` : ''}</div>`;
}
function weekStrip() {
  const now = currentWeek();
  return `<div class="weeks">${ROADMAP.map((w) => { const g = weekProgress(w.w); const pct = Math.round(100 * g.done / g.total);
    return `<a class="wk ${g.done === g.total ? 'done' : ''} ${w.w === now ? 'now' : ''}" href="#roadmap" data-act="week-open" data-w="${w.w}" title="Week ${w.w}: ${esc(w.title)}"><b>W${w.w}</b><span>${esc(w.phase)}</span><div class="fill"><i style="width:${pct}%"></i></div></a>`; }).join('')}</div>`;
}

// ----- Today -----
function viewHomeBase() {
  const wk = currentWeek(), W = ROADMAP[wk - 1], g = weekProgress(wk);
  const stepsDone = allProjects().reduce((a, p) => a + projProgress(p).done, 0), stepsTotal = allProjects().reduce((a, p) => a + p.steps.length, 0);
  const c = jobCounts(), interviews = c.screen + c.tech + c.final + c.offer;
  const nextEx = EXERCISES.find((e) => !S.progress.solved[e.id]);
  const nextProj = allProjects().find((p) => { const x = projProgress(p); return x.done < x.total; });
  const nextStepIdx = nextProj ? nextProj.steps.findIndex((_, i) => !(S.progress.steps[nextProj.id] || {})[i]) : -1;
  const due = (S.jobs.list || []).filter((j) => j.followUp && j.followUp <= today() && ['applied', 'screen', 'tech', 'final'].includes(j.status));
  const greet = S.profile.name ? `Cześć ${esc(S.profile.name)}.` : 'Cześć.';
  return `<div class="page">
    ${!S.profile.name ? `<div class="card flat"><div class="row between"><div class="stack"><h3>Start here</h3><p class="muted">Add your name, target roles and background on the Profile page. The coach uses them to tailor every answer.</p></div><a class="btn primary" href="#profile">Fill in profile</a></div></div>` : ''}
    <section class="hero">
      <div class="head"><span class="eyebrow">${greet} Week ${wk} of 12 · ${esc(W.phase)}</span><h1>${esc(W.title)}</h1><p class="lede">${esc(W.goal)}</p></div>
      ${weekStrip()}
      <div class="grid g4">
        <div class="stat"><b>${solvedCount()}<small class="muted" style="font-size:15px">/${EXERCISES.length}</small></b><span>SQL exercises solved</span></div>
        <div class="stat"><b>${stepsDone}<small class="muted" style="font-size:15px">/${stepsTotal}</small></b><span>project steps done</span></div>
        <div class="stat"><b>${sentCount()}</b><span>applications sent</span></div>
        <div class="stat"><b>${interviews}</b><span>interviews reached</span></div>
      </div>
    </section>
    <div class="grid g2">
      <div class="card"><div class="row between"><h2>This week</h2><span class="chip ${g.done === g.total ? 'good' : 'acc'}">${g.done}/${g.total} done</span></div>
        <div>${W.tasks.map((t) => checkItem(t[0], t[1], S.progress.roadmap[t[0]], t[2])).join('')}</div></div>
      <div class="card"><h2>Next up</h2><div class="stack">
        ${nextEx ? `<div class="card tight flat"><span class="eyebrow">Practice</span><div class="row between"><span><b>${esc(nextEx.title)}</b> <span class="muted small">· ${esc(TOPICS.find((t) => t.id === nextEx.topic).name)}</span></span><button class="btn sm primary" data-act="lab-go" data-id="${nextEx.id}">Solve</button></div></div>` : `<div class="card tight flat"><span class="eyebrow">Practice</span><p>All Lab exercises solved. Keep going with LeetCode SQL 50 in the Toolkit.</p></div>`}
        ${nextProj ? `<div class="card tight flat"><span class="eyebrow">Project · ${esc(nextProj.code)}</span><div class="row between"><span><b>${esc(nextProj.steps[nextStepIdx].t)}</b> <span class="muted small">· ${esc(nextProj.title)}</span></span><a class="btn sm" href="#project-${nextProj.id}">Open</a></div></div>` : ''}
        ${feedItems().length ? `<div class="card tight flat"><span class="eyebrow">Job search</span><div class="row between"><span><b>${feedItems().length} openings to review</b> <span class="muted small">· ${newFeedCount() ? newFeedCount() + ' new since your last look' : 'from the daily job refresh'}</span></span><a class="btn sm primary" href="#jobs">Review</a></div></div>` : ''}
        ${due.length ? `<div class="card tight flat"><span class="eyebrow">Follow-ups due</span>${due.map((j) => `<div class="row between"><span><b>${esc(j.company)}</b> <span class="muted small">· ${esc(j.role)}</span></span><span class="overdue small">${fmtDate(j.followUp)}</span></div>`).join('')}<a class="small" href="#jobs">Open tracker</a></div>` : ''}
        <div class="card tight flat"><span class="eyebrow">Coach</span><div class="row">
          <button class="btn sm" data-act="coach-start" data-mode="mock_sql">Mock SQL interview</button>
          <button class="btn sm" data-act="coach-start" data-mode="cv">Review my CV</button>
          <a class="btn sm" href="#coach">Ask anything</a></div></div>
      </div></div>
    </div>
  </div>`;
}

// ----- Roadmap -----
function viewRoadmap() {
  const now = currentWeek();
  return `<div class="page">
    <div class="head"><span class="eyebrow">12-week plan</span><h1>From refresher to applications</h1>
      <p class="lede">About ${esc(S.profile.hours)} hours a week. Applications start in week 5, before everything is finished, because waiting for "ready" is the most common junior mistake.</p></div>
    <div class="card tight flat"><div class="row between"><label class="f" style="max-width:220px">Plan start date<input type="date" data-bind="profile.startDate" data-render="1" value="${esc(S.profile.startDate)}"></label><p class="muted small" style="max-width:60ch">Changing the start date moves the "this week" marker. Ticked tasks stay ticked.</p></div></div>
    ${weekStrip()}
    <div class="grid g2">${ROADMAP.map((w) => { const g = weekProgress(w.w);
      return `<div class="card" id="week-${w.w}" style="${w.w === now ? 'border:2px solid var(--mark)' : ''}"><div class="row between"><span class="eyebrow">Week ${w.w} · ${esc(w.phase)}${w.w === now ? ' · now' : ''}</span><span class="chip ${g.done === g.total ? 'good' : ''}">${g.done}/${g.total}</span></div>
      <h3>${esc(w.title)}</h3><p class="muted small">${esc(w.goal)}</p><div>${w.tasks.map((t) => checkItem(t[0], t[1], S.progress.roadmap[t[0]], t[2])).join('')}</div></div>`; }).join('')}</div>
  </div>`;
}

// ----- SQL Lab -----
function exById(id) { return allExercises().find((e) => e.id === id); }
function labCurrent() { return ui.labEx && (ui.labEx === 'sandbox' || ui.labEx === 'generate' || exById(ui.labEx)) ? ui.labEx : (EXERCISES.find((e) => !S.progress.solved[e.id]) || EXERCISES[0]).id; }
function draftFor(id) { const d = lsGet('drafts') || {}; if (d[id] != null) return d[id]; if (id === 'sandbox') return '-- Free practice. Anything goes: SELECT, CREATE, INSERT...\n-- Press Ctrl+Enter to run.\n\nSELECT * FROM customers LIMIT 10;'; const s = S.progress.solved[id]; return s && s.sql ? s.sql : '-- Write your query here, then press Ctrl+Enter to run\n\n'; }
function setDraft(id, v) { const d = lsGet('drafts') || {}; d[id] = v; lsSet('drafts', d); }

function viewLab() {
  const cur = labCurrent(); ui.labEx = cur; lsSet('ui', { labEx: cur });
  const ex = exById(cur), stats = topicStats(), gen = S.practice.generated || [];
  const exBtn = (e) => `<button class="ex ${e.id === cur ? 'on' : ''} ${S.progress.solved[e.id] ? 'solved' : ''}" data-act="lab-select" data-id="${e.id}"><span class="dot">${S.progress.solved[e.id] ? '✓' : ''}</span>${esc(e.title)}<span class="lvl">${'•'.repeat(e.level)}</span></button>`;
  const list = `<nav class="exlist" aria-label="Exercises">
    <div class="exgroup"><button class="ex ${cur === 'sandbox' ? 'on' : ''}" data-act="lab-select" data-id="sandbox"><span class="dot">✎</span>Sandbox & my scripts</button></div>
    ${stats.map((t) => `<div class="exgroup"><h4><span>${esc(t.name)}</span><span class="mono">${t.done}/${t.total}</span></h4>
      ${EXERCISES.filter((e) => e.topic === t.id).map(exBtn).join('')}</div>`).join('')}
    <div class="exgroup"><h4><span>Made for you</span><span class="mono">${gen.filter((e) => S.progress.solved[e.id]).length}/${gen.length}</span></h4>
      <button class="ex ${cur === 'generate' ? 'on' : ''}" data-act="lab-select" data-id="generate"><span class="dot">+</span>New exercises</button>
      ${gen.slice().reverse().map(exBtn).join('')}</div>
  </nav>`;
  const schema = `<aside class="card tight schema schema-col"><h4>Practice database</h4><p class="muted small">"Sklep Wisła", a fictional Polish online shop. 304 customers, 1,600 orders (2024–2026). Click a column to insert it.</p>
    ${SCHEMA_DOC.map((t) => `<details ${['customers', 'orders', 'order_items'].includes(t.t) ? 'open' : ''}><summary><span>${t.t}</span></summary><p class="muted small">${esc(t.d)}</p><ul>${t.cols.map((c) => `<li><button data-act="ins" data-text="${esc(c[0])}">${esc(c[0])}</button><span>${esc(c[1])}</span></li>`).join('')}</ul></details>`).join('')}
    <p class="muted small" style="margin-top:6px">The Lab runs SQLite in your browser. Each exercise shows how the same thing is written in SQL Server (T-SQL).</p></aside>`;
  let center;
  if (cur === 'generate') {
    const g = ui.genEx || (ui.genEx = { topic: (stats.find((t) => t.id !== 'dml' && t.done < t.total) || stats[4]).id, level: 2, count: 5 });
    center = `<div class="stack" style="gap:14px"><div class="card"><span class="eyebrow">Made for you</span><h2>New exercises, as many as you want</h2>
      <p class="muted">Your AI (free Claude or ChatGPT) writes fresh exercises for the practice database and you paste its answer back here. Every solution is run and tested before it is added, so the answer checker works for them just like the built-in ones.</p>
      <div class="grid g3"><label class="f">Topic<select id="genTopic">${TOPICS.filter((t) => t.id !== 'dml').map((t) => `<option value="${t.id}" ${g.topic === t.id ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}<option value="mixed" ${g.topic === 'mixed' ? 'selected' : ''}>Mixed review (all topics)</option></select></label>
        <label class="f">Difficulty<select id="genLevel">${[[1, 'Easy'], [2, 'Medium'], [3, 'Hard']].map(([v, n]) => `<option value="${v}" ${+g.level === v ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label class="f">How many<select id="genCount">${[3, 5, 8].map((n) => `<option ${+g.count === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
      <label class="f">Anything specific? (optional)<input type="text" id="genFocus" placeholder="e.g. more LEFT JOIN traps, dates, questions like in analyst interviews" value="${esc(g.focus || '')}"></label>
      <div class="row"><button class="btn primary" data-act="gen-ex" ${ui.busy.genEx ? 'disabled' : ''}>Get exercises from your AI</button>
        ${gen.length ? `<span class="small muted">${gen.length} made so far</span>` : ''}</div>
      ${ui.genExMsg ? `<div class="verdict ${ui.genExMsg.ok ? 'ok' : 'no'}">${esc(ui.genExMsg.text)}</div>` : ''}</div>
      <div class="card tight flat"><p class="small muted">Tip: pick the topic you find hardest. The counters in the left column show where you have done least. Exercises you get wrong are remembered so you can come back to them.</p></div></div>`;
  } else if (cur === 'sandbox') {
    const scripts = S.scripts.list || [];
    center = `<div class="stack" style="gap:14px">
      <div class="card tight"><div class="row between"><h2>Sandbox</h2><button class="btn sm ghost" data-act="lab-reset-db">Reset database</button></div>
      <p class="muted small">Changes here (new tables, inserts, deletes) stay until you reset or reload the page. Save scripts you want to keep; they are stored with your progress.</p></div>
      <textarea class="editor" id="ed" spellcheck="false" aria-label="SQL editor">${esc(draftFor('sandbox'))}</textarea>
      <div class="row"><button class="btn primary" data-act="lab-run">Run <kbd class="small">Ctrl+Enter</kbd></button>
        <input type="text" id="scriptName" placeholder="Script name, e.g. clinic schema draft" style="max-width:280px"><button class="btn" data-act="lab-save-script">Save script</button></div>
      <div id="labOut">${ui.labOut.sandbox || '<div class="verdict info">Run a query to see results here.</div>'}</div>
      <div class="card tight"><h4>My scripts</h4>${scripts.length ? scripts.map((s) => `<div class="row between check"><span><b>${esc(s.name)}</b> <span class="muted small">· ${fmtDate(s.at)}</span></span><span class="row"><button class="btn sm" data-act="lab-load-script" data-id="${s.id}">Load</button><button class="btn sm ghost danger" data-act="lab-del-script" data-id="${s.id}">Delete</button></span></div>`).join('') : '<p class="muted small">No saved scripts yet.</p>'}</div>
    </div>`;
  } else {
    const solved = S.progress.solved[ex.id];
    const topic = TOPICS.find((t) => t.id === ex.topic);
    center = `<div class="stack" style="gap:14px">
      <div class="card"><div class="row between"><span class="eyebrow">${ex.gen ? 'Made for you · ' : ''}${esc(topic ? topic.name : 'Mixed review')} · level ${ex.level}${ex.type === 'dml' ? ' · changes data' : ''}</span><span class="row">${(S.practice.mistakes[ex.id] || 0) > 0 && !solved ? `<span class="chip warn">${S.practice.mistakes[ex.id]} wrong ${S.practice.mistakes[ex.id] === 1 ? 'try' : 'tries'}</span>` : ''}${solved ? '<span class="chip good">Solved</span>' : ''}${ex.gen ? `<button class="btn sm ghost danger" data-act="gen-del" data-id="${ex.id}">Remove</button>` : ''}</span></div>
        <h2>${esc(ex.title)}</h2><p>${ex.gen ? esc(ex.prompt) : ex.prompt}</p>
        ${ui.hint[ex.id] ? `<div class="verdict info"><b>Hint:</b> ${esc(ex.hint)}</div>` : ''}
        ${ui.revealed[ex.id] || solved ? `<details ${ui.revealed[ex.id] ? 'open' : ''}><summary class="small muted" style="cursor:pointer">Reference solution and SQL Server note</summary><div class="stack" style="margin-top:8px"><pre class="code">${esc(ex.solution)}</pre><p class="small"><b>T-SQL:</b> ${esc(ex.tsql)}</p></div></details>` : ''}
      </div>
      <textarea class="editor" id="ed" spellcheck="false" aria-label="SQL editor">${esc(draftFor(ex.id))}</textarea>
      <div class="row"><button class="btn" data-act="lab-run">Run <kbd class="small">Ctrl+Enter</kbd></button><button class="btn primary" data-act="lab-check">Check answer</button>
        ${!ui.hint[ex.id] ? '<button class="btn ghost" data-act="lab-hint">Hint</button>' : ''}
        <button class="btn ghost" data-act="lab-ask">Ask the coach</button>
        ${!ui.revealed[ex.id] && !solved ? '<button class="btn ghost" data-act="lab-solution">Show solution</button>' : ''}</div>
      <div id="labAi">${ui.labAi[ex.id] || ''}</div>
      <div id="labOut">${ui.labOut[ex.id] || '<div class="verdict info">Run your query to see the result, then press Check answer.</div>'}</div>
    </div>`;
  }
  return `<div class="page wide"><div class="head"><span class="eyebrow">SQL Lab</span><h1>Practice on a real-looking database</h1></div><div class="lab">${list}${center}${schema}</div></div>`;
}

// ----- Projects -----
function projCard(p) {
  const g = projProgress(p), pct = Math.round(100 * g.done / g.total);
  return `<a class="card proj" href="#project-${p.id}"><div class="row between"><span class="code">${esc(p.code)} · ${esc(p.tag)}</span>${g.done === g.total ? '<span class="chip good">Done</span>' : `<span class="chip">${esc(p.hours)}</span>`}</div>
    <h3>${esc(p.title)}</h3><p class="muted small">${esc(p.summary)}</p><div class="bar"><i style="width:${pct}%"></i></div><span class="small muted">${g.done}/${g.total} steps · best for ${esc(p.role)}</span></a>`;
}
function viewProjects() {
  const custom = S.projects.custom || [];
  return `<div class="page">
    <div class="head"><span class="eyebrow">Project workshop</span><h1>Portfolio projects, step by step</h1>
      <p class="lede">Each project is a workbook: steps to tick, what to deliver, what to put in the README, and what to say about it in an interview. Build them in SQL Server on your laptop and push to GitHub; use the Lab sandbox to try ideas quickly.</p></div>
    <div class="grid g2">${PROJECTS.map(projCard).join('')}</div>
    <div class="card"><div class="stack"><h2>Tailored projects</h2><p class="muted">Paste a job ad you really want. The coach designs a one-weekend project that mirrors that company's domain and tech, so you can say "I built this to show how I'd approach your work".</p></div>
      <textarea id="genAd" placeholder="Paste the full job ad here (title, company, requirements)…" style="min-height:120px"></textarea>
      <div class="row"><input type="text" id="genCompany" placeholder="Company name" style="max-width:260px"><button class="btn primary" data-act="gen-project" ${ui.busy.gen ? 'disabled' : ''}>${ui.busy.gen ? 'Designing project…' : 'Design a tailored project'}</button></div>
      ${ui.genErr ? `<div class="verdict no">${esc(ui.genErr)}</div>` : ''}
      ${custom.length ? `<div class="grid g2">${custom.map(projCard).join('')}</div>` : ''}
    </div>
  </div>`;
}
function viewProject(id) {
  const p = findProject(id);
  if (!p) return `<div class="page"><div class="empty"><h2>Project not found</h2><a class="btn" href="#projects">Back to projects</a></div></div>`;
  const st = S.progress.steps[p.id] || {}, g = projProgress(p), links = S.progress.links[p.id] || {};
  const readmeMd = `# ${p.title}\n\n` + p.readme.map((r) => `## ${r}\n\n_TODO_\n`).join('\n');
  const isCustom = !PROJECTS.find((x) => x.id === p.id);
  return `<div class="page">
    <a href="#projects" class="small">← All projects</a>
    <div class="head"><span class="eyebrow">${esc(p.code)} · ${esc(p.tag)} · ${esc(p.hours)}</span><h1>${esc(p.title)}</h1><p class="lede">${esc(p.summary)}</p></div>
    <div class="grid g2">
      <div class="card"><h3>Why this project</h3><p>${esc(p.why)}</p><div class="row">${p.skills.map((s) => `<span class="chip acc">${esc(s)}</span>`).join('')}</div><p class="small muted">Best for: ${esc(p.role)}</p></div>
      <div class="card"><div class="row between"><h3>Progress</h3><span class="chip ${g.done === g.total ? 'good' : 'acc'}">${g.done}/${g.total} steps</span></div><div class="bar"><i style="width:${Math.round(100 * g.done / g.total)}%"></i></div>
        <label class="f">GitHub repository link<input type="url" data-bind="progress.links.${p.id}.repo" value="${esc(links.repo || '')}" placeholder="https://github.com/…"></label>
        <label class="f">Live demo or video link (optional)<input type="url" data-bind="progress.links.${p.id}.demo" value="${esc(links.demo || '')}" placeholder="https://…"></label>
        <p class="small muted">Links you add here appear automatically in your portfolio page.</p></div>
    </div>
    <div class="stack"><h2>Steps</h2>${p.steps.map((s, i) => `<details class="step ${st[i] ? 'done' : ''}" ${!st[i] && i === p.steps.findIndex((_, k) => !st[k]) ? 'open' : ''}>
      <summary><input type="checkbox" aria-label="Mark step ${i + 1} done" data-act="step-toggle" data-pid="${p.id}" data-i="${i}" ${st[i] ? 'checked' : ''}><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="tt">${esc(s.t)}</span></summary>
      <div class="body"><p>${esc(s.d)}</p><p class="small"><b>Deliverable:</b> ${esc(s.out)}</p></div></details>`).join('')}</div>
    <div class="grid g2">
      <div class="card"><div class="row between"><h3>README outline</h3><button class="btn sm" data-act="copy" data-text="${esc(readmeMd)}" data-label="README skeleton">Copy as Markdown</button></div><ol class="small" style="margin:0;padding-left:20px">${p.readme.map((r) => `<li>${esc(r)}</li>`).join('')}</ol></div>
      <div class="card"><h3>Say this in interviews</h3><ul class="small" style="margin:0;padding-left:20px">${p.talk.map((r) => `<li>${esc(r)}</li>`).join('')}</ul><button class="btn sm" data-act="coach-practice-project" data-pid="${p.id}">Practise explaining this project with the coach</button></div>
    </div>
    <div class="card"><h3>My notes</h3><textarea data-bind="progress.notes.${p.id}" placeholder="Decisions, problems, links, what to mention in interviews…">${esc(S.progress.notes[p.id] || '')}</textarea></div>
    <div class="card"><div class="stack"><h3>Get a review from the coach</h3><p class="muted small">Paste your SQL script, ERD description, README draft, or describe where you are stuck.</p></div>
      <textarea id="revText" placeholder="Paste here…" style="min-height:140px"></textarea>
      <div class="row"><select id="revStep" style="max-width:360px">${p.steps.map((s, i) => `<option value="${i}">Step ${i + 1}: ${esc(s.t)}</option>`).join('')}<option value="-1">The project overall</option></select>
        <button class="btn primary" data-act="proj-review" data-pid="${p.id}" ${ui.busy['rev' + p.id] ? 'disabled' : ''}>${ui.busy['rev' + p.id] ? 'Reviewing…' : 'Review it'}</button></div>
      <div id="revOut">${ui.reviewOut[p.id] || ''}</div></div>
    ${isCustom ? `<div class="row"><button class="btn danger" data-act="proj-delete" data-pid="${p.id}">Delete this tailored project</button></div>` : ''}
  </div>`;
}

// ----- Coach -----
const COACH_MODES = {
  general: { name: 'Ask anything', intro: 'Questions about SQL, projects, the job search, motivation, anything.', starters: ['Explain window functions like I am new to them, with a T-SQL example', 'Which roles should I focus on given my background?', 'What should I do this week? I have 10 hours', 'How do I explain my frontend internship to a data recruiter?'],
    instr: 'Mode: open questions. Help with whatever she asks. When she asks about SQL, teach with a small example and finish with one quick question to check understanding.' },
  mock_sql: { name: 'Mock SQL interview', intro: 'A technical interview, one question at a time, with feedback after each answer.', starters: ["Let's start. Interview me for a junior data analyst role", "Let's start. Interview me for a junior T-SQL developer role", "Let's start. Interview me for an application support role"],
    instr: 'Mode: mock technical interview. Act as a friendly but realistic interviewer at a Polish company. Ask ONE question at a time and wait. After each answer: a 1-line verdict, what was good, what was missing, a model answer (short, with T-SQL if relevant), then the next question. Mix: writing a query on a small schema you describe, concepts (joins, NULLs, normalization, keys, indexes, transactions), and one practical scenario. Gradually raise difficulty. After 8 questions, give a summary with scores per area and the 3 topics to study next.' },
  mock_hr: { name: 'Behavioral interview', intro: 'HR and "tell me about yourself" questions, with the STAR method.', starters: ["Let's start the HR interview", 'Help me write my 60-second "tell me about yourself"', 'How do I answer "why did you choose SQL"?'],
    instr: 'Mode: behavioral / HR interview practice. Ask one question at a time. After each answer, give feedback using the STAR method (Situation, Task, Action, Result), suggest a stronger version in her own voice, then ask the next question. Include salary-expectation and "why this company" questions typical in Poland.' },
  cv: { name: 'CV & cover letter', intro: 'Paste your CV or a cover letter and get a concrete review.', starters: ['Here is my CV, please review it:\n\n', 'Write a short cover letter for this job ad:\n\n', 'Turn my internship into 3 strong CV bullet points'],
    instr: 'Mode: CV and cover letter review. Review pasted text for the Polish junior IT market: one page, projects above education, results-focused bullets, keywords matching ads (T-SQL, SQL Server, Power BI, Git), links, and the RODO clause. Give: top 3 changes, then rewritten bullets she can paste. For cover letters: under 200 words, specific to the company, mentioning a relevant project.' }
};

// ----- Jobs -----
function jobForm(j, isNew) {
  const f = (k, label, type, ph) => `<label class="f">${label}<input type="${type || 'text'}" ${isNew ? `id="nj-${k}"` : `data-jbind="${k}" data-id="${j.id}"`} value="${esc(j[k] || '')}" placeholder="${esc(ph || '')}"></label>`;
  return `<div class="grid g3">${f('company', 'Company', 'text', 'e.g. Comarch')}${f('role', 'Role', 'text', 'e.g. Junior Data Analyst')}${f('city', 'City / remote', 'text', 'Kraków, hybrid')}
    ${f('link', 'Link to ad', 'url', 'https://…')}${f('salary', 'Salary range', 'text', 'e.g. 6–8k PLN UoP')}
    <label class="f">Status<select ${isNew ? 'id="nj-status"' : `data-jbind="status" data-id="${j.id}"`}>${STATUSES.map((s) => `<option value="${s.id}" ${j.status === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></label>
    ${f('applied', 'Applied on', 'date')}${f('followUp', 'Follow up on', 'date')}<span></span></div>
    <label class="f">Job ad text (paste it: ads disappear after a few weeks)<textarea ${isNew ? 'id="nj-ad"' : `data-jbind="ad" data-id="${j.id}"`} placeholder="Paste the full ad…">${esc(j.ad || '')}</textarea></label>
    <label class="f">Notes<textarea ${isNew ? 'id="nj-notes"' : `data-jbind="notes" data-id="${j.id}"`} style="min-height:60px" placeholder="Contact person, referral, interview dates…">${esc(j.notes || '')}</textarea></label>`;
}
function viewJobs() {
  const list = S.jobs.list || [], c = jobCounts(), filt = ui.jobFilter;
  const shown = list.filter((j) => !filt || j.status === filt).sort((a, b) => (b.updated || 0) - (a.updated || 0));
  return `<div class="page">
    <div class="head"><span class="eyebrow">Job tracker</span><h1>Every application in one place</h1><p class="lede">Aim for 5 applications a week from week 5. Follow up after 7–10 days; a short, polite follow-up often gets a reply where the application alone did not.</p></div>
    ${feedSection()}
    <div class="pipe">${STATUSES.map((s) => `<button class="${filt === s.id ? 'sel' : ''}" data-act="job-filter" data-st="${s.id}"><b>${c[s.id] || 0}</b><span>${s.name}</span></button>`).join('')}</div>
    <div class="row between"><div class="row">${filt ? `<span class="chip acc">Showing: ${esc(STATUSES.find((s) => s.id === filt).name)}</span><button class="btn sm ghost" data-act="job-filter" data-st="">Show all</button>` : `<span class="muted small">${list.length} jobs saved</span>`}</div>
      <div class="row">${list.length ? '<button class="btn sm ghost" data-act="jobs-csv">Copy as CSV</button>' : ''}<button class="btn primary" data-act="job-add">Add job</button></div></div>
    ${ui.addingJob ? `<div class="card"><h3>New job</h3>${jobForm({ status: 'saved' }, true)}<div class="row"><button class="btn primary" data-act="job-save-new">Save job</button><button class="btn ghost" data-act="job-cancel-new">Cancel</button></div></div>` : ''}
    <div class="card" style="padding:0">${shown.length ? shown.map((j) => {
      const over = j.followUp && j.followUp <= today() && ['applied', 'screen', 'tech', 'final'].includes(j.status);
      const open = ui.openJob === j.id;
      return `<div><div class="jobrow"><div class="who"><b>${esc(j.company || 'Untitled')}</b><span class="small muted">${esc(j.role || '')}${j.city ? ' · ' + esc(j.city) : ''}</span></div>
        <select data-jbind="status" data-id="${j.id}" class="st-${j.status}" aria-label="Status">${STATUSES.map((s) => `<option value="${s.id}" ${j.status === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select>
        <span class="small">${j.applied ? 'Applied ' + fmtDate(j.applied) : '<span class="muted">Not applied</span>'}</span>
        <span class="small ${over ? 'overdue' : 'muted'}">${j.followUp ? (over ? 'Follow up ' : 'Follow-up ') + fmtDate(j.followUp) : ''}</span>
        <span class="row">${j.projectId && findProject(j.projectId) ? `<a class="btn sm ghost" href="#project-${j.projectId}">Project</a>` : ''}<button class="btn sm" data-act="job-open" data-id="${j.id}">${open ? 'Close' : 'Open'}</button></span></div>
        ${open ? `<div class="card flat" style="border-radius:0;border-width:1px 0">${jobForm(j, false)}
          <div class="row">${safeUrl(j.link) ? `<a class="btn sm ghost" href="${esc(safeUrl(j.link))}" target="_blank" rel="noopener">Open ad</a>` : ''}
            <button class="btn sm primary" data-act="job-analyze" data-id="${j.id}" ${ui.busy['an' + j.id] ? 'disabled' : ''}>${ui.busy['an' + j.id] ? 'Analyzing…' : 'Analyze ad with the coach'}</button>
            <button class="btn sm" data-act="job-gen" data-id="${j.id}" ${ui.busy['gen' + j.id] ? 'disabled' : ''}>${ui.busy['gen' + j.id] ? 'Designing…' : (j.projectId ? 'Design another tailored project' : 'Design a tailored project')}</button>
            <button class="btn sm ghost danger" data-act="job-del" data-id="${j.id}">Delete</button></div>
          ${ui.jobErr && ui.jobErr.id === j.id ? `<div class="verdict no">${esc(ui.jobErr.msg)}</div>` : ''}
          <div id="an-${j.id}" class="md">${j.analysis ? md(j.analysis) : ''}</div></div>` : ''}</div>`; }).join('') :
      `<div class="empty"><h3>${list.length ? 'Nothing with this status' : 'No jobs yet'}</h3><p>Save ads you would apply to, even before you feel ready. Week 2 of the plan asks for 10.</p></div>`}</div>
  </div>`;
}

// ----- Portfolio -----
function portfolioData() {
  const p = S.profile, pf = S.portfolio;
  const projs = allProjects().filter((x) => pf.include[x.id] ?? (projProgress(x).done > 0 || (S.progress.links[x.id] || {}).repo)).map((x) => ({
    title: x.title, tag: x.tag, text: pf.blurbs[x.id] || x.summary, skills: x.skills.slice(0, 5), repo: safeUrl((S.progress.links[x.id] || {}).repo), demo: safeUrl((S.progress.links[x.id] || {}).demo) }));
  return { name: p.name || 'Your Name', headline: pf.headline || 'Junior SQL Developer · SQL Server, T-SQL, Power BI', about: pf.about || p.background, city: p.city, email: p.email, github: safeUrl(p.github), linkedin: safeUrl(p.linkedin), skills: p.skills.split(',').map((s) => s.trim()).filter(Boolean), projects: projs, accent: /^#[0-9a-f]{6}$/i.test(pf.accent) ? pf.accent : '#2443c9', oss: (S.oss.contribs || []).filter((c) => c.status === 'merged').map((c) => ({ repo: c.repo || '', title: c.title || 'Contribution', pr: safeUrl(c.pr) })) };
}
function portfolioHtml() {
  const d = portfolioData();
  const links = [d.github && `<a href="${esc(d.github)}">GitHub</a>`, d.linkedin && `<a href="${esc(d.linkedin)}">LinkedIn</a>`, d.email && `<a href="mailto:${esc(d.email)}">${esc(d.email)}</a>`].filter(Boolean).join(' · ');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(d.name)} · Portfolio</title>
<style>
:root{--a:${d.accent};--ink:#16192a;--mut:#5d6375;--line:#e3e5ea;--bg:#fbfbfa}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.w{max-width:860px;margin:0 auto;padding:56px 24px}
h1{font-size:42px;line-height:1.1;margin:0 0 8px;letter-spacing:-.02em}h2{font-size:14px;text-transform:uppercase;letter-spacing:.1em;color:var(--mut);margin:48px 0 16px}
.hl{font-size:20px;color:var(--a);font-weight:600;margin:0 0 18px}.links a{color:var(--ink)}.about{max-width:64ch}
.sk{display:flex;flex-wrap:wrap;gap:8px}.sk span{border:1px solid var(--line);border-radius:999px;padding:3px 12px;font-size:14px;background:#fff}
.pj{display:grid;gap:16px}.p{background:#fff;border:1px solid var(--line);border-left:4px solid var(--a);border-radius:10px;padding:20px 22px}
.p h3{margin:0 0 2px;font-size:19px}.p .t{color:var(--mut);font-size:13px;margin-bottom:8px}.p p{margin:0 0 10px}.p .s{font-size:13px;color:var(--mut)}
.p a{color:var(--a);font-weight:600;margin-right:14px}footer{margin-top:56px;color:var(--mut);font-size:13px}
</style></head><body><main class="w">
<h1>${esc(d.name)}</h1><p class="hl">${esc(d.headline)}</p>
<p class="links">${d.city ? esc(d.city) + (links ? ' · ' : '') : ''}${links}</p>
<p class="about">${esc(d.about)}</p>
<h2>Skills</h2><div class="sk">${d.skills.map((s) => `<span>${esc(s)}</span>`).join('')}</div>
<h2>Projects</h2><div class="pj">${d.projects.length ? d.projects.map((x) => `<article class="p"><h3>${esc(x.title)}</h3><div class="t">${esc(x.tag)}</div><p>${esc(x.text)}</p><p class="s">${x.skills.map(esc).join(' · ')}</p>${x.repo ? `<a href="${esc(x.repo)}">Code on GitHub</a>` : ''}${x.demo ? `<a href="${esc(x.demo)}">Live demo</a>` : ''}</article>`).join('') : '<p>Projects coming soon.</p>'}</div>
${d.oss.length ? `<h2>Open source</h2><div class="pj">${d.oss.map((o) => `<article class="p"><h3>${esc(o.repo)}</h3><p>${esc(o.title)}</p>${o.pr ? `<a href="${esc(o.pr)}">Merged pull request</a>` : ''}</article>`).join('')}</div>` : ''}
<footer>© ${new Date().getFullYear()} ${esc(d.name)}</footer>
</main></body></html>`;
}
function viewPortfolio() {
  const pf = S.portfolio, d = portfolioData();
  const accents = ['#2443c9', '#0f766e', '#b42318', '#7c3aed', '#16192a'];
  return `<div class="page wide">
    <div class="head"><span class="eyebrow">Portfolio</span><h1>A one-page portfolio, ready to publish</h1><p class="lede">It fills itself from your profile and projects. Add GitHub links on each project page and they appear here. When it looks right, copy the HTML and publish it free on GitHub Pages.</p></div>
    <div class="grid" style="grid-template-columns:minmax(0,420px) minmax(0,1fr);align-items:start">
      <div class="stack" style="gap:14px">
        <div class="card"><div class="row between"><h3>Intro</h3><button class="btn sm" data-act="pf-ai" ${ui.busy.pf ? 'disabled' : ''}>${ui.busy.pf ? 'Writing…' : 'Write it with the coach'}</button></div>
          <label class="f">Headline<input type="text" data-bind="portfolio.headline" data-preview="1" value="${esc(pf.headline)}" placeholder="${esc(d.headline)}"></label>
          <label class="f">About<textarea data-bind="portfolio.about" data-preview="1" placeholder="${esc(S.profile.background)}">${esc(pf.about)}</textarea></label>
          ${ui.pfErr ? `<div class="verdict no">${esc(ui.pfErr)}</div>` : ''}
          <p class="small muted">Name, city, links and skills come from <a href="#profile">your profile</a>.</p>
          <div class="row"><span class="small muted">Accent</span>${accents.map((a) => `<button class="chip ${pf.accent === a ? 'sel' : ''}" data-act="pf-accent" data-c="${a}" style="background:${a};border-color:${a};width:28px;height:22px" aria-label="Accent ${a}"></button>`).join('')}</div></div>
        <div class="card"><h3>Projects shown</h3>${allProjects().map((x) => { const on = pf.include[x.id] ?? (projProgress(x).done > 0 || !!(S.progress.links[x.id] || {}).repo);
          return `<div class="check"><input type="checkbox" id="pi-${x.id}" data-act="pf-include" data-pid="${x.id}" ${on ? 'checked' : ''}><label for="pi-${x.id}">${esc(x.title)} ${(S.progress.links[x.id] || {}).repo ? '<span class="chip good">repo linked</span>' : '<span class="chip">no link yet</span>'}</label></div>`; }).join('')}
          <p class="small muted">Shown by default once you start a project or add its link.</p></div>
        <div class="card"><h3>Publish on GitHub Pages</h3><ol class="small" style="margin:0;padding-left:20px;display:grid;gap:4px">
          <li>Create a public repo named <code>your-username.github.io</code>.</li><li>Upload the downloaded <code>index.html</code> (Add file → Upload files). Commit.</li><li>Open https://your-username.github.io after a minute. Put the link on your CV and LinkedIn.</li></ol>
          <div class="row"><button class="btn primary" data-act="pf-download">Download index.html</button><button class="btn" data-act="pf-copy">Copy HTML</button></div>
          <p class="small muted">Later: rebuild it in Svelte yourself. That is one more project.</p></div>
      </div>
      <div class="card tight"><div class="row between"><h4>Live preview</h4><span class="small muted">Updates as you type</span></div><iframe class="preview" id="pfPrev" title="Portfolio preview" sandbox=""></iframe></div>
    </div></div>`;
}

// ----- Toolkit -----
function viewToolkit() {
  return `<div class="page">
    <div class="head"><span class="eyebrow">Toolkit</span><h1>Links, checklists and interview questions</h1></div>
    <div class="grid g2">${RESOURCES.map((sec) => `<div class="card"><h3>${esc(sec.h)}</h3><div class="stack">${sec.items.map((i) => `<div><a href="${esc(i[1])}" target="_blank" rel="noopener"><b>${esc(i[0])}</b></a><div class="small muted">${esc(i[2])}</div></div>`).join('')}</div></div>`).join('')}</div>
    <div class="grid g2">
      <div class="card"><h3>CV checklist for Poland</h3><div>${CV_CHECKLIST.map((c, i) => `<div class="check"><span class="mono small muted">${i + 1}</span><span>${esc(c)}</span></div>`).join('')}</div></div>
      <div class="card"><div class="row between"><h3>RODO clause</h3><button class="btn sm" data-act="copy" data-text="${esc(RODO_CLAUSE)}" data-label="Clause">Copy</button></div><p class="small">${esc(RODO_CLAUSE)}</p><p class="small muted">Put it at the bottom of Polish CVs in small font. Some ads ask for a specific version; if they do, use theirs.</p></div>
    </div>
    <div class="card"><div class="stack"><h3>Interview question bank</h3><p class="muted small">Press Practise to have the coach ask you that question in a mock interview and give feedback on your answer.</p></div>
      <div>${INTERVIEW_QS.map((q) => `<div class="check"><span class="chip">${esc(q[0])}</span><span style="flex:1">${esc(q[1])}</span><button class="btn sm ghost" data-act="practice-q" data-q="${esc(q[1])}" data-cat="${esc(q[0])}">Practise</button></div>`).join('')}</div></div>
  </div>`;
}

// ----- Profile -----

// ----- Open source -----
function ossFeedItems() {
  const seen = new Set(), dismissed = new Set(S.oss.dismissed || []), tracked = new Set((S.oss.contribs || []).map((c) => (c.issue || '').trim()));
  const out = [];
  for (const run of (ui.ossFeed || [])) for (const it of (Array.isArray(run.items) ? run.items : [])) {
    const url = safeUrl(it && it.url); if (!url || !/^https:\/\/github\.com\//.test(url) || seen.has(url)) continue; seen.add(url);
    out.push({ id: String(it.id || url), url, repo: String(it.repo || ''), title: String(it.title || 'Issue'), labels: (Array.isArray(it.labels) ? it.labels : []).map(String).slice(0, 4), age: String(it.age || ''), why: String(it.why || '') });
  }
  return out.filter((i) => !dismissed.has(i.id) && !tracked.has(i.url));
}
function ossFeedSection() {
  const last = (ui.ossFeed || [])[0]; if (!last) return '';
  const items = ossFeedItems();
  return `<div class="card"><div class="row between"><div class="stack" style="gap:2px"><h2>Fresh beginner issues</h2><span class="small muted">From the daily scan of the projects below · ${esc(fmtDate(String(last.runAt || '').slice(0, 10)))}</span></div><span class="chip ${items.length ? 'acc' : 'good'}">${items.length ? items.length + ' open' : 'All reviewed'}</span></div>
    <div>${items.length ? items.slice(0, 12).map((i) => `<div class="jobrow feedrow"><div class="who"><b>${esc(i.title)}</b><span class="small muted">${esc(i.repo)}${i.age ? ' · ' + esc(i.age) : ''}</span></div>
      <span class="small muted">${esc(i.why)} ${i.labels.map((l) => `<span class="chip">${esc(l)}</span>`).join(' ')}</span>
      <span class="row"><a class="btn sm ghost" href="${esc(i.url)}" target="_blank" rel="noopener">Open</a><button class="btn sm primary" data-act="oss-track" data-url="${esc(i.url)}">Track it</button><button class="btn sm ghost" data-act="oss-hide" data-id="${esc(i.id)}">Hide</button></span></div>`).join('') : '<p class="muted">Nothing new since you last looked.</p>'}</div>
    <p class="small muted">Issues get claimed quickly. Before starting, check that nobody is assigned and there is no linked pull request.</p></div>`;
}
function viewOpenSource() {
  const st = S.progress.steps.oss || {}, done = OSS_STEPS.filter((_, i) => st[i]).length, contribs = S.oss.contribs || [];
  const firstOpen = OSS_STEPS.findIndex((_, k) => !st[k]);
  return `<div class="page">
    <div class="head"><span class="eyebrow">Open source</span><h1>Contribute to real projects</h1>
      <p class="lede">A merged pull request in a project other people use shows something your own projects can't: that you can find your way in someone else's code, follow their process, and take review feedback in English. That is exactly what a first job feels like.</p></div>
    <div class="grid g2">
      <div class="card"><h3>What it gives you</h3><ul class="small" style="margin:0;padding-left:20px;display:grid;gap:4px">
        <li>Real Git and GitHub teamwork: forks, branches, pull requests, code review.</li><li>A strong CV line and interview story ("a maintainer asked me to change X, so I…").</li><li>Contact with experienced engineers, sometimes in companies that hire.</li></ul></div>
      <div class="card"><h3>Keep it realistic</h3><ul class="small" style="margin:0;padding-left:20px;display:grid;gap:4px">
        <li>It adds to your own projects; it does not replace them. Projects 1–3 come first.</li><li>A first pull request often takes 2–4 weeks, mostly waiting for review. Keep applying meanwhile.</li><li>Documentation and test fixes count. One or two merged pull requests are plenty for a junior CV.</li></ul></div>
    </div>
    ${ossFeedSection()}
    <div class="stack"><div class="row between"><h2>Your first contribution</h2><span class="chip ${done === OSS_STEPS.length ? 'good' : 'acc'}">${done}/${OSS_STEPS.length} steps</span></div>
      ${OSS_STEPS.map((s, i) => `<details class="step ${st[i] ? 'done' : ''}" ${i === firstOpen ? 'open' : ''}>
        <summary><input type="checkbox" aria-label="Mark step ${i + 1} done" data-act="step-toggle" data-pid="oss" data-i="${i}" ${st[i] ? 'checked' : ''}><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="tt">${esc(s.t)}</span></summary>
        <div class="body"><p>${esc(s.d)}</p><p class="small"><b>Result:</b> ${esc(s.out)}</p></div></details>`).join('')}</div>
    <div class="stack"><h2>Projects worth your time</h2><p class="muted small">Chosen for SQL, data and Svelte work, and all actively maintained. "Beginner issues" opens the project's open, unassigned issues labelled good first issue, help wanted or documentation. Some projects have none labelled at the moment; then use "All issues" (step 4 explains what to look for).</p></div>
    ${OSS_REPOS.map((g) => `<div class="stack"><h3>${esc(g.g)}</h3><div class="grid g2">${g.items.map((r) => `<div class="card tight"><div class="row between"><b>${esc(r.name)}</b><span class="chip">${esc(r.lang)}</span></div>
      <p class="small">${esc(r.what)}</p><p class="small"><b>Why for you:</b> ${esc(r.fit)}</p><p class="small muted">Good first contributions: ${esc(r.how)}</p>
      <div class="row"><a class="btn sm" href="https://github.com/${esc(r.repo)}/issues?q=${OSS_ISSUE_QUERY}" target="_blank" rel="noopener">Beginner issues</a><a class="btn sm ghost" href="https://github.com/${esc(r.repo)}/issues" target="_blank" rel="noopener">All issues</a><a class="btn sm ghost" href="https://github.com/${esc(r.repo)}" target="_blank" rel="noopener">Repository</a></div></div>`).join('')}</div></div>`).join('')}
    <div class="card tight flat"><h4>Find more</h4><div class="row">${OSS_FINDERS.map((f) => `<a class="btn sm ghost" href="${esc(f[1])}" target="_blank" rel="noopener">${esc(f[0])}</a>`).join('')}</div><p class="small muted">Every October, Hacktoberfest encourages first contributions and many projects label extra beginner issues.</p></div>
    <div class="card"><div class="stack"><h2>Coach helpers</h2><p class="muted small">Paste a GitHub issue (title, description, comments), a piece of code, or your pull request description.</p></div>
      <textarea id="ossText" placeholder="Paste the issue, code or PR description here…" style="min-height:140px"></textarea>
      <div class="row"><button class="btn primary" data-act="oss-ai" data-kind="explain" ${ui.busy.oss ? 'disabled' : ''}>Explain it and plan the fix</button><button class="btn" data-act="oss-ai" data-kind="claim" ${ui.busy.oss ? 'disabled' : ''}>Draft my "can I work on this?" comment</button><button class="btn" data-act="oss-ai" data-kind="pr" ${ui.busy.oss ? 'disabled' : ''}>Review my PR description</button></div>
      <div id="ossOut">${ui.ossOut || ''}</div></div>
    <div class="card"><div class="row between"><h2>My contributions</h2><button class="btn primary" data-act="oss-add">Add contribution</button></div>
      ${contribs.length ? contribs.slice().reverse().map((c) => `<div class="card tight flat"><div class="grid g3">
        <label class="f">Project<input type="text" data-obind="repo" data-id="${c.id}" value="${esc(c.repo || '')}" placeholder="e.g. sqlfluff/sqlfluff"></label>
        <label class="f">What you did<input type="text" data-obind="title" data-id="${c.id}" value="${esc(c.title || '')}" placeholder="e.g. Fixed T-SQL MERGE parsing"></label>
        <label class="f">Status<select data-obind="status" data-id="${c.id}">${OSS_STATUSES.map((s) => `<option value="${s.id}" ${c.status === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}</select></label>
        <label class="f">Issue link<input type="url" data-obind="issue" data-id="${c.id}" value="${esc(c.issue || '')}" placeholder="https://github.com/…/issues/…"></label>
        <label class="f">Pull request link<input type="url" data-obind="pr" data-id="${c.id}" value="${esc(c.pr || '')}" placeholder="https://github.com/…/pull/…"></label>
        <label class="f">Notes<input type="text" data-obind="notes" data-id="${c.id}" value="${esc(c.notes || '')}" placeholder="Reviewer, next step…"></label></div>
        <div class="row between"><span class="small muted">${c.status === 'merged' ? 'Merged contributions appear on your portfolio page.' : ''}</span><button class="btn sm ghost danger" data-act="oss-del" data-id="${c.id}">Delete</button></div></div>`).join('') :
        '<p class="muted small">Log each issue you look at. Merged pull requests show up on your portfolio and the coach knows about them.</p>'}</div>
  </div>`;
}
