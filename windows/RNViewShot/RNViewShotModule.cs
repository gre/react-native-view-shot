using Microsoft.ReactNative;
using Microsoft.ReactNative.Managed;
using System;
using System.Threading.Tasks;
using Windows.UI.Xaml;

namespace RNViewShot
{
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
        public Task<string> captureRef(int tag, JSValue options)
        {
            return Capture(options, () =>
            {
                var element = XamlUIService.FromContext(_context.Handle).ElementFromReactTag(tag);
                if (element == null)
                {
                    throw new InvalidOperationException(
                        "Could not find view for tag " + tag + " (the React component may have unmounted before capture)");
                }
                var target = element as FrameworkElement
                    ?? Windows.UI.Xaml.Media.VisualTreeHelper.GetParent(element) as FrameworkElement;
                if (target == null)
                {
                    throw new InvalidOperationException(
                        "View for tag " + tag + " has no FrameworkElement (got " + element.GetType().FullName + "). Wrap it in a <View> and capture that instead.");
                }
                return target;
            });
        }

        [ReactMethod]
        public Task<string> captureScreen(JSValue options)
        {
            return Capture(options, () =>
            {
                var root = Window.Current?.Content as FrameworkElement;
                if (root == null)
                {
                    throw new InvalidOperationException("captureScreen: no root window content available");
                }
                return root;
            });
        }

        private async Task<string> Capture(JSValue options, Func<FrameworkElement> resolveTarget)
        {
            var format = options["format"].IsNull ? "png" : options["format"].AsString();
            var quality = options["quality"].IsNull ? 1.0 : options["quality"].AsDouble();
            var width = options["width"].IsNull ? 0 : options["width"].AsInt32();
            var height = options["height"].IsNull ? 0 : options["height"].AsInt32();
            var result = options["result"].IsNull ? "tmpfile" : options["result"].AsString();
            var path = options["path"].IsNull ? null : options["path"].AsString();

            if (!Helpers.IsSupportedFormat(format))
            {
                return "Unsupported image format: " + format + ". Try one of: png | jpg | jpeg";
            }

            var tcs = new TaskCompletionSource<string>();
            _context.Handle.UIDispatcher.Post(async () =>
            {
                try
                {
                    var target = resolveTarget();
                    var output = await ViewShot.Execute(target, format, quality, width, height, path, result);
                    tcs.SetResult(output);
                }
                catch (Exception ex)
                {
                    tcs.SetResult(ex.Message);
                }
            });
            return await tcs.Task;
        }
    }
}
