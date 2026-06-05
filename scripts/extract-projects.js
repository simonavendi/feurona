const fs = require("fs");
const path = require("path");

const htmlDir = "feurona.com";
const skip = new Set(["index.html", "work.html", "contact.html"]);

function extractHeroImage(html) {
  const rwData = html.match(/data-src="\.\.\/cdn\.myportfolio\.com\/[^"]+_rw_[^"]+\.(jpg|png)"/);
  if (rwData) return rwData[0].slice(11, -1);

  const rwSrc = html.match(/src="\.\.\/cdn\.myportfolio\.com\/[^"]+_rw_[^"]+\.(jpg|png)"/);
  if (rwSrc) return rwSrc[0].slice(5, -1);

  const png = html.match(/data-src="\.\.\/cdn\.myportfolio\.com\/[^"]+\.png"/);
  if (png) return png[0].slice(11, -1);

  const src = html.match(/src="\.\.\/cdn\.myportfolio\.com\/[^"]+\.(jpg|png|jpeg|webp)"/i);
  if (src) return src[0].slice(5, -1);

  return null;
}

function imagePathForSlug(slug, heroPath) {
  const ext = path.extname(heroPath) || ".jpg";
  return `dist/images/projects/${slug}${ext}`;
}

function extractTitle(html) {
  const title = html.match(/<title>([^<]+)<\/title>/i);
  if (!title) return null;
  return title[1]
    .replace(/\s*—\s*Feurona.*$/i, "")
    .replace(/\s*-\s*Feurona.*$/i, "")
    .trim();
}

const projects = [];
for (const file of fs.readdirSync(htmlDir)) {
  if (!file.endsWith(".html") || skip.has(file)) continue;

  const html = fs.readFileSync(path.join(htmlDir, file), "utf8");
  const title = extractTitle(html);
  const hero = extractHeroImage(html);
  if (!title || !hero) continue;

  const slug = file.replace(/\.html$/, "");
  projects.push({
    href: file,
    image: imagePathForSlug(slug, hero),
    title,
  });
}

projects.sort((a, b) => a.title.localeCompare(b.title));

const imageDir = path.join(htmlDir, "dist/images/projects");
if (fs.existsSync(imageDir)) {
  const onDisk = new Map(
    fs.readdirSync(imageDir).map((file) => [file.replace(/\.[^.]+$/, ""), file])
  );
  for (const project of projects) {
    const slug = project.href.replace(/\.html$/, "");
    const file = onDisk.get(slug);
    if (file) project.image = `dist/images/projects/${file}`;
  }
}

fs.writeFileSync(
  path.join(htmlDir, "dist/js/projects-data.json"),
  JSON.stringify(projects, null, 2)
);
console.log("Extracted", projects.length, "projects");
