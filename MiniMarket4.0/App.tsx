import React from 'react';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from './src/context/AuthContext';
import { ProductProvider } from './src/context/ProductContext';
import { CartProvider } from './src/context/CartContext';
import { PurchaseProvider } from './src/context/PurchaseContext';

import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <PurchaseProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
            <StatusBar style="auto" />
          </PurchaseProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
