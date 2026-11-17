# Query Path

A free study and job-search app for landing a first SQL job in Poland. It runs as a website you can install like an app on a laptop or phone.

It includes:

- **SQL Lab**: 36 exercises on a practice database, answers checked automatically, works offline.
- **12-week plan**: weekly tasks to tick off.
- **Projects**: 5 guided portfolio projects, plus tailored projects built from real job ads.
- **Open source**: a contribution guide and a list of beginner issues.
- **Coach**: opens your own free Claude or ChatGPT account with all your context filled in.
- **Job tracker**: your applications, plus new openings refreshed every morning.
- **Portfolio builder**: a one-page site you can download and publish.

Everything is free. Hosting is GitHub Pages, and the daily refresh is a GitHub Action. Each person's progress is saved only in their own browser and never uploaded.

---

## Set it up (about 15 minutes, once)

You need a free GitHub account. Use your own account: the repository will be public, and it's better not to have it on her profile as if she wrote it.

### 1. Create the repository
1. Sign in at github.com and click **New** (or go to github.com/new).
2. **Repository name:** `query-path`. Choose **Public**. Leave "Add a README" unticked.
3. Click **Create repository**.

### 2. Upload the files
1. Unzip `query-path.zip` on your computer.
2. On the new repository page, click **uploading an existing file**.
3. Open the unzipped `query-path` folder, select **everything inside it**, and drag it onto the GitHub page. That means the folders `site`, `scripts`, `src`, `.github` and the files `README.md` and `build.py`.
   - **On a Mac**, the `.github` folder is hidden. Press **Cmd + Shift + .** in Finder to show it, then select everything again.
4. Click **Commit changes**.
5. Check that the repository now shows a `.github` folder. If it doesn't, click **Add file → Create new file**, type the name `.github/workflows/deploy.yml`, paste in the contents of that file from the zip, and commit.

### 3. Turn on GitHub Pages
1. In the repository, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

### 4. Run it for the first time
1. Go to the **Actions** tab. If GitHub asks, click to enable workflows.
2. Click **Refresh and publish** on the left, then **Run workflow → Run workflow**.
3. Wait 1–3 minutes for a green tick. (If a run from the upload in step 2 failed with a red cross, that's normal: Pages wasn't switched on yet.)

### 5. Open and install it
- The app is at **https://YOUR-GITHUB-USERNAME.github.io/query-path/**
- Send her that link. On a laptop, Chrome or Edge shows an install icon in the address bar (or use "Install app" in the app's menu). On Android: menu ⋮ → **Install app**. On iPhone: Safari → Share → **Add to Home Screen**.

---

## How it works

- **Saving.** Progress is stored in the browser on that device. She should use **Profile → Download backup** now and then (the app reminds her every two weeks). The same file moves her progress to another device: download on one, **Restore from a backup file** on the other.
- **The coach.** Every AI button builds a message that already includes her profile, her progress and the task, then opens a new chat in her free Claude or ChatGPT account. The message is also copied, so if the chat box is empty she just pastes (Ctrl+V). For new exercises, tailored projects and the portfolio intro, she pastes the AI's answer back into the app, and the app checks and adds it. Every generated exercise solution is tested on the practice database first.
- **Daily refresh.** Every morning around 05:15 Polish time, the workflow:
  - reads justjoin.it's public listings for junior SQL, data, analytics and support roles, and keeps the relevant ones in Poland or remote;
  - asks GitHub for open beginner issues in the recommended open source projects;
  - saves both into `site/data/` and republishes the site.

  You can also run it any time from **Actions → Refresh and publish → Run workflow**.
- **Offline.** Once opened, the app and the SQL Lab work without internet. Openings and issues show the last downloaded list.

## If something goes wrong

- **Openings stop updating.** Open **Actions** and click the latest run. If the "Refresh job openings" step shows a warning, justjoin.it may have changed its pages. The app keeps showing the previous list, so nothing breaks. Copy the step's log and ask Claude to fix `scripts/refresh-jobs.mjs`.
- **GitHub says the scheduled workflow was disabled.** GitHub can pause schedules in repositories with no activity for 60 days. The daily data updates normally keep it active. If it happens, open **Actions → Refresh and publish** and click **Enable workflow**.
- **The coach opens an empty chat.** Paste with Ctrl+V (Cmd+V on a Mac). The message is always copied too.
- **Progress disappeared.** That usually means the browser data was cleared, or a private window was used. Restore from the latest backup file.

## Changing the app

The site is built from the files in `src/`. After editing them, run `python3 build.py` (it regenerates `site/index.html` and `site/sw.js`) and commit. Job and issue data live in `site/data/` and are rewritten by the daily workflow.
