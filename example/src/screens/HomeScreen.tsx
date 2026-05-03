import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useColorScheme,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../../App';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface TestCase {
  key: keyof RootStackParamList;
  title: string;
  description: string;
  emoji: string;
  priority: 'high' | 'medium' | 'low';
  status?: 'bug' | 'new' | 'tested';
}

const testCases: { [category: string]: TestCase[] } = {
  '🟢 BASIC TESTS': [
    {
      key: 'BasicTest',
      title: 'Basic ViewShot',
      description: 'Simple view capture test',
      emoji: '📸',
      priority: 'high',
      status: 'tested',
    },
    {
      key: 'FullScreen',
      title: 'Full Screen',
      description: 'Capture entire screen with captureScreen()',
      emoji: '🖥️',
      priority: 'high',
      status: 'tested',
    },
    {
      key: 'Transparency',
      title: 'Transparency',
      description: 'PNG with transparent background test',
      emoji: '⚪',
      priority: 'high',
      status: 'tested',
    },
    {
      key: 'FS',
      title: 'File System',
      description: 'Save to file operations (tmpfile)',
      emoji: '💾',
      priority: 'high',
      status: 'tested',
    },
    {
      key: 'ScrollView',
      title: 'ScrollView & Lists',
      description: 'ScrollView, FlatList, SectionList capture',
      emoji: '📜',
      priority: 'high',
      status: 'new',
    },
  ],
  '🟡 MEDIA TESTS': [
    {
      key: 'Video',
      title: 'Video Capture',
      description: 'Video player with GL surfaces (Android)',
      emoji: '📹',
      priority: 'medium',
      status: 'tested',
    },
    {
      key: 'Image',
      title: 'Image Capture',
      description: 'Local/remote images with format options',
      emoji: '🖼️',
      priority: 'medium',
      status: 'tested',
    },
    {
      key: 'WebView',
      title: 'WebView Capture',
      description: 'Web content capture (iOS bug #577 fixed with manual mode)',
      emoji: '🌐',
      priority: 'high',
      status: 'tested',
    },
  ],
  '🔴 RENDERING CORRECTNESS': [
    {
      key: 'Rendering',
      title: 'Rendering test card',
      description:
        'Transforms / nested opacity / z-index / scroll / overflow / Skia',
      emoji: '🧪',
      priority: 'high',
      status: 'new',
    },
    {
      key: 'StyleFilters',
      title: 'Style filters',
      description:
        'RN `filter` prop (brightness/contrast/blur/...) — known gap (#578)',
      emoji: '🎨',
      priority: 'high',
      status: 'bug',
    },
  ],
  '🟠 ADVANCED TESTS': [
    // {
    //   key: 'MapView',
    //   title: 'MapView',
    //   description: 'Map component capture - DISABLED (complex setup)',
    //   emoji: '🗺️',
    //   priority: 'medium',
    //   status: 'bug',
    // },
    {
      key: 'SVG',
      title: 'SVG Inline',
      description: 'Inline SVG capture with react-native-svg',
      emoji: '🎨',
      priority: 'medium',
      status: 'tested',
    },
    {
      key: 'SVGUri',
      title: 'SVG URI',
      description: 'Remote SVG capture with react-native-svg',
      emoji: '🔗',
      priority: 'medium',
      status: 'tested',
    },
    // Canvas/Skia temporarily disabled - needs native setup
    // {
    //   key: 'Canvas',
    //   title: 'Canvas/Skia',
    //   description: 'Canvas drawing capture - TEMP DISABLED (native setup)',
    //   emoji: '🖌️',
    //   priority: 'medium',
    //   status: 'new',
    // },
    {
      key: 'Modal',
      title: 'Modal',
      description: 'Modal dialog capture',
      emoji: '📱',
      priority: 'medium',
      status: 'tested',
    },
  ],
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7',
  };

  const renderTestCase = (testCase: TestCase) => {
    const priorityColor = {
      high: '#FF3B30',
      medium: '#FF9500',
      low: '#34C759',
    }[testCase.priority];

    return (
      <TouchableOpacity
        key={testCase.key}
        style={[styles.testCase, { borderLeftColor: priorityColor }]}
        onPress={() => navigation.navigate(testCase.key)}
        testID={`nav-${testCase.title.toLowerCase().replace(/\s+/g, '-')}`}
        accessible={true}
        accessibilityLabel={testCase.title}
      >
        <View style={styles.testCaseContent}>
          <Text style={styles.testEmoji}>{testCase.emoji}</Text>
          <View style={styles.testInfo}>
            <View style={styles.testTitleRow}>
              <Text style={styles.testTitle}>{testCase.title}</Text>
              {testCase.status && (
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        testCase.status === 'bug'
                          ? '#FF3B30'
                          : testCase.status === 'tested'
                            ? '#6c757d'
                            : '#007AFF',
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {testCase.status === 'bug'
                      ? 'BUG'
                      : testCase.status === 'tested'
                        ? '✅'
                        : 'NEW'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.testDescription}>{testCase.description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = (category: string, tests: TestCase[]) => (
    <View key={category} style={styles.category}>
      <Text style={styles.categoryTitle}>{category}</Text>
      {tests.map(renderTestCase)}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={styles.scrollView} testID="homeScrollView">
        <View style={styles.header}>
          <Text style={styles.title}>🚀 React Native ViewShot</Text>
          <Text style={styles.subtitle}>New Architecture Test Suite</Text>
          <View style={styles.architectureBadge}>
            <Text style={styles.architectureText}>
              ✅ Fabric + TurboModules
            </Text>
          </View>
        </View>

        {Object.entries(testCases).map(([category, tests]) =>
          renderCategory(category, tests),
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tap any test to verify react-native-view-shot functionality
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  architectureBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  architectureText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  category: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  testCase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testCaseContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  testEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  testInfo: {
    flex: 1,
  },
  testTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
