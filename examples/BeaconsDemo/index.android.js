/**
 * @flow
 */

// #region imports
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  SectionList,
  View,
  TouchableHighlight,
  ToastAndroid,
  Image,
} from 'react-native';
import Beacons from 'react-native-beacons-manager';
import { Avatar } from 'react-native-elements';
import moment from 'moment';
import beaconIMAGE from './images/beacons/ibeacon.png';
import { hashCode } from './helpers';
// import altBeaconIMAGE from './images/beacons/altbeacon.png';
// import eddystoneURLIMAGE from './images/beacons/eddystoneURL.png';
// import eddystoneTLMIMAGE from './images/beacons/eddystone_TLM.png';
// import eddystoneUIDIMAGE from './images/beacons/eddystone_UID.png';
// #endregion

// #region flow types
type DetectedBeacon = {
  identifier: string,
  uuid?: string,
  major?: number,
  minor?: number,
  proximity?: string,
  rssi?: string,
  distance?: number,
};

type Section = {
  key: number,
  data: Array<DetectedBeacon>,
  title: string,
  sectionId: string,
};

type Props = any;

type State = {
  // region information
  uuid?: string,
  identifier: string,
  // all detected beacons:
  beacons: Array<Section>,
};
// #endregion

// #region constants
//  const UUID         = '7b44b47b-52a1-5381-90c2-f09b6838c5d4';
const IDENTIFIER = '123456';
const TIME_FORMAT = 'MM/DD/YYYY HH:mm:ss';
const UUID = '7b44b47b-52a1-5381-90c2-f09b6838c5d4';

const RANGING_TITLE = 'ranging beacons in the area:';
const RANGING_SECTION_ID = 1;
const MONITORING_ENTER_TITLE = 'monitoring enter information:';
const MONITORING_ENTER_SECTION_ID = 2;
const MONITORING_LEAVE_TITLE = 'monitoring exit information:';
const MONITORING_LEAVE_SECTION_ID = 3;
// #endregion

class BeaconsDemo extends Component<Props, State> {
  // will be set as a reference to "beaconsDidRange" event:
  beaconsDidRangeEvent = null;
  // will be set as a reference to "regionDidEnter" event:
  beaconsDidEnterEvent = null;
  // will be set as a reference to "regionDidExit" event:
  beaconsDidLeaveEvent = null;
  // will be set as a reference to service did connect event:
  beaconsServiceDidConnect: any = null;

  state = {
    // region information
    uuid: UUID,
    identifier: IDENTIFIER,
    // all detected beacons:
    beacons: [
      { key: 1, data: [], title: RANGING_TITLE, sectionId: RANGING_SECTION_ID },
      {
        key: 2,
        data: [],
        title: MONITORING_ENTER_TITLE,
        sectionId: MONITORING_ENTER_SECTION_ID,
      },
      {
        key: 3,
        data: [],
        title: MONITORING_LEAVE_TITLE,
        sectionId: MONITORING_LEAVE_SECTION_ID,
      },
    ],
  };

