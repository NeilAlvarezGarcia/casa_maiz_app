export const RouteNames = {
  Home: 'Home',
  Menu: 'Menu',
  Reservations: 'Reservations',
  Privacy: 'Privacy',
} as const;

export type RouteName = (typeof RouteNames)[keyof typeof RouteNames];

export type NavigatorRootParamList = {
  [K in RouteName]: undefined;
};

export const DEFAULT_ROUTE: RouteName = RouteNames.Home;
