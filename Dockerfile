FROM python:3.12-slim

WORKDIR /app

# Install system dependencies needed for compiling some Python packages or PostgreSQL client
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
# Note: For testing, you can install fastapi, uvicorn, sqlalchemy, psycopg2-binary, pydantic
RUN pip install --no-cache-dir \
    fastapi==0.110.0 \
    uvicorn==0.28.0 \
    sqlalchemy==2.0.28 \
    psycopg2-binary==2.9.9 \
    pydantic==2.6.4

# Copy application files
COPY . /app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
