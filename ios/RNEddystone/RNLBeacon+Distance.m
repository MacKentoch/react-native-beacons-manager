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


#import "RNLBeacon+Distance.h"
#import <objc/runtime.h>
#import "RNLBeaconScanner.h"

@implementation RNLBeacon (Distance)

static double _secondsToAverage = 5.0;

@dynamic lastDetected;
@dynamic lastCalculated;
@dynamic signalMeasurements;
@dynamic runningAverageRssi;

- (void)setLastDetected:(NSDate *)date {
  objc_setAssociatedObject(self, @selector(lastDetected), date, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)lastDetected {
  return objc_getAssociatedObject(self, @selector(lastDetected));
}

- (void)setLastCalculated:(NSDate *)date {
  objc_setAssociatedObject(self, @selector(lastCalculated), date, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)lastCalculated {
  return objc_getAssociatedObject(self, @selector(lastCalculated));
}

- (void)setSignalMeasurements:(NSMutableArray *)array {
  objc_setAssociatedObject(self, @selector(signalMeasurements), array, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)signalMeasurements {
  return objc_getAssociatedObject(self, @selector(signalMeasurements));
}

- (void)setRunningAverageRssi:(NSNumber *)rssi {
  objc_setAssociatedObject(self, @selector(runningAverageRssi), rssi, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (id)runningAverageRssi {
  return objc_getAssociatedObject(self, @selector(runningAverageRssi));
}

-(void) applyRssiMeasurements:(RNLBeacon *)beacon{
  if (self.signalMeasurements == nil) {
    self.signalMeasurements = [[NSMutableArray alloc] init];
  }
  if (beacon == nil) {
    self.lastCalculated = [NSDate dateWithTimeIntervalSince1970:0l]; // Not since 1970 = never
    self.runningAverageRssi = [NSNumber numberWithDouble:(0.0)];
  }
  else {
    for (RNLSignalMeasurement *measurement in beacon.signalMeasurements) {
      [self.signalMeasurements addObject: measurement];
    }
  }
  [self addCurrentRssiMeasurement];
  [self recalculate];
}

-(void) addCurrentRssiMeasurement {
  NSDate *now = [[NSDate alloc] init];
  self.lastDetected = now;
  // ingnore invalid measurements that aren't negative
  if ([self.rssi doubleValue] >= 0.0) {
    return;
  }
  RNLSignalMeasurement *measurement = [[RNLSignalMeasurement alloc] init];
  measurement.rssi = self.rssi;
  measurement.timestamp = now;
  [self.signalMeasurements addObject: measurement];
}

-(void) recalculate {
  NSDate *now = [[NSDate alloc] init];
  double sum = 0.0;
  
  // remove any expired measurements
  NSMutableArray *newArray = [[NSMutableArray alloc] init];
  for (RNLSignalMeasurement *signalMeasurement in self.signalMeasurements) {
    if ([now timeIntervalSinceDate: signalMeasurement.timestamp] <= _secondsToAverage) {
      [newArray addObject: signalMeasurement];
      sum += [signalMeasurement.rssi doubleValue];
    }
  }
  if (newArray.count > 0) {
    self.runningAverageRssi = [NSNumber numberWithDouble:(sum / newArray.count)];
  }
  else {
    self.runningAverageRssi = [NSNumber numberWithDouble:(0.0)];
  }
  self.signalMeasurements = newArray;
}

+(double) secondsToAverage {
  return _secondsToAverage;
}

+(void) secondsToAverage: (double) seconds {
  _secondsToAverage = seconds;
}

-(CLLocationAccuracy) distance {
  double distance; // value to return

  NSNumber *measuredPower = self.measuredPower;
  if (measuredPower == Nil) {
    measuredPower = [[RNLBeaconScanner sharedBeaconScanner] calibratedRSSIFor:self];
  }
  if (measuredPower) {
    NSNumber *rssi = self.runningAverageRssi;
    distance = [RNLBeacon distanceForRSSI:[rssi doubleValue] forPower:[measuredPower intValue]];
  }
  else {
    distance = -1.0;
  }
  return distance;
}

+(double) distanceForRSSI:(double)rssi forPower:(int)txPower {
  // use coefficient values from spreadsheet for iPhone 4S
  double coefficient1 = 2.922026; // multiplier
  double coefficient2 = 6.672908; // power
  double coefficient3 = -1.767203; // intercept
  
  if (rssi == 0) {
    return -1.0; // if we cannot determine accuracy, return -1.0
  }
  
  double ratio = rssi*1.0/txPower;
  double distance;
  
  if (ratio < 1.0) {
    distance =  pow(ratio,10);
  }
  else {
    distance =  (coefficient1)*pow(ratio,coefficient2) + coefficient3;
  }
  
  if (distance < 0.1) {
    NSLog(@"Low distance");
  }
  
  return distance;
}

@end
