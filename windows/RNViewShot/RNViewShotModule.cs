using Newtonsoft.Json.Linq;
using ReactNative.Bridge;
using System;
using System.Collections.Generic;
using Windows.ApplicationModel.Core;
using Windows.UI.Core;

namespace Com.Reactlibrary.RNViewShot
{
    /// <summary>
    /// A module that allows JS to share data.
    /// </summary>
    class RNViewShotModule : NativeModuleBase
    {
        /// <summary>
        /// Instantiates the <see cref="RNViewShotModule"/>.
        /// </summary>
        internal RNViewShotModule()
        {

        }

        /// <summary>
        /// The name of the native module.
        /// </summary>
        public override string Name
        {
            get
            {
                return "RNViewShot";
            }
        }

        [ReactMethod]
        public void takeSnapshot(int tag, JObject options, IPromise promise) {}
    }
}
