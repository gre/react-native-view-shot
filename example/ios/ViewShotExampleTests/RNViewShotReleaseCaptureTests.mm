// RNViewShotReleaseCaptureTests.mm
//
// Unit tests for the `releaseCapture` tmp-path guard in RNViewShot.mm.
//
// `releaseCapture` only deletes files inside `NSTemporaryDirectory()/ReactNative`.
// Files outside that directory must be left alone, even if they exist.
//
// These tests do not require an RCTBridge — `releaseCapture` is a synchronous
// Obj-C method that only touches NSFileManager and NSString prefix logic.

#import <XCTest/XCTest.h>
#import "RNViewShot.h"

// `releaseCapture:` is exposed to React Native via RCT_EXPORT_METHOD in
// RNViewShot.mm but is not declared in RNViewShot.h. Declare a private
// category here so the test file can call it without triggering an
// "instance method may not respond to selector" warning. This is
// test-only and does not change the public surface of the module.
@interface RNViewShot (TestingOnly)
- (void)releaseCapture:(nonnull NSString *)uri;
@end

@interface RNViewShotReleaseCaptureTests : XCTestCase
@property (nonatomic, strong) RNViewShot *module;
@property (nonatomic, strong) NSFileManager *fm;
@property (nonatomic, copy) NSString *reactNativeTmpDir;
@end

@implementation RNViewShotReleaseCaptureTests

- (void)setUp
{
  [super setUp];
  self.module = [RNViewShot new];
  self.fm = [NSFileManager defaultManager];
  self.reactNativeTmpDir = [NSTemporaryDirectory() stringByAppendingPathComponent:@"ReactNative"];

  // Make sure the ReactNative tmp directory exists for tests that need it.
  // Use `withIntermediateDirectories:YES` so the call is idempotent and assert
  // success outright — `success || error == nil` would pass when the call
  // returns NO without populating the error pointer, which is exactly the
  // silent-failure path we want to catch.
  NSError *error = nil;
  BOOL success = [self.fm createDirectoryAtPath:self.reactNativeTmpDir
                    withIntermediateDirectories:YES
                                     attributes:nil
                                          error:&error];
  XCTAssertTrue(success,
                @"createDirectory failed for %@: %@", self.reactNativeTmpDir, error);
}

- (NSString *)writeFixtureFileAtPath:(NSString *)path
{
  NSData *payload = [@"viewshot-test" dataUsingEncoding:NSUTF8StringEncoding];
  // Make sure parent directory exists.
  NSString *parent = [path stringByDeletingLastPathComponent];
  [self.fm createDirectoryAtPath:parent
     withIntermediateDirectories:YES
                      attributes:nil
                           error:NULL];
  XCTAssertTrue([payload writeToFile:path atomically:YES],
                @"failed to seed fixture file at %@", path);
  return path;
}

#pragma mark - Tests

- (void)testReleaseCapture_deletesFileInsideReactNativeTmpDir
{
  NSString *fixturePath = [self.reactNativeTmpDir
                           stringByAppendingPathComponent:@"vs-release-inside.png"];
  [self writeFixtureFileAtPath:fixturePath];
  XCTAssertTrue([self.fm fileExistsAtPath:fixturePath]);

  [self.module releaseCapture:fixturePath];

  XCTAssertFalse([self.fm fileExistsAtPath:fixturePath],
                 @"releaseCapture should remove files inside %@", self.reactNativeTmpDir);
}

- (void)testReleaseCapture_leavesFileOutsideReactNativeTmpDirAlone
{
  // A path that lives in NSTemporaryDirectory() but NOT in the ReactNative subdir.
  NSString *outsidePath = [NSTemporaryDirectory()
                           stringByAppendingPathComponent:@"vs-release-outside.png"];
  [self writeFixtureFileAtPath:outsidePath];
  XCTAssertTrue([self.fm fileExistsAtPath:outsidePath]);

  [self.module releaseCapture:outsidePath];

  XCTAssertTrue([self.fm fileExistsAtPath:outsidePath],
                @"releaseCapture must NOT touch files outside %@", self.reactNativeTmpDir);

  // Cleanup so we don't leave junk on the simulator/host.
  [self.fm removeItemAtPath:outsidePath error:NULL];
}

- (void)testReleaseCapture_refusesToDeleteTheReactNativeDirectoryItself
{
  // Passing exactly the tmp/ReactNative path must not delete the directory.
  XCTAssertTrue([self.fm fileExistsAtPath:self.reactNativeTmpDir]);

  [self.module releaseCapture:self.reactNativeTmpDir];

  XCTAssertTrue([self.fm fileExistsAtPath:self.reactNativeTmpDir],
                @"releaseCapture must not delete the ReactNative tmp directory itself");
}

- (void)testReleaseCapture_isANoOpForMissingFile
{
  NSString *missing = [self.reactNativeTmpDir
                       stringByAppendingPathComponent:@"vs-release-does-not-exist.png"];
  XCTAssertFalse([self.fm fileExistsAtPath:missing]);

  // Should not raise / crash even though the file doesn't exist.
  XCTAssertNoThrow([self.module releaseCapture:missing]);
  XCTAssertFalse([self.fm fileExistsAtPath:missing]);
}

- (void)testReleaseCapture_currentlyDeletesPrefixOnlyImposterDirectories_KNOWN_LOOSE_GUARD
{
  // KNOWN LOOSE GUARD — this test documents EXISTING (buggy) behaviour, not the
  // desired one.
  //
  // A path that starts with `<tmp>/ReactNative` as a string prefix but is NOT
  // inside the directory (e.g. `<tmp>/ReactNativeImposter/foo`) is currently
  // deleted, because the implementation uses [hasPrefix:] without a path
  // component boundary check. This is a latent bug that should be tightened in
  // a future PR (e.g. require the prefix to end with "/" or compare path
  // components). When that fix lands, flip this test to assert the imposter
  // file is preserved and rename accordingly.
  NSString *imposterDir = [NSTemporaryDirectory()
                           stringByAppendingPathComponent:@"ReactNativeImposter"];
  NSString *imposterPath = [imposterDir stringByAppendingPathComponent:@"file.png"];
  [self writeFixtureFileAtPath:imposterPath];
  XCTAssertTrue([self.fm fileExistsAtPath:imposterPath]);

  [self.module releaseCapture:imposterPath];

  // With the current `hasPrefix:` check, the file IS deleted because
  // "<tmp>/ReactNativeImposter/file.png" starts with "<tmp>/ReactNative".
  // Asserting observed behaviour so a future hardening of the guard is caught
  // here as a failure (and prompts a rename of this test).
  XCTAssertFalse([self.fm fileExistsAtPath:imposterPath],
                 @"current impl deletes prefix-matching paths; once the guard "
                 @"is tightened to require a path-component boundary, flip this "
                 @"assertion and rename the test");

  // Cleanup
  [self.fm removeItemAtPath:imposterDir error:NULL];
}

@end
