using Newtonsoft.Json.Linq;
using ReactNative.Bridge;
using ReactNative.UIManager;
using System;
using System.IO;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace RNViewShot
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNViewShotModule : ReactContextNativeModuleBase
    {
        private const string ErrorUnableToSnapshot = "E_UNABLE_TO_SNAPSHOT";
        private readonly ReactContext _reactContext;

        /// <summary>
        /// Instantiates the <see cref="RNViewShotModule"/>.
        /// </summary>
        public RNViewShotModule(ReactContext reactContext) : base(reactContext) 
        {
            this._reactContext = reactContext;
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
        public void takeSnapshot(int tag, JObject options, IPromise promise)
        {
            string format = options["format"] != null ? options.Value<string>("format") : "png";
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
            //    promise.reject(ErrorUnableToSnapshot, "Unsupported image format: " + format + ". Try one of: png | jpg | jpeg");
            //    return;
            //}
            double quality = options["quality"] != null ? options.Value<double>("quality") : 1.0;
            int? width = options["width"] != null ? options.Value<int?>("width") : null;
            int? height = options["height"] != null ? options.Value<int?>("height") : null;
            string result = options["result"] != null ? options.Value<string>("result") : "file";
            bool snapshotContentContainer = options["snapshotContentContainer"] != null ? options.Value<bool>("snapshotContentContainer") : false;

            UIManagerModule uiManager = this._reactContext.GetNativeModule<UIManagerModule>();
            uiManager.AddUIBlock(new ViewShot(tag));

            //try
            //{
            //    string name = options["filename"] != null ? options.Value<string>("filename") : null;
            //    //File tmpFile = "file" == result ? createTempFile(this._reactContext, format, name) : null;
            //    UIManagerModule uiManager = this._reactContext.GetNativeModule<UIManagerModule>();
            //    //uiManager.addUIBlock(new ViewShot(tag, format, compressFormat, quality, width, height, tmpFile, result, snapshotContentContainer, promise));
            //}
            //catch (Exception e)
            //{
            //    promise.reject(ErrorUnableToSnapshot, "Failed to snapshot view tag " + tag);
            //}

            //Bitmap bitmap = new Bitmap(Screen.PrimaryScreen.Bounds.Width, Screen.PrimaryScreen.Bounds.Height);
            //Graphics graphics = Graphics.FromImage(bitmap as Image);
            //graphics.CopyFromScreen(0, 0, 0, 0, bitmap.Size);
            //bitmap.Save("c:\\screenshot.jpeg", ImageFormat.Jpeg);
            promise.Resolve("Format: " + format + " Quality: " + quality);
        }
    }
}
