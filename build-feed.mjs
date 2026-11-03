import { mkdir, writeFile } from "node:fs/promises";

const SITE = "https://alrai.com/";
const FEED_URL = "https://YOUR-GITHUB-USERNAME.github.io/alrai-rss/feed.xml";
const MAX_ITEMS = 30;

function decode(value = "") {
  return value
    .replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

function text(value) {
  return decode(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function xml(value = "") {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

const response = await fetch(SITE, {
  headers: { "User-Agent": "Mozilla/5.0 (compatible; AlraiRSS/1.0; +https://github.com/)" }
});
if (!response.ok) throw new Error(`Alrai returned HTTP ${response.status}`);
const html = await response.text();

const found = new Map();
const anchor = /<a\b[^>]*href=["']([^"']*\/article\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
for (const match of html.matchAll(anchor)) {
  const link = new URL(decode(match[1]), SITE).href;
  const title = text(match[2]);
  if (title.length >= 8 && !found.has(link)) found.set(link, title);
}
const items = [...found].slice(0, MAX_ITEMS);
if (!items.length) throw new Error("No article links found. The site markup may have changed.");

const now = new Date().toUTCString();
const entries = items.map(([link, title]) => `
    <item>
      <title>${xml(title)}</title>
      <link>${xml(link)}</link>
      <guid isPermaLink="true">${xml(link)}</guid>
      <pubDate>${now}</pubDate>
      <description>${xml(title)}</description>
    </item>`).join("");

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>صحيفة الرأي — أحدث الأخبار</title>
    <link>${SITE}</link>
    <description>خلاصة مستقلة لأحدث الأخبار المنشورة على موقع صحيفة الرأي الأردنية.</description>
    <language>ar</language>
    <lastBuildDate>${now}</lastBuildDate>
    <generator>alrai-rss</generator>${entries}
  </channel>
</rss>`;

await mkdir("public", { recursive: true });
await writeFile("public/feed.xml", feed, "utf8");
await writeFile("public/index.html", `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>RSS صحيفة الرأي</title><body><h1>RSS صحيفة الرأي</h1><p><a href="feed.xml">اشترك في الخلاصة</a></p></body></html>`, "utf8");
console.log(`Built ${items.length} items.`);
