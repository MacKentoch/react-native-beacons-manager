/*
 * Radius Networks, Inc.
 * http://www.radiusnetworks.com
 *
 * @author Scott Yoder
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


#import "RNLBeaconScanner.h"
#import "RNLBeaconParser.h"
#import "RNLBeaconTracker.h"
#import "RNLBeacon.h"
#import "RNLBeacon+Distance.h"

#define SECONDS_BEFORE_DROPOFF 5

@interface RNLBeaconScanner ()
@property (strong, nonatomic) CBCentralManager *cbManager;
@property (nonatomic) BOOL scanning;
@property (strong, nonatomic) NSArray *beaconParsers;
@property (strong, nonatomic) RNLBeaconTracker *beaconTracker;
@end

@implementation RNLBeaconScanner

+ (instancetype)sharedBeaconScanner {
  static RNLBeaconScanner *sharedBeaconScanner = nil;
  if (sharedBeaconScanner == nil) {
    sharedBeaconScanner = [[RNLBeaconScanner alloc] init];
  }
  return sharedBeaconScanner;
}

- (instancetype) init {
  self = [super init];
  self.beaconParsers = [[NSMutableArray alloc] init];
  RNLBeaconParser *altBeaconParser = [[RNLBeaconParser alloc] init];
  [altBeaconParser setBeaconLayout:@"m:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25" error: Nil ];
  RNLBeaconParser *uidBeaconParser = [[RNLBeaconParser alloc] init];
  [uidBeaconParser setBeaconLayout:@"s:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19" error: Nil];
    RNLBeaconParser *eidBeaconParser = [[RNLBeaconParser alloc] init];
    [eidBeaconParser setBeaconLayout:@"s:0-1=feaa,m:2-2=30,p:3-3:-41,i:4-11" error:nil];
  self.beaconParsers = @[ altBeaconParser, uidBeaconParser, eidBeaconParser ];
  self.debugEnabled = NO;
  
  self.beaconTracker = [[RNLBeaconTracker alloc] init];

  [self startScanningAltbeacons];
  return self;
}
- (void) dealloc {
  [self stopScanningAltbeacons];
}

- (void)startScanningAltbeacons {
  if (!self.cbManager) {
    self.cbManager = [[CBCentralManager alloc] initWithDelegate:self queue:dispatch_get_main_queue()];
    self.scanning = YES;
  }
}

- (void)stopScanningAltbeacons {
  [self.cbManager stopScan];
}

- (NSArray *)trackedBeacons {
  return self.beaconTracker.trackedBeacons;
}

- (NSNumber *)calibratedRSSIFor:(RNLBeacon *)beacon {
  NSString *key = [NSString stringWithFormat:@"%@ %@ %@", beacon.id1, beacon.id2, beacon.id3];
  for (RNLBeacon *trackedBeacon in self.trackedBeacons) {
    NSString *trackedBeaconKey = [NSString stringWithFormat:@"%@ %@ %@", trackedBeacon.id1, trackedBeacon.id2, trackedBeacon.id3];
    if ([trackedBeaconKey isEqualToString:key]) {
      return trackedBeacon.rssi;
    }
  }
  return Nil;
}

- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
  if (central.state == CBCentralManagerStatePoweredOn && self.scanning) {
    [self.cbManager scanForPeripheralsWithServices:nil options:@{CBCentralManagerScanOptionAllowDuplicatesKey : @(YES)}];
  }
}

- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary *)advertisementData RSSI:(NSNumber *)RSSI {
  NSDictionary *serviceData = advertisementData[@"kCBAdvDataServiceData"];
  
  RNLBeacon *beacon = Nil;
  NSData *adData = advertisementData[@"kCBAdvDataManufacturerData"];
  
  for (RNLBeaconParser *beaconParser in self.beaconParsers) {
    if (adData) {
      if (self.debugEnabled) {
        NSLog(@"didDiscoverPeripheral with manufacturer data");
      }
      beacon = [beaconParser fromScanData: adData withRssi: RSSI forDevice: peripheral serviceUuid: Nil];
    }
    else if (serviceData != Nil) {
      if (self.debugEnabled) {
        NSLog(@"didDiscoverPeripheral with service data");
      }
      for (NSObject *key in serviceData.allKeys) {
        NSString *uuidString = [(CBUUID *) key UUIDString];
        NSScanner* scanner = [NSScanner scannerWithString: uuidString];
        unsigned long long uuidLongLong;
        
        [scanner scanHexLongLong: &uuidLongLong];
        NSNumber *uuidNumber = [NSNumber numberWithLongLong:uuidLongLong];
        if (self.debugEnabled) {
          NSLog(@"Service data has length %lu", (unsigned long)((NSData *)[serviceData objectForKey:key]).length);
        }

        NSData *adServiceData = [serviceData objectForKey:key];
        if (adServiceData) {
          beacon = [beaconParser fromScanData: adServiceData withRssi: RSSI forDevice: peripheral serviceUuid: uuidNumber];
        }
      }
    }
    if (beacon != Nil) {
      break;
    }
  }

  if (beacon != Nil) {
    NSString *key = [NSString stringWithFormat:@"%@ %@ %@", beacon.id1, beacon.id2, beacon.id3];
    [self.beaconTracker updateWithRangedBeacons: @[beacon]];
    NSLog(@"Detected beacon: %@", key);
  }
  
  
}

@end
