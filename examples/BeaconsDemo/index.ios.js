/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow weak
*/

import React, {
 Component
}                             from 'react';
import {
 AppRegistry,
 StyleSheet,
 View,
 Text,
 ListView,
 DeviceEventEmitter
}                             from 'react-native';
import Beacons                from 'react-native-beacons-manager';
import BluetoothState         from 'react-native-bluetooth-state';
import moment                 from 'moment';

/**
* uuid of YOUR BEACON (change to yours)
* @type {String} uuid
*/
const UUID        = '7b44b47b-52a1-5381-90c2-f09b6838c5d4';
const IDENTIFIER  = '123456';
const TIME_FORMAT = 'HH:mm:ss';
const EMPTY_BEACONS_LISTS = {
  rangingList:      [],
  monitorEnterList: [],
  monitorExitList:  []
};

const deepCopyBeaconsLists = beaconsLists => {
  const initial = {};
  return Object
          .keys(beaconsLists)
          .map(key => ({ [key]: [...beaconsLists[key]] }))
          .reduce(
            (prev, next) => {
              return {...prev, ...next};
            }
            , initial
          );
};

class BeaconsDemo extends Component {
  _beaconsLists = null;

  state = {
    // region information
    uuid:       UUID,
    identifier: IDENTIFIER,

    // check bluetooth state:
    bluetoothState: '',

    message: '',

    beaconsLists: new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2
    }).cloneWithRowsAndSections(EMPTY_BEACONS_LISTS)
  };

  componentWillMount(){
    this._beaconsLists = EMPTY_BEACONS_LISTS;
    const { identifier, uuid } = this.state;
    // OPTIONAL: listen to authorization change
    DeviceEventEmitter.addListener(
      'authorizationStatusDidChange',
      (info) => console.log('authorizationStatusDidChange: ', info)
    );
    // MANDATORY: you have to request ALWAYS Authorization (not only when in use) when monitoring
    // you also have to add "Privacy - Location Always Usage Description" in your "Info.plist" file
    // otherwise monitoring won't work
    Beacons.requestAlwaysAuthorization();
    // Define a region which can be identifier + uuid,
    // identifier + uuid + major or identifier + uuid + major + minor
    // (minor and major properties are numbers)
    const region = { identifier, uuid };
    // Monitor for beacons inside the region
    Beacons
    .startMonitoringForRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
    .then(() => console.log('Beacons monitoring started succesfully'))
    .catch(error => console.log(`Beacons monitoring not started, error: ${error}`));

    // Range for beacons inside the region
    Beacons
    .startRangingBeaconsInRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
    .then(() => console.log('Beacons ranging started succesfully'))
    .catch(error => console.log(`Beacons ranging not started, error: ${error}`));

    // update location to be able to monitor:
    Beacons.startUpdatingLocation();
  }

  componentDidMount() {
    DeviceEventEmitter.addListener(
      'beaconsDidRange',
      (data) => {
        this.setState({ message:  'beaconsDidRange event'});
        // console.log('beaconsDidRange, data: ', data);
        const updatedBeaconsLists = this.updateBeaconList(data.beacons, 'rangingList');
        this._beaconsLists = updatedBeaconsLists;
        this.setState({ beaconsLists: this.state.beaconsLists.cloneWithRowsAndSections(this._beaconsLists)});
      }
    );

    // monitoring events
    DeviceEventEmitter.addListener(
      'regionDidEnter',
      ({uuid, identifier}) => {
        this.setState({ message:  'regionDidEnter event'});
        console.log('regionDidEnter, data: ', {uuid, identifier});
        const time = moment().format(TIME_FORMAT);
        const updatedBeaconsLists = this.updateBeaconList({uuid, identifier, time}, 'monitorEnterList');
        this._beaconsLists = updatedBeaconsLists;
        this.setState({ beaconsLists: this.state.beaconsLists.cloneWithRowsAndSections(this._beaconsLists)});
      }
    );
    DeviceEventEmitter.addListener(
      'regionDidExit',
      ({ identifier, uuid, minor, major }) => {
        this.setState({ message:  'regionDidExit event'});
        console.log('regionDidExit, data: ', {identifier, uuid, minor, major});
        const time = moment().format(TIME_FORMAT);
        const updatedBeaconsLists = this.updateBeaconList({ identifier, uuid, minor, major, time }, 'monitorExitList');
        this._beaconsLists = updatedBeaconsLists;
        this.setState({ beaconsLists: this.state.beaconsLists.cloneWithRowsAndSections(this._beaconsLists)});
      }
    );
    // listen bluetooth state change event
    BluetoothState.subscribe(
      bluetoothState => this.setState({ bluetoothState: bluetoothState })
    );
    BluetoothState.initialize();
  }

  componentWillUnMount() {
    const { uuid, identifier } = this.state;

    const region = { identifier, uuid }; // minor and major are null here

    // stop monitoring beacons:
    Beacons
    .stopMonitoringForRegion(region)
    .then(() => console.log('Beacons monitoring stopped succesfully'))
    .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));

    // stop ranging beacons:
    Beacons
    .stopRangingBeaconsInRegion(region)
    .then(() => console.log('Beacons ranging stopped succesfully'))
    .catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));

    // stop updating locationManager:
    Beacons.stopUpdatingLocation();
    // remove monitoring events we registered at componentDidMount
    DeviceEventEmitter.removeListener('regionDidEnter');
    DeviceEventEmitter.removeListener('regionDidExit');
    // remove ranging event we registered at componentDidMount
    DeviceEventEmitter.removeListener('beaconsDidRange');
  }

  render() {
    const {
      bluetoothState,
      beaconsLists,
      message
    } = this.state;

    return (
      <View style={styles.container}>
        <Text style={styles.btleConnectionStatus}>
          Bluetooth connection status: { bluetoothState ? bluetoothState  : 'NA' }
        </Text>

        <Text>
          { message }
        </Text>

        <View style={styles.justFlex}>
          <ListView
            dataSource={ beaconsLists }
            enableEmptySections={ true }
            renderRow={this.renderBeaconRow}
            renderSectionHeader={this.renderBeaconSectionHeader}
          />
        </View>

       </View>
    );
  }

  renderBeaconRow = (rowData) => (
    <View style={styles.row}>
      <Text style={styles.smallText}>
        Identifier: {rowData.identifier ? rowData.identifier : 'NA'}
      </Text>
      <Text style={styles.smallText}>
        UUID: {rowData.uuid ? rowData.uuid  : 'NA'}
      </Text>
      <Text style={styles.smallText}>
        Major: {rowData.major ? rowData.major : 'NA'}
      </Text>
      <Text style={styles.smallText}>
        Minor: {rowData.minor ? rowData.minor : 'NA'}
      </Text>
      <Text style={styles.smallText}>
        time: { rowData.time ? rowData.time : 'NA'}
      </Text>
      <Text style={styles.smallText}>
        RSSI: {rowData.rssi ? rowData.rssi : 'NA'}
      </Text>
      <Text style={styles.smallText}>
        Proximity: {rowData.proximity ? rowData.proximity : 'NA'}
      </Text>
      <Text style={styles.smallText}>
        Distance: {rowData.accuracy ? rowData.accuracy.toFixed(2) : 'NA'}m
      </Text>
    </View>
  )

  renderBeaconSectionHeader = (sectionData, header) => (
    <Text style={styles.rowSection}>
       {header}
     </Text>
   );

  updateBeaconList = (detectedBeacons = [], listName = '') => {
    // just a deep copy of "this._beaconsLists":
    const previousLists   = deepCopyBeaconsLists(this._beaconsLists);
    const listNameIsValid = Object.keys(EMPTY_BEACONS_LISTS).some(header => header === listName);
    const updateMatchingList = beacon => {
      if (beacon.uuid.length > 0) {
        const uuid  = beacon.uuid.toUpperCase();
        const major = parseInt(beacon.major, 10) ? beacon.major : 0;
        const minor = parseInt(beacon.minor, 10) ? beacon.minor : 0;

        const hasEqualProp = (left, right) => (String(left).toUpperCase() === String(right).toUpperCase());
        const isNotTheSameBeacon = beaconDetail => {
          return !hasEqualProp(beaconDetail.uuid, uuid)
              || !hasEqualProp(beaconDetail.major, major)
              || !hasEqualProp(beaconDetail.minor, minor);
        };

        const otherBeaconsInSameList = previousLists[listName].filter(isNotTheSameBeacon);
        previousLists[listName] = [...otherBeaconsInSameList, beacon];
      }
    };

    if (!listNameIsValid) {
      return previousLists;
    }

    if (!Array.isArray(detectedBeacons)) {
      if (detectedBeacons instanceof Object) {
        updateMatchingList(detectedBeacons);
        return previousLists;
      } else {
        return previousLists;
      }
    }

    detectedBeacons.forEach(updateMatchingList);
    return previousLists;
  }
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   paddingTop: 60,
   margin: 5,
   backgroundColor: '#F5FCFF',
 },
 justFlex: {
   flex: 1
 },
 contentContainer: {
   flex: 1,
   justifyContent: 'center',
   alignItems: 'center',
 },
 btleConnectionStatus: {
   fontSize: 20,
   paddingTop: 20
 },
 headline: {
   fontSize: 20,
   paddingTop: 20,
   marginBottom: 20
 },
 row: {
   padding: 8,
   paddingBottom: 16
 },
   smallText: {
   fontSize: 11
 },
 rowSection: {
   fontWeight: '700'
 }
});

AppRegistry.registerComponent(
  'BeaconsDemo',
  () => BeaconsDemo
);
