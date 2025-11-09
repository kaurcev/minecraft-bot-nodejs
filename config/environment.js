require("dotenv").config();

/**
 * Environment configuration
 * @namespace Config
 */
module.exports = {
  bot: {
    host: process.env.HOST,
    port: parseInt(process.env.PORT),
    username: process.env.USERNAME,
    version: process.env.VERSION,
  },
  telegram: {
    token: process.env.TGTOKEN,
    chatId: process.env.TGCHAT,
  },
};