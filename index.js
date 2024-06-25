require("dotenv").config();
const { Bot, GrammyError, HttpError } = require("grammy");
// const options = require("./options.js");

const bot = new Bot(process.env.BOT_API_KEY);

const options = [
  {
    command: "start",
    description: "Start Bot",
  },
  {
    command: "info",
    description: "Show info me",
  },
  {
    command: "wow",
    description: "Get me wow",
  },
];

bot.api.setMyCommands(options);

bot.command("start", async (ctx) => {
  await ctx.reply("Hello! I am new bot by Bigdok86.");
});

bot.on("message", async (ctx) => {
  await ctx.reply("Ваше сообщение - ", ctx.update.message.text);
});

bot.catch((error) => {
  const ctx = error.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}`);
  const e = error.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

bot.start();
