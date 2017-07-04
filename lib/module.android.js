// @flow

'use strict';

import { NativeModules } from 'react-native';

const beaconsAndroid: any = NativeModules.BeaconsAndroidModule;

const PARSER_IBEACON: string  = 'm:0-3=4c000215,i:4-19,i:20-21,i:22-23,p:24-24';
const PARSER_ESTIMOTE: string = 'm:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24';
const ALTBEACON: string       = 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25';
const EDDYSTONE_TLM: string   = 'x,s:0-1=feaa,m:2-2=20,d:3-3,d:4-5,d:6-7,d:8-11,d:12-15';
const EDDYSTONE_UID: string   = 's:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19';
const EDDYSTONE_URL: string   = 's:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-20v';

const tramissionSupport: Array<string> = [
  'SUPPORTED',
  'NOT_SUPPORTED_MIN_SDK',
  'NOT_SUPPORTED_BLE',
  'DEPRECATED_NOT_SUPPORTED_MULTIPLE_ADVERTISEMENTS',
  'NOT_SUPPORTED_CANNOT_GET_ADVERTISER',
  'NOT_SUPPORTED_CANNOT_GET_ADVERTISER_MULTIPLE_ADVERTISEMENTS'
];

const RUNNING_AVG_RSSI_FILTER = 0;
const ARMA_RSSI_FILTER = 1;

function setHardwareEqualityEnforced(e: boolean): void {
  beaconsAndroid.setHardwareEqualityEnforced(e);
}

/**
 * set beacon layout for iBeacon
 *
 */
function detectIBeacons(): void {
  beaconsAndroid.addParser(PARSER_IBEACON);
}

/**
* set beacon layout for alBeacon
*
*/
function detectAltBeacons(): void {
  beaconsAndroid.addParser(ALTBEACON);
}

/**
* set beacon layout for estimote
*
*/
function detectEstimotes(): void {
  beaconsAndroid.addParser(PARSER_ESTIMOTE);
}

/**
* set beacon layout for eddystone UID
*
*/
function detectEddystoneUID(): void {
  beaconsAndroid.addParser(EDDYSTONE_UID);
}

/**
* set beacon layout for eddystone URL
*
*/
function detectEddystoneURL(): void {
  beaconsAndroid.addParser(EDDYSTONE_URL);
}

/**
* set beacon layout for eddystone TLM
*
*/
function detectEddystoneTLM(): void {
  beaconsAndroid.addParser(EDDYSTONE_TLM);
}

/**
* set beacon for custom layout
*
*/
function detectCustomBeaconLayout(parser: number): void {
  beaconsAndroid.addParser(parser);
}

function setBackgroundScanPeriod(period: number): void {
  beaconsAndroid.setBackgroundScanPeriod(period);
}

function setBackgroundBetweenScanPeriod(period: number): void {
  beaconsAndroid.setBackgroundBetweenScanPeriod(period);
}

function setForegroundScanPeriod(period: number): void {
  beaconsAndroid.setForegroundScanPeriod(period);
}

function setRssiFilter(filterType: number, avgModifier: number): void {
  beaconsAndroid.setRssiFilter(filterType, avgModifier);
}

function getRangedRegions(): Promise<any> {
  return new Promise((resolve, reject) => {
    beaconsAndroid.getRangedRegions(resolve);
  });
}

type BeaconRegion = {
  identifier: string,
  uuid: string,
  minor?: number,
  major?: number
};


/**
 * get monitored regions
 *
 * @returns {Promise<Array<BeaconRegion>>} promise resolve to an array of monitored regions
 */
function getMonitoredRegions(): Promise<Array<BeaconRegion>> {
  return new Promise((resolve, reject) => {
    beaconsAndroid.getMonitoredRegions(resolve);
  });
}

/**
 * check if beacon support transmission
 *
 * @returns {Promise<number>} promise resolve to an integer
 */
function checkTransmissionSupported(): Promise<number> {
  return new Promise((resolve, reject) => {
    beaconsAndroid.checkTransmissionSupported(status => resolve(tramissionSupport[status]));
  });
}

/**
 * start monitoring for a region
 *
 * @param {Object: BeaconRegion} region region to monitor (identifier + uuid -> major and minor are optional)
 * @returns {Promise<any>}                  promise resolves to void or error
 */
function startMonitoringForRegion(region: BeaconRegion): Promise<any> {
  return new Promise((resolve, reject) => {
    // NOTE: major and minor are optional values: if user don't assign them we have to send a null value (not undefined):
    beaconsAndroid.startMonitoring(
      region.identifier,
      region.uuid,
      region.minor ? region.minor : -1,
      region.major ? region.major : -1,
      resolve,
      reject
    );
  });
}

/**
 * start ranging a region (with optional UUID)
 *
 * @param {string} regionId       specified region to range
 * @param {string} [beaconsUUID]  optional UUID
 * @returns {Promise<any>}        promise resolves to void or error
 */
function startRangingBeaconsInRegion(regionId: string, beaconsUUID?: string): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      beaconsAndroid.startRanging(regionId, beaconsUUID, resolve, reject);
    }
  );
}

/**
 * stops monittorings for a region
 *
 * @param {BeaconRegion} region region (see BeaconRegion type)
 * @returns {Promise<any>}          promise resolves to void or error
 */
function stopMonitoringForRegion(region: BeaconRegion): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      beaconsAndroid.stopMonitoring(
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
 * Stops the range scan for beacons
 *
 * @param {string} regionId       specified region to stop scan
 * @param {string} beaconsUUID    optional UUID within the specified region
 * @returns {Promise<any>}        promise: resolves to void when successful
 */
function stopRangingBeaconsInRegion(regionId: string, beaconsUUID?: string): Promise<any> {
  return new Promise(
    (resolve, reject) => {
      beaconsAndroid.stopRanging(regionId, beaconsUUID, resolve, reject);
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
  getMonitoredRegions,
  startMonitoringForRegion,
  startRangingBeaconsInRegion,
  stopMonitoringForRegion,
  stopRangingBeaconsInRegion,
  ARMA_RSSI_FILTER,
  RUNNING_AVG_RSSI_FILTER
};
