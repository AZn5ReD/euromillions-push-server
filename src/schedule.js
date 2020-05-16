const schedule = require("node-schedule");
const child_process = require("child_process");

exports.scheduleNotification = function () {
  schedule.scheduleJob("17 18 * * *", function () {
    const child = child_process.fork("src/send_notif.js", {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
    });

    if (child.stdout && child.stderr) {
      child.stdout.on("data", (data) => {
        console.log(Buffer.from(data).toString());
      });
      child.stderr.on("data", (data) => {
        console.log(Buffer.from(data).toString());
      });
    }

    child.on("exit", () => {
      console.info("Notifications terminées");
    });
  });
};
