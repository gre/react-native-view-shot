const fs = require('fs');
const path = require('path');

/**
 * Helper to validate captured screenshots against reference snapshots
 * Snapshots are platform-specific (iOS vs Android) to account for rendering differences
 */
class SnapshotMatcher {
  constructor() {
    // Get platform from Detox device
    const platform = device.getPlatform(); // 'ios' or 'android'

    // Platform-specific directories to handle rendering differences
    this.referenceDir = path.join(
      __dirname,
      '../snapshots/reference',
      platform,
    );
    this.outputDir = path.join(__dirname, '../snapshots/output', platform);

    // Ensure directories exist
    if (!fs.existsSync(this.referenceDir)) {
      fs.mkdirSync(this.referenceDir, { recursive: true });
    }
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    console.log(`📸 SnapshotMatcher initialized for ${platform}`);
    console.log(`   Reference: ${this.referenceDir}`);
    console.log(`   Output: ${this.outputDir}`);
  }

  /**
   * Save a screenshot from device and optionally compare with reference
   * @param {string} testName - Name of the test (used for filename)
   * @param {object} element - Detox element to capture (optional, captures device screen if not provided)
   * @param {boolean} updateReference - If true, saves as new reference snapshot
   * @returns {Promise<{path: string, matched: boolean|null}>}
   */
  async captureAndValidate(testName, element = null, updateReference = false) {
    const timestamp = Date.now();
    const sanitizedName = testName.replace(/[^a-zA-Z0-9-]/g, '_');
    const outputPath = path.join(
      this.outputDir,
      `${sanitizedName}_${timestamp}.png`,
    );
    const referencePath = path.join(this.referenceDir, `${sanitizedName}.png`);

    try {
      // Capture screenshot using Detox
      if (element) {
        await element.takeScreenshot(sanitizedName);
      } else {
        await device.takeScreenshot(sanitizedName);
      }

      // On iOS/Android, Detox saves screenshots to artifacts directory
      // We need to find and copy the latest screenshot
      const artifactsPath = this.findLatestScreenshot(sanitizedName);

      if (artifactsPath && fs.existsSync(artifactsPath)) {
        // Copy to output directory
        fs.copyFileSync(artifactsPath, outputPath);
        console.log(`📸 Screenshot saved to: ${outputPath}`);

        // If updating reference, save as reference
        if (updateReference) {
          fs.copyFileSync(outputPath, referencePath);
          console.log(`✅ Reference snapshot updated: ${referencePath}`);
          return { path: outputPath, matched: null, isReference: true };
        }

        // Compare with reference if it exists
        if (fs.existsSync(referencePath)) {
          const matched = await this.compareImages(outputPath, referencePath);
          console.log(
            `${matched ? '✅' : '❌'} Snapshot ${
              matched ? 'matches' : 'differs from'
            } reference`,
          );
          return { path: outputPath, matched, referencePath };
        } else {
          console.log(`⚠️  No reference snapshot found at: ${referencePath}`);
          console.log(
            `💡 Run with updateReference=true to create reference snapshot`,
          );
          return { path: outputPath, matched: null, needsReference: true };
        }
      } else {
        throw new Error(
          `Could not find captured screenshot for ${sanitizedName}`,
        );
      }
    } catch (error) {
      console.error(`❌ Error capturing screenshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find the latest screenshot file created by Detox
   * @param {string} _name - Test name
   * @returns {string|null} Path to screenshot file
   */
  findLatestScreenshot(_name) {
    const artifactsDir = path.join(process.cwd(), 'artifacts');

    if (!fs.existsSync(artifactsDir)) {
      return null;
    }

    // Recursively find all PNG files matching the name
    const findPngs = dir => {
      let results = [];
      try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat && stat.isDirectory()) {
            results = results.concat(findPngs(fullPath));
          } else if (file === `${_name}.png`) {
            results.push({ path: fullPath, mtime: stat.mtime });
          }
        });
      } catch {
        // Ignore errors
      }
      return results;
    };

    const screenshots = findPngs(artifactsDir).sort(
      (a, b) => b.mtime - a.mtime,
    );

    return screenshots.length > 0 ? screenshots[0].path : null;
  }

  /**
   * Simple image comparison (basic byte comparison)
   * For production, consider using libraries like pixelmatch or looks-same
   * @param {string} imagePath1
   * @param {string} imagePath2
   * @returns {Promise<boolean>}
   */
  async compareImages(imagePath1, imagePath2) {
    try {
      const image1 = fs.readFileSync(imagePath1);
      const image2 = fs.readFileSync(imagePath2);

      // Allow 5% size difference (compression can vary slightly)
      const sizeTolerance = 0.05; // 5%
      const sizeDiff = Math.abs(image1.length - image2.length);
      const sizePercentDiff = sizeDiff / Math.max(image1.length, image2.length);

      console.log(
        `📏 Image sizes: ${image1.length} vs ${image2.length} bytes (${(
          sizePercentDiff * 100
        ).toFixed(2)}% diff)`,
      );

      if (sizePercentDiff > sizeTolerance) {
        console.log(
          `⚠️  Size difference exceeds ${sizeTolerance * 100}% tolerance`,
        );
        return false;
      }

      // If sizes are very close, consider them matching
      // (byte-by-byte comparison is unreliable for compressed images)
      if (sizePercentDiff <= 0.01) {
        // Within 1%
        console.log(`✅ Images are very similar (size diff < 1%)`);
        return true;
      }

      // For larger differences, do byte comparison on the shorter length
      const minLength = Math.min(image1.length, image2.length);
      const byteTolerance = 0.05; // 5% different bytes allowed
      let differentBytes = 0;

      for (let i = 0; i < minLength; i++) {
        if (image1[i] !== image2[i]) {
          differentBytes++;
        }
      }

      const diffPercentage = (differentBytes / minLength) * 100;
      console.log(`📊 Byte difference: ${diffPercentage.toFixed(2)}%`);

      return diffPercentage <= byteTolerance * 100;
    } catch (error) {
      console.error(`❌ Error comparing images: ${error.message}`);
      return false;
    }
  }

  /**
   * Clean up old output snapshots (keep only last N)
   * @param {number} keep - Number of snapshots to keep per test
   */
  cleanup(keep = 5) {
    const files = fs.readdirSync(this.outputDir);
    const groups = {};

    // Group files by test name
    files.forEach(file => {
      const match = file.match(/^(.+)_\d+\.png$/);
      if (match) {
        const testName = match[1];
        if (!groups[testName]) groups[testName] = [];
        groups[testName].push(file);
      }
    });

    // Keep only latest N for each test
    Object.entries(groups).forEach(([_testName, fileList]) => {
      if (fileList.length > keep) {
        const sorted = fileList
          .map(f => ({
            name: f,
            mtime: fs.statSync(path.join(this.outputDir, f)).mtime,
          }))
          .sort((a, b) => b.mtime - a.mtime);

        // Delete older files
        sorted.slice(keep).forEach(({ name }) => {
          fs.unlinkSync(path.join(this.outputDir, name));
          console.log(`🗑️  Cleaned up old snapshot: ${name}`);
        });
      }
    });
  }
}

module.exports = SnapshotMatcher;
