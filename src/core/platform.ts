import { Platform } from 'react-native';

export const isIos = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export type MobileOS = 'ios' | 'android';

export const platform: MobileOS = isIos ? 'ios' : 'android';
