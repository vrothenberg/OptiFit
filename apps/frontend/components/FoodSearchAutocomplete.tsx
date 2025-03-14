import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  View, 
  TextInput, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Image
} from 'react-native';
import { searchFood, getFoodAutocompleteSuggestions, getFoodNutrition } from '../services/loggingService';
import { debounce } from 'lodash';
import { useTheme } from '@react-navigation/native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { styles } from './styles/FoodSearchAutocomplete.styles';

export interface FoodItem {
  food: {
    foodId: string;
    label: string;
    knownAs?: string;
    category?: string;
    categoryLabel?: string;
    brand?: string;
    foodContentsLabel?: string;
    nutrients: {
      ENERC_KCAL?: number;
      PROCNT?: number;
      FAT?: number;
      CHOCDF?: number;
      FIBTG?: number;
      // Other nutrients can be added as needed
    };
    image?: string;
    healthLabels?: string[];
    dietLabels?: string[];
    servingSizes?: any[];
    upc?: string;
  };
  measures: any[];
  qualifiers?: any[];
}

interface AdvancedFilters {
  category?: string;
  healthLabels?: string[];
  dietLabels?: string[];
  showPackagedOnly?: boolean;
  showGenericOnly?: boolean;
}

interface FoodSearchAutocompleteProps {
  onFoodSelect: (food: FoodItem) => void;
  placeholder?: string;
}

// Export the ref type for parent components
export type FoodSearchAutocompleteRef = {
  focus: () => void;
};

