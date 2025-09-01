import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Gift,
  Lightbulb,
  Rocket,
  Award,
  Calendar,
  DollarSign,
  Users,
  MousePointer,
  Eye,
  PlayCircle,
  X
} from 'lucide-react';

// Onboarding steps
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Your Affiliate Marketing Hub! 🎉',
    description: 'Let\'s get you set up for success in the tech/SaaS affiliate space',
    icon: <Rocket className="h-6 w-6" />,
    completed: false,
    estimatedTime: '2 min',
    actions: ['Take a quick tour', 'Skip to dashboard']
  },
  {
    id: 'programs',
    title: 'Discover High-Commission Programs',
    description: 'Explore 15+ curated tech/SaaS programs including your approved GEARit partnership',
    icon: <Star className="h-6 w-6" />,
    completed: false,
    estimatedTime: '5 min',
    actions: ['Browse Programs', 'Apply to 3 programs']
  },
  {
    id: 'links',
    title: 'Create Your First Affiliate Link',
    description: 'Generate trackable links for your GEARit products and start earning',
    icon: <Target className="h-6 w-6" />,
    completed: false,
    estimatedTime: '3 min',
    actions: ['Generate link', 'Test tracking']
  },
  {
    id: 'content',
    title: 'Share on Social Media',
    description: 'Use our one-click tools to share on Twitter, LinkedIn, and other platforms',
    icon: <TrendingUp className="h-6 w-6" />,
    completed: false,
    estimatedTime: '5 min',
    actions: ['Create Twitter post', 'Share on LinkedIn']
  },
  {
    id: 'tracking',
    title: 'Monitor Your Performance',
    description: 'Set up real-time tracking and commission monitoring',
    icon: <Trophy className="h-6 w-6" />,
    completed: false,
    estimatedTime: '2 min',
    actions: ['View dashboard', 'Set up alerts']
  }
];

// Achievement system
const ACHIEVEMENTS = [
  {
    id: 'first_link',
    title: 'Link Creator',
    description: 'Created your first affiliate link',
    icon: '🔗',
    unlocked: true,
    reward: '+10 XP'
  },
  {
    id: 'first_click',
    title: 'Traffic Generator',
    description: 'Received your first affiliate click',
    icon: '👆',
    unlocked: false,
    reward: '+25 XP'
  },
  {
    id: 'first_conversion',
    title: 'Commission Earner',
    description: 'Earned your first commission',
    icon: '💰',
    unlocked: false,
    reward: '+100 XP'
  },
  {
    id: 'social_sharer',
    title: 'Social Influencer',
    description: 'Shared links on 3 social platforms',
    icon: '📱',
    unlocked: false,
    reward: '+50 XP'
  },
  {
    id: 'program_collector',
    title: 'Program Collector',
    description: 'Joined 5 affiliate programs',
    icon: '⭐',
    unlocked: false,
    reward: '+75 XP'
  }
];

// Motivational tips for tech/SaaS promotion
const PROMOTIONAL_TIPS = [
  {
    category: 'Content Strategy',
    tip: 'Focus on problem-solving: Show how tech tools solve specific business problems your audience faces.',
    icon: '💡'
  },
  {
    category: 'Platform Choice',
    tip: 'LinkedIn performs best for B2B SaaS products. Twitter/X works great for developer tools.',
    icon: '📊'
  },
  {
    category: 'Trust Building',
    tip: 'Share your actual experience with the tools. Authentic reviews convert 3x better than generic promotions.',
    icon: '🤝'
  },
  {
    category: 'Timing',
    tip: 'Promote productivity tools on Monday mornings when people are planning their week.',
    icon: '⏰'
  },
  {
    category: 'GEARit Strategy',
    tip: 'Electronics accessories work great with tech setup posts and "desk setup" content.',
    icon: '⚡'
  }
];

