# Detailed documentation + sample code

For my concern when I started playing with beacon I didn't even have a clue what was a beacon.

This documentation is the one I would have be pleased to have at that time.

This documentation is written to make your life easier to give and to give you answers before you ask yourself the questions.

## iOS

iOS will ask you a bit more attention and configuration.

- [ranging (only)](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/ranging.ios.md)
- [monitoring (only)](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.ios.md)
- [monitoring and ranging at same time](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoringAndRanging.ios.md)

*Don't forget to activate bluetooth on your device.*

## Android

Android asks less configuration.

- [ranging (only)](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/ranging.android.md)
- [monitoring (only)](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoring.android.md)
- [monitoring and ranging at same time](https://github.com/MacKentoch/react-native-beacons-manager/blob/master/examples/samples/monitoringAndRanging.android.md)

*Android `bluetooth service is required` but depending your version it not always enough:*
- android >= 7
  - activate `bluetooth service` on your phone *= OK it works*
- android < 7
  - activate `bluetooth service` on your phone *= not enough alone...*
  - activate `location service`
