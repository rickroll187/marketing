import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink, DollarSign, Clock, Users, Zap, Star } from 'lucide-react';

// Comprehensive database of FREE tech/SaaS affiliate programs
const TECH_SAAS_PROGRAMS = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'Marketing & CRM',
    commission: '30% recurring',
    cookieDuration: '90 days',
    signupUrl: 'https://www.hubspot.com/partners/affiliates',
    description: 'All-in-one marketing, sales, and service platform',
    payoutType: 'recurring',
    minPayout: '$50',
    difficulty: 'intermediate',
    features: ['Free tier available', 'High-value customers', 'Long cookie duration']
  },
  {
    id: 'elementor',
    name: 'Elementor',
    category: 'Web Development',
    commission: '50% first year',
    cookieDuration: '365 days',
    signupUrl: 'https://elementor.com/partners/',
    description: 'WordPress website builder and design platform',
    payoutType: 'per-sale',
    minPayout: '$100',
    difficulty: 'beginner',
    features: ['1-year cookie', 'Popular WordPress tool', 'High conversion rates']
  },
  {
    id: 'clickfunnels',
    name: 'ClickFunnels',
    category: 'Marketing & Sales',
    commission: '40% recurring',
    cookieDuration: '30 days',
    signupUrl: 'https://www.clickfunnels.com/affiliates',
    description: 'Sales funnel and landing page builder',
    payoutType: 'recurring',
    minPayout: '$100',
    difficulty: 'intermediate',
    features: ['High-ticket sales', 'Recurring commissions', 'Marketing training']
  },
  {
    id: 'semrush',
    name: 'Semrush',
    category: 'SEO & Analytics',
    commission: '$200 per sale + $10 per trial',
    cookieDuration: '120 days',
    signupUrl: 'https://www.semrush.com/partner/',
    description: 'SEO and digital marketing toolkit',
    payoutType: 'hybrid',
    minPayout: '$50',
    difficulty: 'intermediate',
    features: ['High commission per sale', 'Trial bonuses', 'SEO niche leader']
  },
  {
    id: 'canva',
    name: 'Canva',
    category: 'Design & Creative',
    commission: '$36 per Pro signup',
    cookieDuration: '30 days',
    signupUrl: 'https://www.canva.com/affiliates/',
    description: 'Online graphic design and visual content creation',
    payoutType: 'per-sale',
    minPayout: '$25',
    difficulty: 'beginner',
    features: ['Popular design tool', 'Easy to promote', 'Broad appeal']
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    category: 'Email Marketing',
    commission: '30% recurring',
    cookieDuration: '30 days',
    signupUrl: 'https://convertkit.com/partners',
    description: 'Email marketing platform for creators',
    payoutType: 'recurring',
    minPayout: '$25',
    difficulty: 'beginner',
    features: ['Creator-focused', 'Recurring revenue', 'Strong support']
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'Email Marketing',
    commission: '$120 per signup',
    cookieDuration: '30 days',
    signupUrl: 'https://mailchimp.com/partners/',
    description: 'Email marketing and automation platform',
    payoutType: 'per-sale',
    minPayout: '$25',
    difficulty: 'beginner',
    features: ['Household name', 'Easy signup', 'Good conversion']
  },
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'E-commerce',
    commission: '$58 avg per referral',
    cookieDuration: '30 days',
    signupUrl: 'https://www.shopify.com/partners',
    description: 'E-commerce platform and website builder',
    payoutType: 'per-sale',
    minPayout: '$25',
    difficulty: 'beginner',
    features: ['E-commerce leader', 'High demand', 'Multiple revenue streams']
  },
  {
    id: 'grammarly',
    name: 'Grammarly',
    category: 'Productivity',
    commission: '$20 per Premium signup',
    cookieDuration: '90 days',
    signupUrl: 'https://www.grammarly.com/affiliates',
    description: 'AI-powered writing and grammar checker',
    payoutType: 'per-sale',
    minPayout: '$50',
    difficulty: 'beginner',
    features: ['Broad appeal', 'Easy to use', 'Long cookie duration']
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'Productivity',
    commission: '$10 per paid user',
    cookieDuration: '90 days',
    signupUrl: 'https://www.notion.so/affiliates',
    description: 'All-in-one workspace for notes, docs, and collaboration',
    payoutType: 'per-sale',
    minPayout: '$25',
    difficulty: 'beginner',
    features: ['Trending productivity tool', 'Strong community', 'Growing market']
  },
  {
    id: 'bluehost',
    name: 'Bluehost',
    category: 'Web Hosting',
    commission: '$65 per signup',
    cookieDuration: '45 days',
    signupUrl: 'https://www.bluehost.com/affiliates',
    description: 'Web hosting and WordPress services',
    payoutType: 'per-sale',
    minPayout: '$100',
    difficulty: 'beginner',
    features: ['WordPress recommended', 'High commission', 'Reliable payouts']
  },
  {
    id: 'hostinger',
    name: 'Hostinger',
    category: 'Web Hosting',
    commission: '60% commission',
    cookieDuration: '30 days',
    signupUrl: 'https://www.hostinger.com/affiliates',
    description: 'Affordable web hosting solutions',
    payoutType: 'per-sale',
    minPayout: '$50',
    difficulty: 'beginner',
    features: ['Budget-friendly option', 'High conversion', 'Good support']
  },
  {
    id: 'nordvpn',
    name: 'NordVPN',
    category: 'Security & Privacy',
    commission: '30% commission',
    cookieDuration: '30 days',
    signupUrl: 'https://partners.nordvpn.com/',
    description: 'VPN service for online privacy and security',
    payoutType: 'per-sale',
    minPayout: '$50',
    difficulty: 'beginner',
    features: ['Security niche growth', 'Brand recognition', 'Regular promotions']
  },
  {
    id: 'fiverr',
    name: 'Fiverr',
    category: 'Freelance Services',
    commission: '$15-$150 per referral',
    cookieDuration: '30 days',
    signupUrl: 'https://affiliates.fiverr.com/',
    description: 'Freelance services marketplace',
    payoutType: 'hybrid',
    minPayout: '$100',
    difficulty: 'beginner',
    features: ['Two-sided marketplace', 'Buyer & seller commissions', 'Broad services']
  },
  {
    id: 'gearit',
    name: 'GEARit',
    category: 'Electronics & Tech',
    commission: 'Up to 8% commission',
    cookieDuration: '30 days',
    signupUrl: 'https://rakuten.advertiser.com/gearit',
    description: 'Computer accessories, cables, and tech gear',
    payoutType: 'per-sale',
    minPayout: '$25',
    difficulty: 'beginner',
    features: ['Electronics niche', 'Wide product range', 'Rakuten network', 'YOU ARE APPROVED! ✅']
  },
  {
    id: 'udemy',
    name: 'Udemy',
    category: 'Education & Training',
    commission: '15% commission',
    cookieDuration: '7 days',
    signupUrl: 'https://www.udemy.com/affiliate/',
    description: 'Online learning and course platform',
    payoutType: 'per-sale',
    minPayout: '$50',
    difficulty: 'beginner',
    features: ['Education market growth', 'Tech course focus', 'Easy promotion']
  }
];

