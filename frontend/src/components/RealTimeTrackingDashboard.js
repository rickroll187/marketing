import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  MousePointer, 
  DollarSign, 
  Target, 
  Calendar,
  Download,
  Eye,
  ExternalLink,
  Zap,
  Clock,
  Award,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock real-time data (in production this would come from your tracking system)
const generateMockData = () => {
  const now = new Date();
  const today = now.toDateString();
  
  return {
    todayStats: {
      clicks: Math.floor(Math.random() * 150) + 50,
      conversions: Math.floor(Math.random() * 8) + 2,
      earnings: (Math.random() * 200 + 50).toFixed(2),
      conversionRate: ((Math.random() * 5) + 2).toFixed(1)
    },
    realtimeActivity: [
      { time: '2 min ago', event: 'Click', program: 'HubSpot', source: 'Twitter', amount: null },
      { time: '5 min ago', event: 'Conversion', program: 'Elementor', source: 'Blog Post', amount: '$89.50' },
      { time: '8 min ago', event: 'Click', program: 'ClickFunnels', source: 'Email', amount: null },
      { time: '12 min ago', event: 'Click', program: 'Canva', source: 'LinkedIn', amount: null },
      { time: '15 min ago', event: 'Conversion', program: 'ConvertKit', source: 'YouTube', amount: '$24.30' }
    ],
    topPerformingLinks: [
      {
        id: 1,
        program: 'HubSpot',
        link: 'hubspot.com/marketing-automation',
        clicks: 89,
        conversions: 4,
        earnings: '$156.00',
        conversionRate: 4.5,
        trend: 'up'
      },
      {
        id: 2,
        program: 'Elementor', 
        link: 'elementor.com/pro',
        clicks: 67,
        conversions: 3,
        earnings: '$134.50',
        conversionRate: 4.1,
        trend: 'up'
      },
      {
        id: 3,
        program: 'ClickFunnels',
        link: 'clickfunnels.com/free-trial',
        clicks: 45,
        conversions: 1,
        earnings: '$97.00',
        conversionRate: 2.2,
        trend: 'down'
      },
      {
        id: 4,
        program: 'Semrush',
        link: 'semrush.com/seo-toolkit',
        clicks: 112,
        conversions: 2,
        earnings: '$410.00',
        conversionRate: 1.8,
        trend: 'up'
      }
    ],
    weeklyData: [
      { day: 'Mon', clicks: 45, conversions: 2, earnings: 67.50 },
      { day: 'Tue', clicks: 52, conversions: 3, earnings: 89.20 },
      { day: 'Wed', clicks: 38, conversions: 1, earnings: 34.80 },
      { day: 'Thu', clicks: 71, conversions: 4, earnings: 156.90 },
      { day: 'Fri', clicks: 63, conversions: 3, earnings: 123.40 },
      { day: 'Sat', clicks: 89, conversions: 5, earnings: 234.70 },
      { day: 'Sun', clicks: 76, conversions: 4, earnings: 198.50 }
    ]
  };
};

const RealTimeTrackingDashboard = () => {
  const [data, setData] = useState(generateMockData());
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setData(generateMockData());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const exportToCSV = () => {
    const csvData = [
      ['Program', 'Clicks', 'Conversions', 'Earnings', 'Conversion Rate'],
      ...data.topPerformingLinks.map(link => [
        link.program,
        link.clicks,
        link.conversions,
        link.earnings,
        `${link.conversionRate}%`
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affiliate-performance-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📊 Real-Time Tracking Dashboard
          </h2>
          <p className="text-gray-600">
            Monitor your affiliate performance in real-time with actionable insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsLive(!isLive)}
            variant={isLive ? "default" : "outline"}
            className={isLive ? "bg-green-500 hover:bg-green-600" : ""}
          >
            <Zap className="h-4 w-4 mr-2" />
            {isLive ? 'Live' : 'Paused'}
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold">{data.todayStats.clicks}</p>
                <p className="text-xs text-green-600">Today</p>
              </div>
              <MousePointer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-2xl font-bold">{data.todayStats.conversions}</p>
                <p className="text-xs text-green-600">Today</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Earnings</p>
                <p className="text-2xl font-bold">${data.todayStats.earnings}</p>
                <p className="text-xs text-green-600">Today</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold">{data.todayStats.conversionRate}%</p>
                <p className="text-xs text-green-600">Today</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-Time Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Real-Time Activity
              {isLive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.realtimeActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.event === 'Conversion' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.event} • {activity.program}
                      </p>
                      <p className="text-xs text-gray-600">
                        from {activity.source}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <p className="text-sm font-semibold text-green-600">{activity.amount}</p>
                    )}
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Performing Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPerformingLinks.map((link) => (
                <div key={link.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-sm">{link.program}</h4>
                      <p className="text-xs text-gray-600 truncate max-w-[200px]">
                        {link.link}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {link.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={link.trend === 'up' ? 'default' : 'secondary'}>
                        {link.conversionRate}%
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold">{link.clicks}</p>
                      <p className="text-xs text-gray-600">Clicks</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{link.conversions}</p>
                      <p className="text-xs text-gray-600">Conversions</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">{link.earnings}</p>
                      <p className="text-xs text-gray-600">Earnings</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {data.weeklyData.map((day) => (
              <div key={day.day} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600">{day.day}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Clicks</p>
                  <p className="text-lg font-semibold">{day.clicks}</p>
                  <p className="text-xs text-gray-500">Conv</p>
                  <p className="text-sm font-medium text-green-600">{day.conversions}</p>
                  <p className="text-xs text-gray-500">Earnings</p>
                  <p className="text-sm font-semibold text-purple-600">${day.earnings}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="justify-start h-auto p-4" variant="outline">
              <ExternalLink className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Generate New Link</p>
                <p className="text-xs text-gray-600">Create tracked affiliate links</p>
              </div>
            </Button>
            
            <Button className="justify-start h-auto p-4" variant="outline">
              <TrendingUp className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">View Analytics</p>
                <p className="text-xs text-gray-600">Detailed performance analysis</p>
              </div>
            </Button>
            
            <Button className="justify-start h-auto p-4" variant="outline">
              <Clock className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Schedule Content</p>
                <p className="text-xs text-gray-600">Plan your promotion strategy</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeTrackingDashboard;