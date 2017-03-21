# Fully detailed documentation for "monitoring + ranging beacons in iOS"

This documentation give a deeper explanation on how to monitor and range (at same time) beacons in iOS.

This documentation is linked to the sample code [monitoringAndRanging.ios.js](./monitoringAndRanging.ios.js)

## 1- request authorization

When dealing with Beacons, you technically deal with native location ([see Apple documentation](https://developer.apple.com/reference/corelocation/cllocationmanager)).

Before starting ranging, iOS force you to ask for authorization in case of location services.

If you don't:
- it won't generate an error
- but nothing will happen until you have authorization


> Ranging requires lower level of authorization `WhenInUse` as for monitoring (`Always`). So you don't have the choice you have to request highest level of authorization for both: `Always` authorization wether you need background mode or not.

[See matching lines in sample example]()

### 1 `Beacons.requestAlwaysAuthorization();` (**background and foreground use-case**)

#### in your react native application
Ensure to call

```javascript
Beacons.requestAlwaysAuthorization();
```

[See matching lines in sample example]()

#### in your iOS project

To be effective your `info.plist` file should have `Privacy - Location Always Usage Description` key defined (*empty value or not. It is better to define a value to a custom / more user-friendly message*).

*You have to manually `add it` to your `info.plist`:*

![ios: request when in use authorization](../../images/plistRequireAlwaysUseAutorization.png)

## 2- start monitoring and ranging

> IMPORTANT: ranging and monitoring at same time will work only if you **start monitoring before ranging**.

For both tell iOS what you want to range by defining a desired `region` object.


```javascript
// Define a region which can be identifier + uuid,
// identifier + uuid + major or identifier + uuid + major + minor
// (minor and major properties are numbers)
const region = { identifier, uuid };

// ALWAYS BEFORE RANGING: Monitor for beacons inside the region
Beacons.startMonitoringForRegion(region);
// range beacons
Beacons.startRangingBeaconsInRegion(region);
```

[See matching lines in sample example]()

## 3- get the position of the device

Monitoring needs you to get position of the device.

Just call:
```javascript
Beacons.startUpdatingLocation();
```

[See matching lines in sample example]()

## 4- register events

Monitoring and ranging now work.

You have now to register events.

> Here order between events registrations for ranging and monitoring does not matter.

```javascript
// Ranging: Listen for beacon changes
DeviceEventEmitter.addListener(
  'beaconsDidRange',
  (data) => {
   //  console.log('beaconsDidRange data: ', data);
    this.setState({ rangingDataSource: this.state.rangingDataSource.cloneWithRows(data.beacons) });
  }
);

// Monitoring: Listen for device entering the defined region
DeviceEventEmitter.addListener(
  'regionDidEnter',
  (data) => {
    console.log('monitoring - regionDidEnter data: ', data);
    const time = moment().format(TIME_FORMAT);
    this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier:data.identifier, uuid:data.uuid, minor:data.minor, major:data.major, time }]) });
  }
);

// Monitoring: Listen for device leaving the defined region
DeviceEventEmitter.addListener(
  'regionDidExit',
  ({ identifier, uuid, minor, major }) => {
    console.log('monitoring - regionDidExit data: ', { identifier, uuid, minor, major });
    const time = moment().format(TIME_FORMAT);
   this.setState({ regionExitDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
  }
);
```

**IMPORTANT:**
- **`regionDidExit` will trigger `ONLY after` a timeout of `30 seconds` when having left region (= beacons no more detected)**

- **if you start the monotoring when already in region, `regionDidEnter` will not trigger first time. (leave region and wait at least 30 seconds then enter again the region)**


[See matching lines in sample example]()


## 5- on componentWillUnMount: unregister events and stop monitoring

A good practise is to ALWAYS unregister events in `componentWillUnMount`.

Tell iOS to stop ranging at the same time.

```javascript
// stop monitoring beacons:
Beacons.stopMonitoringForRegion();
// stop ranging beacons:
Beacons.stopRangingBeaconsInRegion();
// stop updating locationManager:
Beacons.stopUpdatingLocation();
// remove all listeners in a row
DeviceEventEmitter.remove();
```

[See matching lines in sample example]()
