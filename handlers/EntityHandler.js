const { goals } = require("mineflayer-pathfinder");

/**
 * Entity handler for mob and item interactions
 * @class EntityHandler
 */
class EntityHandler {
  /**
   * @param {Object} bot - Mineflayer bot instance
   */
  constructor(bot) {
    this.bot = bot;
  }

  /**
   * Find nearest entity matching criteria
   * @param {Function} filter
   * @param {number} maxDistance
   * @returns {Object|null}
   */
  findNearestEntity(filter, maxDistance = 16) {
    return this.bot.nearestEntity(entity => 
      filter(entity) && 
      entity.position.distanceTo(this.bot.entity.position) < maxDistance
    );
  }

  /**
   * Attack entity with interval
   * @param {Object} entity
   */
  attackEntity(entity) {
    if (!entity || !entity.isValid) {
      this.bot.chat("Цель недоступна для атаки.");
      return;
    }

    const attack = () => {
      if (!entity || !entity.isValid || entity.health <= 0) {
        this.bot.chat(`${entity.name} повержен.`);
        clearInterval(interval);
        return;
      }
      this.bot.attack(entity);
    };

    this.bot.attack(entity);
    const interval = setInterval(attack, 200);
  }

  /**
   * Collect specific item entity
   * @param {Object} itemEntity
   * @returns {Promise}
   */
  async collectItem(itemEntity) {
    const itemGoal = new goals.GoalBlock(
      itemEntity.position.x,
      itemEntity.position.y,
      itemEntity.position.z,
    );
    this.bot.pathfinder.setGoal(itemGoal);
    
    return new Promise((resolve) => {
      this.bot.once("goal_reached", resolve);
    });
  }

  /**
   * Find player by username
   * @param {string} username
   * @returns {Object|null}
   */
  findPlayer(username) {
    return this.bot.players[username];
  }
}

module.exports = EntityHandler;