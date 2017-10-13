//
//  RNiBeacon.m
//  RNiBeacon
//
//  Created by MacKentoch on 17/02/2017.
//  Copyright © 2017 Erwan DATIN. All rights reserved.
//

#import <CoreLocation/CoreLocation.h>
#import <UserNotifications/UserNotifications.h>
#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTEventDispatcher.h>

#import "RNEddystone.h"
#import "RNiBeacon.h"

@interface RNiBeacon() <CLLocationManagerDelegate, CBCentralManagerDelegate>

@property (strong, nonatomic) CLLocationManager *locationManager;
@property (assign, nonatomic) BOOL dropEmptyRanges;

@property (strong, nonatomic) CBCentralManager *cbManager;
@property (strong, nonatomic) NSMutableArray *beaconParsers;

@end

@implementation RNiBeacon

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

#pragma mark Initialization

- (instancetype)init
{
  if (self = [super init]) {
    self.locationManager = [[CLLocationManager alloc] init];

    self.locationManager.delegate = self;
    self.locationManager.pausesLocationUpdatesAutomatically = NO;
    self.dropEmptyRanges = NO;
      
      dispatch_queue_t centralEventQueue = dispatch_queue_create("com.solinor.central_queue", DISPATCH_QUEUE_SERIAL);
      dispatch_set_target_queue(centralEventQueue, dispatch_get_main_queue());
      self.cbManager = [[CBCentralManager alloc] initWithDelegate:self queue:centralEventQueue];
      
      self.beaconParsers = [NSMutableArray array];
  }

  return self;
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

-(NSString *)stringForProximity:(CLProximity)proximity {
  switch (proximity) {
    case CLProximityUnknown:    return @"unknown";
    case CLProximityFar:        return @"far";
    case CLProximityNear:       return @"near";
    case CLProximityImmediate:  return @"immediate";
    default:                    return @"";
  }
}

RCT_EXPORT_METHOD(setupEddystoneEIDLayout) {
    RNLBeaconParser *eidBeaconParser = [[RNLBeaconParser alloc] init];
    [eidBeaconParser setBeaconLayout:@"s:0-1=feaa,m:2-2=30,p:3-3:-41,i:4-11" error:nil];
    [self.beaconParsers addObject:eidBeaconParser];
}

RCT_EXPORT_METHOD(setupEddystoneUIDLayout) {
    RNLBeaconParser *uidBeaconParser = [[RNLBeaconParser alloc] init];
    [uidBeaconParser setBeaconLayout:@"s:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19" error:nil];
    [self.beaconParsers addObject:uidBeaconParser];
}

RCT_EXPORT_METHOD(setupEddystoneURLLayout) {
    RNLBeaconParser *urlBeaconParser = [[RNLBeaconParser alloc] init];
    [urlBeaconParser setBeaconLayout:@"s:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-20v" error:nil];
    [self.beaconParsers addObject:urlBeaconParser];
}

RCT_EXPORT_METHOD(startScanningEddytone) {
    if ([self.beaconParsers count] > 0 && self.cbManager.state == CBCentralManagerStatePoweredOn) {
        // A service needs to be specified for background scanning
        [self.cbManager scanForPeripheralsWithServices:@[[CBUUID UUIDWithString:@"FEAA"]] options:@{CBCentralManagerScanOptionAllowDuplicatesKey: @false}];
    }
}

RCT_EXPORT_METHOD(stopScanningEddystone) {
    [self.cbManager stopScan];
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

RCT_EXPORT_METHOD(getAuthorizationStatus:(RCTResponseSenderBlock)callback)
{
  callback(@[[self nameForAuthorizationStatus:[CLLocationManager authorizationStatus]]]);
}

RCT_EXPORT_METHOD(startMonitoringForRegion:(NSDictionary *) dict)
{
  [self.locationManager startMonitoringForRegion:[self convertDictToBeaconRegion:dict]];
}

RCT_EXPORT_METHOD(startRangingBeaconsInRegion:(NSDictionary *) dict)
{
  [self.locationManager startRangingBeaconsInRegion:[self convertDictToBeaconRegion:dict]];
}

RCT_EXPORT_METHOD(stopMonitoringForRegion:(NSDictionary *) dict)
{
  [self.locationManager stopMonitoringForRegion:[self convertDictToBeaconRegion:dict]];
}

RCT_EXPORT_METHOD(stopRangingBeaconsInRegion:(NSDictionary *) dict)
{
  [self.locationManager stopRangingBeaconsInRegion:[self convertDictToBeaconRegion:dict]];
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
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"authorizationStatusDidChange" body:statusName];
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
                             @"accuracy": [NSNumber numberWithDouble: beacon.accuracy]
                             }];
  }

  NSDictionary *event = @{
                          @"region": @{
                              @"identifier": region.identifier,
                              @"uuid": [region.proximityUUID UUIDString],
                              },
                          @"beacons": beaconArray
                          };

  [self.bridge.eventDispatcher sendDeviceEventWithName:@"beaconsDidRange" body:event];
}

