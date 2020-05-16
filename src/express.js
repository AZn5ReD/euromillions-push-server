const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const compression = require("compression");

exports.initExpress = function () {
  const app = express();
  app.use(compression());
  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, "public")));
  return app;
};
