
#import "RNViewShot.h"
#import <AVFoundation/AVFoundation.h>
#import "RCTLog.h"
#import "UIView+React.h"
#import "RCTUtils.h"
#import "RCTConvert.h"
#import "RCTUIManager.h"
#import "RCTBridge.h"


@implementation RNViewShot

RCT_EXPORT_MODULE()

@synthesize bridge = _bridge;

- (dispatch_queue_t)methodQueue
{
  return self.bridge.uiManager.methodQueue;
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

        // Capture image
        if (size.width < 0.1 || size.height < 0.1) {
            size = view.bounds.size;
        }
        UIGraphicsBeginImageContextWithOptions(size, NO, 0);
        BOOL success = [view drawViewHierarchyInRect:(CGRect){CGPointZero, size} afterScreenUpdates:YES];
        UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();

        if (!success || !image) {
            reject(RCTErrorUnspecified, @"Failed to capture view snapshot.", nil);
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
                reject(RCTErrorUnspecified, [NSString stringWithFormat:@"Unsupported image format: %@", format], nil);
                return;
            }

            // Save to a temp file
            NSError *error = nil;
            NSString *tempFilePath = RCTTempFilePath(format, &error);
            if (tempFilePath) {
                if ([data writeToFile:tempFilePath options:(NSDataWritingOptions)0 error:&error]) {
                    resolve(tempFilePath);
                    return;
                }
            }

            // If we reached here, something went wrong
            reject(RCTErrorUnspecified, error.localizedDescription, error);
        });
    }];
}


@end
