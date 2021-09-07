using Microsoft.ReactNative;
using Microsoft.ReactNative.Managed;
using System;
using System.Threading.Tasks;
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
        public async Task<string> captureRef(int tag, JSValue options)
        {
            string format = options["format"].IsNull ? "png" : options["format"].AsString();
            double quality = options["quality"].IsNull ? 1.0 : options["quality"].AsDouble();
            int width = options["width"].IsNull ? 0 : options["width"].AsInt16();
            int height = options["height"].IsNull ? 0 : options["height"].AsInt16();
            string result = options["result"].IsNull ? "tmpfile" : options["result"].AsString();
            string path = options["path"].IsNull ? null : options["path"].AsString();

            if (format != "png" && format != "jpg" && format != "jpeg")
            {
                return "Unsupported image format: " + format + ". Try one of: png | jpg | jpeg";
            }

            try
            {
                var control = XamlUIService.FromContext(_context.Handle).ElementFromReactTag(tag) as FrameworkElement;
                string imagePath = await GenerateViewShot(control, format, quality, width, height, path, result);
                return imagePath;
            }
            catch (Exception exc)
            {
                return exc.Message;
            }
        }

        private async Task<string> GenerateViewShot(FrameworkElement control, string format, double quality, int width, int height, string path, string result)
        {
            TaskCompletionSource<string> tcs = new TaskCompletionSource<string>();

            _context.Handle.UIDispatcher.Post(async () =>
            {
                ViewShot view = new ViewShot();
                var output = await view.Execute(control, format, quality, width, height, path, result);
                tcs.SetResult(output);
            });

            var imagePath = await tcs.Task;
            return imagePath;
        }
    }
}
