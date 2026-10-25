# Consumer ProGuard/R8 rules for react-native-view-shot.
# Applied automatically to apps that depend on this library (consumerProguardFiles).
#
# The library uses no reflection of its own. Everything JS reaches goes through
# RNViewShotModule, a NativeModule. React Native's own consumer rules keep it
# today with `-keep class * implements com.facebook.react.bridge.NativeModule { *; }`.
# The rule below makes the library's entry point explicit, so it doesn't depend
# on how broad React Native's rules happen to be.

# Bridge/TurboModule entry point: the old arch looks up @ReactMethod methods by
# reflection, and the new arch calls the spec methods by name through JNI.
# Covers NativeRNViewShotSpec (paper or codegen) as the superclass.
-keep class fr.greweb.reactnativeviewshot.RNViewShotModule { *; }
