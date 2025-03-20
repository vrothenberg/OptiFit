import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/FoodLog.styles';
import { FoodLogItem } from './FoodLogItem';

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
}

interface MealSectionProps {
  id: string;
  name: string;
  time: string;
  items: FoodItem[];
  onFoodItemPress: (id: string) => void;
}

/**
 * Component for displaying a meal section with its food items
 */
export const MealSection: React.FC<MealSectionProps> = ({
  id,
  name,
  time,
  items,
  onFoodItemPress,
}) => {
  // Calculate total calories for the meal
  const calculateMealCalories = (items: FoodItem[]) => {
    return items.reduce((total, item) => total + item.calories, 0);
  };

  return (
    <View style={styles.mealContainer}>
      <View style={styles.mealHeader}>
        <View>
          <Text style={styles.mealName}>{name}</Text>
          <Text style={styles.mealTime}>{time}</Text>
        </View>
        <View>
          <Text style={styles.mealCalories}>
            {Math.round(calculateMealCalories(items))} cal
          </Text>
        </View>
      </View>
      
      <View style={styles.mealItems}>
        {items.map(item => (
          <FoodLogItem
            key={item.id}
            id={item.id}
            name={item.name}
            quantity={item.quantity}
            unit={item.unit}
            calories={item.calories}
            onPress={onFoodItemPress}
          />
        ))}
      </View>
    </View>
  );
};
