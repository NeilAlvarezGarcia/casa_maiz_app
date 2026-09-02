import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';

const ActiveRouteContext = createContext<string>('Home');

export function ActiveRouteProvider({
  value,
  children,
}: PropsWithChildren<{ value: string }>): React.JSX.Element {
  return (
    <ActiveRouteContext.Provider value={value}>
      {children}
    </ActiveRouteContext.Provider>
  );
}

export function useActiveRoute(): string {
  return useContext(ActiveRouteContext);
}

export function focusedRouteName(state: unknown): string {
  const root = state as
    | { routes?: Array<{ name?: string; state?: unknown }>; index?: number }
    | undefined;
  const current = root?.routes?.[root.index ?? 0];
  const name = current?.name;
  if (!current?.state && name) {
    return name;
  }
  return name || focusedRouteName(current?.state);
}
