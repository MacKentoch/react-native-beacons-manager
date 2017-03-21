# Background mode

## iOS background mode


In the Xcode project:

**Project settings:**
- go to `Capabilities`,
- switch on `Background Modes`
- and check both
  - `Location updates`
  - and `Uses Bluetooth LE accessories`.

![bgmode](./images/bgmode.gif)


**info.plist file:**

You need `Always authorization` (`WhenInUse` is clearly not enough):

- add `Privacy - Location Always Usage Description` key defined (*empty value or not. It is better to define a value to a custom / more user-friendly message*).
![ios: request when in use authorization](./images/plistRequireAlwaysUseAutorization.png)


**In your js code**
Use the method `requestAlwaysAuthorization`.
```javascript
Beacons.requestAlwaysAuthorization();
```

Finally when killed or sleeping and a beacon is found your whole app wont be loaded.

So do the tasks (that does not long last since iOS won't let it run more than few seconds):
```javascript
// monitoring:
 DeviceEventEmitter.addListener(
   'regionDidEnter',
   (data) => {
    // good place for background tasks
     console.log('monitoring - regionDidEnter data: ', data);

     const time = moment().format(TIME_FORMAT);
     this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier:data.identifier, uuid:data.uuid, minor:data.minor, major:data.major, time }]) });
   }
 );

 DeviceEventEmitter.addListener(
   'regionDidExit',
   ({ identifier, uuid, minor, major }) => {
     // good place for background tasks
     console.log('monitoring - regionDidExit data: ', { identifier, uuid, minor, major });

     const time = moment().format(TIME_FORMAT);
    this.setState({ regionExitDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
   }
 );

```


## Android background mode

**TO ADD**
