# AI-Powered Portfolio Setup Guide

This guide explains how to set up and deploy your AI-enhanced portfolio with chat capabilities and interactive model playground.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Deployment](#deployment)
6. [Features Overview](#features-overview)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Your portfolio now includes:

- **AI Chat Widget**: Intelligent assistant powered by OpenAI GPT-4o-mini
- **Knowledge Base**: Comprehensive RAG system with all your projects, skills, and blogs
- **Model Playground**: Interactive demo for showcasing ML models
- **Serverless API**: Secure backend for AI chat using Netlify Functions

---

## ✅ Prerequisites

### Required

- **GitHub Account**: For hosting (GitHub Pages)
- **Netlify Account**: For serverless functions (free tier available)
- **OpenAI API Key**: For the chat assistant

### Optional

- **Google Analytics**: For tracking engagement
- **Custom Domain**: For professional URL

---

## 🚀 Installation

### 1. Local Setup

All files are already in your repository. No additional installation needed!

**File Structure:**
```
selokarabhishek.github.io/
├── index.html                      # Main portfolio page
├── model-playground.html           # Interactive ML demo page
├── styles.css                      # Main styles
├── script.js                       # Main JavaScript
├── ai-knowledge-base.json          # Your projects/skills database
├── ai-chat-widget.css              # Chat widget styles
├── ai-chat-controller.js           # Chat logic and AI integration
├── model-playground.css            # Playground styles
├── model-playground.js             # Playground logic
├── netlify.toml                    # Netlify configuration
└── netlify/functions/
    └── chat.js                     # Serverless API endpoint
```

### 2. Test Locally

Open `index.html` in a browser to preview:

```bash
# Option 1: Simple HTTP server
python -m http.server 8000

# Option 2: Live Server (VS Code extension)
# Right-click index.html → "Open with Live Server"
```

Visit: `http://localhost:8000`

---

## ⚙️ Configuration

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up / Login
3. Navigate to **API Keys**
4. Click **Create new secret key**
5. Copy and save the key (you won't see it again!)

**Cost Estimate:**
- Model: `gpt-4o-mini`
- Cost: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Expected monthly cost: $5-15 for typical portfolio traffic

### 2. Deploy to Netlify

#### Step 1: Create Netlify Account

1. Go to [Netlify](https://www.netlify.com/)
2. Sign up with GitHub
3. Authorize Netlify to access your repositories

#### Step 2: Deploy Site

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **GitHub** and select your repository: `selokarabhishek.github.io`
3. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `.` (root)
4. Click **Deploy site**

#### Step 3: Add OpenAI API Key

1. In Netlify dashboard, go to **Site settings**
2. Click **Environment variables** (left sidebar)
3. Click **Add a variable**
4. Add:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `your-api-key-here`
5. Click **Save**

#### Step 4: Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for deployment to complete

Your site is now live! 🎉

---

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

**Pros:**
- ✅ Free tier with 125K function requests/month
- ✅ Automatic HTTPS
- ✅ Serverless functions built-in
- ✅ Easy environment variable management
- ✅ Continuous deployment from GitHub

**Setup:** See Configuration section above

### Option 2: Vercel

**Pros:**
- ✅ Similar to Netlify
- ✅ 100K function invocations/month (free)
- ✅ Edge functions for lower latency

**Setup:**
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variable: `OPENAI_API_KEY`
4. Deploy!

**Note:** You'll need to convert `netlify/functions/chat.js` to Vercel's Edge Function format.

### Option 3: GitHub Pages + External API

**For AI Chat:**
- Host serverless function on Netlify/Vercel separately
- Update `apiEndpoint` in `ai-chat-controller.js` to point to your API URL

**For Static Site:**
- Push to GitHub
- Enable GitHub Pages in repository settings
- Set source to `main` branch

---

## 🎨 Features Overview

### 1. AI Chat Widget

**Location:** Bottom-right floating button on all pages

**Capabilities:**
- Answer questions about your projects
- Explain technical skills and expertise
- Recommend relevant blog posts
- Provide contact information
- Schedule meetings
- Download resume (when configured)

**How it works:**
1. User asks a question
2. System searches knowledge base for relevant context (RAG)
3. Sends context + question to OpenAI
4. AI generates personalized response
5. Displays with quick action buttons

**Customizing Personality:**

Edit `ai-chat-controller.js` → `getSystemPrompt()`:

```javascript
getSystemPrompt() {
    return `You are Abhi's AI Assistant - friendly, knowledgeable...

    PERSONALITY:
    - [Customize personality traits]
    - [Set tone and style]

    GUIDELINES:
    - [Add specific instructions]
    `;
}
```

### 2. Knowledge Base

**Location:** `ai-knowledge-base.json`

**Structure:**
- Personal info & contact
- Professional summary
- Work experience (detailed)
- Projects (8 comprehensive entries)
- Skills taxonomy
- Blog posts with metadata
- Common Q&A

**Updating Content:**

Edit `ai-knowledge-base.json`:

```json
{
  "projects": [
    {
      "id": "new-project",
      "title": "Project Title",
      "description": "Short description",
      "detailed_description": "Full explanation",
      "technologies": ["Tech1", "Tech2"],
      "achievements": ["Achievement 1"],
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}
```

The AI will automatically use new content!

### 3. Model Playground

**Location:** `model-playground.html`

**Current State:**
- Demo UI ready
- Shows simulated results
- Full interaction flow implemented

**To Add Real Model Inference:**

Option A: TensorFlow.js
```javascript
// Load model
const model = await tf.loadLayersModel('path/to/model.json');

// Run inference
const prediction = model.predict(processedImage);
```

Option B: ONNX Runtime Web
```javascript
// Load ONNX model
const session = await ort.InferenceSession.create('model.onnx');

// Run inference
const results = await session.run(feeds);
```

Option C: API Endpoint
```javascript
// Call your model API
const response = await fetch('/api/inference', {
    method: 'POST',
    body: formData
});
```

---

## 🎨 Customization

### Color Scheme

Edit `styles.css` and `ai-chat-widget.css`:

```css
:root {
    --primary-color: #0ea5e9;      /* Main accent */
    --secondary-color: #64748b;    /* Secondary accent */
    --accent-color: #06b6d4;       /* Highlights */
}
```

### Chat Widget Position

Edit `ai-chat-widget.css`:

```css
.ai-chat-widget {
    bottom: 2rem;   /* Distance from bottom */
    right: 2rem;    /* Distance from right */
    /* For left side: */
    /* left: 2rem; right: auto; */
}
```

### Welcome Message

Edit `ai-chat-controller.js` → `showWelcomeMessage()`:

```javascript
const welcomeHTML = `
    <div class="ai-welcome-message">
        <h4>👋 [Your custom greeting]</h4>
        <p>[Your custom message]</p>
        <div class="ai-welcome-actions">
            <!-- Add custom quick actions -->
        </div>
    </div>
`;
```

### Add New Quick Actions

Edit `ai-chat-controller.js`:

```javascript
// In createQuickActions() method
actions.push({
    label: 'Your Action',
    icon: 'fas fa-icon-name',
    action: 'custom_action'  // or query: "Ask something"
});

// Add handler in setupQuickActions()
if (action === 'custom_action') {
    this.handleCustomAction();
}
```

---

## 📊 Analytics Setup

### Google Analytics 4

1. Create GA4 property at [Google Analytics](https://analytics.google.com/)
2. Get Measurement ID (format: `G-XXXXXXXXXX`)
3. Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Chat Events Tracked:**
- `chat_opened`
- `message_sent`
- `resume_download_attempted`
- `schedule_call_clicked`
- `model_playground_clicked`

View events in GA4 → **Reports** → **Events**

---

## 🐛 Troubleshooting

### Chat Widget Not Appearing

**Check:**
1. Browser console for errors (F12 → Console)
2. Files loaded correctly:
   - `ai-chat-widget.css`
   - `ai-chat-controller.js`
   - `ai-knowledge-base.json`

**Fix:**
```javascript
// Check console for:
console.log('Knowledge base loaded successfully');
```

### API Errors (Chat Not Responding)

**Check:**
1. Netlify Functions deployed correctly
2. `OPENAI_API_KEY` environment variable set
3. API endpoint URL in `ai-chat-controller.js`

**Fallback Mode:**
- Chat currently has fallback responses
- Works without API for demo purposes
- Shows relevant information from knowledge base

**Enable API:**
```javascript
// In ai-chat-controller.js
this.config = {
    apiEndpoint: '/api/chat',  // Correct endpoint
    // ... rest of config
};
```

### Model Playground Shows Loading Forever

**This is expected!**
- Current version uses simulated results
- Real model inference requires:
  1. Trained model files (.onnx or TensorFlow.js format)
  2. Model loading code
  3. Preprocessing pipeline

**Quick Fix:**
- Already showing demo results
- Update `generateMockResults()` to show your actual model's performance metrics

### Styling Issues

**Cache Problem:**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache

**CSS Not Loading:**
```html
<!-- Add version parameter to CSS files -->
<link rel="stylesheet" href="ai-chat-widget.css?v=1.0">
```

---

## 🔒 Security Best Practices

### 1. Never Commit API Keys

✅ **DO:**
- Use environment variables in Netlify/Vercel
- Add `.env` to `.gitignore`

❌ **DON'T:**
- Hardcode API keys in JavaScript
- Commit `.env` files

### 2. Rate Limiting

Add to serverless function:

```javascript
// In netlify/functions/chat.js
const MAX_REQUESTS_PER_HOUR = 100;

// Implement rate limiting logic
// (Use Netlify Edge or external service)
```

### 3. Input Validation

Already implemented in `chat.js`:

```javascript
if (!messages || !Array.isArray(messages)) {
    return { statusCode: 400, body: 'Invalid input' };
}
```

---

## 💰 Cost Management

### OpenAI API Costs

**Monitor Usage:**
1. [OpenAI Usage Dashboard](https://platform.openai.com/usage)
2. Set monthly budget limits
3. Enable email alerts

**Optimize Costs:**
```javascript
// Reduce token usage
this.config = {
    max_tokens: 500,      // Lower from 800
    temperature: 0.7,
};

// Limit conversation history
...this.conversationHistory.slice(-4)  // Lower from -6
```

**Estimated Monthly Costs:**
- 100 conversations/month: ~$2-5
- 500 conversations/month: ~$10-20
- 1000+ conversations/month: ~$25-40

---

## 🚀 Next Steps

### Recommended Enhancements

1. **Add Real Model Inference**
   - Convert your trained models to TensorFlow.js or ONNX
   - Implement client-side inference
   - Add Grad-CAM visualizations

2. **Expand Knowledge Base**
   - Add more projects as you build them
   - Link to GitHub repositories
   - Include code snippets

3. **Advanced Chat Features**
   - Voice input (Web Speech API)
   - Multi-language support
   - Code explanation with syntax highlighting

4. **Analytics & A/B Testing**
   - Track which features users engage with most
   - Test different chat personalities
   - Optimize conversion rates

5. **Resume Download**
   - Create PDF resume
   - Add download link
   - Track download events

---

## 📚 Resources

### Documentation
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/)

### Learning
- [RAG Systems](https://www.anthropic.com/index/retrieval-augmented-generation)
- [Prompt Engineering](https://www.promptingguide.ai/)
- [Serverless Functions](https://www.netlify.com/blog/intro-to-serverless-functions/)

---

## 🤝 Support

**Issues?**
1. Check this guide's Troubleshooting section
2. Review browser console for errors
3. Check Netlify function logs
4. Verify environment variables are set

**Need Help?**
- OpenAI Discord: [https://discord.gg/openai](https://discord.gg/openai)
- Netlify Community: [https://answers.netlify.com/](https://answers.netlify.com/)

---

## 📝 Changelog

### v1.0.0 (Current)
- ✅ AI Chat Widget with RAG
- ✅ Comprehensive knowledge base
- ✅ Model playground UI
- ✅ Serverless API integration
- ✅ Fallback responses
- ✅ Mobile responsive design

### Future Roadmap
- 🔜 Real model inference (TensorFlow.js)
- 🔜 Grad-CAM visualizations
- 🔜 Voice chat capabilities
- 🔜 Multi-language support
- 🔜 Advanced analytics dashboard

---

**Congratulations!** 🎉 Your AI-powered portfolio is ready to impress recruiters and showcase your ML expertise!

For questions or improvements, feel free to update this guide as you enhance your portfolio.
