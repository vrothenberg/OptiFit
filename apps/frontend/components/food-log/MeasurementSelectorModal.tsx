import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal,
  FlatList
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { styles } from '../styles/FoodLog.styles';
import Theme from '@/constants/Theme';

interface MeasurementOption {
  label: string;
  value: string;
  weight: number;
}

interface MeasurementSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  options: MeasurementOption[];
  onSelect: (option: MeasurementOption) => void;
}

export const MeasurementSelectorModal: React.FC<MeasurementSelectorModalProps> = ({
  visible,
  onClose,
  options,
  onSelect
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { maxHeight: '60%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Measurement</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={24} color={Theme.COLORS.MUTED} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={options}
            keyExtractor={(item, index) => `measure-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.measureItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.measureItemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.measureSeparator} />}
            ListEmptyComponent={() => (
              <Text style={styles.emptyListText}>No measurement options available</Text>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};
