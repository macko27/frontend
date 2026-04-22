import { ShopCategory } from "./ShopCategory";

export type ProductOrder = {
  id: string;
  name: string;
  info: string;
  price: number;
  shopCategory: ShopCategory;
  quantity: number;
  imageUrl: string;
};