const UserEngagement = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingSteps, setOnboardingSteps] = useState(ONBOARDING_STEPS);
  const [weeklyEarnings] = useState(127.50); // Mock data
  const [monthlyGrowth] = useState(23.4); // Mock data
  const [currentTip, setCurrentTip] = useState(0);

  // Rotate promotional tips every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % PROMOTIONAL_TIPS.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Complete onboarding step
  const completeStep = (stepId) => {
    setOnboardingSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  // Skip onboarding
  const skipOnboarding = () => {
    setShowOnboarding(false);
  };

  // Continue to next step
  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      completeStep(onboardingSteps[currentStep].id);
      setCurrentStep(prev => prev + 1);
    } else {
      setShowOnboarding(false);
    }
  };

  // Calculate completion percentage
  const completionPercentage = (onboardingSteps.filter(step => step.completed).length / onboardingSteps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🚀 Your Affiliate Success Journey
        </h2>
        <p className="text-gray-600">
          Personalized guidance and motivation for tech/SaaS affiliate marketing success
        </p>
      </div>

      {/* Motivational Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week's Earnings</p>
                <p className="text-2xl font-bold text-green-600">${weeklyEarnings.toFixed(2)}</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Great progress! 🎉
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Growth</p>
                <p className="text-2xl font-bold text-blue-600">+{monthlyGrowth}%</p>
                <p className="text-xs text-blue-500 flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  You're trending up! 📈
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{completionPercentage.toFixed(0)}%</p>
                <p className="text-xs text-purple-500 flex items-center gap-1">
                  <Rocket className="h-3 w-3" />
                  Almost there! 💪
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Progress */}
      {showOnboarding && (
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Get Started Guide ({completionPercentage.toFixed(0)}% Complete)
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={skipOnboarding}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>

            {/* Current step */}
            {currentStep < onboardingSteps.length && (
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex items-start gap-4">
                  <div className="text-purple-600">
                    {onboardingSteps[currentStep].icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{onboardingSteps[currentStep].title}</h3>
                    <p className="text-gray-600 mb-3">{onboardingSteps[currentStep].description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {onboardingSteps[currentStep].estimatedTime}
                      </Badge>
                      <Badge variant="outline">
                        Step {currentStep + 1} of {onboardingSteps.length}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={nextStep}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        {onboardingSteps[currentStep].actions[0]}
                      </Button>
                      <Button variant="outline" onClick={nextStep}>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* All steps overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {onboardingSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`p-2 rounded text-center text-xs ${
                    step.completed 
                      ? 'bg-green-100 text-green-800' 
                      : index === currentStep 
                        ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    {step.completed ? <CheckCircle className="h-4 w-4" /> : step.icon}
                  </div>
                  <p className="font-medium">{step.title.split(' ').slice(0, 2).join(' ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map(achievement => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.unlocked 
                    ? 'border-yellow-300 bg-yellow-50' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                    {achievement.unlocked ? 'Unlocked!' : 'Locked'}
                  </Badge>
                  {achievement.unlocked && (
                    <p className="text-xs text-green-600 mt-1">{achievement.reward}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Tip */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            💡 Pro Tip for Tech/SaaS Marketing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="text-4xl">{PROMOTIONAL_TIPS[currentTip].icon}</div>
            <div>
              <Badge className="mb-2">{PROMOTIONAL_TIPS[currentTip].category}</Badge>
              <p className="text-gray-700">{PROMOTIONAL_TIPS[currentTip].tip}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions for Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="justify-start h-auto p-4" variant="outline">
              <Target className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Create GEARit Content</p>
                <p className="text-xs text-gray-600">Generate social posts for your electronics</p>
              </div>
            </Button>
            
            <Button className="justify-start h-auto p-4" variant="outline">
              <TrendingUp className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Check Performance</p>
                <p className="text-xs text-gray-600">Review your latest click and earnings data</p>
              </div>
            </Button>
            
            <Button className="justify-start h-auto p-4" variant="outline">
              <Star className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Apply to New Program</p>
                <p className="text-xs text-gray-600">Expand with HubSpot or Elementor</p>
              </div>
            </Button>
            
            <Button className="justify-start h-auto p-4" variant="outline">
              <MousePointer className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Generate New Link</p>
                <p className="text-xs text-gray-600">Create trackable links for promotion</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Messages */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="text-center space-y-2">
            <div className="text-4xl">🎯</div>
            <h3 className="text-xl font-semibold text-green-800">
              You're on track for success!
            </h3>
            <p className="text-green-700">
              Your GEARit partnership is just the beginning. Keep creating content, 
              engaging with your audience, and applying to more programs. Every click brings you closer to your goals!
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">1</p>
                <p className="text-xs text-green-600">Program Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">14</p>
                <p className="text-xs text-green-600">More to Explore</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">∞</p>
                <p className="text-xs text-green-600">Earning Potential</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEngagement;