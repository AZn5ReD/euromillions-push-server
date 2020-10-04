require("dotenv").config();

const db = require("./db").initDb();
const webPush = require("./webpush").initWebPush();

const threshold = process.env.PRIZE_THRESHOLD;

console.info("Début du script d'envoi le:", new Date().toString());

(async () => {
  let prize;
  try {
    prize = await require("./cheerio").getPrize();
    console.info("Cagnotte à:", prize);
    console.info("Seuil de notification à:", threshold);
  } catch (error) {
    throw new Error(
      "Erreur lors de la récupération du montant de la cagnotte."
    );
  }

  if (parseInt(prize) <= parseInt(threshold)) {
    console.info("Cagnotte inférieur au seuil.");
    return;
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
