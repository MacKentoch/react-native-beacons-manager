
#import "RNEddystone.h"

@interface RNEddystone()

@property (strong, nonatomic) CBCentralManager *cbManager;
@property (strong, nonatomic) NSMutableArray *beaconParsers;

@end

@implementation RNEddystone

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}
RCT_EXPORT_MODULE()

- (instancetype)init
{
    if (self = [super init]) {
        dispatch_queue_t centralEventQueue = dispatch_queue_create("com.solinor.central_queue", DISPATCH_QUEUE_SERIAL);
        dispatch_set_target_queue(centralEventQueue, dispatch_get_main_queue());
        self.cbManager = [[CBCentralManager alloc] initWithDelegate:self queue:centralEventQueue];
        
        self.beaconParsers = [NSMutableArray array];
    }
    
    return self;
}

RCT_EXPORT_METHOD(detectEddystoneEID) {
    RNLBeaconParser *eidBeaconParser = [[RNLBeaconParser alloc] init];
    [eidBeaconParser setBeaconLayout:@"s:0-1=feaa,m:2-2=30,p:3-3:-41,i:4-11" error:nil];
    [self.beaconParsers addObject:eidBeaconParser];
}

RCT_EXPORT_METHOD(detectEddystoneUID) {
    RNLBeaconParser *uidBeaconParser = [[RNLBeaconParser alloc] init];
    [uidBeaconParser setBeaconLayout:@"s:0-1=feaa,m:2-2=00,p:3-3:-41,i:4-13,i:14-19" error:nil];
    [self.beaconParsers addObject:uidBeaconParser];
}

RCT_EXPORT_METHOD(detectEddystoneURL) {
    RNLBeaconParser *urlBeaconParser = [[RNLBeaconParser alloc] init];
    [urlBeaconParser setBeaconLayout:@"s:0-1=feaa,m:2-2=10,p:3-3:-41,i:4-20v" error:nil];
    [self.beaconParsers addObject:urlBeaconParser];
}

RCT_EXPORT_METHOD(startScanning) {
    if ([self.beaconParsers count] > 0 && self.cbManager.state == CBCentralManagerStatePoweredOn) {
        // A service needs to be specified for background scanning
        [self.cbManager scanForPeripheralsWithServices:@[[CBUUID UUIDWithString:@"FEAA"]] options:@{CBCentralManagerScanOptionAllowDuplicatesKey: @false}];
    }
}

RCT_EXPORT_METHOD(stopScanning) {
    [self.cbManager stopScan];
}

- (NSArray<NSString *> *)supportedEvents{
    return @[@"authorizationStatusDidChange", @"beaconsDidRange"];
}

#pragma mark - CBCentralManagerDelegate

- (void)centralManagerDidUpdateState:(nonnull CBCentralManager *)central {
    [self sendEventWithName:@"authorizationStatusDidChange" body:@"bluetooth status"];
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
        [self sendEventWithName:@"beaconsDidRange" body: @{@"id": beacon.id1, @"rssi": RSSI, @"power":beacon.measuredPower, @"type": [self determinBeaconType:beacon]}];
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

@end
  
