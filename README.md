# Abhishek Selokar - AI-Powered Portfolio

An interactive, AI-enhanced portfolio showcasing Data Science and ML expertise with live chat assistant and model playground.

## 🚀 Quick Deploy to Netlify

### Prerequisites
- GitHub account
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Deployment Steps

1. **Fork/Clone this repository**

2. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

3. **Deploy**
   - Click "Add new site" → "Import existing project"
   - Select this repository
   - Click "Deploy site"

4. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add the following:
     ```
     OPENAI_API_KEY = your-openai-api-key-here
     ALLOWED_ORIGIN = https://your-site-name.netlify.app
     ```
   - Click "Save"

5. **Redeploy**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

6. **Done!** 🎉
   - Your AI-powered portfolio is live!

## 🎨 Features

- ✅ AI Chat Assistant (RAG-powered)
- ✅ Interactive Model Playground
- ✅ Responsive Design
- ✅ Dark/Light Mode
- ✅ Mobile-Friendly
- ✅ SEO Optimized

## 📝 Customization

### Update Your Information

Edit `ai-knowledge-base.json` to update:
- Projects
- Skills
- Blog posts
- Work experience

The AI will automatically use your updated content!

### Change Chat Personality

Edit `ai-chat-controller.js` → `getSystemPrompt()` method

### Modify Colors

Edit CSS variables in `styles.css` and `ai-chat-widget.css`

## 🔒 Security

**IMPORTANT:** The `ALLOWED_ORIGIN` environment variable restricts API access to your domain only. This prevents API key theft.

For local development, you can use `*` but **NEVER in production**.

## 📊 Cost Estimate

- Netlify hosting: **$0** (free tier)
- OpenAI API (100-500 conversations/month): **$5-15**

## 📚 Full Documentation

See [AI_SETUP_GUIDE.md](./AI_SETUP_GUIDE.md) for complete setup instructions and customization options.

## 🐛 Issues?

Check the setup guide's troubleshooting section or open an issue on GitHub.

## 📄 License

MIT License - feel free to use this as a template for your own portfolio!

---

Built with ❤️ using vanilla JavaScript, OpenAI GPT-4o-mini, and deployed on Netlify.
