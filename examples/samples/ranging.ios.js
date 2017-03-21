
import Beacons  from 'react-native-beacons-manager';
import moment   from 'moment';

const TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss';

class beaconRangingOnly extends Component {
 constructor(props) {
   super(props);

   this.state = {
     // region information
     uuid: '7b44b47b-52a1-5381-90c2-f09b6838c5d4',
     identifier: 'some id',

     rangingDataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([])
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

   // MANDATORY: Request for authorization while the app is open
   //           -> this is the authorization set by default by react-native init in the info.plist file
   // RANGING ONLY (this is not enough to make MONITORING working)
   Beacons.requestWhenInUseAuthorization();
   // Define a region which can be identifier + uuid,
   // identifier + uuid + major or identifier + uuid + major + minor
   // (minor and major properties are numbers)
   const region = { identifier, uuid };
   // Range for beacons inside the region
   Beacons.startRangingBeaconsInRegion(region);
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
 }

 componentWillUnMount() {
   // stop ranging beacons:
   Beacons.stopRangingBeaconsInRegion();
   // remove beacons event we registered at componentDidMount
   DeviceEventEmitter.removeListener('beaconsDidRange');
 }

 render() {
   const { rangingDataSource } =  this.state;

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
}
