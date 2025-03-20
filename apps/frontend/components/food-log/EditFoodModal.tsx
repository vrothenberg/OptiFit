import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { styles } from '../styles/FoodLog.styles';
import { FoodItem, FoodSearchAutocompleteRef } from '@/components/FoodSearchAutocomplete';
import FoodSearchAutocomplete from '@/components/FoodSearchAutocomplete';
import { MEAL_TYPES, roundToOneDecimal } from './FoodLogUtils';
import Theme from '@/constants/Theme';

interface MeasurementOption {
  label: string;
  value: string;
  weight: number;
}

interface EditFoodModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdateFood: () => void;
  onDeleteFood: () => void;
  foodSearchRef: React.RefObject<FoodSearchAutocompleteRef>;
  selectedFood: FoodItem | null;
  setSelectedFood: (food: FoodItem | null) => void;
  quantity: string;
  setQuantity: React.Dispatch<React.SetStateAction<string>>;
  quantityError: string | null;
  setQuantityError: (error: string | null) => void;
  isEditingQuantity: boolean;
  setIsEditingQuantity: (isEditing: boolean) => void;
  mealType: string;
  setMealType: (mealType: string) => void;
  selectedMeasure: MeasurementOption | null;
  setShowMeasureSelector: (show: boolean) => void;
  isSubmitting: boolean;
  calculateFoodNutrition: (nutrientValue: number | undefined, quantity: number, isCalories?: boolean) => number;
  onFoodSelect: (food: FoodItem) => void;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({
  visible,
  onClose,
  onUpdateFood,
  onDeleteFood,
  foodSearchRef,
  selectedFood,
  setSelectedFood,
  quantity,
  setQuantity,
  quantityError,
  setQuantityError,
  isEditingQuantity,
  setIsEditingQuantity,
  mealType,
  setMealType,
  selectedMeasure,
  setShowMeasureSelector,
  isSubmitting,
  calculateFoodNutrition,
  onFoodSelect
}) => {
  // Render the meal type selector buttons
  const renderMealTypeButtons = () => (
    <View style={styles.mealTypeButtons}>
      {Object.values(MEAL_TYPES).map(type => (
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
  );

  // Render the nutrition information for the selected food
  const renderNutritionInfo = () => (
    <View style={styles.nutritionInfo}>
      <View style={styles.nutritionItem}>
        <Text style={styles.nutritionLabel}>Calories</Text>
        <Text style={styles.nutritionValue}>
          {calculateFoodNutrition(selectedFood?.food.nutrients?.ENERC_KCAL, Number(quantity), true)}
        </Text>
      </View>
      <View style={styles.nutritionItem}>
        <Text style={styles.nutritionLabel}>Protein</Text>
        <Text style={styles.nutritionValue}>
          {calculateFoodNutrition(selectedFood?.food.nutrients?.PROCNT, Number(quantity))}g
        </Text>
      </View>
      <View style={styles.nutritionItem}>
        <Text style={styles.nutritionLabel}>Carbs</Text>
        <Text style={styles.nutritionValue}>
          {calculateFoodNutrition(selectedFood?.food.nutrients?.CHOCDF, Number(quantity))}g
        </Text>
      </View>
      <View style={styles.nutritionItem}>
        <Text style={styles.nutritionLabel}>Fat</Text>
        <Text style={styles.nutritionValue}>
          {calculateFoodNutrition(selectedFood?.food.nutrients?.FAT, Number(quantity))}g
        </Text>
      </View>
      {quantityError && (
        <Text style={styles.errorText}>{quantityError}</Text>
      )}
    </View>
  );

  // Render the quantity input controls
  const renderQuantityControls = () => (
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
  );

  // Handle delete confirmation
  const handleDeleteConfirmation = () => {
    Alert.alert(
      'Delete Food Log',
      'Are you sure you want to delete this food log?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: onDeleteFood,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Food</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={24} color={Theme.COLORS.MUTED} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.mealTypeContainer}>
            <Text style={styles.inputLabel}>Meal Type</Text>
            {renderMealTypeButtons()}
          </View>
          
          <View style={styles.searchContainer}>
            <FoodSearchAutocomplete
              ref={foodSearchRef}
              onFoodSelect={onFoodSelect}
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
              
              {renderNutritionInfo()}
              
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
                {renderQuantityControls()}
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.updateButton]}
                  onPress={onUpdateFood}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Theme.COLORS.WHITE} />
                  ) : (
                    <Text style={styles.actionButtonText}>Update</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={handleDeleteConfirmation}
                  disabled={isSubmitting}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
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
  );
};
