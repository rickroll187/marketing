import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Package, 
  Search, 
  ExternalLink, 
  Star, 
  DollarSign, 
  ShoppingCart, 
  Filter,
  Zap,
  Loader,
  RefreshCw,
  Plus,
  Eye,
  Heart,
  TrendingUp
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AffiliateProducts = () => {
  const [products, setProducts] = useState([]);
  const [rakutenProducts, setRakutenProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  
  // Rakuten search parameters
  const [rakutenKeyword, setRakutenKeyword] = useState('');
  const [rakutenCategory, setRakutenCategory] = useState('');
  const [rakutenMinPrice, setRakutenMinPrice] = useState('');
  const [rakutenMaxPrice, setRakutenMaxPrice] = useState('');

  // Fetch all products (from database)
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }, []);

  // Search Rakuten products
  const searchRakutenProducts = useCallback(async () => {
    if (!rakutenKeyword.trim()) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('keyword', rakutenKeyword);
      if (rakutenCategory) params.append('category', rakutenCategory);
      if (rakutenMinPrice) params.append('min_price', rakutenMinPrice);
      if (rakutenMaxPrice) params.append('max_price', rakutenMaxPrice);
      params.append('limit', '20');

      const response = await axios.get(`${API}/rakuten/products/search?${params.toString()}`);
      setRakutenProducts(response.data.results?.products || []);
    } catch (error) {
      console.error('Failed to search Rakuten products:', error);
      setRakutenProducts([]);
    } finally {
      setLoading(false);
    }
  }, [rakutenKeyword, rakutenCategory, rakutenMinPrice, rakutenMaxPrice]);

  // Import Rakuten products to database
  const importRakutenProducts = useCallback(async () => {
    if (!rakutenKeyword.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/rakuten/products/import`, {
        keyword: rakutenKeyword,
        category: rakutenCategory || 'general',
        limit: 20
      });
      
      // Refresh products list
      fetchProducts();
      
      alert(`Successfully imported ${response.data.imported_count} products!`);
    } catch (error) {
      console.error('Failed to import Rakuten products:', error);
      alert('Failed to import products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [rakutenKeyword, rakutenCategory, fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || product.category === category;
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'under50' && product.price < 50) ||
      (priceRange === '50to100' && product.price >= 50 && product.price <= 100) ||
      (priceRange === 'over100' && product.price > 100);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Affiliate Products
          </h2>
          <p className="text-gray-600">Browse and manage products from your affiliate programs</p>
        </div>
        <div className="flex gap-2">
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
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
              <Package className="h-6 w-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-xs font-medium">Avg Commission</p>
                <p className="text-2xl font-bold">8.5%</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium">Active Programs</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Star className="h-6 w-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium">Avg Price</p>
                <p className="text-2xl font-bold">${products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Program Tabs */}
      <Tabs defaultValue="all-products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            All Products
          </TabsTrigger>
          <TabsTrigger value="rakuten" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Rakuten Search
          </TabsTrigger>
          <TabsTrigger value="gearit" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            GEARit
          </TabsTrigger>
          <TabsTrigger value="amazon" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Amazon
          </TabsTrigger>
        </TabsList>

        {/* All Products Tab */}
        <TabsContent value="all-products" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Your Product Library ({products.length} products)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price_low">Price: Low to High</SelectItem>
                    <SelectItem value="price_high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <Card key={product.id} className="border border-gray-200 hover:border-blue-300 transition-colors group">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Product Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {product.category}
                              </Badge>
                              {product.source && (
                                <Badge variant="outline" className="text-xs">
                                  {product.source}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price and Commission */}
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
                              ~{formatPrice(product.price * 0.08)} comm.
                            </p>
                            <p className="text-xs text-gray-500">8% avg</p>
                          </div>
                        </div>

                        {/* Product Features */}
                        {product.features && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600">Key Features:</p>
                            <div className="flex flex-wrap gap-1">
                              {product.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="flex-1">
                            <Plus className="h-3 w-3 mr-1" />
                            Create Link
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No products found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm || category !== 'all' || priceRange !== 'all' 
                      ? 'Try adjusting your search criteria' 
                      : 'Import products from Rakuten to get started'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rakuten Search Tab */}
        <TabsContent value="rakuten" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Rakuten Product Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Input
                  placeholder="Search keyword (e.g., 'laptop')"
                  value={rakutenKeyword}
                  onChange={(e) => setRakutenKeyword(e.target.value)}
                />
                <Input
                  placeholder="Category (optional)"
                  value={rakutenCategory}
                  onChange={(e) => setRakutenCategory(e.target.value)}
                />
                <Input
                  placeholder="Min Price"
                  type="number"
                  value={rakutenMinPrice}
                  onChange={(e) => setRakutenMinPrice(e.target.value)}
                />
                <Input
                  placeholder="Max Price"
                  type="number"
                  value={rakutenMaxPrice}
                  onChange={(e) => setRakutenMaxPrice(e.target.value)}
                />
              </div>

              <div className="flex gap-2 mb-6">
                <Button onClick={searchRakutenProducts} disabled={loading || !rakutenKeyword.trim()}>
                  {loading ? <Loader className="h-4 w-4 mr-1 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
                  Search Products
                </Button>
                <Button variant="outline" onClick={importRakutenProducts} disabled={loading || !rakutenKeyword.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Import to Library
                </Button>
              </div>

              {/* Rakuten Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rakutenProducts.map((product, index) => (
                  <Card key={index} className="border border-gray-200 hover:border-green-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-2">
                            {product.name || 'Rakuten Product'}
                          </h3>
                          <Badge variant="secondary" className="text-xs mt-1">
                            Rakuten
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-green-600">
                            {formatPrice(product.price || 0)}
                          </p>
                          <p className="text-sm text-blue-600 font-medium">
                            5-8% comm.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {rakutenProducts.length === 0 && rakutenKeyword && !loading && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products found for "{rakutenKeyword}"</p>
                  <p className="text-sm text-gray-400">Try different keywords or adjust price range</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GEARit Tab */}
        <TabsContent value="gearit" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                GEARit Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Zap className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">GEARit Integration Ready</h3>
                <p className="text-gray-600 mb-4">
                  Browse premium tech accessories and USB hubs with 5-8% commission rates
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">USB Hubs</h4>
                    <p className="text-sm text-gray-600">7-port USB 3.0 hubs starting at $39.99</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Adapters</h4>
                    <p className="text-sm text-gray-600">USB-C to HDMI adapters from $24.99</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Cables</h4>
                    <p className="text-sm text-gray-600">Premium ethernet cables starting at $12.99</p>
                  </div>
                </div>
                <Button className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Browse GEARit Catalog
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Amazon Tab */}
        <TabsContent value="amazon" className="space-y-6">
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Amazon Associates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Amazon Integration Available</h3>
                <p className="text-gray-600 mb-4">
                  Connect your Amazon Product Advertising API to browse millions of products
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <p className="text-sm text-yellow-800">
                    <strong>API Keys Required:</strong> You need Amazon Product Advertising API credentials to access products
                  </p>
                </div>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Amazon API
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateProducts;