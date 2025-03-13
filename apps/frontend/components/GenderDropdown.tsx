import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Animated,
  Dimensions
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Theme from '@/constants/Theme';

interface GenderDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  label?: string;
}

type GenderOption = {
  value: string;
  label: string;
  icon: string;
};

const GENDER_OPTIONS: GenderOption[] = [
  { value: 'male', label: 'Male', icon: 'mars' },
  { value: 'female', label: 'Female', icon: 'venus' },
  { value: 'other', label: 'Other', icon: 'genderless' }
];

export default function GenderDropdown({ value, onChange, error, label = 'Gender' }: GenderDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  
  // Find the selected option
  const selectedOption = GENDER_OPTIONS.find(option => option.value === value) || GENDER_OPTIONS[0];
  
  const openModal = () => {
    setModalVisible(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  };
  
  const closeModal = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      setModalVisible(false);
    });
  };
  
  const handleSelect = (option: GenderOption) => {
    onChange(option.value);
    closeModal();
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
        style={[styles.dropdownButton, error ? styles.dropdownButtonError : null]}
        onPress={openModal}
        activeOpacity={0.7}
      >
        <View style={styles.selectedOption}>
          <FontAwesome name={selectedOption.icon as any} size={18} color={Theme.COLORS.DEFAULT} style={styles.optionIcon} />
          <Text style={styles.selectedText}>{selectedOption.label}</Text>
        </View>
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
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <FontAwesome name="times" size={20} color={Theme.COLORS.DEFAULT} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={GENDER_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value ? styles.selectedItem : null
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <FontAwesome name={item.icon as any} size={20} color={item.value === value ? Theme.COLORS.PRIMARY : Theme.COLORS.DEFAULT} style={styles.optionIcon} />
                  <Text style={[
                    styles.optionText,
                    item.value === value ? styles.selectedItemText : null
                  ]}>
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <FontAwesome name="check" size={18} color={Theme.COLORS.PRIMARY} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
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
  dropdownButton: {
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
  dropdownButtonError: {
    borderColor: Theme.COLORS.ERROR,
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  optionIcon: {
    marginRight: 10,
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
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  selectedItem: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  optionText: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
    flex: 1,
  },
  selectedItemText: {
    color: Theme.COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  checkIcon: {
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});
