// @flow

export type BeaconRegion = {
  identifier: string,
  uuid: string,
  minor?: number,
  major?: number
};


// iOS only
export type AuthorizationStatus =
| 'authorizedAlways'
| 'authorizedWhenInUse'
| 'denied'
| 'notDetermined'
| 'restricted';

// iOS only
type GetAuthorizationCallback = (status: AuthorizationStatus) => void;


// android only
export const PARSER_IBEACON: string         = 'm:0-3=4c000215,i:4-19,i:20-21,i:22-23,p:24-24';
export const PARSER_ESTIMOTE: string        = 'm:2-3=0215,i:4-19,i:20-21,i:22-23,p:24-24';
export const PARSER_ALTBEACON: string       = 'm:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25';
export const PARSER_EDDYSTONE_TLM: string   = 'x,s:0-1=feaa,m:2-2=20,d:3-3,d:4-5,d:6-7,d:8-11,d:12-15';
export const PARSER_EDDYSTONE_UID: string   = 's:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19';
export const PARSER_EDDYSTONE_URL: string   = 's:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-20v';

// android only
export const transmissionSupport: Array<string> = [
  'SUPPORTED',
  'NOT_SUPPORTED_MIN_SDK',
  'NOT_SUPPORTED_BLE',
  'DEPRECATED_NOT_SUPPORTED_MULTIPLE_ADVERTISEMENTS',
  'NOT_SUPPORTED_CANNOT_GET_ADVERTISER',
  'NOT_SUPPORTED_CANNOT_GET_ADVERTISER_MULTIPLE_ADVERTISEMENTS'
];

export type Parser = string | number;

export type BeaconsManagerIOS = {
  // specific to iOS:
  requestAlwaysAuthorization: () => void,
  requestWhenInUseAuthorization: () => void,
  allowsBackgroundLocationUpdates: (allow: boolean) => void,
  getAuthorizationStatus: (cb: GetAuthorizationCallback) => void,
  startUpdatingLocation: () => void,
  stopUpdatingLocation: () => void,
  shouldDropEmptyRanges: (drop: boolean) => void,

  // common with android:
  startMonitoringForRegion: (region: BeaconRegion) => void,
  startRangingBeaconsInRegion: (region: BeaconRegion) => void,
  stopMonitoringForRegion: (region: BeaconRegion) => void,
  stopRangingBeaconsInRegion: (region: BeaconRegion) => void
};


export type BeaconsManagerANDROID = {
  // specific to android:
  setHardwareEqualityEnforced: (flag: boolean) => void,

  addParser: (parser: Parser, resolve: () => any, reject: () => any) => void,
  addParsersListToDetection: (parsers: Array<Parser>, resolve: () => any, reject: () => any) => void,
  removeParser: (parser: Parser, resolve: () => any, reject: () => any) => void,
  removeParsersListToDetection: (parsers: Array<Parser>, resolve: () => any, reject: () => any) => void,

  detectIBeacons: () => Promise<any>,
  addIBeaconsDetection: () => Promise<any>,
  removeIBeaconsDetection: () => Promise<any>,

  detectAltBeacons: () => Promise<any>,
  addAltBeaconsDetection: () => Promise<any>,
  removeAltBeaconsDetection: () => Promise<any>,

  detectAltBeacons: () => Promise<any>,
  addAltBeaconsDetection: () => Promise<any>,
  removeAltBeaconsDetection: () => Promise<any>,

  detectEstimotes: () => Promise<any>,
  addEstimotesDetection: () => Promise<any>,
  removeEstimotesDetection: () => Promise<any>,

  detectEddystoneUID: () => Promise<any>,
  addEddystoneUIDDetection: () => Promise<any>,
  removeEddystoneUIDDetection: () => Promise<any>,

  detectEddystoneTLM: () => Promise<any>,
  addEddystoneTLMDetection: () => Promise<any>,
  removeEddystoneTLMDetection: () => Promise<any>,

  detectEddystoneURL: () => Promise<any>,
  addEddystoneURLDetection: () => Promise<any>,
  removeEddystoneURLDetection: () => Promise<any>,

  detectCustomBeaconLayout: () => Promise<any>,
  addCustomBeaconLayoutDetection: () => Promise<any>,
  removeCustomBeaconLayoutDetection: () => Promise<any>,

  setBackgroundScanPeriod: (period: number) => void,
  setBackgroundBetweenScanPeriod: (period: number) => void,
  setForegroundScanPeriod: (period: number) => void,
  setRssiFilter: (filterType: number, avgModifier: number) => void,
  getRangedRegions: (value?: any) => void,
  ARMA_RSSI_FILTER: string,
  RUNNING_AVG_RSSI_FILTER: string,
  getMonitoredRegions: (value?: any) => void,
  checkTransmissionSupported: (status: any) => any,

  // common with iOS:
  startMonitoring: (
    regionId: string,
    uuid: string,
    minor?: number,
    major?: number,
    resolve: () => any,
    reject: () => any
  ) => void,

  startRanging: (
    regionId: string,
    uuid?: string,
    resolve: () => any,
    reject: () => any
  ) => void,

  stopMonitoring: (
    regionId: string,
    uuid: string,
    minor?: number,
    major?: number,
    resolve: () => any,
    reject: () => any
  ) => void,

  stopRanging: (
    regionId: string,
    uuid?: string,
    resolve: () => any,
    reject: () => any
  ) => void
};
