import express, { Request, Response } from 'express';
import { z } from 'zod';
import database from '../database';
import { Job } from '../types';

const router = express.Router();

// Validation schemas
const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  requirements: z.string().max(2000),
  required_skills: z.array(z.string()).min(1)
});

const updateJobSchema = createJobSchema.partial();

// Helper function to generate ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// GET /api/jobs - List job postings
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, sortBy = 'created_at', order = 'DESC' } = req.query;
    
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params: any[] = [];

    // Apply search filter
    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Apply sorting
    const validSortFields = ['title', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${sortOrder}`;

    const rows = await database.all(sql, params);
    
    // Parse JSON fields
    const jobs = rows.map((row: any) => ({
      ...row,
      required_skills: row.required_skills ? JSON.parse(row.required_skills) : []
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// GET /api/jobs/:id - Get specific job details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = await database.get('SELECT * FROM jobs WHERE id = ?', [id]);
    
    if (!row) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = {
      ...row,
      required_skills: row.required_skills ? JSON.parse(row.required_skills) : []
    };

    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// POST /api/jobs - Create job posting
router.post('/', async (req: Request, res: Response) => {
  try {
    const result = createJobSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid data', details: result.error.errors });
    }

    const jobData = result.data;
    const id = generateId();
    const now = new Date().toISOString();

    const job: Job = {
      id,
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements,
      required_skills: jobData.required_skills,
      created_at: now,
      updated_at: now
    };

    // Insert into database
    await database.run(
      `INSERT INTO jobs (id, title, description, requirements, required_skills, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        job.id,
        job.title,
        job.description,
        job.requirements,
        JSON.stringify(job.required_skills),
        job.created_at,
        job.updated_at
      ]
    );

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// PUT /api/jobs/:id - Update job posting
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = updateJobSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid data', details: result.error.errors });
    }

    const updates = result.data;
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      updateFields.push(`${key} = ?`);
      updateValues.push(key === 'required_skills' ? JSON.stringify(value) : value);
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(id);

    await database.run(
      `UPDATE jobs SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated job
    const row = await database.get('SELECT * FROM jobs WHERE id = ?', [id]);
    if (!row) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = {
      ...row,
      required_skills: row.required_skills ? JSON.parse(row.required_skills) : []
    };

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// DELETE /api/jobs/:id - Delete job posting
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if job exists
    const job = await database.get('SELECT id FROM jobs WHERE id = ?', [id]);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Delete from database
    await database.run('DELETE FROM jobs WHERE id = ?', [id]);
    
    // Also delete related scores
    await database.run('DELETE FROM candidate_scores WHERE job_id = ?', [id]);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;