const FoodSearchAutocomplete = forwardRef<FoodSearchAutocompleteRef, FoodSearchAutocompleteProps>(({ 
  onFoodSelect,
  placeholder = 'Search for a food...'
}, ref) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  
  // Expose the focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));
  
  // Debounced search function for autocomplete
  const debouncedGetSuggestions = useCallback(
    debounce(async (text: string) => {
      if (text.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      
      try {
        setLoading(true);
        // Clear previous suggestions immediately when starting a new search
        setSuggestions([]);
        
        // Store the current query to verify it's still relevant when response arrives
        const currentQuery = text;
        
        console.log(`Sending autocomplete request for "${currentQuery}"`);
        const suggestionsData = await getFoodAutocompleteSuggestions(text);
        console.log(`Raw autocomplete response for "${currentQuery}":`, suggestionsData);
        
        // Only update suggestions if the query is still the same
        // This prevents race conditions with fast typing
        if (query === currentQuery) {
          // Limit to 5 suggestions as per requirements
          if (Array.isArray(suggestionsData)) {
            if (suggestionsData.length === 0) {
              console.log(`No suggestions received for "${currentQuery}"`);
              setSuggestions([]);
              setShowSuggestions(false);
            } else {
              // Force lowercase for consistent display and comparison
              const processedSuggestions = suggestionsData
                .map(suggestion => suggestion.toLowerCase())
                // Remove duplicates
                .filter((suggestion, index, self) => self.indexOf(suggestion) === index)
                .slice(0, 5);
                
              console.log(`Processed suggestions for "${currentQuery}" (${processedSuggestions.length}):`, processedSuggestions);
              
              // Only show suggestions if we have any after processing
              if (processedSuggestions.length > 0) {
                setSuggestions(processedSuggestions);
                setShowSuggestions(true);
                console.log(`Setting ${processedSuggestions.length} suggestions for "${currentQuery}"`);
              } else {
                setSuggestions([]);
                setShowSuggestions(false);
                console.log(`No suggestions to show after processing for "${currentQuery}"`);
              }
            }
          } else {
            console.error('Unexpected response format for suggestions:', suggestionsData);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        } else {
          console.log(`Ignoring stale suggestions for "${currentQuery}" as current query is now "${query}"`);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        // Only update loading state if this is still the current query
        if (text === query) {
          setLoading(false);
        }
      }
    }, 300),
    [query] // Add query as a dependency to recreate the debounced function when query changes
  );
  
  // Effect to trigger debounced search for autocomplete
  useEffect(() => {
    // Reset UI state when query changes
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
    } else {
      // Hide results when typing
      setShowResults(false);
      // Trigger debounced search
      debouncedGetSuggestions(query);
    }
    
    // Cleanup
    return () => {
      debouncedGetSuggestions.cancel();
    };
  }, [query, debouncedGetSuggestions]);
  
  // Handle full search
  const handleSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) return;
    
    try {
      setLoading(true);
      setShowSuggestions(false);
      
      const results = await searchFood(searchQuery);
      if (results && results.hints && Array.isArray(results.hints)) {
        // Apply filters if any are set
        let filteredResults = results.hints;
        
        if (filters.showPackagedOnly) {
          filteredResults = filteredResults.filter((item: FoodItem) => 
            item.food.category === 'Packaged foods');
        }
        
        if (filters.showGenericOnly) {
          filteredResults = filteredResults.filter((item: FoodItem) => 
            item.food.category === 'Generic foods');
        }
        
        if (filters.category) {
          filteredResults = filteredResults.filter((item: FoodItem) => 
            item.food.category === filters.category);
        }
        
        if (filters.healthLabels && filters.healthLabels.length > 0) {
          filteredResults = filteredResults.filter((item: FoodItem) => {
            if (!item.food.healthLabels) return false;
            return filters.healthLabels?.every(label => 
              item.food.healthLabels?.includes(label));
          });
        }
        
        if (filters.dietLabels && filters.dietLabels.length > 0) {
          filteredResults = filteredResults.filter((item: FoodItem) => {
            if (!item.food.dietLabels) return false;
            return filters.dietLabels?.every(label => 
              item.food.dietLabels?.includes(label));
          });
        }
        
        setSearchResults(filteredResults);
        setShowResults(true);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching for food:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };
  
  // Handle food item selection
  const handleFoodSelect = async (food: FoodItem) => {
    try {
      // Check if we need to fetch nutrition details
      if (!food.food.nutrients || Object.keys(food.food.nutrients).length === 0) {
        setLoadingNutrition(true);
        const nutritionDetails = await getFoodNutrition(food.food.foodId);
        
          // Update the food item with nutrition details if available
          if (nutritionDetails && nutritionDetails.totalNutrients) {
            const nutrients: Record<string, number> = {};
            for (const [key, value] of Object.entries(nutritionDetails.totalNutrients)) {
              if (value && typeof value === 'object' && 'quantity' in value && typeof value.quantity === 'number') {
                nutrients[key] = value.quantity;
              }
            }
            food.food.nutrients = nutrients;
          }
        setLoadingNutrition(false);
      }
      
      // Pass the selected food to the parent component
      onFoodSelect(food);
      setQuery('');
      setSearchResults([]);
      setShowResults(false);
    } catch (error) {
      console.error('Error fetching nutrition details:', error);
      // Still pass the food item even if nutrition fetch fails
      onFoodSelect(food);
      setQuery('');
      setSearchResults([]);
      setShowResults(false);
    }
  };
  
  // Handle viewing nutrition details
  const handleViewNutrition = async (food: FoodItem) => {
    setSelectedFood(food);
    setLoadingNutrition(true);
    setShowNutritionModal(true);
    
    try {
      const nutritionDetails = await getFoodNutrition(food.food.foodId);
      setNutritionData(nutritionDetails);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    } finally {
      setLoadingNutrition(false);
    }
  };
  
  // Toggle advanced filters modal
  const toggleFiltersModal = () => {
    setShowFilters(!showFilters);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };
  
  // Apply filters and close modal
  const applyFilters = () => {
    setShowFilters(false);
    // Re-run search with current filters if we have results
    if (query.length >= 2) {
      handleSearch(query);
    }
  };
  
  // Toggle a health or diet label filter
  const toggleLabelFilter = (label: string, type: 'health' | 'diet') => {
    setFilters(prevFilters => {
      const key = type === 'health' ? 'healthLabels' : 'dietLabels';
      const currentLabels = prevFilters[key] || [];
      
      if (currentLabels.includes(label)) {
        return {
          ...prevFilters,
          [key]: currentLabels.filter(l => l !== label)
        };
      } else {
        return {
          ...prevFilters,
          [key]: [...currentLabels, label]
        };
      }
    });
  };
  
  // Get category label with icon
  const getCategoryLabel = (category?: string) => {
    if (!category) return null;
    
    let iconName = 'apple';
    let color = theme.colors.text;
    
    // Determine icon and color based on category
    if (category === 'Generic foods') {
      iconName = 'apple';
      color = '#4CAF50'; // Green
    } else if (category === 'Packaged foods') {
      iconName = 'shopping-bag';
      color = '#FF9800'; // Orange
    } else if (category === 'Fast foods') {
      iconName = 'fastfood';
      color = '#F44336'; // Red
    } else if (category === 'Generic meals') {
      iconName = 'restaurant';
      color = '#2196F3'; // Blue
    } else {
      iconName = 'restaurant-menu';
    }
    
    // Define a type for the icon name to avoid TypeScript errors
    type MaterialIconName = 
      | 'apple' 
      | 'shopping-bag' 
      | 'fastfood' 
      | 'restaurant' 
      | 'restaurant-menu';
    
    return (
      <View style={styles.categoryContainer}>
        <MaterialIcons name={iconName as MaterialIconName} size={16} color={color} />
        <Text style={[styles.categoryText, { color }]}>{category}</Text>
      </View>
    );
  };
  
  // Render a badge for health/diet labels
  const renderLabelBadge = (label: string, type: 'health' | 'diet') => {
    const backgroundColor = type === 'health' ? '#E3F2FD' : '#FFF3E0';
    const textColor = type === 'health' ? '#1565C0' : '#E65100';
    
    return (
      <View style={[styles.labelBadge, { backgroundColor }]}>
        <Text style={[styles.labelText, { color: textColor }]}>{label}</Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { borderColor: theme.colors.border }]}
          value={query}
          onChangeText={setQuery}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text + '80'} // 50% opacity
          onSubmitEditing={() => handleSearch(query)}
          returnKeyType="search"
        />
        {loading && (
          <ActivityIndicator 
            style={styles.loadingIndicator} 
            size="small" 
            color={theme.colors.primary} 
          />
        )}
        <TouchableOpacity 
          style={styles.filtersButton}
          onPress={toggleFiltersModal}
          accessibilityLabel="Advanced filters"
        >
          <FontAwesome name="sliders" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Autocomplete suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item, index) => `suggestion-${index}-${item}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.suggestionItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => handleSuggestionSelect(item)}
            >
              <Text style={{ color: theme.colors.text }}>{item}</Text>
            </TouchableOpacity>
          )}
          style={[styles.suggestionsList, { backgroundColor: theme.colors.card }]}
        />
      )}
      
      {/* Search results */}
      {showResults && searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `result-${index}-${item.food.foodId}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => handleFoodSelect(item)}
            >
              <View style={styles.resultContent}>
                <View style={styles.resultHeader}>
                  <Text style={[styles.foodName, { color: theme.colors.text }]}>{item.food.label}</Text>
                  {getCategoryLabel(item.food.category)}
                </View>
                
                {item.food.brand && (
                  <Text style={styles.brandText}>
                    <FontAwesome name="tag" size={12} color="#757575" /> {item.food.brand}
                  </Text>
                )}
                
                <Text style={[styles.foodDetails, { color: theme.colors.text + 'CC' }]}>
                  {item.food.nutrients?.ENERC_KCAL ? `${Math.round(item.food.nutrients.ENERC_KCAL)} cal` : ''}
                  {item.food.nutrients?.PROCNT ? ` • ${Math.round(item.food.nutrients.PROCNT)}g protein` : ''}
                  {item.food.nutrients?.FAT ? ` • ${Math.round(item.food.nutrients.FAT)}g fat` : ''}
                  {item.food.nutrients?.CHOCDF ? ` • ${Math.round(item.food.nutrients.CHOCDF)}g carbs` : ''}
                  {item.food.nutrients?.FIBTG ? ` • ${Math.round(item.food.nutrients.FIBTG)}g fiber` : ''}
                </Text>
                
                {/* Health and Diet Labels */}
                {(item.food.healthLabels?.length || item.food.dietLabels?.length) ? (
                  <View style={styles.labelsContainer}>
                    {item.food.healthLabels?.slice(0, 3).map((label, index) => (
                      <View key={`health-${index}`} style={styles.labelWrapper}>
                        {renderLabelBadge(label, 'health')}
                      </View>
                    ))}
                    {item.food.dietLabels?.slice(0, 2).map((label, index) => (
                      <View key={`diet-${index}`} style={styles.labelWrapper}>
                        {renderLabelBadge(label, 'diet')}
                      </View>
                    ))}
                    {((item.food.healthLabels?.length || 0) > 3 || (item.food.dietLabels?.length || 0) > 2) && (
                      <Text style={styles.moreLabelsText}>+more</Text>
                    )}
                  </View>
                ) : null}
                
                <View style={styles.resultActions}>
                  <TouchableOpacity 
                    style={styles.nutritionButton}
                    onPress={() => handleViewNutrition(item)}
                  >
                    <Text style={styles.nutritionButtonText}>Nutrition Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
          style={[styles.resultsList, { backgroundColor: theme.colors.card }]}
        />
      )}
      
      {/* No results message */}
      {showResults && searchResults.length === 0 && !loading && (
        <View style={[styles.noResults, { backgroundColor: theme.colors.card }]}>
          <Text style={{ color: theme.colors.text }}>No results found for "{query}"</Text>
        </View>
      )}
      
      {/* Advanced Filters Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleFiltersModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Advanced Filters</Text>
              <TouchableOpacity onPress={toggleFiltersModal}>
                <FontAwesome name="times" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filtersScrollView}>
              {/* Category Filters */}
              <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Food Categories</Text>
              
              <View style={styles.switchRow}>
                <Text style={{ color: theme.colors.text }}>Generic Foods Only</Text>
                <Switch
                  value={filters.showGenericOnly || false}
                  onValueChange={(value) => setFilters({...filters, showGenericOnly: value, showPackagedOnly: false})}
                />
              </View>
              
              <View style={styles.switchRow}>
                <Text style={{ color: theme.colors.text }}>Packaged Foods Only</Text>
                <Switch
                  value={filters.showPackagedOnly || false}
                  onValueChange={(value) => setFilters({...filters, showPackagedOnly: value, showGenericOnly: false})}
                />
              </View>
              
              {/* Health Labels */}
              <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Health Labels</Text>
              <View style={styles.labelsGrid}>
                {['Gluten-free', 'Vegan', 'Vegetarian', 'Dairy-free', 'Low-sugar', 'Keto-friendly'].map((label) => (
                  <TouchableOpacity
                    key={`health-${label}`}
                    style={[
                      styles.filterLabelBadge,
                      { backgroundColor: (filters.healthLabels || []).includes(label) ? '#1565C0' : '#E3F2FD' }
                    ]}
                    onPress={() => toggleLabelFilter(label, 'health')}
                  >
                    <Text 
                      style={[
                        styles.filterLabelText, 
                        { color: (filters.healthLabels || []).includes(label) ? '#FFFFFF' : '#1565C0' }
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Diet Labels */}
              <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Diet Labels</Text>
              <View style={styles.labelsGrid}>
                {['Balanced', 'High-protein', 'Low-carb', 'Low-fat'].map((label) => (
                  <TouchableOpacity
                    key={`diet-${label}`}
                    style={[
                      styles.filterLabelBadge,
                      { backgroundColor: (filters.dietLabels || []).includes(label) ? '#E65100' : '#FFF3E0' }
                    ]}
                    onPress={() => toggleLabelFilter(label, 'diet')}
                  >
                    <Text 
                      style={[
                        styles.filterLabelText, 
                        { color: (filters.dietLabels || []).includes(label) ? '#FFFFFF' : '#E65100' }
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.footerButton, styles.resetButton]}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.footerButton, styles.applyButton]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Nutrition Details Modal */}
      <Modal
        visible={showNutritionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNutritionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Nutrition Details
              </Text>
              <TouchableOpacity 
                onPress={() => setShowNutritionModal(false)}
                accessibilityLabel="Close nutrition details"
              >
                <FontAwesome name="times" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            {loadingNutrition ? (
              <View style={styles.nutritionLoading}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: theme.colors.text, marginTop: 16 }}>Loading nutrition data...</Text>
              </View>
            ) : (
              <ScrollView style={styles.nutritionScrollView}>
                {selectedFood && (
                  <>
                    <View style={styles.nutritionHeader}>
                      <Text style={[styles.nutritionFoodName, { color: theme.colors.text }]}>
                        {selectedFood.food.label}
                      </Text>
                      {selectedFood.food.brand && (
                        <Text style={styles.nutritionBrand}>{selectedFood.food.brand}</Text>
                      )}
                      {getCategoryLabel(selectedFood.food.category)}
                    </View>
                    
                    {selectedFood.food.image && (
                      <Image 
                        source={{ uri: selectedFood.food.image }} 
                        style={styles.foodImage}
                        resizeMode="cover"
                      />
                    )}
                    
                    {nutritionData ? (
                      <View style={styles.nutritionDetails}>
                        <Text style={[styles.nutritionSectionTitle, { color: theme.colors.text }]}>
                          Nutrition Facts (per 100g)
                        </Text>
                        
                        <View style={styles.nutrientRow}>
                          <Text style={[styles.nutrientName, { color: theme.colors.text }]}>Calories</Text>
                          <Text style={[styles.nutrientValue, { color: theme.colors.text }]}>
                            {nutritionData.totalNutrients?.ENERC_KCAL 
                              ? Math.round(nutritionData.totalNutrients.ENERC_KCAL.quantity) + ' kcal'
                              : 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.nutrientRow}>
                          <Text style={[styles.nutrientName, { color: theme.colors.text }]}>Protein</Text>
                          <Text style={[styles.nutrientValue, { color: theme.colors.text }]}>
                            {nutritionData.totalNutrients?.PROCNT 
                              ? Math.round(nutritionData.totalNutrients.PROCNT.quantity) + ' g'
                              : 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.nutrientRow}>
                          <Text style={[styles.nutrientName, { color: theme.colors.text }]}>Fat</Text>
                          <Text style={[styles.nutrientValue, { color: theme.colors.text }]}>
                            {nutritionData.totalNutrients?.FAT 
                              ? Math.round(nutritionData.totalNutrients.FAT.quantity) + ' g'
                              : 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.nutrientRow}>
                          <Text style={[styles.nutrientName, { color: theme.colors.text }]}>Carbohydrates</Text>
                          <Text style={[styles.nutrientValue, { color: theme.colors.text }]}>
                            {nutritionData.totalNutrients?.CHOCDF 
                              ? Math.round(nutritionData.totalNutrients.CHOCDF.quantity) + ' g'
                              : 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.nutrientRow}>
                          <Text style={[styles.nutrientName, { color: theme.colors.text }]}>Fiber</Text>
                          <Text style={[styles.nutrientValue, { color: theme.colors.text }]}>
                            {nutritionData.totalNutrients?.FIBTG 
                              ? Math.round(nutritionData.totalNutrients.FIBTG.quantity) + ' g'
                              : 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.nutrientRow}>
                          <Text style={[styles.nutrientName, { color: theme.colors.text }]}>Sugars</Text>
                          <Text style={[styles.nutrientValue, { color: theme.colors.text }]}>
                            {nutritionData.totalNutrients?.SUGAR 
                              ? Math.round(nutritionData.totalNutrients.SUGAR.quantity) + ' g'
                              : 'N/A'}
                          </Text>
                        </View>
                        
                        <View style={styles.nutrientRow}>
                          <Text style={[styles.nutrientName, { color: theme.colors.text }]}>Sodium</Text>
                          <Text style={[styles.nutrientValue, { color: theme.colors.text }]}>
                            {nutritionData.totalNutrients?.NA 
                              ? Math.round(nutritionData.totalNutrients.NA.quantity) + ' mg'
                              : 'N/A'}
                          </Text>
                        </View>
                        
                        {/* Available Measures */}
                        {selectedFood.measures && selectedFood.measures.length > 0 && (
                          <>
                            <Text style={[styles.nutritionSectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
                              Available Measures
                            </Text>
                            {selectedFood.measures.map((measure, index) => (
                              <Text key={index} style={[styles.measureText, { color: theme.colors.text }]}>
                                • {measure.label} ({Math.round(measure.weight)}g)
                              </Text>
                            ))}
                          </>
                        )}
                        
                        {/* Health and Diet Labels */}
                        {(nutritionData.healthLabels?.length > 0 || nutritionData.dietLabels?.length > 0) && (
                          <View style={styles.nutritionLabelsContainer}>
                            <Text style={[styles.nutritionSectionTitle, { color: theme.colors.text, marginTop: 20 }]}>
                              Labels
                            </Text>
                            <View style={styles.nutritionLabelsGrid}>
                              {nutritionData.healthLabels?.map((label: string, index: number) => (
                                <View key={`health-${index}`} style={styles.nutritionLabelWrapper}>
                                  {renderLabelBadge(label, 'health')}
                                </View>
                              ))}
                              {nutritionData.dietLabels?.map((label: string, index: number) => (
                                <View key={`diet-${index}`} style={styles.nutritionLabelWrapper}>
                                  {renderLabelBadge(label, 'diet')}
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    ) : (
                      <Text style={{ color: theme.colors.text, padding: 16, textAlign: 'center' }}>
                        No detailed nutrition data available.
                      </Text>
                    )}
                  </>
                )}
              </ScrollView>
            )}
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.footerButton, styles.applyButton]}
                onPress={() => {
                  setShowNutritionModal(false);
                  if (selectedFood) {
                    handleFoodSelect(selectedFood);
                  }
                }}
                accessibilityLabel="Select this food"
              >
                <Text style={styles.applyButtonText}>Select This Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default FoodSearchAutocomplete;
