// @flow

const RN = require('react-native');

import type {
  BeaconRegion,
  BeaconsManagerANDROID
}                           from './module.types';
import {
  PARSER_IBEACON,
  PARSER_ESTIMOTE,
  ALTBEACON,
  EDDYSTONE_TLM,
  EDDYSTONE_UID,
  EDDYSTONE_URL,
  transmissionSupport
}                           from './module.types';

const BeaconsManager: BeaconsManagerANDROID = RN.NativeModules.BeaconsAndroidModule;
const BeaconsEventEmitter = RN.DeviceEventEmitter;

const ARMA_RSSI_FILTER        = BeaconsManager.ARMA_RSSI_FILTER;
const RUNNING_AVG_RSSI_FILTER = BeaconsManager.RUNNING_AVG_RSSI_FILTER;

function setHardwareEqualityEnforced(
  flag: boolean
): void {
  BeaconsManager.setHardwareEqualityEnforced(flag);
}

/**
 * set beacon layout for iBeacon
 *
 */
function detectIBeacons(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_IBEACON, resolve);
  });
}

/**
 * same as detectIBeacons (intoduced in v1.1.0)
 * adds iBeacon parser to detect them
 *
 */
function addIBeaconsDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_IBEACON, resolve);
  });
}

/**
 * removes iBeacon parser to stop detecting them
 *
 */
function removeIBeaconsDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParser(PARSER_IBEACON, resolve);
  });
}

/**
* set beacon layout for alBeacon
*
*/
function detectAltBeacons(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(ALTBEACON, resolve);
  });
}

/**
* set beacon layout for estimote
*
*/
function detectEstimotes(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_ESTIMOTE);
  });
}

/**
* set beacon layout for eddystone UID
*
*/
function detectEddystoneUID(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(EDDYSTONE_UID);
  });
}

/**
 * same as detectEddystoneUID (intoduced in v1.1.0)
 * adds EddystoneUID parser to detect them
 *
 */
function addEddystoneUIDDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(EDDYSTONE_UID);
  });
}

/**
 * removes EddystoneUID parser to stop detecting them
 *
 */
function removeEddystoneUIDDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParser(PARSER_IBEACON);
  });
}

/**
* set beacon layout for eddystone URL
*
*/
function detectEddystoneURL(): void {
  BeaconsManager.addParser(EDDYSTONE_URL);
}

/**
* set beacon layout for eddystone TLM
*
*/
function detectEddystoneTLM(): void {
  BeaconsManager.addParser(EDDYSTONE_TLM);
}

/**
* set beacon for custom layout
*
*/
function detectCustomBeaconLayout(
  parser: number
): void {
  BeaconsManager.addParser(parser);
}

function setBackgroundScanPeriod(
  period: number
): void {
  BeaconsManager.setBackgroundScanPeriod(period);
}

function setBackgroundBetweenScanPeriod(
  period: number
): void {
  BeaconsManager.setBackgroundBetweenScanPeriod(period);
}

function setForegroundScanPeriod(
  period: number
): void {
  BeaconsManager.setForegroundScanPeriod(period);
}

function setRssiFilter(
  filterType: number,
  avgModifier: number
): void {
  BeaconsManager.setRssiFilter(filterType, avgModifier);
}

function getRangedRegions(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.getRangedRegions(resolve);
  });
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
 * check if beacon support transmission
 *
 * @returns {Promise<number>} promise resolve to an integer
 */
function checkTransmissionSupported(): Promise<number> {
  return new Promise((resolve, reject) => {
    BeaconsManager.checkTransmissionSupported(status => resolve(transmissionSupport[status]));
  });
}



/**
 * start monitoring for a region
 *
 * @param {Object: BeaconRegion} region region to monitor (identifier + uuid -> major and minor are optional)
 * @returns {Promise<any>} promise resolves to void or error
 */
function startMonitoringForRegion(
  region: BeaconRegion
): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      // NOTE: major and minor are optional values: if user don't assign them we have to send a null value (not undefined):
      BeaconsManager.startMonitoring(
        region.identifier,
        region.uuid,
        region.minor ? region.minor : -1,
        region.major ? region.major : -1,
        resolve,
        reject
      );
    }
  );
}

/**
 * stops monittorings for a region
 *
 * @param {BeaconRegion} region region (see BeaconRegion type)
 * @returns {Promise<any>} promise resolves to void or error
 */
function stopMonitoringForRegion(
  region: BeaconRegion
): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      BeaconsManager.stopMonitoring(
        region.identifier,
        region.uuid,
        region.minor ? region.minor : -1,
        region.major ? region.major : -1,
        resolve,
        reject
      );
    }
  );
}

/**
 * start ranging a region (with optional UUID)
 *
 * @param {String | BeaconRegion} regionId if string or region: BeaconRegion object
 * @param {String} [beaconsUUID] optional UUID
 * @returns {Promise<any>} promise resolves to void or error
 */
function startRangingBeaconsInRegion(
  region: BeaconRegion | string,
  beaconsUUID?: string
): Promise<any> {
  if (typeof region === 'object') {
    return new Promise(
      (resolve, reject) => {
        BeaconsManager.startRanging(region.identifier, region.uuid, resolve, reject);
      }
    );
  }
  return new Promise(
    (resolve, reject) => {
      BeaconsManager.startRanging(region, beaconsUUID, resolve, reject);
    }
  );
}

/**
 * Stops the range scan for beacons
 *
 * @param {String | BeaconRegion} regionId if string or region: BeaconRegion object
 * @param {string} beaconsUUID optional UUID within the specified region
 * @returns {Promise<any>} promise: resolves to void when successful
 */
function stopRangingBeaconsInRegion(
  region: BeaconRegion | string,
  beaconsUUID?: string
): Promise<any> {
  if (typeof region === 'object') {
    return new Promise(
      (resolve, reject) => {
        BeaconsManager.stopRanging(region.identifier, region.uuid, resolve, reject);
      }
    );
  }
  return new Promise(
    (resolve, reject) => {
      BeaconsManager.stopRanging(region, beaconsUUID, resolve, reject);
    }
  );
}

module.exports = {
  BeaconsEventEmitter,
  setHardwareEqualityEnforced,
  // iBeacons:
  detectIBeacons,
  addIBeaconsDetection,
  removeIBeaconsDetection,
  // alt beacons:
  detectAltBeacons,
  // Estimotes beacon:
  detectEstimotes,
  // Eddystone beacons:
  detectEddystoneUID,
  addEddystoneUIDDetection,
  removeEddystoneUIDDetection,

  detectEddystoneTLM,
  detectEddystoneURL,
  // custom layout beacons (NOTE: create 'valid UUID' with websites like, for instance, this one: https://openuuid.net):
  detectCustomBeaconLayout,

  setBackgroundScanPeriod,
  setBackgroundBetweenScanPeriod,
  setForegroundScanPeriod,
  setRssiFilter,
  checkTransmissionSupported,
  getRangedRegions,
  ARMA_RSSI_FILTER,
  RUNNING_AVG_RSSI_FILTER,

  getMonitoredRegions,

  // common with iOS:
  startMonitoringForRegion,
  startRangingBeaconsInRegion,
  stopMonitoringForRegion,
  stopRangingBeaconsInRegion,
};
