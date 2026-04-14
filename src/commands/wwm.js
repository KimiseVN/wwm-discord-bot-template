import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

import { fetchGame8Page, buildEmbedFromPage } from "../scraper/game8.js";
import { crawlAllGame8 } from "../scraper/game8Index.js";

// ===============================
// USER LANGUAGE MEMORY
// ===============================
const USER_LANG = new Map();

function t(lang, en, vn) {
  return lang === "vn" ? vn : en;
}

function categoryLabelVN(category) {
  switch (category) {
    case "mystic": return "Huyền Thuật";
    case "martial": return "Võ Học";
    case "quest": return "Nhiệm Vụ";
    case "boss": return "Trùm";
    case "sect": return "Môn Phái";
    case "npc": return "Nhân Vật";
    case "inner": return "Tâm Pháp";
    case "walkthrough": return "Hướng Dẫn";
    default: return "Where Winds Meet";
  }
}

// ===============================
// AUTOCOMPLETE CACHE
// ===============================
let AUTO = null;

async function loadAuto() {
  console.log("[AUTO] Crawling Game8...");
  AUTO = await crawlAllGame8();
  console.log("[AUTO] Loaded autocomplete data.");
}

loadAuto().catch(console.error);

// ===============================
// SLASH COMMAND BUILDER
// ===============================
export const data = new SlashCommandBuilder()
  .setName("wwm")
  .setDescription("Where Winds Meet info from Game8")
  .addSubcommand(sub =>
    sub
      .setName("lang")
      .setDescription("Set bot language")
      .addStringOption(opt =>
        opt
          .setName("value")
          .setDescription("Choose language")
          .addChoices(
            { name: "English", value: "en" },
            { name: "Tiếng Việt", value: "vn" }
          )
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("mystic")
      .setDescription("Mystic Skill")
      .addStringOption(opt =>
        opt.setName("name").setDescription("Name").setAutocomplete(true).setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("martial")
      .setDescription("Martial Art")
      .addStringOption(opt =>
        opt.setName("name").setDescription("Name").setAutocomplete(true).setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("inner")
      .setDescription("Inner Way")
      .addStringOption(opt =>
        opt.setName("name").setDescription("Name").setAutocomplete(true).setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("walkthrough")
      .setDescription("Walkthrough")
      .addStringOption(opt =>
        opt.setName("name").setDescription("Name").setAutocomplete(true).setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("quest")
      .setDescription("Quest")
      .addStringOption(opt =>
        opt.setName("name").setDescription("Name").setAutocomplete(true).setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("boss")
      .setDescription("Boss")
      .addStringOption(opt =>
        opt.setName("name").setDescription("Name").setAutocomplete(true).setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("sect")
      .setDescription("Sect")
      .addStringOption(opt =>
        opt.setName("name").setDescription("Name").setAutocomplete(true).setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName("npc")
      .setDescription("NPC")
      .addStringOption(opt =>
        opt.setName("name").setDescription("Name").setAutocomplete(true).setRequired(true)
      )
  );

// ===============================
// AUTOCOMPLETE HANDLER
// ===============================
export async function autocomplete(interaction) {
  const sub = interaction.options.getSubcommand();
  if (!AUTO) return interaction.respond([]);

  const list = AUTO[sub] || [];
  const focused = interaction.options.getFocused();

  const filtered = list
    .filter(n => n.toLowerCase().includes(focused.toLowerCase()))
    .slice(0, 25);

  await interaction.respond(filtered.map(n => ({ name: n, value: n })));
}

// ===============================
// MAIN EXECUTE HANDLER
// ===============================
export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();

  // LANGUAGE COMMAND
  if (sub === "lang") {
    const lang = interaction.options.getString("value");
    USER_LANG.set(interaction.user.id, lang);

    await interaction.reply(
      lang === "vn"
        ? "Đã chuyển ngôn ngữ bot sang **Tiếng Việt**."
        : "Bot language set to **English**."
    );
    return;
  }

  const lang = USER_LANG.get(interaction.user.id) || "en";
  const name = interaction.options.getString("name");

  await interaction.deferReply();

  try {
    const page = await fetchGame8Page(sub, name);
    const embedData = buildEmbedFromPage(sub, name, page, { full: false }, lang);
    const embed = new EmbedBuilder(embedData);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`wwm_more:${sub}:${name}`)
        .setLabel(t(lang, "Show More", "Xem Thêm"))
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  } catch (err) {
    console.error(err);
    await interaction.editReply(
      t(
        lang,
        `Could not find info for **${name}** in category **${sub}**.`,
        `Không tìm thấy thông tin cho **${name}** trong mục **${categoryLabelVN(sub)}**.`
      )
    );
  }
}

// ===============================
// BUTTON HANDLER
// ===============================
export async function handleButton(interaction) {
  if (!interaction.customId.startsWith("wwm_more:")) return;

  const [, category, name] = interaction.customId.split(":");
  const lang = USER_LANG.get(interaction.user.id) || "en";

  await interaction.deferUpdate();

  const page = await fetchGame8Page(category, name);
  const embedData = buildEmbedFromPage(category, name, page, { full: true }, lang);
  const embed = new EmbedBuilder(embedData);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(interaction.customId)
      .setLabel(t(lang, "Show More", "Xem Thêm"))
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true)
  );

  await interaction.editReply({ embeds: [embed], components: [row] });
}
