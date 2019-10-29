//
//  RNiBeacon.m
//  RNiBeacon
//
//  Created by MacKentoch on 17/02/2017.
//  Copyright © 2017 Erwan DATIN. All rights reserved.
//

#import <CoreLocation/CoreLocation.h>

#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>
#import "ESSBeaconScanner.h"
#import "ESSEddystone.h"

#import "RNiBeacon.h"

static NSString *const kEddystoneRegionID = @"EDDY_STONE_REGION_ID";

@interface RNiBeacon() <CLLocationManagerDelegate, ESSBeaconScannerDelegate>

@property (strong, nonatomic) CLLocationManager *locationManager;
@property (strong, nonatomic) ESSBeaconScanner *eddyStoneScanner;
@property (assign, nonatomic) BOOL dropEmptyRanges;

@end

@implementation RNiBeacon

RCT_EXPORT_MODULE()

#pragma mark Initialization

- (instancetype)init
{
  if (self = [super init]) {
    self.locationManager = [[CLLocationManager alloc] init];

    self.locationManager.delegate = self;
    self.locationManager.pausesLocationUpdatesAutomatically = NO;
    self.dropEmptyRanges = NO;
      
    self.eddyStoneScanner = [[ESSBeaconScanner alloc] init];
    self.eddyStoneScanner.delegate = self;
  }

  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
    return @[
             @"authorizationStatusDidChange",
             @"beaconsDidRange",
             @"regionDidEnter",
             @"regionDidExit",
             @"didDetermineState"
             ];
}

#pragma mark

-(CLBeaconRegion *) createBeaconRegion: (NSString *) identifier
                                  uuid: (NSString *) uuid
                                 major: (NSInteger) major
                                 minor:(NSInteger) minor
{
  NSUUID *beaconUUID = [[NSUUID alloc] initWithUUIDString:uuid];

  unsigned short mj = (unsigned short) major;
  unsigned short mi = (unsigned short) minor;

  CLBeaconRegion *beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:beaconUUID major:mj
                                                                         minor:mi
                                                                    identifier:identifier];

  NSLog(@"createBeaconRegion with: identifier - uuid - major - minor");
  beaconRegion.notifyOnEntry = YES;
  beaconRegion.notifyOnExit = YES;
  beaconRegion.notifyEntryStateOnDisplay = YES;

  return beaconRegion;
}

-(CLBeaconRegion *) createBeaconRegion: (NSString *) identifier
                                  uuid: (NSString *) uuid
                                 major: (NSInteger) major
{
  NSUUID *beaconUUID = [[NSUUID alloc] initWithUUIDString:uuid];

  unsigned short mj = (unsigned short) major;

  CLBeaconRegion *beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:beaconUUID
                                                                         major:mj
                                                                    identifier:identifier];

  NSLog(@"createBeaconRegion with: identifier - uuid - major");
  beaconRegion.notifyOnEntry = YES;
  beaconRegion.notifyOnExit = YES;
  beaconRegion.notifyEntryStateOnDisplay = YES;

  return beaconRegion;
}

-(CLBeaconRegion *) createBeaconRegion: (NSString *) identifier
                                  uuid: (NSString *) uuid
{
  NSUUID *beaconUUID = [[NSUUID alloc] initWithUUIDString:uuid];

  CLBeaconRegion *beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:beaconUUID
                                                                    identifier:identifier];

  NSLog(@"createBeaconRegion with: identifier - uuid");
  beaconRegion.notifyOnEntry = YES;
  beaconRegion.notifyOnExit = YES;
  beaconRegion.notifyEntryStateOnDisplay = YES;

  return beaconRegion;
}

-(CLBeaconRegion *) convertDictToBeaconRegion: (NSDictionary *) dict
{
  if (dict[@"minor"] == nil) {
    if (dict[@"major"] == nil) {
      return [self createBeaconRegion:[RCTConvert NSString:dict[@"identifier"]]
                                 uuid:[RCTConvert NSString:dict[@"uuid"]]];
    } else {
      return [self createBeaconRegion:[RCTConvert NSString:dict[@"identifier"]]
                                 uuid:[RCTConvert NSString:dict[@"uuid"]]
                                major:[RCTConvert NSInteger:dict[@"major"]]];
    }
  } else {
    return [self createBeaconRegion:[RCTConvert NSString:dict[@"identifier"]]
                               uuid:[RCTConvert NSString:dict[@"uuid"]]
                              major:[RCTConvert NSInteger:dict[@"major"]]
                              minor:[RCTConvert NSInteger:dict[@"minor"]]];
  }
}

-(NSDictionary *) convertBeaconRegionToDict: (CLBeaconRegion *) region
{
  if (region.minor == nil) {
    if (region.major == nil) {
      return @{
               @"identifier": region.identifier,
               @"uuid": [region.proximityUUID UUIDString],
               };
    } else {
      return @{
               @"identifier": region.identifier,
               @"uuid": [region.proximityUUID UUIDString],
               @"major": region.major
               };
    }
  } else {
    return @{
             @"identifier": region.identifier,
             @"uuid": [region.proximityUUID UUIDString],
             @"major": region.major,
             @"minor": region.minor
             };
  }
}

