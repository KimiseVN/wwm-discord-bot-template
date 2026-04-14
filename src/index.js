import 'dotenv/config';
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits
} from 'discord.js';

import * as wwmCommand from './commands/wwm.js';

// Create Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Register commands
client.commands = new Collection();
client.commands.set(wwmCommand.data.name, wwmCommand);

// Log limiter
let logCount = 0;
function safeLog(...args) {
  if (logCount < 500) {
    console.log(...args);
    logCount++;
  } else if (logCount === 500) {
    console.log('[LOG] Reached 500 logs, suppressing further logs.');
    logCount++;
  }
}

// Bot ready
client.once(Events.ClientReady, c => {
  safeLog(`Logged in as ${c.user.tag}`);
});

// Interaction handler
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction);

    } else if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (command && command.autocomplete) {
        await command.autocomplete(interaction);
      }

    } else if (interaction.isButton()) {
      const command = client.commands.get("wwm");
      if (command && command.handleButton) {
        await command.handleButton(interaction);
      }
    }
  } catch (err) {
    console.error(err);
    if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Có lỗi xảy ra khi xử lý tương tác.',
        ephemeral: true
      });
    }
  }
});

// Auto-restart on crash
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Login bot
client.login(process.env.DISCORD_TOKEN);
