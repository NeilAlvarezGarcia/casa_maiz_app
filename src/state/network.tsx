import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
}

const NetworkContext = createContext<NetworkState>({ isConnected: true });

export function NetworkProvider({
  children,
}: PropsWithChildren): JSX.Element {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    NetInfo.fetch().then(state => setIsConnected(Boolean(state.isConnected)));

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(Boolean(state.isConnected));
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkContext.Provider value={{ isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetworkStatus(): NetworkState {
  return useContext(NetworkContext);
}
