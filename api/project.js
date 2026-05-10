import { list } from '@vercel/blob';

const MANIFEST_KEY = 'portfolio/entries.json';

async function getEntries() {
  try {
    const { blobs } = await list({ prefix: MANIFEST_KEY });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].url);
    return await res.json();
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  const { slug } = req.query;
  const entries = await getEntries();
  const entry = entries.find(e => e.slug === slug);
  if (!entry) return res.status(404).send('Not found');

  const images = [entry.coverImage, ...entry.images];
  const imageModules = images.map(url => `
    <div class="project-module module image project-module-image js-js-project-module">
      <img class="e2e-site-project-module-image" src="${url}" style="max-width:100%;display:block;margin:0 auto">
    </div>`).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${entry.description}" />
  <meta property="og:title" content="${entry.title}" />
  <meta property="og:image" content="${entry.coverImage}" />
  <link rel="stylesheet" href="/feurona.com/dist/css/main.css" type="text/css" />
  <link rel="stylesheet" href="../cdn.myportfolio.com/8f9e97e6-b4e9-4f72-a8ba-dc4a7e833406/50d9fb0ded87fac4ff91c881cc5a75b91764598855c1aa.css" type="text/css" />
  <title>${entry.title} — Feurona</title>
</head>
<body class="transition-enabled">
  <div class="js-responsive-nav">
    <div class="responsive-nav has-social">
      <div class="close-responsive-click-area js-close-responsive-nav"><div class="close-responsive-button"></div></div>
      <nav class="nav-container">
        <div class="gallery-title"><a href="/feurona.com/work.html">Work</a></div>
        <div class="page-title"><a href="/feurona.com/contact.html">Contact</a></div>
      </nav>
    </div>
  </div>
  <header class="site-header js-site-header js-fixed-nav">
    <nav class="nav-container">
      <div class="gallery-title"><a href="/feurona.com/work.html">Work</a></div>
      <div class="page-title"><a href="/feurona.com/contact.html">Contact</a></div>
    </nav>
    <div class="logo-wrap">
      <div class="logo e2e-site-logo-text logo-image">
        <a href="/feurona.com/work.html" class="image-link">
          <img src="../cdn.myportfolio.com/8f9e97e6-b4e9-4f72-a8ba-dc4a7e833406/7d88e3ff-c57a-4cc4-aa43-afb505810f66_rwc_0x0x700x700x40969014.png" alt="Feurona">
        </a>
      </div>
    </div>
    <div class="hamburger-click-area js-hamburger"><div class="hamburger"><i></i><i></i><i></i></div></div>
  </header>
  <div class="header-placeholder"></div>
  <div class="site-wrap cfix js-site-wrap">
    <div class="site-container">
      <div class="site-content e2e-site-content">
        <main>
          <section class="project-page-content">
            <div class="project-page-header">
              <h1 class="project-page-title">${entry.title}</h1>
              ${entry.description ? `<p class="project-page-description">${entry.description}</p>` : ''}
            </div>
            <div class="project-modules">
              ${imageModules}
            </div>
          </section>
          <section class="back-to-top">
            <a href="#"><span class="arrow">&uarr;</span><span class="preserve-whitespace">Back to Top</span></a>
          </section>
          <footer class="site-footer"></footer>
        </main>
      </div>
    </div>
  </div>
  <script type="text/javascript">var __config__ = {"pageTransition":true,"linkTransition":true,"disableDownload":true,"lightbox":{"enabled":true,"color":{"opacity":0.94,"hex":"#fff"}}};</script>
  <script type="text/javascript" src="/feurona.com/site/translations3288"></script>
  <script type="text/javascript" src="/feurona.com/dist/js/main3288.js"></script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
