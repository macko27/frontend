import { ShopCategory } from "./ShopCategory";

export type Product = {
  id: string;
  name: string;
  info: string;
  price: number;
  shopCategory: ShopCategory;
  imageUrl: string;
};

