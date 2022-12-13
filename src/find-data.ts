import puppeteer from "puppeteer";
import { ISite } from "./interfaces";

const getValueFromXPath = async (page: puppeteer.Page, url: string) => {
  try {
    const elementFromXPath = (await page.$x(url))[0];
    return await page.evaluate((el) => {
      return el?.textContent
        .replaceAll(",", ".")
        .replaceAll("%", "")
        .replaceAll(" ", "")
        .replaceAll("\n", "");
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

    await page.goto(site.url.replace("#tickername", ticker), {
      waitUntil: "load",
      timeout: 0,
    });

    console.log(site.url.replace("#tickername", ticker));

    if (!site?.fields) return {};

    let data: any = {};

    await Promise.all(
      Object.entries(site?.fields).map(async (prop) => {
        const [propName, propValue] = prop;
        let value;
        try {
          value = await getValueFromXPath(page, propValue);
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
