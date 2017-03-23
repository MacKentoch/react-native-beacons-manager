# Fully detailed documentation for "monitoring + ranging beacons in Android"

This documentation give a deeper explanation on how to monitor and range (at same time) beacons in Android.

This documentation is linked to the sample code [monitoringAndRaging.android.js](./monitoringAndRaging.android.js)

## 1- start detection for beacon of your choice

Before starting tell the library what kind of beacon you want to manage.

```javascript
// dealing with iBeacons:
Beacons.detectIBeacons();
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoringAndRanging.android.js#L34)

## 2- start monitoring and ranging

Tell Android what you want to monitor and range by defining a desired `region`.


```javascript
// Define a region which can be identifier + uuid,
// identifier + uuid + major or identifier + uuid + major + minor
// (minor and major properties are 'OPTIONAL' numbers)
const region = { identifier, uuid };

// Monitor beacons inside the region
Beacons
  .startMonitoringForRegion(region)
  .then(() => console.log('Beacons monitoring started succesfully'))
  .catch(error => console.log(`Beacons monitoring not started, error: ${error}`));

// Range beacons inside the region
Beacons
  .startRangingBeaconsInRegion(identifier, uuid)
  .then(() => console.log('Beacons ranging started succesfully'))
  .catch(error => console.log(`Beacons ranging not started, error: ${error}`));
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoringAndRanging.android.js#L36)

## 3- register events

Monitoring and ranging now work.

You have now to register events.

```javascript
// Ranging:
DeviceEventEmitter.addListener(
  'beaconsDidRange',
  (data) => {
    console.log('beaconsDidRange data: ', data);
    this.setState({ rangingDataSource: this.state.rangingDataSource.cloneWithRows(data.beacons) });
  }
);

// monitoring:
DeviceEventEmitter.addListener(
  'regionDidEnter',
  ({ identifier, uuid, minor, major }) => {
    console.log('monitoring - regionDidEnter data: ', { identifier, uuid, minor, major });
    const time = moment().format(TIME_FORMAT);
    this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
  }
);

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


[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoringAndRanging.android.js#L54)


## 4- on componentWillUnMount: unregister events and stop monitoring

A good practise is to ALWAYS unregister events in `componentWillUnMount`.

Tell Android to stop monitoring at the same time.

```javascript
const { uuid, identifier } = this.state;
const region = { identifier, uuid };

// stop ranging beacons:
Beacons
.stopRangingBeaconsInRegion(identifier, uuid)
.then(() => console.log('Beacons ranging stopped succesfully'))
.catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));

// stop monitoring beacons:
Beacons
  .stopMonitoringForRegion(region)
  .then(() => console.log('Beacons monitoring stopped succesfully'))
  .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));

// remove ranging event we registered at componentDidMount
DeviceEventEmitter.removeListener('beaconsDidRange');
// remove beacons events we registered at componentDidMount
DeviceEventEmitter.removeListener('regionDidEnter');
DeviceEventEmitter.removeListener('regionDidExit');
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoringAndRanging.android.js#L87)
