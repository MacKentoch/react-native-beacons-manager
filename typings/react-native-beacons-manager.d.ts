declare module 'react-native-beacons-manager' {

  export interface BeaconRegion {
    identifier: string,
    uuid: string,
    minor?: number,
    major?: number
  };


  ///////////////////////////////////////////////////////
  // iOS only
  ///////////////////////////////////////////////////////

  function requestAlwaysAuthorization(): void;

  function requestWhenInUseAuthorization(): void

  function getAuthorizationStatus(
    callback: (status: AuthorizationStatus) => any
  ): any;

  function startUpdatingLocation(): void;

  function stopUpdatingLocation(): void;

  function shouldDropEmptyRanges(
    drop: boolean
  ): void;

  ///////////////////////////////////////////////////////
  // android only
  ///////////////////////////////////////////////////////

  const ARMA_RSSI_FILTER: string;
  const RUNNING_AVG_RSSI_FILTER: string

  function setHardwareEqualityEnforced(
    flag: boolean
  ): void;

  function detectIBeacons(): void;

  function detectAltBeacons(): void;

  function detectEstimotes(): void;

  function detectEddystoneUID(): void;

  function detectEddystoneURL(): void;

  function detectEddystoneTLM(): void;

  function detectCustomBeaconLayout(
    parser: number
  ): void;

  function setBackgroundScanPeriod(
    period: number
  ): void;

  function setBackgroundBetweenScanPeriod(
    period: number
  ): void;

  function setForegroundScanPeriod(
    period: number
  ): void;

  function setRssiFilter(
    filterType: number,
    avgModifier: number
  ): void;

  function getRangedRegions(): Promise<any>;

  function getMonitoredRegions(): Promise<Array<BeaconRegion>>;

  function checkTransmissionSupported(): Promise<number>;

  ///////////////////////////////////////////////////////
  // common iOS and Android
  ///////////////////////////////////////////////////////

  function startMonitoringForRegion(
    region: BeaconRegion
  ): Promise<any>;

  function startRangingBeaconsInRegion(
    region: BeaconRegion
  ): Promise<any>;

  function stopMonitoringForRegion(
    region: BeaconRegion
  ): Promise<any>;

  function stopRangingBeaconsInRegion(
    region: BeaconRegion
  ): Promise<any>;
}
