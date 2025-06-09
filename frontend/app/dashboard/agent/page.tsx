'use client';
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface STTConfig {
  providers: {
    [key: string]: {
      models: string[];
      languages: string[];
    };
  };
}

export default function AgentPage() {
  const [config, setConfig] = useState<STTConfig | null>(null);
  const [selected, setSelected] = useState({
    provider: '',
    model: '',
    language: ''
  });

  useEffect(() => {
    fetch('/stt.json')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        const firstProvider = Object.keys(data.providers)[0];
        setSelected({
          provider: firstProvider,
          model: data.providers[firstProvider].models[0],
          language: data.providers[firstProvider].languages[0]
        });
      });
  }, []);

  const handleChange = (key: keyof typeof selected, value: string) => {
    const newSelected = { ...selected, [key]: value };
    
    if (key === 'provider' && config) {
      newSelected.model = config.providers[value].models[0];
      newSelected.language = config.providers[value].languages[0];
    }
    
    setSelected(newSelected);
  };

  if (!config) return <div>Loading configuration...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Agent Configuration</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
          <Select
            value={selected.provider}
            onValueChange={(value) => handleChange('provider', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(config.providers).map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
          <Select
            value={selected.model}
            onValueChange={(value) => handleChange('model', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {config.providers[selected.provider]?.models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
          <Select
            value={selected.language}
            onValueChange={(value) => handleChange('language', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {config.providers[selected.provider]?.languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Current Configuration</h2>
        <div className="mt-2 space-y-2">
          <p><span className="font-medium">Provider:</span> {selected.provider}</p>
          <p><span className="font-medium">Model:</span> {selected.model}</p>
          <p><span className="font-medium">Language:</span> {selected.language}</p>
        </div>
      </div>
    </div>
  );
}