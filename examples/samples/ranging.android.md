# Fully detailed documentation for "ranging beacons in Android"

This documentation give a deeper explanation on how to monitor (*but ranging only*) beacons in Android.

This documentation is linked to the sample code [ranging.android.js](./ranging.android.js)

## 1- start detection for beacon of your choice

Before starting, tell the library what kind of beacon you want to manage.

```javascript
// dealing with iBeacons:
Beacons.detectIBeacons();
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/ranging.android.js#L27)

## 2- start ranging

Tell Android what you want to range by defining a desired `region` object.


```javascript
// start ranging beacons
Beacons
.startRangingBeaconsInRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
.then(() => console.log('Beacons ranging started succesfully'))
.catch(error => console.log(`Beacons ranging not started, error: ${error}`));
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/ranging.android.js#L29)

## 3- register events

Monitoring now works.

You have to register events to know and use about data from enter region and leave region events.

```javascript

// Ranging: Listen for beacon changes
this.beaconsDidRangeEvent = Beacons.BeaconsEventEmitter.addListener(
  'beaconsDidRange',
  (data) => {
    console.log('beaconsDidRange data: ', data);
    this.setState({ rangingDataSource: this.state.rangingDataSource.cloneWithRows(data.beacons) });
  }
);
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/ranging.android.js#L42)


## 4- on componentWillUnMount: unregister event and stop ranging

A good practise is to ALWAYS unregister events in `componentWillUnMount`.

Tell Android to stop ranging at the same time.

```javascript

// stop ranging beacons:
Beacons
.stopRangingBeaconsInRegion(region) // or like  < v1.0.7: .stopRangingBeaconsInRegion(identifier, uuid)
.then(() => console.log('Beacons ranging stopped succesfully'))
.catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));

// remove ranging event we registered at componentDidMount
this.beaconsDidRangeEvent.remove();
```

[See matching lines in sample example](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/ranging.android.js#L54)
