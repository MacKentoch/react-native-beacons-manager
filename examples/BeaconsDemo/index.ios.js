/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/

'use strict';

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
const UUID = '7b44b47b-52a1-5381-90c2-f09b6838c5d4';
const IDENTIFIER = '123456';
const TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss';

class BeaconsDemo extends Component {
 constructor(props) {
   super(props);

   this.state = {
     // region information
     uuid: UUID,
     identifier: IDENTIFIER,
     // React Native ListViews datasources initialization
     rangingDataSource:     new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
     regionEnterDatasource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
     regionExitDatasource:  new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),

     // check bluetooth state:
     bluetoothState: '',
   };
 }

 componentWillMount(){
   const { identifier, uuid } = this.state;
   //
   // ONLY non component state aware here in componentWillMount
   //

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
   // Range for beacons inside the region
   Beacons.startMonitoringForRegion(region);
   // Range for beacons inside the region
   Beacons.startRangingBeaconsInRegion(region);
   // update location to ba able to monitor:
   Beacons.startUpdatingLocation();
 }

 componentDidMount() {
   //
   // component state aware here - attach events
   //
   // Ranging: Listen for beacon changes
   DeviceEventEmitter.addListener(
     'beaconsDidRange',
     (data) => {
      //  console.log('beaconsDidRange data: ', data);
       this.setState({ rangingDataSource: this.state.rangingDataSource.cloneWithRows(data.beacons) });
     }
   );

   // monitoring:
    DeviceEventEmitter.addListener(
      'regionDidEnter',
      (data) => {
        console.log('monitoring - regionDidEnter data: ', data);
        const time = moment().format(TIME_FORMAT);
        this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier:data.identifier, uuid:data.uuid, minor:data.minor, major:data.major, time }]) });
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

   // listen bluetooth state change event
   BluetoothState.subscribe(
     bluetoothState => this.setState({ bluetoothState: bluetoothState })
   );

   BluetoothState.initialize();
 }

 componentWillUnMount(){
   // stop monitoring beacons:
   Beacons.stopMonitoringForRegion();
   // stop ranging beacons:
   Beacons.stopRangingBeaconsInRegion();
   // stop updating locationManager:
   Beacons.stopUpdatingLocation();
   // remove monitoring events we registered at componentDidMount
   DeviceEventEmitter.removeListener('regionDidEnter');
   DeviceEventEmitter.removeListener('regionDidExit');
   // remove ranging event we registered at componentDidMount
   DeviceEventEmitter.removeListener('beaconsDidRange');
 }

 render() {
   const { bluetoothState, rangingDataSource, regionEnterDatasource, regionExitDatasource } =  this.state;

   return (
     <View style={styles.container}>
       <Text style={styles.btleConnectionStatus}>
         Bluetooth connection status: { bluetoothState ? bluetoothState  : 'NA' }
       </Text>
       <Text style={styles.headline}>
         ranging beacons in the area:
       </Text>
       <ListView
         dataSource={ rangingDataSource }
         enableEmptySections={ true }
         renderRow={this.renderRangingRow}
       />

      <Text style={styles.headline}>
        monitoring enter information:
      </Text>
      <ListView
        dataSource={ regionEnterDatasource }
        enableEmptySections={ true }
        renderRow={this.renderMonitoringEnterRow}
      />

      <Text style={styles.headline}>
        monitoring exit information:
      </Text>
      <ListView
        dataSource={ regionExitDatasource }
        enableEmptySections={ true }
        renderRow={this.renderMonitoringLeaveRow}
      />
     </View>
   );
 }

 renderRangingRow(rowData) {
   return (
     <View style={styles.row}>
       <Text style={styles.smallText}>
         UUID: {rowData.uuid ? rowData.uuid  : 'NA'}
       </Text>
       <Text style={styles.smallText}>
         Major: {rowData.major ? rowData.major : 'NA'}
       </Text>
       <Text style={styles.smallText}>
         Minor: {rowData.minor ? rowData.minor : 'NA'}
       </Text>
       <Text>
         RSSI: {rowData.rssi ? rowData.rssi : 'NA'}
       </Text>
       <Text>
         Proximity: {rowData.proximity ? rowData.proximity : 'NA'}
       </Text>
       <Text>
         Distance: {rowData.accuracy ? rowData.accuracy.toFixed(2) : 'NA'}m
       </Text>
     </View>
   );
 }

 renderMonitoringEnterRow = ({ identifier, uuid, minor, major, time }) => {
   return (
     <View style={styles.row}>
       <Text style={styles.smallText}>
         Identifier: {identifier ? identifier : 'NA'}
       </Text>
       <Text style={styles.smallText}>
         UUID: {uuid ? uuid  : 'NA'}
       </Text>
       <Text style={styles.smallText}>
         Major: {major ? major : ''}
       </Text>
       <Text style={styles.smallText}>
         Minor: { minor ? minor : ''}
       </Text>
       <Text style={styles.smallText}>
         time: { time ? time : 'NA'}
       </Text>
     </View>
   );
 }

 renderMonitoringLeaveRow = ({ identifier, uuid, minor, major, time }) => {
   return (
     <View style={styles.row}>
       <Text style={styles.smallText}>
         Identifier: {identifier ? identifier : 'NA'}
       </Text>
       <Text style={styles.smallText}>
         UUID: {uuid ? uuid  : 'NA'}
       </Text>
       <Text style={styles.smallText}>
         Major: {major ? major : ''}
       </Text>
       <Text style={styles.smallText}>
         Minor: { minor ? minor : ''}
       </Text>
       <Text style={styles.smallText}>
         time: { time ? time : 'NA'}
       </Text>
     </View>
   );
 }
}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   paddingTop: 60,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: '#F5FCFF',
 },
 btleConnectionStatus: {
   fontSize: 20,
   paddingTop: 20
 },
 headline: {
   fontSize: 20,
   paddingTop: 20
 },
 row: {
   padding: 8,
   paddingBottom: 16
 },
   smallText: {
   fontSize: 11
 }
});

AppRegistry.registerComponent(
  'BeaconsDemo',
  () => BeaconsDemo
);
