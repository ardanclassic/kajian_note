# YouTube Transcript API

A FastAPI-based web service to fetch YouTube video transcripts using Docker.

## Features

- 🎬 Fetch transcripts from YouTube videos
- 🌐 RESTful API with automatic documentation
- 🐳 Docker containerized for easy deployment
- 🔄 Support for multiple languages
- ⚡ Fast and lightweight FastAPI framework
- 📝 Automatic API documentation with Swagger UI

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Internet connection for fetching transcripts

### Docker Commands

#### Build and run the service:
```bash
# Build the Docker image
docker-compose build

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

#### Run with Nginx reverse proxy:
```bash
docker-compose --profile with-nginx up -d --build
```

## API Endpoints

Once running, the API will be available at:

- **API Base URL**: http://localhost:8001
- **Interactive API Docs**: http://localhost:8001/docs
- **Alternative API Docs**: http://localhost:8001/redoc
- **Health Check**: http://localhost:8001/health

### Available Endpoints

#### POST /url-to-id
Convert YouTube URL to video ID.

**Example:**
```json
POST /url-to-id
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=D7v9Pek4Ie4"
}
```

**Response:**
```json
{
  "video_id": "D7v9Pek4Ie4",
  "original_url": "https://www.youtube.com/watch?v=D7v9Pek4Ie4"
}
```

#### POST /transcript
Fetch transcript by video ID with request body.

**Example:**
```json
POST /transcript
Content-Type: application/json

{
  "video_id": "D7v9Pek4Ie4",
  "languages": "id,en"
}
```

**Response:**
```json
{
  "video_id": "VIDEO_ID",
  "video_url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language_used": "id",
  "total_segments": 1551,
  "transcript": [
    {
      "start_time": 0.0,
      "duration": 2.0,
      "text": "Dan kali ini kita bersama guru kita,",
      "formatted_time": "00:00"
    }
  ]
}
```

#### POST /transcript/text
Fetch transcript as plain text by video ID.

**Example:**
```json
POST /transcript/text
Content-Type: application/json

{
  "video_id": "D7v9Pek4Ie4",
  "languages": "id,en",
  "include_timestamps": true
}
```

**Response:**
```json
{
  "message": "YouTube Video: https://www.youtube.com/watch?v=D7v9Pek4Ie4\nVideo ID: D7v9Pek4Ie4\nTotal segments: 1551\nLanguage: id",
  "data": "[00:00] Dan kali ini kita bersama guru kita,\n[00:02] Bapak Jokowi..."
}
```

#### POST /transcript/summarize
Fetch transcript and summarize using OpenRouter API.

**Request Body:**
```json
{
  "video_id": "D7v9Pek4Ie4",
  "languages": "id,en",
  "model": "qwen/qwen3-8b",
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "video_id": "D7v9Pek4Ie4",
  "video_url": "https://www.youtube.com/watch?v=D7v9Pek4Ie4",
  "language_used": "id",
  "model_used": "qwen/qwen3-8b",
  "summary": "This video discusses...",
  "original_transcript_length": 1551
}
```

## Usage Examples

### Using curl

```bash
# Convert YouTube URL to video ID
curl -X POST 'http://localhost:8001/url-to-id' \
     -H 'Content-Type: application/json' \
     -d '{
       "url": "https://www.youtube.com/watch?v=D7v9Pek4Ie4"
     }'

# Fetch transcript by video ID (detailed JSON)
curl -X POST 'http://localhost:8001/transcript' \
     -H 'Content-Type: application/json' \
     -d '{
       "video_id": "D7v9Pek4Ie4",
       "languages": "id,en"
     }'

# Fetch transcript as plain text
curl -X POST 'http://localhost:8001/transcript/text' \
     -H 'Content-Type: application/json' \
     -d '{
       "video_id": "D7v9Pek4Ie4",
       "languages": "id,en",
       "include_timestamps": true
     }'

