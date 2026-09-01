import React, {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';

/**
 * Tracks the currently focused top-level route name so components rendered
 * outside the navigator (e.g. the TopBar chrome) can still apply page-targeted
 * CMS behavior such as alert pageSlugs. The value is fed from
 * NavigationContainer's onStateChange at the app shell.
 */
const ActiveRouteContext = createContext<string>('Home');

export function ActiveRouteProvider({
  value,
  children,
}: PropsWithChildren<{value: string}>): React.JSX.Element {
  return (
    <ActiveRouteContext.Provider value={value}>
      {children}
    </ActiveRouteContext.Provider>
  );
}

export function useActiveRoute(): string {
  return useContext(ActiveRouteContext);
}

/** Extracts the focused route name from a navigation state object. */
export function focusedRouteName(state: unknown): string {
  const root = state as
    | {routes?: Array<{name?: string; state?: unknown}>; index?: number}
    | undefined;
  const current = root?.routes?.[root.index ?? 0];
  const name = current?.name;
  if (!current?.state && name) {
    return name;
  }
  return name || focusedRouteName(current?.state);
}
