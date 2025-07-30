import { Candidate, Job, CandidateScore } from '../types';

export class ScoringService {
  
  /**
   * Calculate overall candidate score for a specific job
   */
  calculateCandidateScore(candidate: Candidate, job: Job): CandidateScore {
    const skillMatchScore = this.calculateSkillMatchScore(candidate.skills, job.required_skills);
    const experienceScore = this.calculateExperienceScore(candidate.experience, job.requirements);
    const overallScore = this.calculateOverallScore(skillMatchScore, experienceScore);

    return {
      id: this.generateId(),
      candidate_id: candidate.id,
      job_id: job.id,
      overall_score: Math.round(overallScore * 100) / 100,
      skill_match_score: Math.round(skillMatchScore * 100) / 100,
      experience_score: Math.round(experienceScore * 100) / 100,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Calculate skill matching score (0-100)
   */
  private calculateSkillMatchScore(candidateSkills: string[], requiredSkills: string[]): number {
    if (!requiredSkills || requiredSkills.length === 0) return 50;
    if (!candidateSkills || candidateSkills.length === 0) return 0;

    let exactMatches = 0;
    let partialMatches = 0;

    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    
    requiredSkills.forEach(requiredSkill => {
      const requiredLower = requiredSkill.toLowerCase();
      
      // Check for exact match
      if (candidateSkillsLower.includes(requiredLower)) {
        exactMatches++;
      } 
      // Check for partial match (contains or similar)
      else if (candidateSkillsLower.some(candidateSkill => 
        candidateSkill.includes(requiredLower) || requiredLower.includes(candidateSkill)
      )) {
        partialMatches++;
      }
    });

    // Calculate score: exact matches worth more than partial matches
    const exactScore = (exactMatches / requiredSkills.length) * 80;
    const partialScore = (partialMatches / requiredSkills.length) * 20;
    
    return Math.min(100, exactScore + partialScore);
  }

  /**
   * Calculate experience score based on description match (0-100)
   */
  private calculateExperienceScore(candidateExperience: string, jobRequirements: string): number {
    if (!candidateExperience || !jobRequirements) return 50;

    const experienceWords = this.extractKeywords(candidateExperience.toLowerCase());
    const requirementWords = this.extractKeywords(jobRequirements.toLowerCase());

    if (requirementWords.length === 0) return 50;

    let matches = 0;
    requirementWords.forEach(reqWord => {
      if (experienceWords.some(expWord => 
        expWord.includes(reqWord) || reqWord.includes(expWord)
      )) {
        matches++;
      }
    });

    const score = (matches / requirementWords.length) * 100;
    
    // Bonus for experience length (more detailed experience = higher score)
    const lengthBonus = Math.min(20, candidateExperience.length / 100);
    
    return Math.min(100, score + lengthBonus);
  }

  /**
   * Calculate overall weighted score
   */
  private calculateOverallScore(skillMatchScore: number, experienceScore: number): number {
    // Weight: 60% skills, 40% experience
    return (skillMatchScore * 0.6) + (experienceScore * 0.4);
  }

  /**
   * Extract meaningful keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Remove common words and extract meaningful terms
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);

    return text
      .split(/\W+/)
      .filter(word => 
        word.length > 2 && 
        !commonWords.has(word.toLowerCase()) &&
        !word.match(/^\d+$/)
      )
      .map(word => word.toLowerCase())
      .slice(0, 50); // Limit to avoid performance issues
  }

  /**
   * Get matching and missing skills for analysis
   */
  getSkillAnalysis(candidateSkills: string[], requiredSkills: string[]): {
    matching: string[];
    missing: string[];
  } {
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    const matching: string[] = [];
    const missing: string[] = [];

    requiredSkills.forEach(requiredSkill => {
      const requiredLower = requiredSkill.toLowerCase();
      
      if (candidateSkillsLower.some(candidateSkill => 
        candidateSkill.includes(requiredLower) || requiredLower.includes(candidateSkill)
      )) {
        matching.push(requiredSkill);
      } else {
        missing.push(requiredSkill);
      }
    });

    return { matching, missing };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}