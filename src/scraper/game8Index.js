import fetch from "node-fetch";
import * as cheerio from "cheerio";

const ROOT = "https://game8.co/games/Where-Winds-Meet";

// ===============================
// DISCOVER CATEGORY LINKS
// ===============================
export async function discoverCategoryLinks() {
  const res = await fetch(ROOT);
  const html = await res.text();
  const $ = cheerio.load(html);

  const categories = {
    mystic: null,
    martial: null,
    quest: null,
    boss: null,
    sect: null,
    npc: null,
    inner: null,
    walkthrough: null
  };

  $("a").each((_, el) => {
    const text = $(el).text().trim().toLowerCase();
    const href = $(el).attr("href");
    if (!href) return;

    if (text.includes("mystic skills")) categories.mystic = href;
    if (text.includes("martial arts")) categories.martial = href;
    if (text.includes("side quests")) categories.quest = href;
    if (text.includes("bosses")) categories.boss = href;
    if (text.includes("sects")) categories.sect = href;
    if (text.includes("npcs")) categories.npc = href;

    if (text.includes("inner ways")) categories.inner = href;
    if (text.includes("walkthrough")) categories.walkthrough = href;
  });

  for (const key of Object.keys(categories)) {
    if (categories[key] && !categories[key].startsWith("http")) {
      categories[key] = "https://game8.co" + categories[key];
    }
  }

  return categories;
}

// ===============================
// GENERIC CATEGORY CRAWLER
// ===============================
async function crawlCategory(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const names = [];

  $("main a").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 1 && text.length < 80) names.push(text);
  });

  return [...new Set(names)];
}

// ===============================
// SPECIAL CRAWLER FOR INNER WAYS
// ===============================
async function crawlInnerWays(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  const names = [];

  $("*").each((_, el) => {
    const text = $(el).text().trim();
    const match = text.match(/^(.+?)\s+.*Effect\s*:/i);
    if (match) {
      const name = match[1].trim();
      if (name.length > 1 && name.length < 80) names.push(name);
    }
  });

  return [...new Set(names)];
}

// ===============================
// CACHE (12 HOURS)
// ===============================
let CACHE = null;
let CACHE_TIME = 0;
const TTL = 1000 * 60 * 60 * 12;

// ===============================
// MAIN CRAWLER
// ===============================
export async function crawlAllGame8() {
  const now = Date.now();
  if (CACHE && now - CACHE_TIME < TTL) return CACHE;

  console.log("[CRAWL] Discovering category links...");
  const links = await discoverCategoryLinks();

  console.log("[CRAWL] Crawling categories...");
  const result = {
    mystic: await crawlCategory(links.mystic),
    martial: await crawlCategory(links.martial),
    quest: await crawlCategory(links.quest),
    boss: await crawlCategory(links.boss),
    sect: await crawlCategory(links.sect),
    npc: await crawlCategory(links.npc),
    inner: await crawlInnerWays(links.inner),
    walkthrough: await crawlCategory(links.walkthrough)
  };

  CACHE = result;
  CACHE_TIME = now;

  console.log("[CRAWL] Done.");
  return result;
}
