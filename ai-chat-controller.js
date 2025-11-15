// ==================== AI CHAT CONTROLLER ====================
// Main controller for the AI chat widget with OpenAI integration

class AIChatController {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.knowledgeBase = null;
        this.isTyping = false;
        this.conversationHistory = [];
        this.lastMessageTime = null;

        // Configuration
        this.config = {
            apiEndpoint: '/api/chat', // Netlify/Vercel function endpoint
            model: 'gpt-4o-mini',  // Using GPT-4o-mini for cost efficiency
            maxTokens: 800,
            temperature: 0.7,
        };

        this.init();
    }

    async init() {
        // Load knowledge base
        await this.loadKnowledgeBase();

        // Create widget HTML
        this.createWidget();

        // Setup event listeners
        this.setupEventListeners();

        // Show welcome prompt after delay
        setTimeout(() => this.showWelcomePrompt(), 3000);
    }

    async loadKnowledgeBase() {
        try {
            const response = await fetch('ai-knowledge-base.json');
            this.knowledgeBase = await response.json();
            console.log('Knowledge base loaded successfully');
        } catch (error) {
            console.error('Failed to load knowledge base:', error);
            // Initialize with empty structure to prevent crashes
            this.knowledgeBase = {
                personal_info: { name: 'Abhishek Selokar', title: 'Data Scientist' },
                professional_summary: 'Data Scientist specializing in AI/ML',
                projects: [],
                blog_posts: [],
                skills: {},
                experience: []
            };
        }
    }

    createWidget() {
        const widgetHTML = `
            <div class="ai-chat-widget fade-in">
                <!-- Floating Chat Button -->
                <button class="ai-chat-button" id="ai-chat-toggle" aria-label="Open AI Chat">
                    <i class="fas fa-robot"></i>
                    <span class="ai-chat-badge" style="display: none;">1</span>
                </button>

                <!-- Chat Window -->
                <div class="ai-chat-window" id="ai-chat-window">
                    <!-- Header -->
                    <div class="ai-chat-header">
                        <div class="ai-chat-header-content">
                            <div class="ai-chat-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="ai-chat-header-text">
                                <h3>Abhi's AI Assistant</h3>
                                <p><span class="ai-status-indicator"></span> Online</p>
                            </div>
                        </div>
                        <button class="ai-chat-close" id="ai-chat-close" aria-label="Close chat">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <!-- Messages Container -->
                    <div class="ai-chat-messages" id="ai-chat-messages">
                        <!-- Welcome message will be inserted here -->
                    </div>

                    <!-- Input Container -->
                    <div class="ai-chat-input-container">
                        <div class="ai-chat-input-wrapper">
                            <textarea
                                class="ai-chat-input"
                                id="ai-chat-input"
                                placeholder="Ask me about Abhi's work..."
                                rows="1"
                            ></textarea>
                            <button class="ai-chat-send-button" id="ai-chat-send" aria-label="Send message">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', widgetHTML);

        // Show welcome message
        this.showWelcomeMessage();
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('ai-chat-toggle');
        const closeBtn = document.getElementById('ai-chat-close');
        const sendBtn = document.getElementById('ai-chat-send');
        const input = document.getElementById('ai-chat-input');

        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());

        // Enter to send, Shift+Enter for new line
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        input.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        });

        // Escape to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        const chatWindow = document.getElementById('ai-chat-window');
        const badge = document.querySelector('.ai-chat-badge');

        this.isOpen = !this.isOpen;
        chatWindow.classList.toggle('open', this.isOpen);

        if (this.isOpen) {
            document.getElementById('ai-chat-input').focus();
            badge.style.display = 'none';

            // Track analytics
            this.trackEvent('chat_opened');
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('ai-chat-window').classList.remove('open');
    }

    showWelcomePrompt() {
        if (!this.isOpen && this.messages.length === 1) {
            const badge = document.querySelector('.ai-chat-badge');
            badge.style.display = 'flex';
            badge.textContent = '1';
        }
    }

    showWelcomeMessage() {
        const welcomeHTML = `
            <div class="ai-welcome-message">
                <h4>👋 Hey there!</h4>
                <p>I'm Abhi's AI assistant. I can help you explore his projects, explain his work, or answer any questions about his expertise in AI/ML!</p>
                <div class="ai-welcome-actions">
                    <button class="ai-welcome-action" data-query="Tell me about your healthcare AI projects">
                        <i class="fas fa-heartbeat"></i>
                        <span>Healthcare AI</span>
                    </button>
                    <button class="ai-welcome-action" data-query="What are your strongest skills?">
                        <i class="fas fa-brain"></i>
                        <span>Skills & Expertise</span>
                    </button>
                    <button class="ai-welcome-action" data-query="Show me your best projects">
                        <i class="fas fa-project-diagram"></i>
                        <span>Top Projects</span>
                    </button>
                    <button class="ai-welcome-action" data-query="Recommend some blog posts about Vision Transformers">
                        <i class="fas fa-book-open"></i>
                        <span>Blog Posts</span>
                    </button>
                </div>
            </div>
        `;

        const messagesContainer = document.getElementById('ai-chat-messages');
        messagesContainer.innerHTML = welcomeHTML;

        // Add click handlers for welcome actions
        document.querySelectorAll('.ai-welcome-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                this.handleQuickAction(query);
            });
        });

        this.messages.push({
            role: 'assistant',
            content: 'Welcome message',
            timestamp: new Date()
        });
    }

    handleQuickAction(query) {
        // Add user message
        this.addMessage('user', query);

        // Get AI response
        this.getAIResponse(query);
    }

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();

        if (!message || this.isTyping) return;

        // Input validation
        const MAX_MESSAGE_LENGTH = 500;
        if (message.length > MAX_MESSAGE_LENGTH) {
            this.addMessage('assistant', `Please keep your message under ${MAX_MESSAGE_LENGTH} characters. Your message was ${message.length} characters.`);
            return;
        }

        // Basic rate limiting (max 1 message per 2 seconds)
        const now = Date.now();
        if (this.lastMessageTime && (now - this.lastMessageTime) < 2000) {
            this.addMessage('assistant', 'Please wait a moment before sending another message.');
            return;
        }
        this.lastMessageTime = now;

        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Add user message
        this.addMessage('user', message);

        // Get AI response
        await this.getAIResponse(message);

        // Track analytics
        this.trackEvent('message_sent', { message_length: message.length });
    }

    addMessage(role, content, options = {}) {
        const messagesContainer = document.getElementById('ai-chat-messages');
        const timestamp = new Date();

        // Create message HTML
        const messageHTML = `
            <div class="ai-message ${role}">
                <div class="ai-message-avatar">
                    <i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i>
                </div>
                <div class="ai-message-content">
                    <div class="ai-message-bubble">
                        ${this.formatMessage(content)}
                    </div>
                    ${options.quickActions ? this.createQuickActions(options.quickActions) : ''}
                </div>
            </div>
        `;

        // Remove welcome message if present
        const welcomeMsg = messagesContainer.querySelector('.ai-welcome-message');
        if (welcomeMsg && role === 'user') {
            welcomeMsg.remove();
        }

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);

        // Add quick action handlers
        if (options.quickActions) {
            this.setupQuickActions();
        }

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store in messages
        this.messages.push({
            role,
            content,
            timestamp,
            ...options
        });
    }

    formatMessage(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content;

        // Bold: **text** or __text__
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic: *text* or _text_
        formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');

        // Code: `code`
        formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');

        // Links: [text](url)
        formatted = formatted.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="ai-message-link" target="_blank" rel="noopener">$1 <i class="fas fa-external-link-alt" style="font-size: 0.7rem;"></i></a>');

        // Line breaks
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    createQuickActions(actions) {
        const actionsHTML = actions.map(action =>
            `<button class="ai-quick-action" data-action="${action.action || ''}" data-query="${action.query || ''}">
                ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                <span>${action.label}</span>
            </button>`
        ).join('');

        return `<div class="ai-quick-actions">${actionsHTML}</div>`;
    }

    setupQuickActions() {
        document.querySelectorAll('.ai-quick-action').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                const action = btn.dataset.action;

                if (action === 'download_resume') {
                    this.downloadResume();
                } else if (action === 'schedule_call') {
                    this.scheduleCall();
                } else if (action === 'try_model') {
                    this.openModelPlayground();
                } else if (query) {
                    this.handleQuickAction(query);
                }
            });
        });
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('ai-chat-messages');
        const typingHTML = `
            <div class="ai-message ai typing-indicator">
                <div class="ai-message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="ai-typing-indicator">
                    <div class="ai-typing-dots">
                        <span class="ai-typing-dot"></span>
                        <span class="ai-typing-dot"></span>
                        <span class="ai-typing-dot"></span>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.isTyping = true;
    }

    hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
        this.isTyping = false;
    }

    async getAIResponse(userMessage) {
        this.showTypingIndicator();

        try {
            // Build context from knowledge base
            const context = this.buildContext(userMessage);

            // Build conversation history
            const messages = [
                { role: 'system', content: this.getSystemPrompt() },
                { role: 'system', content: `Relevant Context:\n${context}` },
                ...this.conversationHistory.slice(-6), // Last 3 exchanges
                { role: 'user', content: userMessage }
            ];

            // Call API
            const response = await this.callOpenAI(messages);

            this.hideTypingIndicator();

            // Add AI response
            const quickActions = this.suggestQuickActions(userMessage, response);
            this.addMessage('assistant', response, { quickActions });

            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: userMessage },
                { role: 'assistant', content: response }
            );

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', 'Sorry, I encountered an error. Please try again or contact Abhi directly at selokarabhishek@gmail.com.');
            console.error('AI response error:', error);
        }
    }

    buildContext(query) {
        if (!this.knowledgeBase) return '';

        const queryLower = query.toLowerCase();
        let context = [];

        // Add personal info
        context.push(`Name: ${this.knowledgeBase.personal_info.name}`);
        context.push(`Role: ${this.knowledgeBase.personal_info.title}`);
        context.push(`Background: ${this.knowledgeBase.professional_summary}`);

        // Search for relevant projects
        const relevantProjects = this.knowledgeBase.projects.filter(project => {
            const searchText = `${project.title} ${project.description} ${project.keywords.join(' ')}`.toLowerCase();
            return project.keywords.some(kw => queryLower.includes(kw.toLowerCase())) ||
                   queryLower.split(' ').some(word => word.length > 3 && searchText.includes(word));
        }).slice(0, 2);

        if (relevantProjects.length > 0) {
            context.push('\nRelevant Projects:');
            relevantProjects.forEach(project => {
                context.push(`\n- ${project.title}: ${project.description}`);
                context.push(`  Technologies: ${project.technologies.join(', ')}`);
                context.push(`  Achievements: ${project.achievements.join('; ')}`);
            });
        }

        // Search for relevant blog posts
        const relevantBlogs = this.knowledgeBase.blog_posts.filter(blog => {
            const searchText = `${blog.title} ${blog.topics.join(' ')}`.toLowerCase();
            return blog.topics.some(topic => queryLower.includes(topic.toLowerCase())) ||
                   queryLower.split(' ').some(word => word.length > 3 && searchText.includes(word));
        }).slice(0, 2);

        if (relevantBlogs.length > 0) {
            context.push('\nRelevant Blog Posts:');
            relevantBlogs.forEach(blog => {
                context.push(`\n- ${blog.title}`);
                context.push(`  URL: ${blog.url}`);
                context.push(`  Summary: ${blog.summary}`);
            });
        }

        // Add relevant skills
        if (queryLower.includes('skill') || queryLower.includes('expertise') || queryLower.includes('technology')) {
            context.push('\nKey Skills:');
            Object.entries(this.knowledgeBase.skills).forEach(([category, skills]) => {
                if (typeof skills === 'object' && skills.technologies) {
                    context.push(`\n${category}: ${skills.technologies.join(', ')}`);
                }
            });
        }

        // Add experience if relevant
        if (queryLower.includes('experience') || queryLower.includes('work') || queryLower.includes('job')) {
            context.push('\nWork Experience:');
            this.knowledgeBase.experience.forEach(exp => {
                context.push(`\n- ${exp.title} at ${exp.company} (${exp.duration})`);
                context.push(`  ${exp.description}`);
            });
        }

        return context.join('\n');
    }

    getSystemPrompt() {
        return `You are Abhi's AI Assistant - a friendly, knowledgeable AI that represents Abhishek Selokar, a Data Scientist specializing in Healthcare AI, Computer Vision, and NLP.

PERSONALITY:
- Friendly and approachable, but professional
- Enthusiastic about AI/ML and helping people
- Use first person when talking about Abhi's work ("I built...", "my project...")
- Be concise but informative
- Use emojis sparingly and appropriately
- Show genuine interest in helping

GUIDELINES:
1. Answer questions about Abhi's projects, skills, experience, and blog posts
2. Provide specific technical details when asked
3. Suggest relevant blog posts when appropriate
4. Offer to help with specific actions (schedule call, download resume, etc.)
5. If you don't know something, be honest and offer to connect them with Abhi
6. Keep responses under 200 words unless detailed explanation is requested
7. Always include relevant links when mentioning projects or blog posts
8. Use the provided context to give accurate, specific answers

TONE EXAMPLES:
- "I specialize in healthcare AI! My mammography lesion detection system achieved 15.2% mAP improvement using GroundingDINO..."
- "That's a great question about Vision Transformers! I actually wrote about this in my DINOv3 blog post..."
- "I'd love to chat more about this! Want to schedule a call with me?"

Remember: You're here to showcase Abhi's expertise while being genuinely helpful to visitors!`;
    }

    async callOpenAI(messages) {
        // For development/testing, use a fallback response
        // In production, this would call your Netlify/Vercel function

        // Check if API endpoint exists
        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages,
                    model: this.config.model,
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature,
                }),
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.response;

        } catch (error) {
            console.error('API call failed, using fallback response:', error);
            return this.getFallbackResponse(messages[messages.length - 1].content);
        }
    }

    getFallbackResponse(query) {
        const queryLower = query.toLowerCase();

        // Healthcare AI questions
        if (queryLower.includes('healthcare') || queryLower.includes('medical') || queryLower.includes('mammography')) {
            return `I specialize in healthcare AI! My main projects include:

**Mammography Lesion Detection** - Achieved 15.2% mAP improvement using GroundingDINO and Swin Transformer v2 for detecting breast cancer lesions.

**Chest X-ray Classifier** - Built a multi-pathology detection system using DINOv2 with self-supervised learning.

These projects demonstrate my expertise in medical imaging, transformer architectures, and handling the unique challenges of healthcare data like class imbalance and limited labeled data.

Want to know more about any specific project?`;
        }

        // Skills questions
        if (queryLower.includes('skill') || queryLower.includes('expertise') || queryLower.includes('technology')) {
            return `My strongest skills include:

🔬 **Computer Vision**: Vision Transformers (DINOv2, Swin), Object Detection (YOLO, GroundingDINO), Medical Imaging

🤖 **Deep Learning**: PyTorch expert, Self-supervised learning, Transfer learning

💬 **NLP & LLMs**: RAG systems, Fine-tuning (Llama 3, LoRA), Multilingual chatbots

🎯 **MLOps**: Model deployment, ONNX, TensorRT, Production systems

I've got 2 years of hands-on experience and a strong academic background from IIT Kharagpur!`;
        }

        // Blog questions
        if (queryLower.includes('blog') || queryLower.includes('article') || queryLower.includes('write')) {
            return `I love writing about AI/ML! Check out some popular posts:

📝 **[DINOv3 Explained](https://medium.com/@imabhi1216/dinov3-explained-the-game-changing-vision-transformer-thats-redefining-computer-vision-cd63646141e6)** - Self-supervised vision transformers

📝 **[Llama 3.1 Guide](https://medium.com/@imabhi1216/llama-3-1-everything-you-need-to-know-about-metas-latest-ai-language-model-6008a415e181)** - Everything about Meta's LLM

📝 **[RAG Implementation](https://medium.com/@imabhi1216/implementing-rag-using-langchain-and-ollama-93bdf4a9027c)** - Practical RAG tutorial

You can find all my posts on [Medium @imabhi1216](https://medium.com/@imabhi1216)!`;
        }

        // Contact/schedule questions
        if (queryLower.includes('contact') || queryLower.includes('schedule') || queryLower.includes('call') || queryLower.includes('meeting')) {
            return `I'd love to chat! Here's how to connect:

📧 **Email**: selokarabhishek@gmail.com
💼 **LinkedIn**: [Connect with me](https://www.linkedin.com/in/abhishek-244477175)
🐙 **GitHub**: [@selokarabhishek](https://github.com/selokarabhishek)

Feel free to reach out directly, and I'll get back to you soon!`;
        }

        // Default response
        return `Thanks for your question! I'm Abhi's AI assistant, and I can help you learn about:

• My healthcare AI projects (mammography, chest X-rays)
• Technical skills and expertise
• Blog posts and technical writing
• Work experience and background

What would you like to know more about?`;
    }

    suggestQuickActions(query, response) {
        const queryLower = query.toLowerCase();
        const actions = [];

        // Suggest model playground for CV questions
        if (queryLower.includes('model') || queryLower.includes('demo') || queryLower.includes('try')) {
            actions.push({
                label: 'Try Model Demo',
                icon: 'fas fa-play-circle',
                action: 'try_model'
            });
        }

        // Suggest resume download
        if (queryLower.includes('experience') || queryLower.includes('resume') || queryLower.includes('cv')) {
            actions.push({
                label: 'Download Resume',
                icon: 'fas fa-file-download',
                action: 'download_resume'
            });
        }

        // Suggest scheduling
        if (queryLower.includes('talk') || queryLower.includes('discuss') || queryLower.includes('meeting')) {
            actions.push({
                label: 'Schedule Call',
                icon: 'fas fa-calendar',
                action: 'schedule_call'
            });
        }

        // Suggest more projects
        if (response.includes('project') && actions.length < 2) {
            actions.push({
                label: 'See All Projects',
                icon: 'fas fa-folder-open',
                query: 'Show me all your projects with details'
            });
        }

        return actions.length > 0 ? actions : null;
    }

    downloadResume() {
        this.addMessage('user', 'Download resume');
        this.addMessage('assistant', 'I don\'t have a downloadable resume file set up yet, but you can view my complete experience and projects right here on this portfolio! You can also reach out via email at selokarabhishek@gmail.com for a formal CV.');
        this.trackEvent('resume_download_attempted');
    }

    scheduleCall() {
        this.addMessage('user', 'Schedule a call');
        this.addMessage('assistant', 'I\'d love to chat! Please send me an email at **selokarabhishek@gmail.com** with your preferred times, and I\'ll get back to you to schedule a call. You can also connect with me on [LinkedIn](https://www.linkedin.com/in/abhishek-244477175)!');
        this.trackEvent('schedule_call_clicked');
    }

    openModelPlayground() {
        this.addMessage('user', 'Try model demo');
        this.addMessage('assistant', 'The interactive model playground is coming soon! It will let you upload images and see my models in action. For now, check out my [GitHub](https://github.com/selokarabhishek) for code and implementations!');
        this.trackEvent('model_playground_clicked');
    }

    trackEvent(eventName, data = {}) {
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'AI_Chat',
                ...data
            });
        }

        console.log('Event tracked:', eventName, data);
    }
}

// Initialize chat controller when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aiChat = new AIChatController();
});
