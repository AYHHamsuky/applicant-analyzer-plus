import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CandidateCard } from './CandidateCard';
import { ProcessedCV, JobRequirement } from '@/types/candidate';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Clock,
  Search,
  Filter,
  SortAsc,
  BarChart3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  candidates: ProcessedCV[];
  jobRequirements: JobRequirement | null;
  onViewCandidate: (candidate: ProcessedCV) => void;
}

export const Dashboard = ({ candidates, jobRequirements, onViewCandidate }: DashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'experience'>('score');

  // Calculate dashboard statistics
  const totalCandidates = candidates.length;
  const highScoreCandidates = candidates.filter(c => c.score >= 80).length;
  const avgScore = candidates.length > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
    : 0;

  // Filter and sort candidates
  const filteredCandidates = candidates
    .filter(candidate => 
      candidate.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.score - a.score;
        case 'name':
          return a.candidateName.localeCompare(b.candidateName);
        case 'experience':
          return b.experience.localeCompare(a.experience);
        default:
          return b.score - a.score;
      }
    });

  const getScoreDistribution = () => {
    const excellent = candidates.filter(c => c.score >= 80).length;
    const good = candidates.filter(c => c.score >= 60 && c.score < 80).length;
    const fair = candidates.filter(c => c.score < 60).length;
    return { excellent, good, fair };
  };

  const distribution = getScoreDistribution();

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No candidates yet</h3>
          <p>Upload CVs to start analyzing candidates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Candidate Dashboard</h2>
          <p className="text-muted-foreground">
            {jobRequirements ? `Screening for: ${jobRequirements.title}` : 'General candidate analysis'}
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-primary text-white border-none">
          <BarChart3 className="w-4 h-4 mr-1" />
          {totalCandidates} Candidates Analyzed
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Candidates</p>
              <p className="text-2xl font-bold text-foreground">{totalCandidates}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Award className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Matches</p>
              <p className="text-2xl font-bold text-foreground">{highScoreCandidates}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-info/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recently Added</p>
              <p className="text-2xl font-bold text-foreground">{totalCandidates}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Score Distribution
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-success">{distribution.excellent}</div>
            <div className="text-sm text-muted-foreground">Excellent (80-100%)</div>
            <div className="h-2 bg-success/20 rounded-full">
              <div 
                className="h-full bg-success rounded-full transition-all duration-500"
                style={{ width: `${totalCandidates > 0 ? (distribution.excellent / totalCandidates) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-warning">{distribution.good}</div>
            <div className="text-sm text-muted-foreground">Good (60-79%)</div>
            <div className="h-2 bg-warning/20 rounded-full">
              <div 
                className="h-full bg-warning rounded-full transition-all duration-500"
                style={{ width: `${totalCandidates > 0 ? (distribution.good / totalCandidates) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-destructive">{distribution.fair}</div>
            <div className="text-sm text-muted-foreground">Needs Review (&lt;60%)</div>
            <div className="h-2 bg-destructive/20 rounded-full">
              <div 
                className="h-full bg-destructive rounded-full transition-all duration-500"
                style={{ width: `${totalCandidates > 0 ? (distribution.fair / totalCandidates) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search candidates by name or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={sortBy === 'score' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('score')}
          >
            <SortAsc className="w-4 h-4 mr-1" />
            Score
          </Button>
          <Button
            variant={sortBy === 'name' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('name')}
          >
            Name
          </Button>
          <Button
            variant={sortBy === 'experience' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('experience')}
          >
            Experience
          </Button>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Candidates ({filteredCandidates.length})
          </h3>
          {searchTerm && (
            <Badge variant="outline">
              Filtered by: "{searchTerm}"
            </Badge>
          )}
        </div>
        
        <div className="grid gap-6">
          {filteredCandidates.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              rank={index + 1}
              onViewDetails={onViewCandidate}
            />
          ))}
        </div>
      </div>

      {filteredCandidates.length === 0 && candidates.length > 0 && (
        <div className="text-center py-8">
          <div className="text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No candidates match your search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
};