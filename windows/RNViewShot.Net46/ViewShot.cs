using ReactNative.Bridge;
using ReactNative.UIManager;
using System;
using System.IO;
using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace RNViewShot
{
    public class ViewShot : IUIBlock
    {
        private const string ErrorUnableToSnapshot = "E_UNABLE_TO_SNAPSHOT";
        private int tag;
        private string extension;
        private double quality;
        private int? width;
        private int? height;
        private string result;
        private IPromise promise;

        public ViewShot(
            int tag,
            string extension,
            double quality,
            int? width,
            int? height,
            string result,
            IPromise promise)
        {
            this.tag = tag;
            this.extension = extension;
            this.quality = quality;
            this.width = width;
            this.height = height;
            this.result = result;
            this.promise = promise;
        }

        public void Execute(NativeViewHierarchyManager nvhm)
        {
            var view = nvhm.ResolveView(tag) as FrameworkElement;
            if (view == null)
            {
                promise.Reject(ErrorUnableToSnapshot, "No view found with reactTag: " + tag);
                return;
            }
            int width = (int)view.ActualWidth;
            int height = (int)view.ActualHeight;

            RenderTargetBitmap renderTargetBitmap = new RenderTargetBitmap(width, height, 96, 96, PixelFormats.Default);
            renderTargetBitmap.Render(view);

            BitmapEncoder image;
            if (extension == "png")
            {
                image = new PngBitmapEncoder();
            }
            else if (extension == "jpg" || extension == "jpeg")
            {
                image = new JpegBitmapEncoder();
            }
            else
            {
                promise.Reject(ErrorUnableToSnapshot, "Unsupported image format: " + extension + ". Try one of: png | jpg | jpeg");
                return;
            }

            // TODO: Allow setting quality
            image.Frames.Add(BitmapFrame.Create(renderTargetBitmap));

            if ("file" == result)
            {
                // TODO: Allow specifying path
                string path = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "testing." + extension);
                using (Stream fileStream = File.Create(path))
                {
                    image.Save(fileStream);
                }
            }
            else if ("base64" == result)
            {
                MemoryStream stream = new MemoryStream();
                image.Save(stream);
                byte[] imageBytes = stream.ToArray();
                string data = Convert.ToBase64String(imageBytes);
                promise.Resolve(data);

            }
            else if ("data-uri" == result)
            {
                MemoryStream stream = new MemoryStream();
                image.Save(stream);
                byte[] imageBytes = stream.ToArray();
                string data = Convert.ToBase64String(imageBytes);
                data = "data:image/" + extension + ";base64," + data;
                promise.Resolve(data);
            }
            else
            {
                promise.Reject(ErrorUnableToSnapshot, "Unsupported result: " + result + ". Try one of: file | base64 | data-uri");
            }
        }
    }
}
