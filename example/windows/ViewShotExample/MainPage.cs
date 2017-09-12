using ReactNative;
using ReactNative.Modules.Core;
using ReactNative.Shell;
using RNViewShot;
using System.Collections.Generic;
using ReactNativeVideo;

namespace ViewShotExample
{
    class MainPage : ReactPage
    {
        public override string MainComponentName
        {
            get
            {
                return "ViewShotExample";
            }
        }

#if BUNDLE
        public override string JavaScriptBundleFile
        {
            get
            {
                return "ms-appx:///ReactAssets/index.windows.bundle";
            }
        }
#endif

        public override List<IReactPackage> Packages
        {
            get
            {
                return new List<IReactPackage>
                {
                    new MainReactPackage(),
                    new RNViewShotPackage(),
                    new ReactVideoPackage(),
                };
            }
        }

        public override bool UseDeveloperSupport
        {
            get
            {
#if !BUNDLE || DEBUG
                return true;
#else
                return false;
#endif
            }
        }
    }

}
