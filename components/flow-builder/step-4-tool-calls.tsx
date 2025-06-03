'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BriefcaseIcon, CalendarDaysIcon, InboxIcon, MailIcon, PhoneCallIcon, Settings2Icon, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ToolsConfig {
  [key: string]: {
    enabled: boolean;
    config?: Tool['config'];
  };
}

interface Step4ToolCallsProps {
  onSubmit: (data: { toolsConfig?: ToolsConfig }) => void;
  onBack: () => void;
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
  };
}

const mockTools: Tool[] = [
  {
    id: 'clio',
    name: 'Clio Integration',
    description: 'Connect to Clio to manage contacts and matters.',
    icon: BriefcaseIcon,
    enabled: false,
    category: 'crm',
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
    description: 'Transfer call to a specific number based on question responses.',
    icon: PhoneCallIcon,
    enabled: false,
    category: 'communication',
    config: {
      transferNumber: '',
      triggerQuestion: '',
      triggerResponse: '',
      priority: 'high'
    }
  },
];

const toolCategories = {
  crm: { name: 'CRM & Data Management', description: 'Integrate with your client management systems' },
  communication: { name: 'Communication & Transfer', description: 'Handle call transfers and notifications' },
  scheduling: { name: 'Scheduling & Calendar', description: 'Manage appointments and scheduling' }
};

export default function Step4ToolCalls({ onSubmit, onBack }: Step4ToolCallsProps) {
  const [tools, setTools] = React.useState<Tool[]>(mockTools);
  const [viewMode, setViewMode] = React.useState<'simple' | 'grouped'>('simple');

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
    }, {} as ToolsConfig);
    
    console.log('Step 4 Data:', { toolsConfig });
    onSubmit({ toolsConfig });
  };

  const enabledToolsCount = tools.filter(tool => tool.enabled).length;

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
        />
      </div>
      
      {tool.enabled && (
        <div className="ml-12 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/30 space-y-4">
          {/* Basic Configuration */}
          {tool.id === 'hot-transfer' && (
            <>
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
            </>
          )}

          {tool.id === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="email-template">Email Template</Label>
              <Textarea
                id="email-template"
                placeholder="Enter email template content..."
                value={tool.config?.emailTemplate || ''}
                onChange={(e) => handleConfigChange(tool.id, { emailTemplate: e.target.value })}
                rows={3}
              />
            </div>
          )}

          {/* Advanced Settings */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="advanced-settings">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center">
                  <Settings2Icon className="h-4 w-4 mr-2" />
                  Advanced Settings
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* Priority Setting */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Priority Level
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Higher priority tools will execute first when multiple tools are triggered.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={tool.config?.priority || 'medium'}
                    onChange={(e) => handleConfigChange(tool.id, { priority: e.target.value as 'low' | 'medium' | 'high' })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Webhook URL for advanced integrations */}
                <div className="space-y-2">
                  <Label className="flex items-center">
                    Webhook URL (Optional)
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-1.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Custom webhook endpoint for additional integrations or notifications.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    placeholder="https://your-webhook-endpoint.com"
                    value={tool.config?.webhookUrl || ''}
                    onChange={(e) => handleConfigChange(tool.id, { webhookUrl: e.target.value })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
    </div>
  );
} 