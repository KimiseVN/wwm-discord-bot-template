import fetch from "node-fetch";
import * as cheerio from "cheerio";

// ===============================
// SIMPLE PAGE CACHE (10 minutes)
// ===============================
const pageCache = new Map(); // key: url, value: { data, ts }
const CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

// ===============================
// SLUGIFY FOR GAME8 URLS
// ===============================
function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// ===============================
// FETCH PAGE FROM GAME8
// ===============================
export async function fetchGame8Page(category, name) {
  const slug = slugify(name);
  const url = `https://game8.co/games/Where-Winds-Meet/${slug}`;

  const now = Date.now();
  const cached = pageCache.get(url);

  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const title = $("h1").first().text().trim() || name;

  const summary =
    $("p")
      .first()
      .text()
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 400) || "No summary found.";

  const sections = [];

  $("h2").each((_, el) => {
    const heading = $(el).text().trim();
    if (!heading) return;

    const contentParts = [];
    let next = $(el).next();

    while (next.length && next[0].tagName !== "h2") {
      const text = next.text().trim().replace(/\s+/g, " ");
      if (text) contentParts.push(text);
      next = next.next();
    }

    if (contentParts.length) {
      sections.push({
        heading,
        content: contentParts.join("\n")
      });
    }
  });

  const data = { url, title, summary, sections };
  pageCache.set(url, { data, ts: now });

  return data;
}

// ===============================
// CATEGORY LABELS (EN + VN)
// ===============================
function categoryLabel(category) {
  switch (category) {
    case "quest": return "Quest";
    case "mystic": return "Mystic Skill";
    case "martial": return "Martial Art";
    case "boss": return "Boss";
    case "sect": return "Sect";
    case "npc": return "NPC";
    case "inner": return "Inner Way";
    case "walkthrough": return "Walkthrough";
    default: return "Where Winds Meet";
  }
}

function categoryLabelVN(category) {
  switch (category) {
    case "quest": return "Nhiệm Vụ";
    case "mystic": return "Huyền Thuật";
    case "martial": return "Võ Học";
    case "boss": return "Trùm";
    case "sect": return "Môn Phái";
    case "npc": return "Nhân Vật";
    case "inner": return "Tâm Pháp";
    case "walkthrough": return "Hướng Dẫn";
    default: return "Where Winds Meet";
  }
}

// ===============================
// BUILD EMBED (RÚT GỌN / ĐẦY ĐỦ)
// ===============================
export function buildEmbedFromPage(category, name, page, options = {}, lang = "en") {
  const { url, title, summary, sections } = page;
  const { full = false } = options;

  const importantHeadings = [
    "How to Unlock",
    "Details and Effects",
    "Effects",
    "Breakthrough Bonuses",
    "Walkthrough",
    "Rewards",
    "Location"
  ];

  const fields = [];

  const sourceSections = full
    ? sections
    : sections.filter(sec =>
        importantHeadings.some(h =>
          sec.heading.toLowerCase().includes(h.toLowerCase())
        )
      );

  for (const sec of sourceSections) {
    fields.push({
      name: sec.heading,
      value: sec.content.slice(0, 1024)
    });
    if (!full && fields.length >= 4) break;
  }

  if (fields.length === 0 && sections[0]) {
    fields.push({
      name: sections[0].heading,
      value: sections[0].content.slice(0, 1024)
    });
  }

  return {
    title:
      lang === "vn"
        ? `${title} — ${categoryLabelVN(category)}`
        : `${title} — ${categoryLabel(category)}`,
    url,
    description: summary,
    fields,
    color: 0x00b3ff
  };
}
