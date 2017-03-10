'use strict';

import { NativeModules } from 'react-native';

const beaconsAndroid = NativeModules.BeaconsAndroidModule;

const PARSER_IBEACON  = 'm:0-3=4c000215,i:4-19,i:20-21,i:22-23,p:24-24';
const PARSER_ESTIMOTE = 'm:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24';
const ALTBEACON       = 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25';
const EDDYSTONE_TLM   = 'x,s:0-1=feaa,m:2-2=20,d:3-3,d:4-5,d:6-7,d:8-11,d:12-15';
const EDDYSTONE_UID   = 's:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19';
const EDDYSTONE_URL   = 's:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-20v';


const tramissionSupport = {
  0: 'SUPPORTED',
  1: 'NOT_SUPPORTED_MIN_SDK',
  2: 'NOT_SUPPORTED_BLE',
  3: 'DEPRECATED_NOT_SUPPORTED_MULTIPLE_ADVERTISEMENTS',
  4: 'NOT_SUPPORTED_CANNOT_GET_ADVERTISER',
  5: 'NOT_SUPPORTED_CANNOT_GET_ADVERTISER_MULTIPLE_ADVERTISEMENTS'
};

const setHardwareEqualityEnforced = (e) => {
  beaconsAndroid.setHardwareEqualityEnforced(e);
};

const detectIBeacons = () => {
  beaconsAndroid.addParser(PARSER_IBEACON);
};

const detectAltBeacons = () => {
  beaconsAndroid.addParser(ALTBEACON);
};

const detectEstimotes = () => {
  beaconsAndroid.addParser(PARSER_ESTIMOTE);
};

const detectEddystoneUID = () => {
  beaconsAndroid.addParser(EDDYSTONE_UID);
};

const detectEddystoneURL = () => {
  beaconsAndroid.addParser(EDDYSTONE_URL);
};

const detectEddystoneTLM = () => {
  beaconsAndroid.addParser(EDDYSTONE_TLM);
};

const detectCustomBeaconLayout = (parser) => {
  beaconsAndroid.addParser(parser);
};

const setBackgroundScanPeriod = (period) => {
  beaconsAndroid.setBackgroundScanPeriod(period);
};

const setBackgroundBetweenScanPeriod = (period) => {
  beaconsAndroid.setBackgroundBetweenScanPeriod(period);
};

const setForegroundScanPeriod = (period) => {
  beaconsAndroid.setForegroundScanPeriod(period);
};

const getRangedRegions = () => new Promise((resolve, reject) => {
  beaconsAndroid.getRangedRegions(resolve);
});

const getMonitoredRegions = () => new Promise((resolve, reject) => {
  beaconsAndroid.getMonitoredRegions(resolve);
});

const checkTransmissionSupported = () => new Promise((resolve, reject) => {
  beaconsAndroid.checkTransmissionSupported(status => resolve(tramissionSupport[status]));
});

const startMonitoringForRegion = (region) => new Promise((resolve, reject) => {
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

const startRangingBeaconsInRegion = (regionId, beaconsUUID) => new Promise((resolve, reject) => {
  beaconsAndroid.startRanging(regionId, beaconsUUID, resolve, reject);
});

const stopMonitoringForRegion = (region) => new Promise((resolve, reject) => {
  beaconsAndroid.stopMonitoring(
    region.identifier,
    region.uuid,
    region.minor ? region.minor : -1,
    region.major ? region.major : -1,
    resolve,
    reject
  );
});

const stopRangingBeaconsInRegion = (regionId, beaconsUUID) => new Promise((resolve, reject) => {
  beaconsAndroid.stopRanging(regionId, beaconsUUID, resolve, reject);
});

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
  checkTransmissionSupported,
  getRangedRegions,
  getMonitoredRegions,
  startMonitoringForRegion,
  startRangingBeaconsInRegion,
  stopMonitoringForRegion,
  stopRangingBeaconsInRegion
};
