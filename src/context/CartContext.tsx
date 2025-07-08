import {
  createContext,
  useContext,
  useState,
  ReactNode,
  FC,
  useCallback,
} from "react";
import { Package } from "@/hooks/useAdminDashboard";
import { message } from "antd";

interface CartItem extends Package {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Package) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = useCallback(
    (item: Package) => {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id);
        const hasSameCategory = prevItems.some(
          (i) => i.category === item.category && i.id !== item.id
        );

        if (hasSameCategory) {
          message.warning(
            `You already have a package from the "${item.category}" category. Package durations do not stack.`,
            5
          );
        }

        if (existingItem) {
          message.info(`"${item.name}" is already in your cart.`);
          return prevItems;
        } else {
          message.success(`Added "${item.name}" to cart.`);
          return [...prevItems, { ...item, quantity: 1 }];
        }
      });
    },
    [setCartItems]
  );

  const removeFromCart = (itemId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
