# Fully detailed documentation for "monitoring beacons in iOS"

This documentation give a deeper explanation on how to monitor (*but monitoring only*) beacons in iOS.

This documentation is linked to the sample code [monitoring.ios.js](./monitoring.ios.js)

## 1- request authorization

When dealing with Beacons, you technically deal with native location ([see Apple documentation](https://developer.apple.com/reference/corelocation/cllocationmanager)).

Before starting ranging, iOS force you to ask for authorization in case of location services.

If you don't:
- it won't generate an error
- but nothing will happen until you have authorization


> For monitoring you don't have the choice you have to request `Always` authorization wether you need background mode or not.

[See matching lines in sample example]()

### 1 `Beacons.requestAlwaysAuthorization();` (**background and foreground use-case**)

#### in your react native application
Ensure to call

```javascript
Beacons.requestAlwaysAuthorization();
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.ios.js#L36)

#### in your iOS project

To be effective your `info.plist` file should have `Privacy - Location Always Usage Description` key defined (*empty value or not. It is better to define a value to a custom / more user-friendly message*).

*You have to manually `add it` to your `info.plist`:*

![ios: request when in use authorization](../../images/plistRequireAlwaysUseAutorization.png)

## 2- start monitoring

Tell iOS what you want to range by defining a desired `region` object.


```javascript
// Define a region which can be identifier + uuid,
// identifier + uuid + major or identifier + uuid + major + minor
// (minor and major properties are numbers)
const region = { identifier, uuid };

// Range for beacons inside the region
Beacons.startMonitoringForRegion(region);
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.ios.js#L43)

## 3- get the position of the device

Monitoring needs you to get position of the device.

Just call:
```javascript
Beacons.startUpdatingLocation();
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.ios.js#L45)

## 4- register events

Monitoring now works.

You have to register events to know and use about data from enter region and leave region events.

```javascript

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


[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.ios.js#L54)


## 5- on componentWillUnMount: unregister events and stop monitoring

A good practise is to ALWAYS unregister events in `componentWillUnMount`.

Tell iOS to stop ranging at the same time.

```javascript
// stop monitoring beacons:
Beacons.stopMonitoringForRegion();
// stop updating locationManager:
Beacons.stopUpdatingLocation();
// remove all listeners in a row
DeviceEventEmitter.remove();
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.ios.js#L75)
