
## 1.1.0 (COMING SOON)
- iOS: add `allowsBackgroundLocationUpdates(allow: boolean)` to ensure monitoring even if app is killed or in background
- PR #45 thank you to @stoneman1
- PR #54 thank you to @rostislav-simonik
- PR #46 thank you to @ashemah
- PR #58 thank you to @eurobob
- pR #114 thank you to @yohang
  - **BEWARE**: *breaking change* = drop of  `DeviceEventEmitter` in favor of `Beacons.BeaconsEventEmitter` (see [BeaconsDemo example project](./examples/BeaconsDemo))
  ```javascript
    // before 1.1.0 (or until 1.0.7):
    DeviceEventEmitter.addListener()
    // simply becomes (for both iOS and Android)
    Beacons.BeaconsEventEmitter.addListener()
    ```

 - update iOS and Android BeaconsDemo example project
 - update samples (*TODO*)

## 1.0.8 (CANCELED TO BE v1.1.0, all features included in upper v1.1.0)
- ~~PR #45 thank you to @stoneman1~~
- ~~PR #54 thank you to @rostislav-simonik~~
- ~~PR #46 thank you to @ashemah~~
- ~~PR #58 thank you to @eurobob~~
  - ~~**BEWARE**: *breaking change* = drop of  `DeviceEventEmitter` in favor of `Beacons.BeaconsEventEmitter` (see [BeaconsDemo example project](./examples/BeaconsDemo))~~
  ```javascript
    // before 1.0.8 (or until 1.0.7):
    DeviceEventEmitter.addListener()
    // simply becomes (for both iOS and Android)
    Beacons.BeaconsEventEmitter.addListener()
    ```

 - ~~update iOS and Android BeaconsDemo example project~~
 - ~~update samples (*TODO*)~~


## 1.0.7 (RELEASE)

- improve typescript types
- remove previous non flow typed libs versions (*these before 1.0.7*)

## 1.0.7 (RELEASE)

- iOS: `startRangingBeaconsInRegion` and `startMonitoringForRegion` return promises like android

- android: `startRangingBeaconsInRegion` and `startMonitoringForRegion` accept an object like iOS and other methods. *NOTE: it won't prevent from accepting current parameters: `regionId: string` and `beaconUUID: string`: not to break existing.*

- add typescript types

- fix #40

## 1.0.6 (RELEASE)
- fix #38

## 1.0.5 (RELEASE)
 - improved documentation
   - when you want to understand or something's wrong please have a look at [this detailed documentation + code sample](https://github.com/MacKentoch/react-native-beacons-manager/tree/master/examples/samples)
 - fix `React Native 0.47` android breaking change: `Remove unused createJSModules`

## 1.0.4 (RELEASE)
 - same as v1.0.3 (npm publish nightmare...)

## 1.0.3 (RELEASED)
  - add iOS event `authorizationStatusDidChange` to documentation (=events table in README)
  - add new layouts:
    - altBeacon
    - eddystone (uid, tlm, url)
  - PR [#13](https://github.com/MacKentoch/react-native-beacons-manager/pull/13)
  - fixes
    - iOS monitoring

## 1.0.2 (RELEASED)
  - fix android monitoring issues when minor and/or minor where null
  - add monitoring in example

## 1.0.1 (RELEASED)
  - README and config fixes

## 1.0.0 (RELEASED)
  - Initial release
