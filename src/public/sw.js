self.addEventListener("push", async (event) => {
  const { title, options } = await event.data.json();
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const action = event.action;
  const actions = {
    home: "/",
    app: "fdj://launch",
    web: "https://www.fdj.fr/jeux-de-tirage/euromillions-my-million",
    "": "https://www.fdj.fr/jeux-de-tirage/euromillions-my-million",
  };

  if (action === "close") {
    notification.close();
  } else {
    event.waitUntil(
      clients.matchAll().then((clis) => {
        const client = clis.find((c) => {
          return c.visibilityState === "visible";
        });
        if (client !== undefined) {
          client.navigate(actions[action]);
          client.focus();
        } else {
          clients.openWindow(actions[action]);
          notification.close();
        }
      })
    );
  }

  self.registration.getNotifications().then((notifications) => {
    notifications.forEach((notification) => {
      notification.close();
    });
  });
});