-(void)locationManager:(CLLocationManager *)manager
        didEnterRegion:(CLBeaconRegion *)region {
    [self createLocalNotificationForMonitorEvents:@"Enter Reigion"];
    NSDictionary *event = @{
                          @"identifier": region.identifier,
                          @"uuid": [region.proximityUUID UUIDString],
                          };
    [self.bridge.eventDispatcher sendDeviceEventWithName:@"regionDidEnter" body:event];
    
    __block UIBackgroundTaskIdentifier bgTask = UIBackgroundTaskInvalid;
    bgTask = [[UIApplication sharedApplication] beginBackgroundTaskWithName:@"MyTask" expirationHandler:^{
        [[UIApplication sharedApplication] endBackgroundTask:bgTask];
        bgTask = UIBackgroundTaskInvalid;
    }];
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        while(true) {
            dispatch_async(dispatch_get_main_queue(), ^{
                if ([[UIApplication sharedApplication] backgroundTimeRemaining] < 10) {
                    [self createLocalNotificationForMonitorEvents:@"Time up!"];
                    [self.bridge.eventDispatcher sendDeviceEventWithName:@"backgroundTimeup" body:@"backgroundTimeup"];
                    [[UIApplication sharedApplication] endBackgroundTask:bgTask];
                    bgTask = UIBackgroundTaskInvalid;                }
            });
            sleep(10);
        }
    });
}

-(void)locationManager:(CLLocationManager *)manager
         didExitRegion:(CLBeaconRegion *)region {
    [self createLocalNotificationForMonitorEvents:@"Exit Reigion"];
  NSDictionary *event = @{
                          @"identifier": region.identifier,
                          @"uuid": [region.proximityUUID UUIDString],
                          };
  [self.bridge.eventDispatcher sendDeviceEventWithName:@"regionDidExit" body:event];
}

#pragma mark - CBCentralManagerDelegate

- (void)centralManagerDidUpdateState:(nonnull CBCentralManager *)central {
}

- (void)centralManager:(CBCentralManager *)central didDiscoverPeripheral:(CBPeripheral *)peripheral advertisementData:(NSDictionary<NSString *,id> *)advertisementData RSSI:(NSNumber *)RSSI {
    NSDictionary *serviceData = advertisementData[@"kCBAdvDataServiceData"];
    
    RNLBeacon *beacon = Nil;
    NSData *adData = advertisementData[@"kCBAdvDataManufacturerData"];
    
    for (RNLBeaconParser *beaconParser in self.beaconParsers) {
        if (adData) {
            beacon = [beaconParser fromScanData: adData withRssi: RSSI forDevice: peripheral serviceUuid: Nil];
        }
        else if (serviceData != Nil) {
            for (NSObject *key in serviceData.allKeys) {
                NSString *uuidString = [(CBUUID *) key UUIDString];
                NSScanner* scanner = [NSScanner scannerWithString: uuidString];
                unsigned long long uuidLongLong;
                
                [scanner scanHexLongLong: &uuidLongLong];
                NSNumber *uuidNumber = [NSNumber numberWithLongLong:uuidLongLong];
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
        [self.bridge.eventDispatcher sendDeviceEventWithName:@"eddystoneDidRange" body: @{@"id": beacon.id1, @"rssi": RSSI, @"power":beacon.measuredPower, @"type": [self determinBeaconType:beacon]}];
    }
}

#pragma mark - helper

- (NSString*)determinBeaconType: (RNLBeacon*)beacon {
    switch (beacon.beaconTypeCode.intValue) {
        case 0x00:
            return @"Eddystone_UID";
            break;
        case 0x30:
            return @"Eddystone_EID";
            break;
        case 0x10:
            return @"Eddystone_URL";
            break;
        default:
            return nil;
            break;
    }
}

// Test
- (void)createLocalNotificationForMonitorEvents:(NSString *) notificationText {
    UNMutableNotificationContent* content = [[UNMutableNotificationContent alloc] init];
    content.title = [NSString localizedUserNotificationStringForKey:@"Hello!" arguments:nil];
    content.body = [NSString localizedUserNotificationStringForKey:notificationText
                                                         arguments:nil];
    content.sound = [UNNotificationSound defaultSound];
    UNNotificationRequest* request = [UNNotificationRequest requestWithIdentifier:@"Monitoring" content:content trigger:nil];
    [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request withCompletionHandler:nil];
}


@end
