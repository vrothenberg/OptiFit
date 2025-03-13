import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';
import { 
  getExerciseLogs, 
  createExerciseLog, 
  updateExerciseLog, 
  deleteExerciseLog 
} from '@/services/loggingService';
import { 
  ExerciseLog, 
  ExerciseLogsResponse, 
  CreateExerciseLogRequest 
} from '@/services/api/types';

// Common exercise types for quick selection
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

export default function ExerciseLogScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [exerciseName, setExerciseName] = useState('');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState('Medium');
  
  // API-related state
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch exercise logs when component mounts
  useEffect(() => {
    fetchExerciseLogs();
  }, []);
  
  // Fetch exercise logs from API
  const fetchExerciseLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get today's date and a week ago for filtering
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 7); // Get logs from the past week
      
      // Format dates as ISO strings
      const endDate = today.toISOString();
      const startDate = startOfWeek.toISOString();
      
      // Fetch exercise logs from API
      const response = await getExerciseLogs({ startDate, endDate, limit: 50 });
      setExerciseLogs(response.data);
    } catch (error: any) {
      console.error('Error fetching exercise logs:', error);
      setError('Failed to load exercise logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
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
  const handleAddExercise = async () => {
    if (!selectedExercise) return;
    
    setIsSubmitting(true);
    
    try {
      // Calculate calories based on exercise type, duration, and intensity
      let intensityMultiplier = 1;
      if (intensity === 'Low') intensityMultiplier = 0.8;
      if (intensity === 'High') intensityMultiplier = 1.2;
      
      const caloriesBurned = Math.round(selectedExercise.caloriesPerMinute * parseInt(duration) * intensityMultiplier);
      
      // Create exercise log request
      const exerciseLogRequest: CreateExerciseLogRequest = {
        name: exerciseName,
        type: selectedExercise.name,
        duration: parseInt(duration),
        intensity: intensity,
        calories: caloriesBurned,
        time: new Date().toISOString(),
      };
      
      // Call API to create exercise log
      await createExerciseLog(exerciseLogRequest);
      
      // Refresh exercise logs
      await fetchExerciseLogs();
      
      // Close modal and reset state
      setShowAddModal(false);
      setSelectedExercise(null);
      setExerciseName('');
      setDuration('30');
      setIntensity('Medium');
    } catch (error: any) {
      console.error('Error adding exercise log:', error);
      Alert.alert('Error', 'Failed to add exercise to log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate calories burned based on exercise type, duration, and intensity
  const calculateCalories = () => {
    if (!selectedExercise) return 0;
    
    let intensityMultiplier = 1;
    if (intensity === 'Low') intensityMultiplier = 0.8;
    if (intensity === 'High') intensityMultiplier = 1.2;
    
    return Math.round(selectedExercise.caloriesPerMinute * parseInt(duration) * intensityMultiplier);
  };
  
  // Helper function to format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // Check if the date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise, return the formatted date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Helper function to format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Group exercise logs by date
  const groupedExerciseLogs = () => {
    if (!exerciseLogs || exerciseLogs.length === 0) {
      return [];
    }
    
    // Group logs by date
    const logsByDate: Record<string, ExerciseLog[]> = {};
    
    exerciseLogs.forEach(log => {
      const dateKey = formatDate(log.time);
      if (!logsByDate[dateKey]) {
        logsByDate[dateKey] = [];
      }
      logsByDate[dateKey].push(log);
    });
    
    // Convert to array and sort by date (most recent first)
    const sortedDates = Object.keys(logsByDate).sort((a, b) => {
      if (a === 'Today') return -1;
      if (b === 'Today') return 1;
      if (a === 'Yesterday') return -1;
      if (b === 'Yesterday') return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    // Format for display
    return sortedDates.map((date, index) => ({
      id: index.toString(),
      date,
      exercises: logsByDate[date].map(log => ({
        id: log.id,
        name: log.name,
        type: log.type,
        time: formatTime(log.time),
        duration: log.duration,
        calories: log.calories
      }))
    }));
  };

  return (
    <View style={styles.container}>
      {/* Custom header with Add Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <FontAwesome name="plus" size={16} color={Theme.COLORS.WHITE} />
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
      
      {/* Exercise History */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading exercise logs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-circle" size={40} color={Theme.COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchExerciseLogs}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {groupedExerciseLogs().length > 0 ? (
            groupedExerciseLogs().map(day => (
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
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <FontAwesome name="heartbeat" size={50} color={Theme.COLORS.MUTED} />
              <Text style={styles.emptyStateText}>No exercise logs yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your workouts by tapping the "Add Exercise" button above.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Theme.COLORS.WHITE} />
                  ) : (
                    <Text style={styles.addExerciseButtonText}>Add to Log</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setSelectedExercise(null)}
                  disabled={isSubmitting}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    marginTop: -10, // Adjust to align with the AppHeader
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Theme.COLORS.MUTED,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: Theme.COLORS.ERROR,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 20,
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