  // #region lifecycle methods
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
      .catch(error =>
        console.log(`something went wrong during initialization: ${error}`),
      );
  }

  componentDidMount() {
    //
    // component state aware here - attach events
    //

    // we need to wait for service connection to ensure synchronization:
    this.beaconsServiceDidConnect = Beacons.BeaconsEventEmitter.addListener(
      'beaconServiceConnected',
      () => {
        console.log('service connected');
        this.startRangingAndMonitoring();
      },
    );

    // Ranging: Listen for beacon changes
    this.beaconsDidRangeEvent = Beacons.BeaconsEventEmitter.addListener(
      'beaconsDidRange',
      (response: {
        beacons: Array<{
          distance: number,
          proximity: string,
          rssi: string,
          uuid: string,
        }>,
        uuid: string,
        indetifier: string,
      }) => {
        console.log('BEACONS: ', response);

        response.beacons.forEach(beacon =>
          this.updateBeaconState(RANGING_SECTION_ID, {
            identifier: response.identifier,
            uuid: String(beacon.uuid),
            major: parseInt(beacon.major, 10) >= 0 ? beacon.major : '',
            minor: parseInt(beacon.minor, 10) >= 0 ? beacon.minor : '',
            proximity: beacon.proximity ? beacon.proximity : '',
            rssi: beacon.rssi ? beacon.rssi : '',
            distance: beacon.distance ? beacon.distance : '',
          }),
        );
      },
    );

    // monitoring:
    this.beaconsDidEnterEvent = Beacons.BeaconsEventEmitter.addListener(
      'regionDidEnter',
      ({ identifier, uuid, minor, major }) => {
        console.log('regionDidEnter: ', { identifier, uuid, minor, major });
        this.updateBeaconState(MONITORING_ENTER_SECTION_ID, {
          identifier,
          uuid,
          minor,
          major,
        });
      },
    );

    this.beaconsDidLeaveEvent = Beacons.BeaconsEventEmitter.addListener(
      'regionDidExit',
      ({ identifier, uuid, minor, major }) => {
        console.log('regionDidExit: ', { identifier, uuid, minor, major });
        this.updateBeaconState(MONITORING_LEAVE_SECTION_ID, {
          identifier,
          uuid,
          minor,
          major,
        });
      },
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
    const { beacons } = this.state;

    console.log('beacons: ', beacons);

    return (
      <Image
        style={styles.backgroundImage}
        resizeMode="center"
        source={require('./bluetooth-300-300-opacity-45.png')}
      >
        <View style={styles.container}>
          <View style={styles.actionsContainer}>
            <TouchableHighlight
              style={styles.actionButton}
              onPress={this.handlesOnRemoveIbeacon}
            >
              <Text style={styles.actionText}>remove IBeacon detection</Text>
            </TouchableHighlight>

            <TouchableHighlight
              style={styles.actionButton}
              onPress={this.handlesOnAddIbeacon}
            >
              <Text style={styles.actionText}>add IBeacon detection</Text>
            </TouchableHighlight>
          </View>

          <SectionList
            sections={beacons}
            keyExtractor={this.sectionListKeyExtractor}
            renderSectionHeader={this.renderHeader}
            renderItem={this.renderRow}
            ListEmptyComponent={this.renderEmpty}
            // SectionSeparatorComponent={this.renderSeparator}
            ItemSeparatorComponent={this.renderSeparator}
            // shouldItemUpdate={this.shouldItemUpdate}
          />
        </View>
      </Image>
    );
  }
  // #endregion

  // #region SectionList related
  sectionListKeyExtractor = (item: DetectedBeacon, index: number) => {
    const UUID = item.uuid ? item.uuid : 'NONE';
    const ID = item.identifier ? item.identifier : 'NONE';

    return `${UUID}-${ID}`;
  };

  renderHeader = ({ section }) => (
    <Text style={styles.headline}>{section.title}</Text>
  );

  renderSeparator = () => (
    <View style={{ height: 1, backgroundColor: '#E1E1E1', marginLeft: 80 }} />
  );

  renderRow = ({ item }) => {
    console.log('rowData: ', item);
    return (
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Avatar
            medium
            rounded
            source={beaconIMAGE}
            onPress={() => console.log('no use')}
            activeOpacity={0.7}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.smallText}>
            indentifier: {item.identifier ? item.identifier : 'NA'}
          </Text>
          <Text style={styles.smallText}>
            UUID: {item.uuid ? item.uuid : 'NA'}
          </Text>
          <View style={styles.majorMinorContainer}>
            <Text style={styles.smallText}>
              Major: {parseInt(item.major, 10) >= 0 ? item.major : 'NA'}
            </Text>
            <Text style={[styles.smallText, { marginLeft: 10 }]}>
              Minor: {parseInt(item.minor, 10) >= 0 ? item.minor : 'NA'}
            </Text>
            <Text style={[styles.smallText, { marginLeft: 10 }]}>
              RSSI: {item.rssi ? item.rssi : 'NA'}
            </Text>
          </View>

          <Text style={styles.smallText}>
            Proximity: {item.proximity ? item.proximity : 'NA'}
          </Text>
          <Text style={styles.smallText}>
            Distance: {item.distance ? item.distance.toFixed(2) : 'NA'}
          </Text>
        </View>
      </View>
    );
  };

  renderEmpty = () => (
    <View
      style={{ height: 40, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text>no beacon detected</Text>
    </View>
  );
  // #endregion

  updateBeaconState = (
    forSectionId: number = 0, // section identifier
    { identifier, uuid, minor, major, ...rest }, // beacon
  ) => {
    const { beacons } = this.state;
    const time = moment().format(TIME_FORMAT);
    const updatedBeacons = beacons.map(beacon => {
      if (beacon.sectionId === forSectionId) {
        const sameBeacon = data =>
          !(
            data.UUID === uuid &&
            data.identifier === identifier &&
            data.minor === minor &&
            data.major === major
          );

        const updatedData = [].concat(...beacon.data.filter(sameBeacon), {
          identifier,
          uuid,
          minor,
          major,
          time,
          ...rest,
        });
        return { ...beacon, data: updatedData };
      }
      return beacon;
    });
    this.setState({ beacons: updatedBeacons });
  };

  startRangingAndMonitoring = async () => {
    const { identifier, uuid } = this.state;
    const region = { identifier, uuid }; // minor and major are null here

    try {
      await Beacons.startRangingBeaconsInRegion(region);
      console.log('Beacons ranging started successfully');
      await Beacons.startMonitoringForRegion(region);
      console.log('Beacons monitoring started successfully');
    } catch (error) {
      throw error;
    }
  };

  stopRangingAndMonitoring = async () => {
    const { identifier, uuid } = this.state;
    const region = { identifier, uuid }; // minor and major are null here

    try {
      await Beacons.stopRangingBeaconsInRegion(region);
      console.log('Beacons ranging stopped successfully');
      await Beacons.stopMonitoringForRegion(region);
      console.log('Beacons monitoring stopped successfully');
    } catch (error) {
      throw error;
    }
  };

  handlesOnAddIbeacon = async () => {
    try {
      await this.stopRangingAndMonitoring();
      await Beacons.addIBeaconsDetection();
      await this.startRangingAndMonitoring();
      ToastAndroid.showWithGravity(
        'add IBeacon detection',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    } catch (error) {
      ToastAndroid.show(
        `Error: add IBeacon detection failed: ${error.message}`,
        ToastAndroid.SHORT,
      );
    }
  };

  handlesOnRemoveIbeacon = async () => {
    try {
      await this.stopRangingAndMonitoring();
      await Beacons.removeIBeaconsDetection();
      await this.startRangingAndMonitoring();
      ToastAndroid.showWithGravity(
        'removed IBeacon detection',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    } catch (error) {
      ToastAndroid.show(
        `Error: remove IBeacon detection failed: ${error.message}`,
        ToastAndroid.SHORT,
      );
    }
  };
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: null,
    height: null,
  },
  container: {
    flex: 1,
  },
  btleConnectionStatus: {
    // fontSize: 20,
    // paddingTop: 20
  },
  headline: {
    fontSize: 20,
    marginHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
    padding: 8,
    paddingBottom: 16,
  },
  iconContainer: {
    flexDirection: 'column',
    marginRight: 10,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  majorMinorContainer: {
    flexDirection: 'row',
  },
  smallText: {
    fontSize: 11,
  },
  actionsContainer: {
    marginVertical: 10,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: '#F1F1F1',
  },
});

AppRegistry.registerComponent('BeaconsDemo', () => BeaconsDemo);
