'use client'; // Ensure this is at the top if not already

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import TemplateCard from "@/components/templates/template-card";
import TemplatePreviewModal from "@/components/templates/template-preview-modal"; // Import the modal
import { BriefcaseIcon, UsersIcon, ScaleIcon, ShieldCheckIcon, HeartHandshake, Building2, FileText, Sparkles } from "lucide-react"; // Example icons
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data for templates
const mockTemplates = [
  {
    id: "1",
    title: "Personal Injury Intake",
    description: "Streamline client intake for personal injury cases. Gathers accident details, injuries, and insurance information.",
    icon: <ScaleIcon className="h-8 w-8" />,
    category: "Legal",
    popularity: "Popular",
    contentPreview: [
      "Client Name", 
      "Date of Accident", 
      "Accident Location", 
      "Brief Description of Injuries",
      "Insurance Provider"
    ]
  },
  {
    id: "2",
    title: "Family Law Consultation",
    description: "Initial consultation for family law matters like divorce, custody, and support. Collects key personal and case information.",
    icon: <UsersIcon className="h-8 w-8" />,
    category: "Legal",
    contentPreview: [
      "Client Full Name", 
      "Spouse Full Name (if applicable)", 
      "Date of Marriage (if applicable)", 
      "Number of Children",
      "Reason for Consultation"
    ]
  },
  {
    id: "3",
    title: "Criminal Defense Initial Contact",
    description: "Essential questions for an initial contact in criminal defense cases, ensuring all critical details are captured upfront.",
    icon: <ShieldCheckIcon className="h-8 w-8" />,
    category: "Legal",
    contentPreview: ["Client Name", "Date of Alleged Offense", "Charges", "Arresting Agency"]
  },
  {
    id: "4",
    title: "General Legal Consultation",
    description: "A versatile template for various legal consultations, adaptable to different practice areas and client needs.",
    icon: <BriefcaseIcon className="h-8 w-8" />,
    category: "Legal",
    popularity: "Popular",
    contentPreview: ["Client Name", "Nature of Inquiry", "Key Dates", "Desired Outcome"]
  },
  {
    id: "5",
    title: "Employee Onboarding",
    description: "Comprehensive onboarding flow for new employees. Covers documentation, policies, and initial setup.",
    icon: <Building2 className="h-8 w-8" />,
    category: "HR",
    popularity: "New",
    contentPreview: ["Employee Name", "Start Date", "Department", "Direct Manager", "Equipment Needs"]
  },
  {
    id: "6",
    title: "Healthcare Patient Intake",
    description: "Patient intake form for healthcare providers. Collects medical history, insurance, and current health concerns.",
    icon: <HeartHandshake className="h-8 w-8" />,
    category: "Healthcare",
    contentPreview: ["Patient Name", "Date of Birth", "Primary Concern", "Medical History", "Current Medications"]
  },
];

// Define a type for your template object if you haven't already
// This should match the structure of mockTemplates and what TemplatePreviewModal expects
interface Template {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode; // Or a more specific type if your icons are consistent
  category: string;
  popularity?: string;
  contentPreview?: string[]; // Added contentPreview field
  // Add other fields here, e.g., content?: string;
}

export default function TemplatesPage() {
  const router = useRouter(); // Get router instance
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(mockTemplates.map(t => t.category))];
  
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleUseTemplate = (template: Template) => {
    console.log('Using template:', template.title, template.id);
    router.push(`/flows/new?templateId=${template.id}`); // Navigate
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates Library</h1>
          <p className="text-muted-foreground mt-1">
            Start building faster with our professionally designed templates
          </p>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Templates
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured template */}
      <div className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-primary/10 via-violet-500/10 to-primary/10 p-6">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <Badge variant="secondary">Featured Template</Badge>
          </div>
          <h3 className="text-xl font-semibold mb-2">Get Started Quickly</h3>
          <p className="text-muted-foreground mb-4 max-w-2xl">
            Our templates are designed by industry experts to help you create professional intake flows in minutes. 
            Each template is fully customizable to match your specific needs.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      </div>

      {/* Templates grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              title={template.title}
              description={template.description}
              icon={template.icon}
              category={template.category}
              popularity={template.popularity}
              onPreview={() => handlePreview(template as Template)}
              onUseTemplate={() => handleUseTemplate(template as Template)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}

      <TemplatePreviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        template={selectedTemplate}
      />
    </div>
  );
} 