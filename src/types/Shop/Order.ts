import { ProductOrder } from "./ProductOrder";

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
  produkty: ProductOrder[];
  dateIn: string;
  stav: number;
  pouzivatel: string;
}