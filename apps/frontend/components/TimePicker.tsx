import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, ScrollView } from 'react-native';
import Theme from '@/constants/Theme';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
}

export default function TimePicker({ value, onChange, label }: TimePickerProps) {
  const [isPickerVisible, setPickerVisible] = useState(false);
  
  // Parse the initial value
  const parseTimeValue = (timeStr: string) => {
    let hour = '7';
    let minute = '00';
    let period = 'AM';
    
    try {
      // Handle formats like "7:30 AM" or "10:00 PM"
      const parts = timeStr.split(':');
      if (parts.length >= 2) {
        hour = parts[0].trim();
        const minuteAndPeriod = parts[1].split(' ');
        minute = minuteAndPeriod[0].trim();
        if (minuteAndPeriod.length > 1) {
          period = minuteAndPeriod[1].trim().toUpperCase();
        }
      }
    } catch (e) {
      console.error('Error parsing time value:', e);
    }
    
    return { hour, minute, period };
  };
  
  const { hour, minute, period } = parseTimeValue(value);
  
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);
  const [tempPeriod, setTempPeriod] = useState(period);

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => ((i + 1).toString()));
  
  // Generate minutes in 15-minute increments (00, 15, 30, 45)
  const minutes = ['00', '15', '30', '45'];

  const handleConfirm = () => {
    const newTime = `${tempHour}:${tempMinute} ${tempPeriod}`;
    onChange(newTime);
    setPickerVisible(false);
  };

  // Render different picker UI based on platform
  const renderPicker = () => {
    if (Platform.OS === 'web') {
      return (
        <Modal
          visible={isPickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setPickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{label || 'Select Time'}</Text>
              
              <View style={styles.pickerContainer}>
                {/* Hour Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Hour</Text>
                  <ScrollView style={styles.scrollPicker}>
                    {hours.map(hour => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timeOption,
                          tempHour === hour && styles.selectedTimeOption
                        ]}
                        onPress={() => setTempHour(hour)}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          tempHour === hour && styles.selectedTimeOptionText
                        ]}>
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {/* Minute Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Minute</Text>
                  <ScrollView style={styles.scrollPicker}>
                    {minutes.map(minute => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timeOption,
                          tempMinute === minute && styles.selectedTimeOption
                        ]}
                        onPress={() => setTempMinute(minute)}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          tempMinute === minute && styles.selectedTimeOptionText
                        ]}>
                          {minute}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {/* AM/PM Picker */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>AM/PM</Text>
                  <View style={styles.periodContainer}>
                    <TouchableOpacity
                      style={[
                        styles.periodOption,
                        tempPeriod === 'AM' && styles.selectedPeriodOption
                      ]}
                      onPress={() => setTempPeriod('AM')}
                    >
                      <Text style={[
                        styles.periodOptionText,
                        tempPeriod === 'AM' && styles.selectedPeriodOptionText
                      ]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.periodOption,
                        tempPeriod === 'PM' && styles.selectedPeriodOption
                      ]}
                      onPress={() => setTempPeriod('PM')}
                    >
                      <Text style={[
                        styles.periodOptionText,
                        tempPeriod === 'PM' && styles.selectedPeriodOptionText
                      ]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setPickerVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.confirmButton]} 
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    } else {
      // For native platforms, we'll use a simpler picker for now
      // In a real app, you'd use the native picker components
      return (
        <Modal
          visible={isPickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setPickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{label || 'Select Time'}</Text>
              
              <View style={styles.nativePickerContainer}>
                {/* Hour */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Hour</Text>
                  <ScrollView style={styles.scrollPicker}>
                    {hours.map(hour => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.timeOption,
                          tempHour === hour && styles.selectedTimeOption
                        ]}
                        onPress={() => setTempHour(hour)}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          tempHour === hour && styles.selectedTimeOptionText
                        ]}>
                          {hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {/* Minute */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Minute</Text>
                  <ScrollView style={styles.scrollPicker}>
                    {minutes.map(minute => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.timeOption,
                          tempMinute === minute && styles.selectedTimeOption
                        ]}
                        onPress={() => setTempMinute(minute)}
                      >
                        <Text style={[
                          styles.timeOptionText,
                          tempMinute === minute && styles.selectedTimeOptionText
                        ]}>
                          {minute}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                {/* AM/PM */}
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>AM/PM</Text>
                  <View style={styles.periodContainer}>
                    <TouchableOpacity
                      style={[
                        styles.periodOption,
                        tempPeriod === 'AM' && styles.selectedPeriodOption
                      ]}
                      onPress={() => setTempPeriod('AM')}
                    >
                      <Text style={[
                        styles.periodOptionText,
                        tempPeriod === 'AM' && styles.selectedPeriodOptionText
                      ]}>
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.periodOption,
                        tempPeriod === 'PM' && styles.selectedPeriodOption
                      ]}
                      onPress={() => setTempPeriod('PM')}
                    >
                      <Text style={[
                        styles.periodOptionText,
                        tempPeriod === 'PM' && styles.selectedPeriodOptionText
                      ]}>
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => setPickerVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.button, styles.confirmButton]} 
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      );
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={styles.timeInput}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={styles.timeText}>{value}</Text>
      </TouchableOpacity>
      
      {renderPicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeText: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: Platform.OS === 'web' ? 400 : '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 10,
    color: Theme.COLORS.MUTED,
  },
  scrollPicker: {
    height: 150,
    width: '100%',
  },
  timeOption: {
    padding: 10,
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
  },
  timeOptionText: {
    fontSize: 16,
  },
  selectedTimeOptionText: {
    color: Theme.COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  periodContainer: {
    height: 150,
    justifyContent: 'space-evenly',
  },
  periodOption: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  selectedPeriodOption: {
    backgroundColor: '#e6f7ff',
  },
  periodOptionText: {
    fontSize: 16,
  },
  selectedPeriodOptionText: {
    color: Theme.COLORS.PRIMARY,
    fontWeight: 'bold',
  },
  nativePickerContainer: {
    flexDirection: 'row',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  cancelButtonText: {
    color: Theme.COLORS.DEFAULT,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
