import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Target,
  BookOpen,
  CheckCircle,
  Star,
  Zap,
  Award,
  TrendingUp,
  Clock,
  Lightbulb,
  Play,
  ChevronRight,
  Gift,
  Flame,
  Heart,
  Rocket,
  Sparkles,
  Users,
  Calendar,
  Bell,
  Settings,
  ArrowRight,
  Brain,
  Activity,
  DollarSign,
  Download
} from 'lucide-react';

// Mock user progress data
const USER_PROGRESS = {
  level: 3,
  xp: 1250,
  xpToNext: 1500,
  totalEarnings: 2847.50,
  completedTasks: 12,
  streak: 7,
  achievements: [
    { id: 'first_link', name: 'First Link', description: 'Created your first affiliate link', unlocked: true, icon: <Star className="h-5 w-5" /> },
    { id: 'early_bird', name: 'Early Bird', description: 'Generated content before 9 AM', unlocked: true, icon: <Clock className="h-5 w-5" /> },
    { id: 'streak_5', name: '5-Day Streak', description: 'Stayed active for 5 consecutive days', unlocked: true, icon: <Flame className="h-5 w-5" /> },
    { id: 'first_sale', name: 'First Sale', description: 'Made your first affiliate commission', unlocked: false, icon: <DollarSign className="h-5 w-5" /> },
    { id: 'content_master', name: 'Content Master', description: 'Generated 50+ pieces of content', unlocked: false, icon: <Brain className="h-5 w-5" /> },
    { id: 'social_guru', name: 'Social Guru', description: 'Posted on 5 different platforms', unlocked: false, icon: <Users className="h-5 w-5" /> }
  ]
};

// Onboarding tutorial steps
const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Your Affiliate Journey! 🎉',
    description: 'Let\'s get you started with the basics',
    completed: true,
    steps: [
      'Understand the affiliate marketing fundamentals',
      'Learn about commission structures',
      'Set up your profile and goals'
    ]
  },
  {
    id: 'url_management',
    title: 'Master URL Management',
    description: 'Learn to efficiently manage your product URLs',
    completed: true,
    steps: [
      'Save URLs to your queue',
      'Organize by priority and category',
      'Bulk scrape selected products'
    ]
  },
  {
    id: 'content_creation',
    title: 'Content Generation Mastery',
    description: 'Create compelling marketing content',
    completed: false,
    steps: [
      'Generate blog posts and social content',
      'Use advanced content types',
      'Schedule content for optimal timing'
    ]
  },
  {
    id: 'analytics_tracking',
    title: 'Track Your Success',
    description: 'Monitor performance and optimize',
    completed: false,
    steps: [
      'Set up analytics tracking',
      'Monitor click-through rates',
      'Analyze conversion data'
    ]
  },
  {
    id: 'advanced_features',
    title: 'Advanced Affiliate Strategies',
    description: 'Unlock pro-level techniques',
    completed: false,
    steps: [
      'Use price tracking alerts',
      'Implement fraud detection',
      'Master automation workflows'
    ]
  }
];

// Daily challenges
const DAILY_CHALLENGES = [
  {
    id: 'content_creation',
    title: 'Create 3 Social Media Posts',
    description: 'Generate content for Twitter, Instagram, and LinkedIn',
    progress: 2,
    target: 3,
    reward: 50,
    type: 'content',
    completed: false
  },
  {
    id: 'url_collection',
    title: 'Add 10 New Product URLs',
    description: 'Expand your product research pipeline',
    progress: 7,
    target: 10,
    reward: 30,
    type: 'research',
    completed: false
  },
  {
    id: 'performance_check',
    title: 'Review Analytics Dashboard',
    description: 'Check your performance metrics',
    progress: 0,
    target: 1,
    reward: 25,
    type: 'analytics',
    completed: false
  }
];

// Motivational notifications
const MOTIVATIONAL_MESSAGES = [
  { type: 'milestone', message: "🎉 You're on fire! 7-day streak achieved!", priority: 'high' },
  { type: 'encouragement', message: "💪 Just 3 more links to reach your daily goal!", priority: 'medium' },
  { type: 'tip', message: "💡 Pro tip: Schedule content during peak engagement hours (7-9 PM)", priority: 'low' },
  { type: 'achievement', message: "🏆 New achievement unlocked: Early Bird!", priority: 'high' },
  { type: 'progress', message: "📈 Your conversion rate improved by 15% this week!", priority: 'medium' }
];

const SingleUserEngagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [notifications, setNotifications] = useState(MOTIVATIONAL_MESSAGES.slice(0, 3));

  // Calculate progress percentage
  const progressPercentage = Math.round((USER_PROGRESS.xp / USER_PROGRESS.xpToNext) * 100);
  const unlockedAchievements = USER_PROGRESS.achievements.filter(a => a.unlocked).length;

  // Get challenge type icon
  const getChallengeIcon = (type) => {
    switch (type) {
      case 'content': return <Brain className="h-4 w-4" />;
      case 'research': return <Target className="h-4 w-4" />;
      case 'analytics': return <TrendingUp className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  // Mark tutorial as completed
  const completeTutorial = useCallback((tutorialId) => {
    // This would normally update the backend
    console.log(`Completed tutorial: ${tutorialId}`);
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🚀 Your Affiliate Journey
        </h2>
        <p className="text-gray-600">
          Personalized guidance, achievements, and motivation to boost your success
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Level & XP */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full text-white font-bold text-xl mb-2">
                {USER_PROGRESS.level}
              </div>
              <p className="font-medium">Level {USER_PROGRESS.level}</p>
              <p className="text-sm text-gray-600">{USER_PROGRESS.xp} / {USER_PROGRESS.xpToNext} XP</p>
              <Progress value={progressPercentage} className="mt-2" />
            </div>

            {/* Earnings */}
            <div className="text-center">
              <DollarSign className="h-16 w-16 text-green-500 mx-auto mb-2" />
              <p className="font-medium">${USER_PROGRESS.totalEarnings.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Earnings</p>
            </div>

            {/* Streak */}
            <div className="text-center">
              <Flame className="h-16 w-16 text-orange-500 mx-auto mb-2" />
              <p className="font-medium">{USER_PROGRESS.streak} Days</p>
              <p className="text-sm text-gray-600">Active Streak</p>
            </div>

            {/* Achievements */}
            <div className="text-center">
              <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-2" />
              <p className="font-medium">{unlockedAchievements} / {USER_PROGRESS.achievements.length}</p>
              <p className="text-sm text-gray-600">Achievements</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
          { id: 'tutorials', label: 'Tutorials', icon: <BookOpen className="h-4 w-4" /> },
          { id: 'challenges', label: 'Challenges', icon: <Target className="h-4 w-4" /> },
          { id: 'achievements', label: 'Achievements', icon: <Trophy className="h-4 w-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white shadow text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Motivational Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  notification.priority === 'high' ? 'border-l-green-500 bg-green-50' :
                  notification.priority === 'medium' ? 'border-l-blue-500 bg-blue-50' :
                  'border-l-gray-500 bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <p className="text-sm">{notification.message}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => dismissNotification(index)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
              
              {notifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>All caught up! 🎉</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start h-auto p-4" variant="outline">
                <Rocket className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Start Tutorial</p>
                  <p className="text-xs text-gray-600">Continue your learning journey</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button className="w-full justify-start h-auto p-4" variant="outline">
                <Target className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">View Challenges</p>
                  <p className="text-xs text-gray-600">Complete daily tasks for XP</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button className="w-full justify-start h-auto p-4" variant="outline">
                <TrendingUp className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <p className="font-medium">Check Analytics</p>
                  <p className="text-xs text-gray-600">Review your performance</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'tutorials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TUTORIAL_STEPS.map((tutorial) => (
              <Card key={tutorial.id} className={`cursor-pointer transition-all duration-200 ${
                tutorial.completed ? 'border-green-300 bg-green-50' : 'hover:shadow-lg'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {tutorial.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Play className="h-6 w-6 text-purple-600" />
                      )}
                      <div>
                        <h3 className="font-semibold">{tutorial.title}</h3>
                        <p className="text-sm text-gray-600">{tutorial.description}</p>
                      </div>
                    </div>
                    {tutorial.completed && (
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {tutorial.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          tutorial.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {tutorial.completed ? '✓' : index + 1}
                        </div>
                        <span className={tutorial.completed ? 'text-green-700' : 'text-gray-600'}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    variant={tutorial.completed ? 'outline' : 'default'}
                    onClick={() => setSelectedTutorial(tutorial)}
                  >
                    {tutorial.completed ? 'Review' : 'Start Tutorial'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAILY_CHALLENGES.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100">
                        {getChallengeIcon(challenge.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{challenge.title}</h3>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{challenge.progress} / {challenge.target}</span>
                      </div>
                      <Progress value={(challenge.progress / challenge.target) * 100} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Gift className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{challenge.reward} XP</span>
                      </div>
                      
                      {challenge.progress >= challenge.target ? (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Claim
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          Continue
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {USER_PROGRESS.achievements.map((achievement) => (
            <Card key={achievement.id} className={`transition-all duration-200 ${
              achievement.unlocked 
                ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50' 
                : 'border-gray-200 bg-gray-50 opacity-75'
            }`}>
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                    : 'bg-gray-300 text-gray-500'
                }`}>
                  {achievement.icon}
                </div>
                
                <h3 className="font-semibold mb-2">{achievement.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                
                {achievement.unlocked ? (
                  <Badge className="bg-yellow-500 text-white">
                    <Trophy className="h-3 w-3 mr-1" />
                    Unlocked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-500 border-gray-300">
                    Locked
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SingleUserEngagement;