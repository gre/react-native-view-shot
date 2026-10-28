
package fr.greweb.reactnativeviewshot;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.BaseReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.model.ReactModuleInfo;
import com.facebook.react.module.model.ReactModuleInfoProvider;

import java.util.HashMap;
import java.util.Map;

public class RNViewShotPackage extends BaseReactPackage {
  @Nullable
  @Override
  public NativeModule getModule(@NonNull String name, @NonNull ReactApplicationContext reactApplicationContext) {
    if (name.equals(RNViewShotModule.NAME)) {
      return new RNViewShotModule(reactApplicationContext);
    } else {
      return null;
    }
  }

  @Override
  public ReactModuleInfoProvider getReactModuleInfoProvider() {
    return () -> {
      final Map<String, ReactModuleInfo> moduleInfos = new HashMap<>();
      boolean isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
      moduleInfos.put(
              RNViewShotModule.NAME,
              new ReactModuleInfo(
                      RNViewShotModule.NAME,
                      RNViewShotModule.NAME,
                      false, // canOverrideExistingModule
                      false, // needsEagerInit
                      false, // isCxxModule
                      isTurboModule // isTurboModule
              ));
      return moduleInfos;
    };
  }
}