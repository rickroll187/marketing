import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Zap,
  Repeat,
  Target,
  CreditCard,
  ArrowUpRight,
  Download,
  RefreshCw,
  Banknote
} from 'lucide-react';

// Mock commission data with different types
const COMMISSION_DATA = [
  {
    id: 1,
    program: 'HubSpot',
    type: 'recurring',
    amount: 89.50,
    status: 'confirmed',
    frequency: 'monthly',
    nextPayment: '2024-02-15',
    customer: 'StartupXYZ',
    commission_rate: '30%',
    original_sale: 298.33,
    months_active: 3,
    total_earned: 268.50,
    date: '2024-01-15'
  },
  {
    id: 2,
    program: 'Elementor',
    type: 'per-sale',
    amount: 147.00,
    status: 'confirmed',
    frequency: 'one-time',
    nextPayment: '2024-02-01',
    customer: 'DesignAgency',
    commission_rate: '50%',
    original_sale: 294.00,
    total_earned: 147.00,
    date: '2024-01-20'
  },
  {
    id: 3,
    program: 'ClickFunnels',
    type: 'recurring',
    amount: 67.80,
    status: 'pending',
    frequency: 'monthly',
    nextPayment: '2024-02-10',
    customer: 'MarketingPro',
    commission_rate: '40%',
    original_sale: 169.50,
    months_active: 1,
    total_earned: 67.80,
    date: '2024-01-25'
  },
  {
    id: 4,
    program: 'Semrush',
    type: 'hybrid',
    amount: 210.00,
    status: 'confirmed',
    frequency: 'one-time',
    nextPayment: '2024-02-05',
    customer: 'SEOExpert',
    commission_rate: '$200 + $10/trial',
    original_sale: 'Pro Annual Plan',
    total_earned: 210.00,
    date: '2024-01-18'
  },
  {
    id: 5,
    program: 'ConvertKit',
    type: 'recurring',
    amount: 24.30,
    status: 'confirmed',
    frequency: 'monthly',
    nextPayment: '2024-02-12',
    customer: 'BloggerLife',
    commission_rate: '30%',
    original_sale: 81.00,
    months_active: 2,
    total_earned: 48.60,
    date: '2024-01-12'
  },
  {
    id: 6,
    program: 'Canva',
    type: 'per-sale',
    amount: 36.00,
    status: 'pending',
    frequency: 'one-time',
    nextPayment: '2024-02-08',
    customer: 'CreativeStudio',
    commission_rate: '$36 per Pro',
    original_sale: 'Canva Pro Annual',
    total_earned: 36.00,
    date: '2024-01-28'
  }
];

