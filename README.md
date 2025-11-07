# 🚀 QuickLinks - Complete SaaS URL Shortener

A production-ready URL shortening platform with:
- ✅ User authentication & authorization
- ✅ 30-day free trial system
- ✅ Stripe payment integration
- ✅ Admin dashboard with full analytics
- ✅ User dashboard
- ✅ Click tracking & analytics
- ✅ Secure session management

## 🎯 Features

### For Users:
- Sign up with 30-day free trial (no credit card)
- Create shortened URLs
- Track clicks and analytics
- View all their links in dashboard
- Upgrade to Pro for unlimited links

### For Admin (You):
- Complete overview dashboard
- See all users and their activity
- Track total revenue (MRR/ARR)
- View all URLs created
- Change user plans
- Real-time statistics

## 📦 What's Included

```
quicklinks-complete/
├── server.js              # Backend with auth & API
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── public/
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── signup.html        # Signup page (30-day trial)
│   ├── dashboard.html     # User dashboard
│   ├── admin.html         # Admin dashboard
│   └── css/
│       └── auth.css       # Authentication styling
└── README.md              # This file
```

## 🚀 Quick Start (Local Testing)

### 1. Upload to GitHub

1. Go to GitHub.com and create new repository: `quicklinks`
2. Upload all files from this folder
3. Make sure folder structure is preserved

### 2. Deploy to Railway

1. Go to railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `quicklinks` repository
4. Click "Deploy"
5. Wait 2-3 minutes for deployment

### 3. Get Your URL

1. Click "Settings" → "Domains" → "Generate Domain"
2. You'll get: `your-app.up.railway.app`
3. **This is your live site!**

### 4. Add Environment Variables

In Railway, go to "Variables" tab and add:

```
PORT=3000
SESSION_SECRET=your-random-secret-key-here
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
BASE_URL=https://your-app.up.railway.app
```

**Important:** Change the admin email and password!

### 5. Access Your App

- **Landing Page:** https://your-app.up.railway.app
- **Admin Dashboard:** https://your-app.up.railway.app/admin
- **Admin Login:**
  - Email: (what you set in env variables)
  - Password: (what you set in env variables)

## 👑 Admin Access

### First Time Login:

1. Go to: `https://your-app.up.railway.app/login`
2. Use credentials from your environment variables
3. You'll be redirected to the admin dashboard
4. **CHANGE YOUR PASSWORD IMMEDIATELY!**

### Admin Dashboard Features:

- **Revenue Tracking:**
  - Monthly Recurring Revenue (MRR)
  - Annual Run Rate (ARR)
  - Conversion rate tracking
  - Revenue projections

- **User Management:**
  - See all users
  - View user activity
  - Change user plans manually
  - Track trial status

- **Analytics:**
  - Total URLs created
  - Total clicks
  - New users today
  - Growth metrics

## 💳 Setting Up Stripe Payments

### 1. Create Stripe Account

1. Go to: https://stripe.com
2. Sign up (free)
3. Complete verification

### 2. Get API Keys

1. Go to Stripe Dashboard
2. Click "Developers" → "API keys"
3. Copy:
   - **Secret key** (starts with `sk_test_`)
   - **Publishable key** (starts with `pk_test_`)

### 3. Create Products

In Stripe Dashboard:

**Product 1: Pro Plan**
- Name: QuickLinks Pro
- Price: $9.00 USD
- Billing: Monthly recurring
- Copy the **Price ID** (starts with `price_`)

**Product 2: Business Plan**
- Name: QuickLinks Business
- Price: $29.00 USD
- Billing: Monthly recurring
- Copy the **Price ID**

### 4. Add to Railway

In Railway "Variables", add:

```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_PRO_PRICE_ID=price_xxxxx
STRIPE_BUSINESS_PRICE_ID=price_xxxxx
```

### 5. Test Payments

Use Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

## 📊 How It Works

### User Flow:

1. **Sign Up** → Gets 30-day free trial automatically
2. **Create Links** → Limited to 3 URLs on free plan
3. **Trial Expires** → Gets prompted to upgrade
4. **Pays $9/month** → Gets unlimited URLs (Pro plan)

### Revenue Flow:

```
500 Free Users
    ↓
10% Convert to Pro (industry average)
    ↓
50 Paying Users × $9/month
    ↓
$450 Monthly Recurring Revenue
    ↓
$5,400 Annual Run Rate
```

## 🔒 Security Features

- ✅ Password hashing (bcrypt)
- ✅ Session management
- ✅ Rate limiting on API
- ✅ SQL injection protection
- ✅ XSS protection (Helmet)
- ✅ HTTPS enforcement (production)
- ✅ Secure cookies

## 📈 Monitoring Your Business

