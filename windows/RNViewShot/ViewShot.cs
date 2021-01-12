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
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Media.Imaging;

namespace RNViewShot
{
    internal class ViewShot: Control
    {
        public const string ErrorUnableToSnapshot = "E_UNABLE_TO_SNAPSHOT";
        private string extension;
        private double quality;
        private int? width;
        private int? height;
        private string path;

        public ViewShot()
        {
            DefaultStyleKey = typeof(ViewShot);
        }

        public async Task<string> Execute(FrameworkElement view, string extension, double quality, int width, int height, string path, string result)
        {
            this.extension = extension;
            this.quality = quality;
            this.width = width;
            this.height = height;
            this.path = path;

            string output = string.Empty;

            try
            {
                if ("tmpfile" == result)
                {
                    using (var ras = new InMemoryRandomAccessStream())
                    {
                        await CaptureView(view, ras);
                        var file = await GetStorageFile();
                        using (var fileStream = await file.OpenAsync(FileAccessMode.ReadWrite))
                        {
                            await RandomAccessStream.CopyAndCloseAsync(ras.GetInputStreamAt(0), fileStream.GetOutputStreamAt(0));
                            output = file.Path;
                        }
                    }
                }
                else if ("base64" == result)
                {
                    using (var ras = new InMemoryRandomAccessStream())
                    {
                        await CaptureView(view, ras);
                        var imageBytes = new byte[ras.Size];
                        await ras.AsStream().ReadAsync(imageBytes, 0, imageBytes.Length);
                        string data = Convert.ToBase64String(imageBytes);
                        output = data;
                    }
                }
                else if ("data-uri" == result)
                {
                    using (var ras = new InMemoryRandomAccessStream())
                    {
                        await CaptureView(view, ras);
                        var imageBytes = new byte[ras.Size];
                        await ras.AsStream().ReadAsync(imageBytes, 0, imageBytes.Length);
                        string data = Convert.ToBase64String(imageBytes);
                        data = "data:image/" + extension + ";base64," + data;
                        output = data;
                    }
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.ToString());
                throw ex;
            }

            return output;
        }

        private async Task<BitmapEncoder> CaptureView(FrameworkElement view, IRandomAccessStream stream)
        {
            int w = (int)view.ActualWidth;
            int h = (int)view.ActualHeight;

            if (w <= 0 || h <= 0)
            {
                throw new InvalidOperationException("Impossible to snapshot the view: view is invalid");
            }

            RenderTargetBitmap targetBitmap = new RenderTargetBitmap();
            await targetBitmap.RenderAsync(view, w, h);

            BitmapEncoder encoder;
            if (extension != "png")
            {
                var propertySet = new BitmapPropertySet();
                var qualityValue = new BitmapTypedValue(quality, Windows.Foundation.PropertyType.Single);
                propertySet.Add("ImageQuality", qualityValue);
                encoder = await BitmapEncoder.CreateAsync(BitmapEncoder.JpegEncoderId, stream, propertySet);
            }
            else
            {
                encoder = await BitmapEncoder.CreateAsync(BitmapEncoder.PngEncoderId, stream);
            }

            var displayInformation = DisplayInformation.GetForCurrentView();
            var pixelBuffer = await targetBitmap.GetPixelsAsync();

            encoder.SetPixelData(
                BitmapPixelFormat.Bgra8,
                BitmapAlphaMode.Ignore,
                (uint)targetBitmap.PixelWidth,
                (uint)targetBitmap.PixelHeight,
                displayInformation.LogicalDpi,
                displayInformation.LogicalDpi,
                pixelBuffer.ToArray());                


            if (width != null && height != null && (width != w || height != h))
            {
                encoder.BitmapTransform.ScaledWidth = (uint)width;
                encoder.BitmapTransform.ScaledWidth = (uint)height;
            }

            if (encoder == null)
            {
                throw new InvalidOperationException("Impossible to snapshot the view");
            }

            await encoder.FlushAsync();

            return encoder;            
        }

        private async Task<StorageFile> GetStorageFile()
        {
            var storageFolder = ApplicationData.Current.LocalFolder;
            var fileName = !string.IsNullOrEmpty(path) ? path : Path.ChangeExtension(Guid.NewGuid().ToString(), extension);                
            return await storageFolder.CreateFileAsync(fileName, CreationCollisionOption.ReplaceExisting);
        }
    }
}
