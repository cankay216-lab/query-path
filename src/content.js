// ---------- Roadmap, guided projects, toolkit ----------
const ROADMAP = [
  { w: 1, phase: 'Foundations', title: 'Set up and warm up', goal: 'A working SQL Server at home, and the basics back in your fingers.', tasks: [
    ['r1-1', 'Fill in your profile in this platform (the coach uses it)', 'profile'],
    ['r1-2', 'Install SQL Server Developer edition (free) and SSMS on your laptop', 'toolkit'],
    ['r1-3', 'Install the AdventureWorks sample database and run 5 queries on it', 'toolkit'],
    ['r1-4', 'SQL Lab: finish all "Basics refresh" exercises', 'lab'],
    ['r1-5', 'SQL Lab: finish all "Joins" exercises', 'lab'],
    ['r1-6', 'Tidy your GitHub profile: photo, short bio, pinned repos section', null] ] },
  { w: 2, phase: 'Foundations', title: 'Aggregation and picking a target', goal: 'Comfortable with GROUP BY, and a clear idea of which jobs to aim at.', tasks: [
    ['r2-1', 'SQL Lab: finish "Aggregation" and "Subqueries & CTEs"', 'lab'],
    ['r2-2', 'Do 10 problems from LeetCode "SQL 50"', 'toolkit'],
    ['r2-3', 'Read about normalization (1NF–3NF) and explain it to the coach in your own words', 'coach'],
    ['r2-4', 'Save 10 real job ads you would apply to in the Job tracker', 'jobs'],
    ['r2-5', 'Use "Analyze ad" on 3 of them and note the skills that keep repeating', 'jobs'] ] },
  { w: 3, phase: 'Project 1', title: 'Clinic database: design', goal: 'A designed schema with real constraints, before writing any queries.', tasks: [
    ['r3-1', 'Project 1: steps 1–4 (requirements, ERD, tables, sample data)', 'projects'],
    ['r3-2', 'SQL Lab: finish "Window functions"', 'lab'],
    ['r3-3', 'Ask the coach to review your ERD and table design', 'coach'],
    ['r3-4', 'Do 10 more LeetCode SQL 50 problems', 'toolkit'] ] },
  { w: 4, phase: 'Project 1', title: 'Clinic database: logic and publish', goal: 'Project 1 on GitHub with a README a recruiter can read in 2 minutes.', tasks: [
    ['r4-1', 'Project 1: steps 5–10 (views, procedures, trigger, indexes, README, publish)', 'projects'],
    ['r4-2', 'Start the free DP-900 learning path on Microsoft Learn', 'toolkit'],
    ['r4-3', 'SQL Lab: finish "Interview classics"', 'lab'],
    ['r4-4', 'Pin Project 1 on your GitHub profile', null] ] },
  { w: 5, phase: 'Project 2', title: 'Public data analysis: build', goal: 'Real Polish data loaded, cleaned and modelled. Applications start this week.', tasks: [
    ['r5-1', 'Project 2: steps 1–5 (question, data, import, cleaning, model)', 'projects'],
    ['r5-2', 'Write CV version 1 and get it reviewed by the coach (CV mode)', 'coach'],
    ['r5-3', 'Update LinkedIn: headline, about, skills, Project 1 in "Featured"', null],
    ['r5-4', 'Send your first 5 applications (log them in the tracker)', 'jobs'] ] },
  { w: 6, phase: 'Project 2', title: 'Public data analysis: insights', goal: 'A Power BI dashboard and three findings you can talk about.', tasks: [
    ['r6-1', 'Project 2: steps 6–10 (analysis queries, dashboard, insights, README, post)', 'projects'],
    ['r6-2', 'Take the DP-900 exam', 'toolkit'],
    ['r6-3', 'SQL Lab: finish "Changing data"', 'lab'],
    ['r6-4', 'Send 5 applications and follow up on last week\'s', 'jobs'] ] },
  { w: 7, phase: 'Project 3', title: 'Svelte app on your database: API', goal: 'Your frontend experience joined to your SQL: a working API over the clinic database.', tasks: [
    ['r7-1', 'Project 3: steps 1–4 (plan, API, parameterized queries, procedures)', 'projects'],
    ['r7-2', 'First mock technical interview with the coach', 'coach'],
    ['r7-3', 'Send 5 applications', 'jobs'] ] },
  { w: 8, phase: 'Project 3', title: 'Svelte app: UI and deploy', goal: 'A live link anyone can click, plus a portfolio site.', tasks: [
    ['r8-1', 'Project 3: steps 5–8 (UI, error handling, deploy, README)', 'projects'],
    ['r8-2', 'Build your portfolio page in the Portfolio section and put it on GitHub Pages', 'portfolio'],
    ['r8-3', 'Send 5 applications', 'jobs'] ] },
  { w: 9, phase: 'Project 4', title: 'Performance tuning case study', goal: 'Proof you understand what happens inside the engine.', tasks: [
    ['r9-1', 'Project 4: all steps', 'projects'],
    ['r9-2', 'Start the PL-300 (Power BI) learning path', 'toolkit'],
    ['r9-3', 'Send 5 applications', 'jobs'],
    ['r9-4', 'Open source: practise a pull request and pick one project', 'opensource'] ] },
  { w: 10, phase: 'Targeting', title: 'First tailored project', goal: 'A small project built for one specific company you really want.', tasks: [
    ['r10-1', 'Pick your dream ad in the tracker and generate a tailored project', 'jobs'],
    ['r10-2', 'Build it (one weekend) and link it in that application', 'projects'],
    ['r10-3', 'Behavioral mock interview with the coach', 'coach'],
    ['r10-4', 'Optional: Project 5 (support toolkit) if you target support roles', 'projects'] ] },
  { w: 11, phase: 'Targeting', title: 'Second tailored project and people', goal: 'Referrals and conversations, not only applications.', tasks: [
    ['r11-1', 'Build a second tailored project', 'projects'],
    ['r11-2', 'Go to one meetup or online community event and talk to 2 people', 'toolkit'],
    ['r11-3', 'Message 5 people at companies you applied to (polite, short, specific)', null],
    ['r11-4', 'Follow up on every application older than 10 days', 'jobs'],
    ['r11-5', 'Open source: open your first real pull request', 'opensource'] ] },
  { w: 12, phase: 'Review', title: 'Review and keep the rhythm', goal: 'Look back, fix weak spots, and set the routine that continues after week 12.', tasks: [
    ['r12-1', 'Second mock technical interview, then fix every weak topic it found', 'coach'],
    ['r12-2', 'Refresh CV and portfolio with everything built since week 5', 'portfolio'],
    ['r12-3', 'Book the PL-300 exam date', 'toolkit'],
    ['r12-4', 'Write down a weekly routine: X applications, Y practice problems, 1 follow-up day', null] ] }
];