const TechSaasPrograms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedPayoutType, setSelectedPayoutType] = useState('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(TECH_SAAS_PROGRAMS.map(p => p.category))];
    return ['all', ...cats];
  }, []);

  // Filter programs based on search and filters
  const filteredPrograms = useMemo(() => {
    return TECH_SAAS_PROGRAMS.filter(program => {
      const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           program.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || program.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || program.difficulty === selectedDifficulty;
      const matchesPayoutType = selectedPayoutType === 'all' || program.payoutType === selectedPayoutType;
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesPayoutType;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedPayoutType]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPayoutTypeIcon = (payoutType) => {
    switch (payoutType) {
      case 'recurring': return <Zap className="h-4 w-4" />;
      case 'per-sale': return <DollarSign className="h-4 w-4" />;
      case 'hybrid': return <Star className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          🚀 Tech & SaaS Affiliate Programs
        </h2>
        <p className="text-gray-600">
          Curated list of {TECH_SAAS_PROGRAMS.length} high-commission FREE affiliate programs in tech and SaaS
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner Friendly</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          value={selectedPayoutType}
          onChange={(e) => setSelectedPayoutType(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Payout Types</option>
          <option value="per-sale">Per Sale</option>
          <option value="recurring">Recurring</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredPrograms.length} of {TECH_SAAS_PROGRAMS.length} programs
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map(program => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {program.name}
                    {getPayoutTypeIcon(program.payoutType)}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{program.category}</p>
                </div>
                <Badge className={getDifficultyColor(program.difficulty)}>
                  {program.difficulty}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{program.description}</p>
              
              {/* Commission Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Commission:
                  </span>
                  <span className="font-semibold text-green-600">{program.commission}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Cookie:
                  </span>
                  <span>{program.cookieDuration}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Min Payout:
                  </span>
                  <span>{program.minPayout}</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-1">
                {program.features.map((feature, index) => (
                  <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => window.open(program.signupUrl, '_blank')}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Apply Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredPrograms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No programs match your search criteria.</p>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedDifficulty('all');
              setSelectedPayoutType('all');
            }}
            variant="outline"
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TechSaasPrograms;