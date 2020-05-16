const cheerio = require("cheerio");
const fetch = require("node-fetch");

const urlFdj = process.env.URL_FDJ;

exports.fdjPage = async function () {
  try {
    const fdjPage = await fetch(urlFdj);
    const text = await fdjPage.text();
    const $ = await cheerio.load(text);
    $("sup").remove();
    $("img").remove();
    $(".banner-euromillions_text-name").append("<br/>");
    $(".banner-euromillions_text-supwinner").remove();
    return $;
  } catch (error) {
    throw new Error(error);
  }
};
