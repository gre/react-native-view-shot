module.exports = {
  dependency: {
    platforms: {
      ios: {},
      android: {
        sourceDir: "./android",
        packageImportPath:
          "import fr.greweb.reactnativeviewshot.RNViewShotPackage;",
        packageInstance: "new RNViewShotPackage()",
      },
      windows: {
        sourceDir: "windows",
        solutionFile: "RNViewShot.sln",
        project: {
          projectFile: "RNViewShot\\RNViewShot.csproj",
        },
      },
    },
  },
};
