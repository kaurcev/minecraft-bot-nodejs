const config = require('./config');
const MinecraftBot = require('./bot/MinecraftBot');

/**
 * Main application entry point
 */
function main() {
  try {
    new MinecraftBot(config.bot, config.telegram);
    console.log('Minecraft bot started successfully');
  } catch (error) {
    console.error('Failed to start Minecraft bot:', error);
    process.exit(1);
  }
}

// Start the application
main();