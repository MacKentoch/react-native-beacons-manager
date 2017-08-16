// @flow

import { NativeModules } from 'react-native';

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

const BeaconsManager: BeaconsManagerANDROID = NativeModules.BeaconsManagerModule;


const ARMA_RSSI_FILTER        = BeaconsManager.ARMA_RSSI_FILTER;
const RUNNING_AVG_RSSI_FILTER = BeaconsManager.RUNNING_AVG_RSSI_FILTER;

function setHardwareEqualityEnforced(e: boolean): void {
  BeaconsManager.setHardwareEqualityEnforced(e);
}

/**
 * set beacon layout for iBeacon
 *
 */
function detectIBeacons(): void {
  BeaconsManager.addParser(PARSER_IBEACON);
}

/**
* set beacon layout for alBeacon
*
*/
function detectAltBeacons(): void {
  BeaconsManager.addParser(ALTBEACON);
}

/**
* set beacon layout for estimote
*
*/
function detectEstimotes(): void {
  BeaconsManager.addParser(PARSER_ESTIMOTE);
}

/**
* set beacon layout for eddystone UID
*
*/
function detectEddystoneUID(): void {
  BeaconsManager.addParser(EDDYSTONE_UID);
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
function detectCustomBeaconLayout(parser: number): void {
  BeaconsManager.addParser(parser);
}

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
    BeaconsManager.checkTransmissionSupported(status => resolve(transmissionSupport[status]));
  });
}



/**
 * start monitoring for a region
 *
 * @param {Object: BeaconRegion} region region to monitor (identifier + uuid -> major and minor are optional)
 * @returns {Promise<any>} promise resolves to void or error
 */
function startMonitoringForRegion(region: BeaconRegion): Promise<any> {
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
function stopMonitoringForRegion(region: BeaconRegion): Promise<any> {
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
 * @param {string} regionId specified region to range
 * @param {string} [beaconsUUID] optional UUID
 * @returns {Promise<any>} promise resolves to void or error
 */
function startRangingBeaconsInRegion(regionId: string, beaconsUUID?: string): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      BeaconsManager.startRanging(regionId, beaconsUUID, resolve, reject);
    }
  );
}

/**
 * Stops the range scan for beacons
 *
 * @param {string} regionId specified region to stop scan
 * @param {string} beaconsUUID optional UUID within the specified region
 * @returns {Promise<any>} promise: resolves to void when successful
 */
function stopRangingBeaconsInRegion(regionId: string, beaconsUUID?: string): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      BeaconsManager.stopRanging(regionId, beaconsUUID, resolve, reject);
    }
  );
}

export default {
  setHardwareEqualityEnforced,
  detectIBeacons,
  detectAltBeacons,
  detectEstimotes,
  detectEddystoneUID,
  detectEddystoneTLM,
  detectEddystoneURL,
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

  // common iOS:
  startMonitoringForRegion,
  startRangingBeaconsInRegion,
  stopMonitoringForRegion,
  stopRangingBeaconsInRegion,
};
