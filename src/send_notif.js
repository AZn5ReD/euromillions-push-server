require("dotenv").config();
const webPush = require("web-push");

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails(
  "mailto:chirk.jonathan@gmail.com",
  publicVapidKey,
  privateVapidKey
);

const subscription = {
  endpoint:
    "https://updates.push.services.mozilla.com/wpush/v2/gAAAAABeucs93ODzPTLD8cg3NSj5s2Z6DRSAQajI7S_ZgX7fX4eWgXWy4UdsfzEn71BLc6J_Ih4X7vhslh4_GCCffwqL7y4f8Xq26DKxbzkhQE77bbEbJ-MFf7caxcy4x8QvWiPM4KUyB6ypPj1A1t-vDrFeXu_JpeViRPBB1SiPyGnEUBwWbpw",
  keys: {
    auth: "tqyJ8E7g-eAyBHD7qsDcbg",
    p256dh:
      "BKYPSgE9OF4NwxClhRNqtNFmyoZf7AjFJ6N2tSgZultRedEv54Ulq2uo_lMkcU5986hM0zFJri_gZEAzB9OXroU",
  },
};

webPush
  .sendNotification(
    subscription,
    JSON.stringify({ title: "Hello", body: "It's me" })
  )
  .catch((error) => console.error(error));
