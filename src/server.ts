import express from "express";
import { db } from "./firebase";
import { collection, getDocs, doc, runTransaction } from "firebase/firestore";
import { getStatusInvestData } from "./statusinvest-data";
import { getFundamentusData } from "./fundamentus-data";
import "dotenv/config";

const app = express();

app.get("/", (req, res) => {
  res.send("Well done!");
});

const sinc = async () => {
  const querySnapshot = await getDocs(collection(db, "tickers"));
  let idx = 2;
  querySnapshot.forEach(async (docItem) => {
    idx++;
    // if (idx > 20) {
    //   return;
    // }

    setTimeout(async () => {
      const sfDocRef = doc(db, "tickers", docItem.id);

      console.log("id:", docItem.id);

      try {
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(sfDocRef);
          if (!sfDoc.exists()) {
            throw "Document does not exist!";
          }

          let newDataStatus = {};
          try {
            newDataStatus = await getStatusInvestData(
              docItem.data().name.toString()
            );
          } catch (error) {
            console.log(
              "====> ",
              idx,
              docItem.data().name,
              "statusinvest-error:",
              error
            );
            return;
          }
          let newDataFundamentus = {};
          try {
            newDataFundamentus = await getFundamentusData(
              docItem.data().name.toString()
            );
          } catch (error) {
            console.log(
              "====> ",
              idx,
              docItem.data().name,
              "fundamentus-error:",
              error
            );
            return;
          }

          console.log(
            "name:",
            docItem.data().name,
            "status:",
            newDataStatus,
            "fundamentus",
            newDataFundamentus
          );

          transaction.update(sfDocRef, {
            ...newDataStatus,
            ...newDataFundamentus,
          });
          // return newData;
        });

        // console.log("Price increased to ", newPrice);
      } catch (e) {
        console.error(e);
      }
    }, 6000 * idx);
  });
};

sinc();

app.listen(5000, () => {
  console.log("The application is listening on port 5000!");
});
