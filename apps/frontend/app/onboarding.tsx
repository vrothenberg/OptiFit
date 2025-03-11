import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Dimensions, 
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';
import TimePicker from '@/components/TimePicker';
import * as Storage from '@/services/api/storage';
import { submitCircadianQuestionnaire } from '@/services/userService';
import { CircadianQuestionnaire } from '@/services/api/types';

const { width } = Dimensions.get('window');

// Define question types
type QuestionType = 'welcome' | 'sleep' | 'eating' | 'exercise' | 'nutrition' | 'goals' | 'summary';

// Define the questionnaire data structure
interface QuestionData {
  type: QuestionType;
  title: string;
  description: string;
}

// Define the questions with the new nutrition step added
const questions: QuestionData[] = [
  {
    type: 'welcome',
    title: 'Welcome to OptiFit',
    description: 'Let\'s get to know you better to calculate your Circadian Score and provide personalized recommendations.',
  },
  {
    type: 'sleep',
    title: 'Sleep Patterns',
    description: 'Tell us about your sleep habits to help optimize your circadian rhythm.',
  },
  {
    type: 'eating',
    title: 'Eating Habits',
    description: 'Your meal timing plays a crucial role in your circadian health.',
  },
  {
    type: 'exercise',
    title: 'Exercise Routine',
    description: 'Physical activity timing affects your body\'s natural rhythms.',
  },
  {
    type: 'nutrition',
    title: 'Nutrition Habits',
    description: 'Tell us about your dietary preferences and nutrition choices.',
  },
  {
    type: 'goals',
    title: 'Your Goals',
    description: 'What are you looking to achieve with OptiFit?',
  },
  {
    type: 'summary',
    title: 'Your Circadian Profile',
    description: 'Based on your answers, we\'ve calculated your initial Circadian Score.',
  },
];

