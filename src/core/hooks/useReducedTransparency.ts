import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { isIos } from '../platform';

export function useReducedTransparency(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!isIos) {
      return;
    }
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduced,
    );
    return () => sub.remove();
  }, []);

  return reduced;
}
