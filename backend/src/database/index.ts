import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database.sqlite');

// Enable verbose mode for debugging
sqlite3.verbose();

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.initTables();
      }
    });
  }

  private initTables(): void {
    const queries = [
      // Candidates table
      `CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        experience TEXT,
        skills TEXT, -- JSON array as string
        cv_file_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Jobs table
      `CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        requirements TEXT,
        required_skills TEXT, -- JSON array as string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Candidate scores table
      `CREATE TABLE IF NOT EXISTS candidate_scores (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        job_id TEXT NOT NULL,
        overall_score REAL NOT NULL,
        skill_match_score REAL NOT NULL,
        experience_score REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates (id),
        FOREIGN KEY (job_id) REFERENCES jobs (id)
      )`,

      // Candidate skills table
      `CREATE TABLE IF NOT EXISTS candidate_skills (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        proficiency_level INTEGER DEFAULT 1,
        FOREIGN KEY (candidate_id) REFERENCES candidates (id)
      )`
    ];

    queries.forEach(query => {
      this.db.run(query, (err) => {
        if (err) {
          console.error('Error creating table:', err);
        }
      });
    });
  }

  public getDb(): sqlite3.Database {
    return this.db;
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }

  // Helper method to run queries with promises
  public run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  // Helper method to get single row
  public get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Helper method to get all rows
  public all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

export const database = new Database();
export default database;