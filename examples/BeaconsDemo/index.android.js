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
  TouchableHighlight,
  ToastAndroid
}                     from 'react-native';
import Beacons        from 'react-native-beacons-manager';
import moment         from 'moment';

/**
* uuid of YOUR BEACON (change to yours)
* @type {String} uuid
*/
//  const UUID         = '7b44b47b-52a1-5381-90c2-f09b6838c5d4';
const IDENTIFIER   = '123456';
const TIME_FORMAT  = 'MM/DD/YYYY HH:mm:ss';

class BeaconsDemo extends Component {
  // will be set as a reference to "beaconsDidRange" event:
  beaconsDidRangeEvent = null;
  // will be set as a reference to "regionDidEnter" event:
  beaconsDidEnterEvent = null;
  // will be set as a reference to "regionDidExit" event:
  beaconsDidLeaveEvent = null

  state = {
    // region information
    uuid: null,// UUID,
    identifier: IDENTIFIER,
    // React Native ListViews datasources initialization
    rangingDataSource:     new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
    regionEnterDatasource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([]),
    regionExitDatasource:  new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows([])
  };

  componentWillMount() {
    //
    // ONLY non component state aware here in componentWillMount
    //

    // Beacons.addParsersListToDetection([
    //   Beacons.PARSER_IBEACON,
    //   Beacons.PARSER_ALTBEACON,
    //   Beacons.PARSER_EDDYSTONE_TLM,
    //   Beacons.PARSER_EDDYSTONE_UID,
    //   Beacons.PARSER_EDDYSTONE_URL
    // ])
    // start iBeacon detection
    Beacons.addIBeaconsDetection()
    .then(() => Beacons.addEddystoneUIDDetection())
    .then(() => Beacons.addEddystoneURLDetection())
    .then(() => Beacons.addEddystoneTLMDetection())
    .then(() => Beacons.addAltBeaconsDetection())
    .then(() => Beacons.addEstimotesDetection())
    .then(this.startRangingAndMonitoring)
    .catch(error => console.log(`something went wrong during initialization: ${error}`));
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
        this.setState({ rangingDataSource: this.state.rangingDataSource.cloneWithRows(data.beacons) });
      }
    );

    // monitoring:
    this.beaconsDidEnterEvent = Beacons.BeaconsEventEmitter.addListener(
      'regionDidEnter',
      ({ identifier, uuid, minor, major }) => {
        console.log('monitoring - regionDidEnter data: ', { identifier, uuid, minor, major });
        const time = moment().format(TIME_FORMAT);
        this.setState({ regionEnterDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
      }
    );

    this.beaconsDidLeaveEvent = Beacons.BeaconsEventEmitter.addListener(
      'regionDidExit',
      ({ identifier, uuid, minor, major }) => {
        console.log('monitoring - regionDidExit data: ', { identifier, uuid, minor, major });
        const time = moment().format(TIME_FORMAT);
      this.setState({ regionExitDatasource: this.state.rangingDataSource.cloneWithRows([{ identifier, uuid, minor, major, time }]) });
      }
    );
  }

  componentWillUnMount() {
    this.stopRangingAndMonitoring();

    // remove monitiring events we registered at componentDidMount::
    this.beaconsDidEnterEvent.remove();
    this.beaconsDidLeaveEvent.remove();
    // remove ranging event we registered at componentDidMount:
    this.beaconsDidRangeEvent.remove();
  }

  render() {
    const { rangingDataSource, regionEnterDatasource, regionExitDatasource } =  this.state;

    return (
      <ScrollView style={styles.scrollview}>
        <View style={styles.container}>

        <View style={styles.actionsContainer}>
          <TouchableHighlight
          style={styles.actionButton}
          onPress={this.handlesOnRemoveIbeacon}
        >
            <Text style={styles.actionText}>
              remove IBeacon detection
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
          style={styles.actionButton}
          onPress={this.handlesOnAddIbeacon}
        >
            <Text style={styles.actionText}>
              add IBeacon detection
            </Text>
          </TouchableHighlight>
        </View>

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

  startRangingAndMonitoring = async () => {
    const { identifier, uuid} = this.state;
    const region = { identifier, uuid }; // minor and major are null here

    try {
      await Beacons.startRangingBeaconsInRegion(region);
      console.log('Beacons ranging started successfully');
      await Beacons.startMonitoringForRegion(region);
      console.log('Beacons monitoring started successfully');
    } catch (error) {
      throw error;
    }
  }

  stopRangingAndMonitoring = async () => {
    const { identifier, uuid} = this.state;
    const region = { identifier, uuid }; // minor and major are null here

    try {
      await Beacons.stopRangingBeaconsInRegion(region);
      console.log('Beacons ranging stopped successfully');
      await Beacons.stopMonitoringForRegion(region);
      console.log('Beacons monitoring stopped successfully');
    } catch (error) {
      throw error;
    }
  }

  handlesOnAddIbeacon = async () => {
    try {
      await this.stopRangingAndMonitoring();
      await Beacons.addIBeaconsDetection();
      await this.startRangingAndMonitoring();
      ToastAndroid.showWithGravity('add IBeacon detection', ToastAndroid.SHORT, ToastAndroid.CENTER);
    } catch (error) {
      ToastAndroid.show(`Error: add IBeacon detection failed: ${error.message}`, ToastAndroid.SHORT);
    }
  }

  handlesOnRemoveIbeacon = async () => {
    try {
      await this.stopRangingAndMonitoring();
      await Beacons.removeIBeaconsDetection();
      await this.startRangingAndMonitoring();
      ToastAndroid.showWithGravity('removed IBeacon detection', ToastAndroid.SHORT, ToastAndroid.CENTER);
    } catch (error) {
      ToastAndroid.show(`Error: remove IBeacon detection failed: ${error.message}`, ToastAndroid.SHORT);
    }
  }
}

const styles = StyleSheet.create({
  scrollview: {
    flex: 1
  },
  container: {
    flex: 1,
    paddingTop: 60,
    marginHorizontal: 5,
    justifyContent: 'flex-start',
  //  alignItems: 'center',
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
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  actionButton: {
  width: 160,
  backgroundColor: '#A6A6A6',
  paddingHorizontal: 5,
  paddingVertical: 10,
  },
  actionText: {
    alignSelf: 'center',
  fontSize: 11,
  color: '#F1F1F1'
  }
});

AppRegistry.registerComponent(
  'BeaconsDemo',
  () => BeaconsDemo
);
