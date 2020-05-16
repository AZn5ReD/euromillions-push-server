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

const app = (() => {
  "use strict";

  const publicVapidKey =
    "BOAZba0OdFM5CcZqxH8S8ElgMKuw47nJ9gNbqfTT50ovVixoO9EW1wK4_R4paz-umeBW6c-tIHJcfKPDsXlJK6I";

  let swRegistration = null;

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

  async function subscribe() {
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
      await subscribe();
    } catch (error) {
      displayError(error);
    }
  });

  async function unsubscribe() {
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
  unsubscribeButton.addEventListener("click", async () => {
    try {
      await unsubscribe();
    } catch (error) {
      displayError(error);
    }
  });
})();
