import { Capacitor } from '@capacitor/core';

export const IS_ANDROID_CAPACITOR =
  typeof Capacitor !== 'undefined' &&
  Capacitor.isNativePlatform &&
  Capacitor.getPlatform() === 'android';
