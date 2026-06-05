import { chromium } from "playwright";
import { mkdir, copyFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcRoot = "C:/Users/PC/Pictures/helt.ty/helt.ty";
const outDir = path.join(root, "dist/images/projects/helt-ty");
const projectsDir = path.join(root, "dist/images/projects");

const screens = [
  { folder: "dashboard", name: "01-dashboard", label: "Dashboard" },
  { folder: "activity", name: "02-activity", label: "Activity" },
  { folder: "nutrition", name: "03-nutrition", label: "Nutrition" },
  { folder: "profile", name: "04-profile", label: "Profile" },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});

for (const screen of screens) {
  const htmlPath = path.join(srcRoot, screen.folder, "code.html");
  const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");
  await page.goto(fileUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  const outPath = path.join(outDir, `${screen.name}.png`);
  await page.screenshot({ path: outPath, fullPage: true });
  console.log("Saved", outPath);
}

// Logo: screenshot header logo from dashboard
await page.goto("file:///" + path.join(srcRoot, "dashboard", "code.html").replace(/\\/g, "/"), {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(1000);
const logoEl = page.locator('img[alt="helt.ty logo"]').first();
const logoPath = path.join(projectsDir, "helt-ty-logo.png");
await logoEl.screenshot({ path: logoPath });
console.log("Saved", logoPath);

await browser.close();

// Thumbnail from dashboard
await copyFile(path.join(outDir, "01-dashboard.png"), path.join(projectsDir, "helt-ty.jpg"));
console.log("Saved thumbnail", path.join(projectsDir, "helt-ty.jpg"));
