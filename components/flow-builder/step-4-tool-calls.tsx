'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BriefcaseIcon, CalendarDaysIcon, InboxIcon, MailIcon, PhoneCallIcon, CheckCircle, Trash2, Plus, AlertTriangle, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSession, signIn } from 'next-auth/react';
import { type QuestionFormValues } from './question-form-modal';
import { nanoid } from 'nanoid';

interface ToolsConfig {
  [key: string]: {
    enabled: boolean;
    config?: Tool['config'];
  };
}

interface HotTransferConfig {
  id: string;
  transferNumber: string;
  triggerQuestion: string;
  triggerResponse: string;
}

interface Step4ToolCallsProps {
  onSubmit: (data: { toolsConfig?: ToolsConfig }) => void;
  onBack: () => void;
  questions?: QuestionFormValues[];
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  category: 'crm' | 'communication' | 'scheduling';
  config?: {
    transferNumber?: string;
    triggerQuestion?: string;
    triggerResponse?: string;
    emailTemplate?: string;
    webhookUrl?: string;
    priority?: 'low' | 'medium' | 'high';
    syncContacts?: boolean;
    createMatters?: boolean;
    createTasks?: boolean;
    assignToUser?: string;
    hotTransfers?: HotTransferConfig[];
  };
}

const mockTools: Tool[] = [
  {
    id: 'clio',
    name: 'Clio Integration',
    description: 'Automatically sync intake data with your Clio account.',
    icon: BriefcaseIcon,
    enabled: false,
    category: 'crm',
    config: {
      syncContacts: true,
      createMatters: false,
      createTasks: true,
      assignToUser: '',
    }
  },
  {
    id: 'litify',
    name: 'Litify Sync',
    description: 'Synchronize intake data with your Litify platform.',
    icon: InboxIcon,
    enabled: false,
    category: 'crm',
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    description: 'Schedule appointments and reminders in Outlook.',
    icon: CalendarDaysIcon,
    enabled: false,
    category: 'scheduling',
  },
  {
    id: 'email',
    name: 'Email Integration',
    description: 'Send automated emails based on call outcomes and responses.',
    icon: MailIcon,
    enabled: false,
    category: 'communication',
    config: {
      emailTemplate: '',
      priority: 'medium'
    }
  },
  {
    id: 'hot-transfer',
    name: 'Hot Transfer',
    description: 'Transfer call to specific numbers based on question responses.',
    icon: PhoneCallIcon,
    enabled: false,
    category: 'communication',
    config: {
      hotTransfers: []
    }
  },
];

const toolCategories = {
  crm: { name: 'CRM & Data Management', description: 'Integrate with your client management systems' },
  communication: { name: 'Communication & Transfer', description: 'Handle call transfers and notifications' },
  scheduling: { name: 'Scheduling & Calendar', description: 'Manage appointments and scheduling' }
};

