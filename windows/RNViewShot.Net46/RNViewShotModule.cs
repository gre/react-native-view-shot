using Newtonsoft.Json.Linq;
using ReactNative.Bridge;
using System;
using System.Collections.Generic;
//using Windows.ApplicationModel.Core;
//using Windows.UI.Core;

namespace RNViewShot
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNViewShotModule : ReactContextNativeModuleBase
    {
        private ReactContext reactContext;

        /// <summary>
        /// Instantiates the <see cref="RNViewShotModule"/>.
        /// </summary>
        public RNViewShotModule(ReactContext reactContext) : base(reactContext) 
        {
            this.reactContext = reactContext;
        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNViewShot";
            }
        }

        [ReactMethod]
        public void takeSnapshot(int tag, JObject options, IPromise promise) {
            // Android Equivalent Code
            //ReactApplicationContext context = getReactApplicationContext();
            //String format = options.hasKey("format") ? options.getString("format") : "png";
            //Bitmap.CompressFormat compressFormat =
            //        format.equals("png")
            //                ? Bitmap.CompressFormat.PNG
            //                : format.equals("jpg") || format.equals("jpeg")
            //                ? Bitmap.CompressFormat.JPEG
            //                : format.equals("webm")
            //                ? Bitmap.CompressFormat.WEBP
            //                : null;
            //if (compressFormat == null)
            //{
            //    promise.reject(ViewShot.ERROR_UNABLE_TO_SNAPSHOT, "Unsupported image format: " + format + ". Try one of: png | jpg | jpeg");
            //    return;
            //}
            //double quality = options.hasKey("quality") ? options.getDouble("quality") : 1.0;
            //DisplayMetrics displayMetrics = context.getResources().getDisplayMetrics();
            //Integer width = options.hasKey("width") ? (int)(displayMetrics.density * options.getDouble("width")) : null;
            //Integer height = options.hasKey("height") ? (int)(displayMetrics.density * options.getDouble("height")) : null;
            //String result = options.hasKey("result") ? options.getString("result") : "file";
            //Boolean snapshotContentContainer = options.hasKey("snapshotContentContainer") ? options.getBoolean("snapshotContentContainer") : false;
            //try
            //{
            //    String name = options.hasKey("filename") ? options.getString("filename") : null;
            //    File tmpFile = "file".equals(result) ? createTempFile(getReactApplicationContext(), format, name) : null;
            //    UIManagerModule uiManager = this.reactContext.getNativeModule(UIManagerModule.class);
            //    uiManager.addUIBlock(new ViewShot(tag, format, compressFormat, quality, width, height, tmpFile, result, snapshotContentContainer, promise));
            //}
            //catch (Exception e) {
            //    promise.reject(ViewShot.ERROR_UNABLE_TO_SNAPSHOT, "Failed to snapshot view tag "+tag);
            //}

            //Bitmap bitmap = new Bitmap(Screen.PrimaryScreen.Bounds.Width, Screen.PrimaryScreen.Bounds.Height);
            //Graphics graphics = Graphics.FromImage(bitmap as Image);
            //graphics.CopyFromScreen(0, 0, 0, 0, bitmap.Size);
            //bitmap.Save("c:\\screenshot.jpeg", ImageFormat.Jpeg);
            promise.Resolve("This is working!");
        }
    }
}
