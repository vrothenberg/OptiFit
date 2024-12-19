# Wireframe: Food Logging

## **Overview**
The Food Logging screen allows users to log their meals easily, either by taking photos of their food or by manually entering details. It provides nutritional information and categorizes meals for better tracking and analysis.

## **Layout Description**

### **1. Header**
- **Back Button:** Positioned at the top-left to navigate back to the Dashboard.
- **Title:** Centered, displaying "Log Food."

### **2. Quick Log Options**
- **Photo Log Button:** Prominently placed, allowing users to take a photo of their meal for AI-driven recognition.
- **Manual Log Button:** Below the photo log, enabling users to manually enter food items and quantities.

### **3. Photo Log Workflow**
- **Camera Interface:** Users can capture a photo of their meal.
- **AI Processing:** The app uses Google Cloud Vision API to identify food items and estimate portion sizes.
- **Review Screen:** Displays recognized food items with estimated quantities and nutritional information.
- **Confirmation:** Users can confirm, edit, or reject the detected items before saving to their log.

### **4. Manual Log Workflow**
- **Search Bar:** At the top, allowing users to search for food items in the database.
- **Food List:** Displays search results with options to select and add quantities.
- **Nutritional Information:** Shows detailed nutritional breakdown as users add items.
- **Meal Categorization:** Dropdown to select meal type (breakfast, lunch, dinner, snack).
- **Save Button:** Prominently placed to save the logged meal.

### **5. Nutritional Summary**
- **Total Calories:** Displayed at the bottom, summing up the caloric intake for the meal.
- **Macronutrients Breakdown:** Pie chart or bar graph showing the distribution of proteins, fats, and carbohydrates.
- **Vitamins and Minerals:** List or table displaying key vitamins and minerals consumed.

### **6. Footer**
- **Save and Add More:** Options to save the current log and add another meal.
- **Cancel:** Option to cancel the logging process and return to the Dashboard.

## **User Flow**
1. **Initiating Food Log:**
   - User selects either photo log or manual log option.
   
2. **Photo Log:**
   - Captures meal photo.
   - AI identifies food items and estimates quantities.
   - User reviews and confirms detected items.
   - Saves the meal log with nutritional information.
   
3. **Manual Log:**
   - Searches for specific food items.
   - Selects items and enters quantities.
   - Assigns meal category.
   - Saves the meal log with detailed nutritional breakdown.

4. **Review and Confirmation:**
   - User views a summary of the logged meal, including total calories and macronutrient distribution.
   - Option to add more meals or finish logging for the day.
