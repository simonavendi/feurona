/**
 * Regenerate dist/js/project-details.json from legacy project HTML pages.
 * Run from repo root: node scripts/build-project-details.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PROJECTS_DATA = path.join(ROOT, "dist/js/projects-data.json");
const OUTPUT = path.join(ROOT, "dist/js/project-details.json");

const PRESERVED_GALLERIES = path.join(__dirname, "preserved-local-galleries.json");
const PRESERVE_LOCAL = new Set(["ue-varna", "amare", "chas-za", "helt-ty"]);

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i;

function resolveImageUrl(raw, preferLocalMirror = false) {
  if (!raw || raw.startsWith("data:")) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith("../cdn.myportfolio.com/")) {
    if (preferLocalMirror) return trimmed;
    return `https://cdn.myportfolio.com/${trimmed.slice("../cdn.myportfolio.com/".length)}`;
  }
  if (trimmed.startsWith("cdn.myportfolio.com/")) {
    return `https://${trimmed}`;
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.replace(/^\.\//, "");
}

function canonicalKey(url) {
  const resolved = resolveImageUrl(url);
  if (!resolved) return null;
  if (resolved.includes("cdn.myportfolio.com/")) {
    const file = resolved.split("/").pop() || "";
    const base = file.replace(/_(rw|rwc)_[^/]+$/, "").replace(/\.[^.]+$/, "");
    return `cdn:${base}`;
  }
  return `local:${resolved}`;
}

function pickBestUrl(urls) {
  const resolved = urls.map(resolveImageUrl).filter(Boolean);
  if (!resolved.length) return null;

  const full = resolved.find((u) => u.includes("cdn.myportfolio.com/") && !/_rw_|_rwc_/.test(u));
  if (full) return full;

  const local = resolved.find((u) => u.startsWith("dist/images/"));
  if (local) return local;

  const sized = resolved
    .map((u) => {
      const match = u.match(/_rw_(\d+)/);
      return { u, w: match ? Number(match[1]) : 0 };
    })
    .sort((a, b) => b.w - a.w);
  return sized[0]?.u || resolved[0];
}

function parseSrcset(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter((u) => IMAGE_EXT.test(u));
}

function extractProjectModulesSection(html) {
  const startMarker = '<div id="project-modules">';
  const start = html.indexOf(startMarker);
  if (start === -1) return "";

  const endMarkers = [
    "</div>\n        </div>\n      </div>\n    </section>",
    "</div>\r\n        </div>\r\n      </div>\r\n    </section>",
  ];
  let end = -1;
  for (const marker of endMarkers) {
    end = html.indexOf(marker, start);
    if (end !== -1) break;
  }

  return end === -1 ? html.slice(start) : html.slice(start, end);
}

function collectUrlsFromFragment(fragment) {
  const urls = [];

  const lightboxMatch = fragment.match(/class="js-lightbox"[^>]*data-src="([^"]+)"/);
  if (lightboxMatch) urls.push(lightboxMatch[1]);

  for (const m of fragment.matchAll(/data-src="([^"]+)"/g)) urls.push(m[1]);
  for (const m of fragment.matchAll(/data-srcset="([^"]+)"/g)) urls.push(...parseSrcset(m[1]));
  for (const m of fragment.matchAll(/srcset="([^"]+)"/g)) urls.push(...parseSrcset(m[1]));
  for (const m of fragment.matchAll(/src="(\.\.\/cdn\.myportfolio\.com\/[^"]+)"/g)) urls.push(m[1]);

  return urls.filter((u) => IMAGE_EXT.test(u) && !u.startsWith("data:"));
}

function cdnCachePath(url) {
  const resolved = resolveImageUrl(url);
  if (!resolved?.includes("cdn.myportfolio.com/")) return null;
  const rel = resolved.replace(/^https:\/\/cdn\.myportfolio\.com\//, "");
  return path.join(path.resolve(ROOT, ".."), "cdn.myportfolio.com", rel);
}

function addGalleryUrl(gallery, seen, raw) {
  const picked = pickBestUrl([raw]);
  const localMirror = resolveImageUrl(picked, true);
  const cacheFile = localMirror?.startsWith("../cdn.myportfolio.com/")
    ? path.join(ROOT, localMirror)
    : cdnCachePath(picked);
  const url =
    cacheFile && fs.existsSync(cacheFile) && localMirror?.startsWith("../cdn.myportfolio.com/")
      ? localMirror
      : resolveImageUrl(picked);
  if (!url) return;
  const key = canonicalKey(url);
  if (!key || seen.has(key)) return;
  seen.add(key);
  gallery.push(url);
}

function extractGalleryFromHtml(html) {
  const section = extractProjectModulesSection(html);
  if (!section) return [];

  const seen = new Set();
  const gallery = [];

  for (const m of section.matchAll(/class="js-lightbox"[^>]*data-src="([^"]+)"/g)) {
    addGalleryUrl(gallery, seen, m[1]);
  }

  const gridBlocks = section.split(/<div class="grid__item-container/);
  for (const block of gridBlocks.slice(1)) {
    const urls = collectUrlsFromFragment(block);
    const best = pickBestUrl(urls);
    if (best) addGalleryUrl(gallery, seen, best);
  }

  if (!gallery.length) {
    const imageBlocks = section.split(/<div class="project-module module image/);
    for (const block of imageBlocks.slice(1)) {
      const urls = collectUrlsFromFragment(block);
      const best = pickBestUrl(urls);
      if (best) addGalleryUrl(gallery, seen, best);
    }
  }

  return gallery;
}

function listLocalGallery(slug) {
  const dir = path.join(ROOT, "dist/images/projects", slug);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => IMAGE_EXT.test(name) && !name.startsWith("."))
    .sort()
    .map((name) => `dist/images/projects/${slug}/${name}`);
}

function thumbFallback(entry, slug) {
  if (entry.image) return [entry.image];
  const jpg = `dist/images/projects/${slug}.jpg`;
  const png = `dist/images/projects/${slug}.png`;
  if (fs.existsSync(path.join(ROOT, jpg))) return [jpg];
  if (fs.existsSync(path.join(ROOT, png))) return [png];
  return [jpg];
}

function mergeGalleries(...lists) {
  const seen = new Set();
  const merged = [];
  for (const list of lists) {
    for (const url of list) {
      const key = canonicalKey(url) || url;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(url);
    }
  }
  return merged;
}

function loadPreserved() {
  const sources = [PRESERVED_GALLERIES, OUTPUT];
  const merged = {};
  for (const file of sources) {
    if (!fs.existsSync(file)) continue;
    try {
      Object.assign(merged, JSON.parse(fs.readFileSync(file, "utf8")));
    } catch {
      /* ignore */
    }
  }
  return merged;
}

