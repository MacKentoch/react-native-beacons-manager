/* eslint-disable */

import Beacons  from 'react-native-beacons-manager';
import moment   from 'moment';

const TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss';

class beaconMonitoringOnly extends Component {
  // will be set as a reference to "regionDidEnter" event:
  regionDidEnterEvent = null;
  // will be set as a reference to "regionDidExit" event:
  regionDidExitEvent = null;
  // will be set as a reference to "authorizationStatusDidChange" event:
  authStateDidRangeEvent = null;

 state = {
   // region information
   uuid: '7b44b47b-52a1-5381-90c2-f09b6838c5d4',
   identifier: 'some id',

   regionEnterDatasource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
   regionExitDatasource:  new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([])
 };

 componentWillMount(){
   const { identifier, uuid } = this.state;
   //
   // ONLY non component state aware here in componentWillMount
   //

   // OPTIONAL: listen to authorization change
   this.authStateDidRangeEvent = Beacons.BeaconsEventEmitter.addListener(
     'authorizationStatusDidChange',
     (info) => console.log('authorizationStatusDidChange: ', info)
   );

   // MANDATORY: you have to request ALWAYS Authorization (not only when in use) when monitoring
   // you also have to add "Privacy - Location Always Usage Description" in your "Info.plist" file
   // otherwise monitoring won't work
   Beacons.requestAlwaysAuthorization();
   Beacons.shouldDropEmptyRanges(true);

   // Define a region which can be identifier + uuid,
   // identifier + uuid + major or identifier + uuid + major + minor
   // (minor and major properties are numbers)
   const region = { identifier, uuid };
   // Monitor for beacons inside the region
   Beacons
   .startMonitoringForRegion(region) // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
   .then(() => console.log('Beacons monitoring started succesfully'))
   .catch(error => console.log(`Beacons monitoring not started, error: ${error}`));
   // update location to ba able to monitor:
   Beacons.startUpdatingLocation();
 }

 componentDidMount() {
   //
   // component state aware here - attach events
   //

   // monitoring:
   this.regionDidEnterEvent = Beacons.BeaconsEventEmitter.addListener(
     'regionDidEnter',
     (data) => {
       console.log('monitoring - regionDidEnter data: ', data);
       const time = moment().format(TIME_FORMAT);
       this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier:data.identifier, uuid:data.uuid, minor:data.minor, major:data.major, time }]) });
     }
   );

   this.regionDidExitEvent = Beacons.BeaconsEventEmitter.addListener(
     'regionDidExit',
     ({ identifier, uuid, minor, major }) => {
       console.log('monitoring - regionDidExit data: ', { identifier, uuid, minor, major });
       const time = moment().format(TIME_FORMAT);
      this.setState({ regionExitDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
     }
   );
 }

 componentWillUnMount() {
   // stop monitoring beacons:
   Beacons
   .stopMonitoringForRegion(region)
   .then(() => console.log('Beacons monitoring stopped succesfully'))
   .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));
   // stop updating locationManager:
   Beacons.stopUpdatingLocation();
   // remove auth state event we registered at componentDidMount:
   this.authStateDidRangeEvent.remove();
   // remove monitiring events we registered at componentDidMount::
   this.regionDidEnterEvent.remove();
   this.regionDidExitEvent.remove();
 }

 render() {
   const { bluetoothState, regionEnterDatasource, regionExitDatasource } =  this.state;

   return (
     <View style={styles.container}>
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
