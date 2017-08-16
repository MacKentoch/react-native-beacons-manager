// flow weak

import { Platform }     from 'react-native';

const RNiBeaconsModule = Platform.select({
  ios:      () => require('./lib/module.ios.js'),
  android:  () => require('./lib/module.android.js')
})();

export default RNiBeaconsModule;
