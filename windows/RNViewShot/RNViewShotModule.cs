using Microsoft.ReactNative;
using Microsoft.ReactNative.Managed;
using System;
using Windows.UI.Xaml;

namespace RNViewShot
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>

    [ReactModule]
    class RNViewShot
    {
        private ReactContext _context;

        [ReactInitializer]
        public void Initialize(ReactContext context)
        {
            _context = context;
        }

        [ReactMethod]
        public void releaseCapture(string uri)
        {
            // TODO implement me
        }

        [ReactMethod]
        public async void captureRef(int tag, JSValue options, IReactPromise<string> promise)
        {
            string format = options["format"].IsNull ? "png" : options["format"].AsString();
            double quality = options["quality"].IsNull ? 1.0 : options["quality"].AsDouble();
            int width = options["width"].IsNull ? 0 : options["width"].AsInt16();
            int height = options["height"].IsNull ? 0 : options["height"].AsInt16();
            string result = options["result"].IsNull ? "file" : options["result"].AsString();
            string path = options["path"].IsNull ? null : options["path"].AsString();

            if (format != "png" && format != "jpg" && format != "jpeg")
            {
                promise.Reject(new ReactError { Code = ViewShot.ErrorUnableToSnapshot, Message = "Unsupported image format: " + format + ". Try one of: png | jpg | jpeg" });
                return;
            }

            try
            {
                var control = XamlUIService.FromContext(_context.Handle).ElementFromReactTag(tag) as FrameworkElement;

                ViewShot view = new ViewShot();
                var output = await view.Execute(control, format, quality, width, height, path, result);
                promise.Resolve(output);
            }
            catch (Exception exc)
            {
                promise.Reject(new ReactError { Message = exc.Message, Exception = exc });
            }
        }
    }
}
