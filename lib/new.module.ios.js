// @flow

'use strict';

import { NativeModules } from 'react-native';
const RNiBeacons = NativeModules.RNiBeacon;


/**
 * request always authorization (mandatory when ranging beacons but energy drain)
 *
 */
function requestAlwaysAuthorization(): void {
  RNiBeacons.requestAlwaysAuthorization();
}


export {
  requestAlwaysAuthorization
};


export default RNiBeacons;
