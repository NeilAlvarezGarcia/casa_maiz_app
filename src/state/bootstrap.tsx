import {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';
import { useMountedEffect } from '../core/hooks/useMountedEffect';
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
}: Props): JSX.Element {
  const { state } = useMountedEffect<BootstrapState>(
    async ({ signal, setState }) => {
      try {
        const raw = await client.getBootstrap({ signal });
        const parsed = bootstrapResponseSchema.safeParse(raw);
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
        if (!signal.aborted) {
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
    },
    [client],
    { data: EMPTY, loading: true },
  );

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
  return Boolean(data.featureFlags[key]);
}
