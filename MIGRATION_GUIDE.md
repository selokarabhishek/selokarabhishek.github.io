# 🔄 Migration Guide: From Monolithic to Modular

This guide shows how to migrate existing code to use the new production architecture.

---

## Quick Start Examples

### 1. Add Logging to Existing Code

**Find and Replace:**
```javascript
// OLD
console.log('Loading knowledge base');
console.error('Failed:', error);

// NEW
import { logger } from './src/core/logger/Logger.js';
logger.info('Loading knowledge base');
logger.error('Operation failed', error);
```

**In your HTML:**
```html
<script type="module">
    import { logger } from './src/core/logger/Logger.js';
    // Now available globally
    window.logger = logger;
</script>
```

---

### 2. Replace Hard-coded Config

**OLD:**
```javascript
const MAX_LENGTH = 500;
const RATE_LIMIT = 2000;
const API_ENDPOINT = '/api/chat';
```

**NEW:**
```javascript
import { appConfig } from './src/core/config/AppConfig.js';

const maxLength = appConfig.get('chat.maxMessageLength');
const rateLimit = appConfig.get('chat.rateLimitMs');
const apiEndpoint = appConfig.get('api.endpoint');
```

---

### 3. Use Error Handling

**OLD:**
```javascript
try {
    await doSomething();
} catch (error) {
    console.error(error);
    alert('Error occurred');
}
```

**NEW:**
```javascript
import { errorHandler } from './src/core/errors/ErrorHandler.js';

try {
    await doSomething();
} catch (error) {
    errorHandler.handle(error, 'Operation Name');
    // Automatically logs, shows user message, reports remotely
}
```

---

### 4. Use API Service

**OLD:**
```javascript
const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
const result = await response.json();
```

**NEW:**
```javascript
import { apiService } from './src/services/api/APIService.js';

const result = await apiService.post('/api/chat', data);
// Automatic retry, timeout, error handling, logging
```

---

### 5. Use Validation

**OLD:**
```javascript
if (!message || message.length > 500) {
    alert('Invalid message');
    return;
}
```

**NEW:**
```javascript
import { validateMessage } from './src/utils/validation.js';

try {
    validateMessage(message);
    // Continue
} catch (error) {
    errorHandler.handle(error);
    // User gets specific error message
}
```

---

## Step-by-Step Integration

### Step 1: Add Module Imports to HTML

**In `index.html` before closing `</body>`:**

```html
<!-- Load core modules -->
<script type="module">
    // Import core modules
    import { logger } from './src/core/logger/Logger.js';
    import { errorHandler } from './src/core/errors/ErrorHandler.js';
    import { appConfig } from './src/core/config/AppConfig.js';
    import { apiService } from './src/services/api/APIService.js';

    // Make available globally for existing code
    window.appLogger = logger;
    window.appErrorHandler = errorHandler;
    window.appConfig = appConfig;
    window.appApiService = apiService;

    console.log('Core modules loaded');
    console.log('Environment:', appConfig.env);
</script>

<!-- Then load your existing scripts -->
<script src="ai-chat-controller.js"></script>
```

### Step 2: Update Existing Code Gradually

**In `ai-chat-controller.js`, add at top:**

```javascript
// Use global modules (set in HTML)
const logger = window.appLogger || console;
const errorHandler = window.appErrorHandler;
const appConfig = window.appConfig;
const apiService = window.appApiService;

// Or import directly if converting to ES modules
// import { logger } from './src/core/logger/Logger.js';
```

### Step 3: Replace Operations One by One

1. **Replace logging:**
   ```javascript
   // console.log → logger.info
   // console.error → logger.error
   ```

2. **Replace config:**
   ```javascript
   // Hard-coded values → appConfig.get()
   ```

3. **Replace error handling:**
   ```javascript
   // Manual try/catch → errorHandler.handle()
   ```

4. **Replace API calls:**
   ```javascript
   // fetch() → apiService.post()
   ```

---

## Example: Refactor loadKnowledgeBase()

