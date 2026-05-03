using System;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices.WindowsRuntime;
using System.Threading.Tasks;
using Windows.Graphics.Display;
using Windows.Graphics.Imaging;
using Windows.Storage;
using Windows.Storage.Streams;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Media.Imaging;

namespace RNViewShot
{
    internal static class ViewShot
    {
        public const string ErrorUnableToSnapshot = "E_UNABLE_TO_SNAPSHOT";

        public static async Task<string> Execute(FrameworkElement view, string extension, double quality, int width, int height, string path, string result)
        {
            try
            {
                using (var ras = new InMemoryRandomAccessStream())
                {
                    await CaptureView(view, ras, extension, quality, width, height);

                    if (result == "tmpfile")
                    {
                        var file = await GetStorageFile(path, extension);
                        using (var fileStream = await file.OpenAsync(FileAccessMode.ReadWrite))
                        {
                            await RandomAccessStream.CopyAndCloseAsync(ras.GetInputStreamAt(0), fileStream.GetOutputStreamAt(0));
                            return file.Path;
                        }
                    }

                    if (ras.Size > int.MaxValue)
                    {
                        throw new InvalidOperationException("Capture is too large to base64-encode (" + ras.Size + " bytes)");
                    }
                    var imageBytes = new byte[(int)ras.Size];
                    await ras.AsStream().ReadAsync(imageBytes, 0, imageBytes.Length);
                    var data = Convert.ToBase64String(imageBytes);
                    if (result == "data-uri")
                    {
                        return Helpers.BuildDataUri(extension, data);
                    }
                    return data;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.ToString());
                throw;
            }
        }

        private static async Task CaptureView(FrameworkElement view, IRandomAccessStream stream, string extension, double quality, int width, int height)
        {
            if (view.ActualWidth <= 0 || view.ActualHeight <= 0)
            {
                throw new InvalidOperationException("Impossible to snapshot the view: view is invalid");
            }

            var dpi = DisplayInformation.GetForCurrentView().LogicalDpi;
            var scale = dpi / 96.0;

            var targetBitmap = new RenderTargetBitmap();
            await targetBitmap.RenderAsync(view);

            BitmapEncoder encoder;
            if (extension == "png")
            {
                encoder = await BitmapEncoder.CreateAsync(BitmapEncoder.PngEncoderId, stream);
            }
            else
            {
                var propertySet = new BitmapPropertySet
                {
                    { "ImageQuality", new BitmapTypedValue(quality, Windows.Foundation.PropertyType.Single) },
                };
                encoder = await BitmapEncoder.CreateAsync(BitmapEncoder.JpegEncoderId, stream, propertySet);
            }

            var pixelBuffer = await targetBitmap.GetPixelsAsync();
            var alphaMode = extension == "png" ? BitmapAlphaMode.Premultiplied : BitmapAlphaMode.Ignore;

            encoder.SetPixelData(
                BitmapPixelFormat.Bgra8,
                alphaMode,
                (uint)targetBitmap.PixelWidth,
                (uint)targetBitmap.PixelHeight,
                dpi,
                dpi,
                pixelBuffer.ToArray());

            if (width > 0 && height > 0)
            {
                var targetW = (uint)Math.Round(width * scale);
                var targetH = (uint)Math.Round(height * scale);
                if (targetW != (uint)targetBitmap.PixelWidth || targetH != (uint)targetBitmap.PixelHeight)
                {
                    encoder.BitmapTransform.ScaledWidth = targetW;
                    encoder.BitmapTransform.ScaledHeight = targetH;
                }
            }

            await encoder.FlushAsync();
        }

        private static async Task<StorageFile> GetStorageFile(string path, string extension)
        {
            var storageFolder = ApplicationData.Current.LocalFolder;
            var fileName = Helpers.ResolveFileName(path, extension);
            return await storageFolder.CreateFileAsync(fileName, CreationCollisionOption.ReplaceExisting);
        }
    }
}
