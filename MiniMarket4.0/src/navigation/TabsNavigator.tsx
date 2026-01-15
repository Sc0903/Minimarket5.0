import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductListScreen } from '../screens/ProductListScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { MyProductsScreen } from '../screens/MyProductsScreen';
import { CreateProductScreen } from '../screens/CreateProductScreen';
import { EditProductScreen } from '../screens/EditProductScreen';
import { MyPurchasesScreen } from '../screens/MyPurchasesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CartScreen } from '../screens/CartScreen';
import { PaymentScreen } from '../screens/PaymentScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const ShopStack = createNativeStackNavigator();
const MyProductsStack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeScreen" component={ProductListScreen} />
      <HomeStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Detalle del producto' }}
      />
    </HomeStack.Navigator>
  );
};

const ShopStackNavigator = () => {
  return (
    <ShopStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Atrás',
      }}
    >
      <ShopStack.Screen
        name="CartIndex"
        component={CartScreen}
        options={{ title: 'Mi Carrito' }}
      />
      <ShopStack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Procesar pago' }}
      />
    </ShopStack.Navigator>
  );
};

const MyProductsStackNavigator = () => {
  return (
    <MyProductsStack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Atrás',
      }}
    >
      <MyProductsStack.Screen
        name="MyProductsScreen"
        component={MyProductsScreen}
        options={{ title: 'Mis productos' }}
      />
      <MyProductsStack.Screen
        name="CreateProduct"
        component={CreateProductScreen}
        options={{ title: 'Crear producto' }}
      />
      <MyProductsStack.Screen
        name="EditProduct"
        component={EditProductScreen}
        options={{ title: 'Editar producto' }}
      />
    </MyProductsStack.Navigator>
  );
};

export const MainTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ShopTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'MyProductsTab') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'MyPurchasesTab') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopStackNavigator}
        options={{ title: 'Carrito' }}
      />
      <Tab.Screen
        name="MyProductsTab"
        component={MyProductsStackNavigator}
        options={{ title: 'Mis productos' }}
      />
      <Tab.Screen
        name="MyPurchasesTab"
        component={MyPurchasesScreen}
        options={{ title: 'Mis compras', headerShown: true }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: 'Perfil', headerShown: true }}
      />
    </Tab.Navigator>
  );
};
