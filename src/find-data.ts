import puppeteer from "puppeteer";
import { apiInvestidor10 } from "./api/apiInvestidor10";
import { ISite } from "./interfaces";

const getValueFromXPath = async (page: puppeteer.Page, url: string) => {
  try {
    const elementFromXPath = (await page.$x(url))[0];
    return await page.evaluate((el, attr) => {
      return el?.textContent
        .replaceAll(",", ".")
        .replaceAll("%", "")
        .replaceAll(" ", "")
        .replaceAll("\n", "")
        .replaceAll("R$", "");
    }, elementFromXPath);
  } catch (error) {
    console.log(error);
  }
};

export async function getValueSiteData(
  site: ISite,
  ticker: string
): Promise<any> {
  try {
    const browser = await puppeteer.launch({ headless: true });

    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(0);

    const hasInvestidor10 = site?.url?.includes("investidor10");
    const hasBDR = ticker.includes("34");

    const newUrl =
      hasBDR && hasInvestidor10
        ? site?.url?.replace("acoes", "bdrs")
        : site?.url;

    await page.goto(newUrl.replace("#tickername", ticker), {
      waitUntil: "load",
      timeout: 0,
    });

    let data: any = {};

    try {
      if (hasInvestidor10) {
        let tickerId;
        try {
          tickerId = await page.$eval("#follow-company-mobile", (element) =>
            element.getAttribute("data-id")
          );
        } catch (error) {}

        if (tickerId) {
          const response = await apiInvestidor10
            .get(`historico-indicadores/${tickerId}/10`)
            .catch((error) => console.log("error-apiinvestidor10", error));
          const pls = response?.data["P/L"];
          if (pls) {
            const plsObj = pls
              .filter((item: any) => item.year !== "Atual")
              .map(
                (item: any, idx: number) =>
                  `{ "pl${idx + 1}": "${item?.value.toFixed(2)}"}`
              );

            plsObj.forEach((element: any) => {
              data = { ...data, ...JSON.parse(element) };
            });
          }
        }
      }
    } catch (error) {
      console.log(error);
    }

    console.log(newUrl.replace("#tickername", ticker));

    if (!site?.fields) return {};

    await Promise.all(
      Object.entries(site?.fields).map(async (prop) => {
        const [propName, propValue] = prop;
        let value;
        try {
          value = await getValueFromXPath(page, propValue);
          if (value === "-" || value === "--") value = undefined;
        } catch (error) {
          console.log(error);
        }
        if (value) data[propName] = value;
      })
    );
    await browser.close();

    return data;
  } catch (error) {
    console.log(error);
  }
}
