(async function getPrize() {
  const fdj = await fetch("/fdj");
  const reader = await fdj.body.getReader();
  const value = await reader.read();
  const string = new TextDecoder("utf-8").decode(value.value);
  document.getElementById("prize").innerHTML = string;
})();

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function displayError(error) {
  console.error(error);
  alert(error.message);
}

async function getVapidKey() {
  try {
    const response = await fetch("/vapidkey", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération de la clé VAPID.");
    }
    return await response.text();
  } catch (error) {
    throw new Error(error);
  }
}

async function subscribe(swRegistration, publicVapidKey) {
  try {
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
    if (!subscription) {
      throw new Error("Erreur lors de l'abonnement aux notifications.");
    }
    const response = await fetch("/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Erreur dans la requête pour s'abonner.");
    }
  } catch (error) {
    throw new Error(error);
  }
}

async function unsubscribe(swRegistration) {
  try {
    const subscription = await swRegistration.pushManager.getSubscription();
    if (!subscription) {
      throw new Error("Pas d'abonnement retrouvé.");
    }
    const response = await fetch("/unsubscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Erreur dans la requête pour se désabonner.");
    }
  } catch (error) {
    throw new Error(error);
  }
}

const app = (async () => {
  "use strict";

  let swRegistration = null;
  const publicVapidKey = await getVapidKey();

  const subscribeButton = document.querySelector(".subscribe");
  const unsubscribeButton = document.querySelector(".unsubscribe");
  const buttons = [subscribeButton, unsubscribeButton];

  if (!("Notification" in window && "serviceWorker" in navigator)) {
    buttons.forEach((button) => {
      button.disabled = true;
    });
    document.querySelector(".notSupported").style.display = "block";
    return;
  }

  subscribeButton.addEventListener("click", async () => {
    try {
      const status = await Notification.requestPermission();
      if (status === "denied") {
        throw new Error(
          "Notifications désactivées pour ce site. Veuiller les réactiver."
        );
      }
      swRegistration = await navigator.serviceWorker.register("sw.js");
      if (!swRegistration) {
        throw new Error("Erreur lors du chargement du service worker.");
      }
      await navigator.serviceWorker.ready;
      await subscribe(swRegistration, publicVapidKey);
    } catch (error) {
      displayError(error);
    }
  });

  unsubscribeButton.addEventListener("click", async () => {
    try {
      swRegistration = await navigator.serviceWorker.getRegistration("sw.js");
      if (!swRegistration) {
        throw new Error("Pas de service worker retrouvé.");
      }
      await unsubscribe(swRegistration);
      alert("Désabonnement réussi.");
    } catch (error) {
      displayError(error);
    }
  });
})();
