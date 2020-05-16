require("dotenv").config();

const db = require("./db").initDb();
const webPush = require("./webpush").initWebPush();

console.info("Début du script d'envoi à ", new Date().toString());

(async () => {
  let prize;
  try {
    const $ = await require("./cheerio").fdjPage();
    prize = await $(".banner-euromillions_text-gain_num").html();
    console.info("Cagnotte à:", prize);
  } catch (error) {
    throw new Error(
      "Erreur lors de la récupération du montant de la cagnotte."
    );
  }

  const auths = db.get("auths").value();
  console.info("Nombre d'envoi prévu:", auths.length);

  const payload = require("./webpush").notifPayload(prize);

  const removeIds = [];
  for (const auth of auths) {
    console.info("Envoi à:", auth.id);
    await webPush
      .sendNotification(auth.value, JSON.stringify(payload))
      .catch((error) => {
        console.error("Erreur avec:", auth.id, error);
        removeIds.unshift(auth.id);
      });
  }

  console.info("Nombre de suppression:", removeIds.length);
  for (const id of removeIds) {
    db.get("auths").remove({ id }).write();
    console.info("Suppression de:", id);
  }
})().then(() => {
  process.exit();
});

process.on("uncaughtException", function (e) {
  console.error(new Date().toString(), e.stack || e);
  process.exit();
});
