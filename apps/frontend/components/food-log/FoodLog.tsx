import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';
import { 
  getFoodLogs, 
  createFoodLog, 
  updateFoodLog, 
  deleteFoodLog 
} from '@/services/loggingService';
import { 
  FoodLog as FoodLogType, 
  CreateFoodLogRequest,
  UpdateFoodLogRequest
} from '@/services/api/types';
import { FoodItem, FoodSearchAutocompleteRef } from '@/components/FoodSearchAutocomplete';

// Import styles and components
import { styles } from '@/components/styles/FoodLog.styles';
import { MealSection } from './MealSection';
import { AddFoodModal } from './AddFoodModal';
import { EditFoodModal } from './EditFoodModal';
import { MeasurementSelectorModal } from './MeasurementSelectorModal';
import { 
  MEAL_TYPES, 
  formatDate, 
  formatTime, 
  guessMealType, 
  roundToOneDecimal,
  calculateNutrition
} from './FoodLogUtils';

// Interface for measurement options
interface MeasurementOption {
  label: string;
  value: string;
  weight: number;
}

// Interface for grouped food logs
interface GroupedFoodLog {
  id: string;
  date: string;
  meals: {
    id: string;
    name: string;
    time: string;
    items: {
      id: string;
      name: string;
      quantity: number;
      unit: string;
      calories: number;
    }[];
  }[];
}

