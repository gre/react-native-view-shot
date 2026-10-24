// RNViewShotRenderInContextTests.mm
//
// `width` / `height` must resize the capture with `useRenderInContext` too,
// as they do with the default `drawViewHierarchyInRect:` strategy.
// `-[CALayer renderInContext:]` draws the layer at its own size, so without
// scaling the result is cropped (smaller size) or padded with transparent
// pixels (larger size).
//
// These tests call the exported `captureRef` method with a stub UI manager that
// runs the UI block against a local view registry. `renderInContext:` draws
// views that are not attached to a window, so the pixels can be asserted.

#import <XCTest/XCTest.h>
#import <UIKit/UIKit.h>
#import "RNViewShot.h"

@interface RNViewShot (TestingOnly)
- (void)captureRef:(nonnull NSNumber *)target
       withOptions:(NSDictionary *)options
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;
@end

typedef void (^RNViewShotTestUIBlock)(id uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry);

// Responds to the two messages captureRef sends: `bridge.uiManager` and
// `addUIBlock:`.
@interface RNViewShotTestUIManager : NSObject
@property (nonatomic, copy) NSDictionary<NSNumber *, UIView *> *viewRegistry;
@end

@implementation RNViewShotTestUIManager
- (void)addUIBlock:(RNViewShotTestUIBlock)block
{
  block(nil, self.viewRegistry);
}
@end

@interface RNViewShotTestBridge : NSObject
@property (nonatomic, strong) RNViewShotTestUIManager *uiManager;
@end

@implementation RNViewShotTestBridge
@end

@interface RNViewShotRenderInContextTests : XCTestCase
@property (nonatomic, strong) RNViewShot *module;
// RNViewShot holds its bridge weakly.
@property (nonatomic, strong) RNViewShotTestBridge *bridge;
@end

@implementation RNViewShotRenderInContextTests

- (void)setUp
{
  [super setUp];
  self.bridge = [RNViewShotTestBridge new];
  self.bridge.uiManager = [RNViewShotTestUIManager new];
  self.module = [RNViewShot new];
  [self.module setValue:self.bridge forKey:@"bridge"];
}

// Red, blue, green and yellow quadrants (top-left, top-right, bottom-left,
// bottom-right).
static UIView *QuadrantView(CGSize size)
{
  UIView *view = [[UIView alloc] initWithFrame:(CGRect){CGPointZero, size}];
  NSArray<UIColor *> *colors = @[ UIColor.redColor, UIColor.blueColor, UIColor.greenColor, UIColor.yellowColor ];
  for (NSUInteger i = 0; i < colors.count; i++) {
    UIView *quadrant = [[UIView alloc] initWithFrame:CGRectMake((i % 2) * size.width / 2,
                                                                (i / 2) * size.height / 2,
                                                                size.width / 2,
                                                                size.height / 2)];
    quadrant.backgroundColor = colors[i];
    [view addSubview:quadrant];
  }
  return view;
}

- (UIImage *)captureView:(UIView *)view options:(NSDictionary *)extraOptions
{
  self.bridge.uiManager.viewRegistry = @{ @1 : view };
  NSMutableDictionary *options = [@{
    @"format" : @"png",
    @"quality" : @1,
    @"result" : @"base64",
    @"snapshotContentContainer" : @NO,
    @"useRenderInContext" : @YES,
  } mutableCopy];
  [options addEntriesFromDictionary:extraOptions];

  XCTestExpectation *done = [self expectationWithDescription:@"capture settles"];
  __block NSString *base64 = nil;
  __block NSString *failure = nil;
  [self.module captureRef:@1
              withOptions:options
                  resolve:^(id result) {
                    base64 = result;
                    [done fulfill];
                  }
                   reject:^(NSString *code, NSString *message, NSError *error) {
                     failure = message;
                     [done fulfill];
                   }];
  [self waitForExpectations:@[ done ] timeout:10];

  XCTAssertNil(failure, @"capture rejected: %@", failure);
  NSData *data = [[NSData alloc] initWithBase64EncodedString:base64 options:0];
  UIImage *image = data ? [UIImage imageWithData:data] : nil;
  XCTAssertNotNil(image, @"capture did not resolve to a decodable PNG");
  return image;
}

static NSString *ColorName(const uint8_t *rgba)
{
  if (rgba[3] < 32) return @"transparent";
  BOOL r = rgba[0] > 192, g = rgba[1] > 192, b = rgba[2] > 192;
  BOOL rLow = rgba[0] < 64, gLow = rgba[1] < 64, bLow = rgba[2] < 64;
  if (r && gLow && bLow) return @"red";
  if (rLow && gLow && b) return @"blue";
  if (rLow && g && bLow) return @"green";
  if (r && g && bLow) return @"yellow";
  return [NSString stringWithFormat:@"rgba(%d,%d,%d,%d)", rgba[0], rgba[1], rgba[2], rgba[3]];
}

