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


#import "RNLBeaconParser.h"

@interface RNLBeaconParser()
@property (strong, nonatomic) NSNumber *matchingBeaconTypeCode;
@property (strong, nonatomic) NSMutableArray *identifierStartOffsets;
@property (strong, nonatomic) NSMutableArray *identifierEndOffsets;
@property (strong, nonatomic) NSMutableArray *identifierLittleEndianFlags;
@property (strong, nonatomic) NSMutableArray *dataStartOffsets;
@property (strong, nonatomic) NSMutableArray *dataEndOffsets;
@property (strong, nonatomic) NSMutableArray *dataLittleEndianFlags;
@property (strong, nonatomic) NSNumber *matchingBeaconTypeCodeStartOffset;
@property (strong, nonatomic) NSNumber *matchingBeaconTypeCodeEndOffset;
@property (strong, nonatomic) NSNumber *powerStartOffset;
@property (strong, nonatomic) NSNumber *powerEndOffset;
@property (strong, nonatomic) NSNumber *powerCorrection;
@property (strong, nonatomic) NSNumber *serviceUuidStartOffset;
@property (strong, nonatomic) NSNumber *serviceUuidEndOffset;
@property (strong, nonatomic) NSNumber *serviceUuid;
@end

@implementation RNLBeaconParser {
}

static const NSString *I_PATTERN = @"i\\:(\\d+)\\-(\\d+)([blv]*)?";
static const NSString *M_PATTERN = @"m\\:(\\d+)-(\\d+)\\=([0-9A-F-a-f]+)";
static const NSString *D_PATTERN = @"d\\:(\\d+)\\-(\\d+)([bl]*)?";
static const NSString *P_PATTERN = @"p\\:(\\d+)\\-(\\d+)\\:?([\\-\\d]+)?";
static const NSString *S_PATTERN = @"s\\:(\\d+)-(\\d+)\\=([0-9A-Fa-f]+)";
static const NSString *X_PATTERN = @"x";

/**
 * Makes a new BeaconParser.  Should normally be immediately followed by a call to #setLayout
 */
- (id)init {
  if (self = [super init]) {
    self.identifierStartOffsets = [[NSMutableArray alloc] init];
    self.identifierEndOffsets = [[NSMutableArray alloc] init];
    self.dataStartOffsets = [[NSMutableArray alloc] init];
    self.dataEndOffsets = [[NSMutableArray alloc] init];
    self.dataLittleEndianFlags = [[NSMutableArray alloc] init];
    self.identifierLittleEndianFlags = [[NSMutableArray alloc] init];
  }
  return self;
}

/**
 * <p>Defines a beacon field parsing algorithm based on a string designating the zero-indexed
 * offsets to bytes within a BLE advertisement.</p>
 *
 * <p>If you want to see examples of how other folks have set up BeaconParsers for different
 * kinds of beacons, try doing a Google search for "getBeaconParsers" (include the quotes in
 * the search.)</p>
 *
 * <p>Four prefixes are allowed in the string:</p>
 *
 * <pre>
 *   m - matching byte sequence for this beacon type to parse (exactly one required)
 *   i - identifier (at least one required, multiple allowed)
 *   p - power calibration field (exactly one required)
 *   d - data field (optional, multiple allowed)
 * </pre>
 *
 * <p>Each prefix is followed by a colon, then an inclusive decimal byte offset for the field from
 * the beginning of the advertisement.  In the case of the m prefix, an = sign follows the byte
 * offset, followed by a big endian hex representation of the bytes that must be matched for
 * this beacon type.  When multiple i or d entries exist in the string, they will be added in
 * order of definition to the identifier or data array for the beacon when parsing the beacon
 * advertisement.  Terms are separated by commas.</p>
 *
 * <p>All offsets from the start of the advertisement are relative to the first byte of the
 * two byte manufacturer code.  The manufacturer code is therefore always at position 0-1</p>
 *
 * <p>All data field and identifier expressions may be optionally suffixed with the letter l, which
 * indicates the field should be parsed as little endian.  If not present, the field will be presumed
 * to be big endian.
 *
 * <p>If the expression cannot be parsed, a <code>BeaconLayoutException</code> is thrown.</p>
 *
 * <p>Example of a parser string for AltBeacon:</p>
 *
 * </pre>
 *   "m:2-3=beac,i:4-19,i:20-21,i:22-23,p:24-24,d:25-25"
 * </pre>
 *
 * <p>This signifies that the beacon type will be decoded when an advertisement is found with
 * 0xbeac in bytes 2-3, and a three-part identifier will be pulled out of bytes 4-19, bytes
 * 20-21 and bytes 22-23, respectively.  A signed power calibration value will be pulled out of
 * byte 24, and a data field will be pulled out of byte 25.</p>
 *
 * Note: bytes 0-1 of the BLE manufacturer advertisements are the two byte manufacturer code.
 * Generally you should not match on these two bytes when using a BeaconParser, because it will
 * limit your parser to matching only a transmitter made by a specific manufacturer.  Software
 * and operating systems that scan for beacons typically ignore these two bytes, allowing beacon
 * manufacturers to use their own company code assigned by Bluetooth SIG.  The default parser
 * implementation will already pull out this company code and store it in the
 * beacon.manufacturer field.  Matcher expressions should therefore start with "m2-3:" followed
 * by the multi-byte hex value that signifies the beacon type.
 *
 */
