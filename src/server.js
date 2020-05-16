require("dotenv").config();

const db = require("./db").initDb();
const webPush = require("./webpush").initWebPush();
const app = require("./express").initExpress();

require("./schedule").scheduleNotification();

app.get("/fdj", async (req, res) => {
  let $ = await require("./cheerio").fdjPage();
  res.send(await $(".banner-mini_text-content").html());
});

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  const id = subscription.keys.auth;
  let payload;

  const auth = db.get("auths").find({ id });
  if (!auth.value()) {
    try {
      db.get("auths").push({ id, value: subscription }).write();
      payload = require("./webpush").welcomePayload();
      console.info("Nouvel abonnement:", id);
    } catch (error) {
      next(error);
    }
  } else {
    payload = require("./webpush").alreadySubscribedPayload();
    console.info("Déjà abonné:", id);
  }

  webPush
    .sendNotification(subscription, JSON.stringify(payload))
    .catch((error) => {
      next(error);
    });
  console.info("Message envoyé à:", id);

  res.status(201).json({});
});

app.post("/unsubscribe", (req, res) => {
  const subscription = req.body;
  const id = subscription.keys.auth;

  const auth = db.get("auths").find({ id });
  if (auth.value()) {
    try {
      db.get("auths").remove({ id }).write();
      console.info("Désabonnement:", id);
    } catch (error) {
      next(error);
    }
  }
  res.status(200).json({});
});

app.set("port", process.env.PORT || 5000);
const server = app.listen(app.get("port"), () => {
  console.info(`Serveur démarré sur le port ${server.address().port}`);
});

process.on("uncaughtException", function (e) {
  console.error(new Date().toString(), e.stack || e);
  process.exit();
});
