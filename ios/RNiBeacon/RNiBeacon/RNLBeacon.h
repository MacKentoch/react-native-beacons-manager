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


#import <Foundation/Foundation.h>

@interface RNLBeacon : NSObject
@property (strong, nonatomic) NSArray *identifiers;
@property (strong, nonatomic) NSArray *dataFields;
@property (strong, nonatomic) NSNumber *measuredPower;
@property (strong, nonatomic) NSNumber *rssi;
@property (strong, nonatomic) NSNumber *beaconTypeCode;
// This is the two byte manuracturer code, e.g. 0x0118 for Radius Networks
// Only populated for manufacturer beacon types
@property (strong, nonatomic) NSNumber *manufacturer;
// This is the bluetooth device name transmitted in the scan response
@property (strong, nonatomic) NSString *name;
// The Bluetooth Service UUID.  Only populated for service beacon types
@property (strong, nonatomic) NSNumber *serviceUuid;
@property (strong, nonatomic) id beaconObject;
@property (readonly) NSString *id1;
@property (readonly) NSString *id2;
@property (readonly) NSString *id3;
@property (readonly) double coreLocationAccuracy;

@end
