const schedule = require("node-schedule");
const child_process = require("child_process");

const periodicity = process.env.CRON_SCHEDULE;

function convertBufferToString(data) {
  return Buffer.from(data).toString().trim();
}

exports.scheduleNotification = function () {
  schedule.scheduleJob(periodicity, function () {
    console.info(
      "Démarrage automatique d'envoi avec périodicité:",
      periodicity
    );

    const child = child_process.fork("src/send_notif.js", {
      stdio: ["pipe", "pipe", "pipe", "ipc"],
    });

    if (child.stdout && child.stderr) {
      child.stdout.on("data", (data) => {
        console.info(convertBufferToString(data));
      });
      child.stderr.on("data", (data) => {
        console.info(convertBufferToString(data));
      });
    }

    child.on("exit", () => {
      console.info("Notifications terminées");
    });
  });
};
