import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { 
  Link, 
  Zap, 
  Copy, 
  ExternalLink, 
  Filter,
  Package,
  Star,
  DollarSign,
  CheckCircle,
  RefreshCw,
  Search,
  Plus,
  Eye,
  QrCode,
  BarChart3,
  Target,
  Scissors
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SmartLinkGenerator = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [generatedLinks, setGeneratedLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  
  // Link generation states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [campaignName, setCampaignName] = useState('');
  const [trackingCode, setTrackingCode] = useState('');

  // Fetch products and build categories
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/products`);
      const productData = response.data || [];
      setProducts(productData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(productData.map(p => p.category))].filter(Boolean);
      setCategories(uniqueCategories);
      
      setFilteredProducts(productData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, []);

  // Filter products based on selections
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filter by program/source
    if (selectedProgram !== 'all') {
      filtered = filtered.filter(p => p.source === selectedProgram);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by price range
    if (priceRange !== 'all') {
      if (priceRange === 'under50') {
        filtered = filtered.filter(p => p.price < 50);
      } else if (priceRange === '50to100') {
        filtered = filtered.filter(p => p.price >= 50 && p.price <= 100);
      } else if (priceRange === 'over100') {
        filtered = filtered.filter(p => p.price > 100);
      }
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedProgram, searchTerm, priceRange]);

  // Generate affiliate link
  const generateAffiliateLink = useCallback(async (product) => {
    if (!product) return;
    
    setLoading(true);
    try {
      // Create a custom tracking code if not provided
      const finalTrackingCode = trackingCode || `${product.source}_${Date.now()}`;
      
      // Generate short URL and tracking
      const newLink = {
        id: `link_${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        original_url: product.affiliate_url,
        short_url: `https://af.ly/${finalTrackingCode}`,
        program: product.source,
        campaign: campaignName || 'Default Campaign',
        tracking_code: finalTrackingCode,
        commission_rate: getCommissionRate(product.source),
        estimated_commission: (product.price * getCommissionRate(product.source) / 100).toFixed(2),
        created_at: new Date().toISOString(),
        clicks: 0,
        conversions: 0,
        earnings: 0
      };
      
      // Add to generated links
      setGeneratedLinks(prev => [newLink, ...prev]);
      
      // Clear form
      setSelectedProduct(null);
      setCampaignName('');
      setTrackingCode('');
      
      // Show success message
      alert(`✅ Affiliate link generated successfully!\n\nShort URL: ${newLink.short_url}\nTracking Code: ${finalTrackingCode}`);
      
    } catch (error) {
      console.error('Failed to generate link:', error);
      alert('Failed to generate affiliate link. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [campaignName, trackingCode]);

  // Get commission rate based on program
  const getCommissionRate = (source) => {
    const rates = {
      'rakuten': 6,
      'gearit': 8,
      'www.gearit.com': 8,
      'amazon': 4,
      'www.amazon.com': 4,
      'default': 5
    };
    return rates[source.toLowerCase()] || rates.default;
  };

  // Copy link to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Get unique programs/sources
  const programs = [...new Set(products.map(p => p.source))].filter(Boolean);

  // Load data on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Smart Link Generator
          </h2>
          <p className="text-gray-600">Generate affiliate links from your existing products with one click</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchProducts}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Available Products</p>
                <p className="text-2xl font-bold">{filteredProducts.length}</p>
              </div>
              <Package className="h-6 w-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Generated Links</p>
                <p className="text-2xl font-bold">{generatedLinks.length}</p>
              </div>
              <Link className="h-6 w-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Active Programs</p>
                <p className="text-2xl font-bold">{programs.length}</p>
              </div>
              <Star className="h-6 w-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium">Avg Commission</p>
                <p className="text-2xl font-bold">6.5%</p>
              </div>
              <DollarSign className="h-6 w-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Selection Interface */}
      <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Select Product for Link Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger>
                <SelectValue placeholder="Program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map(program => (
                  <SelectItem key={program} value={program}>
                    {program === 'rakuten' ? 'Rakuten' : 
                     program === 'www.gearit.com' ? 'GEARit' :
                     program === 'www.amazon.com' ? 'Amazon' : 
                     program.charAt(0).toUpperCase() + program.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under50">Under $50</SelectItem>
                <SelectItem value="50to100">$50 - $100</SelectItem>
                <SelectItem value="over100">Over $100</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-1" />
              {filteredProducts.length} products
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className={`border-2 transition-all cursor-pointer hover:border-blue-300 ${
                  selectedProduct?.id === product.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {product.source === 'rakuten' ? 'Rakuten' : 
                             product.source === 'www.gearit.com' ? 'GEARit' :
                             product.source === 'www.amazon.com' ? 'Amazon' : 
                             product.source}
                          </Badge>
                        </div>
                      </div>
                      {selectedProduct?.id === product.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-green-600">
                          {formatPrice(product.price)}
                        </p>
                        {product.original_price && product.original_price > product.price && (
                          <p className="text-sm text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600 font-medium">
                          {getCommissionRate(product.source)}% comm.
                        </p>
                        <p className="text-xs text-gray-500">
                          ~{formatPrice(product.price * getCommissionRate(product.source) / 100)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No products found</p>
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Generation Form */}
      {selectedProduct && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Generate Link for: {selectedProduct.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Name (Optional)</label>
                <Input
                  placeholder="e.g., Holiday2024, Black Friday"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Custom Tracking Code (Optional)</label>
                <Input
                  placeholder="Auto-generated if empty"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border mb-4">
              <div>
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-600">
                  {formatPrice(selectedProduct.price)} • {getCommissionRate(selectedProduct.source)}% commission • 
                  Est. earnings: {formatPrice(selectedProduct.price * getCommissionRate(selectedProduct.source) / 100)}
                </p>
              </div>
              <Button
                onClick={() => generateAffiliateLink(selectedProduct)}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Link
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Links */}
      {generatedLinks.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Generated Affiliate Links ({generatedLinks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedLinks.map((link) => (
                <Card key={link.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{link.product_name}</h4>
                          <Badge variant="secondary">{link.program}</Badge>
                          <Badge variant="outline">{link.commission_rate}% comm.</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Short URL:</span>
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded">{link.short_url}</code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(link.short_url)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>Campaign: {link.campaign}</div>
                            <div>Tracking: {link.tracking_code}</div>
                            <div>Est. Commission: ${link.estimated_commission}</div>
                            <div>Created: {new Date(link.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartLinkGenerator;