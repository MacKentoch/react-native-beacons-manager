// flow

import { Platform } from 'react-native';

const RNiBeaconsModule = Platform.select({
  ios: () => require('./lib/next/new.module.ios.js'),
  android: () => require('./lib/next/new.module.android.js'),
})();

export default RNiBeaconsModule;
