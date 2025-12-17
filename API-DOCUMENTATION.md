# RepoWise API Documentation

Complete reference for all RepoWise backend API endpoints with purposes, request/response formats, and curl commands.

**Base URL (Local):** `http://localhost:8000/api`
**Base URL (Production):** `https://tianna-unretractive-ellen.ngrok-free.dev/api`

---

## Table of Contents

1. [Admin Endpoints](#admin-endpoints)
2. [Analytics & Tracking](#analytics--tracking)
3. [System Health & Status](#system-health--status)
4. [Project Management](#project-management)
5. [Query & Search](#query--search)
6. [Statistics](#statistics)

---

## Admin Endpoints

### 1. Reset All Data [Created this to manually set up proejct as a clean slate whenever needed]

**Endpoint:** `DELETE /admin/reset`

**Purpose:** Reset all system data - clears ChromaDB collections and in-memory data cache. **WARNING:** This deletes ALL indexed projects and their data.

**Authentication:** None

**What Gets Deleted:**
- All ChromaDB collections (governance docs, embeddings)
- In-memory data cache (commits/issues)

**What Gets Preserved:**
- auth.db (user accounts)
- External API data (can be re-fetched)

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/admin/reset
```

**Response:**
```json
{
  "status": "success",
  "message": "All data has been reset. ChromaDB collections and data cache cleared.",
  "cleared": {
    "chromadb": true,
    "data_cache": true
  }
}
```

**Error Response (500):**
```json
{
  "detail": "Reset failed: <error_message>"
}
```

---

## Analytics & Tracking

### 2. Record View Event

**Endpoint:** `POST /record_view`

**Purpose:** Record a page view by storing the current UTC timestamp for analytics.

**Request:**
```bash
curl -X POST http://localhost:8000/api/record_view \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "View recorded",
  "timestamp": "2025-11-25T10:30:45Z"
}
```

**Use Case:** Track landing page visits, user engagement metrics.

---

### 3. Track Processed Repository

**Endpoint:** `POST /track-processed-repo`

**Purpose:** Record when a repository has been successfully processed (indexed). Increments counter and stores timestamp.

**Request:**
```bash
curl -X POST http://localhost:8000/api/track-processed-repo \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Processed repository recorded",
  "timestamp": "2025-11-25T10:35:22Z",
  "count": 47
}
```

---

### 4. Get Processed Repository Count

**Endpoint:** `GET /processed-repo-count`

**Purpose:** Retrieve the total number of repositories that have been processed/indexed.

**Request:**
```bash
curl http://localhost:8000/api/processed-repo-count
```

**Response:**
```json
{
  "count": 47
}
```

**Use Case:** Display on landing page "X repositories analyzed" counter.

---

### 5. Get View Count

**Endpoint:** `GET /view_count`

**Purpose:** Retrieve the total number of recorded view events.

**Request:**
```bash
curl http://localhost:8000/api/view_count
```

**Response:**
```json
{
  "count": 1523
}
```

---

## System Health & Status

### 6. Health Check

**Endpoint:** `GET /health`

**Purpose:** Simple health check to verify the API is running.

**Request:**
```bash
curl http://localhost:8000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "RepoWise API",
  "version": "1.0.0"
}
```

**Use Case:** Load balancer health checks, uptime monitoring.

---

### 7. System Status (Detailed)

**Endpoint:** `GET /system-status`

**Purpose:** Get comprehensive system status including Ollama LLM availability, ChromaDB stats, and configuration.

**Request:**
```bash
curl http://localhost:8000/api/system-status
```

**Response:**
```json
{
  "status": "operational",
  "llm": {
    "available": true,
    "model": "mistral:7b",
    "host": "http://localhost:11434"
  },
  "rag": {
    "total_chunks": 1247,
    "projects_indexed": 6,
    "project_distribution": {
      "kubernetes-kubernetes": 312,
      "pytorch-pytorch": 428,
      "tensorflow-tensorflow": 507
    }
  },
  "config": {
    "ollama_host": "http://localhost:11434",
    "ollama_model": "mistral:7b",
    "embedding_model": "all-MiniLM-L6-v2"
  }
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": "Ollama server not reachable"
}
```

---

## Project Management

### 8. List All Projects

**Endpoint:** `GET /projects`

**Purpose:** Get list of all indexed projects from ChromaDB (single source of truth).

**Request:**
```bash
curl http://localhost:8000/api/projects
```

**Response:**
```json
[
  {
    "id": "kubernetes-kubernetes",
    "name": "kubernetes",
    "owner": "kubernetes",
    "repo": "kubernetes",
    "description": "Production-Grade Container Orchestration",
    "foundation": "CNCF",
    "governance_url": "https://github.com/kubernetes/kubernetes"
  },
  {
    "id": "pytorch-pytorch",
    "name": "pytorch",
    "owner": "pytorch",
    "repo": "pytorch",
    "description": "Tensors and Dynamic neural networks in Python",
    "foundation": "PyTorch Foundation",
    "governance_url": "https://github.com/pytorch/pytorch"
  }
]
```

---

### 9. Add Repository

**Endpoint:** `POST /projects/add`

**Purpose:** Add a new GitHub repository by URL. Extracts documentation, indexes in ChromaDB, and fetches commits/issues data in background.

**Request Body:**
```json
{
  "github_url": "https://github.com/owner/repo"
}
```

**Supported URL Formats:**
- `https://github.com/owner/repo`
- `https://github.com/owner/repo.git`
- `git@github.com:owner/repo.git`
- `owner/repo`

**Request:**
```bash
curl -X POST http://localhost:8000/api/projects/add \
  -H "Content-Type: application/json" \
  -d '{
    "github_url": "https://github.com/kubernetes/kubernetes"
  }'
```

**Response (New Project):**
```json
{
  "status": "success",
  "message": "Successfully added kubernetes/kubernetes",
  "project": {
    "id": "kubernetes-kubernetes",
    "name": "kubernetes",
    "owner": "kubernetes",
    "repo": "kubernetes",
    "description": "Custom repository: kubernetes/kubernetes",
    "foundation": "Custom",
    "governance_url": "https://github.com/kubernetes/kubernetes"
  },
  "extraction": {
    "files_found": 8,
    "extraction_time": 2.45
  },
  "indexing": {
    "chunks_created": 127,
    "chunks_stored": 127,
    "project_id": "kubernetes-kubernetes"
  },
  "data_loading": {
    "status": "loading_in_background",
    "message": "Commits and issues data is being loaded in the background. Governance questions can be asked immediately.",
    "commits_loaded": false,
    "issues_loaded": false,
    "data_source": "pending"
  },
  "summary": {
    "README.md": {"size_bytes": 12458, "extraction_method": "github_api"},
    "CONTRIBUTING.md": {"size_bytes": 8234, "extraction_method": "github_api"},
    "GOVERNANCE.md": {"size_bytes": 5621, "extraction_method": "github_api"}
  }
}
```

**Response (Already Exists):**
```json
{
  "status": "already_exists",
  "message": "Project kubernetes/kubernetes is already indexed in the system",
  "project": {
    "id": "kubernetes-kubernetes",
    "name": "kubernetes",
    "owner": "kubernetes",
    "repo": "kubernetes"
  },
  "data_loading": {
    "status": "available",
    "message": "All data available"
  }
}
```

**Error Response (400 - Invalid URL):**
```json
{
  "detail": "Invalid GitHub URL format. Expected: https://github.com/owner/repo or owner/repo"
}
```

**Error Response (400 - Extraction Failed):**
```json
{
  "detail": "Error extracting project docs: Repository not found"
}
```

**Document Types Indexed:**
- README.md
- CONTRIBUTING.md
- GOVERNANCE.md
- CODE_OF_CONDUCT.md
- SECURITY.md
- LICENSE
- MAINTAINERS.md
- CODEOWNERS
- OWNERS

---

### 10. Refresh Project Data

**Endpoint:** `POST /projects/{project_id}/refresh`

**Purpose:** Refresh commits and issues data for a project by fetching fresh data from the scraping API (no cache).

**Request:**
```bash
curl -X POST http://localhost:8000/api/projects/kubernetes-kubernetes/refresh \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully refreshed data for kubernetes/kubernetes",
  "project_id": "kubernetes-kubernetes",
  "data_loading": {
    "data_source": "api",
    "commits_loaded": true,
    "issues_loaded": true,
    "commits_count": 112453,
    "issues_count": 28734,
    "message": "✅ Fetched from API | 112453 commits, 28734 issues"
  }
}
```

**Error Response (404):**
```json
{
  "detail": "Project not found"
}
```

**Error Response (500 - API Failed):**
```json
{
  "detail": "❌ API failed: Repository too large. Please try again later or check the commits/issues scraper service."
}
```

**Use Case:** Get latest commits/issues after significant repository activity.

---

### 11. Get Project Details

**Endpoint:** `GET /projects/{project_id}`

**Purpose:** Get detailed information about a specific project including indexing status.

**Request:**
```bash
curl http://localhost:8000/api/projects/kubernetes-kubernetes
```

**Response:**
```json
{
  "id": "kubernetes-kubernetes",
  "name": "kubernetes",
  "owner": "kubernetes",
  "repo": "kubernetes",
  "description": "Production-Grade Container Orchestration",
  "foundation": "CNCF",
  "governance_url": "https://github.com/kubernetes/kubernetes",
  "indexed": true,
  "chunk_count": 312
}
```

**Error Response (404):**
```json
{
  "detail": "Project not found"
}
```

---

### 12. Crawl & Index Project Documents

**Endpoint:** `POST /crawl/{project_id}`

**Purpose:** Manually trigger document extraction and indexing for an existing project (re-index governance docs).

**Request:**
```bash
curl -X POST http://localhost:8000/api/crawl/kubernetes-kubernetes \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "project_id": "kubernetes-kubernetes",
  "status": "success",
  "extraction": {
    "files_found": 9,
    "extraction_time": 3.12
  },
  "indexing": {
    "chunks_created": 348,
    "chunks_stored": 348,
    "project_id": "kubernetes-kubernetes"
  },
  "summary": {
    "README.md": {"size_bytes": 12458, "extraction_method": "github_api"},
    "GOVERNANCE.md": {"size_bytes": 5621, "extraction_method": "github_api"}
  }
}
```

**Error Response (404):**
```json
{
  "detail": "Project not found"
}
```

---

### 13. Delete Project Index

**Endpoint:** `DELETE /projects/{project_id}/index`

**Purpose:** Delete all indexed documents for a project from ChromaDB.

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/projects/kubernetes-kubernetes/index
```

**Response:**
```json
{
  "status": "success",
  "project_id": "kubernetes-kubernetes"
}
```

**Error Response (404):**
```json
{
  "detail": "No documents found for project"
}
```

---

## Query & Search

### 14. Query Project (Main Conversational Endpoint)

**Endpoint:** `POST /query`

**Purpose:** Multi-modal query endpoint with intelligent intent routing. Routes queries to appropriate pipeline (governance docs, commits, issues, or general LLM).

**Request Body:**
```json
{
  "project_id": "kubernetes-kubernetes",
  "query": "How do I contribute to this project?",
  "max_results": 5,
  "temperature": 0,
  "stream": false,
  "use_llm_classification": false,
  "conversation_history": [],
  "conversation_state": {
    "running_summary": "",
    "last_exchange": null,
    "turn_count": 0
  }
}
```

**Intent Types:**
- `OUT_OF_SCOPE` - Greetings, off-topic queries
- `GENERAL` - General questions (no project context)
- `PROJECT_DOC_BASED` - Governance, documentation, contribution guidelines
- `COMMITS` - Contributor activity, commit history
- `ISSUES` - Issue tracking, bug reports, pull requests

**Example 1: Governance Query**

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "kubernetes-kubernetes",
    "query": "How do I contribute to this project?",
    "max_results": 5,
    "temperature": 0
  }'
```

**Response:**
```json
{
  "project_id": "kubernetes-kubernetes",
  "query": "How do I contribute to this project?",
  "response": "To contribute to Kubernetes, follow these steps:\n\n1. **Fork the repository** on GitHub by clicking the 'Fork' button\n2. **Clone your fork** to your local machine using `git clone`\n3. **Install dependencies** with `make` and ensure tests pass\n4. **Make changes** in a new branch\n5. **Run tests** with `make test` to ensure nothing breaks\n6. **Submit a Pull Request** with a clear description of your changes\n\nFor detailed guidelines, refer to the [CONTRIBUTING.md](https://github.com/kubernetes/kubernetes/blob/master/CONTRIBUTING.md) file.",
  "sources": [
    {
      "file_path": "CONTRIBUTING.md",
      "file_type": "contributing",
      "chunk_number": 3,
      "score": 0.89,
      "content": "To contribute to this AI-SDK project, follow these steps as outlined in the CONTRIBUTING.md document:\n\n1. Fork the repository on GitHub..."
    },
    {
      "file_path": "README.md",
      "file_type": "readme",
      "chunk_number": 8,
      "score": 0.76,
      "content": "Kubernetes welcomes contributions from the community..."
    }
  ],
  "metadata": {
    "intent": "PROJECT_DOC_BASED",
    "confidence": 0.95,
    "data_source": "vector_db",
    "context_length": 2847,
    "llm_model": "mistral:7b",
    "generation_time_ms": 1247
  },
  "suggested_questions": [
    "What coding standards should I follow?",
    "Who are the project maintainers?",
    "Does this project have a code of conduct?"
  ],
  "conversation_state": {
    "running_summary": "User asked about contribution process for kubernetes project.",
    "last_exchange": {
      "user": "How do I contribute to this project?",
      "assistant": "To contribute to Kubernetes, follow these steps..."
    },
    "turn_count": 1
  }
}
```

**Example 2: Commits Query**

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "kubernetes-kubernetes",
    "query": "Who are the top 5 contributors in the last 6 months?"
  }'
```

**Response:**
```json
{
  "project_id": "kubernetes-kubernetes",
  "query": "Who are the top 5 contributors in the last 6 months?",
  "response": "Based on commit activity over the last 6 months, the top 5 contributors are:\n\n1. **jordan-liggitt** - 342 commits\n2. **dims** - 287 commits\n3. **liggitt** - 234 commits\n4. **thockin** - 198 commits\n5. **sttts** - 176 commits\n\nThese contributors have been highly active in maintaining and improving the Kubernetes codebase.",
  "sources": [
    {
      "file_path": "Commit: a7f3c21d",
      "file_type": "commits",
      "score": 1.0,
      "content": "jordan-liggitt - pkg/apis/core/validation/validation.go (2025-11-20)"
    },
    {
      "file_path": "Commit: b9e2f44a",
      "file_type": "commits",
      "score": 0.9,
      "content": "dims - cmd/kubeadm/app/cmd/upgrade/plan.go (2025-11-18)"
    }
  ],
  "metadata": {
    "intent": "COMMITS",
    "confidence": 0.90,
    "data_source": "csv",
    "records_found": 1237,
    "llm_model": "mistral:7b",
    "generation_time_ms": 892
  },
  "suggested_questions": [
    "What files did jordan-liggitt work on recently?",
    "Show me commits from the last month",
    "Which contributors worked on the API server?"
  ],
  "conversation_state": {
    "running_summary": "User queried top contributors by commit count.",
    "last_exchange": {
      "user": "Who are the top 5 contributors in the last 6 months?",
      "assistant": "Based on commit activity over the last 6 months..."
    },
    "turn_count": 1
  }
}
```

**Example 3: Issues Query**

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "kubernetes-kubernetes",
    "query": "How many open issues are there?"
  }'
```

**Response (Aggregation - No LLM):**
```json
{
  "project_id": "kubernetes-kubernetes",
  "query": "How many open issues are there?",
  "response": "There are **2,847 open issues** and **25,887 closed issues** (28,734 total). These issues were reported by 12,456 unique contributors.",
  "sources": [
    {
      "file_path": "Issues Statistics",
      "file_type": "issues",
      "score": 1.0,
      "content": "Total: 28734, Open: 2847, Closed: 25887, Reporters: 12456"
    }
  ],
  "metadata": {
    "intent": "ISSUES",
    "data_source": "csv",
    "query_type": "aggregation",
    "stats": {
      "total_issues": 28734,
      "open_issues": 2847,
      "closed_issues": 25887,
      "unique_reporters": 12456
    }
  },
  "suggested_questions": [
    "Show me the most recent open issues",
    "Which issues have the most comments?",
    "Show me bug reports from last week"
  ]
}
```

**Example 4: Out of Scope Query**

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "kubernetes-kubernetes",
    "query": "What is the weather today?"
  }'
```

**Response:**
```json
{
  "project_id": "kubernetes-kubernetes",
  "query": "What is the weather today?",
  "response": "I'm a project governance assistant designed to help you understand open-source project documentation, contribution guidelines, maintainers, issues, and commit history. Please ask me questions about the selected project's governance, contributors, issues, or commits.",
  "sources": [],
  "metadata": {
    "intent": "OUT_OF_SCOPE",
    "confidence": 0.99,
    "data_source": "out_of_scope"
  },
  "suggested_questions": [
    "How do I contribute to this project?",
    "Who are the project maintainers?",
    "Show me recent commits"
  ]
}
```

**Error Response (No Project Selected):**
```json
{
  "project_id": "none",
  "query": "Show me the commits",
  "response": "Please select a project first to query project-specific information.",
  "sources": [],
  "metadata": {
    "intent": "COMMITS",
    "error": "no_project_selected"
  }
}
```

**Error Response (Data Still Loading):**
```json
{
  "project_id": "kubernetes-kubernetes",
  "query": "Show me the top contributors",
  "response": "The commits data is still being fetched from the repository (Elapsed: 23s). The commits/issues scraper API is processing the data. Please try your question again in a few seconds.",
  "sources": [],
  "metadata": {
    "intent": "COMMITS",
    "data_source": "csv",
    "error": "commits_fetching",
    "fetch_status": "fetching",
    "elapsed_seconds": 23
  }
}
```

**Error Response (Fetch Failed):**
```json
{
  "project_id": "kubernetes-kubernetes",
  "query": "Show me commits",
  "response": "Commits and Issues data could not be fetched for this project successfully. The data might be too large or the repository might be temporarily unavailable. Please try re-adding the repository.",
  "sources": [],
  "metadata": {
    "intent": "COMMITS",
    "data_source": "csv",
    "error": "commits_fetch_failed",
    "fetch_status": "failed",
    "elapsed_seconds": 45,
    "api_error": "Repository too large: timeout after 30s"
  }
}
```

---

### 15. Semantic Search

**Endpoint:** `POST /search`

**Purpose:** Perform semantic search in project documents without LLM generation (raw retrieval only).

**Request Body:**
```json
{
  "project_id": "kubernetes-kubernetes",
  "query": "governance structure",
  "n_results": 5,
  "file_types": ["governance", "readme"]
}
```

**Request:**
```bash
curl -X POST http://localhost:8000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "kubernetes-kubernetes",
    "query": "governance structure",
    "n_results": 5,
    "file_types": ["governance", "readme"]
  }'
