# Fully detailed documentation for "monitoring beacons in Android"

This documentation give a deeper explanation on how to monitor (*but monitoring only*) beacons in Android.

This documentation is linked to the sample code [monitoring.android.js](./monitoring.android.js)

## 1- start detection for beacon of your choice

Before starting tell the library what kind of beacon you want to manage.

```javascript
// dealing with iBeacons:
Beacons.detectIBeacons();
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.android.js#L33)

## 2- start monitoring

Tell Android what you want to monitor by defining a desired `region` object.


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
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.android.js#L35)

## 3- register events

Monitoring now works.

You have to register events to know and use about data from enter region and leave region events.

```javascript

// Monitoring: Listen for device entering the defined region
DeviceEventEmitter.addListener(
  'regionDidEnter',
  ({ identifier, uuid, minor, major }) => {
    console.log('monitoring - regionDidEnter data: ', { identifier, uuid, minor, major });
    const time = moment().format(TIME_FORMAT);
    this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
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


[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.android.js#L47)


## 4- on componentWillUnMount: unregister events and stop monitoring

A good practise is to ALWAYS unregister events in `componentWillUnMount`.

Tell Android to stop monitoring at the same time.

```javascript
const { uuid, identifier } = this.state;
const region = { identifier, uuid };

// stop monitoring beacons:
Beacons
  .stopMonitoringForRegion(region)
  .then(() => console.log('Beacons monitoring stopped succesfully'))
  .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));

// remove beacons events we registered at componentDidMount
DeviceEventEmitter.removeListener('regionDidEnter');
DeviceEventEmitter.removeListener('regionDidExit');
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.android.js#L71)
