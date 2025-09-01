import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield,
  AlertTriangle,
  Eye,
  TrendingUp,
  Clock,
  MapPin,
  MousePointer,
  Ban,
  CheckCircle,
  Info,
  Bell,
  Activity,
  Filter,
  Download
} from 'lucide-react';

// Mock fraud detection data
const FRAUD_ALERTS = [
  {
    id: 1,
    type: 'suspicious_clicks',
    severity: 'medium',
    title: 'Unusual Click Pattern Detected',
    description: '50+ clicks from same IP in 1 hour for GEARit USB-C Hub link',
    details: {
      ip: '192.168.1.100',
      location: 'New York, US',
      clicks: 52,
      timespan: '1 hour',
      link: 'gearit-usb-hub-2024',
      pattern: 'Rapid successive clicks'
    },
    timestamp: '2024-01-15T14:30:00Z',
    status: 'active',
    confidence: 85
  },
  {
    id: 2,
    type: 'bot_traffic',
    severity: 'high',
    title: 'Potential Bot Traffic',
    description: 'Non-human click patterns detected on HubSpot affiliate link',
    details: {
      ip: '45.123.456.789',
      location: 'Unknown',
      clicks: 127,
      timespan: '30 minutes',
      link: 'hubspot-marketing-2024',
      pattern: 'Consistent 3-second intervals'
    },
    timestamp: '2024-01-15T13:15:00Z',
    status: 'resolved',
    confidence: 92
  },
  {
    id: 3,
    type: 'click_fraud',
    severity: 'low',
    title: 'Multiple Device Same User',
    description: 'Same user clicked from 5 different devices in 2 hours',
    details: {
      ip: '203.45.67.89',
      location: 'California, US',
      clicks: 12,
      timespan: '2 hours',
      link: 'elementor-pro-2024',
      pattern: 'Cross-device clicking'
    },
    timestamp: '2024-01-15T12:00:00Z',
    status: 'monitoring',
    confidence: 65
  },
  {
    id: 4,
    type: 'geographic_anomaly',
    severity: 'medium',
    title: 'Unusual Geographic Pattern',
    description: 'High traffic spike from region with low conversion history',
    details: {
      ip: 'Multiple IPs',
      location: 'Eastern Europe',
      clicks: 89,
      timespan: '4 hours',
      link: 'multiple-links',
      pattern: 'Geographic clustering'
    },
    timestamp: '2024-01-15T10:45:00Z',
    status: 'investigating',
    confidence: 78
  }
];

const PROTECTION_RULES = [
  {
    id: 'ip_rate_limit',
    name: 'IP Rate Limiting',
    description: 'Block IPs with >20 clicks per hour',
    status: 'active',
    triggers: 156,
    blocked_clicks: 450
  },
  {
    id: 'bot_detection',
    name: 'Bot Pattern Detection',
    description: 'Identify non-human click patterns',
    status: 'active',
    triggers: 23,
    blocked_clicks: 89
  },
  {
    id: 'device_fingerprint',
    name: 'Device Fingerprinting',
    description: 'Track unique device signatures',
    status: 'active',
    triggers: 67,
    blocked_clicks: 201
  },
  {
    id: 'conversion_anomaly',
    name: 'Conversion Anomaly Detection',
    description: 'Flag unusual conversion patterns',
    status: 'monitoring',
    triggers: 12,
    blocked_clicks: 34
  }
];

