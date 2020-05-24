// @flow

// #region imports
const RN = require('react-native');

import {
  type BeaconRegion,
  type BeaconsManagerANDROID,
  type Parser,
} from './module.types';
import {
  PARSER_IBEACON,
  PARSER_ESTIMOTE,
  PARSER_ALTBEACON,
  PARSER_EDDYSTONE_TLM,
  PARSER_EDDYSTONE_UID,
  PARSER_EDDYSTONE_URL,
  transmissionSupport,
} from './module.types';
// #endregion

// #region instanciation and constants
const BeaconsManager: BeaconsManagerANDROID =
  RN.NativeModules.BeaconsAndroidModule;
const BeaconsEventEmitter = RN.DeviceEventEmitter;

const ARMA_RSSI_FILTER = BeaconsManager && BeaconsManager.ARMA_RSSI_FILTER || undefined;
const RUNNING_AVG_RSSI_FILTER = BeaconsManager && BeaconsManager.RUNNING_AVG_RSSI_FILTER || undefined;
// #endregion

function setHardwareEqualityEnforced(flag: boolean): void {
  BeaconsManager.setHardwareEqualityEnforced(flag);
}

// #region iBeacon
/**
 * set beacon layout for iBeacon
 *
 */
function detectIBeacons(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_IBEACON, resolve, reject);
  });
}

/**
 * same as detectIBeacons (intoduced in v1.1.0)
 * adds iBeacon parser to detect them
 *
 */
function addIBeaconsDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_IBEACON, resolve, reject);
  });
}

/**
 * removes iBeacon parser to stop detecting them
 *
 */
function removeIBeaconsDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParser(PARSER_IBEACON, resolve, reject);
  });
}
// #enregion

// #region altBeacon
/**
 * set beacon layout for alBeacon
 *
 */
function detectAltBeacons(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_ALTBEACON, resolve, reject);
  });
}

function addAltBeaconsDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_ALTBEACON, resolve, reject);
  });
}

function removeAltBeaconsDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParser(PARSER_ALTBEACON, resolve, reject);
  });
}
// #endregion

// #region estimote
/**
 * set beacon layout for estimote
 *
 */
function detectEstimotes(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_ESTIMOTE, resolve, reject);
  });
}

function addEstimotesDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_ESTIMOTE, resolve, reject);
  });
}

function removeEstimotesDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParser(PARSER_ESTIMOTE, resolve, reject);
  });
}
// #endregion

// #region eddystone UID
/**
 * set beacon layout for eddystone UID
 *
 */
function detectEddystoneUID(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_EDDYSTONE_UID, resolve, reject);
  });
}

/**
 * same as detectEddystoneUID (intoduced in v1.1.0)
 * adds EddystoneUID parser to detect them
 *
 */
function addEddystoneUIDDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_EDDYSTONE_UID, resolve, reject);
  });
}

/**
 * removes EddystoneUID parser to stop detecting them
 *
 */
function removeEddystoneUIDDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParser(PARSER_EDDYSTONE_UID, resolve, reject);
  });
}
// #endregion

// #region eddystone URL
/**
 * set beacon layout for eddystone URL
 *
 */
function detectEddystoneURL(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_EDDYSTONE_URL, resolve, reject);
  });
}

function addEddystoneURLDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_EDDYSTONE_URL, resolve, reject);
  });
}

function removeEddystoneURLDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParser(PARSER_EDDYSTONE_URL, resolve, reject);
  });
}
// #endregion

// #region eddystone TLM
/**
 * set beacon layout for eddystone TLM
 *
 */
function detectEddystoneTLM(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_EDDYSTONE_TLM, resolve, reject);
  });
}

function addEddystoneTLMDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(PARSER_EDDYSTONE_TLM, resolve, reject);
  });
}

function removeEddystoneTLMDetection(): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParser(PARSER_EDDYSTONE_TLM, resolve, reject);
  });
}
// #endregion

// #region custom beacon (set your parser)
/**
 * set beacon for custom layout
 *
 */
function detectCustomBeaconLayout(parser: number): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(parser, resolve, reject);
  });
}

function addCustomBeaconLayoutDetection(parser: number): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParser(parser, resolve, reject);
  });
}

function removeCustomBeaconLayoutDetection(parser: number): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParser(parser, resolve, reject);
  });
}
// #endregion

// #region add remove multiple parsers in a row
function addParsersListToDetection(parsers: Array<Parser>) {
  return new Promise((resolve, reject) => {
    BeaconsManager.addParsersListToDetection(parsers, resolve, reject);
  });
}

