import express from "express";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  runTransaction,
  getFirestore,
} from "firebase/firestore";
import "dotenv/config";
import { getValueSiteData } from "./find-data";
import { ISite, ITicker } from "./interfaces";

import { serializeQuerySnapshot } from "firestore-serializers";
import { getRentData } from "./api/apiIqb3";

const app = express();

app.get("/", (req, res) => {
  res.send("Well done!");
});

export const firestore = getFirestore(db.app);

const sinc = async () => {
  const sitesCollection = await getDocs(collection(firestore, "sites"));
  const serializedCollection = serializeQuerySnapshot(sitesCollection);
  const sites = JSON.parse(serializedCollection) as ISite[];

  const tickersCollection = await getDocs(collection(firestore, "tickers"));
  const tickersSerializedCollection = serializeQuerySnapshot(tickersCollection);
  const tickers = JSON.parse(tickersSerializedCollection) as ITicker[];

  const mapTickers = async (idx: number) => {
    const ticker = tickers[idx];

    const tickerRef = doc(db, "tickers", ticker.__id__);

    const currentDate = new Date().toLocaleDateString();

    const tickerName = ticker.name.toString();

    const mapSites = async (idxSite: number) => {
      // if (currentDate.toString() === ticker?.lastUpdate?.toString()) return;

      const site = sites[idxSite];

      const data = await getValueSiteData(site, tickerName);
      const rentData = await getRentData(tickerName);

      if (data) {
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(tickerRef);
          if (!sfDoc.exists()) {
            throw "Document does not exist!";
          }

          transaction.update(tickerRef, {
            ...data,
            ...rentData,
            lastUpdate: currentDate,
          });
        });
      }

      if (idxSite < sites.length - 1) await mapSites(idxSite + 1);
    };
    await mapSites(0);

    if (idx < tickers.length - 1) await mapTickers(idx + 1);
  };

  await mapTickers(0);
};

app.listen(process.env.PORT, () => {
  console.log(`The application is listening on port ${process.env.PORT}!`);
  process.setMaxListeners(0);
  sinc();
});
