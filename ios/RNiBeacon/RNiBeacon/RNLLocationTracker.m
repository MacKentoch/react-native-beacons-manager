/*
 * Radius Networks, Inc.
 * http://www.radiusnetworks.com
 *
 * @author James Nebeker
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


#import "RNLLocationTracker.h"
#import "RNLBeaconTracker.h"
#import "RNLBeacon+Distance.h"
#import "RNLBeaconScanner.h"

@implementation RNLLocationTracker {
  NSDate *_timestampClosestBeaconFirstSeen; // class variable for timestamp
  NSDate *_timestampClosestBeaconLastSeen;
  NSDate *_timestampClosestBeaconCandidateLastSeen;
  RNLBeacon *_closestBeacon;
  RNLBeacon *_closestBeaconCandidate;
}
static RNLLocationTracker *sharedLocationTracker = nil; // static instance variable

+ (RNLLocationTracker *)sharedLocationTracker {
  if (sharedLocationTracker == nil) {
    sharedLocationTracker = [[super alloc] init];
  }
  return sharedLocationTracker;
}
static double const MIN_SECS_BEFORE_CLOSEST_BEACON_SWITCH = 5.0;

- (id)init {
  if (self = [super init]) {
    //[self registerForPKNotifications];
    self.beaconTracker = [[RNLBeaconTracker alloc] init];
    self.useCoreLocationRanging = YES;
    [RNLBeaconScanner sharedBeaconScanner]; // simply referncing it will make it spin up
  }
  return self;
}

- (void)dealloc {
  //[self unregisterForPKNotifications];
}


- (RNLBeacon *) closestBeacon {
  [self closestBeaconTimeout];
  return _closestBeacon;
}

- (void) closestBeaconTimeout {
  // clear closest beacon if it hasn't been seen in the last five seconds
  if (_timestampClosestBeaconLastSeen != nil && [_timestampClosestBeaconLastSeen timeIntervalSinceNow] < -5.0) {
    NSLog(@"Closest beacon timeout has expired, setting to nil");
    _timestampClosestBeaconLastSeen = nil;
    _closestBeacon = Nil;
  }
  if (_timestampClosestBeaconCandidateLastSeen != nil && [_timestampClosestBeaconCandidateLastSeen timeIntervalSinceNow] < -5.0) {
    NSLog(@"Closest beacon candidate timeout has expired, setting to nil");
    _timestampClosestBeaconCandidateLastSeen = nil;
    _closestBeaconCandidate = Nil;
  }
}

- (void)didRangeBeaconsInRegion:(NSArray *) beacons {
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    [self.beaconTracker updateWithRangedBeacons: beacons];
    for (RNLBeacon *trackedBeacon in self.beaconTracker.trackedBeacons) {
      double distance = trackedBeacon.coreLocationAccuracy;
      if (trackedBeacon.beaconObject != Nil && [trackedBeacon.beaconObject isKindOfClass:[CLBeacon class]]) {
        distance = ((CLBeacon *)trackedBeacon).accuracy;
      }
      double candidateDistance = _closestBeaconCandidate.coreLocationAccuracy;
      if (!self.useCoreLocationRanging) {
        // Check to see if the distance value is valid (i.e., not -1.0)
        if (trackedBeacon.distance >= 0.0) {
          distance = trackedBeacon.distance;
        }
        if (_closestBeaconCandidate.distance >= 0.0) {
          candidateDistance = _closestBeaconCandidate.distance;
        }
      }
      BOOL customDistance = false;
    if (trackedBeacon.distance != -1.0) {
      customDistance = true;
    }
      if (_closestBeaconCandidate == nil || candidateDistance > distance) {
        if (distance > 0) {
          _closestBeaconCandidate = trackedBeacon;
          _timestampClosestBeaconCandidateLastSeen = [NSDate date];
        }
      }
      if ([trackedBeacon isEqual:_closestBeacon]) {
        _timestampClosestBeaconLastSeen = [NSDate date];  // set timestamp to now
      }
    }

    // pick the closest beacon with a hallId that is not Nil
    if (_closestBeaconCandidate != nil) {
      if (_closestBeacon == nil) {
        _closestBeacon = _closestBeaconCandidate;
        _timestampClosestBeaconFirstSeen = [NSDate date];  // set timestamp to now
        _timestampClosestBeaconLastSeen = _timestampClosestBeaconFirstSeen;
        NSLog(@"Closest beacon (id: %@) so far with accuracy: %f at time: %@", _closestBeaconCandidate.id3, _closestBeaconCandidate.coreLocationAccuracy, _timestampClosestBeaconFirstSeen);
      }
      else {
        if ([_timestampClosestBeaconFirstSeen timeIntervalSinceNow] < -MIN_SECS_BEFORE_CLOSEST_BEACON_SWITCH) {
          _closestBeacon = _closestBeaconCandidate;
          _timestampClosestBeaconFirstSeen = [NSDate date];  // set timestamp to now
          _timestampClosestBeaconLastSeen = _timestampClosestBeaconFirstSeen;
          NSLog(@"Closest beacon (id: %@) so far found with accuracy: %f at time: %@", _closestBeaconCandidate.id3, _closestBeaconCandidate.coreLocationAccuracy, _timestampClosestBeaconFirstSeen);
        }
      }
    }
    // check if the current closest beacon has expired
    [self closestBeaconTimeout];
  });
}

@end
