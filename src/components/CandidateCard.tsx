import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProcessedCV } from './CVUpload';
import { 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Award,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  Star
} from 'lucide-react';

interface CandidateCardProps {
  candidate: ProcessedCV;
  rank: number;
  onViewDetails: (candidate: ProcessedCV) => void;
}

export const CandidateCard = ({ candidate, rank, onViewDetails }: CandidateCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/10 border-destructive/20';
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'bg-gradient-primary text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="p-6 hover:shadow-elevated transition-all duration-300 animate-fade-in bg-gradient-card">
      <div className="space-y-4">
        {/* Header with rank and score */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(rank)}`}>
              #{rank}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{candidate.candidateName}</h3>
              <p className="text-sm text-muted-foreground">{candidate.fileName}</p>
            </div>
          </div>
          
          <div className={`text-right border rounded-lg p-3 ${getScoreBg(candidate.score)}`}>
            <div className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
              {candidate.score}%
            </div>
            <div className="text-xs text-muted-foreground">Match Score</div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4" />
            <span>{candidate.email}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4" />
            <span>{candidate.phone}</span>
          </div>
        </div>

        {/* Experience and Education */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Briefcase className="w-4 h-4 text-primary" />
            <span className="font-medium">Experience:</span>
            <span className="text-muted-foreground">{candidate.experience}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="font-medium">Education:</span>
            <span className="text-muted-foreground">{candidate.education}</span>
          </div>
        </div>

        {/* Skills Overview */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">Matching Skills:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {candidate.matchingSkills.map((skill, index) => (
                <Badge key={index} variant="default" className="text-xs bg-success/10 text-success border-success/20">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {candidate.missingSkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium">Missing Skills:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {candidate.missingSkills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress bar for visual score representation */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Match</span>
            <span className={getScoreColor(candidate.score)}>{candidate.score}%</span>
          </div>
          <Progress value={candidate.score} className="h-2" />
        </div>

        {/* Summary */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
          {candidate.summary}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onViewDetails(candidate)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download CV
          </Button>
          <Button variant="outline" size="sm">
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};