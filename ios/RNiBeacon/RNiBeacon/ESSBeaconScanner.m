// Copyright 2015 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#import <CoreBluetooth/CoreBluetooth.h>

#import "ESSBeaconScanner.h"
#import "ESSEddystone.h"
#import "ESSTimer.h"

static const char *const kBeaconsOperationQueueName = "kESSBeaconScannerBeaconsOperationQueueName";
static NSString *const kESSEddystoneServiceID = @"FEAA";
static NSString *const kSeenCacheBeaconInfo = @"beacon_info";
static NSString *const kSeenCacheOnLostTimer = @"on_lost_timer";

/**
 *=-----------------------------------------------------------------------------------------------=
 * Private Additions to ESSBeaconScanner
 *=-----------------------------------------------------------------------------------------------=
 */
@interface ESSBeaconScanner () <CBCentralManagerDelegate> {
  CBCentralManager *_internalCentralManager;
  dispatch_queue_t _beaconOperationsQueue;

  /**
   * This cache maps Core Bluetooth deviceIDs to NSData objects containing Eddystone telemetry.
   * Then, the next time we see a UID frame for that Eddystone, we can add the most recently seen
   * telemetry frame to the sighting.
   */
  NSMutableDictionary *_tlmCache;

  /**
   * Beacons we've seen list.
   */
  NSMutableDictionary *_eddystoneBeaconsCache;

  BOOL _shouldBeScanning;
}

@end

/**
 *=-----------------------------------------------------------------------------------------------=
 * Implementation for ESSBeaconScanner
 *=-----------------------------------------------------------------------------------------------=
 */
@implementation ESSBeaconScanner

- (instancetype)init {
  if ((self = [super init]) != nil) {
    _onLostTimeout = 5.0;
    _tlmCache = [NSMutableDictionary dictionary];
    _beaconOperationsQueue = dispatch_queue_create(kBeaconsOperationQueueName, NULL);
  }

  return self;
}

-(CBCentralManager *)centralManager {
    // Calling init() for the first time will ask the user to give the app the permission
    // To prevent this happening on app start, we will delay this for the first call
    if (_internalCentralManager == nil) {
        _internalCentralManager = [[CBCentralManager alloc] initWithDelegate:self queue:_beaconOperationsQueue options:@{CBCentralManagerOptionShowPowerAlertKey: @NO}];
        [NSThread sleepForTimeInterval: 0.05]; // Calling directly after init() will give us .Unknown. So just sleep for 50ms to prevent this
    }
    return _internalCentralManager;
}

- (void)startScanning {
  dispatch_async(_beaconOperationsQueue, ^{
    if ([self centralManager].state != CBCentralManagerStatePoweredOn) {
      NSLog(@"CBCentralManager state is %ld, cannot start or stop scanning",
            (long)[self centralManager].state);
      _shouldBeScanning = YES;
    } else {
      NSLog(@"Starting to scan for Eddystones");
      _eddystoneBeaconsCache = [[NSMutableDictionary alloc] init];
      NSArray *services = @[
          [CBUUID UUIDWithString:kESSEddystoneServiceID]
      ];

      // We do not want multiple discoveries of the same beacon to be coalesced into one.
      // (Unfortunately this is ignored when we are in the background.)
      NSDictionary *options = @{ CBCentralManagerScanOptionAllowDuplicatesKey : @YES };
      [[self centralManager] scanForPeripheralsWithServices:services options:options];
    }
  });
}

- (void)stopScanning {
  _shouldBeScanning = NO;
  [[self centralManager] stopScan];
  [self clearRemainingTimers];
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
  if (central.state == CBCentralManagerStatePoweredOn && _shouldBeScanning) {
    [self startScanning];
  }
}

