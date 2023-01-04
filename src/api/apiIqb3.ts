import axios from "axios";
import { initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase/firestore";
import { app, db } from "../firebase";

const apiAlugueis = axios.create({
  baseURL: "https://www.iqb3.com.br/btc/plot/",
});

export const getRentData = async (ticker: string) => {
  try {
    const res = await apiAlugueis.get(ticker);
    const lastQuantityRent1 =
      res.data.abertas[res.data.abertas.length - 1]?.toString();
    const lastQuantityRent2 =
      res.data.abertas[res.data.abertas.length - 2]?.toString();
    const lastQuantityRent3 =
      res.data.abertas[res.data.abertas.length - 3]?.toString();
    const average =
      res.data.abertas.reduce((a: number, b: number) => a + b, 0) /
      res.data.abertas.length;

    const rentData = {
      lastQuantityRent1,
      lastQuantityRent2,
      lastQuantityRent3,
      rentAverage: average?.toFixed()?.toString(),
    };

    return rentData;
  } catch (error) {
    return {};
  }
};
