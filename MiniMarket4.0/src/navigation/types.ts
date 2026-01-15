export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
  CreateProduct: undefined;
  EditProduct: { productId: string };
};

export type MainTabsParamList = {
  Home: undefined;
  ProductList: undefined;
  MyProducts: undefined;
  MyPurchases: undefined;
  Profile: undefined;
};
