// @flow

const RN = require('react-native');

import {
  type BeaconRegion,
  type AuthorizationStatus,
  type BeaconsManagerIOS,
} from './module.types';

const BeaconsManager: BeaconsManagerIOS = RN.NativeModules.RNiBeacon;
const BeaconsEventEmitter = BeaconsManager && new RN.NativeEventEmitter(BeaconsManager) || undefined;

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
 * set background location updates to ensure monitoring when app is killed or in background mode
 *
 * @param {boolean} [allow=false] allow or disallow background modes
 */
function allowsBackgroundLocationUpdates(allow: boolean = false): void {
  BeaconsManager.allowsBackgroundLocationUpdates(allow);
}

/**
 * get authorization status
 *
 * @returns {() => AuthorizationStatus} instant callback (not async)
 */
function getAuthorizationStatus(
  callback: (status: AuthorizationStatus) => any,
): any {
  return BeaconsManager.getAuthorizationStatus(callback);
}

/**
 * get monitored regions
 *
 * @returns {Promise<Array<BeaconRegion>>} promise resolve to an array of monitored regions
 */
function getMonitoredRegions(): Promise<Array<BeaconRegion>> {
  return new Promise((resolve, reject) => {
    BeaconsManager.getMonitoredRegions(resolve);
  });
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
function startMonitoringForRegion(region: BeaconRegion): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      BeaconsManager.startMonitoringForRegion(region);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * stop monitoring for a region
 *
 * @param {BeaconRegion} region region (identifier + uuid -> major and minor are optional)
 * @returns {Promise<any>} promise resolves to void or error
 */
function stopMonitoringForRegion(region: BeaconRegion): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      BeaconsManager.stopMonitoringForRegion(region);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * start ranging for a region
 *
 * @param {BeaconRegion} region region to scan (identifier + uuid -> major and minor are optional)
 * @returns {Promise<any>} promise resolves to void or error
 */
function startRangingBeaconsInRegion(region: BeaconRegion): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      BeaconsManager.startRangingBeaconsInRegion(region);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * stop ranging for a region
 *
 * @param {BeaconRegion} region region (identifier + uuid -> major and minor are optional)
 * @returns {Promise<any>} promise: resolves to void when successful
 */
function stopRangingBeaconsInRegion(region: BeaconRegion): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      BeaconsManager.stopRangingBeaconsInRegion(region);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  BeaconsEventEmitter,

  requestAlwaysAuthorization,
  requestWhenInUseAuthorization,
  allowsBackgroundLocationUpdates,
  getAuthorizationStatus,
  getMonitoredRegions,
  startUpdatingLocation,
  stopUpdatingLocation,
  shouldDropEmptyRanges,

  // common with android:
  startMonitoringForRegion,
  startRangingBeaconsInRegion,
  stopMonitoringForRegion,
  stopRangingBeaconsInRegion,
};
