// ==================== MODEL PLAYGROUND CONTROLLER ====================

class ModelPlayground {
    constructor() {
        this.selectedModel = 'plant-disease';
        this.uploadedImage = null;
        this.init();
    }

    init() {
        this.setupUploadHandlers();
        this.setupModelSelector();
    }

    setupUploadHandlers() {
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('file-input');
        const browseBtn = document.getElementById('browse-btn');
        const clearBtn = document.getElementById('clear-btn');

        // Click to browse
        browseBtn.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('click', () => fileInput.click());

        // File input change
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleFile(file);
            }
        });

        // Clear button
        clearBtn.addEventListener('click', () => {
            this.clearImage();
        });
    }

    setupModelSelector() {
        const modelCards = document.querySelectorAll('.model-card:not(.disabled)');

        modelCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active from all
                modelCards.forEach(c => c.classList.remove('active'));

                // Add active to clicked
                card.classList.add('active');

                // Update selected model
                this.selectedModel = card.dataset.model;

                // Clear results if image is loaded
                if (this.uploadedImage) {
                    this.runInference();
                }
            });
        });
    }

    handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            this.uploadedImage = e.target.result;
            this.showPreview(e.target.result);
            this.runInference();
        };

        reader.readAsDataURL(file);
    }

    showPreview(imageSrc) {
        const uploadArea = document.getElementById('upload-area');
        const previewArea = document.getElementById('preview-area');
        const previewImage = document.getElementById('preview-image');

        uploadArea.style.display = 'none';
        previewArea.style.display = 'block';
        previewImage.src = imageSrc;
    }

    clearImage() {
        const uploadArea = document.getElementById('upload-area');
        const previewArea = document.getElementById('preview-area');
        const resultsSection = document.getElementById('results-section');
        const fileInput = document.getElementById('file-input');

        uploadArea.style.display = 'block';
        previewArea.style.display = 'none';
        resultsSection.style.display = 'none';

        this.uploadedImage = null;
        fileInput.value = '';
    }

    async runInference() {
        const resultsSection = document.getElementById('results-section');

        // Show loading
        resultsSection.style.display = 'block';
        resultsSection.innerHTML = '<div class="loading-spinner"></div><p style="text-align: center; color: var(--gray-text); margin-top: 1rem;">Running inference...</p>';

        // Simulate inference delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate mock results based on selected model
        const results = this.generateMockResults();

        // Display results
        this.displayResults(results);
    }

    generateMockResults() {
        const models = {
            'plant-disease': {
                prediction: 'Tomato Late Blight',
                confidence: 92.3,
                processingTime: 0.84,
                modelSize: '12MB',
                topPredictions: [
                    { label: 'Tomato Late Blight', probability: 92.3 },
                    { label: 'Tomato Early Blight', probability: 4.2 },
                    { label: 'Tomato Septoria Leaf Spot', probability: 2.1 },
                    { label: 'Tomato Healthy', probability: 0.8 },
                    { label: 'Tomato Bacterial Spot', probability: 0.6 }
                ],
                explanation: {
                    title: 'Plant Disease Detection Model',
                    description: 'This model uses a <strong>DINOv2 vision transformer</strong> pretrained with self-supervised learning. Here\'s what happens:',
                    steps: [
                        '<strong>Feature Extraction:</strong> The DINOv2 backbone extracts rich visual features from the image',
                        '<strong>Classification:</strong> A learned classification head predicts disease categories',
                        '<strong>Attention:</strong> Self-attention mechanisms identify relevant image regions'
                    ],
                    techDetails: `
                        <strong>Architecture:</strong> DINOv2-ViT-S/14 + Custom Classification Head<br>
                        <strong>Training:</strong> Fine-tuned on 30K+ plant disease images<br>
                        <strong>Accuracy:</strong> 94% on test set
                    `
                }
            }
        };

        return models[this.selectedModel] || models['plant-disease'];
    }

    displayResults(results) {
        const resultsSection = document.getElementById('results-section');

        const html = `
            <h3><i class="fas fa-chart-bar"></i> Results</h3>

            <div class="results-grid">
                <!-- Prediction -->
                <div class="result-card">
                    <h4>Prediction</h4>
                    <div class="prediction-result">
                        <div class="prediction-label">${results.prediction}</div>
                        <div class="prediction-confidence">${results.confidence}% confidence</div>
                    </div>
                </div>

                <!-- Processing Time -->
                <div class="result-card">
                    <h4>Performance</h4>
                    <div class="performance-metrics">
                        <div class="metric">
                            <span class="metric-label">Processing Time</span>
                            <span class="metric-value">${results.processingTime}s</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Model Size</span>
                            <span class="metric-value">${results.modelSize}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Attention Map -->
            <div class="visualization-section">
                <h4><i class="fas fa-eye"></i> Attention Map</h4>
                <p class="section-description">Visualization of where the model focuses</p>
                <div class="attention-map">
                    <p style="color: var(--gray-text);">
                        <i class="fas fa-info-circle"></i> Attention visualization coming soon!<br>
                        This will show heatmaps (Grad-CAM) of model attention.
                    </p>
                </div>
            </div>

            <!-- Class Probabilities -->
            <div class="visualization-section">
                <h4><i class="fas fa-chart-bar"></i> Top Predictions</h4>
                <div class="probability-bars">
                    ${results.topPredictions.map(pred => `
                        <div class="probability-bar">
                            <div class="probability-header">
                                <span class="probability-label">${pred.label}</span>
                                <span class="probability-value">${pred.probability}%</span>
                            </div>
                            <div class="probability-track">
                                <div class="probability-fill" style="width: ${pred.probability}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Technical Explanation -->
            <div class="explanation-section">
                <h4><i class="fas fa-info-circle"></i> How It Works</h4>
                <div class="explanation-content">
                    <p>${results.explanation.description}</p>
                    <ol>
                        ${results.explanation.steps.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                    <p class="tech-details">
                        ${results.explanation.techDetails}
                    </p>
                </div>
            </div>
        `;

        resultsSection.innerHTML = html;
        resultsSection.style.display = 'block';

        // Animate probability bars
        setTimeout(() => {
            const fills = document.querySelectorAll('.probability-fill');
            fills.forEach(fill => {
                const width = fill.style.width;
                fill.style.width = '0';
                setTimeout(() => {
                    fill.style.width = width;
                }, 100);
            });
        }, 100);
    }
}

// Initialize playground when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const playground = new ModelPlayground();
});
