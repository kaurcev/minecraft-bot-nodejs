/**
 * Task manager for handling bot operations
 * @class TaskManager
 */
class TaskManager {
  /**
   * @param {Object} bot - Mineflayer bot instance
   */
  constructor(bot) {
    this.bot = bot;
    this.currentTask = null;
  }

  /**
   * Execute a task if no other task is running
   * @param {Promise} task
   */
  async executeTask(task) {
    if (this.currentTask) return;
    
    this.currentTask = task;
    await task;
    this.currentTask = null;
  }

  /**
   * Stop all current activities
   */
  stopAll() {
    this.bot.pathfinder.stop();
    this.currentTask = null;
  }

  /**
   * Check if task is currently running
   * @returns {boolean}
   */
  isTaskRunning() {
    return this.currentTask !== null;
  }
}

module.exports = TaskManager;