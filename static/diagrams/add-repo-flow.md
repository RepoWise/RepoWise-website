# RepoWise - Add Repository Flow Diagram

## Complete Process Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API as Backend API
    participant Parser as URL Parser
    participant ChromaDB
    participant Extractor as Doc Extractor
    participant GitHub as GitHub API
    participant Chunker as Semantic Chunker
    participant Embedder as Embedder<br/>(MiniLM-L6-v2)
    participant VectorStore as ChromaDB<br/>Vector Store
    participant Scraper as External Scraper<br/>(Background)
    participant CSV as CSV Engine<br/>(Background)

    User->>Frontend: Enter GitHub URL
    Frontend->>API: POST /api/projects/add

    rect rgb(240, 248, 255)
        Note over API,Parser: Phase 1: Validation
        API->>Parser: Parse GitHub URL
        Parser->>Parser: Extract owner/repo
        Parser->>Parser: Generate project_id
        Parser-->>API: owner, repo, project_id
    end

    rect rgb(255, 250, 240)
        Note over API,ChromaDB: Phase 2: Check Existing
        API->>ChromaDB: Check if project exists
        alt Project Already Exists
            ChromaDB-->>API: Project found
            API-->>Frontend: Already indexed
            Frontend-->>User: Repository already added
        end
    end

    rect rgb(240, 255, 240)
        Note over API,GitHub: Phase 3: Document Extraction
        API->>Extractor: Extract project docs

        par Parallel Extraction Methods
            Extractor->>GitHub: Contents API<br/>(Common paths)
            GitHub-->>Extractor: Standard files
        and
            Extractor->>GitHub: Git Trees API<br/>(Recursive scan)
            GitHub-->>Extractor: Complete file tree
        end

        Extractor->>Extractor: Merge & deduplicate

        loop For each doc file
            Extractor->>GitHub: Fetch file content
            GitHub-->>Extractor: File content (UTF-8)
        end

        Extractor->>Extractor: Build extraction result
        Extractor-->>API: Extracted docs + metadata
    end

    rect rgb(255, 245, 238)
        Note over API,VectorStore: Phase 4: Indexing (Blocking)
        API->>Chunker: Chunk documents

        loop For each document
            Chunker->>Chunker: Split at semantic breaks<br/>(800 chars, 100 overlap)
            Chunker->>Chunker: Add chunk metadata
        end

        Chunker-->>API: List of chunks

        API->>Embedder: Generate embeddings
        Embedder->>Embedder: Load MiniLM-L6-v2 model
        Embedder->>Embedder: Batch process (32 chunks)
        Embedder->>Embedder: Create 384-dim vectors
        Embedder-->>API: Embedding vectors

        API->>VectorStore: Add documents
        VectorStore->>VectorStore: Create collection<br/>project_docs_{id}
        VectorStore->>VectorStore: Batch insert<br/>(5000 per batch)
        VectorStore->>VectorStore: Persist to disk
        VectorStore-->>API: Index stats
    end

    API-->>Frontend: Success response
    Frontend-->>User: Repository added!<br/>Loading commits/issues...

    rect rgb(255, 240, 245)
        Note over Scraper,CSV: Phase 5: Background Data (Non-blocking)

        par Background Processing
            API->>Scraper: Fetch commits & issues
            Scraper->>Scraper: External API call<br/>(5 min timeout)
            Scraper->>Scraper: Retry logic (3x)<br/>Exponential backoff
            Scraper-->>API: Raw commits & issues

            API->>CSV: Load data
            CSV->>CSV: Convert to DataFrame
            CSV->>CSV: Normalize columns
            CSV->>CSV: Convert dates (UTC)
            CSV->>CSV: Cache in memory
            CSV-->>API: Load status
        end

        API->>API: Update fetch status<br/>(ready/failed)
    end

    User->>Frontend: Ready to ask questions!
```

## Simplified User-Facing Flow

```mermaid
flowchart TD
    Start([User enters GitHub URL]) --> Parse[Parse URL<br/>Extract owner/repo]
    Parse --> Check{Repository<br/>already added?}

    Check -->|Yes| AlreadyExists[Return existing project]
    Check -->|No| Extract[Extract Documentation<br/>README, CONTRIBUTING, etc.]

    Extract --> Chunk[Smart Chunking<br/>~800 chars with overlap]
    Chunk --> Embed[Generate Embeddings<br/>384-dim vectors]
    Embed --> Store[Store in ChromaDB<br/>Vector Database]
    Store --> Response[Return Success<br/>Docs indexed!]

    Response --> Background[Background: Fetch Commits & Issues]
    Background --> DataFrame[Load into DataFrames<br/>Ready for queries]
    DataFrame --> Ready([Ready to answer questions!])

    AlreadyExists --> Ready

    style Start fill:#e1f5ff
    style Extract fill:#fff4e1
    style Chunk fill:#f0fff4
    style Embed fill:#fff0f5
    style Store fill:#f5f0ff
    style Background fill:#ffe1e1
    style Ready fill:#e1ffe1
