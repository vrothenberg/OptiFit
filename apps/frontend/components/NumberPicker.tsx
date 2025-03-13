import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Theme from '@/constants/Theme';

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  minValue: number;
  maxValue: number;
  step?: number;
  unit?: string;
  label?: string;
  error?: string | null;
}

const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

export default function NumberPicker({
  value,
  onChange,
  minValue,
  maxValue,
  step = 1,
  unit = '',
  label = '',
  error
}: NumberPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [animation] = useState(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // Generate the range of values
  const values: number[] = [];
  for (let i = minValue; i <= maxValue; i += step) {
    values.push(i);
  }
  
  // Find the index of the current value
  const currentIndex = values.indexOf(selectedValue);
  
  // Open the modal
  const openModal = () => {
    setSelectedValue(value);
    setModalVisible(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
    
    // Scroll to the current value after a small delay
    setTimeout(() => {
      if (scrollViewRef.current) {
        const index = values.indexOf(value);
        if (index !== -1) {
          scrollViewRef.current.scrollTo({
            y: index * ITEM_HEIGHT,
            animated: false
          });
        }
      }
    }, 100);
  };
  
  // Close the modal
  const closeModal = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setModalVisible(false);
    });
  };
  
  // Handle done button press
  const handleDone = () => {
    onChange(selectedValue);
    closeModal();
  };
  
  // Handle scroll end
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const newValue = values[index];
    
    // Snap to the nearest value
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: true
      });
    }
    
    // Update the selected value
    setSelectedValue(newValue);
  };
  
  // Handle scroll
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollPosition(event.nativeEvent.contentOffset.y);
  };
  
  // Increment the value
  const increment = () => {
    const currentIndex = values.indexOf(selectedValue);
    if (currentIndex < values.length - 1) {
      const newValue = values[currentIndex + 1];
      setSelectedValue(newValue);
      
      // Scroll to the new value
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: (currentIndex + 1) * ITEM_HEIGHT,
          animated: true
        });
      }
    }
  };
  
  // Decrement the value
  const decrement = () => {
    const currentIndex = values.indexOf(selectedValue);
    if (currentIndex > 0) {
      const newValue = values[currentIndex - 1];
      setSelectedValue(newValue);
      
      // Scroll to the new value
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          y: (currentIndex - 1) * ITEM_HEIGHT,
          animated: true
        });
      }
    }
  };
  
  const modalTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0]
  });
  
  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5]
  });
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[styles.pickerButton, error ? styles.pickerButtonError : null]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <Text style={styles.valueText}>{value}{unit}</Text>
        <FontAwesome name="chevron-down" size={16} color={Theme.COLORS.MUTED} />
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.backdrop, 
              { opacity: backdropOpacity }
            ]} 
            onTouchEnd={closeModal}
          />
          
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: modalTranslateY }] }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Value'}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color={Theme.COLORS.DEFAULT} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.wheelContainer}>
              {/* Decrement button */}
              <TouchableOpacity 
                style={styles.button} 
                onPress={decrement}
                disabled={selectedValue <= minValue}
              >
                <FontAwesome 
                  name="chevron-up" 
                  size={16} 
                  color={selectedValue <= minValue ? Theme.COLORS.MUTED : Theme.COLORS.DEFAULT} 
                />
              </TouchableOpacity>
              
              {/* Scroll wheel */}
              <View style={styles.scrollContainer}>
                {/* Selection indicator */}
                <View style={styles.selectionIndicator} />
                
                <ScrollView
                  ref={scrollViewRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={handleScrollEnd}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                  contentContainerStyle={{
                    paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2)
                  }}
                >
                  {values.map((num) => (
                    <View key={num} style={styles.item}>
                      <Text 
                        style={[
                          styles.itemText,
                          Math.abs(scrollPosition - values.indexOf(num) * ITEM_HEIGHT) < ITEM_HEIGHT / 2 
                            ? styles.itemTextSelected 
                            : null
                        ]}
                      >
                        {num}{unit}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
              


            {/* Increment button */}
            <TouchableOpacity 
                style={styles.button} 
                onPress={increment}
                disabled={selectedValue >= maxValue}
              >
                <FontAwesome 
                  name="chevron-down" 
                  size={16} 
                  color={selectedValue >= maxValue ? Theme.COLORS.MUTED : Theme.COLORS.DEFAULT} 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={handleDone}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonError: {
    borderColor: Theme.COLORS.ERROR,
  },
  valueText: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  errorText: {
    color: Theme.COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
  },
  closeButton: {
    padding: 5,
  },
  wheelContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  scrollContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    marginTop: -ITEM_HEIGHT / 2,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: Theme.COLORS.MUTED,
  },
  itemTextSelected: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
  },
  button: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  doneButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  doneButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
