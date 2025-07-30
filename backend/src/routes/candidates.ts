import express, { Request, Response } from 'express';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { upload, handleUploadError } from '../middleware/upload';
import { CVParsingService } from '../services/cvParser';
import database from '../database';
import { Candidate } from '../types';

const router = express.Router();
const cvParser = new CVParsingService();

// Validation schemas
const createCandidateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  experience: z.string().optional(),
  skills: z.array(z.string()).optional()
});

const updateCandidateSchema = createCandidateSchema.partial();

// Helper function to generate ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// GET /api/candidates - List all candidates with filtering/sorting
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, skills, minScore, maxScore, sortBy = 'created_at', order = 'DESC' } = req.query;
    
    let sql = 'SELECT * FROM candidates WHERE 1=1';
    const params: any[] = [];

    // Apply search filter
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Apply skills filter
    if (skills && typeof skills === 'string') {
      const skillList = skills.split(',');
      skillList.forEach(skill => {
        sql += ' AND skills LIKE ?';
        params.push(`%${skill.trim()}%`);
      });
    }

    // Apply sorting
    const validSortFields = ['name', 'email', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${sortOrder}`;

    const rows = await database.all(sql, params);
    
    // Parse JSON fields
    const candidates = rows.map((row: any) => ({
      ...row,
      skills: row.skills ? JSON.parse(row.skills) : []
    }));

    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// GET /api/candidates/:id - Get specific candidate details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const row = await database.get('SELECT * FROM candidates WHERE id = ?', [id]);
    
    if (!row) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const candidate = {
      ...row,
      skills: row.skills ? JSON.parse(row.skills) : []
    };

    res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// POST /api/candidates - Create new candidate with CV upload
router.post('/', upload.single('cv'), handleUploadError, async (req: Request, res: Response) => {
  try {
    let candidateData: any = {};

    if (req.file) {
      // Process uploaded CV
      const text = await cvParser.extractTextFromFile(req.file.path, req.file.mimetype);
      const parsedCV = cvParser.parseCV(text);
      
      candidateData = {
        name: parsedCV.name,
        email: parsedCV.email,
        phone: parsedCV.phone,
        experience: parsedCV.experience,
        skills: parsedCV.skills,
        cv_file_path: req.file.path
      };
    } else {
      // Manual candidate creation
      const result = createCandidateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: 'Invalid data', details: result.error.errors });
      }
      candidateData = result.data;
    }

    // Generate ID and timestamps
    const id = generateId();
    const now = new Date().toISOString();

    const candidate: Candidate = {
      id,
      name: candidateData.name || 'Unknown',
      email: candidateData.email || '',
      phone: candidateData.phone || '',
      experience: candidateData.experience || '',
      skills: candidateData.skills || [],
      cv_file_path: candidateData.cv_file_path || '',
      created_at: now,
      updated_at: now
    };

    // Insert into database
    await database.run(
      `INSERT INTO candidates (id, name, email, phone, experience, skills, cv_file_path, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        candidate.id,
        candidate.name,
        candidate.email,
        candidate.phone,
        candidate.experience,
        JSON.stringify(candidate.skills),
        candidate.cv_file_path,
        candidate.created_at,
        candidate.updated_at
      ]
    );

    res.status(201).json(candidate);
  } catch (error) {
    console.error('Error creating candidate:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// PUT /api/candidates/:id - Update candidate information
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = updateCandidateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid data', details: result.error.errors });
    }

    const updates = result.data;
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      updateFields.push(`${key} = ?`);
      updateValues.push(key === 'skills' ? JSON.stringify(value) : value);
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(id);

    await database.run(
      `UPDATE candidates SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Fetch updated candidate
    const row = await database.get('SELECT * FROM candidates WHERE id = ?', [id]);
    if (!row) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const candidate = {
      ...row,
      skills: row.skills ? JSON.parse(row.skills) : []
    };

    res.json(candidate);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// DELETE /api/candidates/:id - Delete candidate
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get candidate to check if CV file exists
    const candidate = await database.get('SELECT cv_file_path FROM candidates WHERE id = ?', [id]);
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Delete from database
    await database.run('DELETE FROM candidates WHERE id = ?', [id]);
    
    // Also delete related records
    await database.run('DELETE FROM candidate_scores WHERE candidate_id = ?', [id]);
    await database.run('DELETE FROM candidate_skills WHERE candidate_id = ?', [id]);

    // Delete CV file if it exists
    if (candidate.cv_file_path && fs.existsSync(candidate.cv_file_path)) {
      fs.unlinkSync(candidate.cv_file_path);
    }

    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router;