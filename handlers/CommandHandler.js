/**
 * Command handler for processing chat commands
 * @class CommandHandler
 */
class CommandHandler {
  /**
   * @param {Object} dependencies
   * @param {Object} dependencies.bot - Mineflayer bot instance
   * @param {WikipediaService} dependencies.wikipediaService
   * @param {TelegramService} dependencies.telegramService
   * @param {TaskManager} dependencies.taskManager
   * @param {EntityHandler} dependencies.entityHandler
   */
  constructor(dependencies) {
    this.bot = dependencies.bot;
    this.wikipediaService = dependencies.wikipediaService;
    this.telegramService = dependencies.telegramService;
    this.taskManager = dependencies.taskManager;
    this.entityHandler = dependencies.entityHandler;
  }

  /**
   * Handle chat commands
   * @param {string} message
   * @param {string} username
   */
  async handleCommand(message, username) {
    if (username === this.bot.username) return;

    const [command, ...args] = message.split(" ");
    const query = args.join(" ");

    const commandHandlers = {
      'айда': () => this.handleFollow(args[0]),
      'собери': () => this.handleCollect(),
      'стой': () => this.handleStop(),
      'ебаш': () => this.handleAttack(),
      ':': () => query && this.handleWiki(query),
      'тг': () => query && this.handleTelegram(query),
    };

    const handler = commandHandlers[command.toLowerCase()];
    if (handler) await handler();
  }

  /**
   * Handle follow command
   * @param {string} username
   */
  async handleFollow(username) {
    const player = this.entityHandler.findPlayer(username);
    if (!player?.entity) {
      this.bot.chat("Игрок не найден.");
      return;
    }

    const { goals } = require("mineflayer-pathfinder");
    const followGoal = new goals.GoalFollow(player.entity, 2);
    this.bot.pathfinder.setGoal(followGoal, true);
    this.bot.once("goal_reached", () => this.bot.chat("Я за тобой!"));
  }

  /**
   * Handle collect command
   */
  async handleCollect() {
    const collectTask = (async () => {
      let itemEntity;
      while ((itemEntity = this.entityHandler.findNearestEntity(
        entity => entity.name === "item"
      ))) {
        await this.entityHandler.collectItem(itemEntity);
      }
      this.bot.chat("Я всё собрала!");
    })();

    await this.taskManager.executeTask(collectTask);
  }

  /**
   * Handle stop command
   */
  handleStop() {
    this.taskManager.stopAll();
    this.bot.chat("Ой, стопэ! Я остановилась.");
  }

  /**
   * Handle attack command
   */
  async handleAttack() {
    const mob = this.entityHandler.findNearestEntity(
      entity => entity.type === "mob"
    );

    if (!mob) {
      this.bot.chat("Нет мобов в радиусе атаки.");
      return;
    }

    this.bot.chat(`Атакую ${mob.name}!`);
    const { goals } = require("mineflayer-pathfinder");
    const mobGoal = new goals.GoalNear(
      mob.position.x,
      mob.position.y,
      mob.position.z,
      1,
    );
    this.bot.pathfinder.setGoal(mobGoal);
    this.bot.once("goal_reached", () => this.entityHandler.attackEntity(mob));
  }

  /**
   * Handle wiki command
   * @param {string} query
   */
  async handleWiki(query) {
    const response = await this.wikipediaService.fetchDefinition(query);
    this.bot.chat(response);
  }

  /**
   * Handle telegram command
   * @param {string} message
   */
  async handleTelegram(message) {
    const success = await this.telegramService.sendMessage(message);
    this.bot.chat(success ? "Я написала в тг" : "Давай позже?");
  }
}

module.exports = CommandHandler;