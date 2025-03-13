import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';

// Define the FontAwesome icon type for type safety
type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>['name'];

export default function LearnScreen() {
  // Sample knowledge categories that will be implemented in the future
  const knowledgeCategories = [
    {
      id: '1',
      title: 'Circadian Rhythm',
      description: 'Learn about your body\'s natural clock and how to optimize it.',
      icon: 'clock-o' as FontAwesomeIconName,
    },
    {
      id: '2',
      title: 'Nutrition Basics',
      description: 'Understand macronutrients, micronutrients, and healthy eating patterns.',
      icon: 'cutlery' as FontAwesomeIconName,
    },
    {
      id: '3',
      title: 'Exercise Science',
      description: 'Discover the science behind effective workouts and recovery.',
      icon: 'heartbeat' as FontAwesomeIconName,
    },
    {
      id: '4',
      title: 'Sleep Optimization',
      description: 'Tips and techniques for better sleep quality and duration.',
      icon: 'moon-o' as FontAwesomeIconName,
    },
    {
      id: '5',
      title: 'Stress Management',
      description: 'Strategies to reduce stress and improve mental wellbeing.',
      icon: 'leaf' as FontAwesomeIconName,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <FontAwesome name={"book" as FontAwesomeIconName} size={40} color={Theme.COLORS.PRIMARY} />
        <Text style={styles.headerTitle}>Knowledge Base</Text>
        <Text style={styles.headerSubtitle}>
          Your resource for health and wellness information
        </Text>
      </View>

      <View style={styles.comingSoonContainer}>
        <Text style={styles.comingSoonText}>Coming Soon!</Text>
        <Text style={styles.comingSoonDescription}>
          We're building a comprehensive knowledge base to help you understand the science
          behind circadian rhythms, nutrition, exercise, and more. Check back soon!
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Future Categories</Text>

      {knowledgeCategories.map(category => (
        <View key={category.id} style={styles.categoryCard}>
          <View style={styles.categoryIconContainer}>
            <FontAwesome name={category.icon} size={24} color={Theme.COLORS.WHITE} />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <Text style={styles.categoryDescription}>{category.description}</Text>
          </View>
        </View>
      ))}

      <View style={styles.feedbackContainer}>
        <Text style={styles.feedbackTitle}>What would you like to learn?</Text>
        <Text style={styles.feedbackText}>
          We're constantly expanding our knowledge base. If there's a topic you'd like us to cover,
          please let us know through the feedback form in the Account section.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginTop: 15,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Theme.COLORS.MUTED,
    textAlign: 'center',
  },
  comingSoonContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.COLORS.PRIMARY,
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.COLORS.PRIMARY,
    marginBottom: 10,
  },
  comingSoonDescription: {
    fontSize: 16,
    color: Theme.COLORS.DEFAULT,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Theme.COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 5,
  },
  categoryDescription: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    lineHeight: 20,
  },
  feedbackContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 30,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 10,
  },
  feedbackText: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    lineHeight: 20,
  },
});