-(NSString *)stringForProximity:(CLProximity)proximity {
  switch (proximity) {
    case CLProximityUnknown:    return @"unknown";
    case CLProximityFar:        return @"far";
    case CLProximityNear:       return @"near";
    case CLProximityImmediate:  return @"immediate";
    default:                    return @"";
  }
}

RCT_EXPORT_METHOD(requestAlwaysAuthorization)
{
  if ([self.locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
    [self.locationManager requestAlwaysAuthorization];
  }
}

RCT_EXPORT_METHOD(requestWhenInUseAuthorization)
{
  if ([self.locationManager respondsToSelector:@selector(requestWhenInUseAuthorization)]) {
    [self.locationManager requestWhenInUseAuthorization];
  }
}

RCT_EXPORT_METHOD(allowsBackgroundLocationUpdates:(BOOL)allow)
{
  self.locationManager.allowsBackgroundLocationUpdates = allow;
}

RCT_EXPORT_METHOD(getAuthorizationStatus:(RCTResponseSenderBlock)callback)
{
  callback(@[[self nameForAuthorizationStatus:[CLLocationManager authorizationStatus]]]);
}

RCT_EXPORT_METHOD(getMonitoredRegions:(RCTResponseSenderBlock)callback)
{
  NSMutableArray *regionArray = [[NSMutableArray alloc] init];

  for (CLBeaconRegion *region in self.locationManager.monitoredRegions) {
    [regionArray addObject: [self convertBeaconRegionToDict: region]];
  }

  callback(@[regionArray]);
}

RCT_EXPORT_METHOD(startMonitoringForRegion:(NSDictionary *) dict)
{
  [self.locationManager startMonitoringForRegion:[self convertDictToBeaconRegion:dict]];
}

RCT_EXPORT_METHOD(startRangingBeaconsInRegion:(NSDictionary *) dict)
{
  if ([dict[@"identifier"] isEqualToString:kEddystoneRegionID]) {
      [_eddyStoneScanner startScanning];
  } else {
      [self.locationManager startRangingBeaconsInRegion:[self convertDictToBeaconRegion:dict]];
  }
}

RCT_EXPORT_METHOD(stopMonitoringForRegion:(NSDictionary *) dict)
{
  [self.locationManager stopMonitoringForRegion:[self convertDictToBeaconRegion:dict]];
}

RCT_EXPORT_METHOD(stopRangingBeaconsInRegion:(NSDictionary *) dict)
{
  if ([dict[@"identifier"] isEqualToString:kEddystoneRegionID]) {
    [self.eddyStoneScanner stopScanning];
  } else {
    [self.locationManager stopRangingBeaconsInRegion:[self convertDictToBeaconRegion:dict]];
  }
}

RCT_EXPORT_METHOD(requestStateForRegion:(NSDictionary *)dict)
{
  if ([self.locationManager respondsToSelector:@selector(requestStateForRegion:)]) {
    [self.locationManager requestStateForRegion:[self convertDictToBeaconRegion:dict]];
  }
}

RCT_EXPORT_METHOD(startUpdatingLocation)
{
  [self.locationManager startUpdatingLocation];
}

RCT_EXPORT_METHOD(stopUpdatingLocation)
{
  [self.locationManager stopUpdatingLocation];
}

RCT_EXPORT_METHOD(shouldDropEmptyRanges:(BOOL)drop)
{
  self.dropEmptyRanges = drop;
}

-(NSString *)nameForAuthorizationStatus:(CLAuthorizationStatus)authorizationStatus
{
  switch (authorizationStatus) {
    case kCLAuthorizationStatusAuthorizedAlways:
      return @"authorizedAlways";

    case kCLAuthorizationStatusAuthorizedWhenInUse:
      return @"authorizedWhenInUse";

    case kCLAuthorizationStatusDenied:
      return @"denied";

    case kCLAuthorizationStatusNotDetermined:
      return @"notDetermined";

    case kCLAuthorizationStatusRestricted:
      return @"restricted";
  }
}

-(void)locationManager:(CLLocationManager *)manager didChangeAuthorizationStatus:(CLAuthorizationStatus)status
{
    NSString *statusName = [self nameForAuthorizationStatus:status];
    [self sendEventWithName:@"authorizationStatusDidChange" body:statusName];
}

-(void)locationManager:(CLLocationManager *)manager rangingBeaconsDidFailForRegion:(CLBeaconRegion *)region withError:(NSError *)error
{
  NSLog(@"Failed ranging region: %@", error);
}

-(void)locationManager:(CLLocationManager *)manager monitoringDidFailForRegion:(CLRegion *)region withError:(NSError *)error {
  NSLog(@"Failed monitoring region: %@", error);
}

-(void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
  NSLog(@"Location manager failed: %@", error);
}

-(NSString *)stringForState:(CLRegionState)state {
  switch (state) {
    case CLRegionStateInside:   return @"inside";
    case CLRegionStateOutside:  return @"outside";
    case CLRegionStateUnknown:  return @"unknown";
    default:                    return @"unknown";
  }
}

- (void) locationManager:(CLLocationManager *)manager didDetermineState:(CLRegionState)state forRegion:(CLRegion *)region
{
    NSDictionary *event = @{
                          @"state":   [self stringForState:state],
                          @"identifier":  region.identifier,
                          };

    [self sendEventWithName:@"didDetermineState" body:event];
}

-(void) locationManager:(CLLocationManager *)manager didRangeBeacons:
(NSArray *)beacons inRegion:(CLBeaconRegion *)region
{
  if (self.dropEmptyRanges && beacons.count == 0) {
    return;
  }
  NSMutableArray *beaconArray = [[NSMutableArray alloc] init];

  for (CLBeacon *beacon in beacons) {
    [beaconArray addObject:@{
                             @"uuid": [beacon.proximityUUID UUIDString],
                             @"major": beacon.major,
                             @"minor": beacon.minor,

                             @"rssi": [NSNumber numberWithLong:beacon.rssi],
                             @"proximity": [self stringForProximity: beacon.proximity],
                             @"accuracy": [NSNumber numberWithDouble: beacon.accuracy],
                             @"distance": [NSNumber numberWithDouble: beacon.accuracy],
                             }];
  }

  NSDictionary *event = @{
                          @"region": @{
                              @"identifier": region.identifier,
                              @"uuid": [region.proximityUUID UUIDString],
                              },
                          @"beacons": beaconArray
                          };

    [self sendEventWithName:@"beaconsDidRange" body:event];
}

-(void)locationManager:(CLLocationManager *)manager
        didEnterRegion:(CLBeaconRegion *)region {

  if (! [region respondsToSelector:@selector(proximityUUID)]) {
    return;
  }

  NSDictionary *event = [self convertBeaconRegionToDict: region];

  [self sendEventWithName:@"regionDidEnter" body:event];
}

-(void)locationManager:(CLLocationManager *)manager
         didExitRegion:(CLBeaconRegion *)region {

  if (! [region respondsToSelector:@selector(proximityUUID)]) {
    return;
  }

  NSDictionary *event = [self convertBeaconRegionToDict: region];

  [self sendEventWithName:@"regionDidExit" body:event];
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (void)beaconScanner:(ESSBeaconScanner *)scanner didRangeBeacon:(NSArray *)beacons {
    [self notifyAboutBeaconChanges:beacons];
}

- (void)notifyAboutBeaconChanges:(NSArray *)beacons {
    NSMutableArray *beaconArray = [[NSMutableArray alloc] init];
    
    for (id key in beacons) {
        ESSBeaconInfo *beacon = key;
        NSDictionary *info = [self getEddyStoneInfo:beacon];
        [beaconArray addObject:info];
    }
    NSDictionary *event = @{
                            @"region": @{
                                    @"identifier": kEddystoneRegionID,
                                    @"uuid": @"", // do not use for eddy stone
                                    },
                            @"beacons": beaconArray
                            };
    [self sendEventWithName:@"beaconsDidRange" body:event];
}

- (NSDictionary*)getEddyStoneInfo:(id)beaconInfo {
    ESSBeaconInfo *info = beaconInfo;
    NSNumber *distance = [self calculateDistance:info.txPower rssi:info.RSSI];
    NSString *identifier = [self getEddyStoneUUID:info.beaconID.beaconID];
    NSDictionary *beaconData = @{
                                 @"identifier": identifier,
                                 @"uuid": identifier,
                                 @"rssi": info.RSSI,
                                 @"txPower": info.txPower,
                                 @"distance": distance,
                                 };
    return beaconData;
}

- (NSNumber*)calculateDistance:(NSNumber*)txPower rssi:(NSNumber*) rssi {
    if ([rssi floatValue] >= 0){
        return [NSNumber numberWithInt:-1];
    }
    
    float ratio = [rssi floatValue] / ([txPower floatValue] - 41);
    if (ratio < 1.0) {
        return [NSNumber numberWithFloat:pow(ratio, 10)];
    }
    
    float distance = (0.89976) * pow(ratio, 7.7095) + 0.111;
    return [NSNumber numberWithFloat:distance];
}

- (NSString *)getEddyStoneUUID:(NSData*)data {
    const unsigned char *dataBuffer = (const unsigned char *)[data bytes];
    const int EDDYSTONE_UUID_LENGTH = 10;
    if (!dataBuffer) {
        return [NSString string];
    }
    
    NSMutableString *hexString  = [NSMutableString stringWithCapacity:(data.length * 2)];
    [hexString appendString:@"0x"];
    for (int i = 0; i < EDDYSTONE_UUID_LENGTH; ++i) {
        [hexString appendString:[NSString stringWithFormat:@"%02lx", (unsigned long)dataBuffer[i]]];
    }
    
    return [NSString stringWithString:hexString];
}

@end