### Before:
```javascript
async loadKnowledgeBase() {
    try {
        const response = await fetch('ai-knowledge-base.json');
        this.knowledgeBase = await response.json();
        console.log('Knowledge base loaded successfully');
    } catch (error) {
        console.error('Failed to load knowledge base:', error);
        this.knowledgeBase = {
            personal_info: { name: 'Abhishek Selokar', title: 'Data Scientist' },
            projects: [],
            blog_posts: []
        };
    }
}
```

### After:
```javascript
async loadKnowledgeBase() {
    const kbLogger = logger.child('KnowledgeBase');

    try {
        kbLogger.info('Loading knowledge base');

        const kbPath = appConfig.get('knowledgeBase.path');
        this.knowledgeBase = await apiService.get(`/${kbPath}`);

        kbLogger.info('Knowledge base loaded', {
            projectCount: this.knowledgeBase.projects.length,
            blogCount: this.knowledgeBase.blog_posts.length
        });

    } catch (error) {
        kbLogger.error('Failed to load knowledge base', error);

        // Initialize with defaults
        this.knowledgeBase = {
            personal_info: {
                name: 'Abhishek Selokar',
                title: 'Data Scientist'
            },
            projects: [],
            blog_posts: [],
            experience: []
        };

        // Show user-friendly error
        errorHandler.handle(
            new NotFoundError('Knowledge base'),
            'Load Knowledge Base'
        );
    }
}
```

### Improvements:
- ✅ Context-specific logger
- ✅ Configuration-driven paths
- ✅ Structured logging with data
- ✅ API service with retry
- ✅ Proper error handling
- ✅ User notification

---

## Testing the Integration

### 1. Check Console

After adding modules, check browser console:

```javascript
// Test logging
logger.info('Test message', { data: 'value' });

// Test config
console.log(appConfig.export());

// Test error handling
try {
    throw new Error('Test error');
} catch (e) {
    errorHandler.handle(e, 'Test');
}
```

### 2. Verify Environment

```javascript
import { Environment } from './src/core/config/Environment.js';
console.log('Environment:', Environment.current());
console.log('Is Dev:', Environment.isDevelopment());
```

### 3. Test API Service

```javascript
// Test a simple GET request
apiService.get('ai-knowledge-base.json')
    .then(data => logger.info('KB loaded', data))
    .catch(error => logger.error('KB failed', error));
```

---

## Common Issues & Solutions

### Issue: "Cannot find module"

**Solution:** Ensure correct paths in imports
```javascript
// Correct path from root
import { logger } from './src/core/logger/Logger.js';

// Not: '../logger/Logger.js' or 'src/core/logger/Logger.js'
```

### Issue: "CORS errors"

**Solution:** Serve files over HTTP (not file://)
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

### Issue: "Modules not loading"

**Solution:** Use `type="module"` in script tags
```html
<script type="module" src="your-script.js"></script>
```

### Issue: "Config not found"

**Solution:** Import before using
```javascript
import { appConfig } from './src/core/config/AppConfig.js';
// Then use appConfig.get()
```

---

## Rollback Plan

If issues occur, you can temporarily disable new modules:

```javascript
// Fallback to console
const logger = window.appLogger || {
    info: console.log,
    error: console.error,
    warn: console.warn,
    debug: console.debug
};

// Fallback config
const appConfig = window.appConfig || {
    get: (key) => {
        const defaults = {
            'api.endpoint': '/api/chat',
            'chat.maxMessageLength': 500
        };
        return defaults[key];
    }
};
```

---

## Next Steps

1. ✅ **Start with logging** - Easiest, immediate benefit
2. ✅ **Add error handling** - Better UX, easier debugging
3. ✅ **Use validation** - Prevent bugs, better security
4. ⏳ **Migrate API calls** - Better reliability
5. ⏳ **Refactor into modules** - Long-term maintainability

---

## Questions?

Check `ARCHITECTURE.md` for detailed documentation on each module.

**Remember:** You can integrate gradually. Start with one module, test thoroughly, then move to the next.