const FraudDetectionAlerts = () => {
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter alerts based on selected filters
  const filteredAlerts = useMemo(() => {
    return FRAUD_ALERTS.filter(alert => {
      const severityMatch = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const statusMatch = selectedStatus === 'all' || alert.status === selectedStatus;
      return severityMatch && statusMatch;
    });
  }, [selectedSeverity, selectedStatus]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const active = FRAUD_ALERTS.filter(a => a.status === 'active').length;
    const high = FRAUD_ALERTS.filter(a => a.severity === 'high').length;
    const totalBlocked = PROTECTION_RULES.reduce((sum, rule) => sum + rule.blocked_clicks, 0);
    const totalTriggers = PROTECTION_RULES.reduce((sum, rule) => sum + rule.triggers, 0);
    
    return {
      activeAlerts: active,
      highSeverity: high,
      blockedClicks: totalBlocked,
      totalTriggers: totalTriggers
    };
  }, []);

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-800';
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Export fraud report
  const exportReport = () => {
    const csvData = [
      ['Timestamp', 'Type', 'Severity', 'Title', 'IP', 'Location', 'Clicks', 'Status'],
      ...filteredAlerts.map(alert => [
        alert.timestamp,
        alert.type,
        alert.severity,
        alert.title,
        alert.details.ip,
        alert.details.location,
        alert.details.clicks,
        alert.status
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fraud-report-${new Date().toISOString().split('T')[0]}.csv`;
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            🛡️ Fraud Detection & Protection
          </h2>
          <p className="text-gray-600">
            Lightweight fraud detection system to protect your affiliate commissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{summaryStats.activeAlerts}</p>
                <p className="text-xs text-gray-500">Require attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Severity</p>
                <p className="text-2xl font-bold text-orange-600">{summaryStats.highSeverity}</p>
                <p className="text-xs text-gray-500">Critical issues</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blocked Clicks</p>
                <p className="text-2xl font-bold text-green-600">{summaryStats.blockedClicks}</p>
                <p className="text-xs text-gray-500">Fraud prevented</p>
              </div>
              <Ban className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rule Triggers</p>
                <p className="text-2xl font-bold text-blue-600">{summaryStats.totalTriggers}</p>
                <p className="text-xs text-gray-500">Total activations</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alert Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Severity Level</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Severities</option>
                <option value="high">High Only</option>
                <option value="medium">Medium Only</option>
                <option value="low">Low Only</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Alert Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="monitoring">Monitoring</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fraud Alerts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fraud Alerts ({filteredAlerts.length})</h3>
        
        {filteredAlerts.map(alert => (
          <Card key={alert.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <h4 className="font-semibold text-lg">{alert.title}</h4>
                  </div>
                  <p className="text-gray-600 mb-2">{alert.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()} • Confidence: {alert.confidence}%
                  </p>
                </div>
                
                <div className="text-right space-y-2">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(alert.status)}>
                    {alert.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Alert Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                  <p className="text-xs text-gray-500">IP Address</p>
                  <p className="font-medium">{alert.details.ip}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">{alert.details.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Clicks</p>
                  <p className="font-medium">{alert.details.clicks}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pattern</p>
                  <p className="font-medium">{alert.details.pattern}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <Ban className="h-3 w-3 mr-1" />
                  Block IP
                </Button>
                {alert.status === 'active' && (
                  <Button size="sm" variant="outline">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark Resolved
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Protection Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Active Protection Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROTECTION_RULES.map(rule => (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{rule.name}</h4>
                  <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                    {rule.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Triggers</p>
                    <p className="font-semibold">{rule.triggers}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Blocked Clicks</p>
                    <p className="font-semibold text-green-600">{rule.blocked_clicks}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Quick Protection Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="justify-start h-auto p-4" variant="outline">
              <Ban className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Bulk Block IPs</p>
                <p className="text-xs text-gray-600">Block suspicious IP ranges</p>
              </div>
            </Button>
            
            <Button className="justify-start h-auto p-4" variant="outline">
              <TrendingUp className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Adjust Sensitivity</p>
                <p className="text-xs text-gray-600">Fine-tune detection rules</p>
              </div>
            </Button>
            
            <Button className="justify-start h-auto p-4" variant="outline">
              <Activity className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Live Monitoring</p>
                <p className="text-xs text-gray-600">Real-time traffic analysis</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudDetectionAlerts;