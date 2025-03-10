import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

import Theme from '@/constants/Theme';

export default function DashboardScreen() {
  // Mock data for the dashboard
  const circadianScore = 78;
  const todayProgress = {
    calories: 1450,
    caloriesGoal: 2000,
    protein: 65,
    proteinGoal: 120,
    carbs: 180,
    carbsGoal: 250,
    fat: 45,
    fatGoal: 65,
    water: 5,
    waterGoal: 8,
  };
  
  const upcomingEatingWindow = {
    start: '12:30 PM',
    end: '8:30 PM',
  };
  
  const recentActivities = [
    { id: 1, type: 'food', name: 'Breakfast', time: '7:30 AM', calories: 450 },
    { id: 2, type: 'exercise', name: 'Morning Run', time: '8:15 AM', calories: -320 },
    { id: 3, type: 'food', name: 'Lunch', time: '12:45 PM', calories: 580 },
  ];
  
  const recommendations = [
    { id: 1, text: 'Try to have dinner before 7:00 PM to optimize your circadian rhythm.' },
    { id: 2, text: 'Consider a 30-minute morning walk to boost your metabolism.' },
    { id: 3, text: 'Drinking water first thing in the morning can help kickstart your metabolism.' },
  ];

  // Helper function to calculate progress percentage
  const calculateProgress = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Circadian Score */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreNumber}>{circadianScore}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
        <Text style={styles.scoreTitle}>Circadian Score</Text>
        <Text style={styles.scoreDescription}>Your circadian health is good! Keep it up.</Text>
      </View>
      
      {/* Today's Progress */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.progressContainer}>
          {/* Calories */}
          <View style={styles.progressItem}>
            <View style={styles.progressLabelContainer}>
              <FontAwesome name="fire" size={16} color={Theme.COLORS.PRIMARY} />
              <Text style={styles.progressLabel}>Calories</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${calculateProgress(todayProgress.calories, todayProgress.caloriesGoal)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {todayProgress.calories} / {todayProgress.caloriesGoal}
            </Text>
          </View>
          
          {/* Protein */}
          <View style={styles.progressItem}>
            <View style={styles.progressLabelContainer}>
              <FontAwesome name="cutlery" size={16} color={Theme.COLORS.PRIMARY} />
              <Text style={styles.progressLabel}>Protein</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${calculateProgress(todayProgress.protein, todayProgress.proteinGoal)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {todayProgress.protein}g / {todayProgress.proteinGoal}g
            </Text>
          </View>
          
          {/* Water */}
          <View style={styles.progressItem}>
            <View style={styles.progressLabelContainer}>
              <FontAwesome name="tint" size={16} color={Theme.COLORS.PRIMARY} />
              <Text style={styles.progressLabel}>Water</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${calculateProgress(todayProgress.water, todayProgress.waterGoal)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {todayProgress.water} / {todayProgress.waterGoal} glasses
            </Text>
          </View>
        </View>
      </View>
      
      {/* Eating Window */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Eating Window</Text>
        </View>
        
        <View style={styles.eatingWindowContainer}>
          <View style={styles.eatingWindowTimeContainer}>
            <View style={styles.eatingWindowTime}>
              <Text style={styles.eatingWindowTimeLabel}>Start</Text>
              <Text style={styles.eatingWindowTimeValue}>{upcomingEatingWindow.start}</Text>
            </View>
            <View style={styles.eatingWindowDivider} />
            <View style={styles.eatingWindowTime}>
              <Text style={styles.eatingWindowTimeLabel}>End</Text>
              <Text style={styles.eatingWindowTimeValue}>{upcomingEatingWindow.end}</Text>
            </View>
          </View>
          <Text style={styles.eatingWindowDescription}>
            Maintaining a consistent eating window helps optimize your circadian rhythm.
          </Text>
        </View>
      </View>
      
      {/* Recent Activity */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.activityContainer}>
          {recentActivities.map(activity => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <FontAwesome 
                  name={activity.type === 'food' ? 'cutlery' : 'heartbeat'} 
                  size={20} 
                  color={Theme.COLORS.WHITE} 
                  style={[
                    styles.activityIcon,
                    { backgroundColor: activity.type === 'food' ? Theme.COLORS.PRIMARY : Theme.COLORS.INFO }
                  ]}
                />
              </View>
              <View style={styles.activityDetails}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <Text 
                style={[
                  styles.activityCalories,
                  { color: activity.calories > 0 ? Theme.COLORS.DEFAULT : Theme.COLORS.SUCCESS }
                ]}
              >
                {activity.calories > 0 ? '+' : ''}{activity.calories} cal
              </Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Recommendations */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
        </View>
        
        <View style={styles.recommendationsContainer}>
          {recommendations.map(recommendation => (
            <View key={recommendation.id} style={styles.recommendationItem}>
              <FontAwesome name="lightbulb-o" size={20} color={Theme.COLORS.PRIMARY} style={styles.recommendationIcon} />
              <Text style={styles.recommendationText}>{recommendation.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
  },
  scoreLabel: {
    fontSize: 14,
    color: Theme.COLORS.WHITE,
    opacity: 0.8,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.WHITE,
    marginBottom: 5,
  },
  scoreDescription: {
    fontSize: 14,
    color: Theme.COLORS.WHITE,
    opacity: 0.8,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 15,
    marginTop: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
  },
  seeAllText: {
    fontSize: 14,
    color: Theme.COLORS.PRIMARY,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressItem: {
    marginBottom: 15,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Theme.COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Theme.COLORS.MUTED,
    textAlign: 'right',
  },
  eatingWindowContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
  },
  eatingWindowTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 15,
  },
  eatingWindowTime: {
    alignItems: 'center',
  },
  eatingWindowTimeLabel: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    marginBottom: 5,
  },
  eatingWindowTimeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.COLORS.DEFAULT,
  },
  eatingWindowDivider: {
    width: 100,
    height: 2,
    backgroundColor: Theme.COLORS.PRIMARY,
  },
  eatingWindowDescription: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
    textAlign: 'center',
  },
  activityContainer: {
    marginBottom: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityIconContainer: {
    marginRight: 15,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    lineHeight: 36,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.COLORS.DEFAULT,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: Theme.COLORS.MUTED,
  },
  activityCalories: {
    fontSize: 16,
    fontWeight: '600',
  },
  recommendationsContainer: {
    marginBottom: 10,
  },
  recommendationItem: {
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
});
