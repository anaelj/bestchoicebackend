import puppeteer from "puppeteer";

const getValueFromXPath = async (page: puppeteer.Page, url: string) => {
  try {
    const elementFromXPath = (await page.$x(url))[0];
    return await page.evaluate((el) => {
      return el.textContent.replace(",", ".").replace("%", "").replace(" ", "");
    }, elementFromXPath);
  } catch (error) {
    console.log("erro na url:", url);
    return "0";
  }
};

export async function getStatusInvestData(ticker: string) {
  const browser = await puppeteer.launch({ headless: true });

  const page = await browser.newPage();

  await page.goto(`https://statusinvest.com.br/acoes/${ticker}`, {
    waitUntil: "networkidle2",
  });

  const priceQuoteValue = await getValueFromXPath(
    page,
    `//*[@id="main-2"]/div[2]/div/div[1]/div/div[1]/div/div[1]/strong`
  );

  const dividendYeld = await getValueFromXPath(
    page,
    `//*[@id="main-2"]/div[2]/div/div[1]/div/div[4]/div/div[1]/strong`
  );
  const tagAlong = await getValueFromXPath(
    page,
    `//*[@id="main-2"]/div[2]/div/div[5]/div/div/div[2]/div/div/div/strong`
  );
  const priceProfit = await getValueFromXPath(
    page,
    `//*[@id="indicators-section"]/div[2]/div/div[1]/div/div[2]/div/div/strong`
  ); // PL
  const priceEquitValue = await getValueFromXPath(
    page,
    `//*[@id="indicators-section"]/div[2]/div/div[1]/div/div[4]/div/div/strong`
  ); // P/VP
  const debitOfEbitida = await getValueFromXPath(
    page,
    `//*[@id="indicators-section"]/div[2]/div/div[2]/div/div[3]/div/div/strong`
  ); // div liq/ ebitida

  const profitMarginLiquid = await getValueFromXPath(
    page,
    `//*[@id="indicators-section"]/div[2]/div/div[3]/div/div[4]/div/div/strong`
  ); // margem liquida
  const haveDateTemp = await getValueFromXPath(
    page,
    `//*[@id="earning-section"]/div[6]/div/div[2]/table/tbody/tr[1]/td[2]`
  ); // margem liquida
  const haveDate = haveDateTemp === "0" ? "-" : haveDateTemp;

  browser.close();

  return {
    priceQuoteValue,
    dividendYeld,
    tagAlong,
    priceProfit,
    priceEquitValue,
    debitOfEbitida,
    profitMarginLiquid,
    haveDate,
  };
}

// const testee = async () => {
//   const teste = await getStatusInvestData("petr4");
//   console.log(teste);
// };

// testee();
