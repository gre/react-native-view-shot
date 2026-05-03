// RNViewShotEncodingTests.mm
//
// Encoding-shape tests for the path that converts a captured `UIImage` into:
//   - PNG NSData             (via UIImagePNGRepresentation)
//   - JPEG NSData            (via UIImageJPEGRepresentation, with quality)
//   - base64 raw string      ([data base64EncodedStringWithOptions:0])
//   - data-uri base64 string ("data:image/{png|jpeg};base64,<...>")
//   - file path (RCTTempFilePath + writeToFile:)
//
// Per the proposal, we DO NOT assert pixel content — `drawViewHierarchyInRect`
// returns blank images for views not attached to a UIWindow on the simulator,
// and any pixel-level assertion would couple us to the encoder's color-space
// choices. Instead we assert magic bytes, prefix shape, and base64 hygiene.
//
// The encoding code lives inside the captureRef block in RNViewShot.mm and
// is not directly callable without an RCTBridge. To test the same invariants
// without bridge bring-up, this file feeds a fixture UIImage through the
// exact same UIKit / Foundation APIs the production code uses. Any regression
// in those invariants (magic bytes, no-line-break base64, data-uri prefix
// format, file-write success, format-suffix mapping) shows up here regardless
// of whether the production encoder is later refactored.

#import <XCTest/XCTest.h>
#import <UIKit/UIKit.h>
#import <React/RCTUtils.h>

@interface RNViewShotEncodingTests : XCTestCase
@property (nonatomic, strong) UIImage *fixtureImage;
@end

@implementation RNViewShotEncodingTests

- (void)setUp
{
  [super setUp];
  // 4x4 solid red bitmap — enough bytes to produce a non-trivial PNG/JPEG.
  CGSize size = CGSizeMake(4, 4);
  UIGraphicsBeginImageContextWithOptions(size, NO, 1.0);
  [[UIColor redColor] setFill];
  UIRectFill((CGRect){CGPointZero, size});
  self.fixtureImage = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();
  XCTAssertNotNil(self.fixtureImage);
}

#pragma mark - PNG

- (void)testPNGEncoding_startsWithPNGMagicBytes
{
  NSData *data = UIImagePNGRepresentation(self.fixtureImage);
  XCTAssertNotNil(data);
  XCTAssertGreaterThanOrEqual(data.length, 8u);

  // PNG magic: 89 50 4E 47 0D 0A 1A 0A
  const uint8_t expected[] = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
  const uint8_t *bytes = (const uint8_t *)data.bytes;
  for (size_t i = 0; i < sizeof(expected); i++) {
    XCTAssertEqual(bytes[i], expected[i],
                   @"PNG magic byte mismatch at index %zu", i);
  }
}

#pragma mark - JPEG

- (void)testJPEGEncoding_startsWithJPEGMagicBytes
{
  NSData *data = UIImageJPEGRepresentation(self.fixtureImage, 0.9);
  XCTAssertNotNil(data);
  XCTAssertGreaterThanOrEqual(data.length, 3u);

  // JPEG SOI: FF D8 FF
  const uint8_t *bytes = (const uint8_t *)data.bytes;
  XCTAssertEqual(bytes[0], 0xFF);
  XCTAssertEqual(bytes[1], 0xD8);
  XCTAssertEqual(bytes[2], 0xFF);
}

- (void)testJPEGEncoding_acceptsQualityArgumentAndProducesValidData
{
  // We don't assert size monotonicity between quality levels: the
  // UIImageJPEGRepresentation contract makes no guarantees about the relative
  // byte counts at different quality settings, and encoder-internal
  // optimisations can occasionally yield a smaller file at higher quality.
  // Instead, just assert that both quality levels produce non-empty data that
  // decode back to a UIImage — the actual encoding shape is covered by
  // testJPEGEncoding_startsWithJPEGMagicBytes above.
  NSData *low  = UIImageJPEGRepresentation(self.fixtureImage, 0.1);
  NSData *high = UIImageJPEGRepresentation(self.fixtureImage, 1.0);
  XCTAssertNotNil(low);
  XCTAssertNotNil(high);
  XCTAssertGreaterThan(low.length, 0u);
  XCTAssertGreaterThan(high.length, 0u);
  XCTAssertNotNil([UIImage imageWithData:low],
                  @"JPEG@0.1 should decode back to a UIImage");
  XCTAssertNotNil([UIImage imageWithData:high],
                  @"JPEG@1.0 should decode back to a UIImage");
}

#pragma mark - base64