const CommissionTracker = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const confirmed = COMMISSION_DATA.filter(c => c.status === 'confirmed');
    const pending = COMMISSION_DATA.filter(c => c.status === 'pending');
    const recurring = COMMISSION_DATA.filter(c => c.type === 'recurring');
    
    return {
      totalEarnings: COMMISSION_DATA.reduce((sum, c) => sum + c.amount, 0),
      confirmedEarnings: confirmed.reduce((sum, c) => sum + c.amount, 0),
      pendingEarnings: pending.reduce((sum, c) => sum + c.amount, 0),
      recurringMonthly: recurring.reduce((sum, c) => sum + (c.status === 'confirmed' ? c.amount : 0), 0),
      totalCommissions: COMMISSION_DATA.length,
      avgCommission: COMMISSION_DATA.reduce((sum, c) => sum + c.amount, 0) / COMMISSION_DATA.length
    };
  }, []);

  // Filter commissions based on selected filters
  const filteredCommissions = useMemo(() => {
    return COMMISSION_DATA.filter(commission => {
      const typeMatch = selectedType === 'all' || commission.type === selectedType;
      const statusMatch = selectedStatus === 'all' || commission.status === selectedStatus;
      return typeMatch && statusMatch;
    });
  }, [selectedType, selectedStatus]);

  // Get commission type icon and color
  const getCommissionTypeDisplay = (type) => {
    switch (type) {
      case 'recurring':
        return { icon: <Repeat className="h-4 w-4" />, color: 'bg-green-100 text-green-800', label: 'Recurring' };
      case 'per-sale':
        return { icon: <Target className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800', label: 'Per Sale' };
      case 'hybrid':
        return { icon: <Zap className="h-4 w-4" />, color: 'bg-purple-100 text-purple-800', label: 'Hybrid' };
      default:
        return { icon: <DollarSign className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800', label: 'Unknown' };
    }
  };

  // Export commissions to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Program', 'Type', 'Amount', 'Status', 'Commission Rate', 'Customer', 'Next Payment'];
    const csvData = [
      headers,
      ...filteredCommissions.map(c => [
        c.date,
        c.program,
        c.type,
        `$${c.amount}`,
        c.status,
        c.commission_rate,
        c.customer,
        c.nextPayment || 'N/A'
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commissions-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            💰 Automated Commission Tracking
          </h2>
          <p className="text-gray-600">
            Track all commission types: recurring, per-sale, and hybrid payouts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summaryStats.totalEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${summaryStats.confirmedEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Ready to pay</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${summaryStats.pendingEarnings.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Under review</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Recurring</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${summaryStats.recurringMonthly.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Per month</p>
              </div>
              <Repeat className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & View Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Commission Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                <option value="recurring">Recurring Only</option>
                <option value="per-sale">Per Sale Only</option>
                <option value="hybrid">Hybrid Only</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Commission History ({filteredCommissions.length})</h3>
        
        {filteredCommissions.map(commission => {
          const typeDisplay = getCommissionTypeDisplay(commission.type);
          
          return (
            <Card key={commission.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {commission.program === 'HubSpot' && '🧡'}
                      {commission.program === 'Elementor' && '🎨'}
                      {commission.program === 'ClickFunnels' && '🚀'}
                      {commission.program === 'Semrush' && '📊'}
                      {commission.program === 'ConvertKit' && '📧'}
                      {commission.program === 'Canva' && '🎨'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{commission.program}</h4>
                      <p className="text-sm text-gray-600">Customer: {commission.customer}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${commission.amount.toFixed(2)}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge className={typeDisplay.color}>
                        <span className="flex items-center gap-1">
                          {typeDisplay.icon}
                          {typeDisplay.label}
                        </span>
                      </Badge>
                      <Badge variant={commission.status === 'confirmed' ? 'default' : 'secondary'}>
                        {commission.status === 'confirmed' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {commission.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Commission Rate</p>
                    <p className="font-medium">{commission.commission_rate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Original Sale</p>
                    <p className="font-medium">
                      {typeof commission.original_sale === 'number' 
                        ? `$${commission.original_sale}` 
                        : commission.original_sale}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">
                      {commission.type === 'recurring' ? 'Months Active' : 'Date'}
                    </p>
                    <p className="font-medium">
                      {commission.type === 'recurring' 
                        ? `${commission.months_active} months` 
                        : commission.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Next Payment</p>
                    <p className="font-medium">{commission.nextPayment}</p>
                  </div>
                </div>

                {commission.type === 'recurring' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Repeat className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Recurring Revenue</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Total earned: <span className="font-semibold">${commission.total_earned.toFixed(2)}</span>
                      {commission.months_active && (
                        <span> • Projected annual: <span className="font-semibold">${(commission.amount * 12).toFixed(2)}</span></span>
                      )}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  {commission.type === 'recurring' && (
                    <Button size="sm" variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      Payment Schedule
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Payout Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payout Estimates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Automated Payout Estimates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Next 7 Days</p>
              <p className="text-2xl font-bold text-green-700">${(summaryStats.confirmedEarnings * 0.3).toFixed(2)}</p>
              <p className="text-xs text-green-600">Estimated payout</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">This Month</p>
              <p className="text-2xl font-bold text-blue-700">${summaryStats.recurringMonthly.toFixed(2)}</p>
              <p className="text-xs text-blue-600">Recurring revenue</p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Projected Annual</p>
              <p className="text-2xl font-bold text-purple-700">${(summaryStats.recurringMonthly * 12).toFixed(2)}</p>
              <p className="text-xs text-purple-600">From recurring only</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionTracker;