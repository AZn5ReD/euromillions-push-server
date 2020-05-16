require("dotenv").config();

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const urlFdj = process.env.URL_FDJ;

const express = require("express");
const webPush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const fetch = require("node-fetch");
const lowDb = require("lowdb");
const cheerio = require("cheerio");

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

webPush.setVapidDetails(
  "mailto:example@example.com",
  publicVapidKey,
  privateVapidKey
);

app.get("/fdj", async (req, res) => {
  const fdjPage = await fetch(urlFdj); // TODO Cache response ?
  const text = await fdjPage.text();
  let $ = await cheerio.load(text);
  $("sup").remove();
  $("img").remove();
  res.send($(".banner-mini_text-content").html());
});

app.post("/subscribe", (req, res) => {
  const subscription = req.body;

  console.log(subscription);
  // TODO Save subscription to DB

  const payload = {
    title: "Super ! Vous êtes abonné ! 🎉",
    options: {
      body:
        "Vous recevrez dorénavent des notifications lorsque la cagnotte Euromillions dépasse 100 millions € 💰",
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
          action: "close",
          title: "Fermer",
        },
      ],
    },
  };

  webPush
    .sendNotification(subscription, JSON.stringify(payload))
    .catch((error) => console.error(error));

  res.status(201).json({});
});

app.post("unsubscribe", (req, res) => {
  // TODO Remove from DB
});

app.set("port", process.env.PORT || 5000);
const server = app.listen(app.get("port"), () => {
  console.log(`Server running on port ${server.address().port}`);
});
