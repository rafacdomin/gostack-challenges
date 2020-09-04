/* eslint-disable no-param-reassign */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  console.log(products);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace: Cart',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const sendToAsyncStorage = useCallback(async () => {
    await AsyncStorage.setItem(
      '@GoMarketplace: Cart',
      JSON.stringify(products),
    );
  }, [products]);

  const increment = useCallback(
    async id => {
      const newProducts = products.map(product => {
        if (product.id === id) {
          product.quantity += 1;
        }

        return product;
      });

      setProducts(newProducts);
      sendToAsyncStorage();
    },
    [products, sendToAsyncStorage],
  );

  const addToCart = useCallback(
    async product => {
      const productId = products.find(prod => prod.id === product.id);

      if (productId) {
        increment(product.id);
        return;
      }
      product.quantity = 1;
      setProducts(state => [...state, product]);
      sendToAsyncStorage();
    },
    [increment, products, sendToAsyncStorage],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = products
        .map(product => {
          if (product.id === id) {
            product.quantity -= 1;
          }

          return product;
        })
        .filter(product => product.quantity >= 1);

      setProducts(newProducts);
      sendToAsyncStorage();
    },
    [products, sendToAsyncStorage],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
