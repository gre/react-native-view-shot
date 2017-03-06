using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ReactNative.UIManager;

namespace RNViewShot
{
    public class ViewShot : IUIBlock
    {
        private int tag;

        public ViewShot(int tag)
        {
            this.tag = tag;
        }

        public void Execute(NativeViewHierarchyManager nvhm)
        {
            var view = nvhm.ResolveView(this.tag);

            string depObj = view.ToString();
        }
    }
}
