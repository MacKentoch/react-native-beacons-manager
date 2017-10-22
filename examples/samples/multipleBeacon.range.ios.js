/**
* Sample React Native App
* https://github.com/facebook/react-native
* @flow
*/
/* eslint-disable */


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

/**
* uuid of YOUR BEACON (change to yours)
* @type {String} uuid
*/
const UUID = '7b44b47b-52a1-5381-90c2-f09b6838c5d4';
const IDENTIFIER = '123456';

const OTHER_UUID = '8fe6cb7e-62cf-4dcf-87b9-cf9fd0e2b43a';
const OTHER_IDENTIFIER = '654321';

class BeaconsDemo extends Component {
  // will be set as a reference to "beaconsDidRange" event:
  beaconsDidRangeEvent = null;

  state = {
   // region information
   uuid: UUID,
   identifier: IDENTIFIER,

   otherUUID: OTHER_UUID,
   otherIdentifier: OTHER_IDENTIFIER,

   // list of desired UUID to range (Note: these will be section headers in the listview rendered):
   rangedBeaconsUUIDMap: {
     [UUID.toUpperCase()]: [],
     [OTHER_UUID.toUpperCase()]: []
   },
   // React Native ListViews datasources initialization
   rangingDataSource: new ListView.DataSource({
     rowHasChanged: (r1, r2) => r1 !== r2,
     sectionHeaderHasChanged: (s1, s2) => s1 !== s2
   }).cloneWithRows([]),

   // check bluetooth state:
   bluetoothState: '',
  };

   componentWillMount(){
     const { identifier, uuid } = this.state;
     const { otherIdentifier, otherUUID } = this.state;

     Beacons.requestAlwaysAuthorization();

     const region = { identifier, uuid };
     const anotherRegion = { identifier: otherIdentifier, uuid: otherUUID };

     // Range for beacons inside the region
     Beacons
     .startRangingBeaconsInRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
     .then(() => console.log('Beacons ranging started succesfully'))
     .catch(error => console.log(`Beacons ranging not started, error: ${error}`));
     // Range for beacons inside the other region
     Beacons
     .startRangingBeaconsInRegion(anotherRegion) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
     .then(() => console.log('Beacons ranging started succesfully'))
     .catch(error => console.log(`Beacons ranging not started, error: ${error}`));

     // update location to ba able to monitor:
     Beacons.startUpdatingLocation();
   }

   componentDidMount() {
     //
     // component state aware here - attach events
     //

     // Ranging: Listen for beacon changes
     this.beaconsDidRangeEvent = Beacons.BeaconsEventEmitter.addListener(
       'beaconsDidRange',
       (data) => {
         console.log('beaconsDidRange data: ', data);
         const { beacons } = data;
         const { rangingDataSource } = this.state;
         this.setState({
           rangingDataSource: rangingDataSource.cloneWithRowsAndSections(this.convertRangingArrayToMap(beacons))
         });
       }
     );

     // listen bluetooth state change event
     BluetoothState.subscribe(
       bluetoothState => this.setState({ bluetoothState: bluetoothState })
     );

     BluetoothState.initialize();
   }

   componentWillUnMount(){
     const { identifier, uuid } = this.state;
     const { otherIdentifier, otherUUID } = this.state;

     const region = { identifier, uuid };
     const regionAlternate = { identifier: otherIdentifier, uuid: otherUUID };

     // stop ranging beacons:
     Beacons
     .stopRangingBeaconsInRegion(region)
     .then(() => console.log('Beacons ranging stopped succesfully'))
     .catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));

     Beacons
     .stopRangingBeaconsInRegion(regionAlternate)
     .then(() => console.log('Beacons ranging stopped succesfully'))
     .catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));

     // remove ranging event we registered at componentDidMount
     this.beaconsDidRangeEvent.remove();
   }

   render() {
     const { bluetoothState, rangingDataSource } =  this.state;

     return (
       <View style={styles.container}>
         <Text style={styles.btleConnectionStatus}>
           Bluetooth connection status: { bluetoothState ? bluetoothState  : 'NA' }
         </Text>
         <Text style={styles.headline}>
           ranging beacons:
         </Text>
         <ListView
           dataSource={ rangingDataSource }
           enableEmptySections={ true }
           renderRow={this.renderRangingRow}
           renderSectionHeader={this.renderRangingSectionHeader}
         />
       </View>
     );
   }

   renderRangingSectionHeader = (sectionData, uuid) => (
     <Text style={styles.rowSection}>
        {uuid}
      </Text>
    );

   renderRangingRow = (rowData) => (
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

   convertRangingArrayToMap = (rangedBeacon) => {
      const { rangedBeaconsUUIDMap } = this.state;

      rangedBeacon.forEach(
        (beacon) => {
          if (beacon.uuid.length > 0) {
            const uuid = beacon.uuid.toUpperCase();
            const rangedBeacons = rangedBeaconsUUIDMap[uuid].filter(rangedBeac => rangedBeac === uuid);

            rangedBeaconsUUIDMap[uuid] = [...rangedBeacons, beacon];
          }
      });
      this.setState({ rangedBeaconsUUIDMap });
      return rangedBeaconsUUIDMap;
    }

}

const styles = StyleSheet.create({
 container: {
   flex: 1,
   paddingTop: 60,
   margin: 5,
   backgroundColor: '#F5FCFF',
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
