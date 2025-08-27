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

// Predefined affiliate programs for quick link generation
const AFFILIATE_PROGRAMS = [
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
    category: 'Marketing & Sales'
  },
  {
    id: 'canva',
    name: 'Canva',
    baseUrl: 'https://www.canva.com',
    trackingParam: 'utm_source',
    commission: '$36 per signup',
    category: 'Design & Creative'
  },
  {
    id: 'semrush',
    name: 'Semrush',
    baseUrl: 'https://www.semrush.com',
    trackingParam: 'ref',
    commission: '$200 + $10/trial',
    category: 'SEO & Analytics'
  }
];

const SimplifiedLinkManager = () => {
  const [links, setLinks] = useState([
    {
      id: 1,
      title: 'HubSpot Marketing Hub',
      originalUrl: 'https://www.hubspot.com/products/marketing',
      shortUrl: 'https://bit.ly/hubspot-marketing-pro',
      trackingCode: 'HUB-MKT-001',
      program: 'HubSpot',
      clicks: 89,
      conversions: 4,
      earnings: '$156.00',
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      title: 'Elementor Pro Website Builder',
      originalUrl: 'https://elementor.com/pro/',
      shortUrl: 'https://bit.ly/elementor-pro-deal',
      trackingCode: 'ELE-PRO-002',
      program: 'Elementor',
      clicks: 67,
      conversions: 3,
      earnings: '$134.50',
      status: 'active',
      createdAt: '2024-01-12'
    }
  ]);

  const [newLink, setNewLink] = useState({
    title: '',
    originalUrl: '',
    program: '',
    trackingCode: ''
  });

  const [isCreating, setIsCreating] = useState(false);

  // Generate tracking code
  const generateTrackingCode = useCallback((program) => {
    const prefix = program.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }, []);

  // Generate short URL (in production, this would call a URL shortening service)
  const generateShortUrl = useCallback((originalUrl, trackingCode) => {
    const domain = 'https://bit.ly/';
    const shortCode = trackingCode.toLowerCase().replace('-', '');
    return `${domain}${shortCode}`;
  }, []);

  // Create new affiliate link
  const handleCreateLink = useCallback(async () => {
    if (!newLink.title || !newLink.originalUrl || !newLink.program) return;

    setIsCreating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const trackingCode = newLink.trackingCode || generateTrackingCode(newLink.program);
    const shortUrl = generateShortUrl(newLink.originalUrl, trackingCode);

    const link = {
      id: Date.now(),
      title: newLink.title,
      originalUrl: newLink.originalUrl,
      shortUrl: shortUrl,
      trackingCode: trackingCode,
      program: newLink.program,
      clicks: 0,
      conversions: 0,
      earnings: '$0.00',
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLinks(prev => [link, ...prev]);
    setNewLink({ title: '', originalUrl: '', program: '', trackingCode: '' });
    setIsCreating(false);
  }, [newLink, generateTrackingCode, generateShortUrl]);

  // Copy link to clipboard
  const copyToClipboard = useCallback(async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      // In a real app, you'd show a toast notification here
      console.log(`${type} copied to clipboard: ${text}`);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  // Generate social media sharing links
  const generateSocialLinks = useCallback((link) => {
    const encodedUrl = encodeURIComponent(link.shortUrl);
    const encodedTitle = encodeURIComponent(link.title);
    
    return {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=Check this out: ${link.shortUrl}`
    };
  }, []);

  // Delete link
  const handleDeleteLink = useCallback((linkId) => {
    setLinks(prev => prev.filter(link => link.id !== linkId));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🔗 Simplified Link Management
        </h2>
        <p className="text-gray-600">
          Generate, track, and manage your affiliate links with custom tracking codes
        </p>
      </div>

      {/* Quick Link Generator */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Link Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Link Title</label>
              <Input
                placeholder="e.g., HubSpot Marketing Hub"
                value={newLink.title}
                onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Affiliate Program</label>
              <select
                value={newLink.program}
                onChange={(e) => setNewLink(prev => ({ ...prev, program: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select program</option>
                {AFFILIATE_PROGRAMS.map(program => (
                  <option key={program.id} value={program.name}>
                    {program.name} ({program.commission})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Original URL</label>
            <Input
              placeholder="https://www.example.com/product"
              value={newLink.originalUrl}
              onChange={(e) => setNewLink(prev => ({ ...prev, originalUrl: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Tracking Code (Optional)</label>
              <Input
                placeholder="Auto-generated if empty"
                value={newLink.trackingCode}
                onChange={(e) => setNewLink(prev => ({ ...prev, trackingCode: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCreateLink}
                disabled={isCreating || !newLink.title || !newLink.originalUrl || !newLink.program}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isCreating ? (
                  <>
                    <Scissors className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Generate Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Your Affiliate Links ({links.length})</h3>
          <Badge variant="outline">{links.filter(l => l.status === 'active').length} Active</Badge>
        </div>

        {links.map(link => {
          const socialLinks = generateSocialLinks(link);
          
          return (
            <Card key={link.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{link.title}</h4>
                      <p className="text-sm text-gray-600">{link.program} • Created {link.createdAt}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={link.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {link.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteLink(link.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* URLs */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">SHORT URL:</span>
                      <code className="text-sm bg-blue-50 px-2 py-1 rounded text-blue-700 flex-1">
                        {link.shortUrl}
                      </code>
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.shortUrl, 'Short URL')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">TRACKING:</span>
                      <code className="text-sm bg-gray-50 px-2 py-1 rounded text-gray-700">
                        {link.trackingCode}
                      </code>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-4 py-3 border-y">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <MousePointer className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-gray-600">Clicks</span>
                      </div>
                      <p className="text-lg font-semibold">{link.clicks}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Target className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-gray-600">Conversions</span>
                      </div>
                      <p className="text-lg font-semibold">{link.conversions}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BarChart3 className="h-3 w-3 text-purple-500" />
                        <span className="text-xs text-gray-600">Earnings</span>
                      </div>
                      <p className="text-lg font-semibold text-green-600">{link.earnings}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {/* Social Sharing */}
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => window.open(socialLinks.twitter, '_blank')}>
                        <Twitter className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(socialLinks.linkedin, '_blank')}>
                        <Linkedin className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(socialLinks.facebook, '_blank')}>
                        <Facebook className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(socialLinks.email, '_blank')}>
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Quick Actions */}
                    <Button size="sm" variant="outline" onClick={() => window.open(link.shortUrl, '_blank')}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Test Link
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <QrCode className="h-3 w-3 mr-1" />
                      QR Code
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pre-built Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Pre-built Promotional Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <h4 className="font-semibold mb-2">📧 Email Template</h4>
              <p className="text-sm text-gray-600 mb-3">
                Professional email template for promoting tech/SaaS products
              </p>
              <Button size="sm" variant="outline">
                <Copy className="h-3 w-3 mr-1" />
                Copy Template
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
              <h4 className="font-semibold mb-2">🎨 Social Media Banner</h4>
              <p className="text-sm text-gray-600 mb-3">
                Eye-catching banner templates for social media promotion
              </p>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimplifiedLinkManager;