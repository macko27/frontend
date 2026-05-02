import React, { createContext, useContext, useState } from "react";
import { CartItem } from "../../../types/Shop/CartItem";
import { useEffect } from "react";

interface CartContextType {
  items: CartItem[];
  initialized: boolean;
  userId: string | null;
  setUserId: (id: string) => void;
  pointsBalance: number;
  setPointsBalance: (points: number) => void;
  addToCart: (item: CartItem) => boolean;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, change: number) => "ok" | "points" | "stock";
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
  const [userId, setUserId] = useState<string | null>(null);

  const [items, setItems] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const savedCart = localStorage.getItem(`cart_${userId}`);

    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch {
        setItems([]);
      }
    } else {
      setItems([]);
    }
    setInitialized(true);
  }, [userId]);



  useEffect(() => {
    if (!userId) return;

    localStorage.setItem("cart_user", userId);
    localStorage.setItem(`cart_${userId}`, JSON.stringify(items));
  }, [items, userId]);


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



  const updateQuantity = (id: string, change: number): "ok" | "points" | "stock" => {
    let result: "ok" | "points" | "stock" = "ok";

    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id !== id) return item;

        const newQuantity = Math.max(1, item.quantity + change);

        if (item.size && newQuantity > item.size) {
          result = "stock";
          return item;
        }

        return { ...item, quantity: newQuantity };
      });

      const total = getTotalPoints(updated);

      if (total > pointsBalance) {
        result = "points";
        return prev; // revert
      }

      return updated;
    });

    return result;
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, initialized, userId, setUserId, pointsBalance, setPointsBalance, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};