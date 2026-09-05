#import "RNViewShot.h"
#import <AVFoundation/AVFoundation.h>
#import <React/RCTLog.h>
#import <React/UIView+React.h>
#import <React/RCTUtils.h>
#import <React/RCTConvert.h>
#import <React/RCTUIManager.h>
#if __has_include(<React/RCTUIManagerUtils.h>)
#import <React/RCTUIManagerUtils.h>
#endif
#import <React/RCTBridge.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <unistd.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import <rnviewshot/rnviewshot.h>
#endif

/**
 * `-[CALayer renderInContext:]` paints sublayers in `sublayers` array order and
 * ignores `zPosition`, which the live compositor honours. Fabric relies on that
 * difference: `RCTViewComponentView` appends a `_backgroundColorLayer` (and a
 * `_borderLayer`) whenever a view's border cannot be expressed through plain
 * CoreAnimation properties, and keeps them behind the content only by giving
 * them `zPosition = -1024`. Appended last, they are painted last through
 * `renderInContext:` — over the content — so the view is captured as a flat
 * block (#677).
 *
 * Reordering each `sublayers` array to match z-order before rendering restores
 * what the compositor would have drawn. The sort is stable, so layers sharing a
 * zPosition keep their array order, which is exactly Core Animation's own rule.
 *
 * Layers that were reordered are collected into `mutated`/`originals` so the
 * caller can put the tree back, whatever happens during rendering.
 */
static void RNViewShotSortSublayersByZPosition(CALayer *layer,
                                               NSMutableArray<CALayer *> *mutated,
                                               NSMutableArray<NSArray<CALayer *> *> *originals)
{
  NSArray<CALayer *> *sublayers = layer.sublayers;
  if (sublayers.count > 1) {
    NSArray<CALayer *> *sorted = [sublayers sortedArrayWithOptions:NSSortStable
                                                   usingComparator:^NSComparisonResult(CALayer *a, CALayer *b) {
      if (a.zPosition < b.zPosition) return NSOrderedAscending;
      if (a.zPosition > b.zPosition) return NSOrderedDescending;
      return NSOrderedSame;
    }];
    // Only touch the tree where the order actually differs: the vast majority
    // of layers are already in z-order and must be left untouched.
    if (![sorted isEqualToArray:sublayers]) {
      [mutated addObject:layer];
      [originals addObject:sublayers];
      layer.sublayers = sorted;
    }
  }

  for (CALayer *sublayer in layer.sublayers) {
    RNViewShotSortSublayersByZPosition(sublayer, mutated, originals);
  }
}

/**
 * Put each reordered array back the way it was.
 *
 * `renderInContext:` drives `display` / `drawInContext:` on layers that need
 * it, so a delegate could add or remove a sublayer while we are rendering.
 * Assigning the pre-render snapshot back wholesale would drop such an addition
 * or resurrect a removal, corrupting the live view. So the current array is
 * reordered to the recorded order instead: layers no longer present are simply
 * never re-added, and layers added meanwhile keep their relative order at the
 * end, where `addSublayer:` would have put them.
 */
static void RNViewShotRestoreSublayers(NSArray<CALayer *> *mutated,
                                       NSArray<NSArray<CALayer *> *> *originals)
{
  for (NSUInteger i = 0; i < mutated.count; i++) {
    CALayer *layer = mutated[i];
    NSArray<CALayer *> *original = originals[i];
    NSArray<CALayer *> *current = layer.sublayers;

    if ([current isEqualToArray:original]) continue;

    NSMutableArray<CALayer *> *restored = [NSMutableArray arrayWithCapacity:current.count];
    for (CALayer *sublayer in original) {
      if ([current containsObject:sublayer]) [restored addObject:sublayer];
    }
    for (CALayer *sublayer in current) {
      if (![original containsObject:sublayer]) [restored addObject:sublayer];
    }
    layer.sublayers = restored;
  }
}

@implementation RNViewShot

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  return RCTGetUIManagerQueue();
}