// Storage key for questionnaire progress
const QUESTIONNAIRE_PROGRESS_KEY = 'optifit_questionnaire_progress';

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Form state for existing questions
  const [sleepTime, setSleepTime] = useState('10:30 PM');
  const [wakeTime, setWakeTime] = useState('6:30 AM');
  const [sleepQuality, setSleepQuality] = useState(3);
  const [firstMeal, setFirstMeal] = useState('7:30 AM');
  const [lastMeal, setLastMeal] = useState('7:00 PM');
  const [fastingPractice, setFastingPractice] = useState(false);
  const [exerciseDays, setExerciseDays] = useState(3);
  const [exerciseTime, setExerciseTime] = useState('Morning');
  const [goals, setGoals] = useState(['Improve sleep', 'Optimize meal timing']);
  
  // New state for nutrition question
  const [dietType, setDietType] = useState('Omnivore');
  const [supplementUse, setSupplementUse] = useState(false);
  
  // Load saved progress on component mount
  useEffect(() => {
    const loadSavedProgress = async () => {
      try {
        const savedProgress = await Storage.getItemAsync(QUESTIONNAIRE_PROGRESS_KEY);
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          
          // Restore current step
          setCurrentStep(parsedProgress.currentStep || 0);
          
          // Restore all form data
          const savedData = parsedProgress.data || {};
          setSleepTime(savedData.sleepTime || '10:30 PM');
          setWakeTime(savedData.wakeTime || '6:30 AM');
          setSleepQuality(savedData.sleepQuality || 3);
          setFirstMeal(savedData.firstMeal || '7:30 AM');
          setLastMeal(savedData.lastMeal || '7:00 PM');
          setFastingPractice(savedData.fastingPractice || false);
          setExerciseDays(savedData.exerciseDays || 3);
          setExerciseTime(savedData.exerciseTime || 'Morning');
          setGoals(savedData.goals || ['Improve sleep', 'Optimize meal timing']);
          setDietType(savedData.dietType || 'Omnivore');
          setSupplementUse(savedData.supplementUse || false);
          
          console.log('Questionnaire progress loaded from storage');
        }
      } catch (error) {
        console.error('Error loading saved questionnaire progress:', error);
      }
    };
    
    loadSavedProgress();
  }, []);
  
  // Save progress to local storage
  const saveProgress = async () => {
    try {
      const questionnaireProgress = {
        currentStep,
        data: {
          sleepTime,
          wakeTime,
          sleepQuality,
          firstMeal,
          lastMeal,
          fastingPractice,
          exerciseDays,
          exerciseTime,
          dietType,
          supplementUse,
          goals,
        }
      };
      
      await Storage.setItemAsync(QUESTIONNAIRE_PROGRESS_KEY, JSON.stringify(questionnaireProgress));
      console.log('Questionnaire progress saved to storage');
    } catch (error) {
      console.error('Error saving questionnaire progress:', error);
    }
  };
  
  // Calculate progress percentage
  const progress = ((currentStep) / (questions.length - 1)) * 100;
  
  // Determine chronotype based on sleep and wake times
  const determineChronotype = (sleepTime: string, wakeTime: string): 'early' | 'intermediate' | 'late' => {
    // Simple logic to determine chronotype
    if (sleepTime.includes('9:') && sleepTime.includes('PM') && 
        (wakeTime.includes('5:') || wakeTime.includes('6:')) && wakeTime.includes('AM')) {
      return 'early';
    } else if (sleepTime.includes('12:') || sleepTime.includes('1:') || 
               (sleepTime.includes('2:') && sleepTime.includes('AM'))) {
      return 'late';
    } else {
      return 'intermediate';
    }
  };
  
  // Submit questionnaire data to API
  const handleSubmitQuestionnaire = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Prepare the data for submission
      const circadianData: CircadianQuestionnaire = {
        sleepTime,
        wakeTime,
        chronotype: determineChronotype(sleepTime, wakeTime),
        energyLevels: [sleepQuality],
        mealTimes: [firstMeal, lastMeal],
        fastingPractice,
        exerciseFrequency: exerciseDays,
        exerciseTime,
        dietType,
        supplementUse,
        goals
      };
      
      // Submit to API
      const updatedUser = await submitCircadianQuestionnaire(circadianData);
      console.log('Questionnaire submitted successfully:', updatedUser);
      
      // Clear local storage after successful submission
      await Storage.deleteItemAsync(QUESTIONNAIRE_PROGRESS_KEY);
      
      // Navigate to the main app
      router.push('/(tabs)');
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      setSubmitError('Failed to submit questionnaire. Please try again.');
      
      // Show error message
      Alert.alert(
        'Submission Error',
        'There was a problem submitting your questionnaire. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle next button press
  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      // Save progress before moving to next step
      saveProgress();
      
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Handle final submission
      handleSubmitQuestionnaire();
    }
  };
  
  // Handle back button press
  const handleBack = () => {
    if (currentStep > 0) {
      // Save progress before moving to previous step
      saveProgress();
      
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep - 1);
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };
  
  // Render the current question
  const renderQuestion = () => {
    const question = questions[currentStep];
    
    switch (question.type) {
      case 'welcome':
        return (
          <View style={styles.questionContainer}>
            <FontAwesome name="clock-o" size={80} color={Theme.COLORS.PRIMARY} style={styles.icon} />
            <Text style={styles.welcomeText}>
              We'll ask you a few questions about your sleep, eating, exercise, and nutrition habits to help optimize your circadian rhythm.
            </Text>
          </View>
        );
        
      case 'sleep':
        return (
          <View style={styles.questionContainer}>
            <View style={styles.inputGroup}>
              <TimePicker
                label="What time do you typically go to bed?"
                value={sleepTime}
                onChange={setSleepTime}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <TimePicker
                label="What time do you typically wake up?"
                value={wakeTime}
                onChange={setWakeTime}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>How would you rate your sleep quality?</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      sleepQuality === rating && styles.ratingButtonSelected,
                    ]}
                    onPress={() => setSleepQuality(rating)}
                  >
                    <Text
                      style={[
                        styles.ratingText,
                        sleepQuality === rating && styles.ratingTextSelected,
                      ]}
                    >
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.ratingLabels}>
                <Text style={styles.ratingLabelText}>Poor</Text>
                <Text style={styles.ratingLabelText}>Excellent</Text>
              </View>
            </View>
          </View>
        );
        
      case 'eating':
        return (
          <View style={styles.questionContainer}>
            <View style={styles.inputGroup}>
              <TimePicker
                label="When do you typically eat your first meal?"
                value={firstMeal}
                onChange={setFirstMeal}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <TimePicker
                label="When do you typically eat your last meal?"
                value={lastMeal}
                onChange={setLastMeal}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Do you practice intermittent fasting?</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !fastingPractice && styles.toggleButtonSelected,
                  ]}
                  onPress={() => setFastingPractice(false)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      !fastingPractice && styles.toggleTextSelected,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    fastingPractice && styles.toggleButtonSelected,
                  ]}
                  onPress={() => setFastingPractice(true)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      fastingPractice && styles.toggleTextSelected,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
        
      case 'exercise':
        return (
          <View style={styles.questionContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>How many days per week do you exercise?</Text>
              <View style={styles.daysContainer}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.dayButton,
                      exerciseDays === days && styles.dayButtonSelected,
                    ]}
                    onPress={() => setExerciseDays(days)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        exerciseDays === days && styles.dayTextSelected,
                      ]}
                    >
                      {days}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>What time of day do you prefer to exercise?</Text>
              <View style={styles.timeContainer}>
                {['Morning', 'Afternoon', 'Evening', 'Night'].map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeButton,
                      exerciseTime === time && styles.timeButtonSelected,
                    ]}
                    onPress={() => setExerciseTime(time)}
                  >
                    <Text
                      style={[
                        styles.timeText,
                        exerciseTime === time && styles.timeTextSelected,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
        
      case 'nutrition':
        // New nutrition question UI
        const dietOptions = ['Omnivore', 'Vegetarian', 'Vegan', 'Paleo'];
        return (
          <View style={styles.questionContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>What type of diet do you follow?</Text>
              <View style={styles.goalsContainer}>
                {dietOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.goalButton,
                      dietType === option && styles.goalButtonSelected,
                    ]}
                    onPress={() => setDietType(option)}
                  >
                    <Text
                      style={[
                        styles.goalText,
                        dietType === option && styles.goalTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Do you take any supplements?</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    !supplementUse && styles.toggleButtonSelected,
                  ]}
                  onPress={() => setSupplementUse(false)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      !supplementUse && styles.toggleTextSelected,
                    ]}
                  >
                    No
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    supplementUse && styles.toggleButtonSelected,
                  ]}
                  onPress={() => setSupplementUse(true)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      supplementUse && styles.toggleTextSelected,
                    ]}
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
        
      case 'goals':
        const allGoals = [
          'Improve sleep',
          'Optimize meal timing',
          'Increase energy',
          'Weight management',
          'Better focus',
          'Reduce stress'
        ];
        
        return (
          <View style={styles.questionContainer}>
            <Text style={styles.inputLabel}>What are your main goals? (Select all that apply)</Text>
            <View style={styles.goalsContainer}>
              {allGoals.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.goalButton,
                    goals.includes(goal) && styles.goalButtonSelected,
                  ]}
                  onPress={() => {
                    if (goals.includes(goal)) {
                      setGoals(goals.filter(g => g !== goal));
                    } else {
                      setGoals([...goals, goal]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.goalText,
                      goals.includes(goal) && styles.goalTextSelected,
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
        
      case 'summary':
        // Calculate a mock circadian score based on user inputs
        const calculateScore = () => {
          let score = 70; // Base score
          
          // Points for sleep times and quality
          if (sleepTime.includes('9:') || sleepTime.includes('10:')) score += 5;
          if (wakeTime.includes('6:') || wakeTime.includes('7:')) score += 5;
          score += (sleepQuality - 1) * 2;
          
          // Points for eating window and fasting
          const fastingWindow = fastingPractice ? 5 : 0;
          score += fastingWindow;
          
          // Points for exercise frequency
          score += Math.min(exerciseDays * 2, 10);
          
          // Bonus points based on nutrition choices (arbitrary for demo)
          if (supplementUse) score += 3;
          if (dietType === 'Vegetarian' || dietType === 'Vegan') score += 2;
          if (dietType === 'Paleo') score += 3;
          
          // Cap the score at 100
          return Math.min(score, 100);
        };
        
        const circadianScore = calculateScore();
        
        return (
          <View style={styles.questionContainer}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Your Circadian Score</Text>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{circadianScore}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>
            
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              <View style={styles.recommendation}>
                <FontAwesome name="moon-o" size={20} color={Theme.COLORS.PRIMARY} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>
                  Try to maintain a consistent sleep schedule, even on weekends.
                </Text>
              </View>
              <View style={styles.recommendation}>
                <FontAwesome name="cutlery" size={20} color={Theme.COLORS.PRIMARY} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>
                  Consider extending your overnight fasting period to 12-14 hours.
                </Text>
              </View>
              <View style={styles.recommendation}>
                <FontAwesome name="heartbeat" size={20} color={Theme.COLORS.PRIMARY} style={styles.recommendationIcon} />
                <Text style={styles.recommendationText}>
                  Morning exercise can help regulate your circadian rhythm.
                </Text>
              </View>
            </View>
            
            {/* Display a summary of nutrition choices */}
            <View style={styles.nutritionSummary}>
              <Text style={styles.summaryLabel}>Nutrition Profile:</Text>
              <Text style={styles.summaryText}>Diet Type: {dietType}</Text>
              <Text style={styles.summaryText}>Supplements: {supplementUse ? "Yes" : "No"}</Text>
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ 
        title: 'Onboarding',
        headerStyle: {
          backgroundColor: Theme.COLORS.PRIMARY,
        },
        headerTintColor: Theme.COLORS.WHITE,
      }} />
      <StatusBar style="light" />
      <LinearGradient
        colors={[Theme.COLORS.GRADIENT_START, Theme.COLORS.GRADIENT_END]}
        style={styles.background}
      />
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep + 1} of {questions.length}
        </Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
            {questions[currentStep].title}
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, { opacity: fadeAnim }]}>
            {questions[currentStep].description}
          </Animated.Text>
        </View>

        <Animated.View 
          style={[
            styles.contentContainer, 
            { opacity: fadeAnim, transform: [{ translateX: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            }) }] }
          ]}
        >
          {renderQuestion()}
        </Animated.View>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting && currentStep === questions.length - 1 ? (
              <ActivityIndicator color={Theme.COLORS.WHITE} />
            ) : (
              <Text style={styles.buttonText}>
                {currentStep < questions.length - 1 ? 'Next' : 'Finish'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  progressContainer: {
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.COLORS.WHITE,
    borderRadius: 3,
  },
  progressText: {
    color: Theme.COLORS.WHITE,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Theme.COLORS.WHITE,
    opacity: 0.9,
    marginTop: 10,
    textAlign: 'center',
  },
  contentContainer: {
    width: '100%',
    marginBottom: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
    lineHeight: 24,
    textAlign: 'center',
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ratingButtonSelected: {
    backgroundColor: Theme.COLORS.PRIMARY,
    borderColor: Theme.COLORS.PRIMARY,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  ratingTextSelected: {
    color: Theme.COLORS.WHITE,
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabelText: {
    fontSize: 12,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  toggleButtonSelected: {
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextSelected: {
    color: Theme.COLORS.WHITE,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '12%',
    aspectRatio: 1,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dayButtonSelected: {
    backgroundColor: Theme.COLORS.PRIMARY,
    borderColor: Theme.COLORS.PRIMARY,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  dayTextSelected: {
    color: Theme.COLORS.WHITE,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeButton: {
    width: '48%',
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  timeButtonSelected: {
    backgroundColor: Theme.COLORS.PRIMARY,
    borderColor: Theme.COLORS.PRIMARY,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timeTextSelected: {
    color: Theme.COLORS.WHITE,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalButton: {
    width: '48%',
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  goalButtonSelected: {
    backgroundColor: Theme.COLORS.PRIMARY,
    borderColor: Theme.COLORS.PRIMARY,
  },
  goalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  goalTextSelected: {
    color: Theme.COLORS.WHITE,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 10,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
  },
  scoreMax: {
    fontSize: 14,
    color: Theme.COLORS.WHITE,
    opacity: 0.8,
  },
  recommendationsContainer: {
    width: '100%',
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 15,
  },
  recommendation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  recommendationIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: Theme.COLORS.DEFAULT,
    lineHeight: 20,
  },
  nutritionSummary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    color: Theme.COLORS.DEFAULT,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: Theme.COLORS.WHITE,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: Theme.COLORS.PRIMARY,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Theme.COLORS.WHITE,
  },
  backButtonText: {
    color: Theme.COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
