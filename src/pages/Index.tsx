import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CVUpload, ProcessedCV } from '@/components/CVUpload';
import { JobRequirements, JobRequirement } from '@/components/JobRequirements';
import { Dashboard } from '@/components/Dashboard';
import { CandidateCard } from '@/components/CandidateCard';
import { 
  Upload, 
  Settings, 
  BarChart3, 
  FileText,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Zap
} from 'lucide-react';
import heroImage from '@/assets/hero-recruitment.jpg';

type AppStep = 'welcome' | 'requirements' | 'upload' | 'dashboard' | 'candidate-detail';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome');
  const [jobRequirements, setJobRequirements] = useState<JobRequirement | null>(null);
  const [candidates, setCandidates] = useState<ProcessedCV[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ProcessedCV | null>(null);

  const handleJobRequirementsSet = (requirements: JobRequirement) => {
    setJobRequirements(requirements);
    setCurrentStep('upload');
  };

  const handleFilesProcessed = (processedCVs: ProcessedCV[]) => {
    setCandidates(prev => [...prev, ...processedCVs]);
    setCurrentStep('dashboard');
  };

  const handleViewCandidate = (candidate: ProcessedCV) => {
    setSelectedCandidate(candidate);
    setCurrentStep('candidate-detail');
  };

  const resetToWelcome = () => {
    setCurrentStep('welcome');
    setJobRequirements(null);
    setCandidates([]);
    setSelectedCandidate(null);
  };

  const renderWelcomeStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/80 z-10" />
        <img 
          src={heroImage} 
          alt="Professional recruitment" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                AI-Powered
                <span className="bg-gradient-primary bg-clip-text text-transparent"> Resume Screening</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Revolutionize your hiring process with intelligent CV parsing, 
                automated candidate ranking, and comprehensive skills analysis.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in">
              <Button 
                variant="hero" 
                size="xl"
                onClick={() => setCurrentStep('requirements')}
                className="group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Intelligent Recruitment Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Streamline your hiring process with our advanced AI-powered screening system
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 text-center hover:shadow-elevated transition-all duration-300 animate-fade-in bg-gradient-card">
            <div className="p-4 bg-gradient-primary rounded-full w-16 h-16 mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Smart CV Parsing</h3>
            <p className="text-muted-foreground">
              Automatically extract and analyze key information from CVs including skills, 
              experience, and education with high accuracy.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-elevated transition-all duration-300 animate-fade-in bg-gradient-card">
            <div className="p-4 bg-gradient-primary rounded-full w-16 h-16 mx-auto mb-6">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Intelligent Ranking</h3>
            <p className="text-muted-foreground">
              Rank candidates based on job requirements with detailed scoring 
              and skill matching algorithms.
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-elevated transition-all duration-300 animate-fade-in bg-gradient-card">
            <div className="p-4 bg-gradient-primary rounded-full w-16 h-16 mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Analytics Dashboard</h3>
            <p className="text-muted-foreground">
              Comprehensive insights and analytics to help make informed 
              hiring decisions with visual data representation.
            </p>
          </Card>
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Simple 3-step process to screen candidates</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="p-4 bg-gradient-primary rounded-full w-16 h-16 mx-auto">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">1. Set Requirements</h3>
              <p className="text-muted-foreground">Define job criteria and required skills</p>
            </div>

            <div className="text-center space-y-4">
              <div className="p-4 bg-gradient-primary rounded-full w-16 h-16 mx-auto">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">2. Upload CVs</h3>
              <p className="text-muted-foreground">Bulk upload and automatic parsing</p>
            </div>

            <div className="text-center space-y-4">
              <div className="p-4 bg-gradient-primary rounded-full w-16 h-16 mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold">3. Review Results</h3>
              <p className="text-muted-foreground">Ranked candidates with detailed analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <Card className="p-12 max-w-2xl mx-auto bg-gradient-card shadow-elevated">
          <Zap className="w-12 h-12 mx-auto mb-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start screening candidates with AI-powered precision today.
          </p>
          <Button 
            variant="hero" 
            size="xl"
            onClick={() => setCurrentStep('requirements')}
          >
            Start Free Analysis
          </Button>
        </Card>
      </div>
    </div>
  );

  const renderProgressIndicator = () => {
    if (currentStep === 'welcome') return null;
    
    const steps = [
      { key: 'requirements', label: 'Requirements', icon: Settings },
      { key: 'upload', label: 'Upload CVs', icon: Upload },
      { key: 'dashboard', label: 'Results', icon: BarChart3 }
    ];

    return (
      <div className="bg-card border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className={`flex items-center space-x-2 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    <div className={`p-2 rounded-full border-2 ${
                      isActive ? 'border-primary bg-primary/10' : 
                      isCompleted ? 'border-success bg-success text-white' : 'border-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${
                      isCompleted ? 'bg-success' : 'bg-border'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeStep();
      
      case 'requirements':
        return (
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <JobRequirements onRequirementsSet={handleJobRequirementsSet} />
            </div>
          </div>
        );
      
      case 'upload':
        return (
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-2xl mx-auto">
              <CVUpload onFilesProcessed={handleFilesProcessed} />
            </div>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="container mx-auto px-6 py-8">
            <Dashboard 
              candidates={candidates}
              jobRequirements={jobRequirements}
              onViewCandidate={handleViewCandidate}
            />
          </div>
        );
      
      case 'candidate-detail':
        return selectedCandidate ? (
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={() => setCurrentStep('dashboard')}>
                  ← Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold">Candidate Details</h1>
              </div>
              <CandidateCard 
                candidate={selectedCandidate}
                rank={candidates.findIndex(c => c.id === selectedCandidate.id) + 1}
                onViewDetails={() => {}}
              />
            </div>
          </div>
        ) : null;
      
      default:
        return renderWelcomeStep();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {currentStep !== 'welcome' && (
        <header className="bg-card border-b shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-primary rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Resume Screening System</h1>
                  <p className="text-sm text-muted-foreground">AI-Powered Candidate Analysis</p>
                </div>
              </div>
              <Button variant="outline" onClick={resetToWelcome}>
                New Analysis
              </Button>
            </div>
          </div>
        </header>
      )}

      {renderProgressIndicator()}
      {renderCurrentStep()}
    </div>
  );
};

export default Index;