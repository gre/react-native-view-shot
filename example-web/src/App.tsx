import React, {useState} from "react";
import {View, StyleSheet} from "react-native";
import HomeScreen from "./screens/HomeScreen";
import BasicTestScreen from "./screens/BasicTestScreen";
import ImageTestScreen from "./screens/ImageTestScreen";
import ComplexLayoutScreen from "./screens/ComplexLayoutScreen";
import CORSImageTestScreen from "./screens/CORSImageTestScreen";
import type {Screen} from "./types";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("Home");

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen("Home");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "Home":
        return <HomeScreen navigate={navigate} />;
      case "BasicTest":
        return <BasicTestScreen goBack={goBack} />;
      case "Image":
        return <ImageTestScreen goBack={goBack} />;
      case "ComplexLayout":
        return <ComplexLayoutScreen goBack={goBack} />;
      case "CORSImage":
        return <CORSImageTestScreen goBack={goBack} />;
      default:
        return <HomeScreen navigate={navigate} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: "100vh",
  },
});

export default App;
