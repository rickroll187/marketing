import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Link, 
  Copy, 
  ExternalLink, 
  QrCode, 
  BarChart3, 
  Settings,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  Share2,
  Eye,
  MousePointer,
  Target,
  Scissors,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

// Updated affiliate programs including Rakuten and GEARit
const AFFILIATE_PROGRAMS = [
  {
    id: 'rakuten',
    name: 'Rakuten Advertising',
    baseUrl: 'https://click.linksynergy.com',
    trackingParam: 'id',
    commission: 'Variable by merchant',
    category: 'Network',
    description: 'Access to thousands of merchants through Rakuten network'
  },
  {
    id: 'gearit',
    name: 'GEARit',
    baseUrl: 'https://www.gearit.com',
    trackingParam: 'affiliate',
    commission: '5-8%',
    category: 'Electronics',
    description: 'Premium tech accessories and USB hubs'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    baseUrl: 'https://www.hubspot.com',
    trackingParam: 'ref',
    commission: '30% recurring',
    category: 'Marketing & CRM'
  },
  {
    id: 'elementor',
    name: 'Elementor',
    baseUrl: 'https://elementor.com',
    trackingParam: 'ref',
    commission: '50% first year',
    category: 'Web Development'
  },
  {
    id: 'clickfunnels',
    name: 'ClickFunnels',
    baseUrl: 'https://www.clickfunnels.com',
    trackingParam: 'affiliate',
    commission: '40% recurring',
    category: 'Marketing'
  },
  {
    id: 'semrush',
    name: 'SEMrush',
    baseUrl: 'https://www.semrush.com',
    trackingParam: 'ref',
    commission: '$200 per sale',
    category: 'SEO & Analytics'
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    baseUrl: 'https://convertkit.com',
    trackingParam: 'ref',
    commission: '30% recurring',
    category: 'Email Marketing'
  }
];

const SimplifiedLinkManager = () => {
  const [selectedProgram, setSelectedProgram] = useState('');
  const [productName, setProductName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [customTrackingCode, setCustomTrackingCode] = useState('');
  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [shortCode, setShortCode] = useState('');

  // Generate affiliate link
  const generateAffiliateLink = useCallback(() => {
    if (!selectedProgram || !productName || !productUrl) {
      alert('Please fill in all required fields');
      return;
    }

    const program = AFFILIATE_PROGRAMS.find(p => p.id === selectedProgram);
    if (!program) return;

    // Generate tracking code if not provided
    const trackingCode = customTrackingCode || `${program.id}_${Date.now()}`;
    const campaignTag = campaignName ? `_${campaignName.toLowerCase().replace(/\s+/g, '-')}` : '';
    
    // Create affiliate link (simplified version - in real app this would use actual affiliate URLs)
    const affiliateLink = `${program.baseUrl}?${program.trackingParam}=${trackingCode}${campaignTag}&url=${encodeURIComponent(productUrl)}`;
    
    // Generate short link code
    const shortLinkCode = shortCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    const shortLink = `https://af.ly/${shortLinkCode}`;

    const newLink = {
      id: Date.now(),
      program: program.name,
      productName,
      originalUrl: productUrl,
      affiliateLink,
      shortLink,
      trackingCode,
      campaign: campaignName || 'Default',
      created: new Date().toISOString(),
      clicks: 0,
      conversions: 0,
      earnings: 0
    };

    setGeneratedLinks(prev => [newLink, ...prev]);
    
    // Reset form
    setProductName('');
    setProductUrl('');
    setCampaignName('');
    setCustomTrackingCode('');
    setShortCode('');
  }, [selectedProgram, productName, productUrl, campaignName, customTrackingCode, shortCode]);

  // Copy to clipboard
  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  }, []);

  // Delete link
  const deleteLink = useCallback((linkId) => {
    setGeneratedLinks(prev => prev.filter(link => link.id !== linkId));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🔗 Simplified Link Management
        </h2>
        <p className="text-gray-600">
          Generate and manage affiliate links with custom tracking codes
        </p>
      </div>

      {/* Link Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Generate New Affiliate Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Program Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Affiliate Program *</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a program</option>
                {AFFILIATE_PROGRAMS.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name} - {program.commission}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div>
              <label className="text-sm font-medium mb-2 block">Product Name *</label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., USB-C Hub Pro"
              />
            </div>

            {/* Product URL */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Product URL *</label>
              <Input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://example.com/product-page"
              />
            </div>

            {/* Campaign Name */}
            <div>
              <label className="text-sm font-medium mb-2 block">Campaign Name (Optional)</label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g., Holiday2024"
              />
            </div>

            {/* Custom Tracking Code */}
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Tracking Code (Optional)</label>
              <Input
                value={customTrackingCode}
                onChange={(e) => setCustomTrackingCode(e.target.value)}
                placeholder="Auto-generated if empty"
              />
            </div>

            {/* Short Link Code */}
            <div>
              <label className="text-sm font-medium mb-2 block">Short Link Code (Optional)</label>
              <Input
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                placeholder="e.g., TECH24"
              />
            </div>
          </div>

          <Button onClick={generateAffiliateLink} className="w-full">
            <Link className="h-4 w-4 mr-2" />
            Generate Affiliate Link
          </Button>
        </CardContent>
      </Card>

      {/* Program Information */}
      {selectedProgram && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Program Information</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const program = AFFILIATE_PROGRAMS.find(p => p.id === selectedProgram);
              return program ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Commission Rate</p>
                    <p className="text-lg font-semibold text-green-600">{program.commission}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Category</p>
                    <Badge variant="outline">{program.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Base URL</p>
                    <p className="text-sm text-gray-800 truncate">{program.baseUrl}</p>
                  </div>
                  {program.description && (
                    <div className="md:col-span-3">
                      <p className="text-sm font-medium text-gray-600">Description</p>
                      <p className="text-sm text-gray-700">{program.description}</p>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </CardContent>
        </Card>
      )}

      {/* Generated Links */}
      {generatedLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Generated Links ({generatedLinks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedLinks.map((link) => (
                <div key={link.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{link.productName}</h3>
                      <p className="text-sm text-gray-600">{link.program} • {link.campaign}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.shortLink)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteLink(link.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Short Link</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-white px-2 py-1 rounded border flex-1 truncate">
                          {link.shortLink}
                        </code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(link.shortLink)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-600">Full Affiliate Link</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-white px-2 py-1 rounded border flex-1 truncate">
                          {link.affiliateLink}
                        </code>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(link.affiliateLink)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-blue-600">{link.clicks}</p>
                        <p className="text-xs text-gray-600">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-600">{link.conversions}</p>
                        <p className="text-xs text-gray-600">Conversions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-purple-600">${link.earnings.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">Earnings</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" size="sm" className="h-auto p-3">
              <QrCode className="h-4 w-4 mb-1" />
              <span className="text-xs">Generate QR</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3">
              <BarChart3 className="h-4 w-4 mb-1" />
              <span className="text-xs">Analytics</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3">
              <Share2 className="h-4 w-4 mb-1" />
              <span className="text-xs">Bulk Share</span>
            </Button>
            <Button variant="outline" size="sm" className="h-auto p-3">
              <Settings className="h-4 w-4 mb-1" />
              <span className="text-xs">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedLinkManager;