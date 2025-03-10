import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';

// Mock data for exercise types
const EXERCISE_TYPES = [
  { id: 1, name: 'Running', icon: 'running', category: 'Cardio', caloriesPerMinute: 10 },
  { id: 2, name: 'Walking', icon: 'walking', category: 'Cardio', caloriesPerMinute: 5 },
  { id: 3, name: 'Cycling', icon: 'bicycle', category: 'Cardio', caloriesPerMinute: 8 },
  { id: 4, name: 'Swimming', icon: 'swimmer', category: 'Cardio', caloriesPerMinute: 9 },
  { id: 5, name: 'Weight Training', icon: 'dumbbell', category: 'Strength', caloriesPerMinute: 7 },
  { id: 6, name: 'Yoga', icon: 'om', category: 'Flexibility', caloriesPerMinute: 4 },
  { id: 7, name: 'HIIT', icon: 'bolt', category: 'Cardio', caloriesPerMinute: 12 },
  { id: 8, name: 'Pilates', icon: 'spa', category: 'Flexibility', caloriesPerMinute: 5 },
  { id: 9, name: 'Basketball', icon: 'basketball-ball', category: 'Sports', caloriesPerMinute: 8 },
  { id: 10, name: 'Tennis', icon: 'table-tennis', category: 'Sports', caloriesPerMinute: 7 },
];

// Mock data for exercise history
const EXERCISE_HISTORY = [
  { 
    id: 1, 
    date: 'Today', 
    exercises: [
      { id: 1, name: 'Morning Run', type: 'Running', time: '7:30 AM', duration: 30, calories: 300 },
      { id: 2, name: 'Afternoon Yoga', type: 'Yoga', time: '5:30 PM', duration: 45, calories: 180 },
    ]
  },
  { 
    id: 2, 
    date: 'Yesterday', 
    exercises: [
      { id: 1, name: 'Weight Training', type: 'Weight Training', time: '6:45 AM', duration: 60, calories: 420 },
      { id: 2, name: 'Evening Walk', type: 'Walking', time: '7:30 PM', duration: 40, calories: 200 },
    ]
  },
  { 
    id: 3, 
    date: 'March 2, 2025', 
    exercises: [
      { id: 1, name: 'Swimming', type: 'Swimming', time: '8:00 AM', duration: 45, calories: 405 },
    ]
  },
];

export default function ExerciseLogScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState('Medium');
  
  // Filter exercise types based on search query
  const filteredExerciseTypes = EXERCISE_TYPES.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle exercise type selection
  const handleExerciseSelect = (exercise: any) => {
    setSelectedExercise(exercise);
    setExerciseName(exercise.name);
  };
  
  // Handle adding exercise to log
  const handleAddExercise = () => {
    // In a real app, this would add the exercise to the user's log
    // For now, we'll just close the modal
    setShowAddModal(false);
    setSelectedExercise(null);
    setExerciseName('');
    setDuration('30');
    setIntensity('Medium');
  };
  
  // Calculate calories burned based on exercise type, duration, and intensity
  const calculateCalories = () => {
    if (!selectedExercise) return 0;
    
    let intensityMultiplier = 1;
    if (intensity === 'Low') intensityMultiplier = 0.8;
    if (intensity === 'High') intensityMultiplier = 1.2;
    
    return Math.round(selectedExercise.caloriesPerMinute * parseInt(duration) * intensityMultiplier);
  };

  return (
    <View style={styles.container}>
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Exercise Log</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <FontAwesome name="plus" size={16} color={Theme.COLORS.WHITE} />
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
      
      {/* Exercise History */}
      <ScrollView style={styles.scrollContainer}>
        {EXERCISE_HISTORY.map(day => (
          <View key={day.id} style={styles.dayContainer}>
            <Text style={styles.dayTitle}>{day.date}</Text>
            
            {day.exercises.map(exercise => (
              <View key={exercise.id} style={styles.exerciseContainer}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseIconContainer}>
                    <FontAwesome 
                      name="heartbeat" 
                      size={20} 
                      color={Theme.COLORS.WHITE} 
                      style={styles.exerciseIcon}
                    />
                  </View>
                  <View style={styles.exerciseDetails}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseType}>{exercise.type}</Text>
                  </View>
                  <View style={styles.exerciseStats}>
                    <Text style={styles.exerciseTime}>{exercise.time}</Text>
                    <Text style={styles.exerciseCalories}>-{exercise.calories} cal</Text>
                  </View>
                </View>
                
                <View style={styles.exerciseFooter}>
                  <View style={styles.exerciseMetric}>
                    <FontAwesome name="clock-o" size={16} color={Theme.COLORS.MUTED} />
                    <Text style={styles.exerciseMetricText}>{exercise.duration} min</Text>
                  </View>
                  <View style={styles.exerciseMetric}>
                    <FontAwesome name="fire" size={16} color={Theme.COLORS.MUTED} />
                    <Text style={styles.exerciseMetricText}>{exercise.calories} cal</Text>
                  </View>
                  <View style={styles.exerciseMetric}>
                    <FontAwesome name="bolt" size={16} color={Theme.COLORS.MUTED} />
                    <Text style={styles.exerciseMetricText}>{Math.round(exercise.calories / exercise.duration)} cal/min</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      
      {/* Add Exercise Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <FontAwesome name="times" size={24} color={Theme.COLORS.MUTED} />
              </TouchableOpacity>
            </View>
            
            {selectedExercise ? (
              <View style={styles.exerciseFormContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Exercise Name</Text>
                  <TextInput
                    style={styles.input}
                    value={exerciseName}
                    onChangeText={setExerciseName}
                    placeholder="Enter exercise name"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Duration (minutes)</Text>
                  <View style={styles.durationContainer}>
                    <TouchableOpacity 
                      style={styles.durationButton}
                      onPress={() => setDuration(prev => Math.max(5, parseInt(prev) - 5).toString())}
                    >
                      <FontAwesome name="minus" size={16} color={Theme.COLORS.PRIMARY} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.durationInput}
                      value={duration}
                      onChangeText={setDuration}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity 
                      style={styles.durationButton}
                      onPress={() => setDuration(prev => (parseInt(prev) + 5).toString())}
                    >
                      <FontAwesome name="plus" size={16} color={Theme.COLORS.PRIMARY} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Intensity</Text>
                  <View style={styles.intensityContainer}>
                    {['Low', 'Medium', 'High'].map(level => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.intensityButton,
                          intensity === level && styles.intensityButtonSelected
                        ]}
                        onPress={() => setIntensity(level)}
                      >
                        <Text 
                          style={[
                            styles.intensityButtonText,
                            intensity === level && styles.intensityButtonTextSelected
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.caloriesContainer}>
                  <Text style={styles.caloriesLabel}>Estimated Calories Burned</Text>
                  <Text style={styles.caloriesValue}>{calculateCalories()} cal</Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.addExerciseButton}
                  onPress={handleAddExercise}
                >
                  <Text style={styles.addExerciseButtonText}>Add to Log</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setSelectedExercise(null)}
                >
                  <Text style={styles.backButtonText}>Back to Exercise Types</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.searchContainer}>
                  <FontAwesome name="search" size={16} color={Theme.COLORS.MUTED} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search for exercise..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                
                <FlatList
                  data={filteredExerciseTypes}
                  keyExtractor={item => item.id.toString()}
                  style={styles.exerciseList}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.exerciseListItem}
                      onPress={() => handleExerciseSelect(item)}
                    >
                      <View style={styles.exerciseListItemIcon}>
                        <FontAwesome name="heartbeat" size={20} color={Theme.COLORS.WHITE} />
                      </View>
                      <View style={styles.exerciseListItemDetails}>
                        <Text style={styles.exerciseListItemName}>{item.name}</Text>
                        <Text style={styles.exerciseListItemCategory}>{item.category}</Text>
                      </View>
                      <Text style={styles.exerciseListItemCalories}>{item.caloriesPerMinute} cal/min</Text>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyListText}>
                      No exercise types found. Try a different search term.
                    </Text>
                  }
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: Theme.COLORS.WHITE,
    fontWeight: '600',
    marginLeft: 5,
  },
  scrollContainer: {
    flex: 1,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  exerciseContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseIconContainer: {
    marginRight: 15,
  },
  exerciseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.COLORS.INFO,
    textAlign: 'center',
    lineHeight: 40,
  },
  exerciseDetails: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 2,
  },
  exerciseType: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
  },
  exerciseStats: {
    alignItems: 'flex-end',
  },
  exerciseTime: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    marginBottom: 2,
  },
  exerciseCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.COLORS.SUCCESS,
  },
  exerciseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  exerciseMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseMetricText: {
    fontSize: 14,
    color: Theme.COLORS.DEFAULT,
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 15,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  exerciseList: {
    maxHeight: 400,
  },
  exerciseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseListItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.COLORS.INFO,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseListItemDetails: {
    flex: 1,
  },
  exerciseListItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 2,
  },
  exerciseListItemCategory: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
  },
  exerciseListItemCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.COLORS.INFO,
  },
  emptyListText: {
    textAlign: 'center',
    padding: 20,
    color: Theme.COLORS.MUTED,
  },
  exerciseFormContainer: {
    paddingVertical: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
  },
  intensityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 8,
  },
  intensityButtonSelected: {
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  intensityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
  },
  intensityButtonTextSelected: {
    color: Theme.COLORS.WHITE,
  },
  caloriesContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  caloriesLabel: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    marginBottom: 5,
  },
  caloriesValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.COLORS.SUCCESS,
  },
  addExerciseButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  addExerciseButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: Theme.COLORS.PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
});