-(BOOL) setBeaconLayout: (NSString *)beaconLayout error:(NSError **)errorPtr; {
  
  NSArray *terms =  [beaconLayout componentsSeparatedByString:@","];
  int errorCode = 0;
  NSString *errorString;
  
  for (NSString *term in terms) {
    Boolean found = NO;

    NSRange textRange = NSMakeRange(0, term.length);
    NSRegularExpression* regex = [NSRegularExpression regularExpressionWithPattern: (NSString *)I_PATTERN options:0 error:nil];
    NSArray* matches = [regex matchesInString:term options:0 range: textRange];
    for (NSTextCheckingResult* match in matches) {
      found = YES;
      NSString *group1 = [term substringWithRange:[match rangeAtIndex:1]];
      NSString *group2 = [term substringWithRange:[match rangeAtIndex:2]];
      NSString *group3 = [term substringWithRange:[match rangeAtIndex:3]];
      NSNumber *startOffset = [NSNumber numberWithLong:[group1 integerValue]];
      NSNumber *endOffset = [NSNumber numberWithLong:[group2 integerValue]];
      NSNumber *littleEndian = [NSNumber numberWithBool: [group3 isEqualToString:@"l"]];
      [self.identifierLittleEndianFlags addObject: littleEndian];
      [self.identifierStartOffsets addObject: startOffset];
      [self.identifierEndOffsets addObject: endOffset];
    }

    regex = [NSRegularExpression regularExpressionWithPattern: (NSString *)S_PATTERN options:0 error:nil];
    matches = [regex matchesInString:term options:0 range: textRange];
    for (NSTextCheckingResult* match in matches) {
      found = YES;
      NSString *group1 = [term substringWithRange:[match rangeAtIndex:1]];
      NSString *group2 = [term substringWithRange:[match rangeAtIndex:2]];
      NSString *group3 = [term substringWithRange:[match rangeAtIndex:3]];
      self.serviceUuidStartOffset = [NSNumber numberWithLong:[group1 integerValue]];
      self.serviceUuidEndOffset = [NSNumber numberWithLong:[group2 integerValue]];
      self.serviceUuid = [NSNumber numberWithLong:[group3 integerValue]];
    }
    
    regex = [NSRegularExpression regularExpressionWithPattern: (NSString *)D_PATTERN options:0 error:nil];
    matches = [regex matchesInString:term options:0 range: textRange];
    for (NSTextCheckingResult* match in matches) {
      found = YES;
      NSString *group1 = [term substringWithRange:[match rangeAtIndex:1]];
      NSString *group2 = [term substringWithRange:[match rangeAtIndex:2]];
      NSString *group3 = [term substringWithRange:[match rangeAtIndex:3]];
      NSNumber *startOffset = [NSNumber numberWithLong:[group1 integerValue]];
      NSNumber *endOffset = [NSNumber numberWithLong:[group2 integerValue]];
      NSNumber *littleEndian = [NSNumber numberWithBool: [group3 isEqualToString:@"l"]];
      [self.dataLittleEndianFlags addObject: littleEndian];
      [self.dataStartOffsets addObject: startOffset];
      [self.dataEndOffsets addObject: endOffset];
    }

    regex = [NSRegularExpression regularExpressionWithPattern: (NSString *)P_PATTERN options:0 error:nil];
    matches = [regex matchesInString:term options:0 range: textRange];
    for (NSTextCheckingResult* match in matches) {
      found = YES;
      NSString *group1 = [term substringWithRange:[match rangeAtIndex:1]];
      NSString *group2 = [term substringWithRange:[match rangeAtIndex:2]];
      NSRange correctionRange =[match rangeAtIndex:3];
      if (correctionRange.location != NSNotFound) {
        NSString *group3 = [term substringWithRange:correctionRange];
        self.powerCorrection = [NSNumber numberWithLong:[group3 integerValue]];
      }
      else {
        self.powerCorrection = @0;
      }
      self.powerStartOffset = [NSNumber numberWithLong:[group1 integerValue]];
      self.powerEndOffset = [NSNumber numberWithLong:[group2 integerValue]];
    }

    regex = [NSRegularExpression regularExpressionWithPattern: (NSString *)M_PATTERN options:0 error:nil];
    matches = [regex matchesInString:term options:0 range: textRange];
    for (NSTextCheckingResult* match in matches) {
      found = YES;
      NSString *group1 = [term substringWithRange:[match rangeAtIndex:1]];
      NSString *group2 = [term substringWithRange:[match rangeAtIndex:2]];
      NSString *group3 = [term substringWithRange:[match rangeAtIndex:3]];
      self.matchingBeaconTypeCodeStartOffset = [NSNumber numberWithLong:[group1 integerValue]];
      self.matchingBeaconTypeCodeEndOffset = [NSNumber numberWithLong:[group2 integerValue]];
      unsigned code = 0;
      NSScanner *scanner = [NSScanner scannerWithString:group3];
      [scanner scanHexInt:&code];
      self.matchingBeaconTypeCode = [NSNumber numberWithUnsignedInt:code];
    }
    if (!found) {
      NSLog(@"cannot parse term %@", term);
      errorCode = -1;
      errorString = NSLocalizedString(@"Cannot parse beacon layout term %@", term);
    }
  }
  if (self.powerStartOffset == Nil || self.powerEndOffset == Nil) {
    errorCode = -2;
    errorString = NSLocalizedString(@"You must supply a power byte offset with a prefix of 'p'", @"");
  }
  if (self.serviceUuid == Nil && (self.matchingBeaconTypeCodeStartOffset == Nil || self.matchingBeaconTypeCodeEndOffset == Nil)) {
    errorCode = -3;
    errorString = NSLocalizedString(@"You must supply a matching beacon type expression with a prefix of 'm', or a service uuid expression with a prefix of 's'", @"");
  }
  if (self.identifierStartOffsets.count == 0 || self.identifierEndOffsets.count == 0) {
    errorCode = -4;
    errorString = NSLocalizedString(@"You must supply at least one identifier offset withh a prefix of 'i'", @"");
  }
  if (errorPtr && errorCode < 0) {
    NSString *domain = @"org.altbeacon.beaconparser.ErrorDomain";
    NSDictionary *userInfo = @{ NSLocalizedDescriptionKey : errorString };
    
    *errorPtr = [NSError errorWithDomain:domain
                                    code:errorCode
                                userInfo:userInfo];
    return NO;
  }

  return YES;
}


