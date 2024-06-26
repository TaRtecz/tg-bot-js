require("dotenv").config();
const { Bot, Keyboard, InlineKeyboard, GrammyError, HttpError } = require("grammy");
const { getRandomQuestion, getCorrectAnswer } = require("./utils");
// const options = require("./options.js");

const bot = new Bot(process.env.BOT_API_KEY);

const options = [
  {
    command: "start",
    description: "Показать что я могу",
  },
  {
    command: "game",
    description: "Играть",
  },
];

bot.api.setMyCommands(options);

bot.command("start", async (ctx) => {
  const startKeyboard = new InlineKeyboard()
    .text("Лицевой счет")
    .text("Передача показаний воды")
    .row()
    .text("Передача показаний тепла")
    .text("Передача показаний электроэнергии")
    .row()
    .text("Записанные показания");

  await ctx.reply(
    `
      ❗Выберите одно из следующих действий:\n
      🧾 Лицевой счет - регистрация и управление лицевым счетом\n
      💦 Передача показаний воды - осуществляется с 23 по 25 число каждого меясца, оплата 10 числа каждого месяца\n
      🕯️ Передача показаний тепла - осуществляется с 23 по 25 число каждого меясца, оплата 10 числа каждого месяца\n
      ⚡ Передача показаний электроэнергии - осуществляется с 23 по 25 число каждого меясца, оплата 10 числа каждого месяца\n
      📖 Записанные показания - список записанных вами показаний
    `,
    {
      reply_markup: startKeyboard,
    }
  );
});

bot.command("game", async (ctx) => {
  const startKeyboard = new Keyboard()
    .text("HTML")
    .text("CSS")
    .row()
    .text("JavaScript")
    .text("React")
    .row()
    .text("Случайный вопрос")
    .resized();
  await ctx.reply(
    "Привет! Я - Frontend Interview Prep Bot 🤖 \nЯ помогу тебе подготовиться к интервью по фронтенду"
  );
  await ctx.reply("С чего начнем? Выбери тему вопроса в меню 👇", {
    reply_markup: startKeyboard,
  });
});

bot.hears(["HTML", "CSS", "JavaScript", "React", "Случайный вопрос"], async (ctx) => {
  const topic = ctx.message.text.toLowerCase();
  const { question, questionTopic } = getRandomQuestion(topic);

  let inlineKeyboard;

  if (question.hasOptions) {
    const buttonRows = question.options.map((option) => [
      InlineKeyboard.text(
        option.text,
        JSON.stringify({
          type: `${questionTopic}-option`,
          isCorrect: option.isCorrect,
          questionId: question.id,
        })
      ),
    ]);

    inlineKeyboard = InlineKeyboard.from(buttonRows);
  } else {
    inlineKeyboard = new InlineKeyboard().text(
      "Узнать ответ",
      JSON.stringify({
        type: questionTopic,
        questionId: question.id,
      })
    );
  }

  await ctx.reply(question.text, {
    reply_markup: inlineKeyboard,
  });
});

bot.on("callback_query:data", async (ctx) => {
  const callbackData = JSON.parse(ctx.callbackQuery.data);

  if (!callbackData.type.includes("option")) {
    const answer = getCorrectAnswer(callbackData.type, callbackData.questionId);
    await ctx.reply(answer, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    await ctx.answerCallbackQuery();
    return;
  }

  if (callbackData.isCorrect) {
    await ctx.reply("Верно ✅");
    await ctx.answerCallbackQuery();
    return;
  }

  const answer = getCorrectAnswer(callbackData.type.split("-")[0], callbackData.questionId);
  await ctx.reply(`Неверно ❌ Правильный ответ: ${answer}`);
  await ctx.answerCallbackQuery();
});

bot.on("message", async (ctx) => {
  // await bot.api.sendMessage(
  //   1599143985,
  //   '<b>Hi!</b> <i>Welcome</i> to <a href="https://grammy.dev">grammY</a>.',
  //   { parse_mode: "HTML" }
  // );
  const text = ctx.msg.text;
  await ctx.reply(`Ваше сообщение - ${text}`);
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
