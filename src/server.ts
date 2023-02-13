import express from "express";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  runTransaction,
  getFirestore,
} from "firebase/firestore";
import "dotenv/config";
import { getValueSiteData } from "./find-data";
import { ISite, ITicker } from "./interfaces";
import { localTickersData } from "./configs/tickersData";
import { serializeQuerySnapshot } from "firestore-serializers";
import { getRentData } from "./api/apiIqb3";

const app = express();

// interface ILocalTickerData {
//   name: string;
//   symbol: string;
// }

app.get("/", (req, res) => {
  res.send("Well done!");
});

export const firestore = getFirestore(db.app);

const putLocalTickersOnFirestore = async () => {
  const tickersCollection = await getDocs(collection(firestore, "tickers"));
  const tickersSerializedCollection = serializeQuerySnapshot(tickersCollection);
  const tickersFirebase = JSON.parse(tickersSerializedCollection) as ITicker[];

  localTickersData
    .filter(
      (ticker) => !ticker.symbol.includes("3F") && !ticker.symbol.includes("4F")
    )
    .forEach(async (ticker) => {
      const hasTicker = tickersFirebase.find(
        (tickerFirebase) => tickerFirebase.name === ticker.symbol
      );
      if (!hasTicker) {
        addDoc(collection(firestore, "tickers"), { name: ticker.symbol });
      }
    });
};

// putLocalTickersOnFirestore();

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
      console.log(currentDate.toString(), ticker?.lastUpdate?.toString());
      if (currentDate.toString() === ticker?.lastUpdate?.toString()) return;

      const site = sites[idxSite];

      const data = await getValueSiteData(site, tickerName);
      const rentData = await getRentData(tickerName);

      if (data) {
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(tickerRef);
          if (!sfDoc.exists()) {
            throw "Document does not exist!";
          }

          try {
            transaction.update(tickerRef, {
              ...data,
              ...rentData,
              lastUpdate: currentDate,
            });
          } catch (error) {
            console.log(error);
          }
        });
      }

      if (idxSite < sites.length - 1) await mapSites(idxSite + 1);
    };
    await mapSites(0);

    if (idx < tickers.length - 1) await mapTickers(idx + 1);
  };

  await mapTickers(0);

  // for (let index = 0; index < 116; index++) {
  //   console.log(
  //     `,,,,,,,,,,,,=SUMIF(B2:B10006;L${index};D2:D10006)+SUMIF(E2:E1006;L${index};G2:G1006),,,=SUMIF(L2:L1006;O${index};M2:M1006)`
  //   );
  // }
};

app.listen(process.env.PORT, () => {
  console.log(`The application is listening on port ${process.env.PORT}!`);
  process.setMaxListeners(0);
  sinc();
});