/**
 * Construct a Beacon from a Bluetooth LE packet collected by Android's Bluetooth APIs,
 * including the raw bluetooth device info
 *
 * param scanData The actual packet bytes
 * param rssi The measured signal strength of the packet
 * param device The bluetooth device that was detected
 * returns An instance of a <code>Beacon</code>
 */
-(RNLBeacon *) fromScanData: (NSData *)scanData withRssi: (NSNumber *) rssi forDevice: (CBPeripheral *)device serviceUuid:(NSNumber *) serviceUuid {
  return [self fromScanData: scanData withRssi: rssi forDevice: device serviceUuid: serviceUuid withBeacon:[[RNLBeacon alloc] init]];
}

-(RNLBeacon *) fromScanData: (NSData *)scanData withRssi: (NSNumber *) rssi forDevice: (CBPeripheral *)device serviceUuid: (NSNumber *) serviceUuid withBeacon: (RNLBeacon *)beacon {
  
  BOOL patternFound = NO;
  const unsigned char *bytes = [scanData bytes];
  
  int beaconTypeCodeLength = [self.matchingBeaconTypeCodeEndOffset intValue]-[self.matchingBeaconTypeCodeStartOffset intValue]+1;
  long matchingBeaconTypeCodeLong = [self.matchingBeaconTypeCode longValue];
  unsigned char beaconTypeCodeBytes[4] = { 0, 0, 0, 0 };
  if (beaconTypeCodeLength > 4) {
    NSLog(@"beacon type code is specified to be too long");
    return Nil;
  }
  [self value: matchingBeaconTypeCodeLong toByteArray: beaconTypeCodeBytes withLength: beaconTypeCodeLength];
  
  int startByte = 0;
  if (serviceUuid != Nil) {
    startByte = -2; // serviceUuids are stripped out of the data on iOS, so we have to adjust offsets
  }
  if ([self biggestOffset] +1 > scanData.length - startByte) {
    //NSLog(@"Advertisement of length %ld is too short to match layout that ends on offset %d", scanData.length+startByte, [self biggestOffset]);
    return Nil;
  }
  
  if (scanData.length < startByte+beaconTypeCodeLength+[self.matchingBeaconTypeCodeStartOffset intValue]) {
    // advertisement is too small
  }
  else {
    if ([self byteArray: bytes+startByte+[self.matchingBeaconTypeCodeStartOffset intValue] matchesByteArray: beaconTypeCodeBytes withLength: beaconTypeCodeLength]) {
      patternFound = YES;
      //NSLog(@"matching type code found");
    }
    else {
      //NSLog(@"matching type code not found");
    }
  }
  
  if (patternFound == NO) {
    // This is not a beacon
    return Nil;
  }
  
  beacon.name = device.name;
  beacon.rssi = rssi;
  beacon.beaconTypeCode = self.matchingBeaconTypeCode;
  beacon.measuredPower = [NSNumber numberWithInt: 0];

  NSMutableArray *identifiers = [[NSMutableArray alloc] init];
  
  for (int i = 0; i < self.identifierEndOffsets.count; i++) {
    int startOffset = [[self.identifierStartOffsets objectAtIndex: i] intValue];
    int endOffset = [[self.identifierEndOffsets objectAtIndex: i] intValue];
    int length = endOffset - startOffset +1;
    BOOL littleEndian = [[self.identifierLittleEndianFlags objectAtIndex: i] boolValue];
    NSString *idString = [self formattedStringIdentiferFromByteArray: bytes+startOffset+startByte ofLength: length asLittleEndian:littleEndian];
    [identifiers addObject:idString];
  }
  beacon.identifiers = identifiers;
  
  int measuredPower = 0;
  int startOffset = [self.powerStartOffset intValue];
  int endOffset = [self.powerEndOffset intValue];
  int length = endOffset-startOffset +1;
  NSString *powerString = [self formattedStringIdentiferFromByteArray:bytes+startOffset+startByte ofLength:length asLittleEndian:NO];
  measuredPower = (int) [powerString integerValue];
  // make sure it is a signed integer
  if (measuredPower > 127) {
    measuredPower -= 256;
  }
  measuredPower += [self.powerCorrection integerValue];
  beacon.measuredPower = [NSNumber numberWithInt: measuredPower];
  
  
  NSMutableArray *dataFields = [[NSMutableArray alloc] init];
  for (int i = 0; i < self.dataEndOffsets.count; i++) {
    int startOffset = [[self.dataStartOffsets objectAtIndex: i] intValue];
    int endOffset = [[self.dataEndOffsets objectAtIndex: i] intValue];
    int length = endOffset - startOffset +1;
    BOOL littleEndian = [[self.dataLittleEndianFlags objectAtIndex: i] boolValue];
    NSString *idString = [self formattedStringIdentiferFromByteArray: bytes+startOffset+startByte ofLength: length asLittleEndian:littleEndian];
    [dataFields addObject:idString];
  }
  
  beacon.dataFields = dataFields;
  
  
  // We will not expose the bluetooth mac address because it gets spoofed on iOS and is of no value
  NSString *manufacturerString = [self formattedStringIdentiferFromByteArray:bytes ofLength:2 asLittleEndian:NO];
  beacon.manufacturer = [NSNumber numberWithLong: [manufacturerString integerValue]];

  return beacon;
}

