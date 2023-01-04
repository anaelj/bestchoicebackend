export interface ISite {
  url: string;
  fields: any[];
}

export interface ITicker {
  name: string;
  __id__: string;
  sector: string;
  growth: number;
  priceQuoteValue: number;
  dividendYeld: number;
  tagAlong: number;
  priceProfit: number;
  priceEquitValue: number;
  debitOfEbitida: number;
  profitMarginLiquid: number;
  lastUpdate?: Date;
}
