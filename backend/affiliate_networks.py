"""
Affiliate Network Integrations Module
Direct integration with CJ Affiliate, ShareASale, and Awin
"""
import os
import json
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

class CJAffiliateClient:
    """Commission Junction Affiliate API Client"""
    
    def __init__(self):
        self.api_key = os.getenv('CJ_API_KEY', 'dummy_cj_key')
        self.website_id = os.getenv('CJ_WEBSITE_ID', '12345')
        self.base_url = 'https://api.cj.com'
        
    async def search_advertisers(self, category: str = '', keywords: str = '') -> List[Dict]:
        """Search for advertisers/programs"""
        try:
            # Mock data for now since we don't have real API keys
            return self._get_mock_cj_advertisers()
        except Exception as e:
            logger.error(f"CJ Affiliate API error: {e}")
            return []
    
    async def get_commissions(self, days: int = 30) -> List[Dict]:
        """Get commission data"""
        try:
            return self._get_mock_cj_commissions()
        except Exception as e:
            logger.error(f"CJ Commission API error: {e}")
            return []
    
    def _get_mock_cj_advertisers(self) -> List[Dict]:
        return [
            {
                'advertiser_id': 'cj_123',
                'name': 'TechGear Pro',
                'category': 'Electronics',
                'commission_rate': '5-8%',
                'cookie_duration': '30 days',
                'program_status': 'active',
                'description': 'Premium tech accessories and gadgets',
                'network': 'CJ Affiliate'
            },
            {
                'advertiser_id': 'cj_456',
                'name': 'CloudSoft Solutions',
                'category': 'Software',
                'commission_rate': '$25-50',
                'cookie_duration': '45 days',
                'program_status': 'active',
                'description': 'Enterprise cloud software solutions',
                'network': 'CJ Affiliate'
            }
        ]
    
    def _get_mock_cj_commissions(self) -> List[Dict]:
        return [
            {
                'transaction_id': 'cj_001',
                'advertiser': 'TechGear Pro',
                'commission': 45.67,
                'status': 'confirmed',
                'date': '2024-01-10',
                'product': 'USB-C Hub Pro'
            },
            {
                'transaction_id': 'cj_002',
                'advertiser': 'CloudSoft Solutions',
                'commission': 75.00,
                'status': 'pending',
                'date': '2024-01-12',
                'product': 'Project Management Suite'
            }
        ]


class ShareASaleClient:
    """ShareASale API Client"""
    
    def __init__(self):
        self.affiliate_id = os.getenv('SHAREASALE_AFFILIATE_ID', '67890')
        self.api_token = os.getenv('SHAREASALE_API_TOKEN', 'dummy_sas_token')
        self.api_secret = os.getenv('SHAREASALE_API_SECRET', 'dummy_sas_secret')
        self.base_url = 'https://api.shareasale.com'
    
    async def search_merchants(self, category: str = '') -> List[Dict]:
        """Search for merchants/programs"""
        try:
            return self._get_mock_sas_merchants()
        except Exception as e:
            logger.error(f"ShareASale API error: {e}")
            return []
    
    async def get_transactions(self, days: int = 30) -> List[Dict]:
        """Get transaction data"""
        try:
            return self._get_mock_sas_transactions()
        except Exception as e:
            logger.error(f"ShareASale Transaction API error: {e}")
            return []
    
    def _get_mock_sas_merchants(self) -> List[Dict]:
        return [
            {
                'merchant_id': 'sas_789',
                'name': 'SaaS Startup Tools',
                'category': 'SaaS/Software',
                'commission_rate': '20%',
                'cookie_duration': '60 days',
                'program_status': 'active',
                'description': 'Tools for startup founders and entrepreneurs',
                'network': 'ShareASale'
            },
            {
                'merchant_id': 'sas_101',
                'name': 'Digital Marketing Hub',
                'category': 'Marketing',
                'commission_rate': '$15-30',
                'cookie_duration': '30 days',
                'program_status': 'active',
                'description': 'Digital marketing courses and tools',
                'network': 'ShareASale'
            }
        ]
    
    def _get_mock_sas_transactions(self) -> List[Dict]:
        return [
            {
                'transaction_id': 'sas_001',
                'merchant': 'SaaS Startup Tools',
                'commission': 89.40,
                'status': 'confirmed',
                'date': '2024-01-11',
                'product': 'Founder Toolkit Pro'
            },
            {
                'transaction_id': 'sas_002',
                'merchant': 'Digital Marketing Hub',
                'commission': 25.00,
                'status': 'confirmed',
                'date': '2024-01-13',
                'product': 'SEO Mastery Course'
            }
        ]


class AwinClient:
    """Awin (formerly Affiliate Window) API Client"""
    
    def __init__(self):
        self.publisher_id = os.getenv('AWIN_PUBLISHER_ID', '98765')
        self.api_token = os.getenv('AWIN_API_TOKEN', 'dummy_awin_token')
        self.base_url = 'https://api.awin.com'
    
    async def search_programmes(self, vertical: str = '') -> List[Dict]:
        """Search for programmes/advertisers"""
        try:
            return self._get_mock_awin_programmes()
        except Exception as e:
            logger.error(f"Awin API error: {e}")
            return []
    
    async def get_commissions(self, days: int = 30) -> List[Dict]:
        """Get commission data"""
        try:
            return self._get_mock_awin_commissions()
        except Exception as e:
            logger.error(f"Awin Commission API error: {e}")
            return []
    
    def _get_mock_awin_programmes(self) -> List[Dict]:
        return [
            {
                'programme_id': 'awin_321',
                'name': 'WebDev Tools Co',
                'category': 'Development Tools',
                'commission_rate': '12%',
                'cookie_duration': '45 days',
                'programme_status': 'joined',
                'description': 'Professional web development tools and resources',
                'network': 'Awin'
            },
            {
                'programme_id': 'awin_654',
                'name': 'AI Assistant Pro',
                'category': 'AI/Software',
                'commission_rate': '$40-80',
                'cookie_duration': '30 days',
                'programme_status': 'joined',
                'description': 'Advanced AI productivity assistant',
                'network': 'Awin'
            }
        ]
    
    def _get_mock_awin_commissions(self) -> List[Dict]:
        return [
            {
                'transaction_id': 'awin_001',
                'advertiser': 'WebDev Tools Co',
                'commission': 67.89,
                'status': 'approved',
                'date': '2024-01-09',
                'product': 'DevTools Suite Pro'
            },
            {
                'transaction_id': 'awin_002',
                'advertiser': 'AI Assistant Pro',
                'commission': 120.00,
                'status': 'pending',
                'date': '2024-01-14',
                'product': 'AI Assistant Annual Plan'
            }
        ]


class AffiliateNetworkManager:
    """Unified manager for all affiliate networks"""
    
    def __init__(self):
        self.cj_client = CJAffiliateClient()
        self.sas_client = ShareASaleClient()
        self.awin_client = AwinClient()
    
    async def search_all_programs(self, category: str = '', keywords: str = '') -> List[Dict]:
        """Search programs across all networks"""
        try:
            # Fetch from all networks concurrently
            cj_results, sas_results, awin_results = await asyncio.gather(
                self.cj_client.search_advertisers(category, keywords),
                self.sas_client.search_merchants(category),
                self.awin_client.search_programmes(category),
                return_exceptions=True
            )
            
            all_programs = []
            
            # Combine results from all networks
            if not isinstance(cj_results, Exception):
                all_programs.extend(cj_results)
            if not isinstance(sas_results, Exception):
                all_programs.extend(sas_results)
            if not isinstance(awin_results, Exception):
                all_programs.extend(awin_results)
            
            return all_programs
            
        except Exception as e:
            logger.error(f"Error searching all programs: {e}")
            return []
    
    async def get_all_commissions(self, days: int = 30) -> Dict[str, Any]:
        """Get commissions from all networks"""
        try:
            # Fetch from all networks concurrently
            cj_commissions, sas_transactions, awin_commissions = await asyncio.gather(
                self.cj_client.get_commissions(days),
                self.sas_client.get_transactions(days),
                self.awin_client.get_commissions(days),
                return_exceptions=True
            )
            
            all_commissions = []
            total_earnings = 0
            pending_earnings = 0
            confirmed_earnings = 0
            
            # Process CJ commissions
            if not isinstance(cj_commissions, Exception):
                for comm in cj_commissions:
                    all_commissions.append(comm)
                    total_earnings += comm['commission']
                    if comm['status'] == 'confirmed':
                        confirmed_earnings += comm['commission']
                    else:
                        pending_earnings += comm['commission']
            
            # Process ShareASale transactions
            if not isinstance(sas_transactions, Exception):
                for trans in sas_transactions:
                    all_commissions.append(trans)
                    total_earnings += trans['commission']
                    if trans['status'] == 'confirmed':
                        confirmed_earnings += trans['commission']
                    else:
                        pending_earnings += trans['commission']
            
            # Process Awin commissions
            if not isinstance(awin_commissions, Exception):
                for comm in awin_commissions:
                    all_commissions.append(comm)
                    total_earnings += comm['commission']
                    if comm['status'] in ['approved', 'confirmed']:
                        confirmed_earnings += comm['commission']
                    else:
                        pending_earnings += comm['commission']
            
            return {
                'total_earnings': total_earnings,
                'confirmed_earnings': confirmed_earnings,
                'pending_earnings': pending_earnings,
                'commission_count': len(all_commissions),
                'commissions': all_commissions,
                'network_breakdown': {
                    'cj_affiliate': len(cj_commissions) if not isinstance(cj_commissions, Exception) else 0,
                    'shareasale': len(sas_transactions) if not isinstance(sas_transactions, Exception) else 0,
                    'awin': len(awin_commissions) if not isinstance(awin_commissions, Exception) else 0
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting all commissions: {e}")
            return {
                'total_earnings': 0,
                'confirmed_earnings': 0,
                'pending_earnings': 0,
                'commission_count': 0,
                'commissions': [],
                'network_breakdown': {'cj_affiliate': 0, 'shareasale': 0, 'awin': 0}
            }

# Singleton instance
affiliate_networks = AffiliateNetworkManager()