import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { useUploadCV, useCreateJob, useAnalyzeBulk } from '@/hooks/useApi';
import { ProcessedCV, JobRequirement, candidateToProcessedCV, jobRequirementToJob } from '@/types/candidate';

interface CVUploadProps {
  onFilesProcessed: (files: ProcessedCV[]) => void;
  jobRequirements?: JobRequirement;
}

export const CVUpload = ({ onFilesProcessed, jobRequirements }: CVUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadCVMutation = useUploadCV();
  const createJobMutation = useCreateJob();
  const analyzeBulkMutation = useAnalyzeBulk();

  // Process uploaded files and analyze against job requirements
  const processFiles = async (files: File[]): Promise<ProcessedCV[]> => {
    const processedCVs: ProcessedCV[] = [];
    let jobId: string | null = null;

    try {
      // Create job if job requirements exist
      if (jobRequirements) {
        const jobData = jobRequirementToJob(jobRequirements);
        const job = await createJobMutation.mutateAsync({
          title: jobData.title!,
          description: jobData.description!,
          requirements: jobData.requirements!,
          required_skills: jobData.required_skills!
        });
        jobId = job.id;
      }

      // Upload each CV file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 50); // First 50% for uploading

        try {
          const candidate = await uploadCVMutation.mutateAsync(file);
          
          // Convert to ProcessedCV format for compatibility
          const processedCV = candidateToProcessedCV(candidate);
          processedCVs.push(processedCV);

          toast({
            title: "CV Processed",
            description: `Successfully processed CV for ${candidate.name}`,
          });
        } catch (error) {
          console.error(`Failed to process ${file.name}:`, error);
          toast({
            title: "Upload Failed",
            description: `Failed to process ${file.name}: ${error}`,
            variant: "destructive",
          });
        }
      }

      // If we have job requirements and candidates, analyze them
      if (jobId && processedCVs.length > 0) {
        setProgress(75);
        
        try {
          const analysisResult = await analyzeBulkMutation.mutateAsync(jobId);
          
          // Update processedCVs with scores and skill analysis
          const updatedCVs = processedCVs.map(cv => {
            const result = analysisResult.results.find(r => r.candidate.id === cv.id);
            if (result) {
              return {
                ...cv,
                score: result.score.overall_score,
                matchingSkills: result.matching_skills,
                missingSkills: result.missing_skills
              };
            }
            return cv;
          });

          setProgress(100);
          return updatedCVs.sort((a, b) => b.score - a.score);
        } catch (error) {
          console.error('Analysis failed:', error);
          toast({
            title: "Analysis Warning",
            description: "CVs uploaded but analysis failed. You can view candidates in dashboard.",
            variant: "destructive",
          });
        }
      }

      setProgress(100);
      return processedCVs;
    } catch (error) {
      console.error('Process failed:', error);
      throw error;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadedFiles(files);
    handleProcessFiles(files);
  };

  const handleProcessFiles = async (files: File[]) => {
    setUploading(true);
    setProgress(0);

    try {
      const processedCVs = await processFiles(files);
      onFilesProcessed(processedCVs);

      toast({
        title: "Upload Complete",
        description: `Successfully processed ${processedCVs.length} CV(s)`,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to process CV files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
      setUploadedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type === 'application/pdf' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only PDF, DOC, and DOCX files are supported",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setUploadedFiles(validFiles);
      handleProcessFiles(validFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <Card className="p-8 max-w-2xl mx-auto">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Upload CVs</h2>
          <p className="text-muted-foreground">
            Upload candidate CVs for automatic parsing and analysis
          </p>
        </div>

        {!uploading ? (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 space-y-4 hover:border-primary/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex justify-center">
              <Upload className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Drop CVs here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, DOC, and DOCX files up to 10MB each
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Processing CVs...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Processing {uploadedFiles.length} file(s):</p>
              <div className="space-y-1">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {jobRequirements && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Job Requirements Set</span>
            </div>
            <p className="text-xs text-muted-foreground">
              CVs will be automatically scored against the requirements for "{jobRequirements.title}"
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};