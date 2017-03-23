
import Beacons  from 'react-native-beacons-manager';
import moment   from 'moment';

const TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss';

class beaconMonitoringOnly extends Component {
 constructor(props) {
   super(props);

   this.state = {
     // region information
     uuid: '7b44b47b-52a1-5381-90c2-f09b6838c5d4',
     identifier: 'some id',

     rangingDataSource:     new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
     regionEnterDatasource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
     regionExitDatasource:  new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([])
   };
 }

 componentWillMount(){
   const { identifier, uuid } = this.state;
   //
   // ONLY non component state aware here in componentWillMount
   //

   // Define a region which can be identifier + uuid,
   // identifier + uuid + major or identifier + uuid + major + minor
   // (minor and major properties are 'OPTIONAL' numbers)
   const region = { identifier, uuid };

   // start iBeacon detection (later will add Eddystone and Nordic Semiconductor beacons)
   Beacons.detectIBeacons();
   // Monitor beacons inside the region
   Beacons
     .startMonitoringForRegion(region)
     .then(() => console.log('Beacons monitoring started succesfully'))
     .catch(error => console.log(`Beacons monitoring not started, error: ${error}`));

   // Range beacons inside the region
   Beacons
     .startRangingBeaconsInRegion(identifier, uuid)
     .then(() => console.log('Beacons ranging started succesfully'))
     .catch(error => console.log(`Beacons ranging not started, error: ${error}`));
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

 componentWillUnMount() {
   const { uuid, identifier } = this.state;
   const region = { identifier, uuid };

   // stop ranging beacons:
   Beacons
   .stopRangingBeaconsInRegion(identifier, uuid)
   .then(() => console.log('Beacons ranging stopped succesfully'))
   .catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));

   // stop monitoring beacons:
   Beacons
     .stopMonitoringForRegion(region)
     .then(() => console.log('Beacons monitoring stopped succesfully'))
     .catch(error => console.log(`Beacons monitoring not stopped, error: ${error}`));

   // remove ranging event we registered at componentDidMount
   DeviceEventEmitter.removeListener('beaconsDidRange');
   // remove beacons events we registered at componentDidMount
   DeviceEventEmitter.removeListener('regionDidEnter');
   DeviceEventEmitter.removeListener('regionDidExit');
 }

 render() {
   const { bluetoothState, rangingDataSource, regionEnterDatasource, regionExitDatasource } =  this.state;

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
         renderRow={this.renderMonitoringLeaveRow}
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