export default function Step4ToolCalls({ onSubmit, onBack, questions = [] }: Step4ToolCallsProps) {
  const { data: session } = useSession()
  const [tools, setTools] = React.useState<Tool[]>(mockTools);
  const [viewMode, setViewMode] = React.useState<'simple' | 'grouped'>('simple');
  const [validationErrors, setValidationErrors] = React.useState<{[key: string]: string[]}>({});
  const [fieldErrors, setFieldErrors] = React.useState<{[key: string]: {[field: string]: string}}>({});
  
  // New transfer rule form state
  const [newTransferForm, setNewTransferForm] = React.useState<HotTransferConfig>({
    id: '',
    transferNumber: '',
    triggerQuestion: '',
    triggerResponse: ''
  });
  const [newTransferErrors, setNewTransferErrors] = React.useState<{[field: string]: string}>({});
  const [isEditingTransfer, setIsEditingTransfer] = React.useState<string | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);

  const handleToolToggle = (toolId: string) => {
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool
      )
    );
  };

  const handleConfigChange = (toolId: string, config: Partial<Tool['config']>) => {
    setTools(prevTools =>
      prevTools.map(tool =>
        tool.id === toolId ? { ...tool, config: { ...tool.config, ...config } } : tool
      )
    );
  };

  // Hot Transfer Management Functions
  const resetNewTransferForm = () => {
    setNewTransferForm({
      id: '',
      transferNumber: '',
      triggerQuestion: '',
      triggerResponse: ''
    });
    setNewTransferErrors({});
    setIsEditingTransfer(null);
    setIsTransferModalOpen(false);
  };

  const validateNewTransferForm = (): boolean => {
    const errors: {[field: string]: string} = {};
    
    const phoneError = validatePhoneNumber(newTransferForm.transferNumber);
    if (phoneError) errors.transferNumber = phoneError;
    
    if (!newTransferForm.triggerQuestion.trim()) {
      errors.triggerQuestion = "Please select a trigger question";
    }
    
    if (!newTransferForm.triggerResponse.trim()) {
      errors.triggerResponse = "Please describe the trigger response";
    }

    setNewTransferErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveTransferRule = (toolId: string) => {
    if (!validateNewTransferForm()) return;

    const transferToSave: HotTransferConfig = {
      ...newTransferForm,
      id: isEditingTransfer || nanoid()
    };

    setTools(prevTools =>
      prevTools.map(tool =>
        tool.id === toolId 
          ? { 
              ...tool, 
              config: { 
                ...tool.config, 
                hotTransfers: isEditingTransfer 
                  ? (tool.config?.hotTransfers?.map(t => t.id === isEditingTransfer ? transferToSave : t) || [])
                  : [...(tool.config?.hotTransfers || []), transferToSave]
              }
            }
          : tool
      )
    );

    resetNewTransferForm();
  };

  const editTransferRule = (toolId: string, transferId: string) => {
    const tool = tools.find(t => t.id === toolId);
    const transfer = tool?.config?.hotTransfers?.find(t => t.id === transferId);
    if (transfer) {
      setNewTransferForm({ ...transfer });
      setIsEditingTransfer(transferId);
      setIsTransferModalOpen(true);
    }
  };

  const addHotTransfer = (toolId: string) => {
    resetNewTransferForm();
    setIsTransferModalOpen(true);
  };

  const updateHotTransfer = (toolId: string, transferId: string, updates: Partial<HotTransferConfig>) => {
    setTools(prevTools =>
      prevTools.map(tool =>
        tool.id === toolId 
          ? {
              ...tool,
              config: {
                ...tool.config,
                hotTransfers: tool.config?.hotTransfers?.map(transfer =>
                  transfer.id === transferId ? { ...transfer, ...updates } : transfer
                ) || []
              }
            }
          : tool
      )
    );

    // Validate the updated field
    Object.keys(updates).forEach(field => {
      if (updates[field as keyof HotTransferConfig] !== undefined) {
        validateField(toolId, transferId, field, updates[field as keyof HotTransferConfig] as string);
      }
    });
  };

  const removeHotTransfer = (toolId: string, transferId: string) => {
    setTools(prevTools =>
      prevTools.map(tool =>
        tool.id === toolId 
          ? {
              ...tool,
              config: {
                ...tool.config,
                hotTransfers: tool.config?.hotTransfers?.filter(transfer => transfer.id !== transferId) || []
              }
            }
          : tool
      )
    );

    // Clear field errors for the removed transfer
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[transferId];
      return newErrors;
    });
  };

  // Get helpful placeholder text based on question type
  const getTriggerResponsePlaceholder = (questionId: string): string => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return "i.e., 'Yes', 'emergency', 'personal injury', contains keyword, etc.";

    switch (question.answerType) {
      case 'Yes/No':
        return "i.e., 'Yes', 'No', or any variation like 'yeah', 'definitely', 'nope'";
      case 'Radio':
        const radioOptions = question.radioOptions?.map(opt => opt.value).filter(val => val.trim() !== '').slice(0, 3) || [];
        return radioOptions.length > 0 
          ? `i.e., '${radioOptions.join("', '")}', or any similar response`
          : "i.e., any of the available options or similar responses";
      case 'MultiSelect':
        const multiOptions = question.multiSelectOptions?.map(opt => opt.value).filter(val => val.trim() !== '').slice(0, 2) || [];
        return multiOptions.length > 0 
          ? `i.e., '${multiOptions.join("', '")}', contains any of these, or multiple selections`
          : "i.e., any of the available options or when multiple are selected";
      case 'Range':
        return "i.e., 'high value', 'over $100k', 'significant damages', or specific range descriptions";
      case 'Text':
        return "i.e., 'emergency', 'urgent', contains specific keywords, or descriptive phrases";
      case 'Numeric':
        return "i.e., 'over 50', 'less than 10', 'exactly 5', or any numeric comparison";
      default:
        return "i.e., describe the response that should trigger this transfer";
    }
  };

  // Enhanced validation functions
  const validatePhoneNumber = (phoneNumber: string): string | null => {
    if (!phoneNumber.trim()) {
      return "Phone number is required";
    }
    
    // Remove all non-digit characters for length check
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // Check minimum length (US: 10 digits, International: 7-15)
    if (digitsOnly.length < 7) {
      return "Phone number must have at least 7 digits";
    }
    
    if (digitsOnly.length > 15) {
      return "Phone number cannot exceed 15 digits";
    }
    
    // Check format - allow digits, spaces, parentheses, dashes, plus sign
    if (!/^\+?[\d\s\-\(\)\.]+$/.test(phoneNumber)) {
      return "Invalid phone number format. Use only digits, spaces, dashes, parentheses, and +";
    }
    
    // Additional US format validation if it looks like a US number
    if (!phoneNumber.startsWith('+') && digitsOnly.length === 10) {
      // US phone number should not start with 0 or 1
      if (digitsOnly[0] === '0' || digitsOnly[0] === '1') {
        return "US phone numbers cannot start with 0 or 1";
      }
    }
    
    return null;
  };

  const validateTransferField = (transfer: HotTransferConfig, field: string): string | null => {
    switch (field) {
      case 'transferNumber':
        return validatePhoneNumber(transfer.transferNumber);
      case 'triggerQuestion':
        return !transfer.triggerQuestion.trim() ? "Please select a trigger question" : null;
      case 'triggerResponse':
        return !transfer.triggerResponse.trim() ? "Please describe the trigger response" : null;
      default:
        return null;
    }
  };

  const validateHotTransfers = (hotTransfers: HotTransferConfig[]): string[] => {
    const errors: string[] = [];
    const duplicateChecks = new Map<string, number>();

    hotTransfers.forEach((transfer, index) => {
      // Check required fields with detailed validation
      const phoneError = validatePhoneNumber(transfer.transferNumber);
      if (phoneError) {
        errors.push(`Transfer rule #${index + 1}: ${phoneError}`);
      }
      
      if (!transfer.triggerQuestion.trim()) {
        errors.push(`Transfer rule #${index + 1}: Trigger question is required`);
      }
      
      if (!transfer.triggerResponse.trim()) {
        errors.push(`Transfer rule #${index + 1}: Trigger response is required`);
      }

      // Check for duplicates
      const key = `${transfer.triggerQuestion}-${transfer.triggerResponse}`;
      if (transfer.triggerQuestion && transfer.triggerResponse) {
        if (duplicateChecks.has(key)) {
          errors.push(`Transfer rules #${duplicateChecks.get(key)! + 1} and #${index + 1} have the same trigger condition`);
        } else {
          duplicateChecks.set(key, index);
        }
      }
    });

    return errors;
  };

  // Real-time field validation
  const validateField = (toolId: string, transferId: string, field: string, value: string) => {
    const transfer = tools.find(t => t.id === toolId)?.config?.hotTransfers?.find(ht => ht.id === transferId);
    if (!transfer) return;

    const tempTransfer = { ...transfer, [field]: value };
    const error = validateTransferField(tempTransfer, field);
    
    setFieldErrors(prev => ({
      ...prev,
      [transferId]: {
        ...prev[transferId],
        [field]: error || ''
      }
    }));
  };

  const handleFormSubmit = () => {
    const errors: {[key: string]: string[]} = {};

    // Validate each enabled tool
    tools.forEach(tool => {
      if (tool.enabled) {
        if (tool.id === 'hot-transfer' && tool.config?.hotTransfers) {
          const hotTransferErrors = validateHotTransfers(tool.config.hotTransfers);
          if (hotTransferErrors.length > 0) {
            errors[tool.id] = hotTransferErrors;
          }
        }
      }
    });

    setValidationErrors(errors);

    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      return;
    }

    const toolsConfig = tools.reduce((acc, tool) => {
      acc[tool.id] = {
        enabled: tool.enabled,
        config: tool.config
      };
      return acc;
    }, {} as ToolsConfig);
    
    console.log('Step 4 Data:', { toolsConfig });
    
    // Clear all validation errors on successful submit
    setValidationErrors({});
    setFieldErrors({});
    
    onSubmit({ toolsConfig });
  };

  const enabledToolsCount = tools.filter(tool => tool.enabled).length;

  // Add Clio-specific configuration UI
  const renderClioConfig = (tool: Tool) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">Connected to Clio as {session?.user?.name}</span>
        <span className="text-xs text-muted-foreground">({session?.user?.firmName})</span>
      </div>
      
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={tool.config?.syncContacts || false}
            onChange={(e) => handleConfigChange(tool.id, { syncContacts: e.target.checked })}
            className="rounded"
          />
          <span>Create contacts in Clio for new callers</span>
        </Label>
        
        <Label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={tool.config?.createMatters || false}
            onChange={(e) => handleConfigChange(tool.id, { createMatters: e.target.checked })}
            className="rounded"
          />
          <span>Create new matters for qualified leads</span>
        </Label>
        
        <Label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={tool.config?.createTasks || false}
            onChange={(e) => handleConfigChange(tool.id, { createTasks: e.target.checked })}
            className="rounded"
          />
          <span>Create follow-up tasks</span>
        </Label>

        {tool.config?.createTasks && (
          <div className="ml-6 space-y-2">
            <Label htmlFor="assign-to-user">Assign tasks to</Label>
            <Input
              id="assign-to-user"
              placeholder="Enter Clio user ID or leave blank for caller"
              value={tool.config?.assignToUser || ''}
              onChange={(e) => handleConfigChange(tool.id, { assignToUser: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  )

  const renderToolCard = (tool: Tool) => (
    <div key={tool.id} className="space-y-4">
      <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/30">
        <div className="flex items-center space-x-3">
          <tool.icon className="h-6 w-6 text-custom-primary" />
          <div>
            <Label htmlFor={`tool-switch-${tool.id}`} className="font-medium">
              {tool.name}
            </Label>
            <p className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
          </div>
        </div>
        <Switch
          id={`tool-switch-${tool.id}`}
          checked={tool.enabled}
          onCheckedChange={() => handleToolToggle(tool.id)}
          aria-label={`Toggle ${tool.name}`}
          disabled={tool.id === 'clio' && !session} // Disable if not authenticated
        />
      </div>
      
      {tool.enabled && (
        <div className="ml-12 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/30 space-y-4">
          {tool.id === 'clio' && session && renderClioConfig(tool)}
          {tool.id === 'clio' && !session && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Sign in with Clio to configure this integration
              </p>
              <Button onClick={() => signIn("clio")} size="sm">
                Connect Clio Account
              </Button>
            </div>
          )}

          {/* Hot Transfer Configuration */}
          {tool.id === 'hot-transfer' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Hot Transfer Rules</h4>
                  <p className="text-sm text-muted-foreground">Configure call transfers based on question responses</p>
                </div>
                <Button
                  onClick={() => addHotTransfer(tool.id)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Rule
                </Button>
              </div>



              {/* Validation Errors */}
              {validationErrors[tool.id] && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Validation Errors</span>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors[tool.id].map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Saved Transfer Rules List */}
              <div className="space-y-3">
                <h6 className="font-medium text-gray-900 dark:text-gray-100">
                  Saved Transfer Rules ({tool.config?.hotTransfers?.length || 0})
                </h6>
                
                {(!tool.config?.hotTransfers || tool.config.hotTransfers.length === 0) && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <PhoneCallIcon className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No transfer rules saved yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use the form above to create your first transfer rule
                    </p>
                  </div>
                )}

                {tool.config?.hotTransfers?.map((transfer, index) => {
                  const questionText = questions.find(q => q.id === transfer.triggerQuestion)?.questionText || 'Unknown Question';
                  
                  return (
                    <div key={transfer.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 relative">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">Rule #{index + 1}</Badge>
                            <span className="text-sm font-medium">→ {transfer.transferNumber}</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p><strong>When:</strong> "{questionText.substring(0, 50)}{questionText.length > 50 ? '...' : ''}"</p>
                            <p><strong>Response:</strong> "{transfer.triggerResponse}"</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-3">
                          <Button
                            onClick={() => editTransferRule(tool.id, transfer.id)}
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => removeHotTransfer(tool.id, transfer.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tool.id === 'email' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email-template">Email Template</Label>
                <Textarea
                  id="email-template"
                  placeholder="Enter email template content..."
                  value={tool.config?.emailTemplate || ''}
                  onChange={(e) => handleConfigChange(tool.id, { emailTemplate: e.target.value })}
                />
              </div>
              
              {/* Keep priority for email but remove for hot-transfer */}
              <div className="space-y-2">
                <Label htmlFor="email-priority">Priority</Label>
                <select
                  id="email-priority"
                  className="w-full p-2 border rounded-md"
                  value={tool.config?.priority || 'medium'}
                  onChange={(e) => handleConfigChange(tool.id, { priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderSimpleView = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Available Integrations
          {enabledToolsCount > 0 && (
            <Badge variant="secondary">{enabledToolsCount} enabled</Badge>
          )}
        </CardTitle>
        <CardDescription>Toggle and configure integrations for this flow.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {tools.map(renderToolCard)}
      </CardContent>
    </Card>
  );

  const renderGroupedView = () => (
    <div className="space-y-6">
      {Object.entries(toolCategories).map(([categoryKey, categoryInfo]) => {
        const categoryTools = tools.filter(tool => tool.category === categoryKey);
        const enabledInCategory = categoryTools.filter(tool => tool.enabled).length;
        
        return (
          <Card key={categoryKey}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {categoryInfo.name}
                {enabledInCategory > 0 && (
                  <Badge variant="secondary">{enabledInCategory} enabled</Badge>
                )}
              </CardTitle>
              <CardDescription>{categoryInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {categoryTools.map(renderToolCard)}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 p-1">
      <div className='mb-6'>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tool Calls & Integrations</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure integrations and automated actions for your flow.
        </p>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'simple' | 'grouped')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="simple">Simple View</TabsTrigger>
          <TabsTrigger value="grouped">Grouped by Category</TabsTrigger>
        </TabsList>
        <TabsContent value="simple" className="mt-6">
          {renderSimpleView()}
        </TabsContent>
        <TabsContent value="grouped" className="mt-6">
          {renderGroupedView()}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Conditional Logic
        </Button>
        <Button onClick={handleFormSubmit}>Next: Review & Publish</Button>
      </div>

      {/* Transfer Rule Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditingTransfer ? 'Edit Transfer Rule' : 'Create New Transfer Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure when calls should be transferred to a specific phone number.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Phone Number Field */}
            <div>
              <Label htmlFor="modal-transfer-number" className="text-sm font-medium">
                Transfer Phone Number *
              </Label>
              <Input
                id="modal-transfer-number"
                placeholder="e.g., +1 (555) 123-4567"
                value={newTransferForm.transferNumber}
                onChange={(e) => setNewTransferForm(prev => ({ ...prev, transferNumber: e.target.value }))}
                onBlur={() => {
                  const error = validatePhoneNumber(newTransferForm.transferNumber);
                  setNewTransferErrors(prev => ({ ...prev, transferNumber: error || '' }));
                }}
                className={`mt-1 ${
                  newTransferErrors.transferNumber 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : ''
                }`}
              />
              {newTransferErrors.transferNumber && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {newTransferErrors.transferNumber}
                </p>
              )}
            </div>

            {/* Trigger Question Field */}
            <div>
              <Label htmlFor="modal-trigger-question" className="text-sm font-medium">
                Trigger Question *
              </Label>
              <select
                id="modal-trigger-question"
                className={`w-full p-2 border rounded-md mt-1 ${
                  newTransferErrors.triggerQuestion 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : ''
                }`}
                value={newTransferForm.triggerQuestion}
                onChange={(e) => {
                  setNewTransferForm(prev => ({ 
                    ...prev, 
                    triggerQuestion: e.target.value,
                    triggerResponse: '' // Reset response when question changes
                  }));
                }}
                onBlur={() => {
                  const error = !newTransferForm.triggerQuestion.trim() ? "Please select a trigger question" : null;
                  setNewTransferErrors(prev => ({ ...prev, triggerQuestion: error || '' }));
                }}
              >
                <option value="">Select a question...</option>
                {questions.map((question) => (
                  <option key={question.id} value={question.id}>
                    {question.questionText}
                  </option>
                ))}
              </select>
              {newTransferErrors.triggerQuestion && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {newTransferErrors.triggerQuestion}
                </p>
              )}
            </div>

            {/* Trigger Response Field */}
            <div>
              <Label htmlFor="modal-trigger-response" className="text-sm font-medium">
                Trigger Response *
              </Label>
              <Input
                id="modal-trigger-response"
                placeholder={newTransferForm.triggerQuestion 
                  ? getTriggerResponsePlaceholder(newTransferForm.triggerQuestion)
                  : "Select a trigger question first"
                }
                value={newTransferForm.triggerResponse}
                onChange={(e) => setNewTransferForm(prev => ({ ...prev, triggerResponse: e.target.value }))}
                onBlur={() => {
                  const error = !newTransferForm.triggerResponse.trim() ? "Please describe the trigger response" : null;
                  setNewTransferErrors(prev => ({ ...prev, triggerResponse: error || '' }));
                }}
                disabled={!newTransferForm.triggerQuestion}
                className={`mt-1 ${
                  newTransferErrors.triggerResponse 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : ''
                }`}
              />
              {newTransferErrors.triggerResponse && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {newTransferErrors.triggerResponse}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Describe the response that should trigger this transfer. Our AI will match similar responses automatically.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsTransferModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                saveTransferRule('hot-transfer');
              }}
              className="flex items-center gap-2"
              disabled={!newTransferForm.transferNumber || !newTransferForm.triggerQuestion || !newTransferForm.triggerResponse}
            >
              <CheckCircle className="h-4 w-4" />
              {isEditingTransfer ? 'Update Rule' : 'Save Rule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 