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

Finally when killed or sleeping and a beacon is found your whole app wont be loaded, just the `didFinishLaunchingWithOptions:(NSDictionary *)launchOptions` delegate so you need to act on it there like:
```objective-c
  // a region we were scanning for has appeared, ask to open us
  if([launchOptions objectForKey:@"UIApplicationLaunchOptionsLocationKey"])
  {
    //pop a notification to ask user to open, or maybe reload your scanner with delegate so that code fires
  }
```


## Android background mode

**TO ADD**
