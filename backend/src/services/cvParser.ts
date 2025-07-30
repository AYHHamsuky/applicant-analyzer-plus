import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { ParsedCV } from '../types';

export class CVParsingService {
  
  /**
   * Extract text from uploaded CV file
   */
  async extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
    try {
      if (mimeType === 'application/pdf') {
        return await this.extractFromPDF(filePath);
      } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await this.extractFromDOCX(filePath);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error('Failed to extract text from CV');
    }
  }

  /**
   * Extract text from PDF file
   */
  private async extractFromPDF(filePath: string): Promise<string> {
    const fs = require('fs');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  /**
   * Extract text from DOCX file
   */
  private async extractFromDOCX(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  /**
   * Parse CV text and extract structured information
   */
  parseCV(text: string): ParsedCV {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Initialize result
    const result: ParsedCV = {
      name: '',
      email: '',
      phone: '',
      skills: [],
      experience: '',
      education: '',
      summary: ''
    };

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      result.email = emailMatch[0];
    }

    // Extract phone number
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\b\d{10}\b/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      result.phone = phoneMatch[0];
    }

    // Extract name (usually first non-empty line or line before email)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 2 && line.length < 50 && !line.includes('@') && !line.match(/\d{3,}/)) {
        result.name = line;
        break;
      }
    }

    // Extract skills using common keywords and patterns
    result.skills = this.extractSkills(text);

    // Extract experience section
    result.experience = this.extractSection(text, ['experience', 'work', 'employment', 'career']);

    // Extract education section
    result.education = this.extractSection(text, ['education', 'qualification', 'degree', 'academic']);

    // Create summary from first few sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    result.summary = sentences.slice(0, 3).join('. ').trim();
    if (result.summary.length > 200) {
      result.summary = result.summary.substring(0, 200) + '...';
    }

    return result;
  }

  /**
   * Extract skills from CV text
   */
  private extractSkills(text: string): string[] {
    const commonSkills = [
      // Programming languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
      'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS',
      
      // Frameworks and libraries
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
      'jQuery', 'Bootstrap', 'Tailwind', 'Next.js', 'Nuxt.js', 'Svelte',
      
      // Databases
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQLite', 'Oracle',
      
      // Cloud and DevOps
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Git', 'GitHub',
      'GitLab', 'Terraform', 'Ansible',
      
      // Other technologies
      'REST', 'GraphQL', 'API', 'Microservices', 'Agile', 'Scrum', 'Machine Learning',
      'AI', 'Data Science', 'Analytics', 'Testing', 'Unit Testing', 'Integration Testing'
    ];

    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();

    commonSkills.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (lowerText.includes(skillLower)) {
        foundSkills.push(skill);
      }
    });

    // Also look for skills in dedicated skills section
    const skillsSection = this.extractSection(text, ['skills', 'technologies', 'competencies']);
    if (skillsSection) {
      const additionalSkills = skillsSection.split(/[,\n\r;]/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 30)
        .slice(0, 10); // Limit to avoid noise
      
      additionalSkills.forEach(skill => {
        if (!foundSkills.some(fs => fs.toLowerCase() === skill.toLowerCase())) {
          foundSkills.push(skill);
        }
      });
    }

    return foundSkills.slice(0, 20); // Limit to 20 skills
  }

  /**
   * Extract a specific section from CV text
   */
  private extractSection(text: string, keywords: string[]): string {
    const lines = text.split('\n');
    let sectionStart = -1;
    let sectionEnd = -1;

    // Find section start
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (keywords.some(keyword => line.includes(keyword))) {
        sectionStart = i;
        break;
      }
    }

    if (sectionStart === -1) return '';

    // Find section end (next major section or end of document)
    const majorSections = ['experience', 'education', 'skills', 'projects', 'awards', 'certifications'];
    for (let i = sectionStart + 1; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      if (majorSections.some(section => line.includes(section)) && !keywords.some(kw => line.includes(kw))) {
        sectionEnd = i;
        break;
      }
    }

    if (sectionEnd === -1) sectionEnd = lines.length;

    return lines.slice(sectionStart, sectionEnd).join('\n').trim();
  }
}