RCT_EXPORT_METHOD(captureScreen: (NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) 
{
  [self captureRef: [NSNumber numberWithInt:-1] withOptions:options resolve:resolve reject:reject];
}

RCT_EXPORT_METHOD(releaseCapture:(nonnull NSString *)uri)
{
  NSString *directory = [NSTemporaryDirectory() stringByAppendingPathComponent:@"ReactNative"];
  NSString *prefix = [directory stringByAppendingString:@"/"];
  if (![uri hasPrefix:prefix]) return;
  NSString *name = [uri substringFromIndex:prefix.length];
  if (name.length == 0 || [name isEqualToString:@"."] || [name isEqualToString:@".."] ||
      [name containsString:@"/"] || [name containsString:@"\0"]) return;

  // Captures are direct temporary-file children. Use file-only, descriptor-relative
  // deletion so a changed leaf cannot redirect cleanup or become a recursive delete.
  int directoryFD = open(directory.fileSystemRepresentation, O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC);
  if (directoryFD < 0) return;
  struct stat info;
  const char *fileName = name.fileSystemRepresentation;
  if (fileName && fstatat(directoryFD, fileName, &info, AT_SYMLINK_NOFOLLOW) == 0 && S_ISREG(info.st_mode)) {
    unlinkat(directoryFD, fileName, 0);
  }
  close(directoryFD);
}

RCT_EXPORT_METHOD(captureRef:(nonnull NSNumber *)target
                  withOptions:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {

    // Get view
    UIView *view;

    if ([target intValue] == -1) {
      UIWindow *window = [[UIApplication sharedApplication] keyWindow];
      view = window;
    } else {
      view = viewRegistry[target];
    }

    if (!view) {
      reject(RCTErrorUnspecified, [NSString stringWithFormat:@"No view found with reactTag: %@", target], nil);
      return;
    }

    // Get options
    CGSize size = [RCTConvert CGSize:options];
    NSString *format = [RCTConvert NSString:options[@"format"]];
    NSString *result = [RCTConvert NSString:options[@"result"]];
    BOOL renderInContext = [RCTConvert BOOL:options[@"useRenderInContext"]];
    BOOL snapshotContentContainer = [RCTConvert BOOL:options[@"snapshotContentContainer"]];

    // Capture image
    __block BOOL success = NO;

    UIView* rendered;
    UIScrollView* scrollView;
    if (snapshotContentContainer) {
      // Find the UIScrollView from the view hierarchy
      UIScrollView* foundScrollView = nil;

      // Check if view itself is a UIScrollView
      if ([view isKindOfClass:[UIScrollView class]]) {
        foundScrollView = (UIScrollView *)view;
      }

      // Try to find UIScrollView in subviews (works for both old and new arch)
      if (!foundScrollView) {
        for (UIView *subview in view.subviews) {
          if ([subview isKindOfClass:[UIScrollView class]]) {
            foundScrollView = (UIScrollView *)subview;
            break;
          }
        }
      }

      // Try responding to scrollView selector (old arch RCTScrollView)
      if (!foundScrollView && [view respondsToSelector:@selector(scrollView)]) {
        id sv = [view performSelector:@selector(scrollView)];
        if ([sv isKindOfClass:[UIScrollView class]]) {
          foundScrollView = (UIScrollView *)sv;
        }
      }

      if (!foundScrollView) {
        reject(RCTErrorUnspecified, [NSString stringWithFormat:@"snapshotContentContainer requires a ScrollView. Got: %@", view], nil);
        return;
      }
      scrollView = foundScrollView;
      rendered = scrollView;
    }
    else {
      rendered = view;
    }

    if (size.width < 0.1 || size.height < 0.1) {
      size = snapshotContentContainer ? scrollView.contentSize : view.bounds.size;
    }
    if (size.width < 0.1 || size.height < 0.1) {
      reject(RCTErrorUnspecified, [NSString stringWithFormat:@"The content size must not be zero or negative. Got: (%g, %g)", size.width, size.height], nil);
      return;
    }

    CGPoint savedContentOffset;
    CGRect savedFrame;
    if (snapshotContentContainer) {
      // Save scroll & frame and set it temporarily to the full content size
      savedContentOffset = scrollView.contentOffset;
      savedFrame = scrollView.frame;
      scrollView.contentOffset = CGPointZero;
      scrollView.frame = CGRectMake(0, 0, scrollView.contentSize.width, scrollView.contentSize.height);
    }

    UIGraphicsImageRendererFormat *rendererFormat = [UIGraphicsImageRendererFormat preferredFormat];
    rendererFormat.opaque = NO;
    rendererFormat.scale = 0; // 0 means "use device scale" (matches old UIGraphicsBeginImageContextWithOptions behaviour)

    UIGraphicsImageRenderer *renderer = [[UIGraphicsImageRenderer alloc] initWithSize:size format:rendererFormat];

    UIImage *image = [renderer imageWithActions:^(UIGraphicsImageRendererContext * _Nonnull rendererContext) {
      if (renderInContext) {
        // this comes with some trade-offs such as inability to capture gradients or scrollview's content in full but it works for large views
        NSMutableArray<CALayer *> *mutated = [NSMutableArray new];
        NSMutableArray<NSArray<CALayer *> *> *originals = [NSMutableArray new];
        // Actions are disabled so the reorder and its undo cannot animate, and
        // the whole thing is one transaction so nothing is ever presented.
        [CATransaction begin];
        [CATransaction setDisableActions:YES];
        @try {
          RNViewShotSortSublayersByZPosition(rendered.layer, mutated, originals);
          [rendered.layer renderInContext:rendererContext.CGContext];
        } @finally {
          RNViewShotRestoreSublayers(mutated, originals);
          [CATransaction commit];
        }
        success = YES;
      }
      else {
        // this doesn't work for large views and reports incorrect success even though the image is blank
        success = [rendered drawViewHierarchyInRect:(CGRect){CGPointZero, size} afterScreenUpdates:YES];
      }
    }];

    if (snapshotContentContainer) {
      // Restore scroll & frame
      scrollView.contentOffset = savedContentOffset;
      scrollView.frame = savedFrame;
    }

    if (!success) {
      reject(RCTErrorUnspecified, @"The view cannot be captured. drawViewHierarchyInRect was not successful. This is a potential technical or security limitation.", nil);
      return;
    }

    if (!image) {
      reject(RCTErrorUnspecified, @"Failed to capture view snapshot. UIGraphicsImageRenderer returned nil!", nil);
      return;
    }

    // Convert image to data (on a background thread)
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{

      NSData *data;
      if ([format isEqualToString:@"jpg"]) {
        CGFloat quality = [RCTConvert CGFloat:options[@"quality"]];
        data = UIImageJPEGRepresentation(image, quality);
      }
      else {
        data = UIImagePNGRepresentation(image);
      }

      NSError *error = nil;
      NSString *res = nil;
      if ([result isEqualToString:@"base64"]) {
        // Return as a base64 raw string
        res = [data base64EncodedStringWithOptions: 0];
      }
      else if ([result isEqualToString:@"data-uri"]) {
        // Return as a base64 data uri string
        NSString *base64 = [data base64EncodedStringWithOptions: 0];
        NSString *imageFormat = ([format isEqualToString:@"jpg"]) ? @"jpeg" : format;
        res = [NSString stringWithFormat:@"data:image/%@;base64,%@", imageFormat, base64];
      }
      else {
        // Save to a temp file
        NSString *path = RCTTempFilePath(format, &error);
        if (path && !error) {
          if ([data writeToFile:path options:(NSDataWritingOptions)0 error:&error]) {
            res = path;
          }
        }
      }

      if (res && !error) {
        resolve(res);
        return;
      }

      // If we reached here, something went wrong
      if (error) reject(RCTErrorUnspecified, error.localizedDescription, error);
      else reject(RCTErrorUnspecified, @"viewshot unknown error", nil);
    });
  }];
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeRNViewShotSpecJSI>(params);
}
#endif


@end
