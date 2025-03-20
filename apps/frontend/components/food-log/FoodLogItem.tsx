import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles/FoodLog.styles';

interface FoodLogItemProps {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  onPress: (id: string) => void;
}

/**
 * Component for displaying a single food log entry
 * Shows the food name, quantity with unit, and calories
 */
export const FoodLogItem: React.FC<FoodLogItemProps> = ({
  id,
  name,
  quantity,
  unit,
  calories,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.foodItem}
      onPress={() => onPress(id)}
    >
      <Text style={styles.foodName}>{name}</Text>
      <Text style={styles.foodQuantity}>{quantity} {unit}</Text>
      <Text style={styles.foodCalories}>{Math.round(calories)} cal</Text>
    </TouchableOpacity>
  );
};