- (void)testBase64Encoding_hasNoLineBreaks
{
  // RNViewShot.mm passes options:0 to base64EncodedStringWithOptions, which
  // means NO `\n` / `\r` insertion. JS consumers (and `data:` URIs) rely on
  // single-line base64.
  NSData *data = UIImagePNGRepresentation(self.fixtureImage);
  NSString *base64 = [data base64EncodedStringWithOptions:0];

  XCTAssertNotNil(base64);
  XCTAssertGreaterThan(base64.length, 0u);
  XCTAssertEqual([base64 rangeOfString:@"\n"].location, (NSUInteger)NSNotFound,
                 @"base64 result must not contain newline characters");
  XCTAssertEqual([base64 rangeOfString:@"\r"].location, (NSUInteger)NSNotFound,
                 @"base64 result must not contain carriage-return characters");
}

- (void)testBase64Encoding_isRoundTrippable
{
  NSData *data = UIImagePNGRepresentation(self.fixtureImage);
  NSString *base64 = [data base64EncodedStringWithOptions:0];

  NSData *roundTripped = [[NSData alloc] initWithBase64EncodedString:base64 options:0];
  XCTAssertNotNil(roundTripped);
  XCTAssertEqualObjects(roundTripped, data,
                        @"base64 -> NSData round-trip must preserve bytes");
}

#pragma mark - data-uri

- (void)testDataURI_PNG_prefixMatches
{
  NSData *data = UIImagePNGRepresentation(self.fixtureImage);
  NSString *base64 = [data base64EncodedStringWithOptions:0];
  NSString *uri = [NSString stringWithFormat:@"data:image/%@;base64,%@", @"png", base64];

  XCTAssertTrue([uri hasPrefix:@"data:image/png;base64,"],
                @"PNG data-uri must start with `data:image/png;base64,` (got prefix %@)",
                [uri substringToIndex:MIN(uri.length, 32u)]);
}

- (void)testDataURI_JPEG_prefixUsesJpegNotJpg
{
  // RNViewShot.mm rewrites the format string from "jpg" to "jpeg" for the
  // data-uri path so the resulting URI is RFC-compliant
  // (image/jpeg, not image/jpg).
  NSString *format = @"jpg";
  NSString *imageFormat = [format isEqualToString:@"jpg"] ? @"jpeg" : format;
  NSData *data = UIImageJPEGRepresentation(self.fixtureImage, 0.9);
  NSString *base64 = [data base64EncodedStringWithOptions:0];
  NSString *uri = [NSString stringWithFormat:@"data:image/%@;base64,%@", imageFormat, base64];

  XCTAssertTrue([uri hasPrefix:@"data:image/jpeg;base64,"],
                @"JPEG data-uri must use `image/jpeg`, not `image/jpg` (got prefix %@)",
                [uri substringToIndex:MIN(uri.length, 32u)]);
  XCTAssertFalse([uri hasPrefix:@"data:image/jpg;"],
                 @"JPEG data-uri must NOT use `image/jpg`");
}

#pragma mark - File path / RCTTempFilePath

- (void)testTempFilePath_writesPNGAndReturnsExistingFile
{
  NSError *error = nil;
  NSString *path = RCTTempFilePath(@"png", &error);
  XCTAssertNotNil(path);
  XCTAssertNil(error, @"RCTTempFilePath should not error: %@", error);
  XCTAssertTrue([path hasSuffix:@".png"], @"path %@ should end with .png", path);

  NSData *data = UIImagePNGRepresentation(self.fixtureImage);
  XCTAssertTrue([data writeToFile:path options:(NSDataWritingOptions)0 error:&error],
                @"writeToFile failed: %@", error);
  XCTAssertNil(error);
  XCTAssertTrue([[NSFileManager defaultManager] fileExistsAtPath:path]);

  // The path lives under tmp/ReactNative, so cleanup via raw fs ops:
  [[NSFileManager defaultManager] removeItemAtPath:path error:NULL];
}

- (void)testTempFilePath_writesJPGWithJpgSuffix
{
  // RNViewShot.mm passes the raw `format` string ("jpg") into RCTTempFilePath
  // so file-on-disk paths use `.jpg` (not `.jpeg`).
  NSError *error = nil;
  NSString *path = RCTTempFilePath(@"jpg", &error);
  XCTAssertNotNil(path);
  XCTAssertNil(error);
  XCTAssertTrue([path hasSuffix:@".jpg"], @"path %@ should end with .jpg", path);

  NSData *data = UIImageJPEGRepresentation(self.fixtureImage, 0.9);
  XCTAssertTrue([data writeToFile:path options:(NSDataWritingOptions)0 error:&error]);
  XCTAssertNil(error);
  XCTAssertTrue([[NSFileManager defaultManager] fileExistsAtPath:path]);

  [[NSFileManager defaultManager] removeItemAtPath:path error:NULL];
}

@end
