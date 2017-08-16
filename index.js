// flow weak

import { Platform }     from 'react-native';

const RNiBeaconAndroid = require('./lib/module.android.js');
const RNiBeaconIOS     = require('./lib/module.ios.js');

function moduleSelector() {
  if (Platform.OS === 'ios') {
      return RNiBeaconIOS;
  }
  return RNiBeaconAndroid;
}

const RNiBeaconsModule = moduleSelector();

export default RNiBeaconsModule;
