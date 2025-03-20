/**
 * Utility functions for the food log components
 */

// Meal types for categorizing food logs
export const MEAL_TYPES = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  SNACK: 'Snack'
};

/**
 * Format a date string for display
 * Returns "Today", "Yesterday", or a formatted date
 */
export const formatDate = (dateString: string): string => {
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

/**
 * Format a time string for display in 12-hour format
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Guess the meal type based on the time of day
 */
export const guessMealType = (dateString: string): string => {
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

/**
 * Utility function to round to 1 decimal place
 */
export const roundToOneDecimal = (value: number): number => {
  return Math.round(value * 10) / 10;
};

/**
 * Calculate nutrition values based on quantity and measure
 */
export const calculateNutrition = (
  nutrientValue: number | undefined, 
  quantity: number, 
  measureWeight: number,
  measureIsGram: boolean,
  isCalories: boolean = false
): number => {
  if (!nutrientValue) return 0;
  
  // Calculate the conversion factor based on the measure
  let conversionFactor;
  if (measureIsGram) {
    // For grams, we need to convert from per 100g to per gram
    conversionFactor = 1 / 100;
  } else {
    // For other measures, we use the weight in grams divided by 100
    // (since nutrients are typically per 100g)
    conversionFactor = measureWeight / 100;
  }
  
  // Calculate the value
  const value = nutrientValue * quantity * conversionFactor;
  
  // Round calories to whole numbers, other nutrients to 1 decimal place
  return isCalories ? Math.round(value) : Math.round(value * 10) / 10;
};
