import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import FoodSearchAutocomplete from '../../components/FoodSearchAutocomplete';
import Theme from '@/constants/Theme';

interface FoodItem {
  food: {
    foodId: string;
    label: string;
    nutrients: {
      ENERC_KCAL?: number;
      PROCNT?: number;
      FAT?: number;
      CHOCDF?: number;
    };
    image?: string;
  };
  measures: any[];
}

export default function FoodSearchDemo() {
  const router = useRouter();
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const handleFoodSelect = (food: FoodItem) => {
    console.log('Selected food:', food);
    setSelectedFood(food);
  };

  // Navigate back to dev tools index
  const navigateBack = () => {
    router.push('/dev-tools' as any);
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Food Search Demo' }} />
      
      <View style={styles.section}>
        <Text style={styles.title}>Food Search with Autocomplete</Text>
        <Text style={styles.description}>
          Search for food items using the Edamam Food Database API with autocomplete suggestions.
        </Text>
        
        <View style={styles.searchContainer}>
          <FoodSearchAutocomplete 
            onFoodSelect={handleFoodSelect}
            placeholder="Search for a food (e.g., apple, chicken)..."
          />
        </View>
        
        {selectedFood && (
          <View style={styles.resultContainer}>
            <Text style={styles.subtitle}>Selected Food</Text>
            <Text style={styles.foodName}>{selectedFood.food.label}</Text>
            
            <View style={styles.nutrientsContainer}>
              <Text style={styles.nutrientTitle}>Nutrients (per 100g):</Text>
              <Text style={styles.nutrient}>
                Calories: {selectedFood.food.nutrients?.ENERC_KCAL ? Math.round(selectedFood.food.nutrients.ENERC_KCAL) : 'N/A'} kcal
              </Text>
              <Text style={styles.nutrient}>
                Protein: {selectedFood.food.nutrients?.PROCNT ? Math.round(selectedFood.food.nutrients.PROCNT) : 'N/A'} g
              </Text>
              <Text style={styles.nutrient}>
                Fat: {selectedFood.food.nutrients?.FAT ? Math.round(selectedFood.food.nutrients.FAT) : 'N/A'} g
              </Text>
              <Text style={styles.nutrient}>
                Carbs: {selectedFood.food.nutrients?.CHOCDF ? Math.round(selectedFood.food.nutrients.CHOCDF) : 'N/A'} g
              </Text>
            </View>
            
            <Text style={styles.subtitle}>Available Measures:</Text>
            <View style={styles.measuresContainer}>
              {selectedFood.measures.map((measure, index) => (
                <Text key={index} style={styles.measure}>
                  • {measure.label}
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButtonContainer}
        onPress={navigateBack}
      >
        <View style={styles.backButton}>
          <FontAwesome name="arrow-left" size={18} color={Theme.COLORS.WHITE} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Back to Dev Tools</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  nutrientsContainer: {
    marginBottom: 16,
  },
  nutrientTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nutrient: {
    fontSize: 16,
    marginBottom: 4,
  },
  measuresContainer: {
    marginTop: 8,
  },
  measure: {
    fontSize: 16,
    marginBottom: 4,
  },
  backButtonContainer: {
    marginVertical: 20,
    marginHorizontal: 16,
  },
  backButton: {
    backgroundColor: Theme.COLORS.PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
