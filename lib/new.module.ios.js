// @flow

'use strict';

import { NativeModules } from 'react-native';
const RNiBeacons = NativeModules.RNiBeacon;

/**
 * request always authorization (mandatory when ranging beacons but energy drain)
 * IMPORTANT: To be effective your info.plist file should have 'Privacy - Location Always Usage Description' key defined
 */
function requestAlwaysAuthorization(): void {
  RNiBeacons.requestAlwaysAuthorization();
}

/**
 * request when app in use authorization (bare minimum for beacons)
 * IMPORTANT: To be effective your info.plist file should have 'Privacy - Location When In Use Usage Description' key defined (hopefully 'react-native init' should have set it for you)
 */
function requestWhenInUseAuthorization(): void {
  RNiBeacons.requestWhenInUseAuthorization();
}

type AuthorizationStatus =
  | 'AuthorizedAlways'
  | 'AuthorizedWhenInUse'
  | 'Denied'
  | 'NotDetermined'
  | 'Restricted';

function getAuthorizationStatus(): () => AuthorizationStatus {
  return RNiBeacons.getAuthorizationStatus((status: AuthorizationStatus) => status);
}


export {
  requestAlwaysAuthorization,
  requestWhenInUseAuthorization,
  getAuthorizationStatus
};


export default RNiBeacons;