// Colors at the centers of the image's four quadrants.
static NSArray<NSString *> *QuadrantColors(UIImage *image)
{
  CGImageRef cgImage = image.CGImage;
  size_t width = CGImageGetWidth(cgImage);
  size_t height = CGImageGetHeight(cgImage);
  CGColorSpaceRef space = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
  CGContextRef context = CGBitmapContextCreate(NULL, width, height, 8, width * 4, space,
                                               (CGBitmapInfo)kCGImageAlphaPremultipliedLast);
  CGColorSpaceRelease(space);
  CGContextDrawImage(context, CGRectMake(0, 0, width, height), cgImage);
  const uint8_t *pixels = (const uint8_t *)CGBitmapContextGetData(context);

  NSMutableArray<NSString *> *names = [NSMutableArray array];
  const CGFloat points[4][2] = { { 0.25, 0.25 }, { 0.75, 0.25 }, { 0.25, 0.75 }, { 0.75, 0.75 } };
  for (int i = 0; i < 4; i++) {
    size_t x = (size_t)(points[i][0] * width);
    size_t y = (size_t)(points[i][1] * height);
    [names addObject:ColorName(pixels + (y * width + x) * 4)];
  }
  CGContextRelease(context);
  return names;
}

static NSArray<NSString *> *ExpectedQuadrants(void)
{
  return @[ @"red", @"blue", @"green", @"yellow" ];
}

- (void)assertImage:(UIImage *)image hasPointSize:(CGSize)size
{
  CGFloat scale = UIScreen.mainScreen.scale;
  XCTAssertEqual(CGImageGetWidth(image.CGImage), (size_t)round(size.width * scale));
  XCTAssertEqual(CGImageGetHeight(image.CGImage), (size_t)round(size.height * scale));
}

- (void)testWithoutWidthHeight_capturesTheViewAtItsOwnSize
{
  UIImage *image = [self captureView:QuadrantView(CGSizeMake(200, 100)) options:@{}];

  [self assertImage:image hasPointSize:CGSizeMake(200, 100)];
  XCTAssertEqualObjects(QuadrantColors(image), ExpectedQuadrants());
}

- (void)testSmallerWidthHeight_resizesTheWholeView
{
  UIImage *image = [self captureView:QuadrantView(CGSizeMake(200, 100))
                             options:@{ @"width" : @100, @"height" : @50 }];

  [self assertImage:image hasPointSize:CGSizeMake(100, 50)];
  XCTAssertEqualObjects(QuadrantColors(image), ExpectedQuadrants());
}

- (void)testLargerWidthHeight_resizesTheWholeView
{
  UIImage *image = [self captureView:QuadrantView(CGSizeMake(200, 100))
                             options:@{ @"width" : @400, @"height" : @200 }];

  [self assertImage:image hasPointSize:CGSizeMake(400, 200)];
  XCTAssertEqualObjects(QuadrantColors(image), ExpectedQuadrants());
}

- (void)testSnapshotContentContainer_resizesTheWholeContent
{
  UIScrollView *scrollView = [[UIScrollView alloc] initWithFrame:CGRectMake(0, 0, 200, 100)];
  [scrollView addSubview:QuadrantView(CGSizeMake(200, 200))];
  scrollView.contentSize = CGSizeMake(200, 200);

  UIImage *image = [self captureView:scrollView
                             options:@{ @"width" : @100, @"height" : @100, @"snapshotContentContainer" : @YES }];

  [self assertImage:image hasPointSize:CGSizeMake(100, 100)];
  XCTAssertEqualObjects(QuadrantColors(image), ExpectedQuadrants());
  XCTAssertTrue(CGRectEqualToRect(scrollView.frame, CGRectMake(0, 0, 200, 100)));
}

// A transformed scroll view's temporarily expanded bounds differ from its
// content size, so they must not be used as the resize reference.
static UIScrollView *HalfScaleScrollView(void)
{
  UIScrollView *scrollView = [[UIScrollView alloc] initWithFrame:CGRectMake(0, 0, 200, 100)];
  [scrollView addSubview:QuadrantView(CGSizeMake(200, 200))];
  scrollView.contentSize = CGSizeMake(200, 200);
  scrollView.transform = CGAffineTransformMakeScale(0.5, 0.5);
  return scrollView;
}

- (void)testSnapshotContentContainer_transformedScrollViewWithoutWidthHeight_keepsTheContentSize
{
  UIImage *image = [self captureView:HalfScaleScrollView() options:@{ @"snapshotContentContainer" : @YES }];

  [self assertImage:image hasPointSize:CGSizeMake(200, 200)];
  XCTAssertEqualObjects(QuadrantColors(image), ExpectedQuadrants());
}

- (void)testSnapshotContentContainer_transformedScrollView_resizesTheWholeContent
{
  UIImage *image = [self captureView:HalfScaleScrollView()
                             options:@{ @"width" : @100, @"height" : @100, @"snapshotContentContainer" : @YES }];

  [self assertImage:image hasPointSize:CGSizeMake(100, 100)];
  XCTAssertEqualObjects(QuadrantColors(image), ExpectedQuadrants());
}

@end
