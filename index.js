require("dotenv").config();
const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const axios = require("axios");

const bot = mineflayer.createBot({
  host: process.env.HOST,
  port: process.env.PORT,
  username: process.env.USERNAME,
  version: process.env.VERSION,
});

const telegramToken = process.env.TGTOKEN;
const telegramChatId = process.env.TGCHAT;

bot.loadPlugin(pathfinder);

let currentTask = null;

bot.once("spawn", () => {
  bot.pathfinder.setMovements(new Movements(bot));
});

bot.on("chat", async (username, message) => {
  if (username === bot.username) return;

  const args = message.split(" ");
  const command = args[0].toLowerCase();
  const query = args.slice(1).join(" ");

  switch (command) {
    case "айда":
      await executeTask(followUser(username));
      break;
    case "собери":
      await executeTask(collectAllItems());
      break;
    case "стой":
      stopAll();
      break;
    case "ебаш":
      attackMobs();
      break;
    case ":":
      if (query) await getWikiDefinition(query);
      break;
    case "тг":
      if (query) await sendTelegramMessage(query);
      break;
    default:
      break;
  }
});

async function executeTask(task) {
  if (!currentTask) {
    currentTask = task;
    await currentTask;
    currentTask = null;
  }
}

async function followUser(username) {
  const player = bot.players[username];
  if (!player || !player.entity) {
    bot.chat("Игрок не найден.");
    return;
  }

  const followGoal = new goals.GoalFollow(player.entity, 2);
  bot.pathfinder.setGoal(followGoal, true);
  bot.once("goal_reached", () => bot.chat("Я за тобой!"));
}

async function collectAllItems() {
  let itemEntity;
  while ((itemEntity = bot.nearestEntity((entity) => entity.name === "item"))) {
    await collectItem(itemEntity);
  }
  bot.chat("Я всё собрала!");
}

async function collectItem(itemEntity) {
  const itemGoal = new goals.GoalBlock(
    itemEntity.position.x,
    itemEntity.position.y,
    itemEntity.position.z,
  );
  bot.pathfinder.setGoal(itemGoal);
  return new Promise((resolve) => {
    bot.once("goal_reached", resolve);
  });
}

function stopAll() {
  bot.pathfinder.stop();
  bot.chat("Ой, стопэ! Я остановилась.");
}

async function getWikiDefinition(query) {
  const response = await fetchWikiDefinition(query);
  bot.chat(response);
}

function attackMobs() {
  const mob = bot.nearestEntity(
    (entity) =>
      entity.type === "mob" &&
      entity.position.distanceTo(bot.entity.position) < 16,
  );
  if (mob) {
    bot.chat(`Атакую ${mob.name}!`);
    const mobGoal = new goals.GoalNear(
      mob.position.x,
      mob.position.y,
      mob.position.z,
      1,
    );
    bot.pathfinder.setGoal(mobGoal);
    bot.once("goal_reached", () => attackEntity(mob));
  } else {
    bot.chat("Нет мобов в радиусе атаки.");
  }
}

function attackEntity(entity) {
  if (!entity || entity.isValid === false) {
    bot.chat("Цель недоступна для атаки.");
    return;
  }

  bot.attack(entity);
  const interval = setInterval(() => {
    if (!entity || entity.isValid === false || entity.health <= 0) {
      bot.chat(`${entity.name} повержен.`);
      clearInterval(interval);
    } else {
      bot.attack(entity);
    }
  }, 200);
}

async function fetchWikiDefinition(query) {
  try {
    const response = await axios.get("https://ru.wikipedia.org/w/api.php", {
      params: {
        action: "query",
        format: "json",
        prop: "extracts",
        exintro: true,
        explaintext: true,
        titles: query,
      },
    });

    const pages = response.data.query.pages;
    const page = Object.values(pages)[0];
    return page.extract
      ? page.extract.length > 200
        ? page.extract.substring(0, 200) + "..."
        : page.extract
      : "Извини, я не смогла найти определение.";
  } catch (error) {
    return "Извини, я не смогла найти определение.";
  }
}

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: telegramChatId,
      text: message,
      parse_mode: "Markdown",
    });
    bot.chat("Я написала в тг");
  } catch (error) {
    bot.chat("Давай позже?");
  }
}

bot.on("error", (err) => console.log("Ошибка:", err));
bot.on("end", () => console.log("Бот отключен."));
