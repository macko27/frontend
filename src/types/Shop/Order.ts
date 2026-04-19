import { Product } from "./Product";

export type Order = {
  id: string;
  cisloObjednavky: string;
  ulica: string;
  cisloDomu: string;
  city: string;
  psc: string;
  telefon: string;
  poznamka: string;
  cena: number;
  produkty: Product[];
  dateIn: string;
  stav: number;
}