- (void) value: (long) value toByteArray: (unsigned char *)bytes withLength: (int) length {
  for (int i = 0; i < length; i++) {
    bytes[length-i-1] = (value >> i*8) & 0xFF;
  }
}

-(NSString *) hexStringFromData: (NSData *) data {
  return [self hexStringFromBytes: [data bytes] ofLength: data.length withSpaces: YES];
}

-(NSString *) hexStringFromBytes: (const unsigned char *) bytes ofLength: (unsigned long) length withSpaces: (BOOL) addSpaces {
  NSString *str = @"";
  for (int i = 0; i < length; i++) {
    if (addSpaces) {
      str = [NSString stringWithFormat:@"%@ %02X", str, bytes[i]];
    }
    else {
      str = [NSString stringWithFormat:@"%@%02X", str, bytes[i]];
    }
  }
  return str;
}

-(BOOL) byteArray: (const unsigned char *)bytes1 matchesByteArray: (const unsigned char *) bytes2 withLength: (int) length {
  for (int i = 0; i < length; i++) {
    if (bytes1[i] != bytes2[i]) {
      return NO;
    }
  }
  return YES;
}

-(NSString *) formattedStringIdentiferFromByteArray: (const unsigned char *) byteArray ofLength: (int) length asLittleEndian: (BOOL) littleEndian {
  unsigned char* bytes = malloc(length * sizeof(unsigned char));
  NSString *formattedIdentifier = Nil;
    
  if (littleEndian) {
    for (int i = 0; i < length; i++) {
      bytes[i] = byteArray[length-1-i];
    }
  }
  else {
    for (int i = 0; i < length; i++) {
      bytes[i] = byteArray[i];
    }
  }
  
  // We treat a 1-4 byte number as decimal string
  if (length < 5) {
    long number = 0l;
    for (int i = 0; i < length; i++)  {
      long byteValue = (long) (bytes[length - i-1] & 0xff);
      long positionValue = 1 << i*8;
      long calculatedValue =  (long) (byteValue * positionValue);
      number += calculatedValue;
    }
    formattedIdentifier = [NSString stringWithFormat:@"%ld", number];
  }
  
  if (formattedIdentifier == Nil) {
    // We treat a 6+ byte number as a hex string
    NSString *hexString = [self hexStringFromBytes: bytes ofLength: length withSpaces: NO];
    // And if it is a 16 byte number we add dashes to it to make it look like a standard UUID
    if (length == 16) {
      NSMutableString *guid = [NSMutableString stringWithString: hexString];
      [guid insertString: @"-" atIndex: 8];
      [guid insertString: @"-" atIndex: 13];
      [guid insertString: @"-" atIndex: 18];
      [guid insertString: @"-" atIndex: 23];
      formattedIdentifier = guid;
    }
    else {
      formattedIdentifier = [NSString stringWithFormat:@"0x%@", hexString];
    }
  }
  
  free(bytes);
  return formattedIdentifier;
}

-(int) biggestOffset {
  int biggestOffset = [self.matchingBeaconTypeCodeEndOffset intValue];
  if ([self.powerEndOffset intValue] > biggestOffset) {
    biggestOffset = [self.powerEndOffset intValue];
  }
  for (NSNumber *identifierEndOffset in self.identifierEndOffsets) {
    if ([identifierEndOffset intValue] > biggestOffset) {
      biggestOffset = [identifierEndOffset intValue];
    }
  }
  for (NSNumber *dataEndOffset in self.dataEndOffsets) {
    if ([dataEndOffset intValue] > biggestOffset) {
      biggestOffset = [dataEndOffset intValue];
    }
  }
  return biggestOffset;
}

@end
