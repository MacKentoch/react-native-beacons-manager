// @flow

const RN = require('react-native');

import type {
  BeaconRegion,
  AuthorizationStatus,
  BeaconManagerIOS,
  EddystoneIOS
}                           from './module.types';

const BeaconsManager: BeaconManagerIOS = RN.NativeModules.RNiBeacon;

function setupEddystoneEIDLayout(): void {
  BeaconsManager.setupEddystoneEIDLayout();
}

function setupEddystoneUIDLayout(): void {
  BeaconsManager.setupEddystoneUIDLayout();
}

function setupEddystoneURLLayout(): void {
  BeaconsManager.setupEddystoneURLLayout();
}

function startScanningEddytone(): void {
  BeaconsManager.startScanningEddytone();
}

function stopScanningEddystone() : void {
  BeaconsManager.stopScanningEddystone();
}

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
 * call is needed for monitoring beacons and gets the initial position of the device.
 *
 */
function startUpdatingLocation(): void {
  BeaconsManager.startUpdatingLocation();
}

/**
 * This method should be called when you don't need to receive location-based information and want to save battery power.
 *
 */
function stopUpdatingLocation(): void {
  BeaconsManager.stopUpdatingLocation();
}

function shouldDropEmptyRanges(drop: boolean): void {
  BeaconsManager.shouldDropEmptyRanges(drop);
}

/**
 * start monitoring for a region
 *
 * @param {BeaconRegion} region region to monitor (identifier + uuid -> major and minor are optional)
 * @returns {Promise<any>} promise resolves to void or error
 */
function startMonitoringForRegion(
  region: BeaconRegion
): Promise<any> {
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
function stopMonitoringForRegion(
  region: BeaconRegion
): Promise<any> {
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
function startRangingBeaconsInRegion(
  region: BeaconRegion
): Promise<any> {
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
function stopRangingBeaconsInRegion(
  region: BeaconRegion
): Promise<any> {
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

module.exports =  {
  // iBeacon APIs
  requestAlwaysAuthorization,
  requestWhenInUseAuthorization,
  getAuthorizationStatus,
  startUpdatingLocation,
  stopUpdatingLocation,
  shouldDropEmptyRanges,

  // common with android:
  startMonitoringForRegion,
  startRangingBeaconsInRegion,
  stopMonitoringForRegion,
  stopRangingBeaconsInRegion,

  // Eddystone APIs
  setupEddystoneEIDLayout,
  setupEddystoneUIDLayout,
  setupEddystoneURLLayout,
  startScanningEddytone,
  stopScanningEddystone
};
