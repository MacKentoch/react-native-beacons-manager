/*
 * Radius Networks, Inc.
 * http://www.radiusnetworks.com
 *
 * @author David G. Young
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


#import "RNLBeaconTracker.h"
#import "RNLBeacon.h"
#import "RNLBeacon+Distance.h"

@implementation RNLBeaconTracker {
  NSMutableDictionary *_trackedBeaconDictionary;
}
static double const SECONDS_TO_TRACK = 5.0;

- (id)init {
  if (self = [super init]) {
    _trackedBeaconDictionary = [[NSMutableDictionary alloc] init];
  }
  return self;
}

-(NSArray *) trackedBeacons {
  // Adding synchronized becasue this method was getting EXC_BAD_ACCESS, perhaps on release of the
  // _trackedBeaconDictionary in the method below
  @synchronized(self) {
    return [_trackedBeaconDictionary allValues];
  }
}

-(void) updateWithRangedBeacons: (NSArray *) beacons {
  NSDate *now = [[NSDate alloc] init];
  NSMutableDictionary *newTrackedBeaconDictionary = [[NSMutableDictionary alloc] init];
  // add all newly ranged beacons to the newTrackedBeaconDictionary
  for (RNLBeacon *rangedBeacon in beacons) {
    NSString *rangedBeaconKey = [self identifierStringForBeacon:rangedBeacon];
    RNLBeacon *trackedRangedBeacon = [_trackedBeaconDictionary objectForKey:rangedBeaconKey];
    [rangedBeacon applyRssiMeasurements: trackedRangedBeacon];
    [newTrackedBeaconDictionary setObject: rangedBeacon forKey: rangedBeaconKey];
  }
  // now go through and find any beacons we did not get in this ranging cycle, but that should
  // still be tracked, and add them to the newTrackedBeaconDictionary
  for (NSString *beaconKey in [_trackedBeaconDictionary allKeys]) {
    if ([newTrackedBeaconDictionary objectForKey:beaconKey] == Nil) {
      RNLBeacon *oldTrackedBeacon = [_trackedBeaconDictionary objectForKey:beaconKey];
      // make sure we should still be tracking this beacon
      if ([now timeIntervalSinceDate: oldTrackedBeacon.lastDetected] < SECONDS_TO_TRACK) {
        [newTrackedBeaconDictionary setObject: oldTrackedBeacon forKey: beaconKey];
      }
      else {
        NSLog(@"Stopping tracking: %@ because we have not seen it in %f seconds", beaconKey, SECONDS_TO_TRACK);
      }
    }
  }
  @synchronized(self) {
    _trackedBeaconDictionary = newTrackedBeaconDictionary;
  }
}

-(NSString *) identifierStringForBeacon: (RNLBeacon *) beacon {
  return [NSString stringWithFormat:@"%@ %@ %@", beacon.id1, beacon.id2, beacon.id3];
}

@end
