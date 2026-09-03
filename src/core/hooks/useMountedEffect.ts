import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

interface ReadableRef<T> {
  readonly current: T;
}

interface MountedEffectArgs<T> {
  mounted: ReadableRef<boolean>;
  signal: AbortSignal;
  setState: Dispatch<SetStateAction<T>>;
}

type MountedCallback<T> = (
  args: MountedEffectArgs<T>,
) => Promise<void | (() => void)>;

interface MountedEffectResult<T> {
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  refresh: () => void;
}

export function useMountedEffect<T>(
  cb: MountedCallback<T>,
  deps: unknown[],
  initialState: T | (() => T),
): MountedEffectResult<T> {
  const [state, setState] = useState<T>(initialState);
  const [attempt, setAttempt] = useState(0);
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    const mounted = { current: true };
    const controller = new AbortController();
    let cleanupFn: (() => void) | undefined;

    const safeSetState: Dispatch<SetStateAction<T>> = next => {
      if (mounted.current) {
        setState(next);
      }
    };

    cbRef
      .current({ mounted, signal: controller.signal, setState: safeSetState })
      .then(fn => {
        if (typeof fn === 'function') {
          cleanupFn = fn;
        }
      }, () => {});

    return () => {
      mounted.current = false;
      cleanupFn?.();
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const refresh = useCallback(() => setAttempt(n => n + 1), []);

  return { state, setState, refresh };
}
