import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';
import { DEFAULT_ROUTE, type RouteName } from './routes';

const ActiveRouteContext = createContext<RouteName>(DEFAULT_ROUTE);

export function ActiveRouteProvider({
  value,
  children,
}: PropsWithChildren<{ value: RouteName }>): React.JSX.Element {
  return (
    <ActiveRouteContext.Provider value={value}>
      {children}
    </ActiveRouteContext.Provider>
  );
}

export function useActiveRoute(): RouteName {
  return useContext(ActiveRouteContext);
}

export function focusedRouteName(state: unknown): RouteName {
  const root = state as
    | { routes?: Array<{ name?: string; state?: unknown }>; index?: number }
    | undefined;
  const current = root?.routes?.[root.index ?? 0];
  const name = current?.name;
  if (!current?.state && name) {
    return name as RouteName;
  }
  return (name as RouteName) || focusedRouteName(current?.state);
}