const PROJECTS = [
  { id: 'p1', code: 'P1', title: 'Clinic booking database', tag: 'Database design · T-SQL',
    role: 'Database / T-SQL Developer, Support',
    summary: 'Design and build the database behind a small private clinic ("Przychodnia"): patients, doctors, specialisations, schedules, appointments and an audit log.',
    why: 'Shows the skills a database developer is hired for: modelling a real domain, enforcing rules with constraints, writing stored procedures with transactions, and thinking about indexes. It is also the foundation for Project 3.',
    skills: ['ERD & normalization', 'DDL & constraints', 'Stored procedures', 'Transactions', 'Triggers', 'Indexes', 'Git'],
    hours: '20–25 h',
    steps: [
      { t: 'Write requirements as user stories', d: 'Write 8–12 short stories like "As a receptionist I can book a patient with a doctor for a free 20-minute slot". Include rules: no double booking, cancellations allowed up to 24 h before, each doctor has one or more specialisations.', out: 'requirements.md in the repo' },
      { t: 'Draw the ERD', d: 'Use dbdiagram.io or draw.io. Aim for 7–9 tables: patients, doctors, specializations, doctor_specializations (many-to-many), rooms, schedules, appointments, appointment_status, audit_log. Check each table against 3NF.', out: 'ERD image + the diagram source' },
      { t: 'Write the DDL with real constraints', d: 'CREATE TABLE scripts with PRIMARY KEY, FOREIGN KEY, UNIQUE (e.g. one appointment per doctor per start time), CHECK (end after start, status values), DEFAULT (created_at = SYSUTCDATETIME()). Use NVARCHAR for names with Polish letters, DATE/DATETIME2, DECIMAL for money.', out: '01_schema.sql' },
      { t: 'Generate realistic sample data', d: '200 patients, 15 doctors, 3 months of appointments. Use a script (T-SQL loops, or Python + Faker with the pl_PL locale). Never use real personal data; generate fake PESEL-like numbers.', out: '02_seed.sql' },
      { t: 'Create views for everyday questions', d: 'v_doctor_daily_schedule, v_upcoming_appointments, v_doctor_utilisation (booked vs available hours per week).', out: '03_views.sql' },
      { t: 'Write stored procedures with transactions', d: 'usp_BookAppointment (checks the slot is free inside a transaction, uses TRY/CATCH and THROW with clear error messages), usp_CancelAppointment (enforces the 24 h rule), usp_GetFreeSlots(@doctor_id, @date).', out: '04_procedures.sql + test calls' },
      { t: 'Add an audit trigger', d: 'An AFTER UPDATE trigger on appointments that writes old and new status, who and when into audit_log. Handle multi-row updates by using the inserted/deleted tables, not variables.', out: '05_triggers.sql' },
      { t: 'Index for the real queries', d: 'Add nonclustered indexes that support usp_GetFreeSlots and the views. Capture one execution plan before and after (screenshot) and note logical reads from SET STATISTICS IO ON.', out: '06_indexes.sql + before/after screenshots' },
      { t: 'Write the README', d: 'Problem, ERD image, design decisions (why this key, why this constraint), how to run the scripts in order, 5 example queries with output, what you would add next. Use the README outline below.', out: 'README.md' },
      { t: 'Publish and pin it', d: 'Push to GitHub with sensible commits (not one giant commit), pin the repo, add the link to this project here so it flows into your portfolio.', out: 'Public GitHub repo' }
    ],
    readme: ['Project title + one-sentence pitch', 'ERD image', 'The business rules the database enforces', 'Tech: SQL Server 2022/2025, T-SQL, SSMS', 'How to run: scripts 01–06 in order', 'Key design decisions (3–5 bullets)', 'Example queries with screenshots of results', 'Performance notes (index + before/after)', 'What I would add next'],
    talk: ['How you prevented double bookings (UNIQUE constraint + transaction in the procedure)', 'Why you chose surrogate keys vs natural keys', 'How your trigger handles multi-row updates', 'One index you added and the measured difference'] },

  { id: 'p2', code: 'P2', title: 'Polish public data analysis', tag: 'Analysis · Power BI',
    role: 'Data / BI Analyst',
    summary: 'Pick a real question about Poland, answer it with public data from GUS, NBP or dane.gov.pl, and present it in a Power BI dashboard with three clear findings.',
    why: 'Analyst roles want proof you can go from messy real data to a business answer. A Polish dataset makes it memorable for Polish interviewers, and the dashboard gives a screenshot for your CV and LinkedIn.',
    skills: ['Data import', 'Data cleaning', 'Star schema', 'CTEs & window functions', 'Power BI', 'Storytelling'],
    hours: '20–30 h',
    steps: [
      { t: 'Choose one question', d: 'Examples: "How have food prices changed by voivodeship since 2020?" (GUS BDL), "How did PLN move against EUR, USD and CHF around big events?" (NBP API), "Where are new flats being built?" (GUS). One question, not five.', out: 'One sentence question in the README' },
      { t: 'Get the data', d: 'Download CSV/JSON from bdl.stat.gov.pl, api.nbp.pl or dane.gov.pl. Keep the raw files untouched in a /data/raw folder and note the source URL and download date.', out: 'Raw files + sources list' },
      { t: 'Load into staging tables', d: 'Create stg_ tables with permissive types (NVARCHAR), load with the SSMS Import Flat File wizard or BULK INSERT. Staging first, clean later: this is how real ETL works.', out: '01_staging.sql' },
      { t: 'Clean and check data quality', d: 'Convert types (TRY_CAST, TRY_CONVERT), fix Polish decimal commas, trim text, handle missing values. Write checks: row counts, duplicate keys, nulls per column, min/max dates. Keep the checks as a script.', out: '02_clean.sql + 03_quality_checks.sql' },
      { t: 'Model as a small star schema', d: 'One fact table (e.g. fact_price) and dimensions (dim_date, dim_region, dim_product). Add keys. Explain why a star schema suits reporting.', out: '04_model.sql + diagram' },
      { t: 'Write the analysis queries', d: 'At least 6 queries that use CTEs and window functions: year-over-year change with LAG, ranking regions with DENSE_RANK, running totals, a moving 3-month average.', out: '05_analysis.sql with comments' },
      { t: 'Build the Power BI dashboard', d: 'Connect Power BI Desktop to SQL Server. 1 page overview + 1 detail page. A date slicer, a region map or bar, a trend line, 3 KPI cards. Write 2–3 DAX measures (e.g. YoY %).', out: '.pbix file + screenshots' },
      { t: 'Write three insights', d: 'Three findings, each with a number and a "so what". Example: "Prices in X rose 14% faster than the national average since 2022, driven mostly by Y."', out: 'insights section in README' },
      { t: 'README with screenshots', d: 'Question, sources, pipeline diagram (raw → staging → clean → star → Power BI), insights, how to reproduce.', out: 'README.md' },
      { t: 'Share it', d: 'Publish on GitHub and write a short LinkedIn post with the dashboard screenshot and the most surprising finding. Recruiters do read these.', out: 'GitHub repo + LinkedIn post' }
    ],
    readme: ['Question in one sentence', 'Dashboard screenshot', 'Three insights with numbers', 'Data sources with dates', 'Pipeline: raw → staging → clean → model → Power BI', 'Data quality checks performed', 'Example SQL (window functions)', 'How to reproduce', 'Limitations'],
    talk: ['A data-quality problem you found and how you fixed it', 'Why staging tables before transformation', 'What a star schema is and why you used it', 'The finding that surprised you most'] },

  { id: 'p3', code: 'P3', title: 'Svelte app on your own database', tag: 'Full stack · Svelte + SQL',
    role: 'All roles: this is your differentiator',
    summary: 'Put a small Svelte frontend and a Node API on top of the Project 1 clinic database: search doctors, see free slots, book and cancel appointments.',
    why: 'Very few SQL juniors can show a working app built on their own database. It uses your frontend internship, proves you understand how applications talk to databases, and gives recruiters something to click.',
    skills: ['SvelteKit', 'Node.js API', 'Parameterized queries', 'SQL injection', 'Stored procedures from code', 'Deployment'],
    hours: '20–30 h',
    steps: [
      { t: 'Plan 4 screens and 5 endpoints', d: 'Screens: doctor search, doctor detail with free slots, booking form, my appointments. Endpoints: GET /doctors, GET /doctors/:id/slots, POST /appointments, DELETE /appointments/:id, GET /patients/:id/appointments.', out: 'Short plan in README' },
      { t: 'Build the API', d: 'SvelteKit server routes or a small Express app using the "mssql" npm package. Read the connection string from environment variables, never commit secrets.', out: 'Working API locally' },
      { t: 'Use parameterized queries only', d: 'Never build SQL by string concatenation. Use request.input() parameters. Try a SQL injection string on purpose and show in the README that it fails.', out: 'Security section in README' },
      { t: 'Call your stored procedures', d: 'Booking and cancelling go through usp_BookAppointment and usp_CancelAppointment from Project 1. Map the THROW errors to friendly messages.', out: 'API uses the procedures' },
      { t: 'Build the Svelte UI', d: 'Clean, simple and responsive. Loading and empty states. This is where your internship experience shows.', out: '4 working screens' },
      { t: 'Handle errors properly', d: 'Slot already taken, cancelling too late, database unreachable: each shows a clear message, not a crash.', out: 'Error states' },
      { t: 'Deploy', d: 'Database on the Azure SQL Database free offer, app on Vercel or Netlify. If deployment gets stuck, record a 90-second demo video instead.', out: 'Live link or demo video' },
      { t: 'README and demo GIF', d: 'Architecture diagram (Svelte → API → SQL Server procedures), screenshots or GIF, how to run locally.', out: 'README.md' }
    ],
    readme: ['What it does + live link', 'Demo GIF', 'Architecture: Svelte → API → stored procedures → SQL Server', 'Security: parameterized queries, secrets in env vars', 'How to run locally', 'What I learned'],
    talk: ['How a request travels from the button to the database and back', 'What SQL injection is and how you prevented it', 'Why business rules live in stored procedures here', 'What you would change for 10,000 users'] },

  { id: 'p4', code: 'P4', title: 'Query performance case study', tag: 'Performance · Execution plans',
    role: 'Database Developer, Data Engineer',
    summary: 'Make a large table, write slow queries on purpose, then fix them step by step with indexes and rewrites, measuring every change.',
    why: 'Tuning questions separate juniors who memorised syntax from those who understand the engine. A short write-up with before/after numbers is rare and impressive.',
    skills: ['Execution plans', 'Clustered vs nonclustered', 'Covering indexes', 'SARGability', 'Statistics', 'Measuring'],
    hours: '8–12 h',
    steps: [
      { t: 'Build a big table', d: 'Generate 1–2 million rows of orders in SQL Server (a numbers CTE or GENERATE_SERIES in 2022+).', out: '01_generate.sql' },
      { t: 'Write 5 slow queries', d: 'A function on a column in WHERE (YEAR(order_date) = 2025), leading-wildcard LIKE, SELECT * with a key lookup, an implicit conversion (NVARCHAR vs VARCHAR), an OR across columns.', out: '02_slow_queries.sql' },
      { t: 'Measure the baseline', d: 'SET STATISTICS IO, TIME ON. Save the actual execution plans. Record logical reads and CPU time in a table.', out: 'Baseline table' },
      { t: 'Fix them one at a time', d: 'Rewrite for SARGability, add a nonclustered index, make it covering with INCLUDE, fix the data type. Re-measure after each single change.', out: '03_fixes.sql' },
      { t: 'Write it up', d: 'A README with a before/after table, plan screenshots and one paragraph per fix on why it worked.', out: 'README.md' }
    ],
    readme: ['Setup (row counts, hardware)', 'Before/after table: logical reads and CPU ms', 'Plan screenshots', 'One paragraph per fix', 'Trade-offs: indexes cost writes and storage'],
    talk: ['What SARGable means, with your example', 'Clustered vs nonclustered index', 'What a key lookup is and how INCLUDE removes it', 'Why you measure logical reads, not just time'] },

  { id: 'p5', code: 'P5', title: 'Support engineer SQL toolkit', tag: 'Support · Troubleshooting',
    role: 'Application Support / L2',
    summary: 'A repository of documented troubleshooting scripts and a runbook, built on the practice shop database or AdventureWorks.',
    why: 'Support roles in Polish service centres use SQL daily to investigate tickets. Showing a ready toolkit and a runbook speaks their language directly.',
    skills: ['Investigative queries', 'Data quality checks', 'Safe updates', 'Runbooks', 'Documentation'],
    hours: '6–10 h',
    steps: [
      { t: 'Collect 10 realistic tickets', d: 'Write them like real tickets: "Customer says order 1234 was charged twice", "Report shows fewer orders than yesterday", "User cannot log in after email change".', out: 'tickets.md' },
      { t: 'Write an investigation script per ticket', d: 'Read-only queries that find the cause: duplicates, orphan rows, status mismatches, recent changes.', out: 'scripts/ folder' },
      { t: 'Write safe fix scripts', d: 'Every fix: SELECT first to preview, BEGIN TRAN, the change, a check, then COMMIT or ROLLBACK. Explain why.', out: 'fixes/ folder' },
      { t: 'Write a runbook', d: 'A step-by-step guide for the most common issue, as if for a new colleague on their first week.', out: 'RUNBOOK.md' }
    ],
    readme: ['Who this is for', 'Ticket → script index table', 'Safety rules for fixes', 'Link to the runbook'],
    talk: ['How you investigate a "data looks wrong" ticket', 'Why preview + transaction before any fix', 'How you explain a technical cause to a non-technical user'] }
];

