self.addEventListener("push", (event) => {
  const { title, options } = event.data.json();
  console.log(title);
  console.log(options);

  self.registration.showNotification(title, options);
});

// self.addEventListener("notificationclose", (event) => {
//   const notification = event.notification;
//   const primaryKey = notification.data.primaryKey;

//   console.log("Closed notification: " + primaryKey);
// });

self.addEventListener("notificationclick", (event) => {
  const notification = event.notification;
  const primaryKey = notification.data.primaryKey;
  const action = event.action;

  if (action === "close") {
    notification.close();
  } else {
    event.waitUntil(
      clients.matchAll().then((clis) => {
        const client = clis.find((c) => {
          return c.visibilityState === "visible";
        });
        if (client !== undefined) {
          client.navigate("samples/page" + primaryKey + ".html");
          client.focus();
        } else {
          // there are no visible windows. Open one.
          clients.openWindow("samples/page" + primaryKey + ".html");
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
