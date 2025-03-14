import React, { useState, useEffect, useRef } from 'react';
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
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';

import Theme from '@/constants/Theme';

// Utility function to round to 1 decimal place
const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

// Interface for measurement options
interface MeasurementOption {
  label: string;
  value: string;
  weight: number;
}
import { 
  getFoodLogs, 
  createFoodLog, 
  updateFoodLog, 
  deleteFoodLog 
} from '@/services/loggingService';
import { 
  FoodLog, 
  FoodLogsResponse, 
  CreateFoodLogRequest 
} from '@/services/api/types';
import FoodSearchAutocomplete, { FoodItem, FoodSearchAutocompleteRef } from '@/components/FoodSearchAutocomplete';

// Meal types for categorizing food logs
const MEAL_TYPES = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack'
};

export default function FoodLogScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [mealType, setMealType] = useState(MEAL_TYPES.BREAKFAST);
  const [selectedMeasure, setSelectedMeasure] = useState<MeasurementOption | null>(null);
  const [showMeasureSelector, setShowMeasureSelector] = useState(false);
  const [measureOptions, setMeasureOptions] = useState<MeasurementOption[]>([]);
  const foodSearchRef = useRef<FoodSearchAutocompleteRef>(null);
  
  // Focus the search input when the modal opens
  useEffect(() => {
    if (showAddModal) {
      // Small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        foodSearchRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showAddModal]);
  
  // API-related state
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch food logs when component mounts
  useEffect(() => {
    fetchFoodLogs();
  }, []);
  
  // Fetch food logs from API
  const fetchFoodLogs = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get today's date and yesterday's date for filtering
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 7); // Get logs from the past week
      
      // Format dates as ISO strings
      const endDate = today.toISOString();
      const startDate = startOfWeek.toISOString();
      
      // Fetch food logs from API
      const response = await getFoodLogs({ startDate, endDate, limit: 50 });
      setFoodLogs(response.data);
    } catch (error: any) {
      console.error('Error fetching food logs:', error);
      setError('Failed to load food logs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process measures from the selected food item
  const processMeasures = (food: FoodItem) => {
    // Default measures if none are provided
    const defaultMeasures: MeasurementOption[] = [
      { label: 'Serving', value: 'serving', weight: 100 }
    ];
    
    // If the food has measures, convert them to our format
    if (food.measures && food.measures.length > 0) {
      const options = food.measures.map(measure => ({
        label: `${measure.label} (${Math.round(measure.weight)}g)`,
        value: measure.label.toLowerCase(),
        weight: measure.weight
      }));
      
      // Add grams as an option if not already present
      if (!options.some(option => option.value === 'gram')) {
        options.push({ label: 'Gram', value: 'gram', weight: 1 });
      }
      
      setMeasureOptions(options);
      setSelectedMeasure(options[0]); // Default to first measure
    } else {
      // Use default measures if none provided
      setMeasureOptions(defaultMeasures);
      setSelectedMeasure(defaultMeasures[0]);
    }
  };
  
  // Handle food item selection from the autocomplete component
  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    processMeasures(food);
  };
  
  // Calculate nutrition values based on quantity and measure
  const calculateNutrition = (nutrientValue: number | undefined, quantity: number): number => {
    if (!nutrientValue || !selectedMeasure) return 0;
    
    // If the measure is gram, we need to convert from per 100g to per gram
    const conversionFactor = selectedMeasure.value === 'gram' 
      ? selectedMeasure.weight / 100
      : selectedMeasure.weight / 100;
    
    return roundToOneDecimal(nutrientValue * quantity * conversionFactor);
  };
  
  // Handle adding food to log
  const handleAddFood = async () => {
    if (!selectedFood || !selectedMeasure) return;
    
    setIsSubmitting(true);
    
    try {
      const parsedQuantity = parseFloat(quantity);
      
      // Create food log request
      const foodLogRequest: CreateFoodLogRequest = {
        foodName: selectedFood.food.label,
        amount: parsedQuantity,
        unit: selectedMeasure.value,
        calories: calculateNutrition(selectedFood.food.nutrients?.ENERC_KCAL, parsedQuantity),
        protein: calculateNutrition(selectedFood.food.nutrients?.PROCNT, parsedQuantity),
        carbs: calculateNutrition(selectedFood.food.nutrients?.CHOCDF, parsedQuantity),
        fat: calculateNutrition(selectedFood.food.nutrients?.FAT, parsedQuantity),
        time: new Date().toISOString(),
      };
      
      // Log additional metadata for debugging (not sent to server)
      console.log('Additional food metadata:', {
        foodId: selectedFood.food.foodId,
        category: selectedFood.food.category,
        brand: selectedFood.food.brand,
        measureWeight: selectedMeasure.weight
      });
      
      // Call API to create food log
      await createFoodLog(foodLogRequest);
      
      // Refresh food logs
      await fetchFoodLogs();
      
      // Close modal and reset state
      setShowAddModal(false);
      setSelectedFood(null);
      setQuantity('1');
    } catch (error: any) {
      console.error('Error adding food log:', error);
      Alert.alert('Error', 'Failed to add food to log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
  
  // Helper function to guess meal type based on time
  const guessMealType = (dateString: string) => {
    const date = new Date(dateString);
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 10) {
      return MEAL_TYPES.BREAKFAST;
    } else if (hour >= 10 && hour < 15) {
      return MEAL_TYPES.LUNCH;
    } else if (hour >= 15 && hour < 21) {
      return MEAL_TYPES.DINNER;
    } else {
      return MEAL_TYPES.SNACK;
    }
  };
  
  // Group food logs by date and meal type
  const groupedFoodLogs = () => {
    if (!foodLogs || foodLogs.length === 0) {
      return [];
    }
    
    // Group logs by date
    const logsByDate: Record<string, FoodLog[]> = {};
    
    foodLogs.forEach(log => {
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
    
    // For each date, group logs by meal type
    return sortedDates.map((date, dateIndex) => {
      const logsForDate = logsByDate[date];
      
      // Group logs by meal type
      const logsByMealType: Record<string, FoodLog[]> = {};
      
      logsForDate.forEach(log => {
        const mealType = guessMealType(log.time);
        if (!logsByMealType[mealType]) {
          logsByMealType[mealType] = [];
        }
        logsByMealType[mealType].push(log);
      });
      
      // Sort meal types in chronological order
      const mealOrder = [MEAL_TYPES.BREAKFAST, MEAL_TYPES.LUNCH, MEAL_TYPES.DINNER, MEAL_TYPES.SNACK];
      const sortedMealTypes = Object.keys(logsByMealType).sort(
        (a, b) => mealOrder.indexOf(a) - mealOrder.indexOf(b)
      );
      
      // Format meals for display
      const meals = sortedMealTypes.map((mealType, mealIndex) => {
        const logsForMeal = logsByMealType[mealType];
        
        // Sort logs by time
        logsForMeal.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        
        // Format logs as items
        const items = logsForMeal.map((log, logIndex) => ({
          id: log.id,
          name: log.foodName,
          quantity: log.amount,
          calories: log.calories
        }));
        
        return {
          id: `${dateIndex}-${mealIndex}`,
          name: mealType,
          time: formatTime(logsForMeal[0].time),
          items
        };
      });
      
      return {
        id: dateIndex.toString(),
        date,
        meals
      };
    });
  };
  
  // Calculate total calories for a meal
  const calculateMealCalories = (items: any[]) => {
    return items.reduce((total, item) => total + (item.calories), 0);
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
          <Text style={styles.addButtonText}>Add Food</Text>
        </TouchableOpacity>
      </View>
      
      {/* Meal History */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.COLORS.PRIMARY} />
          <Text style={styles.loadingText}>Loading food logs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-circle" size={40} color={Theme.COLORS.ERROR} />
          <Text style={styles.errorMessageText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchFoodLogs}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {groupedFoodLogs().length > 0 ? (
            groupedFoodLogs().map(day => (
              <View key={day.id} style={styles.dayContainer}>
                <Text style={styles.dayTitle}>{day.date}</Text>
                
                {day.meals.map(meal => (
                  <View key={meal.id} style={styles.mealContainer}>
                    <View style={styles.mealHeader}>
                      <View>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealTime}>{meal.time}</Text>
                      </View>
                      <View>
                        <Text style={styles.mealCalories}>
                          {calculateMealCalories(meal.items)} cal
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.mealItems}>
                      {meal.items.map(item => (
                        <View key={item.id} style={styles.foodItem}>
                          <Text style={styles.foodName}>{item.name}</Text>
                          <Text style={styles.foodQuantity}>x{item.quantity}</Text>
                          <Text style={styles.foodCalories}>{item.calories} cal</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <FontAwesome name="cutlery" size={50} color={Theme.COLORS.MUTED} />
              <Text style={styles.emptyStateText}>No food logs yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your meals by tapping the "Add Food" button above.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Add Food Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Food</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <FontAwesome name="times" size={24} color={Theme.COLORS.MUTED} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.mealTypeContainer}>
              <Text style={styles.inputLabel}>Meal Type</Text>
              <View style={styles.mealTypeButtons}>
                {[MEAL_TYPES.BREAKFAST, MEAL_TYPES.LUNCH, MEAL_TYPES.DINNER, MEAL_TYPES.SNACK].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeButton,
                      mealType === type && styles.mealTypeButtonSelected
                    ]}
                    onPress={() => setMealType(type)}
                  >
                    <Text 
                      style={[
                        styles.mealTypeButtonText,
                        mealType === type && styles.mealTypeButtonTextSelected
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.searchContainer}>
              <FoodSearchAutocomplete
                ref={foodSearchRef}
                onFoodSelect={handleFoodSelect}
                placeholder="Search for food..."
              />
            </View>
            
            {selectedFood ? (
              <View style={styles.selectedFoodContainer}>
                <View style={styles.selectedFoodHeader}>
                  <Text style={styles.selectedFoodName}>{selectedFood.food.label}</Text>
                  <TouchableOpacity onPress={() => setSelectedFood(null)}>
                    <FontAwesome name="times" size={16} color={Theme.COLORS.MUTED} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.nutritionInfo}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                    <Text style={styles.nutritionValue}>
                      {calculateNutrition(selectedFood.food.nutrients?.ENERC_KCAL, Number(quantity))}
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>
                      {calculateNutrition(selectedFood.food.nutrients?.PROCNT, Number(quantity))}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                    <Text style={styles.nutritionValue}>
                      {calculateNutrition(selectedFood.food.nutrients?.CHOCDF, Number(quantity))}g
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                    <Text style={styles.nutritionValue}>
                      {calculateNutrition(selectedFood.food.nutrients?.FAT, Number(quantity))}g
                    </Text>
                  </View>
                  {quantityError && (
                    <Text style={styles.errorText}>{quantityError}</Text>
                  )}
                </View>
                
                {/* Measurement Selector */}
                <View style={styles.measurementContainer}>
                  <Text style={styles.inputLabel}>Measurement</Text>
                  <TouchableOpacity 
                    style={styles.measurementSelector}
                    onPress={() => setShowMeasureSelector(true)}
                  >
                    <Text style={styles.measurementText}>
                      {selectedMeasure?.label || 'Select a measurement'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color={Theme.COLORS.DEFAULT} />
                  </TouchableOpacity>
                </View>
                
                {/* Quantity Input */}
                <View style={styles.quantityContainer}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <Text style={styles.editHint}>(tap to edit)</Text>
                  </View>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => setQuantity(prev => Math.max(0.1, roundToOneDecimal(Number(prev) - 0.1)).toString())}
                    >
                      <FontAwesome name="minus" size={16} color={Theme.COLORS.PRIMARY} />
                    </TouchableOpacity>
                    <TextInput
                      style={[
                        styles.quantityInput,
                        isEditingQuantity && styles.quantityInputFocused,
                        quantityError && styles.quantityInputError
                      ]}
                      value={quantity}
                      onChangeText={(text) => {
                        // Allow only numeric input with up to one decimal place
                        if (/^\d*\.?\d{0,1}$/.test(text) || text === '') {
                          setQuantity(text);
                          setQuantityError(null);
                        }
                      }}
                      onFocus={() => setIsEditingQuantity(true)}
                      onBlur={() => {
                        setIsEditingQuantity(false);
                        
                        // Validate on blur
                        const num = parseFloat(quantity);
                        if (isNaN(num)) {
                          setQuantityError('Please enter a valid number');
                          setQuantity('1');
                        } else if (num <= 0) {
                          setQuantityError('Quantity must be greater than 0');
                          setQuantity('0.1');
                        } else if (num > 100) {
                          setQuantityError('Quantity must be less than 100');
                          setQuantity('100');
                        } else {
                          // Format to one decimal place
                          setQuantity(roundToOneDecimal(num).toString());
                        }
                      }}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => setQuantity(prev => roundToOneDecimal(Number(prev) + 0.1).toString())}
                    >
                      <FontAwesome name="plus" size={16} color={Theme.COLORS.PRIMARY} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.addFoodButton}
                  onPress={handleAddFood}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Theme.COLORS.WHITE} />
                  ) : (
                    <Text style={styles.addFoodButtonText}>Add to Log</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.searchInstructions}>
                <Text style={styles.searchInstructionsText}>
                  Search for a food item above and select it from the results.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Measurement Selector Modal */}
      <Modal
        visible={showMeasureSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMeasureSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Measurement</Text>
              <TouchableOpacity onPress={() => setShowMeasureSelector(false)}>
                <FontAwesome name="times" size={24} color={Theme.COLORS.MUTED} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={measureOptions}
              keyExtractor={(item, index) => `measure-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.measureItem}
                  onPress={() => {
                    setSelectedMeasure(item);
                    setShowMeasureSelector(false);
                  }}
                >
                  <Text style={styles.measureItemText}>{item.label}</Text>
                  {selectedMeasure?.value === item.value && (
                    <FontAwesome name="check" size={16} color={Theme.COLORS.PRIMARY} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.measureSeparator} />}
            />
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
  measurementContainer: {
    marginBottom: 15,
  },
  measurementSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  measurementText: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  measureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  measureItemText: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
  },
  measureSeparator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 15,
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
  errorMessageText: {
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
  mealContainer: {
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
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
  },
  mealTime: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.COLORS.PRIMARY,
  },
  mealItems: {
    padding: 15,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodName: {
    flex: 1,
    fontSize: 14,
    color: Theme.COLORS.DEFAULT,
  },
  foodQuantity: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    marginRight: 10,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
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
  mealTypeContainer: {
    marginTop: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 8,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  mealTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    marginBottom: 10,
  },
  mealTypeButtonSelected: {
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  mealTypeButtonText: {
    fontSize: 14,
    color: Theme.COLORS.DEFAULT,
  },
  mealTypeButtonTextSelected: {
    color: Theme.COLORS.WHITE,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  foodList: {
    maxHeight: 300,
  },
  foodListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  foodListItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 2,
  },
  foodListItemDetails: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
  },
  foodListItemCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.COLORS.PRIMARY,
  },
  emptyListText: {
    textAlign: 'center',
    padding: 20,
    color: Theme.COLORS.MUTED,
  },
  selectedFoodContainer: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 15,
  },
  selectedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedFoodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
  },
  nutritionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    marginBottom: 5,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
  },
  quantityContainer: {
    marginBottom: 15,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  quantityInputFocused: {
    borderColor: Theme.COLORS.PRIMARY,
  },
  quantityInputError: {
    borderColor: Theme.COLORS.ERROR,
  },
  errorText: {
    color: Theme.COLORS.ERROR,
    fontSize: 12,
    marginTop: 4,
  },
  addFoodButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addFoodButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchInstructions: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInstructionsText: {
    fontSize: 16,
    color: Theme.COLORS.MUTED,
    textAlign: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editHint: {
    fontSize: 12,
    color: Theme.COLORS.MUTED,
    marginLeft: 8,
    fontStyle: 'italic',
  },
});
