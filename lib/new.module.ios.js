// @flow

import { NativeModules }    from 'react-native';
import type {
  BeaconRegion,
  AuthorizationStatus,
  BeaconsManagerIOS
}                           from './module.types';


const BeaconsManager: BeaconsManagerIOS = NativeModules.RNiBeacon;

/**
 * request always authorization (mandatory when ranging beacons but energy drain)
 * IMPORTANT: To be effective your info.plist file should have 'Privacy - Location Always Usage Description' key defined
 */
function requestAlwaysAuthorization(): void {
  BeaconsManager.requestAlwaysAuthorization();
}

/**
 * request when app in use authorization (bare minimum for beacons)
 * IMPORTANT: To be effective your info.plist file should have 'Privacy - Location When In Use Usage Description' key defined (hopefully 'react-native init' should have set it for you)
 */
function requestWhenInUseAuthorization(): void {
  BeaconsManager.requestWhenInUseAuthorization();
}

/**
 * get authorization status
 *
 * @returns {() => AuthorizationStatus} instant callback (not async)
 */
function getAuthorizationStatus(
  callback: (status: AuthorizationStatus) => any
): any {
  return BeaconsManager.getAuthorizationStatus(callback);
}



/**
 * start monitoring for a region
 *
 * @param {BeaconRegion} region region to monitor (identifier + uuid -> major and minor are optional)
 * @returns {Promise<any>} promise resolves to void or error
 */
function startMonitoringForRegion(region: BeaconRegion): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      try {
        BeaconsManager.startMonitoringForRegion(region);
        resolve();
      } catch (error) {
        reject(error);
      }
    }
  );
}


/**
* stop monitoring for a region
*
* @param {BeaconRegion} region region (identifier + uuid -> major and minor are optional)
* @returns {Promise<any>} promise resolves to void or error
*/
function stopMonitoringForRegion(region: BeaconRegion): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      try {
        BeaconsManager.stopMonitoringForRegion(region);
        resolve();
      } catch (error) {
        reject(error);
      }
    }
  );
}

/**
* start ranging for a region
*
* @param {BeaconRegion} region region to scan (identifier + uuid -> major and minor are optional)
* @returns {Promise<any>} promise resolves to void or error
*/
function startRangingBeaconsInRegion(region: BeaconRegion): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      try {
          BeaconsManager.startRangingBeaconsInRegion(region);
          resolve();
        } catch (error) {
          reject(error);
        }
    }
  );
}

/**
* stop ranging for a region
*
* @param {BeaconRegion} region region (identifier + uuid -> major and minor are optional)
* @returns {Promise<any>} promise: resolves to void when successful
*/
function stopRangingBeaconsInRegion(region: BeaconRegion): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      try {
        BeaconsManager.stopRangingBeaconsInRegion(region);
        resolve();
      } catch (error) {
        reject(error);
      }
    }
  );
}


export {
  requestAlwaysAuthorization,
  requestWhenInUseAuthorization,
  getAuthorizationStatus,

  // common android:
  startMonitoringForRegion,
  startRangingBeaconsInRegion,
  stopMonitoringForRegion,
  stopRangingBeaconsInRegion
};


export default BeaconsManager;