function main() {
  const projects = JSON.parse(fs.readFileSync(PROJECTS_DATA, "utf8"));
  const preserved = loadPreserved();
  const details = {};
  const stats = {
    total: projects.length,
    multiImage: 0,
    cdn: 0,
    localOnly: 0,
    thumbOnly: 0,
    preserved: 0,
    noHtml: 0,
  };

  const processed = new Set();

  for (const entry of projects) {
    const slug = entry.href.replace(/\.html$/, "");
    processed.add(slug);

    if (PRESERVE_LOCAL.has(slug) && preserved[slug]) {
      details[slug] = preserved[slug];
      stats.preserved += 1;
      if ((preserved[slug].gallery || []).length > 1) stats.multiImage += 1;
      stats.localOnly += 1;
      continue;
    }

    const htmlPath = path.join(ROOT, `${slug}.html`);
    let gallery = [];
    let source = "thumb";

    if (fs.existsSync(htmlPath)) {
      const html = fs.readFileSync(htmlPath, "utf8");
      gallery = extractGalleryFromHtml(html);
      if (gallery.length) source = "html";
    } else {
      stats.noHtml += 1;
    }

    const localGallery = listLocalGallery(slug);
    if (localGallery.length) {
      gallery = mergeGalleries(gallery, localGallery);
      if (source === "thumb") source = "local-folder";
    }

    if (!gallery.length) {
      gallery = thumbFallback(entry, slug);
      source = "thumb";
    }

    const hasCdn = gallery.some((u) => u.startsWith("https://cdn.myportfolio.com/"));
    const hasLocal = gallery.some((u) => u.startsWith("dist/images/"));

    if (gallery.length > 1) stats.multiImage += 1;
    if (hasCdn) stats.cdn += 1;
    else if (hasLocal && gallery.length > 1) stats.localOnly += 1;
    if (gallery.length === 1 && source === "thumb") stats.thumbOnly += 1;

    const record = { gallery };
    if (preserved[slug]?.desc) record.desc = preserved[slug].desc;
    if (preserved[slug]?.previewFit) record.previewFit = preserved[slug].previewFit;
    if (preserved[slug]?.previewPosition) record.previewPosition = preserved[slug].previewPosition;
    if (preserved[slug]?.previewScale) record.previewScale = preserved[slug].previewScale;
    details[slug] = record;
  }

  for (const slug of PRESERVE_LOCAL) {
    if (!processed.has(slug) && preserved[slug]) {
      details[slug] = preserved[slug];
      stats.preserved += 1;
      if ((preserved[slug].gallery || []).length > 1) stats.multiImage += 1;
      stats.localOnly += 1;
    }
  }

  fs.writeFileSync(OUTPUT, `${JSON.stringify(details, null, 2)}\n`, "utf8");

  console.log("Wrote", OUTPUT);
  console.log(JSON.stringify(stats, null, 2));
  console.log("\nPer-project gallery counts:");
  for (const entry of projects) {
    const slug = entry.href.replace(/\.html$/, "");
    const count = (details[slug]?.gallery || []).length;
    const kind = (details[slug]?.gallery || [])[0]?.startsWith("https://") ? "cdn" : "local";
    console.log(`  ${slug}: ${count} (${kind}${count > 1 ? ", multi" : ""})`);
  }
}

main();
