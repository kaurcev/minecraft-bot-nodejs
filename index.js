require('dotenv').config();

const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USERNAME,
  version: process.env.VERSION
});

bot.on('spawn', () => {
  console.log('Bot has spawned in the game!');
});

bot.on('error', (err) => {
  console.log('Error:', err);
});

bot.on('end', () => {
  console.log('Bot has disconnected from the server.');
});
