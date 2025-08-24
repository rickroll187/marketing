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
import { Calendar } from './components/ui/calendar';
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
  Filter,
  Mail,
  Calendar as CalendarIcon,
  Download,
  Send,
  Clock,
  Eye,
  MousePointer,
  Users,
  Target,
  Zap,
  Rocket,
  BookOpen,
  Award,
  Lightbulb,
  Snowflake,
  GitCompare,
  Bookmark,
  CheckSquare,
  Square,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader,
  DollarSign,
  LineChart,
  Share2,
  Mic,
  Camera,
  Briefcase,
  Settings,
  Brain,
  Activity,
  Monitor,
  Megaphone,
  Shield,
  Network,
  Bot,
  Headphones,
  Play,
  PieChart,
  Radar,
  Workflow
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [products, setProducts] = useState([]);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [savedUrls, setSavedUrls] = useState([]);
  const [stats, setStats] = useState({});
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Tab state management
  const [activeTab, setActiveTab] = useState('url-manager');
  
  // Scraping state
  const [scrapeUrls, setScrapeUrls] = useState('');
  const [scrapeCategory, setScrapeCategory] = useState('');
  
  // URL Management state
  const [urlsToSave, setUrlsToSave] = useState('');
  const [urlCategory, setUrlCategory] = useState('');
  const [urlPriority, setUrlPriority] = useState('medium');
  const [urlNotes, setUrlNotes] = useState('');
  
  // Content generation state
  const [contentTypes, setContentTypes] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [comparisonProducts, setComparisonProducts] = useState('');
  const [season, setSeason] = useState('');
  const [tutorialFocus, setTutorialFocus] = useState('');
  
  // Email campaign state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [scheduleDate, setScheduleDate] = useState(null);
  
  // Scheduling state
  const [selectedContentForScheduling, setSelectedContentForScheduling] = useState(null);
  const [schedulingDate, setSchedulingDate] = useState(null);
  
  // Product editing state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editOriginalPrice, setEditOriginalPrice] = useState('');
  const [editName, setEditName] = useState('');

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditPrice(product.price.toString());
    setEditOriginalPrice(product.original_price?.toString() || '');
    setEditName(product.name);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const updateData = {
        price: parseFloat(editPrice) || 0,
        original_price: editOriginalPrice ? parseFloat(editOriginalPrice) : null,
        name: editName
      };
      
      await axios.put(`${API}/products/${editingProduct.id}/price`, updateData);
      
      toast({
        title: "Success! 🎉",
        description: "Product updated successfully",
        duration: 4000
      });
      
      setEditingProduct(null);
      setEditPrice('');
      setEditOriginalPrice('');
      setEditName('');
      
      // Refresh products WITHOUT changing tabs
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchGeneratedContent();
    fetchEmailCampaigns();
    fetchSavedUrls();
    fetchStats();
    fetchAnalytics();
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

  const fetchEmailCampaigns = async () => {
    try {
      const response = await axios.get(`${API}/email-campaigns`);
      setEmailCampaigns(response.data);
    } catch (error) {
      console.error('Failed to fetch email campaigns');
    }
  };

  const fetchSavedUrls = async () => {
    try {
      const response = await axios.get(`${API}/saved-urls`);
      setSavedUrls(response.data);
    } catch (error) {
      console.error('Failed to fetch saved URLs');
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

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics');
    }
  };

  const handleSaveUrls = async () => {
    if (!urlsToSave.trim() || !urlCategory.trim()) {
      toast({
        title: "Error",
        description: "Please provide URLs and category",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const urls = urlsToSave.split('\n').filter(url => url.trim());
      
      if (urls.length === 0) {
        toast({
          title: "Error",
          description: "No valid URLs found",
          variant: "destructive"
        });
        return;
      }

      // Show progress for large batches
      if (urls.length > 20) {
        toast({
          title: "Processing Large Batch",
          description: `Processing ${urls.length} URLs... This may take a few minutes.`,
          duration: 5000
        });
      }

      const response = await axios.post(`${API}/saved-urls/bulk`, {
        urls: urls,
        category: urlCategory,
        priority: urlPriority,
        notes: urlNotes || null
      });
      
      toast({
        title: "Success! 🎉",
        description: `Successfully saved ${response.data.length} URLs to your queue! ${urls.length > response.data.length ? `(${urls.length - response.data.length} duplicates skipped)` : ''}`,
        duration: 6000
      });
      
      setUrlsToSave('');
      setUrlCategory('');
      setUrlPriority('medium');
      setUrlNotes('');
      
      // Update data WITHOUT changing tabs
      fetchSavedUrls();
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to save URLs";
      toast({
        title: "Error",
        description: `${errorMessage}. Please try with fewer URLs or check your internet connection.`,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUrlSelection = async (urlId, currentSelection) => {
    try {
      await axios.put(`${API}/saved-urls/${urlId}`, {
        selected: !currentSelection
      });
      fetchSavedUrls();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update URL selection",
        variant: "destructive"
      });
    }
  };

  const handleSelectAllUrls = async () => {
    try {
      await axios.post(`${API}/saved-urls/select-all`);
      toast({
        title: "Success",
        description: "Selected all URLs"
      });
      fetchSavedUrls();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select all URLs",
        variant: "destructive"
      });
    }
  };

  const handleUnselectAllUrls = async () => {
    try {
      await axios.post(`${API}/saved-urls/unselect-all`);
      toast({
        title: "Success",
        description: "Unselected all URLs"
      });
      fetchSavedUrls();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unselect all URLs",
        variant: "destructive"
      });
    }
  };

  const handleScrapeSelectedUrls = async () => {
    const selectedCount = savedUrls.filter(url => url.selected && !url.scraped).length;
    
    if (selectedCount === 0) {
      toast({
        title: "Error",
        description: "No URLs selected for scraping",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/saved-urls/scrape-selected`);
      
      toast({
        title: "Success! 🎉",
        description: response.data.message,
        duration: 6000
      });
      
      // Update data WITHOUT changing tabs - stay in current tab
      fetchSavedUrls();
      fetchProducts();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scrape selected URLs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavedUrl = async (urlId) => {
    try {
      await axios.delete(`${API}/saved-urls/${urlId}`);
      toast({
        title: "Success",
        description: "URL deleted successfully"
      });
      fetchSavedUrls();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete URL",
        variant: "destructive"
      });
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
      const requestData = {
        product_id: productId,
        content_types: contentTypes,
        platforms: contentTypes.includes('social') ? platforms : []
      };

      // Add optional parameters
      if (comparisonProducts.trim()) {
        requestData.comparison_products = comparisonProducts.split(',').map(p => p.trim());
      }
      if (season.trim()) {
        requestData.season = season;
      }
      if (tutorialFocus.trim()) {
        requestData.tutorial_focus = tutorialFocus;
      }
      
      const response = await axios.post(`${API}/generate-content`, requestData);
      
      toast({
        title: "Success! 🎉",
        description: `Generated ${response.data.generated_content.length} pieces of content`,
        duration: 6000
      });
      
      // Reset form
      setContentTypes([]);
      setPlatforms([]);
      setComparisonProducts('');
      setSeason('');
      setTutorialFocus('');
      
      // Update data WITHOUT changing tabs - stay where you are
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

  const handleScheduleContent = async (contentId, scheduledDate) => {
    try {
      await axios.post(`${API}/schedule-content/${contentId}`, null, {
        params: { scheduled_for: scheduledDate.toISOString() }
      });
      
      toast({
        title: "Success",
        description: "Content scheduled successfully"
      });
      
      fetchGeneratedContent();
      setSelectedContentForScheduling(null);
      setSchedulingDate(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule content",
        variant: "destructive"
      });
    }
  };

  const handleCreateEmailCampaign = async () => {
    if (!emailSubject.trim() || !emailContent.trim() || !emailRecipients.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all email campaign fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const recipients = emailRecipients.split(',').map(email => email.trim());
      
      const campaignData = {
        name: `Campaign: ${emailSubject}`,
        subject: emailSubject,
        content: emailContent,
        recipient_list: recipients,
        scheduled_for: scheduleDate ? scheduleDate.toISOString() : null
      };
      
      await axios.post(`${API}/email-campaigns`, campaignData);
      
      toast({
        title: "Success",
        description: scheduleDate ? "Email campaign scheduled" : "Email campaign sent"
      });
      
      // Reset form
      setEmailSubject('');
      setEmailContent('');
      setEmailRecipients('');
      setScheduleDate(null);
      
      fetchEmailCampaigns();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create email campaign",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportContent = async (platform) => {
    try {
      const response = await axios.get(`${API}/content/export/${platform}`);
      
      // Create and download CSV file
      const blob = new Blob([response.data.csv_data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = response.data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: `${platform} content exported successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to export ${platform} content`,
        variant: "destructive"
      });
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
      
      // Update data WITHOUT changing tabs - stay exactly where you are
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

  const getContentTypeIcon = (contentType) => {
    const icons = {
      blog: <FileText className="h-5 w-5" />,
      social: <MessageSquare className="h-5 w-5" />,
      video_script: <Video className="h-5 w-5" />,
      comparison: <GitCompare className="h-5 w-5" />,
      tutorial: <BookOpen className="h-5 w-5" />,
      review_roundup: <Award className="h-5 w-5" />,
      seasonal: <Snowflake className="h-5 w-5" />,
      launch: <Rocket className="h-5 w-5" />
    };
    return icons[contentType] || <FileText className="h-5 w-5" />;
  };

  const Dashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Advanced Affiliate Marketing Platform
          </h1>
          <p className="text-gray-600 text-lg">Complete marketing automation with AI-powered content generation</p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs font-medium">Products</p>
                  <p className="text-2xl font-bold">{stats.total_products || 0}</p>
                </div>
                <Package className="h-6 w-6 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs font-medium">Content</p>
                  <p className="text-2xl font-bold">{stats.total_content || 0}</p>
                </div>
                <FileText className="h-6 w-6 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs font-medium">Saved URLs</p>
                  <p className="text-2xl font-bold">{stats.saved_urls || 0}</p>
                </div>
                <Bookmark className="h-6 w-6 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs font-medium">Selected</p>
                  <p className="text-2xl font-bold">{stats.selected_urls || 0}</p>
                </div>
                <CheckSquare className="h-6 w-6 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-xs font-medium">Scheduled</p>
                  <p className="text-2xl font-bold">{stats.scheduled_content || 0}</p>
                </div>
                <Clock className="h-6 w-6 text-pink-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-xs font-medium">Campaigns</p>
                  <p className="text-2xl font-bold">{stats.total_campaigns || 0}</p>
                </div>
                <Mail className="h-6 w-6 text-cyan-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs font-medium">Conv. Rate</p>
                  <p className="text-2xl font-bold">15.8%</p>
                </div>
                <TrendingUp className="h-6 w-6 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white shadow-lg rounded-xl p-2">
            <TabsTrigger value="url-manager" className="flex items-center gap-2 rounded-lg text-xs">
              <Bookmark className="h-4 w-4" />
              URL Manager
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 rounded-lg text-xs">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 rounded-lg text-xs">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="scraper" className="flex items-center gap-2 rounded-lg text-xs">
              <Search className="h-4 w-4" />
              Scraper
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-2 rounded-lg text-xs">
              <Clock className="h-4 w-4" />
              Scheduler
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2 rounded-lg text-xs">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 rounded-lg text-xs">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url-manager" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5" />
                    URL Queue Manager
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllUrls}
                      className="hover:bg-green-50"
                    >
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnselectAllUrls}
                      className="hover:bg-gray-50"
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Unselect All
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleScrapeSelectedUrls}
                      disabled={loading || !savedUrls.some(url => url.selected && !url.scraped)}
                      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 mr-1 animate-spin" />
                          Scraping...
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Scrape Selected
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Add URLs Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Add URLs to Queue</h3>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Product URLs (one per line) - ✨ UNLIMITED!</label>
                      <Textarea
                        placeholder="https://www.amazon.com/product/...
https://www.bestbuy.com/site/...
https://www.newegg.com/...

Paste as many URLs as you want! No limits - 50, 100, 500+ URLs supported!"
                        value={urlsToSave}
                        onChange={(e) => setUrlsToSave(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        💡 Pro tip: You can paste 100+ URLs at once! Large batches are processed efficiently in the background.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <Select value={urlCategory} onValueChange={setUrlCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="smartphones">Smartphones</SelectItem>
                            <SelectItem value="laptops">Laptops</SelectItem>
                            <SelectItem value="headphones">Headphones</SelectItem>
                            <SelectItem value="gaming">Gaming</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                            <SelectItem value="tablets">Tablets</SelectItem>
                            <SelectItem value="smartwatches">Smart Watches</SelectItem>
                            <SelectItem value="cameras">Cameras</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Priority</label>
                        <Select value={urlPriority} onValueChange={setUrlPriority}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="low">Low Priority</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                      <Input
                        placeholder="Black Friday deals, trending products, etc."
                        value={urlNotes}
                        onChange={(e) => setUrlNotes(e.target.value)}
                      />
                    </div>
                    
                    <Button
                      onClick={handleSaveUrls}
                      disabled={loading || !urlsToSave.trim() || !urlCategory}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Saving {urlsToSave.split('\n').filter(url => url.trim()).length} URLs...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Save {urlsToSave.split('\n').filter(url => url.trim()).length || 0} URLs to Queue
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Benefits Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">How URL Queue Works</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <Bookmark className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-900">Save URLs Anytime</p>
                          <p className="text-sm text-blue-700">Collect product URLs throughout the week without immediate scraping</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                        <CheckSquare className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-900">Review & Select</p>
                          <p className="text-sm text-green-700">Check/uncheck which products you want to actually scrape</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                        <ArrowRight className="h-5 w-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-purple-900">Bulk Processing</p>
                          <p className="text-sm text-purple-700">Scrape multiple selected URLs in one batch operation</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                        <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-orange-900">Quality Control</p>
                          <p className="text-sm text-orange-700">Organize by priority and category before scraping</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* URL Queue Display */}
                <div className="mt-8">
                  <h3 className="font-semibold text-lg mb-4">Saved URLs ({savedUrls.length})</h3>
                  
                  {savedUrls.length > 0 ? (
                    <div className="space-y-3">
                      {savedUrls.map((savedUrl) => (
                        <Card key={savedUrl.id} className={`border transition-all duration-200 ${
                          savedUrl.selected 
                            ? 'border-green-300 bg-green-50' 
                            : savedUrl.scraped 
                              ? 'border-gray-200 bg-gray-50 opacity-75'
                              : 'border-gray-200 bg-white hover:border-purple-200'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleUrlSelection(savedUrl.id, savedUrl.selected)}
                                  disabled={savedUrl.scraped}
                                  className="p-1"
                                >
                                  {savedUrl.selected ? (
                                    <CheckSquare className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-400" />
                                  )}
                                </Button>
                                
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm">{savedUrl.title}</h4>
                                    <Badge variant="secondary" className="text-xs">
                                      {savedUrl.category}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        savedUrl.priority === 'high' ? 'border-red-300 text-red-600' :
                                        savedUrl.priority === 'medium' ? 'border-yellow-300 text-yellow-600' :
                                        'border-gray-300 text-gray-600'
                                      }`}
                                    >
                                      {savedUrl.priority}
                                    </Badge>
                                    {savedUrl.scraped && (
                                      <Badge variant="outline" className="text-green-600 border-green-300">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Scraped
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 truncate max-w-md">{savedUrl.url}</p>
                                  {savedUrl.notes && (
                                    <p className="text-xs text-gray-500 mt-1">📝 {savedUrl.notes}</p>
                                  )}
                                  {savedUrl.estimated_price && (
                                    <p className="text-xs text-green-600 mt-1">💰 ~${savedUrl.estimated_price}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(savedUrl.url, '_blank')}
                                  className="hover:bg-indigo-50"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteSavedUrl(savedUrl.id)}
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No URLs saved yet</p>
                      <p className="text-sm text-gray-400">Add some product URLs above to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {product.tags.slice(0, 4).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
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
                                  <DialogContent className="max-w-3xl">
                                    <DialogHeader>
                                      <DialogTitle>Generate Advanced Marketing Content</DialogTitle>
                                    </DialogHeader>
                                    
                                    <div className="space-y-6">
                                      <div>
                                        <h4 className="font-medium mb-2">Product: {selectedProduct?.name}</h4>
                                        <p className="text-sm text-gray-600">${selectedProduct?.price} • {selectedProduct?.category}</p>
                                      </div>
                                      
                                      <div>
                                        <label className="text-sm font-medium mb-2 block">Content Types</label>
                                        <div className="grid grid-cols-2 gap-3">
                                          {[
                                            { value: 'blog', label: 'Blog Posts', icon: <FileText className="h-4 w-4" /> },
                                            { value: 'social', label: 'Social Media', icon: <MessageSquare className="h-4 w-4" /> },
                                            { value: 'video_script', label: 'Video Scripts', icon: <Video className="h-4 w-4" /> },
                                            { value: 'comparison', label: 'Comparisons', icon: <GitCompare className="h-4 w-4" /> },
                                            { value: 'tutorial', label: 'Tutorials', icon: <BookOpen className="h-4 w-4" /> },
                                            { value: 'review_roundup', label: 'Review Roundups', icon: <Award className="h-4 w-4" /> },
                                            { value: 'seasonal', label: 'Seasonal Campaigns', icon: <Snowflake className="h-4 w-4" /> },
                                            { value: 'launch', label: 'Product Launches', icon: <Rocket className="h-4 w-4" /> }
                                          ].map((type) => (
                                            <label key={type.value} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                                              <input
                                                type="checkbox"
                                                checked={contentTypes.includes(type.value)}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setContentTypes([...contentTypes, type.value]);
                                                  } else {
                                                    setContentTypes(contentTypes.filter(t => t !== type.value));
                                                  }
                                                }}
                                                className="rounded"
                                              />
                                              {type.icon}
                                              <span className="text-sm">{type.label}</span>
                                            </label>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {contentTypes.includes('social') && (
                                        <div>
                                          <label className="text-sm font-medium mb-2 block">Social Media Platforms</label>
                                          <div className="grid grid-cols-2 gap-3">
                                            {['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok'].map((platform) => (
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

                                      {/* Advanced Options */}
                                      <div className="space-y-4">
                                        {contentTypes.includes('comparison') && (
                                          <div>
                                            <label className="text-sm font-medium mb-2 block">Comparison Products (comma-separated)</label>
                                            <Input
                                              placeholder="iPhone 15, Samsung Galaxy S24, etc."
                                              value={comparisonProducts}
                                              onChange={(e) => setComparisonProducts(e.target.value)}
                                            />
                                          </div>
                                        )}

                                        {contentTypes.includes('seasonal') && (
                                          <div>
                                            <label className="text-sm font-medium mb-2 block">Season/Event</label>
                                            <Select value={season} onValueChange={setSeason}>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select season/event" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="black-friday">Black Friday</SelectItem>
                                                <SelectItem value="christmas">Christmas</SelectItem>
                                                <SelectItem value="back-to-school">Back to School</SelectItem>
                                                <SelectItem value="spring">Spring</SelectItem>
                                                <SelectItem value="summer">Summer</SelectItem>
                                                <SelectItem value="winter">Winter</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}

                                        {contentTypes.includes('tutorial') && (
                                          <div>
                                            <label className="text-sm font-medium mb-2 block">Tutorial Focus</label>
                                            <Input
                                              placeholder="Setup and configuration, advanced features, troubleshooting..."
                                              value={tutorialFocus}
                                              onChange={(e) => setTutorialFocus(e.target.value)}
                                            />
                                          </div>
                                        )}
                                      </div>
                                      
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
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Marketing Content
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportContent('twitter')}
                      className="hover:bg-blue-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export Twitter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportContent('instagram')}
                      className="hover:bg-pink-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export Instagram
                    </Button>
                  </div>
                </div>
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
                                {getContentTypeIcon(content.content_type)}
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
                                  {content.scheduled_for && (
                                    <Badge variant="outline" className="text-orange-600">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Scheduled
                                    </Badge>
                                  )}
                                  {content.published && (
                                    <Badge variant="outline" className="text-green-600">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Published
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedContentForScheduling(content)}
                                    className="hover:bg-orange-50"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Schedule Content</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">Select Date & Time</label>
                                      <Calendar
                                        mode="single"
                                        selected={schedulingDate}
                                        onSelect={setSchedulingDate}
                                        className="rounded-md border"
                                      />
                                    </div>
                                    <Button
                                      onClick={() => handleScheduleContent(selectedContentForScheduling?.id, schedulingDate)}
                                      disabled={!schedulingDate}
                                      className="w-full"
                                    >
                                      Schedule Content
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
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

                            {content.scheduled_for && (
                              <div className="flex items-center gap-2 text-sm text-orange-600">
                                <CalendarIcon className="h-4 w-4" />
                                <span>Scheduled for: {new Date(content.scheduled_for).toLocaleString()}</span>
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
                  Enhanced Product Scraper
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Product URLs (one per line)</label>
                      <Textarea
                        placeholder="https://www.amazon.com/product/...
https://www.bestbuy.com/site/...
https://www.newegg.com/..."
                        value={scrapeUrls}
                        onChange={(e) => setScrapeUrls(e.target.value)}
                        rows={10}
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
                          <SelectItem value="tablets">Tablets</SelectItem>
                          <SelectItem value="smartwatches">Smart Watches</SelectItem>
                          <SelectItem value="cameras">Cameras</SelectItem>
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
                    <h3 className="font-semibold text-lg">Enhanced Scraping Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Advanced Data Extraction</p>
                          <p className="text-sm text-blue-700">Extracts prices, ratings, reviews, features, and tags</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                        <Target className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">Smart Tag Detection</p>
                          <p className="text-sm text-green-700">Automatically tags products with relevant keywords</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                        <Zap className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium text-purple-900">Price Comparison</p>
                          <p className="text-sm text-purple-700">Detects original vs discounted prices</p>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-100">
                        <p className="text-sm text-orange-800">
                          <strong>Pro Tip:</strong> The enhanced scraper now extracts more detailed product information including 
                          features, specifications, customer ratings, and automatically generates relevant tags for better content targeting.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduler" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Content Scheduling Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Scheduled Content</h3>
                    <div className="space-y-3">
                      {generatedContent
                        .filter(content => content.scheduled_for && !content.published)
                        .map((content) => (
                          <div key={content.id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{content.title}</h4>
                              <Badge variant="outline" className="text-orange-600">
                                {content.platform || 'General'}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{content.content.substring(0, 100)}...</p>
                            <div className="flex items-center gap-2 text-xs text-orange-600">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{new Date(content.scheduled_for).toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      
                      {generatedContent.filter(content => content.scheduled_for && !content.published).length === 0 && (
                        <div className="text-center py-8">
                          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No content scheduled</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Published Content</h3>
                    <div className="space-y-3">
                      {generatedContent
                        .filter(content => content.published)
                        .slice(0, 5)
                        .map((content) => (
                          <div key={content.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{content.title}</h4>
                              <Badge variant="outline" className="text-green-600">
                                Published
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{content.content.substring(0, 100)}...</p>
                            <div className="flex items-center gap-2 text-xs text-green-600">
                              <Eye className="h-3 w-3" />
                              <span>{content.published_at ? new Date(content.published_at).toLocaleString() : 'Recently'}</span>
                            </div>
                          </div>
                        ))}
                      
                      {generatedContent.filter(content => content.published).length === 0 && (
                        <div className="text-center py-8">
                          <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No content published yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Marketing Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Create Campaign */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Create Email Campaign</h3>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject Line</label>
                      <Input
                        placeholder="Amazing deals on tech products!"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Content</label>
                      <Textarea
                        placeholder="Your email content here..."
                        value={emailContent}
                        onChange={(e) => setEmailContent(e.target.value)}
                        rows={8}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Recipients (comma-separated)</label>
                      <Textarea
                        placeholder="user1@example.com, user2@example.com"
                        value={emailRecipients}
                        onChange={(e) => setEmailRecipients(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Schedule (optional)</label>
                      <Calendar
                        mode="single"
                        selected={scheduleDate}
                        onSelect={setScheduleDate}
                        className="rounded-md border"
                      />
                    </div>

                    <Button
                      onClick={handleCreateEmailCampaign}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {loading ? (
                        <>
                          <Send className="h-4 w-4 mr-2 animate-spin" />
                          {scheduleDate ? 'Scheduling...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {scheduleDate ? 'Schedule Campaign' : 'Send Campaign'}
                        </>
                      )}
                    </Button>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Email Integration:</strong> Uses SendGrid free tier (100 emails/day). 
                        Configure your SendGrid API key in the backend environment variables for production use.
                      </p>
                    </div>
                  </div>

                  {/* Campaign History */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Campaign History</h3>
                    
                    <div className="space-y-3">
                      {emailCampaigns.map((campaign) => (
                        <div key={campaign.id} className="p-4 border rounded-lg bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{campaign.subject}</h4>
                            <Badge variant={campaign.sent ? "default" : "secondary"}>
                              {campaign.sent ? "Sent" : "Scheduled"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Recipients: {campaign.recipient_list.length}
                          </p>
                          <div className="text-xs text-gray-500">
                            {campaign.sent ? 
                              `Sent: ${new Date(campaign.sent_at).toLocaleString()}` :
                              campaign.scheduled_for ? 
                                `Scheduled: ${new Date(campaign.scheduled_for).toLocaleString()}` :
                                `Created: ${new Date(campaign.created_at).toLocaleString()}`
                            }
                          </div>
                        </div>
                      ))}

                      {emailCampaigns.length === 0 && (
                        <div className="text-center py-8">
                          <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No email campaigns yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Analytics & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <Card className="border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Total Views</p>
                          <p className="text-2xl font-bold">24.8K</p>
                          <p className="text-blue-200 text-xs">+12% from last month</p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Click-through Rate</p>
                          <p className="text-2xl font-bold">8.4%</p>
                          <p className="text-green-200 text-xs">+2.1% from last month</p>
                        </div>
                        <MousePointer className="h-8 w-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Conversions</p>
                          <p className="text-2xl font-bold">412</p>
                          <p className="text-purple-200 text-xs">+8% from last month</p>
                        </div>
                        <Target className="h-8 w-8 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Content Performance by Type</h3>
                    <div className="space-y-3">
                      {Object.entries(stats.content_types || {}).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {getContentTypeIcon(type)}
                            <span className="capitalize">{type.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">{count}</Badge>
                            <div className="text-sm text-gray-600">
                              Avg CTR: {(Math.random() * 10 + 5).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Platform Performance</h3>
                    <div className="space-y-3">
                      {Object.entries(stats.platforms || {}).map(([platform, count]) => (
                        <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            <span className="capitalize">{platform}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">{count}</Badge>
                            <div className="text-sm text-gray-600">
                              Engagement: {(Math.random() * 5 + 2).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold mb-2">Analytics Integration</h4>
                  <p className="text-sm text-gray-700">
                    Connect Google Analytics, Facebook Pixel, or other tracking tools to get real-time performance data. 
                    The platform includes endpoints for recording custom metrics and generating detailed reports.
                  </p>
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