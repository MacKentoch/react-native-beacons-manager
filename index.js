// flow weak

import { Platform }     from 'react-native';
import RNiBeaconAndroid from './lib/module.android.js';
import RNiBeaconIOS     from './lib/module.ios.js';

function moduleSelector() {
  if (Platform.OS === 'android') {
      return RNiBeaconAndroid;
  }
  return RNiBeaconIOS;
}

const RNiBeaconsModule = moduleSelector();

export default RNiBeaconsModule;