```

**Response:**
```json
{
  "query": "governance structure",
  "project_id": "kubernetes-kubernetes",
  "total_results": 5,
  "results": [
    {
      "file_path": "GOVERNANCE.md",
      "file_type": "governance",
      "chunk_number": 2,
      "score": 0.92,
      "content": "The Kubernetes project is governed by a steering committee consisting of 7 members elected annually by contributors..."
    },
    {
      "file_path": "README.md",
      "file_type": "readme",
      "chunk_number": 15,
      "score": 0.78,
      "content": "Kubernetes governance is designed to be transparent and inclusive..."
    }
  ]
}
```

**Use Case:** Debugging retrieval, understanding what documents would be retrieved for a query.

---

## Statistics

### 16. Get System Statistics

**Endpoint:** `GET /stats`

**Purpose:** Get overall system statistics including collection stats and project counts.

**Request:**
```bash
curl http://localhost:8000/api/stats
```

**Response:**
```json
{
  "collection": {
    "total_chunks": 1247,
    "projects_indexed": 6,
    "project_distribution": {
      "kubernetes-kubernetes": 312,
      "pytorch-pytorch": 428,
      "tensorflow-tensorflow": 507
    }
  },
  "projects": {
    "indexed": 6
  }
}
```

---

## Error Codes Reference

| Status Code | Meaning | Common Causes |
|------------|---------|---------------|
| 400 | Bad Request | Invalid GitHub URL, malformed JSON |
| 404 | Not Found | Project doesn't exist, no documents found |
| 500 | Internal Server Error | Ollama server down, ChromaDB error, API timeout |

---

## Rate Limiting

**Current Implementation:** No rate limiting (should be added in production)

**Recommended Limits:**
- `/query`: 60 requests/minute per IP
- `/projects/add`: 10 requests/hour per IP
- `/search`: 100 requests/minute per IP

---

## Authentication

**Current Implementation:** ⚠️ **No authentication** on most endpoints

**Security Recommendations:**
1. Add OAuth 2.0 / JWT authentication
2. Protect admin endpoints (`/admin/reset`) with API keys
3. Implement user quotas for `/projects/add`
4. Add CORS restrictions in production

---

## Production Deployment Notes

### Environment Variables

```bash
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=mistral:7b
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHROMADB_HOST=localhost
CHROMADB_PORT=8000
API_BASE_URL=https://tianna-unretractive-ellen.ngrok-free.dev
```

### Health Check Endpoints for Load Balancers

- **Primary:** `GET /health` (simple, fast)
- **Detailed:** `GET /system-status` (checks LLM + DB)

### Background Task Monitoring

When adding repositories, commits/issues data loads in background. Monitor with:

```bash
# Check if data is available
curl http://localhost:8000/api/projects/kubernetes-kubernetes