```

## Technical Component Breakdown

```mermaid
graph TB
    subgraph Frontend["Frontend Layer"]
        UI[HTML Form<br/>GitHub URL Input]
    end

    subgraph API["API Layer"]
        Route["/api/projects/add<br/>FastAPI Endpoint"]
        Parser[URL Parser<br/>Support multiple formats]
    end

    subgraph Extraction["Document Extraction"]
        DocExt[ProjectDocExtractor]
        Method1[Contents API<br/>Fast, limited]
        Method2[Git Trees API<br/>Complete scan]
        Method3[File Content API<br/>Actual content]
    end

    subgraph RAG["RAG Pipeline"]
        Chunk[Semantic Chunker<br/>800/100 chars]
        Embed[Sentence Transformers<br/>all-MiniLM-L6-v2]
        Vector[ChromaVectorStore<br/>Cosine similarity]
    end

    subgraph Background["Background Processing"]
        Scraper[External Scraper API<br/>Commits & Issues]
        CSV[CSV Data Engine<br/>Pandas DataFrames]
        Status[Fetch Status Tracker]
    end

    subgraph Storage["Persistent Storage"]
        Chroma[(ChromaDB<br/>Vector Database)]
        Cache[(In-Memory Cache<br/>DataFrames)]
    end

    UI --> Route
    Route --> Parser
    Parser --> DocExt

    DocExt --> Method1
    DocExt --> Method2
    Method1 --> Method3
    Method2 --> Method3

    Method3 --> Chunk
    Chunk --> Embed
    Embed --> Vector
    Vector --> Chroma

    Route -.->|Async| Scraper
    Scraper --> CSV
    CSV --> Cache
    CSV --> Status

    style Frontend fill:#e1f5ff
    style API fill:#fff4e1
    style Extraction fill:#f0fff4
    style RAG fill:#fff0f5
    style Background fill:#ffe1e1
    style Storage fill:#f5f0ff
```

## Data Flow During Add Repository

```mermaid
stateDiagram-v2
    [*] --> URLSubmitted: User submits URL
    URLSubmitted --> Parsing: Extract owner/repo
    Parsing --> Validation: Check format

    Validation --> ExistenceCheck: Valid URL
    Validation --> Error: Invalid URL

    ExistenceCheck --> Extraction: New project
    ExistenceCheck --> [*]: Already exists

    state Extraction {
        [*] --> ContentsAPI
        [*] --> TreesAPI
        ContentsAPI --> Merge
        TreesAPI --> Merge
        Merge --> FetchContent
        FetchContent --> [*]
    }

    Extraction --> Indexing: Docs extracted

    state Indexing {
        [*] --> Chunking
        Chunking --> Embedding
        Embedding --> VectorStorage
        VectorStorage --> [*]
    }

    Indexing --> ResponseSent: Governance indexed
    ResponseSent --> BackgroundFetch: Continue async

    state BackgroundFetch {
        [*] --> FetchCommits
        [*] --> FetchIssues
        FetchCommits --> LoadCSV
        FetchIssues --> LoadCSV
        LoadCSV --> UpdateStatus
        UpdateStatus --> [*]
    }

    BackgroundFetch --> [*]: Complete
    Error --> [*]: Return error
```

## Time Breakdown (Typical Repository)

| Phase | Duration | Blocking? | Description |
|-------|----------|-----------|-------------|
| URL Parse | <100ms | ✅ Yes | Extract owner/repo |
| Existence Check | <200ms | ✅ Yes | Query ChromaDB |
| Doc Extraction | 2-5s | ✅ Yes | GitHub API calls |
| Chunking | 500ms-1s | ✅ Yes | Split documents |
| Embedding | 1-3s | ✅ Yes | Generate vectors (CPU) |
| ChromaDB Insert | 500ms-1s | ✅ Yes | Persist vectors |
| **User sees success** | **~5-10s** | - | Frontend updated |
| Commits/Issues Fetch | 30-60s | ❌ No | External scraper |
| DataFrame Loading | 2-5s | ❌ No | Pandas processing |
| **Fully ready** | **~40-70s** | - | All data available |
