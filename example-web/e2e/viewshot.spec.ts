import {test, expect} from "@playwright/test";

test.describe("ViewShot Web Example", () => {
  test("should load home page", async ({page}) => {
    await page.goto("/");

    // Verify home page loads
    await expect(page.locator("text=React Native View Shot")).toBeVisible();
    await expect(
      page.locator("text=Web Example with html2canvas"),
    ).toBeVisible();
  });

  test("should navigate to Basic Test screen", async ({page}) => {
    await page.goto("/");

    // Click on Basic ViewShot test
    await page.click("text=Basic ViewShot");

    // Verify we're on the test screen
    await expect(page.locator("text=Hello from View Shot!")).toBeVisible();
  });

  test("should capture PNG screenshot", async ({page}) => {
    await page.goto("/");
    await page.click("text=Basic ViewShot");

    // Wait for page to be ready
    await page.waitForSelector("text=Capture Options:");

    // Click PNG capture button
    await page.click("text=📸 PNG (Data URI)");

    // Wait for capture to complete
    await page.waitForSelector("text=✅ Capture Success!", {timeout: 10000});

    // Verify preview image appears
    const previewImage = page.locator('img[src^="data:image/png"]');
    await expect(previewImage).toBeVisible();

    // Verify the image has actual dimensions
    const box = await previewImage.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);

    // Visual snapshot of the captured image
    await expect(previewImage).toHaveScreenshot("basic-test-png-capture.png");
  });

  test("should capture JPG screenshot", async ({page}) => {
    await page.goto("/");
    await page.click("text=Basic ViewShot");

    await page.waitForSelector("text=Capture Options:");

    // Click JPG capture button
    await page.click("text=📸 JPG (Data URI)");

    await page.waitForSelector("text=✅ Capture Success!", {timeout: 10000});

    // Verify preview image appears (JPG gets converted to data:image/jpeg)
    const previewImage = page.locator('img[src*="image"]');
    await expect(previewImage.first()).toBeVisible();
  });

  test("should capture with Base64 format", async ({page}) => {
    await page.goto("/");
    await page.click("text=Basic ViewShot");

    await page.waitForSelector("text=Capture Options:");

    // Click Base64 capture button (look for the exact button text)
    await page.click("text=PNG (Base64)");

    await page.waitForSelector("text=✅ Capture Success!", {timeout: 10000});

    // Verify success message and image
    await expect(page.locator("text=✅ Capture Success!")).toBeVisible();
  });

  test("should navigate to transparency test", async ({page}) => {
    await page.goto("/");
    await page.click("text=Transparency Test");

    await expect(page.locator("text=Transparency Test")).toBeVisible();
    await expect(page.locator("text=About Transparency")).toBeVisible();
  });

  test("should capture solid background view", async ({page}) => {
    await page.goto("/");
    await page.click("text=Transparency Test");

    // Wait for page to load
    await page.waitForSelector("text=With Background Color");

    // Click capture solid button (simpler selector)
    await page.click("text=📸 Capture Solid");

    // Wait for result
    await page.waitForSelector("text=Result (on checkered bg):", {
      timeout: 10000,
    });

    // Verify image appears
    const resultImages = page.locator('img[src^="data:image"]');
    await expect(resultImages.first()).toBeVisible();

    // Visual snapshot
    await expect(resultImages.first()).toHaveScreenshot(
      "transparency-solid-capture.png",
    );
  });

  test("should test all screens load", async ({page}) => {
    await page.goto("/");

    // Test each screen
    const screens = [
      "Basic ViewShot",
      "Transparency Test",
      "Image Capture",
      "Complex Layout",
    ];

    for (const screen of screens) {
      await page.goto("/");
      await page.click(`text=${screen}`);

      // Verify back button exists (means we navigated)
      await expect(page.locator("text=← Back")).toBeVisible();

      // Go back
      await page.click("text=← Back");
      await expect(page.locator("text=React Native View Shot")).toBeVisible();
    }
  });

  test("should verify download functionality exists", async ({page}) => {
    await page.goto("/");
    await page.click("text=Basic ViewShot");

    await page.waitForSelector("text=Capture Options:");
    await page.click("text=📸 PNG (Data URI)");
    await page.waitForSelector("text=✅ Capture Success!", {timeout: 10000});

    // Verify download button appears
    await expect(page.locator("text=⬇️ Download Image")).toBeVisible();
  });

  test("should capture ImageTestScreen with real images", async ({page}) => {
    await page.goto("/");
    await page.click("text=Image Capture");

    // Wait for page to be ready
    await page.waitForSelector("text=🖼️ Image Gallery");

    // Wait for all images to load and be visible
    await page.waitForLoadState("networkidle");

    // Wait for any images to be loaded (more flexible selector)
    await page.waitForSelector('img[src*="test-image"]', {timeout: 10000});

    // Additional wait to ensure images are fully rendered
    await page.waitForTimeout(5000);

    // Click PNG capture button
    await page.click("text=📸 Capture as PNG");

    // Wait for capture to complete
    await page.waitForSelector("text=✅ Captured Result:", {timeout: 10000});

    // Verify preview image appears
    const previewImage = page.locator('img[src^="data:image/png"]');
    await expect(previewImage).toBeVisible();

    // Visual snapshot of the captured image with real images (high resolution)
    await expect(previewImage).toHaveScreenshot(
      "image-test-screen-capture.png",
      {
        threshold: 0.2,
        maxDiffPixels: 1000,
        // Increase snapshot resolution
        scale: "css",
        animations: "disabled",
      },
    );
  });

  test("should capture ComplexLayoutScreen", async ({page}) => {
    await page.goto("/");
    await page.click("text=Complex Layout");

    // Wait for page to be ready
    await page.waitForSelector("text=Complex Layout Test");

    // Click PNG capture button
    await page.click("text=📸 Capture This Layout");

    // Wait for capture to complete
    await page.waitForSelector("text=✅ Captured Successfully!", {
      timeout: 10000,
    });

    // Verify preview image appears
    const previewImage = page.locator('img[src^="data:image/png"]');
    await expect(previewImage).toBeVisible();

    // Visual snapshot of the complex layout
    await expect(previewImage).toHaveScreenshot("complex-layout-capture.png");
  });
});
