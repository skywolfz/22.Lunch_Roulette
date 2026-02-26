FROM python:3.11-slim

WORKDIR /app

# Create instance directory for SQLite database
RUN mkdir -p /app/instance

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Run the application
CMD ["python", "run.py"]
