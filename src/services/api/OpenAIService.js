/**
 * OpenAI API Service
 * Handles all OpenAI-specific API calls
 */

import { apiService } from './APIService.js';
import { logger } from '../../core/logger/Logger.js';
import { appConfig } from '../../core/config/AppConfig.js';

export class OpenAIService {
    constructor() {
        this.config = appConfig.get('openai');
        this.apiConfig = appConfig.getApiConfig();
        this.logger = logger.child('OpenAIService');
    }

    async chat(messages, options = {}) {
        const requestData = {
            messages,
            model: options.model || this.config.model,
            max_tokens: options.maxTokens || this.config.maxTokens,
            temperature: options.temperature || this.config.temperature
        };

        this.logger.debug('Sending chat request', {
            messageCount: messages.length,
            model: requestData.model
        });

        try {
            const response = await apiService.post(
                this.apiConfig.endpoint,
                requestData,
                {
                    timeout: this.apiConfig.timeout
                }
            );

            this.logger.info('Chat response received', {
                usage: response.usage
            });

            return {
                content: response.response,
                usage: response.usage
            };

        } catch (error) {
            this.logger.error('Chat request failed', error);
            throw error;
        }
    }

    buildSystemPrompt() {
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

    buildContextualMessage(systemPrompt, context, userMessage) {
        return [
            { role: 'system', content: systemPrompt },
            { role: 'system', content: `Relevant Context:\n${context}` },
            { role: 'user', content: userMessage }
        ];
    }

    // Token counting estimation (approximate)
    estimateTokens(text) {
        // Rough estimate: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    // Truncate context if needed to fit within limits
    truncateContext(context, maxTokens = 2000) {
        const estimatedTokens = this.estimateTokens(context);

        if (estimatedTokens <= maxTokens) {
            return context;
        }

        // Keep first and last parts, truncate middle
        const targetLength = maxTokens * 4;
        const half = Math.floor(targetLength / 2);

        return context.substring(0, half) +
               '\n\n[... context truncated ...]\n\n' +
               context.substring(context.length - half);
    }
}

// Singleton instance
export const openAIService = new OpenAIService();
