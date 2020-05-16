require("dotenv").config();

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const mailTo = process.env.MAIL_TO;
const urlFdj = process.env.URL_FDJ;

const webPush = require("web-push");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

console.info("Début du script d'envoi à ", new Date().toString());

// DB
const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({ auths: [] });
if (!db.has("auths").value()) {
  db.set("auths", []).write();
}

webPush.setVapidDetails(mailTo, publicVapidKey, privateVapidKey);

(async () => {
  let prize;
  try {
    const fdjPage = await fetch(urlFdj);
    const text = await fdjPage.text();
    let $ = await cheerio.load(text);
    prize = await $(".banner-euromillions_text-gain_num").html();
  } catch (error) {
    throw new Error(
      "Erreur lors de la récupération du montant de la cagnotte."
    );
  }
  console.info("Cagnotte à:", prize);

  const auths = db.get("auths").value();
  console.info("Nombre d'envoi à faire:", auths.length);

  const payload = {
    title: `Cagnotte à ${prize} millions € ! 🤑`,
    options: {
      body: "Pensez à jouer !",
      tag: "em1",
      icon: "images/icon.png",
      badge: "images/badge.png",
      vibrate: [100, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
      actions: [
        {
          action: "app",
          title: "App FDJ",
        },
        {
          action: "web",
          title: "Site FDJ.fr",
        },
      ],
    },
  };

  let removeId = [];
  for (auth in auths) {
    console.info("Envoi à:", auths[auth].id);
    await webPush
      .sendNotification(auths[auth].value, JSON.stringify(payload))
      .catch((error) => {
        console.error("Erreur avec:", auths[auth].id, error);
        removeId.unshift(auths[auth].id);
      });
  }

  console.info("Nombre de suppression:", removeId.length);
  for (i in removeId) {
    db.get("auths").remove({ id: removeId[i] }).write();
    console.info("Suppression de:", removeId[i]);
  }
})().then(() => {
  process.exit();
});

process.on("uncaughtException", function (e) {
  console.error(new Date().toString(), e.stack || e);
  process.exit();
});
