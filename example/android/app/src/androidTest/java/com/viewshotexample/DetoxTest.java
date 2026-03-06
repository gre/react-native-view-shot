package com.viewshotexample;

import com.wix.detox.Detox;
import com.wix.detox.config.DetoxConfig;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
    @Rule
    public ActivityTestRule<MainActivity> mActivityRule = new ActivityTestRule<>(MainActivity.class, false, false);

    @Test
    public void runDetoxTests() {
        DetoxConfig detoxConfig = new DetoxConfig();
        // Very generous timeouts to handle Fabric initialization
        detoxConfig.idlePolicyConfig.masterTimeoutSec = 180;
        detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 120;
        detoxConfig.rnContextLoadTimeoutSec = (com.viewshotexample.BuildConfig.DEBUG ? 300 : 120);

        Detox.runTests(mActivityRule, detoxConfig);
    }
}
