import React, { createContext, useContext, useState } from "react";
import { CartItem } from "../../../types/Shop/CartItem";
import { useEffect } from "react";

interface CartContextType {
  items: CartItem[];
  pointsBalance: number;
  setPointsBalance: (points: number) => void;
  addToCart: (item: CartItem) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, change: number) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getTotalPoints = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("CartContext not found");
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [pointsBalance, setPointsBalance] = useState<number>(0);

  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    const savedCart = localStorage.getItem("cart");
    if (!savedCart) return [];

    try {
      return JSON.parse(savedCart);
    } catch (e) {
      console.error("Invalid cart data in localStorage");
      return [];
    }
  });



  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);


  const addToCart = (newItem: CartItem): boolean => {
    let success = true;

    setItems(prev => {
      const total = getTotalPoints(prev);
      const newTotal = total + newItem.price * newItem.quantity;

      if (newTotal > pointsBalance) {
        success = false;
        return prev;
      }

      const existing = prev.find(i => i.id === newItem.id);

      if (existing) {
        return prev.map(i =>
          i.id === newItem.id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }

      return [...prev, newItem];
    });

    return success;
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };



  const updateQuantity = (id: string, change: number): boolean => {
    let success = true;

    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id !== id) return item;

        const newQuantity = Math.max(1, item.quantity + change);

        return { ...item, quantity: newQuantity };
      });

      const total = getTotalPoints(updated);

      if (total > pointsBalance) {
        success = false;
        return prev; // revert
      }

      return updated;
    });

    return success;
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, pointsBalance, setPointsBalance, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};