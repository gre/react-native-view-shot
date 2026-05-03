using System;
using System.IO;

namespace RNViewShot
{
    internal static class Helpers
    {
        public static bool IsSupportedFormat(string format)
        {
            return format == "png" || format == "jpg" || format == "jpeg";
        }

        public static string MapMimeSubtype(string extension)
        {
            return extension == "jpg" ? "jpeg" : extension;
        }

        public static string BuildDataUri(string extension, string base64)
        {
            return "data:image/" + MapMimeSubtype(extension) + ";base64," + base64;
        }

        public static string ResolveFileName(string path, string extension)
        {
            return !string.IsNullOrEmpty(path)
                ? path
                : Path.ChangeExtension(Guid.NewGuid().ToString(), extension);
        }
    }
}
