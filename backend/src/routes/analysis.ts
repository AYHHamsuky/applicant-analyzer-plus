import express, { Request, Response } from 'express';
import database from '../database';
import { ScoringService } from '../services/scoring';
import { Candidate, Job, AnalysisResult } from '../types';

const router = express.Router();
const scoringService = new ScoringService();

// Helper function to generate ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// POST /api/analyze/:candidateId/:jobId - Analyze candidate for specific job
router.post('/:candidateId/:jobId', async (req: Request, res: Response) => {
  try {
    const { candidateId, jobId } = req.params;

    // Fetch candidate
    const candidateRow = await database.get('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    if (!candidateRow) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Fetch job
    const jobRow = await database.get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (!jobRow) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Parse JSON fields
    const candidate: Candidate = {
      ...candidateRow,
      skills: candidateRow.skills ? JSON.parse(candidateRow.skills) : []
    };

    const job: Job = {
      ...jobRow,
      required_skills: jobRow.required_skills ? JSON.parse(jobRow.required_skills) : []
    };

    // Calculate scores
    const score = scoringService.calculateCandidateScore(candidate, job);
    
    // Get skill analysis
    const skillAnalysis = scoringService.getSkillAnalysis(candidate.skills, job.required_skills);

    // Check if score already exists
    const existingScore = await database.get(
      'SELECT id FROM candidate_scores WHERE candidate_id = ? AND job_id = ?',
      [candidateId, jobId]
    );

    if (existingScore) {
      // Update existing score
      await database.run(
        `UPDATE candidate_scores 
         SET overall_score = ?, skill_match_score = ?, experience_score = ?, created_at = ?
         WHERE candidate_id = ? AND job_id = ?`,
        [
          score.overall_score,
          score.skill_match_score,
          score.experience_score,
          score.created_at,
          candidateId,
          jobId
        ]
      );
    } else {
      // Insert new score
      await database.run(
        `INSERT INTO candidate_scores (id, candidate_id, job_id, overall_score, skill_match_score, experience_score, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          score.id,
          score.candidate_id,
          score.job_id,
          score.overall_score,
          score.skill_match_score,
          score.experience_score,
          score.created_at
        ]
      );
    }

    const result: AnalysisResult = {
      candidate,
      score,
      matching_skills: skillAnalysis.matching,
      missing_skills: skillAnalysis.missing
    };

    res.json(result);
  } catch (error) {
    console.error('Error analyzing candidate:', error);
    res.status(500).json({ error: 'Failed to analyze candidate' });
  }
});

// GET /api/analyze/scores/:jobId - Get all candidate scores for a job
router.get('/scores/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const { sortBy = 'overall_score', order = 'DESC' } = req.query;

    // Validate job exists
    const job = await database.get('SELECT id FROM jobs WHERE id = ?', [jobId]);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Build query with sorting
    const validSortFields = ['overall_score', 'skill_match_score', 'experience_score', 'created_at'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'overall_score';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';

    const sql = `
      SELECT 
        cs.*,
        c.name, c.email, c.phone, c.skills, c.experience
      FROM candidate_scores cs
      JOIN candidates c ON cs.candidate_id = c.id
      WHERE cs.job_id = ?
      ORDER BY cs.${sortField} ${sortOrder}
    `;

    const rows = await database.all(sql, [jobId]);

    const results = rows.map((row: any) => ({
      score: {
        id: row.id,
        candidate_id: row.candidate_id,
        job_id: row.job_id,
        overall_score: row.overall_score,
        skill_match_score: row.skill_match_score,
        experience_score: row.experience_score,
        created_at: row.created_at
      },
      candidate: {
        id: row.candidate_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        skills: row.skills ? JSON.parse(row.skills) : [],
        experience: row.experience
      }
    }));

    res.json(results);
  } catch (error) {
    console.error('Error fetching candidate scores:', error);
    res.status(500).json({ error: 'Failed to fetch candidate scores' });
  }
});

// GET /api/analyze/candidate/:candidateId - Get all scores for a candidate
router.get('/candidate/:candidateId', async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;

    // Validate candidate exists
    const candidate = await database.get('SELECT id FROM candidates WHERE id = ?', [candidateId]);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const sql = `
      SELECT 
        cs.*,
        j.title, j.description, j.required_skills
      FROM candidate_scores cs
      JOIN jobs j ON cs.job_id = j.id
      WHERE cs.candidate_id = ?
      ORDER BY cs.overall_score DESC
    `;

    const rows = await database.all(sql, [candidateId]);

    const results = rows.map((row: any) => ({
      score: {
        id: row.id,
        candidate_id: row.candidate_id,
        job_id: row.job_id,
        overall_score: row.overall_score,
        skill_match_score: row.skill_match_score,
        experience_score: row.experience_score,
        created_at: row.created_at
      },
      job: {
        id: row.job_id,
        title: row.title,
        description: row.description,
        required_skills: row.required_skills ? JSON.parse(row.required_skills) : []
      }
    }));

    res.json(results);
  } catch (error) {
    console.error('Error fetching candidate scores:', error);
    res.status(500).json({ error: 'Failed to fetch candidate scores' });
  }
});

// POST /api/analyze/bulk/:jobId - Analyze all candidates for a job
router.post('/bulk/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    // Fetch job
    const jobRow = await database.get('SELECT * FROM jobs WHERE id = ?', [jobId]);
    if (!jobRow) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job: Job = {
      ...jobRow,
      required_skills: jobRow.required_skills ? JSON.parse(jobRow.required_skills) : []
    };

    // Fetch all candidates
    const candidateRows = await database.all('SELECT * FROM candidates');
    const results: AnalysisResult[] = [];

    for (const candidateRow of candidateRows) {
      const candidate: Candidate = {
        ...candidateRow,
        skills: candidateRow.skills ? JSON.parse(candidateRow.skills) : []
      };

      // Calculate scores
      const score = scoringService.calculateCandidateScore(candidate, job);
      
      // Get skill analysis
      const skillAnalysis = scoringService.getSkillAnalysis(candidate.skills, job.required_skills);

      // Check if score already exists
      const existingScore = await database.get(
        'SELECT id FROM candidate_scores WHERE candidate_id = ? AND job_id = ?',
        [candidate.id, jobId]
      );

      if (existingScore) {
        // Update existing score
        await database.run(
          `UPDATE candidate_scores 
           SET overall_score = ?, skill_match_score = ?, experience_score = ?, created_at = ?
           WHERE candidate_id = ? AND job_id = ?`,
          [
            score.overall_score,
            score.skill_match_score,
            score.experience_score,
            score.created_at,
            candidate.id,
            jobId
          ]
        );
      } else {
        // Insert new score
        await database.run(
          `INSERT INTO candidate_scores (id, candidate_id, job_id, overall_score, skill_match_score, experience_score, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            score.id,
            score.candidate_id,
            score.job_id,
            score.overall_score,
            score.skill_match_score,
            score.experience_score,
            score.created_at
          ]
        );
      }

      results.push({
        candidate,
        score,
        matching_skills: skillAnalysis.matching,
        missing_skills: skillAnalysis.missing
      });
    }

    // Sort by overall score
    results.sort((a, b) => b.score.overall_score - a.score.overall_score);

    res.json({
      job,
      total_candidates: results.length,
      results
    });
  } catch (error) {
    console.error('Error analyzing candidates:', error);
    res.status(500).json({ error: 'Failed to analyze candidates' });
  }
});

export default router;