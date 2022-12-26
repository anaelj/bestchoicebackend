import axios from "axios";

export const apiInvestidor10 = axios.create({
  baseURL: "https://investidor10.com.br/api/",
  headers: { "Accept-Encoding": "gzip,deflate,compress" },
});
