using ReactNative;
using ReactNative.Bridge;
using ReactNative.Modules.Core;
using ReactNative.Shell;
using ReactNative.UIManager;
using System;
using System.Collections.Generic;
using ReactNativeVideo;
using RNViewShot;

namespace ViewShotExample.Net46
{
    internal class AppReactPage : ReactPage
    {
        public override string MainComponentName => "ViewShotExample";

        public override List<IReactPackage> Packages => new List<IReactPackage>
        {
            new MainReactPackage(),
            new RNViewShotPackage(),
            new ReactVideoPackage(),
        };

        public override bool UseDeveloperSupport
        {
            get
            {
                return true;
            }
        }
    }
}
