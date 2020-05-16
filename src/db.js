const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

exports.initDb = function () {
  const adapter = new FileSync("data/db.json");
  const db = low(adapter);
  db.defaults({ auths: [] });
  if (!db.has("auths").value()) {
    db.set("auths", []).write();
  }
  return db;
};
