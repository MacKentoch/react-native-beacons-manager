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


#import "RNLBeacon.h"
#import <CoreLocation/CoreLocation.h>

@implementation RNLBeacon
-(NSString *) id1 {
  NSString *id = Nil;
  if (self.identifiers.count > 0) {
    id = [self.identifiers objectAtIndex:0];
  }
  return id;
}
-(NSString *) id2 {
  NSString *id = Nil;
  if (self.identifiers.count > 1) {
    id = [self.identifiers objectAtIndex:1];
  }
  return id;
}
-(NSString *) id3 {
  NSString *id = Nil;
  if (self.identifiers.count > 2) {
    id = [self.identifiers objectAtIndex:2];
  }
  return id;
}

-(double) coreLocationAccuracy {
  if (self.beaconObject != Nil && [self.beaconObject isKindOfClass:[CLBeacon class]]) {
    return ((CLBeacon *)self.beaconObject).accuracy;
  }
  return -1.0;
}

@end
