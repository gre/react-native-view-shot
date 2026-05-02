import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  FlatList,
  SectionList,
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { PreviewContainer } from '../components/shared';

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E9',
  '#F1948A',
  '#82E0AA',
  '#F8C471',
  '#AED6F1',
  '#D7BDE2',
];

const scrollViewItems = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  label: `Item ${i + 1}`,
}));

const flatListData = Array.from({ length: 30 }, (_, i) => ({
  id: String(i),
  title: `FlatList Item ${i + 1}`,
  color: COLORS[i % COLORS.length],
}));

// Items used to demo `snapshotContentContainer`. Six items at 80px tall (>= 480px
// of total content) inside a 200px viewport — items 3..6 are off-screen until
// the user scrolls. With `snapshotContentContainer: true` the capture should
// contain ALL six items, not just the visible viewport.
const contentContainerItems = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  label: `Item ${i + 1}`,
}));

const flatListContentContainerItems = Array.from({ length: 8 }, (_, i) => ({
  id: String(i),
  color: COLORS[(i + 3) % COLORS.length],
  title: `Row ${i + 1}`,
}));

const sectionListData = [
  {
    title: 'Fruits',
    data: ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'],
  },
  {
    title: 'Vegetables',
    data: ['Artichoke', 'Broccoli', 'Carrot', 'Daikon', 'Eggplant'],
  },
  { title: 'Grains', data: ['Amaranth', 'Barley', 'Corn', 'Durum', 'Emmer'] },
];

interface SectionState {
  uri: string | null;
  error: string | null;
}

