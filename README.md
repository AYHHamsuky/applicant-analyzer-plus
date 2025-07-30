# Applicant Analyzer Plus

A complete full-stack applicant analysis system with SQLite database integration for CV processing, candidate scoring, and analytics.

## Architecture

### Backend (Express.js + TypeScript + SQLite)
- **API Server**: Express.js with TypeScript, CORS, and security middleware
- **Database**: SQLite with custom schema for candidates, jobs, scores, and skills
- **CV Processing**: PDF/DOCX parsing with text extraction and skill detection
- **Scoring System**: Intelligent candidate ranking based on skill matching and experience
- **File Upload**: Secure CV file upload with validation and storage

### Frontend (React + TypeScript + Vite)
- **UI Components**: Shadcn/ui components with Tailwind CSS
- **State Management**: React Query for server state and API integration
- **File Upload**: Drag-and-drop CV upload with progress tracking
- **Real-time Analysis**: Live candidate scoring and ranking
- **Responsive Design**: Mobile-friendly interface with modern styling

## Features Implemented

### ✅ Complete Backend API
- **Candidate Management**
  - `POST /api/candidates` - Create candidate (manual or CV upload)
  - `GET /api/candidates` - List candidates with filtering/sorting
  - `GET /api/candidates/:id` - Get candidate details
  - `PUT /api/candidates/:id` - Update candidate
  - `DELETE /api/candidates/:id` - Delete candidate

- **Job Management**
  - `POST /api/jobs` - Create job posting
  - `GET /api/jobs` - List job postings
  - `GET /api/jobs/:id` - Get job details
  - `PUT /api/jobs/:id` - Update job
  - `DELETE /api/jobs/:id` - Delete job

- **Analysis & Scoring**
  - `POST /api/analyze/:candidateId/:jobId` - Analyze specific candidate for job
  - `GET /api/analyze/scores/:jobId` - Get all candidate scores for job
  - `GET /api/analyze/candidate/:candidateId` - Get all scores for candidate
  - `POST /api/analyze/bulk/:jobId` - Analyze all candidates for job

- **Analytics**
  - `GET /api/analytics` - Dashboard analytics and statistics

### ✅ SQLite Database Schema
```sql
-- Candidates table
CREATE TABLE candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  experience TEXT,
  skills TEXT, -- JSON array
  cv_file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  required_skills TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Candidate scores table
CREATE TABLE candidate_scores (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  overall_score REAL NOT NULL,
  skill_match_score REAL NOT NULL,
  experience_score REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Candidate skills table
CREATE TABLE candidate_skills (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency_level INTEGER DEFAULT 1
);
```

### ✅ CV Processing Pipeline
1. **File Upload**: Secure multipart upload with validation
2. **Text Extraction**: PDF/DOCX parsing using pdf-parse and mammoth
3. **Information Extraction**: 
   - Name, email, phone number detection
   - Skills extraction from common technology lists
   - Experience section parsing
   - Education section parsing
4. **Candidate Creation**: Automatic candidate record creation

### ✅ Intelligent Scoring System
- **Skill Matching**: Exact and partial skill matches with weighted scoring
- **Experience Analysis**: Keyword matching and experience length evaluation
- **Overall Score**: Weighted combination (60% skills, 40% experience)
- **Missing Skills**: Analysis of gaps between candidate and job requirements

### ✅ Frontend Integration
- **Real API Integration**: All components now use real backend APIs
- **React Query Hooks**: Optimistic updates and cache management
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Progress indicators and async state management
- **Type Safety**: Full TypeScript integration with backend types

## Development Setup

### Backend Setup
```bash
cd backend
npm install
npm run dev  # Starts on port 3001
```

### Frontend Setup
```bash
npm install
npm run dev  # Starts on port 8080
```

### Database
- SQLite database is created automatically on first run
- Located at `backend/database.sqlite`
- No migrations needed - tables created automatically

## API Testing Examples

### Create a Candidate
```bash
curl -X POST http://localhost:3001/api/candidates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "experience": "5 years of React development",
    "skills": ["React", "TypeScript", "Node.js"]
  }'
```

### Upload CV
```bash
curl -X POST http://localhost:3001/api/candidates \
  -F "cv=@path/to/resume.pdf"
```

### Create Job
```bash
curl -X POST http://localhost:3001/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "description": "Looking for experienced developer",
    "requirements": "3-5 years experience",
    "required_skills": ["React", "Node.js", "TypeScript"]
  }'
```

### Analyze Candidate
```bash
curl -X POST http://localhost:3001/api/analyze/{candidateId}/{jobId}
```

## Project Structure

```
├── backend/                     # Express.js backend
│   ├── src/
│   │   ├── controllers/         # Route handlers
│   │   ├── database/           # Database connection & setup
│   │   ├── middleware/         # Upload & validation middleware
│   │   ├── routes/             # API route definitions
│   │   ├── services/           # Business logic (CV parsing, scoring)
│   │   ├── types/              # TypeScript interfaces
│   │   └── server.ts           # Main server file
│   ├── uploads/                # CV file storage
│   └── database.sqlite         # SQLite database
├── src/                        # React frontend
│   ├── components/             # React components
│   ├── hooks/                  # React Query hooks
│   ├── services/              # API client
│   ├── types/                 # TypeScript interfaces
│   └── pages/                 # Page components
└── README.md
```

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite3
- **File Processing**: pdf-parse, mammoth
- **Validation**: Zod
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui + Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Key Features

✅ **Complete Backend Implementation**: Full REST API with SQLite database  
✅ **Real CV Processing**: PDF/DOCX parsing with skill extraction  
✅ **Intelligent Scoring**: Multi-factor candidate ranking algorithm  
✅ **File Upload System**: Secure CV upload with validation  
✅ **Modern Frontend**: React with real API integration  
✅ **Type Safety**: End-to-end TypeScript implementation  
✅ **Error Handling**: Comprehensive error states and validation  
✅ **Responsive Design**: Mobile-friendly interface  
✅ **Real-time Updates**: Live scoring and analysis  

## Demo

![CV Upload Interface](https://github.com/user-attachments/assets/e8ce42e1-038e-4f93-a7ea-c491db7f7118)

The application features a complete workflow:
1. **Welcome Screen**: Professional landing page with feature overview
2. **Job Requirements**: Form to define candidate criteria and required skills
3. **CV Upload**: Drag-and-drop interface for bulk CV processing
4. **Dashboard**: Real-time candidate ranking and analysis results
5. **Candidate Details**: Detailed candidate profiles with scoring breakdown

## Next Steps

Potential enhancements for future development:
- Add user authentication and multi-tenancy
- Implement more sophisticated NLP for CV parsing
- Add candidate communication features
- Create admin dashboard for system management
- Add bulk export functionality
- Implement candidate pipeline management
- Add interview scheduling integration
