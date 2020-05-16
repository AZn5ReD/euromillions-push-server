const webPush = require("web-push");

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
const mailTo = process.env.MAIL_TO;

exports.initWebPush = function () {
  webPush.setVapidDetails(mailTo, publicVapidKey, privateVapidKey);
  return webPush;
};

exports.notifPayload = function (prize) {
  return {
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
};

exports.welcomePayload = function () {
  return {
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
};

exports.alreadySubscribedPayload = function () {
  return {
    title: "Vous êtes déjà abonné 😊",
    options: {
      body:
        "Pas de panique, vous êtes déjà sur la liste des gens à notifier 😉",
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
};
