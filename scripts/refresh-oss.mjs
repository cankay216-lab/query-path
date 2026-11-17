// Daily scan of beginner-friendly GitHub issues in the open source projects recommended in Query Path.
// Uses GitHub's REST API with the workflow's built-in token (no setup needed). Writes site/data/oss.json.
import { readFile, writeFile } from 'node:fs/promises';

const OUT = process.env.OSS_OUT || new URL('../site/data/oss.json', import.meta.url);
const REPOS = [
  'evidence-dev/evidence', 'sqlfluff/sqlfluff', 'MicrosoftDocs/sql-docs', 'tobymao/sqlglot', 'simonw/datasette', 'dbeaver/dbeaver',
  'dbt-labs/docs.getdbt.com', 'dbt-labs/dbt-core', 'apache/superset', 'metabase/metabase', 'lightdash/lightdash', 'duckdb/duckdb-web',
  'huntabyte/shadcn-svelte', 'skeletonlabs/skeleton', 'sveltejs/kit'
];
const LABELS = ['good first issue', 'good_first_issue', 'Good First Issue', 'help wanted', 'documentation'];
const PER_REPO = 3;
const MAX_AGE_DAYS = 400;   // ignore issues nobody has touched for over a year
const token = process.env.GITHUB_TOKEN;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gh(path) {
  const res = await fetch('https://api.github.com' + path, {
    headers: { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'query-path-oss-feed', ...(token ? { Authorization: 'Bearer ' + token } : {}) }
  });
  if (res.status === 404 || res.status === 422) return [];
  if (!res.ok) throw new Error(`GitHub ${res.status} for ${path}`);
  return res.json();
}

async function main() {
  const cutoff = Date.now() - MAX_AGE_DAYS * 86400000;
  const items = []; let ok = 0;
  for (const repo of REPOS) {
    const seen = new Map();
    for (const label of LABELS) {
      try {
        const list = await gh(`/repos/${repo}/issues?state=open&assignee=none&sort=updated&direction=desc&per_page=10&labels=${encodeURIComponent(label)}`);
        ok++;
        for (const it of list) {
          if (it.pull_request || seen.has(it.id)) continue;
          if (Date.parse(it.updated_at) < cutoff) continue;
          seen.set(it.id, { id: String(it.id), repo, title: String(it.title).slice(0, 200), url: it.html_url, labels: (it.labels || []).map((l) => (typeof l === 'string' ? l : l.name)).filter(Boolean).slice(0, 5), created: it.created_at, updated: it.updated_at, comments: it.comments || 0 });
        }
      } catch (e) { console.log(`  ${repo} [${label}]: ${e.message}`); }
      if (!process.env.OSS_OUT) await sleep(400);
    }
    // Prefer recently updated issues with few comments (less likely to be taken already).
    const best = [...seen.values()].sort((a, b) => (a.comments - b.comments) || b.updated.localeCompare(a.updated)).slice(0, PER_REPO);
    console.log(`${repo}: ${seen.size} open beginner issues, keeping ${best.length}`);
    items.push(...best);
  }
  if (!ok) {
    console.log('GitHub could not be reached; keeping the previous list.');
    process.exit(1);
  }
  items.sort((a, b) => b.updated.localeCompare(a.updated));
  await writeFile(OUT, JSON.stringify({ updatedAt: new Date().toISOString(), items }, null, 1));
  console.log(`Saved ${items.length} issues.`);
}
await main();
