import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Zap,
  BarChart3,
  Filter,
  RefreshCw,
  Eye,
  Star,
  Activity
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ConversionsDetected = () => {
  const [conversions, setConversions] = useState([]);
  const [stats, setStats] = useState({});
  const [realtimeConversions, setRealtimeConversions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ status: 'all', program: 'all' });
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch conversions data
  const fetchConversions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.program) params.append('program', filter.program);
      params.append('limit', '20');
      
      const response = await axios.get(`${API}/conversions/detected?${params.toString()}`);
      setConversions(response.data.conversions || []);
    } catch (error) {
      console.error('Failed to fetch conversions:', error);
    }
  }, [filter]);

  // Fetch conversion statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/conversions/stats?days=30`);
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Failed to fetch conversion stats:', error);
    }
  }, []);

  // Fetch real-time conversions
  const fetchRealtimeConversions = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/conversions/realtime`);
      setRealtimeConversions(response.data.realtime_conversions || []);
    } catch (error) {
      console.error('Failed to fetch realtime conversions:', error);
    }
  }, []);

  // Update conversion status
  const updateConversionStatus = async (conversionId, newStatus) => {
    try {
      await axios.put(`${API}/conversions/${conversionId}/status`, {
        status: newStatus
      });
      
      // Refresh data
      fetchConversions(); 
      fetchStats();
    } catch (error) {
      console.error('Failed to update conversion status:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchConversions(),
        fetchStats(),
        fetchRealtimeConversions()
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [fetchConversions, fetchStats, fetchRealtimeConversions]);

  // Auto-refresh real-time data
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchRealtimeConversions();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, fetchRealtimeConversions]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Conversions Detected
          </h2>
          <p className="text-gray-600">Real-time tracking of affiliate conversions and commissions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchConversions();
              fetchStats();
              fetchRealtimeConversions();
            }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-1" />
            {autoRefresh ? 'Live' : 'Manual'}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Total Conversions</p>
                <p className="text-2xl font-bold">{stats.total_conversions || 0}</p>
              </div>
              <Target className="h-6 w-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue || 0)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Commission Earned</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_commission || 0)}</p>
              </div>
              <Star className="h-6 w-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversion_rate || 0}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity */}
      <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Real-time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {realtimeConversions.length > 0 ? (
            <div className="space-y-3">
              {realtimeConversions.map((conversion, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500 text-white">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{conversion.product_name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {conversion.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(conversion.commission)}</p>
                    <p className="text-xs text-gray-500">{formatDate(conversion.detected_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No recent conversion activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Conversion History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <Select value={filter.status} onValueChange={(value) => setFilter({...filter, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filter by Program</label>
              <Select value={filter.program} onValueChange={(value) => setFilter({...filter, program: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All programs</SelectItem>
                  <SelectItem value="GEARit">GEARit</SelectItem>
                  <SelectItem value="Rakuten">Rakuten</SelectItem>
                  <SelectItem value="HubSpot">HubSpot</SelectItem>
                  <SelectItem value="ShareASale">ShareASale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conversions List */}
          <div className="space-y-4">
            {conversions.map((conversion) => (
              <Card key={conversion.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{conversion.product_name}</h4>
                        <Badge variant="secondary">{conversion.affiliate_program}</Badge>
                        <Badge className={getStatusColor(conversion.status)}>
                          {getStatusIcon(conversion.status)}
                          <span className="ml-1 capitalize">{conversion.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Commission</p>
                          <p className="text-green-600 font-semibold">{formatCurrency(conversion.commission_amount)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Order Value</p>
                          <p>{formatCurrency(conversion.conversion_value)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {conversion.customer_location || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Detected</p>
                          <p className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(conversion.detected_at)}
                          </p>
                        </div>
                      </div>
                      
                      {conversion.referrer_url && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Referred from: <a href={conversion.referrer_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{conversion.referrer_url}</a>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {conversion.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateConversionStatus(conversion.id, 'confirmed')}
                            className="hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateConversionStatus(conversion.id, 'rejected')}
                            className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`#/conversion/${conversion.id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {conversions.length === 0 && !loading && (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No conversions found</p>
                <p className="text-sm text-gray-400">Your affiliate conversions will appear here as they're detected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionsDetected;