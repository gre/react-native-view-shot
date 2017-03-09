
#import "RNViewShot.h"
#import <AVFoundation/AVFoundation.h>
#import <React/RCTLog.h>
#import <React/UIView+React.h>
#import <React/RCTUtils.h>
#import <React/RCTConvert.h>
#import <React/RCTScrollView.h>
#import <React/RCTUIManager.h>
#import <React/RCTBridge.h>


@implementation RNViewShot

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  return self.bridge.uiManager.methodQueue;
}

- (NSDictionary *)constantsToExport
{
  return @{
           @"CacheDir" : [NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) firstObject],
           @"DocumentDir": [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) firstObject],
           @"MainBundleDir" : [[NSBundle mainBundle] bundlePath],
           @"MovieDir": [NSSearchPathForDirectoriesInDomains(NSMoviesDirectory, NSUserDomainMask, YES) firstObject],
           @"MusicDir": [NSSearchPathForDirectoriesInDomains(NSMusicDirectory, NSUserDomainMask, YES) firstObject],
           @"PictureDir": [NSSearchPathForDirectoriesInDomains(NSPicturesDirectory, NSUserDomainMask, YES) firstObject],
           };
}

// forked from RN implementation
// https://github.com/facebook/react-native/blob/f35b372883a76b5666b016131d59268b42f3c40d/React/Modules/RCTUIManager.m#L1367

RCT_EXPORT_METHOD(takeSnapshot:(nonnull NSNumber *)target
                  withOptions:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
  [self.bridge.uiManager addUIBlock:^(__unused RCTUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
    
    // Get view
    UIView *view;
    view = viewRegistry[target];
    if (!view) {
      reject(RCTErrorUnspecified, [NSString stringWithFormat:@"No view found with reactTag: %@", target], nil);
      return;
    }
    
    // Get options
    CGSize size = [RCTConvert CGSize:options];
    NSString *format = [RCTConvert NSString:options[@"format"] ?: @"png"];
    NSString *result = [RCTConvert NSString:options[@"result"] ?: @"file"];
    BOOL snapshotContentContainer = [RCTConvert BOOL:options[@"snapshotContentContainer"] ?: @"false"];

    // Capture image
    BOOL success;
    
    UIView* rendered;
    UIScrollView* scrollView;
    if (snapshotContentContainer) {
      if (![view isKindOfClass:[RCTScrollView class]]) {
        reject(RCTErrorUnspecified, [NSString stringWithFormat:@"snapshotContentContainer can only be used on a RCTScrollView. instead got: %@", view], nil);
        return;
      }
      RCTScrollView* rctScrollView = view;
      scrollView = rctScrollView.scrollView;
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
    UIGraphicsBeginImageContextWithOptions(size, NO, 0);
    success = [rendered drawViewHierarchyInRect:(CGRect){CGPointZero, size} afterScreenUpdates:YES];
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
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
      reject(RCTErrorUnspecified, @"Failed to capture view snapshot. UIGraphicsGetImageFromCurrentImageContext() returned nil!", nil);
      return;
    }
    
    // Convert image to data (on a background thread)
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
      
      NSData *data;
      if ([format isEqualToString:@"png"]) {
        data = UIImagePNGRepresentation(image);
      } else if ([format isEqualToString:@"jpeg"] || [format isEqualToString:@"jpg"]) {
        CGFloat quality = [RCTConvert CGFloat:options[@"quality"] ?: @1];
        data = UIImageJPEGRepresentation(image, quality);
      } else {
        reject(RCTErrorUnspecified, [NSString stringWithFormat:@"Unsupported image format: %@. Try one of: png | jpg | jpeg", format], nil);
        return;
      }
      
      NSError *error = nil;
      NSString *res = nil;
      if ([result isEqualToString:@"file"]) {
        // Save to a temp file
        NSString *path;
        if (options[@"path"]) {
          path = options[@"path"];
          NSString * folder = [path stringByDeletingLastPathComponent];
          NSFileManager * fm = [NSFileManager defaultManager];
          if(![fm fileExistsAtPath:folder]) {
            [fm createDirectoryAtPath:folder withIntermediateDirectories:YES attributes:NULL error:&error];
            [fm createFileAtPath:path contents:nil attributes:nil];
          }
        }
        else {
          path = RCTTempFilePath(format, &error);
        }
        if (path && !error) {
          if ([data writeToFile:path options:(NSDataWritingOptions)0 error:&error]) {
            res = path;
          }
        }
      }
      else if ([result isEqualToString:@"base64"]) {
        // Return as a base64 raw string
        res = [data base64EncodedStringWithOptions: NSDataBase64Encoding64CharacterLineLength];
      }
      else if ([result isEqualToString:@"data-uri"]) {
        // Return as a base64 data uri string
        NSString *base64 = [data base64EncodedStringWithOptions: NSDataBase64Encoding64CharacterLineLength];
        res = [NSString stringWithFormat:@"data:image/%@;base64,%@", format, base64];
      }
      else {
        reject(RCTErrorUnspecified, [NSString stringWithFormat:@"Unsupported result: %@. Try one of: file | base64 | data-uri", result], nil);
        return;
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


@end
