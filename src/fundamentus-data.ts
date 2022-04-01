import puppeteer from "puppeteer";

const getValueFromXPath = async (page: puppeteer.Page, url: string) => {
  const elementFromXPath = (await page.$x(url))[0];
  return await page.evaluate((el) => {
    return el.textContent
      .replace(",", ".")
      .replace("%", "")
      .replace(" ", "")
      .replace("\n", "");
  }, elementFromXPath);
};

export async function getFundamentusData(ticker: string) {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();

  await page.goto(`https://fundamentus.com.br/detalhes.php?papel=${ticker}`);

  const growth = await getValueFromXPath(
    page,
    `/html/body/div[1]/div[2]/table[3]/tbody/tr[12]/td[4]/span`
  );
  const sector = await getValueFromXPath(
    page,
    `/html/body/div[1]/div[2]/table[1]/tbody/tr[4]/td[2]/span/a`
  );

  browser.close();

  return {
    growth,
    sector,
  };
}

// const testee = async () => {
//   const teste = await getStatusInvestData("petr4");
//   console.log(teste);
// };

// testee();
