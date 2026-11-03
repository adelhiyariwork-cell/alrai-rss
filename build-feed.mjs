import { mkdir, writeFile } from "node:fs/promises";

const SOURCE = "https://news.google.com/rss/search?q=site%3Aalrai.com&hl=ar&gl=JO&ceid=JO%3Aar";
const SITE = "https://alrai.com/";
const escapeXml = (value = "") => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const clean = (value = "") => value.replace(/^<!\[CDATA\[|\]\]>$/g, "").trim();
const tag = (xml, name) => clean((xml.match(new RegExp("<" + name + "[^>]*>([\s\S]*?)</" + name + ">", "i")) || [, ""])[1]);

const response = await fetch(SOURCE, { headers: { "User-Agent": "Mozilla/5.0" } });
if (!response.ok) throw new Error("News source returned HTTP " + response.status);
const source = await response.text();
const items = [...source.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 30).map((match) => {
  const item = match[1];
  return { title: tag(item, "title"), link: tag(item, "link"), date: tag(item, "pubDate") };
}).filter((item) => item.title && item.link);
if (!items.length) throw new Error("No Alrai stories found in the news index.");

const now = new Date().toUTCString();
const entries = items.map((item) => "\n    <item>\n      <title>" + escapeXml(item.title) + "</title>\n      <link>" + escapeXml(item.link) + "</link>\n      <guid isPermaLink=\"true\">" + escapeXml(item.link) + "</guid>\n      <pubDate>" + escapeXml(item.date || now) + "</pubDate>\n    </item>").join("");
const feed = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<rss version=\"2.0\"><channel>\n  <title>صحيفة الرأي — أحدث الأخبار</title>\n  <link>" + SITE + "</link>\n  <description>خلاصة مستقلة لأحدث أخبار صحيفة الرأي.</description>\n  <language>ar</language>\n  <lastBuildDate>" + now + "</lastBuildDate>" + entries + "\n</channel></rss>";
await mkdir("public", { recursive: true });
await writeFile("public/feed.xml", feed, "utf8");
await writeFile("public/index.html", "<!doctype html><html lang=\"ar\" dir=\"rtl\"><meta charset=\"utf-8\"><title>RSS صحيفة الرأي</title><a href=\"feed.xml\">RSS صحيفة الرأي</a>", "utf8");
console.log("Built " + items.length + " items.");
