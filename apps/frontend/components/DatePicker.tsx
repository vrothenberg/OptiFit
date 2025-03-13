import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, ScrollView } from 'react-native';
import Theme from '@/constants/Theme';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
}

export default function DatePicker({ value, onChange, label, placeholder = 'Select date' }: DatePickerProps) {
  const [isPickerVisible, setPickerVisible] = useState(false);
  
  // Parse the initial value
  const parseDate = (dateStr: string) => {
    try {
      const date = dateStr ? new Date(dateStr) : new Date();
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1, // JavaScript months are 0-indexed
        day: date.getDate()
      };
    } catch (e) {
      console.error('Error parsing date value:', e);
      const today = new Date();
      return {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
      };
    }
  };
  
  const { year, month, day } = parseDate(value);
  
  const [tempYear, setTempYear] = useState(year);
  const [tempMonth, setTempMonth] = useState(month);
  const [tempDay, setTempDay] = useState(day);

  // Generate years (current year - 100 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());
  
  // Generate months (1-12)
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  
  // Generate days (1-31, adjusted for month)
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const days = Array.from(
    { length: getDaysInMonth(tempYear, tempMonth) }, 
    (_, i) => (i + 1).toString()
  );

  const handleConfirm = () => {
    // Format as ISO date string (YYYY-MM-DD)
    const formattedMonth = tempMonth.toString().padStart(2, '0');
    const formattedDay = tempDay.toString().padStart(2, '0');
    const dateString = `${tempYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateString);
    setPickerVisible(false);
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return placeholder;
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      console.error('Error formatting date for display:', e);
      return placeholder;
    }
  };

  // Render picker UI
  const renderPicker = () => {
    return (
      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label || 'Select Date'}</Text>
            
            <View style={styles.pickerContainer}>
              {/* Month Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.scrollPicker}>
                  {months.map(monthObj => (
                    <TouchableOpacity
                      key={monthObj.value}
                      style={[
                        styles.dateOption,
                        tempMonth === monthObj.value && styles.selectedDateOption
                      ]}
                      onPress={() => {
                        setTempMonth(monthObj.value);
                        // Adjust day if it exceeds the days in the new month
                        const daysInNewMonth = getDaysInMonth(tempYear, monthObj.value);
                        if (tempDay > daysInNewMonth) {
                          setTempDay(daysInNewMonth);
                        }
                      }}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        tempMonth === monthObj.value && styles.selectedDateOptionText
                      ]}>
                        {monthObj.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Day Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.scrollPicker}>
                  {days.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dateOption,
                        tempDay === parseInt(day) && styles.selectedDateOption
                      ]}
                      onPress={() => setTempDay(parseInt(day))}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        tempDay === parseInt(day) && styles.selectedDateOptionText
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Year Picker */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.scrollPicker}>
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.dateOption,
                        tempYear === parseInt(year) && styles.selectedDateOption
                      ]}
                      onPress={() => {
                        setTempYear(parseInt(year));
                        // Adjust day if it exceeds the days in the new month/year (e.g., Feb 29 in non-leap years)
                        const daysInNewMonth = getDaysInMonth(parseInt(year), tempMonth);
                        if (tempDay > daysInNewMonth) {
                          setTempDay(daysInNewMonth);
                        }
                      }}
                    >
                      <Text style={[
                        styles.dateOptionText,
                        tempYear === parseInt(year) && styles.selectedDateOptionText
                      ]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity 
        style={styles.dateInput}
        onPress={() => setPickerVisible(true)}
      >
        <Text style={styles.dateText}>{formatDisplayDate(value)}</Text>
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
  dateInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
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
  dateOption: {
    padding: 10,
    alignItems: 'center',
  },
  selectedDateOption: {
    backgroundColor: '#e6f7ff',
    borderRadius: 5,
  },
  dateOptionText: {
    fontSize: 16,
  },
  selectedDateOptionText: {
    color: Theme.COLORS.PRIMARY,
    fontWeight: 'bold',
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
