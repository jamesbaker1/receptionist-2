'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseIcon, CalendarDaysIcon, InboxIcon, MailIcon, PhoneCallIcon } from 'lucide-react'; // Placeholder icons
import { Input } from '@/components/ui/input';

interface Step4ToolCallsProps {
  onSubmit: (data: { toolsConfig?: any }) => void; // Define a proper type later
  onBack: () => void;
  initialData?: { toolsConfig?: any };
}

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  config?: {
    transferNumber?: string;
    triggerQuestion?: string;
    triggerResponse?: string;
  };
}

const mockTools: Tool[] = [
  {
    id: 'clio',
    name: 'Clio Integration',
    description: 'Connect to Clio to manage contacts and matters.',
    icon: BriefcaseIcon,
    enabled: false,
  },
  {
    id: 'litify',
    name: 'Litify Sync',
    description: 'Synchronize intake data with your Litify platform.',
    icon: InboxIcon,
    enabled: false,
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    description: 'Schedule appointments and reminders in Outlook.',
    icon: CalendarDaysIcon,
    enabled: false,
  },
  {
    id: 'email',
    name: 'Email Integration',
    description: 'Send automated emails based on call outcomes and responses.',
    icon: MailIcon,
    enabled: false,
  },
  {
    id: 'hot-transfer',
    name: 'Hot Transfer',
    description: 'Transfer call to a specific number based on question responses.',
    icon: PhoneCallIcon,
    enabled: false,
    config: {
      transferNumber: '',
      triggerQuestion: '',
      triggerResponse: ''
    }
  },
];

export default function Step4ToolCalls({ onSubmit, onBack, initialData }: Step4ToolCallsProps) {
  const [tools, setTools] = React.useState<Tool[]>(mockTools);
  const [selectedTool, setSelectedTool] = React.useState<Tool | null>(null);

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

  const handleFormSubmit = () => {
    const toolsConfig = tools.reduce((acc, tool) => {
      acc[tool.id] = {
        enabled: tool.enabled,
        config: tool.config
      };
      return acc;
    }, {} as Record<string, any>);
    
    console.log('Step 4 Data:', { toolsConfig });
    onSubmit({ toolsConfig });
  };

  return (
    <div className="space-y-6 p-1">
      <div className='mb-6'>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tool Calls & Integrations</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure integrations and automated actions for your flow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
          <CardDescription>Toggle and configure integrations for this flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {tools.map((tool) => (
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
                />
              </div>
              
              {tool.enabled && tool.id === 'hot-transfer' && (
                <div className="ml-12 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/30 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transfer-number">Transfer Number</Label>
                    <Input
                      id="transfer-number"
                      placeholder="Enter phone number"
                      value={tool.config?.transferNumber || ''}
                      onChange={(e) => handleConfigChange(tool.id, { transferNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trigger-question">Trigger Question</Label>
                    <Input
                      id="trigger-question"
                      placeholder="Question ID to monitor"
                      value={tool.config?.triggerQuestion || ''}
                      onChange={(e) => handleConfigChange(tool.id, { triggerQuestion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trigger-response">Trigger Response</Label>
                    <Input
                      id="trigger-response"
                      placeholder="Response that triggers transfer"
                      value={tool.config?.triggerResponse || ''}
                      onChange={(e) => handleConfigChange(tool.id, { triggerResponse: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Conditional Logic
        </Button>
        <Button onClick={handleFormSubmit}>Next: Review & Publish</Button>
      </div>
    </div>
  );
} 