const STATUSES = [
  { id: 'saved', name: 'Saved' }, { id: 'applied', name: 'Applied' }, { id: 'screen', name: 'HR screen' },
  { id: 'tech', name: 'Technical' }, { id: 'final', name: 'Final round' }, { id: 'offer', name: 'Offer' }, { id: 'rejected', name: 'Rejected' }
];

const ROLE_OPTIONS = ['Data / BI Analyst', 'Database / T-SQL Developer', 'Application Support (L2)', 'Junior Data Engineer', 'QA / Tester with SQL'];

const RESOURCES = [
  { h: 'Daily SQL practice', items: [
    ['LeetCode: SQL 50 study plan', 'https://leetcode.com/studyplan/top-sql-50/', 'The standard interview set. One or two a day.'],
    ['DataLemur', 'https://datalemur.com/', 'SQL questions taken from real company interviews.'],
    ['StrataScratch', 'https://www.stratascratch.com/', 'Analyst-style questions on realistic datasets.'],
    ['SQLBolt', 'https://sqlbolt.com/', 'Quick interactive refresher if a topic feels rusty.'],
    ['Use The Index, Luke', 'https://use-the-index-luke.com/', 'Free, clear explanation of indexes. Read before Project 4.'] ] },
  { h: 'Tools to install', items: [
    ['SQL Server downloads (Developer edition, free)', 'https://www.microsoft.com/en-us/sql-server/sql-server-downloads', 'The full engine for learning and portfolio projects.'],
    ['SQL Server Management Studio (SSMS)', 'https://learn.microsoft.com/en-us/ssms/', 'The tool employers expect you to know.'],
    ['AdventureWorks sample databases', 'https://learn.microsoft.com/en-us/sql/samples/adventureworks-install-configure', 'Microsoft\'s practice database, mentioned in many tutorials.'],
    ['Power BI Desktop', 'https://www.microsoft.com/en-us/power-platform/products/power-bi/desktop', 'Free. Needed for Project 2.'],
    ['dbdiagram.io', 'https://dbdiagram.io/', 'Draw ERDs from text. Good for Project 1.'],
    ['GitHub Pages', 'https://pages.github.com/', 'Free hosting for the portfolio page.'] ] },
  { h: 'Certifications', items: [
    ['DP-900: Azure Data Fundamentals', 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/', 'Entry level, free learning path, cheap exam, never expires. Good first CV line.'],
    ['PL-300: Power BI Data Analyst', 'https://learn.microsoft.com/en-us/credentials/certifications/data-analyst-associate/', 'The certificate Polish analyst job ads ask for most. After Project 2.'] ] },
  { h: 'Job boards in Poland', items: [
    ['justjoin.it', 'https://justjoin.it/', 'IT jobs with salary ranges. Filter: Data, Junior.'],
    ['No Fluff Jobs', 'https://nofluffjobs.com/pl', 'Always shows salary. Good filters for junior roles.'],
    ['Pracuj.pl', 'https://www.pracuj.pl/', 'The biggest general board; many service-centre and support roles.'],
    ['theprotocol.it', 'https://theprotocol.it/', 'IT-focused, many corporate employers.'],
    ['Bulldogjob', 'https://bulldogjob.pl/', 'IT jobs and articles.'],
    ['LinkedIn Jobs', 'https://www.linkedin.com/jobs/', 'Set alerts for "Junior SQL", "Data Analyst", "Application Support".'] ] },
  { h: 'Public data for projects', items: [
    ['GUS Bank Danych Lokalnych', 'https://bdl.stat.gov.pl/', 'Statistics Poland: regional data on almost everything.'],
    ['dane.gov.pl', 'https://dane.gov.pl/', 'The national open data portal.'],
    ['NBP API', 'https://api.nbp.pl/', 'Exchange rates and gold prices, free JSON/CSV.'] ] },
  { h: 'People and communities', items: [
    ['SQLDay', 'https://sqlday.pl/', 'The big Polish data-platform conference, held in Wrocław.'],
    ['Meetup.com', 'https://www.meetup.com/', 'Search "SQL", "Power BI" or "Data" in your city. Juniors are welcome and referrals happen here.'] ] }
];

const CV_CHECKLIST = [
  'One page. Junior CVs over one page get skimmed, not read.',
  'Put Projects above Education. Each project: one line on what it is, one on the skills, and the GitHub link.',
  'A "Skills" line that matches the ad\'s wording (T-SQL, SQL Server, Power BI, Git…). Many companies filter CVs automatically.',
  'The internship written as results: "Built X in Svelte", "Configured SQL Server environments for Y".',
  'English CV for international companies and service centres; Polish CV for Polish companies.',
  'Links that work: GitHub, LinkedIn, portfolio page.',
  'The RODO consent clause at the bottom (Polish employers still expect it).',
  'Save as PDF named Firstname_Lastname_CV.pdf.'
];

const RODO_CLAUSE = 'Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (RODO).';

const INTERVIEW_QS = [
  ['Concepts', 'What is the difference between INNER JOIN and LEFT JOIN?'],
  ['Concepts', 'What is the difference between WHERE and HAVING?'],
  ['Concepts', 'Explain normalization and the first three normal forms.'],
  ['Concepts', 'What is a primary key vs a foreign key vs a unique constraint?'],
  ['Concepts', 'How does NULL behave in comparisons, COUNT(*) vs COUNT(column), and NOT IN?'],
  ['Concepts', 'What are ACID properties? What is a transaction?'],
  ['Concepts', 'DELETE vs TRUNCATE vs DROP.'],
  ['Concepts', 'UNION vs UNION ALL.'],
  ['Engine', 'Clustered vs nonclustered index. When would you not add an index?'],
  ['Engine', 'What does SARGable mean? Give an example of a non-SARGable query.'],
  ['Engine', 'How would you investigate a query that suddenly became slow?'],
  ['Engine', 'What is an execution plan and what do you look for in it?'],
  ['Engine', 'What are isolation levels? What is a deadlock?'],
  ['Writing SQL', 'Find the second-highest salary.'],
  ['Writing SQL', 'Find duplicates in a table and delete all but one.'],
  ['Writing SQL', 'Top N per group (e.g. top 3 products per category).'],
  ['Writing SQL', 'ROW_NUMBER vs RANK vs DENSE_RANK.'],
  ['Writing SQL', 'Running total and month-over-month change.'],
  ['Writing SQL', 'Customers with no orders.'],
  ['T-SQL', 'Stored procedure vs function vs view.'],
  ['T-SQL', 'How do you handle errors in T-SQL? (TRY/CATCH, THROW, XACT_STATE)'],
  ['T-SQL', 'Temp table vs table variable vs CTE.'],
  ['T-SQL', 'What are triggers and why are many teams careful with them?'],
  ['Analyst', 'How would you check that a dataset is clean before analysing it?'],
  ['Analyst', 'A KPI dropped 20% overnight. How do you investigate?'],
  ['Analyst', 'Explain a star schema. Fact vs dimension.'],
  ['Behavioral', 'Tell me about yourself (the 60-second version).'],
  ['Behavioral', 'Tell me about a project you are proud of.'],
  ['Behavioral', 'Tell me about a time you got stuck and how you got unstuck.'],
  ['Behavioral', 'Why this company, and why SQL?']
];

const DEFAULT_BACKGROUND = 'General IT graduate from a Polish university. One internship as a frontend developer (HTML, CSS, JavaScript, Svelte), where I also configured SQL Server environments. Knows SQL basics and wants a first job working with SQL.';

// ---------- Open source ----------
const OSS_STEPS = [
  { t: 'Practise the workflow on a training repo', d: 'Follow the "first-contributions" tutorial: fork, clone, create a branch, commit, push and open a pull request. It takes about 30 minutes and exists only so beginners can practise without pressure.', out: 'One practice pull request' },
  { t: 'Pick one project that matches your target role', d: 'Choose from the list below. A project you would actually use is easier to understand and gives a better interview story. Stick with one project rather than jumping between five.', out: 'A chosen repository' },
  { t: 'Read the README and CONTRIBUTING guide, then run it locally', d: 'Every project explains how it wants contributions. Set up the development environment and run the tests before changing anything. If setup fails, that is often your first contribution: fix the setup docs.', out: 'Project running on your laptop' },
  { t: 'Find a beginner issue', d: 'Open the project\'s "Beginner issues" link (good first issue, help wanted and documentation labels). If it is empty, open "All issues", sort by newest, and look for small bugs, unclear docs or missing examples. Skip issues that already have an assignee or a linked pull request, and prefer ones with recent activity. You can also ask in the project\'s Discussions or chat which small task would help.', out: 'An issue you understand' },
  { t: 'Ask to work on it', d: 'Leave a short, polite comment: what you understood, how you plan to fix it, and a question if something is unclear. Wait for a maintainer to say yes before investing hours. The coach below can draft this comment.', out: 'A maintainer\'s go-ahead' },
  { t: 'Make a small, focused change', d: 'Create a branch, change only what the issue needs, add or update a test if the project has tests, and run the linters. Small pull requests get reviewed and merged; big ones wait.', out: 'Commits on your branch' },
  { t: 'Open the pull request', d: 'Follow the project\'s template. Title says what changes. The description says why, how you tested it, and links the issue ("Fixes #123"). Screenshots for anything visual.', out: 'An open pull request' },
  { t: 'Respond to review', d: 'Reviewers will ask for changes. That is normal and is the part interviewers like to hear about. Reply politely, push fixes, and if nobody answers for a week, leave one friendly reminder.', out: 'Review addressed' },
  { t: 'Show it off', d: 'Once merged: add it to your CV ("Contributor to SQLFluff: fixed T-SQL parsing of X, PR #1234"), mention it on LinkedIn, and log it below so it appears on your portfolio page.', out: 'CV, LinkedIn and portfolio updated' }
];

const OSS_REPOS = [
  { g: 'Best matches for you', items: [
    { name: 'Evidence', repo: 'evidence-dev/evidence', lang: 'JavaScript · Svelte · SQL', what: 'Builds BI reports from SQL queries and Markdown, and its interface is written in Svelte.', fit: 'A rare project that uses both of your skills, SQL and Svelte. Good for analyst and BI roles.', how: 'Docs fixes, small component bugs, examples.' },
    { name: 'SQLFluff', repo: 'sqlfluff/sqlfluff', lang: 'Python · SQL', what: 'The most popular SQL linter and formatter, with a T-SQL dialect.', fit: 'Many issues are "this valid T-SQL fails to parse", where SQL knowledge matters more than Python. Good for database developer roles.', how: 'T-SQL dialect fixes with a test case written in SQL, rule docs.' },
    { name: 'SQL Server docs', repo: 'MicrosoftDocs/sql-docs', lang: 'Markdown', what: 'The official SQL Server documentation on Microsoft Learn.', fit: 'The easiest first pull request, on the exact product employers use. Use the pencil (Edit) icon on any learn.microsoft.com SQL page.', how: 'Fix unclear explanations, broken examples, typos.' } ] },
  { g: 'SQL tools', items: [
    { name: 'sqlglot', repo: 'tobymao/sqlglot', lang: 'Python', what: 'Parses SQL and translates it between dialects, including T-SQL.', fit: 'Harder, but a merged fix here impresses data engineers. Maintainers respond fast.', how: 'Report or fix a wrong translation, with a test.' },
    { name: 'Datasette', repo: 'simonw/datasette', lang: 'Python · SQLite', what: 'Explore and publish SQLite data on the web.', fit: 'Friendly project with a plugin system. Writing a small plugin is a great standalone portfolio piece.', how: 'Docs, small bugs, or your own plugin.' },
    { name: 'DBeaver', repo: 'dbeaver/dbeaver', lang: 'Java', what: 'A widely used free database client.', fit: 'Good if you like tools; Java knowledge needed for code changes.', how: 'Detailed bug reports with reproduction steps, small fixes.' } ] },
  { g: 'BI and analytics', items: [
    { name: 'dbt docs', repo: 'dbt-labs/docs.getdbt.com', lang: 'Markdown', what: 'Documentation for dbt, the standard tool for transforming data with SQL.', fit: 'dbt appears in more and more analyst and data engineer ads. Docs pull requests are a gentle start.', how: 'Clarify guides, fix examples.' },
    { name: 'dbt-core', repo: 'dbt-labs/dbt-core', lang: 'Python', what: 'The dbt engine itself.', fit: 'For later, once you have used dbt in a project.', how: 'Issues labelled good first issue.' },
    { name: 'Apache Superset', repo: 'apache/superset', lang: 'Python · TypeScript', what: 'An open source BI and dashboard platform.', fit: 'Large Apache community with a clear process. Frontend issues suit your internship experience.', how: 'Frontend bugs, docs, translations.' },
    { name: 'Metabase', repo: 'metabase/metabase', lang: 'Clojure · TypeScript', what: 'A popular open source BI tool.', fit: 'Frontend issues are in TypeScript; good if you used it in Project 2.', how: 'Issues labelled Help Wanted, docs.' },
    { name: 'Lightdash', repo: 'lightdash/lightdash', lang: 'TypeScript', what: 'BI on top of dbt projects.', fit: 'Combines frontend and analytics engineering.', how: 'Good first issues, docs.' },
    { name: 'DuckDB docs', repo: 'duckdb/duckdb-web', lang: 'Markdown · SQL', what: 'Docs for DuckDB, the fast-growing in-process analytics database.', fit: 'Lots of SQL examples to improve; DuckDB is increasingly common in data teams.', how: 'Fix and add SQL examples.' } ] },
  { g: 'Svelte (your frontend side)', items: [
    { name: 'shadcn-svelte', repo: 'huntabyte/shadcn-svelte', lang: 'Svelte · TypeScript', what: 'A popular Svelte component collection.', fit: 'Use it in Project 3, then fix what you notice.', how: 'Docs, small component fixes.' },
    { name: 'Skeleton', repo: 'skeletonlabs/skeleton', lang: 'Svelte · TypeScript', what: 'A Svelte UI toolkit.', fit: 'Friendly to newcomers.', how: 'Docs, examples, small bugs.' },
    { name: 'SvelteKit', repo: 'sveltejs/kit', lang: 'TypeScript', what: 'The Svelte app framework.', fit: 'Core issues are hard; docs and examples are realistic.', how: 'Documentation improvements.' } ] },
  { g: 'Practice', items: [
    { name: 'First Contributions', repo: 'firstcontributions/first-contributions', lang: 'Any', what: 'A repository that exists so beginners can practise a pull request.', fit: 'Do this first (step 1).', how: 'Add your name, following the tutorial.' } ] }
];

const OSS_FINDERS = [
  ['GitHub search: open beginner issues mentioning SQL', 'https://github.com/search?q=label%3A%22good+first+issue%22+is%3Aopen+is%3Aissue+sql&type=issues&s=created&o=desc'],
  ['goodfirstissue.dev', 'https://goodfirstissue.dev/'],
  ['Up For Grabs', 'https://up-for-grabs.net/'],
  ['First Contributions tutorial', 'https://github.com/firstcontributions/first-contributions']
];

const OSS_ISSUE_QUERY = encodeURIComponent('is:issue is:open no:assignee label:"good first issue","good_first_issue","help wanted",documentation,docs sort:created-desc');

const OSS_STATUSES = [
  { id: 'exploring', name: 'Exploring' }, { id: 'asked', name: 'Asked to work on it' }, { id: 'progress', name: 'In progress' },
  { id: 'pr', name: 'PR open' }, { id: 'changes', name: 'Changes requested' }, { id: 'merged', name: 'Merged' }, { id: 'closed', name: 'Closed' }
];
