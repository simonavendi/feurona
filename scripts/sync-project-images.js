const fs = require("fs");
const path = require("path");
const https = require("https");

const CDN_ROOT = "cdn.myportfolio.com/8f9e97e6-b4e9-4f72-a8ba-dc4a7e833406";
const OUT_DIR = path.join("feurona.com", "dist", "images", "projects");

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

function localCdnPath(relativePath) {
  return path.join(...relativePath.replace(/^\.\.\//, "").split("/"));
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { Referer: "https://feurona.myportfolio.com/" } }, (res) => {
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);
  });
}

async function syncProject(slug) {
  const htmlPath = path.join("feurona.com", `${slug}.html`);
  if (!fs.existsSync(htmlPath)) return null;

  const hero = extractHeroImage(fs.readFileSync(htmlPath, "utf8"));
  if (!hero) return null;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const ext = path.extname(hero) || ".jpg";
  const outFile = path.join(OUT_DIR, `${slug}${ext}`);
  const localSrc = localCdnPath(hero);

  if (fs.existsSync(localSrc)) {
    fs.copyFileSync(localSrc, outFile);
    return `dist/images/projects/${slug}${ext} (copied)`;
  }

  const remote = `https://${hero.replace(/^\.\.\//, "")}`;
  try {
    await download(remote, outFile);
    return `dist/images/projects/${slug}${ext} (downloaded)`;
  } catch (err) {
    if (fs.existsSync(outFile)) fs.unlinkSync(outFile);
    return null;
  }
}

async function main() {
  const slugs = process.argv.slice(2);
  const targets =
    slugs.length > 0
      ? slugs
      : [
          "zoo-project",
          "flame-brand",
          "so-balqan",
          "prospective-campaign-for-wizzair",
          "dimitrov-winery-label",
          "website-design-mychefskitchen",
        ];

  for (const slug of targets) {
    const result = await syncProject(slug);
    console.log(slug, result || "FAILED");
  }
}

main();
