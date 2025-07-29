import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface CVUploadProps {
  onFilesProcessed: (files: ProcessedCV[]) => void;
}

export interface ProcessedCV {
  id: string;
  fileName: string;
  candidateName: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  score: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
}

export const CVUpload = ({ onFilesProcessed }: CVUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mock CV parsing simulation
  const simulateCVParsing = async (file: File): Promise<ProcessedCV> => {
    const mockCandidates = [
      {
        candidateName: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 234 567 8901',
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Git'],
        experience: '5 years in Full Stack Development',
        education: 'BS Computer Science - Stanford University',
        summary: 'Experienced full-stack developer with strong background in modern web technologies.',
        matchingSkills: ['React', 'TypeScript', 'Node.js'],
        missingSkills: ['Docker', 'Kubernetes']
      },
      {
        candidateName: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 234 567 8902',
        skills: ['JavaScript', 'React', 'MongoDB', 'Express', 'Docker'],
        experience: '3 years in Frontend Development',
        education: 'MS Software Engineering - MIT',
        summary: 'Frontend specialist with experience in modern JavaScript frameworks.',
        matchingSkills: ['React', 'JavaScript'],
        missingSkills: ['TypeScript', 'AWS']
      },
      {
        candidateName: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1 234 567 8903',
        skills: ['Python', 'Django', 'PostgreSQL', 'AWS', 'CI/CD', 'React'],
        experience: '7 years in Backend Development',
        education: 'PhD Computer Science - UC Berkeley',
        summary: 'Senior backend engineer with expertise in scalable systems.',
        matchingSkills: ['Python', 'AWS', 'React'],
        missingSkills: ['TypeScript']
      }
    ];

    const candidate = mockCandidates[Math.floor(Math.random() * mockCandidates.length)];
    const score = Math.floor(Math.random() * 40) + 60; // 60-100 range

    return {
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      score,
      ...candidate
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadedFiles(files);
    processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    setUploading(true);
    setProgress(0);
    
    const processedCVs: ProcessedCV[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const processed = await simulateCVParsing(file);
        processedCVs.push(processed);
        
        setProgress(((i + 1) / files.length) * 100);
        
        toast({
          title: "CV Processed",
          description: `Successfully parsed ${file.name}`,
        });
      } catch (error) {
        toast({
          title: "Processing Error",
          description: `Failed to process ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    setUploading(false);
    onFilesProcessed(processedCVs);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFiles(files);
      processFiles(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Card className="p-8 animate-fade-in">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-primary rounded-full shadow-glow">
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">Upload CVs for Analysis</h3>
          <p className="text-muted-foreground">
            Drop your CV files here or click to browse. Supports PDF, DOC, and DOCX formats.
          </p>
        </div>

        <div
          className="border-2 border-dashed border-border rounded-lg p-12 hover:border-primary/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center space-y-4">
            <FileText className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">Choose files or drag and drop</p>
              <p className="text-sm text-muted-foreground">PDF, DOC, DOCX up to 10MB each</p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Processing CVs... {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {uploadedFiles.length > 0 && !uploading && (
          <div className="space-y-2">
            <h4 className="font-medium">Uploaded Files:</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
            ))}
          </div>
        )}

        <Button 
          variant="hero" 
          size="lg" 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Processing...' : 'Select CVs to Upload'}
        </Button>
      </div>
    </Card>
  );
};