# 1. Start with a lightweight Linux + Python 3.10 base
FROM python:3.10-slim

# 2. Set environment variables
# PYTHONDONTWRITEBYTECODE: Prevents Python from writing .pyc files
# PYTHONUNBUFFERED: Ensures logs appear immediately in the console
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Creating a folder for our app inside the container
WORKDIR /app

# 4. Installing system dependencies (needed for Postgres driver)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Installing Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copying the rest of the application code
COPY . .

# 7.Command to run the app
# host 0.0.0.0 is crucial! It lets the container accept connections from outside.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]