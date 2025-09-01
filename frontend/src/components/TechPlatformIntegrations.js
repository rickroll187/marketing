import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Globe,
  BarChart3,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Zap,
  Settings,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Link,
  Code,
  Smartphone,
  Monitor,
  Share2,
  Download
} from 'lucide-react';

const TechPlatformIntegrations = () => {
  const [integrations, setIntegrations] = useState([
    {
      id: 'wordpress',
      name: 'WordPress',
      icon: <Wordpress className="h-8 w-8" />,
      status: 'disconnected',
      description: 'Auto-inject affiliate links in posts and pages',
      features: ['Elementor integration', 'Auto-link insertion', 'Performance tracking'],
      setupSteps: [
        'Install WP affiliate plugin',
        'Add API credentials',
        'Configure auto-linking rules'
      ]
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      icon: <BarChart3 className="h-8 w-8" />,
      status: 'connected',
      description: 'Track affiliate link performance and conversions',
      features: ['Conversion tracking', 'Revenue attribution', 'Custom events'],
      setupSteps: [
        'Connect GA4 property',
        'Set up conversion goals',
        'Configure UTM parameters'
      ]
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: <Twitter className="h-8 w-8" />,
      status: 'disconnected',
      description: 'One-click tweet generation with affiliate links',
      features: ['Auto-shortened URLs', 'Engagement tracking', 'Bulk scheduling'],
      setupSteps: [
        'Connect Twitter API',
        'Set up link shortening',
        'Configure tweet templates'
      ]
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="h-8 w-8" />,
      status: 'disconnected',
      description: 'Professional content sharing for B2B tech products',
      features: ['LinkedIn posts', 'Company page integration', 'Lead tracking'],
      setupSteps: [
        'LinkedIn API setup',
        'Company page connection',
        'Content templates setup'
      ]
    }
  ]);

  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [generatedContent, setGeneratedContent] = useState('');

  // Mock platform connection
  const handleConnect = useCallback((platformId) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === platformId 
          ? { ...integration, status: 'connected' }
          : integration
      )
    );
  }, []);

  // Generate social media content for affiliate links
  const generateSocialContent = useCallback((platform, productName, link) => {
    const templates = {
      twitter: `🚀 Just discovered ${productName}! Perfect for tech professionals looking to level up their workflow. Check it out: ${link} #TechTools #Productivity #SaaS`,
      linkedin: `I've been testing ${productName} and it's been a game-changer for my workflow. The features are impressive and it's perfect for professionals in the tech industry. Highly recommend checking it out: ${link}`,
      facebook: `Hey everyone! 👋 I wanted to share this amazing tool I've been using: ${productName}. It's really helped streamline my work process. If you're in tech or looking for productivity tools, definitely worth a look: ${link}`,
      instagram: `💡 Tool spotlight: ${productName}\n\nThis has been such a valuable addition to my tech stack. Perfect for anyone looking to optimize their workflow.\n\nLink in bio! 🔗\n\n#TechTools #Productivity #SaaS #DigitalNomad #TechReview`
    };
    
    return templates[platform] || templates.twitter;
  }, []);

  // One-click link generation for social platforms
  const handleGenerateSocialLink = useCallback((platform, product = 'Your Product', affiliateLink = 'your-affiliate-link.com') => {
    const content = generateSocialContent(platform, product, affiliateLink);
    setGeneratedContent(content);
    setSelectedPlatform(platform);
  }, [generateSocialContent]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text.substring(0, 50) + '...');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // WordPress plugin code generator
  const generateWordPressCode = useCallback(() => {
    return `<?php
// Affiliate Marketing Auto-Link Plugin
function auto_affiliate_links($content) {
    $affiliate_links = array(
        'elementor.com' => 'https://elementor.com/pro/?ref=YOUR_ID',
        'hubspot.com' => 'https://hubspot.com/?ref=YOUR_ID',
        'gearit.com' => 'https://gearit.com/products/?ref=YOUR_ID'
    );
    
    foreach ($affiliate_links as $domain => $affiliate_url) {
        $pattern = '/href="[^"]*' . preg_quote($domain, '/') . '[^"]*"/';
        $replacement = 'href="' . $affiliate_url . '" rel="sponsored nofollow"';
        $content = preg_replace($pattern, $replacement, $content);
    }
    
    return $content;
}
add_filter('the_content', 'auto_affiliate_links');
?>`;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ⚡ Tech Platform Integrations
        </h2>
        <p className="text-gray-600">
          Connect with WordPress, social media, and analytics platforms for streamlined affiliate marketing
        </p>
      </div>

      {/* Platform Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map(integration => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-indigo-600">
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                  {integration.status === 'connected' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Features */}
              <div>
                <h4 className="text-sm font-medium mb-2">Features:</h4>
                <div className="space-y-1">
                  {integration.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Setup Steps */}
              <div>
                <h4 className="text-sm font-medium mb-2">Setup Steps:</h4>
                <div className="space-y-1">
                  {integration.setupSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => handleConnect(integration.id)}
                disabled={integration.status === 'connected'}
                className="w-full"
                variant={integration.status === 'connected' ? 'outline' : 'default'}
              >
                {integration.status === 'connected' ? (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* One-Click Social Media Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            One-Click Social Media Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => handleGenerateSocialLink('twitter', 'GEARit USB-C Hub', 'https://bit.ly/gearit-hub')}
              variant="outline"
              className="h-16 flex-col"
            >
              <Twitter className="h-6 w-6 mb-1" />
              Twitter/X
            </Button>
            
            <Button 
              onClick={() => handleGenerateSocialLink('linkedin', 'GEARit USB-C Hub', 'https://bit.ly/gearit-hub')}
              variant="outline"
              className="h-16 flex-col"
            >
              <Linkedin className="h-6 w-6 mb-1" />
              LinkedIn
            </Button>
            
            <Button 
              onClick={() => handleGenerateSocialLink('facebook', 'GEARit USB-C Hub', 'https://bit.ly/gearit-hub')}
              variant="outline"
              className="h-16 flex-col"
            >
              <Facebook className="h-6 w-6 mb-1" />
              Facebook
            </Button>
            
            <Button 
              onClick={() => handleGenerateSocialLink('instagram', 'GEARit USB-C Hub', 'https://bit.ly/gearit-hub')}
              variant="outline"
              className="h-16 flex-col"
            >
              <Instagram className="h-6 w-6 mb-1" />
              Instagram
            </Button>
          </div>
          
          {generatedContent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium flex items-center gap-2">
                  {selectedPlatform === 'twitter' && <Twitter className="h-4 w-4" />}
                  {selectedPlatform === 'linkedin' && <Linkedin className="h-4 w-4" />}
                  {selectedPlatform === 'facebook' && <Facebook className="h-4 w-4" />}
                  {selectedPlatform === 'instagram' && <Instagram className="h-4 w-4" />}
                  Generated {selectedPlatform} Content:
                </h4>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(generatedContent)}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <textarea 
                value={generatedContent} 
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="w-full p-2 border rounded text-sm"
                rows={4}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* WordPress Integration Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            WordPress Auto-Affiliate Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Copy this PHP code to your WordPress theme's functions.php file to automatically convert product links to affiliate links:
          </p>
          
          <div className="relative">
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{generateWordPressCode()}</code>
            </pre>
            <Button 
              size="sm" 
              variant="outline"
              className="absolute top-2 right-2 bg-white/90"
              onClick={() => copyToClipboard(generateWordPressCode())}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy Code
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">✅ What it does:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Auto-converts product links to affiliate links</li>
                <li>• Adds proper rel="sponsored nofollow" attributes</li>
                <li>• Works with Elementor and other page builders</li>
              </ul>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">🎯 Perfect for:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• GEARit product reviews</li>
                <li>• Tech blog monetization</li>
                <li>• Automated affiliate link insertion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile & Desktop Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              iOS Shortcut for Link Generation
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Android Share Intent Setup
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Mobile Dashboard PWA
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Desktop Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Browser Extension
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Code className="h-4 w-4 mr-2" />
              API Documentation
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Zapier Integration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechPlatformIntegrations;