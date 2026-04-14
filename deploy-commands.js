import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { data as wwmData } from './src/commands/wwm.js';

const commands = [wwmData.toJSON()];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function main() {
  try {
    console.log('Started refreshing application (/) commands.');

    if (process.env.GUILD_ID) {
      // Register commands to a specific guild (fast update)
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );
      console.log('Successfully reloaded guild (/) commands.');
    } else {
      // Global registration (slower)
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log('Successfully reloaded global (/) commands.');
    }
  } catch (error) {
    console.error(error);
  }
}

main();
