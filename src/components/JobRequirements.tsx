import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, Briefcase, Code, Settings } from 'lucide-react';
import { JobRequirement } from '@/types/candidate';

interface JobRequirementsProps {
  onRequirementsSet: (requirements: JobRequirement) => void;
}

export const JobRequirements = ({ onRequirementsSet }: JobRequirementsProps) => {
  const { toast } = useToast();
  const [newSkill, setNewSkill] = useState('');
  const [requirements, setRequirements] = useState<JobRequirement>({
    title: 'Full Stack Developer',
    department: 'Engineering',
    experience: '3-5 years',
    skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
    description: 'We are looking for an experienced Full Stack Developer to join our engineering team.'
  });

  const addSkill = () => {
    if (newSkill.trim() && !requirements.skills.includes(newSkill.trim())) {
      setRequirements({
        ...requirements,
        skills: [...requirements.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setRequirements({
      ...requirements,
      skills: requirements.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requirements.skills.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one required skill",
        variant: "destructive",
      });
      return;
    }
    
    onRequirementsSet(requirements);
    toast({
      title: "Job Requirements Set",
      description: "CV screening will now match against these requirements",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Card className="p-6 animate-fade-in">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Job Requirements</h3>
            <p className="text-muted-foreground">Define the criteria for candidate evaluation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={requirements.title}
                onChange={(e) => setRequirements({...requirements, title: e.target.value})}
                placeholder="e.g., Full Stack Developer"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={requirements.department}
                onChange={(e) => setRequirements({...requirements, department: e.target.value})}
                placeholder="e.g., Engineering"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Required Experience</Label>
            <Input
              id="experience"
              value={requirements.experience}
              onChange={(e) => setRequirements({...requirements, experience: e.target.value})}
              placeholder="e.g., 3-5 years"
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Required Skills</Label>
            
            <div className="flex space-x-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a required skill"
                className="flex-1"
              />
              <Button type="button" onClick={addSkill} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {requirements.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {requirements.skills.map((skill, index) => (
                  <Badge key={index} variant="default" className="flex items-center space-x-1">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={requirements.description}
              onChange={(e) => setRequirements({...requirements, description: e.target.value})}
              placeholder="Describe the role and responsibilities..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full">
            <Briefcase className="w-4 h-4 mr-2" />
            Set Job Requirements
          </Button>
        </form>

        {/* Current Requirements Summary */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-3">Current Requirements Summary:</h4>
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div><strong>Position:</strong> {requirements.title} - {requirements.department}</div>
            <div><strong>Experience:</strong> {requirements.experience}</div>
            <div><strong>Skills:</strong> {requirements.skills.join(', ')}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};