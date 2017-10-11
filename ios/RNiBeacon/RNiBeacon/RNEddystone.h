
#if __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#else
#import <React/RCTBridgeModule.h>
#endif

#if __has_include("RCTBridgeModule.h")
#import "RCTEventEmitter.h"
#else
#import <React/RCTEventEmitter.h>
#endif

#import <CoreBluetooth/CoreBluetooth.h>

#import "RNLBeacon.h"
#import "RNLBeaconParser.h"

@interface RNEddystone : RCTEventEmitter <RCTBridgeModule, CBCentralManagerDelegate>

- (void)setupEddystoneEIDLayout;
- (void)startScanningEddytone;

@end
  
