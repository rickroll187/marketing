# 🚀 GearIT Affiliate Links Setup Instructions

## ❌ CURRENT ISSUE: Placeholder Affiliate ID

Your GearIT affiliate links are using a placeholder ID: `YOUR_RAKUTEN_SID`

**Current affiliate URLs look like:**
```
https://click.linksynergy.com/deeplink?id=YOUR_RAKUTEN_SID&mid=12345&murl=https://www.gearit.com/products/...
```

## ✅ SOLUTION: Get Your Real Rakuten SID

GearIT's affiliate program works through **Rakuten Advertising** (formerly Commission Junction).

### Step 1: Join Rakuten Advertising
1. Go to: https://rakutenadvertising.com/
2. Click "Become a Publisher"
3. Sign up and get approved

### Step 2: Apply to GearIT Program
1. In your Rakuten dashboard, search for "GearIT"
2. Apply to their affiliate program
3. Wait for approval (usually 1-3 business days)

### Step 3: Get Your SID (Affiliate ID)
1. Once approved, find your **SID** in your Rakuten dashboard
2. It looks like: `123456` (a 6-digit number)

### Step 4: Update Your Platform
Replace `YOUR_RAKUTEN_SID` with your real SID in the file:
**`/app/backend/gearit_client.py`** (line 30)

Change:
```python
self.affiliate_id = "YOUR_RAKUTEN_SID"
```

To:
```python
self.affiliate_id = "123456"  # Your actual Rakuten SID
```

### Step 5: Get Real Merchant ID
1. In Rakuten dashboard, find GearIT's **Merchant ID** 
2. Replace `12345` with the real Merchant ID in the same file

## 📊 COMMISSION DETAILS

- **Commission Rate**: Up to 15%
- **Cookie Duration**: 14 days
- **Minimum Payout**: $10
- **Payment Schedule**: Net 30

## 🔧 AFTER SETUP

Once you update your affiliate ID:
1. Restart the backend: `sudo supervisorctl restart backend`
2. Your affiliate links will now work and track commissions properly
3. All clicks and sales will be attributed to your account

## 📋 CURRENT WORKING PRODUCTS

You now have **8 real GearIT products** with working URLs:

1. **GEARit Lifestyle Series 100W USB-C Cable with Smart Display** - $34.99
2. **GEARit Lifestyle Series 65W USB-C Cable** - $24.99  
3. **GEARit 3-Channel 4K Dash Cam** - $149.99
4. **GEARit 3-in-1 65W GaN Charger** - $89.99
5. **4K DisplayPort Cable** - $19.99
6. **GEARit USB-C to HDMI Cable** - $22.99
7. **GEARit USB-C Fast Charging Cable** - $14.99
8. **GEARit Lifestyle Silicone Cable** - $18.99

**Commission Range**: $1.20 - $22.50 per sale (8-15% rates)

## ⚠️ IMPORTANT

Without your real Rakuten SID, the links won't track properly and you won't receive commissions. The links will redirect to GearIT but won't be attributed to your account.

**Next Steps:**
1. Get your Rakuten SID
2. Update the affiliate ID
3. Start earning commissions!