export const FoodLog: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [mealType, setMealType] = useState(MEAL_TYPES.BREAKFAST);
  const [selectedMeasure, setSelectedMeasure] = useState<MeasurementOption | null>(null);
  const [showMeasureSelector, setShowMeasureSelector] = useState(false);
  const [measureOptions, setMeasureOptions] = useState<MeasurementOption[]>([]);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [editingFoodLog, setEditingFoodLog] = useState<FoodLogType | null>(null);
  const foodSearchRef = useRef<FoodSearchAutocompleteRef>(null);
  
  // API-related state
  const [foodLogs, setFoodLogs] = useState<FoodLogType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Focus the search input when the modal opens
  useEffect(() => {
    if (showAddModal || showEditModal) {
      // Small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        foodSearchRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showAddModal, showEditModal]);
  
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
  
  // Calculate nutrition for the selected food
  const calculateFoodNutrition = (nutrientValue: number | undefined, quantity: number, isCalories: boolean = false): number => {
    if (!nutrientValue || !selectedMeasure) return 0;
    
    const isGram = selectedMeasure.value === 'gram';
    return calculateNutrition(
      nutrientValue, 
      quantity, 
      selectedMeasure.weight, 
      isGram, 
      isCalories
    );
  };

  // Handle adding food to log
  const handleAddFood = async () => {
    if (!selectedFood || !selectedMeasure) return;
    
    setIsSubmitting(true);
    
    try {
      const parsedQuantity = parseFloat(quantity);
      const logTime = selectedTime || new Date();
      
      // Create food log request
      const foodLogRequest: CreateFoodLogRequest = {
        foodName: selectedFood.food.label,
        amount: parsedQuantity,
        unit: selectedMeasure.value,
        calories: calculateFoodNutrition(selectedFood.food.nutrients?.ENERC_KCAL, parsedQuantity, true),
        protein: calculateFoodNutrition(selectedFood.food.nutrients?.PROCNT, parsedQuantity),
        carbs: calculateFoodNutrition(selectedFood.food.nutrients?.CHOCDF, parsedQuantity),
        fat: calculateFoodNutrition(selectedFood.food.nutrients?.FAT, parsedQuantity),
        time: logTime.toISOString(),
        mealType: mealType,
        // Store the food ID for future reference
        foodId: selectedFood.food.foodId,
        // Store the measure weight for accurate nutrition calculations
        measureWeight: selectedMeasure.weight
      };
      
      // Call API to create food log
      await createFoodLog(foodLogRequest);
      
      // Refresh food logs
      await fetchFoodLogs();
      
      // Close modal and reset state
      setShowAddModal(false);
      setSelectedFood(null);
      setQuantity('1');
      setSelectedTime(null);
    } catch (error: any) {
      console.error('Error adding food log:', error);
      Alert.alert('Error', 'Failed to add food to log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating food log
  const handleUpdateFood = async () => {
    if (!selectedFood || !selectedMeasure || !editingFoodLog) return;
    
    setIsSubmitting(true);
    
    try {
      const parsedQuantity = parseFloat(quantity);
      const logTime = selectedTime || new Date(editingFoodLog.time);
      
      // Create update food log request
      const updateFoodLogRequest: UpdateFoodLogRequest = {
        foodName: selectedFood.food.label,
        amount: parsedQuantity,
        unit: selectedMeasure.value,
        calories: calculateFoodNutrition(selectedFood.food.nutrients?.ENERC_KCAL, parsedQuantity, true),
        protein: calculateFoodNutrition(selectedFood.food.nutrients?.PROCNT, parsedQuantity),
        carbs: calculateFoodNutrition(selectedFood.food.nutrients?.CHOCDF, parsedQuantity),
        fat: calculateFoodNutrition(selectedFood.food.nutrients?.FAT, parsedQuantity),
        time: logTime.toISOString(),
        mealType: mealType,
        // Store the food ID for future reference
        foodId: selectedFood.food.foodId,
        // Store the measure weight for accurate nutrition calculations
        measureWeight: selectedMeasure.weight
      };
      
      // Call API to update food log
      await updateFoodLog(editingFoodLog.id, updateFoodLogRequest);
      
      // Refresh food logs
      await fetchFoodLogs();
      
      // Close modal and reset state
      setShowEditModal(false);
      setEditingFoodLog(null);
      setSelectedFood(null);
      setQuantity('1');
      setSelectedTime(null);
    } catch (error: any) {
      console.error('Error updating food log:', error);
      Alert.alert('Error', 'Failed to update food log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting food log
  const handleDeleteFood = async () => {
    if (!editingFoodLog) return;
    
    try {
      await deleteFoodLog(editingFoodLog.id);
      await fetchFoodLogs();
      setShowEditModal(false);
      setEditingFoodLog(null);
    } catch (error) {
      console.error('Error deleting food log:', error);
      Alert.alert('Error', 'Failed to delete food log. Please try again.');
    }
  };
  
  // Group food logs by date and meal type
  const groupedFoodLogs = (): GroupedFoodLog[] => {
    if (!foodLogs || foodLogs.length === 0) {
      return [];
    }
    
    // Group logs by date
    const logsByDate: Record<string, FoodLogType[]> = {};
    
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
      const logsByMealType: Record<string, FoodLogType[]> = {};
      
      logsForDate.forEach(log => {
        const mealType = log.mealType || guessMealType(log.time);
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
        const items = logsForMeal.map((log) => ({
          id: log.id,
          name: log.foodName,
          quantity: log.amount,
          unit: log.unit,
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
  
  // Handle editing a food log
  const handleEditFood = async (foodLogId: string) => {
    // Find the food log to edit
    const foodLog = foodLogs.find(log => log.id === foodLogId);
    if (!foodLog) {
      console.error(`Food log with ID ${foodLogId} not found`);
      return;
    }
    
    // Set editing state
    setEditingFoodLog(foodLog);
    setQuantity(foodLog.amount.toString());
    setMealType(foodLog.mealType || guessMealType(foodLog.time));
    setSelectedTime(new Date(foodLog.time));
    
    // Use the stored foodId if available, otherwise use a temporary ID
    const foodId = foodLog.foodId || 'temp-id';
    
    // Use the stored measureWeight if available, otherwise use a default
    const measureWeight = foodLog.measureWeight || 100;
    
    // Create a food item to populate the form
    const foodItem: FoodItem = {
      food: {
        foodId: foodId,
        label: foodLog.foodName,
        nutrients: {
          ENERC_KCAL: foodLog.calories,
          PROCNT: foodLog.protein,
          CHOCDF: foodLog.carbs,
          FAT: foodLog.fat
        }
      },
      measures: [
        {
          label: foodLog.unit.charAt(0).toUpperCase() + foodLog.unit.slice(1),
          value: foodLog.unit,
          weight: measureWeight
        }
      ]
    };
    
    setSelectedFood(foodItem);
    
    // Create a measurement option with the correct weight
    const measureOption: MeasurementOption = {
      label: foodLog.unit.charAt(0).toUpperCase() + foodLog.unit.slice(1),
      value: foodLog.unit,
      weight: measureWeight
    };
    
    setMeasureOptions([measureOption]);
    setSelectedMeasure(measureOption);
    
    // Show the edit modal
    setShowEditModal(true);
  };

  return (
    <View style={styles.container}>
      {/* Custom header with Add Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            setSelectedFood(null);
            setQuantity('1');
            setMealType(MEAL_TYPES.BREAKFAST);
            setSelectedTime(null);
            setShowAddModal(true);
          }}
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
                  <MealSection
                    key={meal.id}
                    id={meal.id}
                    name={meal.name}
                    time={meal.time}
                    items={meal.items}
                    onFoodItemPress={handleEditFood}
                  />
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
      <AddFoodModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddFood={handleAddFood}
        foodSearchRef={foodSearchRef}
        selectedFood={selectedFood}
        setSelectedFood={setSelectedFood}
        quantity={quantity}
        setQuantity={setQuantity}
        quantityError={quantityError}
        setQuantityError={setQuantityError}
        isEditingQuantity={isEditingQuantity}
        setIsEditingQuantity={setIsEditingQuantity}
        mealType={mealType}
        setMealType={setMealType}
        selectedMeasure={selectedMeasure}
        setShowMeasureSelector={() => setShowMeasureSelector(true)}
        isSubmitting={isSubmitting}
        calculateFoodNutrition={calculateFoodNutrition}
        onFoodSelect={handleFoodSelect}
      />
      
      {/* Edit Food Modal */}
      <EditFoodModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdateFood={handleUpdateFood}
        onDeleteFood={handleDeleteFood}
        foodSearchRef={foodSearchRef}
        selectedFood={selectedFood}
        setSelectedFood={setSelectedFood}
        quantity={quantity}
        setQuantity={setQuantity}
        quantityError={quantityError}
        setQuantityError={setQuantityError}
        isEditingQuantity={isEditingQuantity}
        setIsEditingQuantity={setIsEditingQuantity}
        mealType={mealType}
        setMealType={setMealType}
        selectedMeasure={selectedMeasure}
        setShowMeasureSelector={() => setShowMeasureSelector(true)}
        isSubmitting={isSubmitting}
        calculateFoodNutrition={calculateFoodNutrition}
        onFoodSelect={handleFoodSelect}
      />
      
      {/* Measurement Selector Modal */}
      <MeasurementSelectorModal
        visible={showMeasureSelector}
        onClose={() => setShowMeasureSelector(false)}
        options={measureOptions}
        onSelect={setSelectedMeasure}
      />
    </View>
  );
};
