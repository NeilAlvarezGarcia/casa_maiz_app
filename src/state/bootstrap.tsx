import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { CmsClient } from '../api/cmsClient';
import {
  bootstrapResponseSchema,
  type BootstrapData,
} from '../api/schemas/bootstrap';
import { CmsError } from '../api/transport';

export interface BootstrapState {
  data: BootstrapData;
  loading: boolean;
  error?: string;
  accent?: string;
}

const EMPTY: BootstrapData = {
  alerts: [],
  experience: undefined,
  featureFlags: {},
  navigation: undefined,
  operationalControls: undefined,
  promotions: [],
};

const BootstrapContext = createContext<BootstrapState>({
  data: EMPTY,
  loading: true,
});

interface Props extends PropsWithChildren {
  client: CmsClient;
  onReload?: () => void;
}

export function BootstrapProvider({
  client,
  children,
}: Props): React.JSX.Element {
  const [state, setState] = useState<BootstrapState>({
    data: EMPTY,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const load = async () => {
      try {
        const raw = await client.getBootstrap({ signal: controller.signal });
        const parsed = bootstrapResponseSchema.safeParse(raw);
        if (!mounted) {
          return;
        }
        if (parsed.success) {
          const data = parsed.data.data ?? EMPTY;
          setState({
            data,
            loading: false,
            accent: data.experience?.visualDefaults?.accent,
          });
        } else {
          setState({
            data: EMPTY,
            loading: false,
            error: 'Configuración no disponible',
          });
        }
      } catch (error) {
        if (mounted && !controller.signal.aborted) {
          setState({
            data: EMPTY,
            loading: false,
            error:
              error instanceof CmsError
                ? error.message
                : 'Configuración no disponible',
          });
        }
      }
    };

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [client]);

  return (
    <BootstrapContext.Provider value={state}>
      {children}
    </BootstrapContext.Provider>
  );
}

export function useBootstrap(): BootstrapState {
  return useContext(BootstrapContext);
}

export function useFeatureFlag(key: string): boolean {
  const { data } = useBootstrap();
  return data.featureFlags[key] === true;
}
