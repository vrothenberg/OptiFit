import React, { useState, useEffect, useCallback } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { searchFood, getFoodAutocompleteSuggestions } from '../services/loggingService';
import { debounce } from 'lodash';
import { useTheme } from '@react-navigation/native';

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

interface FoodSearchAutocompleteProps {
  onFoodSelect: (food: FoodItem) => void;
  placeholder?: string;
}

const FoodSearchAutocomplete: React.FC<FoodSearchAutocompleteProps> = ({ 
  onFoodSelect,
  placeholder = 'Search for a food...'
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const theme = useTheme();
  
  // Debounced search function for autocomplete
  const debouncedGetSuggestions = useCallback(
    debounce(async (text: string) => {
      if (text.length < 2) {
        setSuggestions([]);
        return;
      }
      
      try {
        setLoading(true);
        const suggestionsData = await getFoodAutocompleteSuggestions(text);
        setSuggestions(suggestionsData);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );
  
  // Effect to trigger debounced search for autocomplete
  useEffect(() => {
    if (query.length >= 2) {
      debouncedGetSuggestions(query);
      setShowSuggestions(true);
      setShowResults(false);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
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
      if (results && results.hints) {
        setSearchResults(results.hints);
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
  const handleFoodSelect = (food: FoodItem) => {
    onFoodSelect(food);
    setQuery('');
    setSearchResults([]);
    setShowResults(false);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
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
                <Text style={[styles.foodName, { color: theme.colors.text }]}>{item.food.label}</Text>
                <Text style={[styles.foodDetails, { color: theme.colors.text + 'CC' }]}>
                  {item.food.nutrients?.ENERC_KCAL ? `${Math.round(item.food.nutrients.ENERC_KCAL)} cal` : ''}
                  {item.food.nutrients?.PROCNT ? ` • ${Math.round(item.food.nutrients.PROCNT)}g protein` : ''}
                  {item.food.nutrients?.FAT ? ` • ${Math.round(item.food.nutrients.FAT)}g fat` : ''}
                  {item.food.nutrients?.CHOCDF ? ` • ${Math.round(item.food.nutrients.CHOCDF)}g carbs` : ''}
                </Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 12,
  },
  suggestionsList: {
    maxHeight: 200,
    borderRadius: 8,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  resultsList: {
    maxHeight: 300,
    borderRadius: 8,
    marginTop: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  resultContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 4,
  },
});

export default FoodSearchAutocomplete;
