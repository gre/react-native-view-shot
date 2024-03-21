
package fr.greweb.reactnativeviewshot;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.TurboReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

public class RNViewShotPackage extends TurboReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(@NonNull String name, @NonNull ReactApplicationContext reactApplicationContext) {
    if (name.equals(RNViewShotModule.RNVIEW_SHOT)) {
      return new RNViewShotModule(reactApplicationContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      moduleInfos.put(
              RNViewShotModule.RNVIEW_SHOT,
              new ReactModuleInfo(
                      RNViewShotModule.RNVIEW_SHOT,
                      RNViewShotModule.RNVIEW_SHOT,
                      false, // canOverrideExistingModule
                      false, // needsEagerInit
                      false, // isCxxModule
                      true // isTurboModule
              ));
      return moduleInfos;
    };
  }
}