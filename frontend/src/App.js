import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Separator } from './components/ui/separator';
import { toast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  BarChart3, 
  Package,
  FileText,
  Video,
  Hash,
  TrendingUp,
  Globe,
  ShoppingCart,
  Star,
  MessageSquare,
  Copy,
  Trash2,
  Filter
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [products, setProducts] = useState([]);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [scrapeUrls, setScrapeUrls] = useState('');
  const [scrapeCategory, setScrapeCategory] = useState('');
  const [contentTypes, setContentTypes] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchGeneratedContent();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    }
  };

  const fetchGeneratedContent = async () => {
    try {
      const response = await axios.get(`${API}/content`);
      setGeneratedContent(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch generated content",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleScrapeProducts = async () => {
    if (!scrapeUrls.trim() || !scrapeCategory.trim()) {
      toast({
        title: "Error",
        description: "Please provide URLs and category",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const urls = scrapeUrls.split('\n').filter(url => url.trim());
      const response = await axios.post(`${API}/scrape`, {
        urls: urls,
        category: scrapeCategory
      });
      
      toast({
        title: "Success",
        description: `Scraped ${response.data.length} products successfully`
      });
      
      setScrapeUrls('');
      setScrapeCategory('');
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scrape products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async (productId) => {
    if (contentTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one content type",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/generate-content`, {
        product_id: productId,
        content_types: contentTypes,
        platforms: contentTypes.includes('social') ? platforms : []
      });
      
      toast({
        title: "Success",
        description: `Generated ${response.data.generated_content.length} pieces of content`
      });
      
      setContentTypes([]);
      setPlatforms([]);
      fetchGeneratedContent();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Content copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive"
      });
    }
  };

  const deleteContent = async (contentId) => {
    try {
      await axios.delete(`${API}/content/${contentId}`);
      toast({
        title: "Success",
        description: "Content deleted successfully"
      });
      fetchGeneratedContent();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive"
      });
    }
  };

  const Dashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Affiliate Marketing Platform
          </h1>
          <p className="text-gray-600 text-lg">Scrape products, generate content, and boost your affiliate sales</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Products</p>
                  <p className="text-3xl font-bold">{stats.total_products || 0}</p>
                </div>
                <Package className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Generated Content</p>
                  <p className="text-3xl font-bold">{stats.total_content || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Categories</p>
                  <p className="text-3xl font-bold">{Object.keys(stats.categories || {}).length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Conversion Rate</p>
                  <p className="text-3xl font-bold">12.3%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-xl p-2">
            <TabsTrigger value="products" className="flex items-center gap-2 rounded-lg">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 rounded-lg">
              <FileText className="h-4 w-4" />
              Generated Content
            </TabsTrigger>
            <TabsTrigger value="scraper" className="flex items-center gap-2 rounded-lg">
              <Search className="h-4 w-4" />
              Product Scraper
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Scraped Products
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {product.image_url && (
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                              <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          
                          <div>
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-3">{product.description}</p>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                                  {product.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {product.source}
                                </Badge>
                              </div>
                              {product.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{product.rating}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-2xl font-bold text-green-600">${product.price}</span>
                                {product.original_price && product.original_price > product.price && (
                                  <span className="text-sm text-gray-500 line-through ml-2">${product.original_price}</span>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(product.affiliate_url, '_blank')}
                                  className="hover:bg-indigo-50"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                      onClick={() => setSelectedProduct(product)}
                                    >
                                      <Sparkles className="h-4 w-4 mr-1" />
                                      Generate
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Generate Marketing Content</DialogTitle>
                                    </DialogHeader>
                                    
                                    <div className="space-y-6">
                                      <div>
                                        <h4 className="font-medium mb-2">Product: {selectedProduct?.name}</h4>
                                        <p className="text-sm text-gray-600">${selectedProduct?.price} • {selectedProduct?.category}</p>
                                      </div>
                                      
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Content Types</label>
                                        <div className="grid grid-cols-3 gap-3">
                                          {['blog', 'social', 'video_script'].map((type) => (
                                            <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={contentTypes.includes(type)}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setContentTypes([...contentTypes, type]);
                                                  } else {
                                                    setContentTypes(contentTypes.filter(t => t !== type));
                                                  }
                                                }}
                                                className="rounded"
                                              />
                                              <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {contentTypes.includes('social') && (
                                        <div>
                                          <label className="text-sm font-medium mb-2 block">Social Media Platforms</label>
                                          <div className="grid grid-cols-2 gap-3">
                                            {['twitter', 'instagram', 'facebook', 'linkedin'].map((platform) => (
                                              <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                  type="checkbox"
                                                  checked={platforms.includes(platform)}
                                                  onChange={(e) => {
                                                    if (e.target.checked) {
                                                      setPlatforms([...platforms, platform]);
                                                    } else {
                                                      setPlatforms(platforms.filter(p => p !== platform));
                                                    }
                                                  }}
                                                  className="rounded"
                                                />
                                                <span className="text-sm capitalize">{platform}</span>
                                              </label>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <Button
                                        onClick={() => handleGenerateContent(selectedProduct?.id)}
                                        disabled={loading || contentTypes.length === 0}
                                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                                      >
                                        {loading ? (
                                          <>
                                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                                            Generating...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            Generate Content
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {products.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No products found. Start by scraping some products!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Marketing Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {generatedContent.map((content) => (
                    <Card key={content.id} className="border-0 bg-white shadow-lg">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100">
                                {content.content_type === 'blog' && <FileText className="h-5 w-5 text-indigo-600" />}
                                {content.content_type === 'social' && <MessageSquare className="h-5 w-5 text-indigo-600" />}
                                {content.content_type === 'video_script' && <Video className="h-5 w-5 text-indigo-600" />}
                              </div>
                              <div>
                                <h3 className="font-semibold">{content.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Badge variant="secondary" className="capitalize">
                                    {content.content_type.replace('_', ' ')}
                                  </Badge>
                                  {content.platform && (
                                    <Badge variant="outline" className="capitalize">
                                      {content.platform}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(content.content)}
                                className="hover:bg-indigo-50"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteContent(content.id)}
                                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-3">
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{content.content}</p>
                            </div>
                            
                            {content.hashtags && content.hashtags.length > 0 && (
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-gray-400" />
                                <div className="flex flex-wrap gap-1">
                                  {content.hashtags.map((hashtag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {hashtag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {generatedContent.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No content generated yet. Generate some content from your products!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scraper" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Product Scraper
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Product URLs (one per line)</label>
                      <Textarea
                        placeholder="https://www.amazon.com/product/..."
                        value={scrapeUrls}
                        onChange={(e) => setScrapeUrls(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category</label>
                      <Select value={scrapeCategory} onValueChange={setScrapeCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="laptops">Laptops</SelectItem>
                          <SelectItem value="smartphones">Smartphones</SelectItem>
                          <SelectItem value="headphones">Headphones</SelectItem>
                          <SelectItem value="gaming">Gaming</SelectItem>
                          <SelectItem value="software">Software</SelectItem>
                          <SelectItem value="accessories">Accessories</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      onClick={handleScrapeProducts}
                      disabled={loading || !scrapeUrls.trim() || !scrapeCategory}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    >
                      {loading ? (
                        <>
                          <Search className="h-4 w-4 mr-2 animate-spin" />
                          Scraping Products...
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Scrape Products
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Supported Sites</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Amazon</p>
                          <p className="text-sm text-blue-700">Product pages with pricing and reviews</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                        <Globe className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Best Buy</p>
                          <p className="text-sm text-green-700">Electronics with detailed specifications</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                        <Globe className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-purple-900">Newegg</p>
                          <p className="text-sm text-purple-700">Computer hardware and tech products</p>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                        <p className="text-sm text-orange-800">
                          <strong>Pro Tip:</strong> The scraper automatically detects product information from most e-commerce sites. 
                          It works best with direct product page URLs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;