### Key Metrics to Track Weekly:

1. **MRR (Monthly Recurring Revenue)**
   - Target: $500/month by month 6

2. **User Growth**
   - Target: 100 new users/month

3. **Conversion Rate**
   - Target: 10% (free → paid)

4. **Churn Rate**
   - Target: <5%

### In Admin Dashboard:

- Total Users
- Paid vs Free Users
- Total URLs Created
- Total Clicks
- Revenue (current & projected)
- New Users Today
- Conversion Rate

## 🎯 Customization

### Change Pricing:

Edit in multiple places:
1. `public/index.html` - Landing page pricing
2. `public/dashboard.html` - Dashboard upgrade prompts
3. Stripe dashboard - Actual prices

### Change Trial Length:

In `server.js`, find:
```javascript
const trialEnds = new Date();
trialEnds.setDate(trialEnds.getDate() + 30); // Change 30 to your number
```

### Change Free URL Limit:

In `server.js`, find:
```javascript
if (user.plan === 'free' && result.count >= 3) // Change 3 to your limit
```

## 🐛 Troubleshooting

### "Cannot connect to database"
- Database is created automatically
- Check if Railway has write permissions
- Database file: `quicklinks.db`

### "Admin login not working"
- Check environment variables are set
- Make sure SESSION_SECRET is set
- Clear browser cookies

### "Users can't sign up"
- Check server logs in Railway
- Verify database is writable
- Check rate limiting settings

### "Payments not working"
- Verify Stripe keys are correct (test vs live)
- Check Stripe dashboard for errors
- Make sure webhook is configured

## 📚 API Endpoints

### Authentication:
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### URLs (Authenticated):
- `POST /api/shorten` - Create short URL
- `GET /api/urls` - Get user's URLs
- `DELETE /api/urls/:id` - Delete URL

### Admin (Admin Only):
- `GET /api/admin/stats` - Get statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/urls` - Get all URLs
- `PUT /api/admin/users/:id/plan` - Update user plan

### Public:
- `GET /:shortCode` - Redirect to long URL

## 🚀 Going Live

### Before Launch:

1. ✅ Change admin password
2. ✅ Set strong SESSION_SECRET
3. ✅ Switch Stripe to live mode
4. ✅ Add custom domain
5. ✅ Set up SSL (automatic on Railway)
6. ✅ Test all functionality
7. ✅ Create Terms of Service
8. ✅ Create Privacy Policy

### Marketing Checklist:

- [ ] Launch on Product Hunt
- [ ] Post on Reddit (r/SideProject)
- [ ] Share on Twitter/LinkedIn
- [ ] Write blog post
- [ ] Set up Google Analytics
- [ ] Create email sequences
- [ ] Add live chat support

## 💰 Pricing Strategy

### Current Setup:
- **Free:** 30-day trial, 3 URLs
- **Pro:** $9/month, unlimited
- **Business:** $29/month, custom domain + API

### Optimization Tips:

1. **Trial Length:** 30 days is ideal for this type of service
2. **Free Limit:** 3 URLs creates urgency without being stingy
3. **Pro Price:** $9 is sweet spot (affordable, valuable)
4. **Business Price:** 3x Pro = standard B2B pricing

## 🎓 Understanding Your Admin Dashboard

### Revenue Tab:
- **MRR:** Monthly recurring revenue (paid users × $9)
- **ARR:** Annual run rate (MRR × 12)
- **Conversion Rate:** % of free users who upgrade
- **Projected Revenue:** What you'll make if 10% convert

### Users Tab:
- See all users, their activity, and plans
- Manually change plans (for customer service)
- Track when they joined and last logged in
- See their usage (URLs created, clicks)

### URLs Tab:
- All shortened URLs in the system
- See which users are most active
- Track total clicks across platform

## 📞 Support

### For Your Users:
- Add a support email in footer
- Create FAQ page
- Use Tawk.to for free live chat

### For You:
- Check server logs in Railway
- Monitor Stripe dashboard for payment issues
- Track metrics in admin dashboard

## 🎉 You're Ready!

You now have a complete, production-ready SaaS business!

### Next Steps:

1. Deploy to Railway (15 minutes)
2. Set up admin account (5 minutes)
3. Add Stripe payments (15 minutes)
4. Test everything (10 minutes)
5. Launch and get customers! 🚀

### Quick Wins:

- Share with 10 friends (first users)
- Launch on Product Hunt (100+ users)
- Post on Reddit (50+ users)
- Month 1 goal: 100 users
- Month 3 goal: First $100 MRR
- Month 6 goal: $500 MRR

**You've got this!** 💪

---

Built with ❤️ for entrepreneurs and creators.

Need help? Check the troubleshooting section above!