# Response includes:
{
  "indexed": true,
  "chunk_count": 312  # > 0 means governance indexed
}
```

---

## Example Usage Flows

### Flow 1: Add Repository & Query Governance

```bash
# Step 1: Add repository
curl -X POST http://localhost:8000/api/projects/add \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/kubernetes/kubernetes"}'

# Step 2: Wait ~5-10 seconds for governance indexing to complete

# Step 3: Query governance (works immediately after indexing)
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "kubernetes-kubernetes",
    "query": "How do I contribute?"
  }'

# Step 4: Wait 30-60 seconds for commits/issues data to load in background

# Step 5: Query commits (works after background fetch completes)
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "kubernetes-kubernetes",
    "query": "Who are the top contributors?"
  }'
```

### Flow 2: Refresh Stale Data

```bash
# Refresh commits/issues to get latest activity
curl -X POST http://localhost:8000/api/projects/kubernetes-kubernetes/refresh

# Query fresh data
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "kubernetes-kubernetes",
    "query": "Show me commits from this week"
  }'
```

### Flow 3: System Health Check

```bash
# Quick health check
curl http://localhost:8000/api/health

# Detailed status (check Ollama, ChromaDB)
curl http://localhost:8000/api/system-status

# Get statistics
curl http://localhost:8000/api/stats
```

---

## Troubleshooting

### Problem: "Ollama server not reachable"

**Solution:**
```bash
# Check if Ollama is running
ollama list

# Start Ollama if needed
ollama serve

# Pull Mistral model if not available
ollama pull mistral:7b
```

### Problem: "Commits data is still being fetched"

**Solution:** Wait 30-60 seconds for background API fetch to complete. Large repos may take longer.

### Problem: "No relevant project documents found"

**Solution:**
```bash
# Re-crawl project documents
curl -X POST http://localhost:8000/api/crawl/kubernetes-kubernetes
```

### Problem: "Repository too large: timeout"

**Solution:** The commits/issues scraper API has a 30s timeout. For very large repos (>100k commits), data fetching may fail. Consider:
1. Using a subset of recent data
2. Increasing scraper API timeout
3. Implementing pagination

---

## Support

For API issues or feature requests, visit:
- **GitHub Issues:** https://github.com/RepoWise/RepoWise/issues
- **Documentation:** https://repowise.github.io/RepoWise-website/
- **Research Paper:** MSR 2025 Tool Demonstration Track

---

**Last Updated:** 2025-11-25
**API Version:** 1.0.0
**Maintainer:** DECAL Lab, UC Davis