// This will be called from the |beaconsOperationQueue|.
- (void)centralManager:(CBCentralManager *)central
    didDiscoverPeripheral:(CBPeripheral *)peripheral
        advertisementData:(NSDictionary *)advertisementData
                     RSSI:(NSNumber *)RSSI {
  NSDictionary *serviceData = advertisementData[CBAdvertisementDataServiceDataKey];
  NSData *beaconServiceData = serviceData[[ESSBeaconInfo eddystoneServiceID]];

  ESSFrameType frameType = [ESSBeaconInfo frameTypeForFrame:beaconServiceData];

  // If it's a telemetry (TLM) frame, then save it into our cache so that the next time we get a
  // UID frame (i.e. an Eddystone "sighting"), we can include the telemetry with it.
  if (frameType == kESSEddystoneTelemetryFrameType) {
    _tlmCache[peripheral.identifier] = beaconServiceData;
  } else if (frameType == kESSEddystoneURLFrameType) {
    NSURL *url = [ESSBeaconInfo parseURLFromFrameData:beaconServiceData];

    // Report the sighted URL frame.
    if ([_delegate respondsToSelector:@selector(beaconScanner:didFindURL:)]) {
      [_delegate beaconScanner:self didFindURL:url];
    }
  } else if (frameType == kESSEddystoneUIDFrameType
             || frameType == kESSEddystoneEIDFrameType) {
    CBUUID *eddystoneServiceUUID = [ESSBeaconInfo eddystoneServiceID];
    NSData *eddystoneServiceData = serviceData[eddystoneServiceUUID];

    // If we have telemetry data for this Eddystone, include it in the construction of the
    // ESSBeaconInfo object. Otherwise, nil is fine.
    NSData *telemetry = _tlmCache[peripheral.identifier];

    ESSBeaconInfo *beaconInfo;
    if (frameType == kESSEddystoneUIDFrameType) {
      beaconInfo = [ESSBeaconInfo beaconInfoForUIDFrameData:eddystoneServiceData
                                                  telemetry:telemetry
                                                       RSSI:RSSI];
    } else {
      beaconInfo = [ESSBeaconInfo beaconInfoForEIDFrameData:eddystoneServiceData
                                                  telemetry:telemetry
                                                       RSSI:RSSI];
    }

    if (beaconInfo) {
      // NOTE: At this point you can choose whether to keep or get rid of the telemetry data. You
      //       can either opt to include it with every single beacon sighting for this beacon, or
      //       delete it until we get a new / "fresh" TLM frame. We'll treat it as "report it only
      //       when you see it", so we'll delete it each time.
      [_tlmCache removeObjectForKey:peripheral.identifier];

      // If we haven't seen this Eddystone before, fire a beaconScanner:didFindBeacon: and mark it
      // as seen.
      if (!_eddystoneBeaconsCache[beaconInfo.beaconID]) {
        ESSTimer *onLostTimer = [ESSTimer scheduledTimerWithDelay:_onLostTimeout
                                                          onQueue:dispatch_get_main_queue()
                                                            block:
            ^(ESSTimer *timer) {
              ESSBeaconInfo *lostBeaconInfo =
                  _eddystoneBeaconsCache[beaconInfo.beaconID][kSeenCacheBeaconInfo];
              if (lostBeaconInfo) {
                [_eddystoneBeaconsCache removeObjectForKey:beaconInfo.beaconID];
                [self notifyDidRangeBeacon:_eddystoneBeaconsCache];
              }
            }];

        _eddystoneBeaconsCache[beaconInfo.beaconID] = @{
            kSeenCacheBeaconInfo: beaconInfo,
            kSeenCacheOnLostTimer: onLostTimer,
        };
        [self notifyDidRangeBeacon:_eddystoneBeaconsCache];
      } else {
        // Reset the onLost timer.
        [_eddystoneBeaconsCache[beaconInfo.beaconID][kSeenCacheOnLostTimer] reschedule];
        [self notifyDidRangeBeacon:_eddystoneBeaconsCache];
      }
    }
  } else {
    NSLog(@"Unsupported frame type (%d) detected. Ignorning.", (int)frameType);
  }
}

/**
 * Commont event about beacons changes in region
 */
- (void)notifyDidRangeBeacon:(NSMutableDictionary *)beacons {
    if (![_delegate respondsToSelector:@selector(beaconScanner:didRangeBeacon:)]) return;
    
    NSMutableArray *beaconArray = [[NSMutableArray alloc] init];
    for (id key in beacons) {
        [beaconArray addObject:beacons[key][kSeenCacheBeaconInfo]];
    }
    [_delegate beaconScanner:self didRangeBeacon:beaconArray];
}

- (void)clearRemainingTimers {
  for (ESSBeaconID *beaconID in _eddystoneBeaconsCache) {
    [_eddystoneBeaconsCache[beaconID][kSeenCacheOnLostTimer] cancel];
  }

  _eddystoneBeaconsCache = nil;
}

@end
