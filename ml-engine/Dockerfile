FROM tensorflow/tensorflow:2.15.0-gpu AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM tensorflow/tensorflow:2.15.0

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash ml

# Copy Python packages from builder
COPY --from=builder --chown=ml:ml /root/.local /home/ml/.local
ENV PATH=/home/ml/.local/bin:$PATH

# Copy application code
COPY ml_models/ ./ml_models/
COPY training/ ./training/
COPY prediction/ ./prediction/
COPY data/ ./data/

# Create model directory
RUN mkdir -p /app/models

# Set ownership of app files
RUN chown -R ml:ml /app
USER ml

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

EXPOSE 5000

# Training mode by default
CMD ["python", "-m", "training.pipeline"]
