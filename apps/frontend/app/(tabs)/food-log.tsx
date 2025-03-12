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

// Common food items for quick selection
const COMMON_FOOD_ITEMS = [
  { id: 1, name: 'Oatmeal', calories: 150, protein: 6, carbs: 27, fat: 2.5 },
  { id: 2, name: 'Scrambled Eggs', calories: 140, protein: 12, carbs: 1, fat: 10 },
  { id: 3, name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: 4, name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fat: 0.4 },
  { id: 5, name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 6, name: 'Brown Rice', calories: 215, protein: 5, carbs: 45, fat: 1.8 },
  { id: 7, name: 'Salmon', calories: 206, protein: 22, carbs: 0, fat: 13 },
  { id: 8, name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  { id: 9, name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0.1 },
  { id: 10, name: 'Avocado', calories: 234, protein: 2.9, carbs: 12, fat: 21 },
];

// Meal types for categorizing food logs
const MEAL_TYPES = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack'
};

export default function FoodLogScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState(MEAL_TYPES.BREAKFAST);
  
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
  
  // Filter food items based on search query
  const filteredFoodItems = COMMON_FOOD_ITEMS.filter((item: any) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle food item selection
  const handleFoodSelect = (food: any) => {
    setSelectedFood(food);
  };
  
  // Handle adding food to log
  const handleAddFood = async () => {
    if (!selectedFood) return;
    
    setIsSubmitting(true);
    
    try {
      // Create food log request
      const foodLogRequest: CreateFoodLogRequest = {
        foodName: selectedFood.name,
        amount: parseFloat(quantity),
        unit: 'serving',
        calories: selectedFood.calories * parseFloat(quantity),
        protein: selectedFood.protein * parseFloat(quantity),
        carbs: selectedFood.carbs * parseFloat(quantity),
        fat: selectedFood.fat * parseFloat(quantity),
        time: new Date().toISOString(),
      };
      
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
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Log</Text>
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
          <Text style={styles.errorText}>{error}</Text>
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
              <FontAwesome name="search" size={16} color={Theme.COLORS.MUTED} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for food..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            {selectedFood ? (
              <View style={styles.selectedFoodContainer}>
                <View style={styles.selectedFoodHeader}>
                  <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedFood(null)}>
                    <FontAwesome name="times" size={16} color={Theme.COLORS.MUTED} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.nutritionInfo}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                    <Text style={styles.nutritionValue}>{selectedFood.calories * Number(quantity)}</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                    <Text style={styles.nutritionValue}>{selectedFood.protein * Number(quantity)}g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                    <Text style={styles.nutritionValue}>{selectedFood.carbs * Number(quantity)}g</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                    <Text style={styles.nutritionValue}>{selectedFood.fat * Number(quantity)}g</Text>
                  </View>
                </View>
                
                <View style={styles.quantityContainer}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => setQuantity(prev => Math.max(0.5, Number(prev) - 0.5).toString())}
                    >
                      <FontAwesome name="minus" size={16} color={Theme.COLORS.PRIMARY} />
                    </TouchableOpacity>
                    <TextInput
                      style={styles.quantityInput}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => setQuantity(prev => (Number(prev) + 0.5).toString())}
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
              <FlatList
                data={filteredFoodItems}
                keyExtractor={item => item.id.toString()}
                style={styles.foodList}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.foodListItem}
                    onPress={() => handleFoodSelect(item)}
                  >
                    <View>
                      <Text style={styles.foodListItemName}>{item.name}</Text>
                      <Text style={styles.foodListItemDetails}>
                        P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                      </Text>
                    </View>
                    <Text style={styles.foodListItemCalories}>{item.calories} cal</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>
                    No food items found. Try a different search term.
                  </Text>
                }
              />
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
});
