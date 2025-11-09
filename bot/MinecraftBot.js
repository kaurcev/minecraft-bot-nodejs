const mineflayer = require("mineflayer");
const { pathfinder, Movements } = require("mineflayer-pathfinder");

const WikipediaService = require("../services/WikipediaService");
const TelegramService = require("../services/TelegramService");
const TaskManager = require("../managers/TaskManager");
const EntityHandler = require("../handlers/EntityHandler");
const CommandHandler = require("../handlers/CommandHandler");

/**
 * Main Minecraft bot class
 * @class MinecraftBot
 */
class MinecraftBot {
  /**
   * @param {Object} botConfig - Mineflayer bot configuration
   * @param {Object} telegramConfig - Telegram configuration
   */
  constructor(botConfig, telegramConfig) {
    this.bot = mineflayer.createBot(botConfig);
    this.bot.loadPlugin(pathfinder);
    
    this.initializeServices(telegramConfig);
    this.initializeHandlers();
    this.setupEventHandlers();
  }

  /**
   * Initialize services
   * @param {Object} telegramConfig
   */
  initializeServices(telegramConfig) {
    this.wikipediaService = new WikipediaService();
    this.telegramService = new TelegramService(telegramConfig);
    this.taskManager = new TaskManager(this.bot);
    this.entityHandler = new EntityHandler(this.bot);
  }

  /**
   * Initialize handlers
   */
  initializeHandlers() {
    this.commandHandler = new CommandHandler({
      bot: this.bot,
      wikipediaService: this.wikipediaService,
      telegramService: this.telegramService,
      taskManager: this.taskManager,
      entityHandler: this.entityHandler,
    });
  }

  /**
   * Setup bot event handlers
   */
  setupEventHandlers() {
    this.bot.once("spawn", () => {
      this.bot.pathfinder.setMovements(new Movements(this.bot));
    });

    this.bot.on("chat", async (username, message) => {
      await this.commandHandler.handleCommand(message, username);
    });

    this.bot.on("error", (err) => console.log("Ошибка:", err));
    this.bot.on("end", () => console.log("Бот отключен."));
  }

  /**
   * Get bot instance
   * @returns {Object} Mineflayer bot instance
   */
  getBot() {
    return this.bot;
  }
}

module.exports = MinecraftBot;