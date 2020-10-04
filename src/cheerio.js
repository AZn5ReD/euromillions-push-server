const cheerio = require("cheerio");
const fetch = require("node-fetch");

const urlFdj = process.env.URL_FDJ;
const urlMegaJackpot = process.env.URL_MEGA_JACKPOT;

async function getFdjPage() {
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
}

async function getMegaJackpotPage() {
  try {
    const megaJackpotPage = await fetch(urlMegaJackpot);
    const text = await megaJackpotPage.text();
    const $ = await cheerio.load(text);
    $(".content");
    return $;
  } catch (error) {
    throw new Error(error);
  }
}

exports.getPageContent = async function () {
  let $ = await getFdjPage();
  let pageContent = await $(".banner-mini_text-content").html();
  if (!pageContent) {
    $ = await getMegaJackpotPage();
    pageContent = await $(".content").html();
  }
  return pageContent;
};

exports.getPrize = async function () {
  let $ = await getFdjPage();
  let prize = await $(".banner-euromillions_text-gain_num").html();
  if (!prize) {
    $ = await getMegaJackpotPage();
    prize = await $(".value").html().split(" ")[0];
  }
  return prize;
};
