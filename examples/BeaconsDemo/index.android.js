/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 'use strict';

 import React, {
   Component
 }                     from 'react';
 import {
   AppRegistry,
   StyleSheet,
   Text,
   ListView,
   View,
   DeviceEventEmitter
 }                     from 'react-native';
 import Beacons        from 'react-native-beacons-manager';
 import moment         from 'moment';

 /**
  * uuid of YOUR BEACON (change to yours)
  * @type {String} uuid
  */
 const UUID = '7b44b47b-52a1-5381-90c2-f09b6838c5d4';

 class BeaconsDemo extends Component {
   constructor(props) {
     super(props);

     this.state = {
       // region information
       uuid: UUID,
       // monotoring identifier:
       identifier: '123456',

       // React Native ListViews datasources initialization
       rangingDataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
       regionEnterDatasource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
       regionExitDatasource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([])
     };
   }

   componentWillMount() {
     //
     // ONLY non component state aware here in componentWillMount
     //
     Beacons.detectIBeacons();
     const { uuid, identifier } = this.state;

     Beacons
       .startRangingBeaconsInRegion(
         'REGION1',
         uuid
       )
       .then(() => console.log('Beacons ranging started succesfully'))
       .catch(error => console.log(`Beacons ranging not started, error: ${error}`));


     Beacons
       .startMonitoringForRegion({ identifier, uuid }) // minor and major are null here
       .then(() => console.log('Beacons monitoring started succesfully'))
       .catch(error => console.log(`Beacons monitoring not started, error: ${error}`));
   }

   componentDidMount() {
     //
     // component state aware here - attach events
     //
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
       ({ identifer, uuid, minor, major }) => {
         console.log('monitoring - regionDidEnter data: ', { identifer, uuid, minor, major });
        // this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows({ identifer, uuid, minor, major }) });
       }
     );

     DeviceEventEmitter.addListener(
       'regionDidExit',
       ({ identifer, uuid, minor, major }) => {
         console.log('monitoring - regionDidExit data: ', { identifer, uuid, minor, major });
        // this.setState({ regionExitDatasource: this.state.rangingDataSource.cloneWithRows({ identifer, uuid, minor, major }) });
       }
     );
   }

   componentWillUnMount(){
     const { uuid } = this.state;

     Beacons
      .stopRangingBeaconsInRegion(
        'REGION1',
        uuid
      )
      .then(() => console.log('Beacons ranging stopped succesfully'))
      .catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));


     Beacons
       .stopMonitoringForRegion({identifier: '123456', uuid})
       .then(() => console.log('Beacons monitoring stopped succesfully'))
       .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));

    DeviceEventEmitter.remove();
   }

   render() {
     const { rangingDataSource, regionEnterDatasource, regionExitDatasource } =  this.state;
     return (
       <View style={styles.container}>
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
           renderRow={this.renderMonitoringEnterRow}
         />
       </View>
     );
   }

   renderRangingRow = (rowData) => {
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

   renderMonitoringEnterRow = (row, { identifier, uuid, minor, major }) => {
     console.log('row: ', row);
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
       </View>
     );
   }

   renderMonitoringLeaveRow = ({ identifier, uuid, minor, major }) => {
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
     backgroundColor: '#F5FCFF'
   },
   btleConnectionStatus: {
     // fontSize: 20,
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
