import { mkdir, writeFile } from "node:fs/promises";

const SITE = "https://alrai.com/";
const READER = "https://r.jina.ai/http://alrai.com/";
const xml = (v = "") => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const response = await fetch(READER, { headers: { "User-Agent": "AlraiRSS/1.0" } });
if (!response.ok) throw new Error("Reader returned HTTP " + response.status);
const page = await response.text();
const articles = new Map();
for (const match of page.matchAll(/\[([^\]]+)\]\((https?:\/\/alrai\.com\/article\/[^)]+)\)/g)) {
  const title = match[1].replace(/\s+/g, " ").trim();
  const link = match[2];
  if (title.length > 8 && !articles.has(link)) articles.set(link, title);
}
const items = [...articles].slice(0, 30);
if (!items.length) throw new Error("No article links found.");
const now = new Date().toUTCString();
const entries = items.map(([link, title]) => "\n    <item><title>" + xml(title) + "</title><link>" + xml(link) + "</link><guid isPermaLink=\"true\">" + xml(link) + "</guid><pubDate>" + now + "</pubDate></item>").join("");
const feed = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<rss version=\"2.0\"><channel><title>صحيفة الرأي — أحدث الأخبار</title><link>" + SITE + "</link><description>خلاصة مستقلة لأحدث أخبار صحيفة الرأي.</description><language>ar</language><lastBuildDate>" + now + "</lastBuildDate>" + entries + "\n</channel></rss>";
await mkdir("public", { recursive: true });
await writeFile("public/feed.xml", feed, "utf8");
await writeFile("public/index.html", "<!doctype html><html lang=\"ar\" dir=\"rtl\"><meta charset=\"utf-8\"><title>RSS صحيفة الرأي</title><a href=\"feed.xml\">RSS صحيفة الرأي</a>", "utf8");
console.log("Built " + items.length + " items.");
