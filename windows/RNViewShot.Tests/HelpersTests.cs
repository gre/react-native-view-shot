using System;
using System.IO;
using RNViewShot;
using Xunit;

public class HelpersTests
{
    [Theory]
    [InlineData("png", true)]
    [InlineData("jpg", true)]
    [InlineData("jpeg", true)]
    [InlineData("webm", false)]
    [InlineData("gif", false)]
    [InlineData("", false)]
    [InlineData(null, false)]
    public void IsSupportedFormat(string format, bool expected)
    {
        Assert.Equal(expected, Helpers.IsSupportedFormat(format));
    }

    [Theory]
    [InlineData("jpg", "jpeg")]
    [InlineData("jpeg", "jpeg")]
    [InlineData("png", "png")]
    public void MapMimeSubtype(string ext, string expected)
    {
        Assert.Equal(expected, Helpers.MapMimeSubtype(ext));
    }

    [Theory]
    [InlineData("png", "data:image/png;base64,XYZ")]
    [InlineData("jpg", "data:image/jpeg;base64,XYZ")]
    [InlineData("jpeg", "data:image/jpeg;base64,XYZ")]
    public void BuildDataUri_emitsCorrectMimeType(string ext, string expected)
    {
        Assert.Equal(expected, Helpers.BuildDataUri(ext, "XYZ"));
    }

    [Fact]
    public void ResolveFileName_returnsExplicitPathWhenProvided()
    {
        Assert.Equal("custom.png", Helpers.ResolveFileName("custom.png", "png"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void ResolveFileName_generatesGuidWhenPathMissing(string path)
    {
        var name = Helpers.ResolveFileName(path, "png");
        Assert.EndsWith(".png", name);
        var stem = Path.GetFileNameWithoutExtension(name);
        Assert.True(Guid.TryParse(stem, out _), $"Expected GUID stem, got '{stem}'");
    }
}