function removeParsersListToDetection(parsers: Array<Parser>) {
  return new Promise((resolve, reject) => {
    BeaconsManager.removeParsersListToDetection(parsers, resolve, reject);
  });
}
// #endregion

function setBackgroundScanPeriod(period: number): void {
  BeaconsManager.setBackgroundScanPeriod(period);
}

function setBackgroundBetweenScanPeriod(period: number): void {
  BeaconsManager.setBackgroundBetweenScanPeriod(period);
}

function setForegroundScanPeriod(period: number): void {
  BeaconsManager.setForegroundScanPeriod(period);
}

function setRssiFilter(filterType: number, avgModifier: number): void {
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
    BeaconsManager.checkTransmissionSupported(status =>
      resolve(transmissionSupport[status]),
    );
  });
}

/**
 * start monitoring for a region
 *
 * @param {Object: BeaconRegion} region region to monitor (identifier + uuid -> major and minor are optional)
 * @returns {Promise<any>} promise resolves to void or error
 */
function startMonitoringForRegion(region: BeaconRegion): Promise<any> {
  return new Promise((resolve, reject) => {
    // NOTE: major and minor are optional values: if user don't assign them we have to send a null value (not undefined):
    BeaconsManager.startMonitoring(
      region.identifier,
      region.uuid,
      region.minor ? region.minor : -1,
      region.major ? region.major : -1,
      resolve,
      reject,
    );
  });
}

/**
 * stops monittorings for a region
 *
 * @param {BeaconRegion} region region (see BeaconRegion type)
 * @returns {Promise<any>} promise resolves to void or error
 */
function stopMonitoringForRegion(region: BeaconRegion): Promise<any> {
  return new Promise((resolve, reject) => {
    BeaconsManager.stopMonitoring(
      region.identifier,
      region.uuid,
      region.minor ? region.minor : -1,
      region.major ? region.major : -1,
      resolve,
      reject,
    );
  });
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
  beaconsUUID?: string,
): Promise<any> {
  if (typeof region === 'object') {
    return new Promise((resolve, reject) => {
      BeaconsManager.startRanging(
        // $FlowIgnore
        region.identifier,
        // $FlowIgnore
        region.uuid,
        resolve,
        reject,
      );
    });
  }
  return new Promise((resolve, reject) => {
    BeaconsManager.startRanging(region, beaconsUUID, resolve, reject);
  });
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
  beaconsUUID?: string,
): Promise<any> {
  if (typeof region === 'object') {
    return new Promise((resolve, reject) => {
      BeaconsManager.stopRanging(
        // $FlowIgnore
        region.identifier,
        // $FlowIgnore
        region.uuid,
        resolve,
        reject,
      );
    });
  }
  return new Promise((resolve, reject) => {
    // $FlowIgnore
    BeaconsManager.stopRanging(region, beaconsUUID, resolve, reject);
  });
}

/**
 * Retrieves the state of a region asynchronously.
 *
 * @param {BeaconRegion} region region (identifier + uuid -> major and minor are optional)
 */
function requestStateForRegion(region: BeaconRegion): void {
  BeaconsManager.requestStateForRegion(
    region.identifier,
    region.uuid,
    region.minor ? region.minor : -1,
    region.major ? region.major : -1,
  );
}

module.exports = {
  // parsers constants
  PARSER_IBEACON,
  PARSER_ESTIMOTE,
  PARSER_ALTBEACON,
  PARSER_EDDYSTONE_TLM,
  PARSER_EDDYSTONE_UID,
  PARSER_EDDYSTONE_URL,

  BeaconsEventEmitter,
  setHardwareEqualityEnforced,
  // iBeacons:
  detectIBeacons,
  addIBeaconsDetection,
  removeIBeaconsDetection,
  // alt beacons:
  detectAltBeacons,
  addAltBeaconsDetection,
  removeAltBeaconsDetection,
  // Estimotes beacon:
  detectEstimotes,
  addEstimotesDetection,
  removeEstimotesDetection,
  // Eddystone UID beacons:
  detectEddystoneUID,
  addEddystoneUIDDetection,
  removeEddystoneUIDDetection,
  // Eddystone TLM beacons:
  detectEddystoneTLM,
  addEddystoneTLMDetection,
  removeEddystoneTLMDetection,
  // Eddystone URL beacons:
  detectEddystoneURL,
  addEddystoneURLDetection,
  removeEddystoneURLDetection,
  // custom layout beacons (NOTE: create 'valid UUID' with websites like, for instance, this one: https://openuuid.net):
  detectCustomBeaconLayout,
  addCustomBeaconLayoutDetection,
  removeCustomBeaconLayoutDetection,

  addParsersListToDetection,
  removeParsersListToDetection,

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
  requestStateForRegion,
};
