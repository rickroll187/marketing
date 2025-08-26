import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { 
  initGA, 
  initFacebookPixel, 
  trackProductView, 
  trackProductClick, 
  trackContentGeneration,
  trackEmailCampaign,
  trackSocialPost,
  trackPriceAlert,
  trackCompetitorAnalysis,
  trackPageView,
  trackConversion
} from './analytics';
import StableInput from './StableInput';
import NativeInput from './NativeInput';
import IsolatedInput from './IsolatedInput';
import PureInput from './PureInput';
import FocusSafeTextarea from './FocusSafeTextarea';
import FocusSafeInput from './FocusSafeInput';
import ExternalTextarea from './ExternalTextarea';
import PortalTextarea from './PortalTextarea';
import AutoFocusTextarea from './AutoFocusTextarea';
import IsolatedUrlInput from './IsolatedUrlInput';
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
  const [urlSaveLoading, setUrlSaveLoading] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
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

  // Price Tracker state
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [trackedPrices, setTrackedPrices] = useState([]);
  const [alertThreshold, setAlertThreshold] = useState(10);
  const [trackingInterval, setTrackingInterval] = useState('daily');

  // Advanced Analytics state
  const [performanceData, setPerformanceData] = useState({});
  const [conversionMetrics, setConversionMetrics] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [dateRange, setDateRange] = useState('30d');

  // Social Automation state
  const [socialPosts, setSocialPosts] = useState([]);
  const [autoPostSchedule, setAutoPostSchedule] = useState([]);
  const [selectedSocialPlatforms, setSelectedSocialPlatforms] = useState([]);
  const [hashtagStrategy, setHashtagStrategy] = useState('');

  // Content Studio state
  const [voiceScripts, setVoiceScripts] = useState([]);
  const [videoScripts, setVideoScripts] = useState([]);
  const [personalizedContent, setPersonalizedContent] = useState([]);
  const [audienceSegments, setAudienceSegments] = useState([]);

  // Competitor Intel state
  const [competitorData, setCompetitorData] = useState([]);
  const [competitorProducts, setCompetitorProducts] = useState([]);
  const [marketGaps, setMarketGaps] = useState([]);
  const [competitorUrls, setCompetitorUrls] = useState('');

  // Smart Workflows state
  const [automationRules, setAutomationRules] = useState([]);
  const [workflowTriggers, setWorkflowTriggers] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState([]);

  // Rakuten API state
  const [rakutenKeyword, setRakutenKeyword] = useState('');
  const [rakutenCategory, setRakutenCategory] = useState('');
  const [rakutenMinPrice, setRakutenMinPrice] = useState('');
  const [rakutenMaxPrice, setRakutenMaxPrice] = useState('');
  const [rakutenSearchResults, setRakutenSearchResults] = useState([]);

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

  // =====================================================
  // INITIALIZE ANALYTICS AND FETCH DATA
  // =====================================================
  
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (isInitialized) return;
    
    // Initialize Google Analytics
    try {
      initGA();
      initFacebookPixel();
      trackPageView('Affiliate Marketing Dashboard');
      console.log('✅ Analytics initialized successfully');
    } catch (error) {
      console.log('⚠️ Analytics initialization skipped');
    }
    
    // Fetch initial data
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchProducts(),
          fetchGeneratedContent(),
          fetchEmailCampaigns(),
          fetchSavedUrls(),
          fetchStats(),
          fetchAnalytics()
        ]);
        console.log('✅ Initial data loaded');
      } catch (error) {
        console.log('⚠️ Some data failed to load');
      }
    };
    
    fetchAllData();
    setIsInitialized(true);
  }, [isInitialized]);

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

  // =====================================================
  // OPTIMIZED INPUT HANDLERS - PREVENT FOCUS LOSS
  // =====================================================

  const handleInputChange = useCallback((setter) => {
    return (e) => {
      setter(e.target.value);
    };
  }, []);

  // Handle URL submission from isolated component
  const handleUrlSubmission = useCallback(async ({ urls, category, priority, notes }) => {
    setUrlSaveLoading(true);
    try {
      const response = await axios.post(`${API}/saved-urls/bulk`, {
        urls: urls,
        category: category,
        priority: priority,
        notes: notes
      });
      
      toast({
        title: "Success! 🎉",
        description: `Successfully saved ${response.data.length} URLs to your queue!`,
        duration: 6000
      });
      
      // Update data WITHOUT changing tabs
      fetchSavedUrls();
      fetchStats();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to save URLs";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
      throw error; // Re-throw so the isolated component knows it failed
    } finally {
      setUrlSaveLoading(false);
    }
  }, []);

  const handleSelectChange = useCallback((setter) => {
    return (value) => {
      setter(value);
    };
  }, []);

  // Stable checkbox handlers for content types
  const handleContentTypeChange = useCallback((type) => {
    return (e) => {
      if (e.target.checked) {
        setContentTypes(prev => [...prev, type]);
      } else {
        setContentTypes(prev => prev.filter(t => t !== type));
      }
    };
  }, []);

  // Stable checkbox handlers for platforms
  const handlePlatformChange = useCallback((platform) => {
    return (e) => {
      if (e.target.checked) {
        setPlatforms(prev => [...prev, platform]);
      } else {
        setPlatforms(prev => prev.filter(p => p !== platform));
      }
    };
  }, []);

  // Stable checkbox handlers for social platforms
  const handleSocialPlatformChange = useCallback((platform) => {
    return (e) => {
      if (e.target.checked) {
        setSelectedSocialPlatforms(prev => [...prev, platform.toLowerCase()]);
      } else {
        setSelectedSocialPlatforms(prev => prev.filter(p => p !== platform.toLowerCase()));
      }
    };
  }, []);

  const fetchPriceAlerts = async () => {
    try {
      const response = await axios.get(`${API}/price-tracker/alerts`);
      setPriceAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch price alerts');
    }
  };

  const fetchAdvancedAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/advanced-analytics/dashboard`);
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Failed to fetch advanced analytics');
    }
  };

  const fetchSocialPosts = async () => {
    try {
      const response = await axios.get(`${API}/social-automation/posts`);
      setSocialPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch social posts');
    }
  };

  const fetchContentStudioItems = async () => {
    try {
      const response = await axios.get(`${API}/content-studio/items`);
      setVoiceScripts(response.data.filter(item => item.content_type === 'voice_script'));
      setVideoScripts(response.data.filter(item => item.content_type === 'video_script'));
      setPersonalizedContent(response.data.filter(item => item.content_type === 'personalized_content'));
    } catch (error) {
      console.error('Failed to fetch content studio items');
    }
  };

  const fetchCompetitorAnalysis = async () => {
    try {
      const response = await axios.get(`${API}/competitor-intel/analysis`);
      setCompetitorData(response.data);
    } catch (error) {
      console.error('Failed to fetch competitor analysis');
    }
  };

  const fetchAutomationWorkflows = async () => {
    try {
      const response = await axios.get(`${API}/smart-workflows/workflows`);
      setAutomationRules(response.data);
    } catch (error) {
      console.error('Failed to fetch automation workflows');
    }
  };

  // =====================================================
  // NEW ACTION HANDLERS FOR COMPETITIVE FEATURES
  // =====================================================

  const handleCreatePriceAlert = async (productId, threshold) => {
    try {
      await axios.post(`${API}/price-tracker/alerts`, {
        product_id: productId,
        threshold_percentage: threshold,
        alert_type: 'decrease'
      });
      
      toast({
        title: "Success! 🎯",
        description: "Price alert created successfully",
        duration: 4000
      });
      
      fetchPriceAlerts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create price alert",
        variant: "destructive"
      });
    }
  };

  const handleGenerateVoiceScript = async (productId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/content-studio/generate-voice-script`, {
        product_id: productId,
        duration: 60
      });
      
      toast({
        title: "Success! 🎙️",
        description: "Voice script generated successfully",
        duration: 4000
      });
      
      fetchContentStudioItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate voice script",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideoScript = async (productId, videoType = 'review') => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/content-studio/generate-video-script`, {
        product_id: productId,
        video_type: videoType
      });
      
      toast({
        title: "Success! 🎬",
        description: "Video script generated successfully",
        duration: 4000
      });
      
      fetchContentStudioItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate video script",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerateSocialContent = async (productId, platforms) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/social-automation/auto-generate`, {
        product_id: productId,
        platforms: platforms
      });
      
      toast({
        title: "Success! 📱",
        description: `Generated content for ${platforms.length} platforms`,
        duration: 4000
      });
      
      fetchSocialPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate social content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCompetitors = async () => {
    if (!competitorUrls.trim()) {
      toast({
        title: "Error",
        description: "Please provide competitor URLs",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const urls = competitorUrls.split('\n').filter(url => url.trim());
      const response = await axios.post(`${API}/competitor-intel/analyze`, urls);
      
      toast({
        title: "Success! 🕵️",
        description: `Analyzed ${urls.length} competitors successfully`,
        duration: 4000
      });
      
      setCompetitorUrls('');
      fetchCompetitorAnalysis();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze competitors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAllPrices = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/price-tracker/check-prices`);
      
      toast({
        title: "Success! 💰",
        description: response.data.message,
        duration: 4000
      });
      
      fetchProducts();
      fetchPriceAlerts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check prices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RAKUTEN API HANDLERS
  // =====================================================

  const handleSearchRakutenProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rakutenKeyword) params.append('keyword', rakutenKeyword);
      if (rakutenCategory) params.append('category', rakutenCategory);
      if (rakutenMinPrice) params.append('min_price', rakutenMinPrice);
      if (rakutenMaxPrice) params.append('max_price', rakutenMaxPrice);
      params.append('limit', '20');

      const response = await axios.get(`${API}/rakuten/products/search?${params.toString()}`);
      
      setRakutenSearchResults(response.data.results?.products || []);
      
      toast({
        title: "Success! 🔍",
        description: `Found ${response.data.results?.products?.length || 0} products from Rakuten`,
        duration: 4000
      });
      
    } catch (error) {
      toast({
        title: "Search Failed",
        description: error.response?.data?.detail || "Failed to search Rakuten products",
        variant: "destructive"
      });
      setRakutenSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImportRakutenProducts = async () => {
    if (!rakutenKeyword) {
      toast({
        title: "Error",
        description: "Please enter a keyword to import products",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/rakuten/products/import`, {
        keyword: rakutenKeyword,
        category: rakutenCategory || 'general',
        limit: 20
      });
      
      toast({
        title: "Success! 🚀",
        description: `Imported ${response.data.imported_count} products from Rakuten!`,
        duration: 6000
      });
      
      // Refresh products list
      fetchProducts();
      
      // Clear search
      setRakutenKeyword('');
      setRakutenCategory('');
      setRakutenMinPrice('');
      setRakutenMaxPrice('');
      setRakutenSearchResults([]);
      
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error.response?.data?.detail || "Failed to import Rakuten products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

    setUrlSaveLoading(true);
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
      setUrlSaveLoading(false);
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

    setScrapeLoading(true);
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
      setScrapeLoading(false);
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
      
      // Track content generation
      contentTypes.forEach(type => {
        trackContentGeneration(type, selectedProduct?.name || 'Unknown Product');
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
      
      // Track email campaign
      const recipientCount = recipients.length;
      trackEmailCampaign(emailSubject, recipientCount);
      
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
          <TabsList className="flex w-full bg-white shadow-lg rounded-xl p-2 overflow-x-auto space-x-1">
            <TabsTrigger value="url-manager" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Bookmark className="h-3 w-3" />
              URLs
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Package className="h-3 w-3" />
              Products
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <FileText className="h-3 w-3" />
              Content
            </TabsTrigger>
            <TabsTrigger value="scraper" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Search className="h-3 w-3" />
              Scraper
            </TabsTrigger>
            <TabsTrigger value="rakuten" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Zap className="h-3 w-3" />
              Rakuten
            </TabsTrigger>
            <TabsTrigger value="price-tracker" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <DollarSign className="h-3 w-3" />
              Prices
            </TabsTrigger>
            <TabsTrigger value="advanced-analytics" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <LineChart className="h-3 w-3" />
              Analytics+
            </TabsTrigger>
            <TabsTrigger value="social-automation" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Share2 className="h-3 w-3" />
              Social
            </TabsTrigger>
            <TabsTrigger value="content-studio" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Camera className="h-3 w-3" />
              Studio
            </TabsTrigger>
            <TabsTrigger value="competitor-intel" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Radar className="h-3 w-3" />
              Intel
            </TabsTrigger>
            <TabsTrigger value="smart-workflows" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Workflow className="h-3 w-3" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="scheduler" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Clock className="h-3 w-3" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <Mail className="h-3 w-3" />
              Email
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1 rounded-lg text-xs whitespace-nowrap">
              <BarChart3 className="h-3 w-3" />
              Stats
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
                      disabled={scrapeLoading || !savedUrls.some(url => url.selected && !url.scraped)}
                      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                    >
                      {scrapeLoading ? (
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
                  {/* Add URLs Section - ISOLATED COMPONENT */}
                  <IsolatedUrlInput
                    onUrlsSubmit={handleUrlSubmission}
                    placeholder="https://www.amazon.com/product/...
https://www.bestbuy.com/site/...
https://www.newegg.com/...

Paste as many URLs as you want! No limits - 50, 100, 500+ URLs supported!"
                    rows={6}
                  />
                  
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
                                  onClick={() => {
                                    trackProductClick(product);
                                    trackConversion(product, product.price);
                                    window.open(product.affiliate_url, '_blank');
                                  }}
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
                                                onChange={handleContentTypeChange(type.value)}
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
                                                  onChange={handlePlatformChange(platform)}
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
                                              onChange={handleInputChange(setComparisonProducts)}
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
                                              onChange={handleInputChange(setTutorialFocus)}
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
                      <FocusSafeTextarea
                        placeholder="https://www.amazon.com/product/...
https://www.bestbuy.com/site/...
https://www.newegg.com/..."
                        value={scrapeUrls}
                        onChange={handleInputChange(setScrapeUrls)}
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
                      <FocusSafeInput
                        placeholder="Amazing deals on tech products!"
                        value={emailSubject}
                        onChange={handleInputChange(setEmailSubject)}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Content</label>
                      <FocusSafeTextarea
                        placeholder="Your email content here..."
                        value={emailContent}
                        onChange={handleInputChange(setEmailContent)}
                        rows={8}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Recipients (comma-separated)</label>
                      <FocusSafeTextarea
                        placeholder="user1@example.com, user2@example.com"
                        value={emailRecipients}
                        onChange={handleInputChange(setEmailRecipients)}
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

          {/* PRICE TRACKER TAB */}
          <TabsContent value="price-tracker" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  AI-Powered Price Tracker & Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Price Monitoring</h3>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Global Alert Threshold (%)</label>
                      <Input
                        type="number"
                        placeholder="10"
                        value={alertThreshold}
                        onChange={handleInputChange(setAlertThreshold)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tracking Interval</label>
                      <Select value={trackingInterval} onValueChange={setTrackingInterval}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Every Hour</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleCheckAllPrices}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600"
                    >
                      {loading ? (
                        <>
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Checking Prices...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Check All Product Prices
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Active Price Alerts ({priceAlerts.length})</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {priceAlerts.length > 0 ? (
                        priceAlerts.map((alert) => (
                          <Card key={alert.id} className="border">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">Product Alert</p>
                                  <p className="text-xs text-gray-600">
                                    {alert.threshold_percentage}% threshold
                                  </p>
                                </div>
                                <Badge variant={alert.is_active ? "default" : "secondary"}>
                                  {alert.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No price alerts set up yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold text-lg mb-4">Recent Price Changes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Price Drops</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{trackedPrices.filter(p => p.change < 0).length}</p>
                      <p className="text-xs text-green-600">Last 24 hours</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">Price Increases</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600">{trackedPrices.filter(p => p.change > 0).length}</p>
                      <p className="text-xs text-orange-600">Last 24 hours</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Monitoring</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{products.length}</p>
                      <p className="text-xs text-blue-600">Total products</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ADVANCED ANALYTICS TAB */}
          <TabsContent value="advanced-analytics" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Advanced Analytics & Performance Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-xs font-medium">Conversion Rate</p>
                          <p className="text-2xl font-bold">{performanceData.conversion_rate || 23.4}%</p>
                        </div>
                        <TrendingUp className="h-6 w-6 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-xs font-medium">Revenue/Month</p>
                          <p className="text-2xl font-bold">${performanceData.revenue || 2847}</p>
                        </div>
                        <DollarSign className="h-6 w-6 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-xs font-medium">ROI</p>
                          <p className="text-2xl font-bold">{performanceData.roi_percentage || 347}%</p>
                        </div>
                        <Activity className="h-6 w-6 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border">
                    <CardHeader>
                      <h3 className="font-semibold">Top Performing Products</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {performanceData.top_products ? performanceData.top_products.map((product, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-gray-600">{product.content_pieces} content pieces</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-green-600">${product.estimated_revenue}</p>
                              <p className="text-xs text-gray-500">Est. revenue</p>
                            </div>
                          </div>
                        )) : (
                          <div className="text-center py-4">
                            <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Loading performance data...</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border">
                    <CardHeader>
                      <h3 className="font-semibold">Traffic Sources</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {performanceData.traffic_sources ? Object.entries(performanceData.traffic_sources).map(([source, percentage]) => (
                          <div key={source} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                source === 'organic' ? 'bg-green-500' :
                                source === 'social' ? 'bg-blue-500' :
                                source === 'email' ? 'bg-purple-500' : 'bg-gray-500'
                              }`}></div>
                              <span className="capitalize font-medium">{source}</span>
                            </div>
                            <span className="font-bold">{percentage}%</span>
                          </div>
                        )) : (
                          <div className="text-center py-4">
                            <PieChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Loading traffic data...</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border mt-6">
                  <CardHeader>
                    <h3 className="font-semibold">Conversion Funnel</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {performanceData.conversion_funnel ? Object.entries(performanceData.conversion_funnel).map(([stage, count]) => (
                        <div key={stage} className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-indigo-600">{count.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 capitalize">{stage.replace('_', ' ')}</p>
                        </div>
                      )) : (
                        <div className="col-span-4 text-center py-8">
                          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Loading funnel data...</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOCIAL AUTOMATION TAB */}
          <TabsContent value="social-automation" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Social Media Automation Suite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Platform Selection</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Twitter', 'Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'YouTube'].map((platform) => (
                        <label key={platform} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedSocialPlatforms.includes(platform.toLowerCase())}
                            onChange={handleSocialPlatformChange(platform)}
                            className="rounded"
                          />
                          <span className="text-sm">{platform}</span>
                        </label>
                      ))}
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                      <Bot className="h-4 w-4 mr-2" />
                      Auto-Schedule Posts
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Hashtag Strategy</h3>
                    <Textarea
                      placeholder="Enter your hashtag strategy or let AI optimize them automatically..."
                      value={hashtagStrategy}
                      onChange={handleInputChange(setHashtagStrategy)}
                      rows={6}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTENT STUDIO TAB */}
          <TabsContent value="content-studio" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Advanced Content Studio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="border hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <Headphones className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">Voice Scripts ({voiceScripts.length})</h3>
                          <p className="text-sm text-gray-600">AI-generated podcast and voice-over scripts</p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Generate Voice Script</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Select Product</label>
                          <Select value={selectedProduct?.id || ''} onValueChange={(value) => {
                            const product = products.find(p => p.id === value);
                            setSelectedProduct(product);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ${product.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => selectedProduct && handleGenerateVoiceScript(selectedProduct.id)}
                          disabled={loading || !selectedProduct}
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
                        >
                          {loading ? (
                            <>
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                              Generating Script...
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-2" />
                              Generate Voice Script
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Card className="border hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                          <Play className="h-12 w-12 text-red-600 mx-auto mb-4" />
                          <h3 className="font-semibold mb-2">Video Scripts ({videoScripts.length})</h3>
                          <p className="text-sm text-gray-600">YouTube, TikTok, and marketing video scripts</p>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Generate Video Script</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Select Product</label>
                          <Select value={selectedProduct?.id || ''} onValueChange={(value) => {
                            const product = products.find(p => p.id === value);
                            setSelectedProduct(product);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - ${product.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Video Type</label>
                          <Select defaultValue="review">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="review">Product Review</SelectItem>
                              <SelectItem value="unboxing">Unboxing</SelectItem>
                              <SelectItem value="tutorial">Tutorial</SelectItem>
                              <SelectItem value="comparison">Comparison</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => selectedProduct && handleGenerateVideoScript(selectedProduct.id, 'review')}
                          disabled={loading || !selectedProduct}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-600"
                        >
                          {loading ? (
                            <>
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                              Generating Script...
                            </>
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-2" />
                              Generate Video Script
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Card className="border hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Personalization ({personalizedContent.length})</h3>
                      <p className="text-sm text-gray-600">Audience-targeted content generation</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Generated Content Display */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Generated Content</h3>
                  
                  {[...voiceScripts, ...videoScripts, ...personalizedContent].length > 0 ? (
                    <div className="space-y-4">
                      {[...voiceScripts, ...videoScripts, ...personalizedContent].map((item) => (
                        <Card key={item.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100">
                                  {item.content_type === 'voice_script' && <Headphones className="h-4 w-4 text-purple-600" />}
                                  {item.content_type === 'video_script' && <Play className="h-4 w-4 text-red-600" />}
                                  {item.content_type === 'personalized_content' && <Users className="h-4 w-4 text-green-600" />}
                                </div>
                                <div>
                                  <h4 className="font-semibold">{item.title}</h4>
                                  <p className="text-sm text-gray-600 capitalize">
                                    {item.content_type.replace('_', ' ')}
                                    {item.duration && ` • ${item.duration}s`}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(item.content)}
                                className="hover:bg-indigo-50"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">No content generated yet</p>
                      <p className="text-sm text-gray-400">Click on the cards above to generate voice or video scripts!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COMPETITOR INTEL TAB */}
          <TabsContent value="competitor-intel" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radar className="h-5 w-5" />
                  Competitor Intelligence & Market Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Competitor URLs (one per line)</label>
                    <Textarea
                      placeholder="https://competitor1.com
https://competitor2.com/products
https://affiliate-site.com"
                      value={competitorUrls}
                      onChange={handleInputChange(setCompetitorUrls)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button className="w-full bg-gradient-to-r from-red-500 to-orange-600">
                    <Radar className="h-4 w-4 mr-2" />
                    Analyze Competitors
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Market Gaps Found: 23</h4>
                      <p className="text-sm text-gray-600">Opportunities in untapped product categories</p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Price Advantages: 15</h4>
                      <p className="text-sm text-gray-600">Products where you can compete on pricing</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SMART WORKFLOWS TAB */}
          <TabsContent value="smart-workflows" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Smart Automation Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="border-0 bg-gradient-to-br from-green-100 to-emerald-100 hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-200 rounded-lg">
                            <DollarSign className="h-4 w-4 text-green-700" />
                          </div>
                          <h4 className="font-semibold">Price Drop Alert</h4>
                        </div>
                        <p className="text-sm text-gray-600">Auto-generate content when prices drop by 15%+</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-blue-100 to-indigo-100 hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-200 rounded-lg">
                            <Sparkles className="h-4 w-4 text-blue-700" />
                          </div>
                          <h4 className="font-semibold">New Product</h4>
                        </div>
                        <p className="text-sm text-gray-600">Auto-create content for newly scraped products</p>
                      </CardContent>
                    </Card>
                    <Card className="border-0 bg-gradient-to-br from-purple-100 to-pink-100 hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-purple-200 rounded-lg">
                            <Share2 className="h-4 w-4 text-purple-700" />
                          </div>
                          <h4 className="font-semibold">Social Blast</h4>
                        </div>
                        <p className="text-sm text-gray-600">Auto-post to all platforms when content is created</p>
                      </CardContent>
                    </Card>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600">
                    <Settings className="h-4 w-4 mr-2" />
                    Create Custom Workflow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RAKUTEN INTEGRATION TAB */}
          <TabsContent value="rakuten" className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Rakuten Advertising API - Live Product Import
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-800 mb-2">🚀 Live Affiliate Product Import</h3>
                    <p className="text-sm text-orange-700">
                      Your Rakuten credentials are configured! Search and import thousands of real affiliate products directly from Rakuten's network.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Search Products</h3>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Keyword</label>
                        <PureInput
                          placeholder="laptop, smartphone, headphones..."
                          defaultValue={rakutenKeyword}
                          onValueChange={handleInputChange(setRakutenKeyword)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Category</label>
                        <Select value={rakutenCategory} onValueChange={setRakutenCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="electronics">Electronics</SelectItem>
                            <SelectItem value="computers">Computers</SelectItem>
                            <SelectItem value="smartphones">Smartphones</SelectItem>
                            <SelectItem value="gaming">Gaming</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                            <SelectItem value="software">Software</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Min Price ($)</label>
                            <FocusSafeInput
                            type="number"
                            placeholder="0"
                            value={rakutenMinPrice}
                            onChange={handleInputChange(setRakutenMinPrice)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Max Price ($)</label>
                          <FocusSafeInput
                            type="number"
                            placeholder="1000"
                            value={rakutenMaxPrice}
                            onChange={handleInputChange(setRakutenMaxPrice)}
                          />
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleSearchRakutenProducts}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Searching Rakuten...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Search Products
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleImportRakutenProducts}
                        disabled={loading || !rakutenKeyword}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Import Products to Database
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">API Status</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Network className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-800">Connection Status</span>
                          </div>
                          <p className="text-sm text-blue-600">
                            Client ID: rH71tRTK...CguM ✓<br />
                            Ready to connect to Rakuten API
                          </p>
                        </div>
                        
                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">Benefits</span>
                          </div>
                          <ul className="text-sm text-green-600 space-y-1">
                            <li>• Access to thousands of affiliate products</li>
                            <li>• Real-time pricing and availability</li>
                            <li>• Automatic commission tracking</li>
                            <li>• High-converting product data</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {rakutenSearchResults && rakutenSearchResults.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Search Results ({rakutenSearchResults.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rakutenSearchResults.map((product, index) => (
                          <Card key={index} className="border hover:shadow-lg transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <h4 className="font-semibold text-sm line-clamp-2">{product.name || 'Rakuten Product'}</h4>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-green-600">${product.price || 'N/A'}</span>
                                  <Badge variant="secondary">Rakuten</Badge>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{product.description || 'Product from Rakuten network'}</p>
                                <Button size="sm" className="w-full">
                                  <Plus className="h-3 w-3 mr-1" />
                                  Import
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
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