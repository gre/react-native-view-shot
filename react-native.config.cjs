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
        projects: [
          {
            projectFile: "RNViewShot\\RNViewShot.csproj",
            directDependency: true,
            projectName: "RNViewShot",
            projectLang: "cs",
            projectGuid: "{64171807-A036-45AC-84F4-54EB8F6FB1E5}",
            csNamespaces: ["RNViewShot"],
            csPackageProviders: ["RNViewShot.ReactPackageProvider"],
          },
        ],
      },
    },
  },
};