# Summarize transcript using OpenRouter API
curl -X POST 'http://localhost:8001/transcript/summarize' \
     -H 'Content-Type: application/json' \
     -d '{
       "video_id": "D7v9Pek4Ie4",
       "languages": "id,en",
       "model": "qwen/qwen3-8b",
       "max_tokens": 1000
     }'

# Health check
curl 'http://localhost:8001/health'
```

### Using Python requests

```python
import requests

# Convert YouTube URL to video ID
response = requests.post('http://localhost:8001/url-to-id', json={
    'url': 'https://www.youtube.com/watch?v=D7v9Pek4Ie4'
})
url_data = response.json()
print(f"Video ID: {url_data['video_id']}")

# Fetch transcript (detailed JSON)
response = requests.post('http://localhost:8001/transcript', json={
    'video_id': 'D7v9Pek4Ie4',
    'languages': 'id,en'
})
transcript_data = response.json()
print(f"Total segments: {transcript_data['total_segments']}")

# Fetch transcript as plain text
response = requests.post('http://localhost:8001/transcript/text', json={
    'video_id': 'D7v9Pek4Ie4',
    'languages': 'id,en',
    'include_timestamps': True
})
text_data = response.json()
print(f"Transcript text: {text_data['data'][:200]}...")

# Summarize transcript
response = requests.post('http://localhost:8001/transcript/summarize', json={
    'video_id': 'D7v9Pek4Ie4',
    'languages': 'id,en',
    'model': 'qwen/qwen3-8b',
    'max_tokens': 1000
})
summary_data = response.json()
print(f"Summary: {summary_data['summary']}")
```

## Configuration

### Environment Variables

You can customize the service using environment variables in `docker-compose.yml`:

- `PYTHONUNBUFFERED=1`: Ensures Python output is not buffered
- `OPENROUTER_API_KEY`: Required for the summarization endpoint (get it from https://openrouter.ai/)
- `OPENROUTER_DEFAULT_MODEL`: Default AI model to use for summarization (defaults to "qwen/qwen3-8b")

### Setting up OpenRouter API Key

To use the summarization endpoint, you need to set up an OpenRouter API key:

1. Sign up at https://openrouter.ai/
2. Get your API key from the dashboard
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and add your API key and preferred default model:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   OPENROUTER_DEFAULT_MODEL=qwen/qwen3-8b
   ```
5. Update `docker-compose.yml` to load the environment file:
   ```yaml
   services:
     youtube-transcript-api:
       # ... other config
       env_file:
         - .env
   ```

### Volumes

- `./transcripts:/app/transcripts`: Optional volume to persist saved transcripts

## Supported YouTube URL Formats

The API supports various YouTube URL formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/v/VIDEO_ID`

## Language Support

The API attempts to fetch transcripts in the following order:
1. Requested languages (default: Indonesian `id`, then English `en`)
2. Any available language if specified languages are not found

## Development

### Project Structure

```
.
├── app.py                 # FastAPI application
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
├── requirements.txt      # Python dependencies
├── nginx.conf           # Nginx configuration (optional)
├── .env.example         # Environment variables template
├── README.md            # This file
├── poc/
│   └── main.py          # Original transcript fetcher (proof of concept)
└── transcripts/         # Directory for saved transcripts
    ├── *.json           # Cached transcript files
    └── *_summary.json   # Cached summary files
```

### Local Development

To run locally without Docker:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server (will be available at http://localhost:8000)
uvicorn app:app --host 0.0.0.0 --port 8000 --reload

# Note: When running locally, the server uses port 8000
# When running with Docker, it's mapped to port 8001
```

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `docker-compose.yml`
2. **Docker not running**: Ensure Docker Desktop is started
3. **Transcript not found**: Some videos may not have transcripts available

### Logs

View application logs:
```bash
docker-compose logs -f youtube-transcript-api
```

### Container Management

```bash
# Restart the service
docker-compose restart

# Rebuild the image
docker-compose build --no-cache

# Remove all containers and images
docker-compose down --rmi all
```

## License

This project is for educational purposes. Please respect YouTube's Terms of Service when using this API.