/**
 * Mirror HTTrack-cached cdn.myportfolio.com images into dist/images/projects/{slug}/
 * and rewrite dist/js/project-details.json gallery URLs to local paths.
 *
 * Run from feurona.com: node scripts/mirror-cdn-galleries.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(ROOT, "..");
const CDN_ROOT = path.join(REPO_ROOT, "cdn.myportfolio.com");
const PROJECTS_DATA = path.join(ROOT, "dist/js/projects-data.json");
const DETAILS_PATH = path.join(ROOT, "dist/js/project-details.json");
const PRESERVED = path.join(__dirname, "preserved-local-galleries.json");
const SKIP_SLUGS = new Set(["ue-varna", "chas-za", "helt-ty", "amare"]);

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)$/i;

function cdnUrlToLocalFile(url) {
  const resolved = url
    .replace(/^https:\/\/cdn\.myportfolio\.com\//, "")
    .replace(/^\.\.\/cdn\.myportfolio\.com\//, "");
  return path.join(CDN_ROOT, resolved);
}

function cdnBasename(url) {
  const file = url.split("/").pop() || "image.jpg";
  const base = file.replace(/_(rw|rwc)_[^/]+$/, "").replace(/\.[^.]+$/, "");
  const ext = path.extname(file) || ".jpg";
  return `${base}${ext}`;
}

function loadJson(file, fallback = {}) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function mirrorSlug(slug, gallery, stats) {
  if (SKIP_SLUGS.has(slug)) {
    stats.skipped += 1;
    return gallery;
  }

  const outDir = path.join(ROOT, "dist/images/projects", slug);
  const localGallery = [];
  let copied = 0;

  gallery.forEach((url, index) => {
    if (!url.includes("cdn.myportfolio.com/")) {
      localGallery.push(url);
      return;
    }

    const source = cdnUrlToLocalFile(url);
    if (!fs.existsSync(source)) {
      stats.missing += 1;
      localGallery.push(url);
      return;
    }

    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const destName = `${String(index + 1).padStart(2, "0")}-${cdnBasename(url)}`;
    const dest = path.join(outDir, destName);
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(source, dest);
      copied += 1;
      stats.copied += 1;
    }
    localGallery.push(`dist/images/projects/${slug}/${destName}`);
    stats.rewritten += 1;
  });

  if (copied) stats.projectsMirrored += 1;
  return localGallery;
}

function main() {
  const stats = {
    projectsMirrored: 0,
    copied: 0,
    rewritten: 0,
    missing: 0,
    skipped: 0,
    localGalleries: 0,
    partialLocal: 0,
  };

  if (!fs.existsSync(CDN_ROOT)) {
    console.error("CDN cache not found:", CDN_ROOT);
    process.exit(1);
  }

  const projects = loadJson(PROJECTS_DATA, []);
  const preserved = loadJson(PRESERVED, {});
  const details = loadJson(DETAILS_PATH, {});
  const slugs = new Set(projects.map((p) => p.href.replace(/\.html$/, "")));

  for (const slug of Object.keys(preserved)) slugs.add(slug);

  for (const slug of slugs) {
    if (SKIP_SLUGS.has(slug) && preserved[slug]) {
      details[slug] = preserved[slug];
      continue;
    }

    const record = details[slug] || preserved[slug];
    if (!record?.gallery?.length) continue;

    const mirrored = mirrorSlug(slug, record.gallery, stats);
    const hasLocal = mirrored.some((u) => u.startsWith("dist/images/"));
    const allLocal = mirrored.every((u) => u.startsWith("dist/images/"));

    details[slug] = { ...record, gallery: mirrored };
    if (allLocal && mirrored.length > 1) stats.localGalleries += 1;
    else if (hasLocal && mirrored.length > 1) stats.partialLocal += 1;
  }

  fs.writeFileSync(DETAILS_PATH, `${JSON.stringify(details, null, 2)}\n`, "utf8");

  console.log("Mirror complete");
  console.log(JSON.stringify(stats, null, 2));
}

main();
