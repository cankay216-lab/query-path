"""Builds site/index.html and site/sw.js from the files in src/. Run: python3 build.py"""
import hashlib, pathlib
root = pathlib.Path(__file__).parent
src, site = root / 'src', root / 'site'
css = (src / 'style.css').read_text()
js = '\n'.join((src / f).read_text() for f in ['seed.js', 'exercises.js', 'content.js', 'core.js', 'views.js', 'app.js', 'web.js'])
html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Query Path</title>
<meta name="description" content="SQL practice, portfolio projects, coach and job search for a first SQL job.">
<meta name="theme-color" content="#2443c9">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Query Path">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,650&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<script async src="vendor/sql-asm.js"></script>
<style>
{css}
</style>
</head>
<body>
<noscript><p style="padding:24px">Query Path needs JavaScript turned on.</p></noscript>
<div class="app">
  <aside class="rail">
    <div class="brand"><b>Query<span>.</span>Path</b><small id="forName">SQL career studio</small></div>
    <nav class="nav" id="nav" aria-label="Sections"></nav>
    <div class="rail-foot"><button class="btn sm" id="installBtn" data-act="install" hidden>Install app</button><span class="save" id="saveState"><i></i>Loading…</span><span id="backupState"></span></div>
  </aside>
  <main id="main"></main>
</div>
<script>
{js}
</script>
</body>
</html>
'''
(site / 'index.html').write_text(html)
version = hashlib.sha1((html + (site / 'vendor' / 'sql-asm.js').read_bytes().hex()[:2000]).encode()).hexdigest()[:10]
(site / 'sw.js').write_text((src / 'sw.template.js').read_text().replace('__VERSION__', version))
print('built', len(html), 'bytes, version', version)
