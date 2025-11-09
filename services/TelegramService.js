const axios = require("axios");

/**
 * Service for handling Telegram API requests
 * @class TelegramService
 */
class TelegramService {
  /**
   * @param {Object} config - Telegram configuration
   * @param {string} config.token - Bot token
   * @param {string} config.chatId - Chat ID
   */
  constructor(config) {
    this.config = config;
  }

  /**
   * Send message to Telegram
   * @param {string} message
   * @returns {Promise<boolean>} Success status
   */
  async sendMessage(message) {
    try {
      const url = `https://api.telegram.org/bot${this.config.token}/sendMessage`;
      await axios.post(url, {
        chat_id: this.config.chatId,
        text: message,
        parse_mode: "Markdown",
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = TelegramService;