const ScrollViewTestScreen: React.FC = () => {
  const scrollViewRef = useRef<ViewShot>(null);
  const flatListRef = useRef<ViewShot>(null);
  const sectionListRef = useRef<ViewShot>(null);
  // Refs for the `snapshotContentContainer` demo — these point at the raw
  // ScrollView / FlatList so the native module can read their content size.
  const contentContainerScrollRef = useRef<ScrollView>(null);
  const contentContainerFlatListRef = useRef<FlatList>(null);

  const [scrollViewCapture, setScrollViewCapture] = useState<SectionState>({
    uri: null,
    error: null,
  });
  const [flatListCapture, setFlatListCapture] = useState<SectionState>({
    uri: null,
    error: null,
  });
  const [sectionListCapture, setSectionListCapture] = useState<SectionState>({
    uri: null,
    error: null,
  });
  const [contentContainerCapture, setContentContainerCapture] =
    useState<SectionState>({
      uri: null,
      error: null,
    });
  const [flatListContentCapture, setFlatListContentCapture] =
    useState<SectionState>({
      uri: null,
      error: null,
    });

  const capture = async (
    ref: React.RefObject<ViewShot | null>,
    setter: (s: SectionState) => void,
  ) => {
    try {
      if (ref.current) {
        const uri = await captureRef(ref.current, {
          format: 'png',
          quality: 0.8,
        });
        setter({ uri, error: null });
      }
    } catch (error: any) {
      setter({ uri: null, error: error.message });
      console.error('Capture failed:', error);
    }
  };

  // Capture a raw ScrollView / FlatList ref using the `snapshotContentContainer`
  // option so the resulting image contains the full scrollable content, not
  // just the visible viewport.
  const captureContentContainer = async (
    ref: React.RefObject<ScrollView | FlatList | null>,
    setter: (s: SectionState) => void,
  ) => {
    try {
      if (ref.current) {
        const uri = await captureRef(ref.current, {
          format: 'png',
          quality: 1,
          snapshotContentContainer: true,
        });
        setter({ uri, error: null });
      }
    } catch (error: any) {
      setter({ uri: null, error: error.message });
      console.error('Capture failed:', error);
    }
  };

  const renderPreview = (state: SectionState) => {
    if (state.error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {state.error}</Text>
        </View>
      );
    }
    if (state.uri) {
      return (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Captured:</Text>
          <Image
            source={{ uri: state.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.outerScroll} testID="scrollViewTestScrollView">
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Only the visible portion of scrollable content is captured, not the
            full scrollable area. Scroll to different positions and capture to
            verify.
          </Text>
        </View>

        {/* ScrollView Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ScrollView</Text>
          <ViewShot ref={scrollViewRef} style={styles.captureArea}>
            <ScrollView style={styles.scrollList} nestedScrollEnabled>
              {scrollViewItems.map(item => (
                <View
                  key={item.id}
                  style={[styles.colorItem, { backgroundColor: item.color }]}
                >
                  <Text style={styles.itemText}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
          </ViewShot>
          <TouchableOpacity
            style={styles.button}
            onPress={() => capture(scrollViewRef, setScrollViewCapture)}
            testID="capture-scrollview"
          >
            <Text style={styles.buttonText}>Capture ScrollView</Text>
          </TouchableOpacity>
          {renderPreview(scrollViewCapture)}
        </View>

        {/* FlatList Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FlatList</Text>
          <ViewShot ref={flatListRef} style={styles.captureArea}>
            <FlatList
              style={styles.scrollList}
              nestedScrollEnabled
              data={flatListData}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View
                  style={[styles.colorItem, { backgroundColor: item.color }]}
                >
                  <Text style={styles.itemText}>{item.title}</Text>
                </View>
              )}
            />
          </ViewShot>
          <TouchableOpacity
            style={styles.button}
            onPress={() => capture(flatListRef, setFlatListCapture)}
            testID="capture-flatlist"
          >
            <Text style={styles.buttonText}>Capture FlatList</Text>
          </TouchableOpacity>
          {renderPreview(flatListCapture)}
        </View>

        {/* SectionList Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SectionList</Text>
          <ViewShot ref={sectionListRef} style={styles.captureArea}>
            <SectionList
              style={styles.scrollList}
              nestedScrollEnabled
              sections={sectionListData}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item }) => (
                <View style={styles.sectionItem}>
                  <Text style={styles.sectionItemText}>{item}</Text>
                </View>
              )}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
            />
          </ViewShot>
          <TouchableOpacity
            style={styles.button}
            onPress={() => capture(sectionListRef, setSectionListCapture)}
            testID="capture-sectionlist"
          >
            <Text style={styles.buttonText}>Capture SectionList</Text>
          </TouchableOpacity>
          {renderPreview(sectionListCapture)}
        </View>

        {/* snapshotContentContainer ScrollView demo */}
        <View style={styles.section} testID="snapshotContentContainer-section">
          <Text style={styles.sectionTitle}>
            snapshotContentContainer (ScrollView)
          </Text>
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              Pass{' '}
              <Text style={styles.hintCode}>
                snapshotContentContainer: true
              </Text>{' '}
              to capture the entire scrollable content of a ScrollView, not just
              the visible viewport. The viewport below is 200px tall but holds
              six 80px items — after capture you should see ALL six items
              (including the off-screen ones), stacked top to bottom.
            </Text>
          </View>
          <View style={styles.captureArea}>
            <ScrollView
              ref={contentContainerScrollRef}
              style={styles.contentContainerScroll}
              testID="snapshotContentContainer-scrollview"
            >
              {contentContainerItems.map(item => (
                <View
                  key={item.id}
                  style={[styles.tallItem, { backgroundColor: item.color }]}
                >
                  <Text style={styles.itemText}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              captureContentContainer(
                contentContainerScrollRef,
                setContentContainerCapture,
              )
            }
            testID="snapshotContentContainer-capture"
            accessible={true}
            accessibilityLabel="snapshotContentContainer-capture"
          >
            <Text style={styles.buttonText}>
              ✅ Capture full content (ScrollView)
            </Text>
          </TouchableOpacity>
          {contentContainerCapture.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error: {contentContainerCapture.error}
              </Text>
            </View>
          )}
          {contentContainerCapture.uri && (
            <View
              style={styles.contentPreviewWrapper}
              testID="snapshotContentContainer-preview"
            >
              <PreviewContainer
                capturedUri={contentContainerCapture.uri}
                title="✅ snapshotContentContainer Captured:"
                noteText="Expect all 6 items to be visible in this image."
                imageWidth={300}
                imageHeight={500}
              />
            </View>
          )}
        </View>

        {/* snapshotContentContainer FlatList demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            snapshotContentContainer (FlatList)
          </Text>
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              The same option also works with FlatList (which renders a
              ScrollView internally). The viewport is 200px tall with eight 80px
              rows — the capture should include every row.
            </Text>
          </View>
          <View style={styles.captureArea}>
            <FlatList
              ref={contentContainerFlatListRef}
              style={styles.contentContainerScroll}
              data={flatListContentContainerItems}
              keyExtractor={item => item.id}
              testID="snapshotContentContainer-flatlist"
              renderItem={({ item }) => (
                <View
                  style={[styles.tallItem, { backgroundColor: item.color }]}
                >
                  <Text style={styles.itemText}>{item.title}</Text>
                </View>
              )}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              captureContentContainer(
                contentContainerFlatListRef,
                setFlatListContentCapture,
              )
            }
            testID="snapshotContentContainer-flatlist-capture"
          >
            <Text style={styles.buttonText}>
              Capture full content (FlatList)
            </Text>
          </TouchableOpacity>
          {flatListContentCapture.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error: {flatListContentCapture.error}
              </Text>
            </View>
          )}
          {flatListContentCapture.uri && (
            <View style={styles.contentPreviewWrapper}>
              <PreviewContainer
                capturedUri={flatListContentCapture.uri}
                title="Captured (full content):"
                noteText="Expect all 8 rows to be visible in this image."
                imageWidth={300}
                imageHeight={500}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  outerScroll: {
    flex: 1,
  },
  infoBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  infoText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 18,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  captureArea: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  scrollList: {
    height: 200,
    backgroundColor: '#fff',
  },
  colorItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  itemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionItem: {
    padding: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionItemText: {
    fontSize: 15,
    color: '#333',
  },
  sectionHeader: {
    padding: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f0f0f0',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#28a745',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
  },
  hintBox: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F9A825',
  },
  hintText: {
    fontSize: 12,
    color: '#5D4037',
    lineHeight: 17,
  },
  hintCode: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#3E2723',
  },
  contentContainerScroll: {
    height: 200,
    backgroundColor: '#fff',
  },
  tallItem: {
    height: 80,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  contentPreviewWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
});

export default ScrollViewTestScreen;
