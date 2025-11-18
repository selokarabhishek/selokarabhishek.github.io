/**
 * UI Messages and Constants
 */

export const MESSAGES = {
    // Chat messages
    WELCOME: "👋 Hey there! I'm Abhi's AI assistant. I can help you explore his projects, explain his work, or answer any questions about his expertise in AI/ML!",

    RATE_LIMIT: 'Please wait a moment before sending another message.',
    MESSAGE_TOO_LONG: (length, max) => `Please keep your message under ${max} characters. Your message was ${length} characters.`,

    // Error messages
    NETWORK_ERROR: 'Network connection issue. Please check your internet and try again.',
    API_ERROR: 'Service temporarily unavailable. Please try again in a moment.',
    GENERIC_ERROR: 'Sorry, I encountered an error. Please try again or contact Abhi directly at selokarabhishek@gmail.com.',

    // Success messages
    KNOWLEDGE_BASE_LOADED: 'Knowledge base loaded successfully',

    // Fallback responses
    NO_API: "I don't have a downloadable resume file set up yet, but you can view my complete experience and projects right here on this portfolio!",

    // Playground messages
    UPLOAD_ERROR: 'Please upload a valid image file',
    FILE_TOO_LARGE: (maxSize) => `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`,
    INVALID_FILE_TYPE: (supported) => `File type not supported. Supported: ${supported.join(', ')}`
};

export const UI_TEXT = {
    CHAT_TITLE: "Abhi's AI Assistant",
    CHAT_STATUS: 'Online',
    CHAT_PLACEHOLDER: "Ask me about Abhi's work...",
    SEND_BUTTON: 'Send',

    // Quick actions
    HEALTHCARE_AI: 'Healthcare AI',
    SKILLS: 'Skills & Expertise',
    PROJECTS: 'Top Projects',
    BLOG: 'Blog Posts',

    // Buttons
    TRY_MODEL: 'Try Model Demo',
    DOWNLOAD_RESUME: 'Download Resume',
    SCHEDULE_CALL: 'Schedule Call',
    SEE_ALL_PROJECTS: 'See All Projects'
};
