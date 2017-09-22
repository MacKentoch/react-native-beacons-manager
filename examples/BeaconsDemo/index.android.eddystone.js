/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow weak
 */

 import React, {
   Component
 }                     from 'react';
 import {
   AppRegistry,
   StyleSheet,
   Text,
   ScrollView,
   ListView,
   View,
   DeviceEventEmitter
 }                     from 'react-native';
 import Beacons        from 'react-native-beacons-manager';
 import moment         from 'moment';

 /**
  * uuid of YOUR BEACON (change to yours)
  * @type {?String} uuid
  */
 const UUID         = null;
 const identifier    = 'all-beacons';
 const TIME_FORMAT  = 'MM/DD/YYYY HH:mm:ss';

 class BeaconsDemo extends Component {
   state = {
     // region information
     uuid: UUID,
     identifier: identifier,
     // React Native ListViews datasources initialization
     rangingDataSource:     new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
     regionEnterDatasource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
     regionExitDatasource:  new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([])
   };

   async _bindBeacons () {
     let bindStatus = await Beacons.bindManager()
     return bindStatus
   }

   componentWillMount() {
    //
    // ONLY non component state aware here in componentWillMount
    //
    // start Eddystone EID detection
    Beacons.detectEddystoneEID();
     this._bindBeacons()
      .then(() => {
        const { uuid, identifier } = this.state;
        const region = { uuid, identifier }; // minor and major are null here
      Beacons
        .startRangingBeaconsInRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
        .then(() => console.log('Beacons ranging started succesfully'))
        .catch(error => console.log(`Beacons ranging not started, error: ${error}`));
      Beacons
       .startMonitoringForRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
       .then(() => console.log('Beacons monitoring started succesfully'))
       .catch(error => console.log(`Beacons monitoring not started, error: ${error}`));
      })
      .catch(() => console.log("failed binding"));
   }

   componentDidMount() {


    //
    // component state aware here - attach events
    //
    // Ranging: Listen for beacon changes
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
      ({ identifier, uuid, minor, major }) => {
        console.log('monitoring - regionDidEnter data: ', { identifier, uuid, minor, major });
        const time = moment().format(TIME_FORMAT);
        this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
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
   }

   componentWillUnMount(){
    const { uuid, identifier } = this.state;

    const region = { identifier, uuid }; // minor and major are null here

    Beacons
    .stopRangingBeaconsInRegion(region) // or like  < v1.0.7: .stopRangingBeaconsInRegion(identifier, uuid)
    .then(() => console.log('Beacons ranging stopped succesfully'))
    .catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));

    Beacons
    .stopMonitoringForRegion(region) // or like  < v1.0.7: .stopMonitoringForRegion(identifier, uuid)
    .then(() => console.log('Beacons monitoring stopped succesfully'))
    .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));

    // remove monitoring events we registered at componentDidMount
    DeviceEventEmitter.removeListener('regionDidEnter');
    DeviceEventEmitter.removeListener('regionDidExit');
    // remove ranging event we registered at componentDidMount
    DeviceEventEmitter.removeListener('beaconsDidRange');
   }

   render() {
     const { rangingDataSource, regionEnterDatasource, regionExitDatasource } =  this.state;

     return (
       <ScrollView style={styles.scrollview}>
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
             renderRow={this.renderMonitoringLeaveRow}
           />
         </View>
       </ScrollView>
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
   scrollview: {
     flex: 1
   },
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
