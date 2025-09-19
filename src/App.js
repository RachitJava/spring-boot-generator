import React, { useState } from 'react';
import ProjectConfigForm from './components/ProjectConfigForm';
import ApiBuilder from './components/ApiBuilder';
import CodePreview from './components/CodePreview';
import { generateSpringBootProject } from './utils/codeGenerator';
import { downloadProject } from './utils/downloadUtils';
import { Code, Download, Settings, Plus } from 'lucide-react';

function App() {
  const [step, setStep] = useState(1);
  const [projectConfig, setProjectConfig] = useState({
    projectName: '',
    groupId: 'com.example',
    artifactId: '',
    packageName: '',
    description: '',
    javaVersion: '17'
  });
  const [apis, setApis] = useState([]);
  const [generatedCode, setGeneratedCode] = useState(null);

  const handleProjectConfigSubmit = (config) => {
    setProjectConfig(config);
    setStep(2);
  };

  const handleAddApi = (api) => {
    setApis([...apis, { ...api, id: Date.now() }]);
  };

  const handleRemoveApi = (id) => {
    setApis(apis.filter(api => api.id !== id));
  };

  const handleGenerateCode = () => {
    const code = generateSpringBootProject(projectConfig, apis);
    setGeneratedCode(code);
    setStep(3);
  };

  const handleDownloadProject = () => {
    downloadProject(projectConfig, generatedCode);
  };

  const handleBackToStep = (stepNumber) => {
    setStep(stepNumber);
  };

  return (
    <div className="container">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">
          <Code className="inline mr-2" />
          Spring Boot Project Generator
        </h1>
        <p className="text-lg text-white opacity-90">
          Create intelligent Spring Boot projects with AI-generated APIs
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <Settings size={16} />
            </div>
            <span className="font-semibold">Project Setup</span>
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <Plus size={16} />
            </div>
            <span className="font-semibold">API Builder</span>
          </div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              <Download size={16} />
            </div>
            <span className="font-semibold">Download</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <ProjectConfigForm
          onSubmit={handleProjectConfigSubmit}
          initialData={projectConfig}
        />
      )}

      {step === 2 && (
        <ApiBuilder
          apis={apis}
          onAddApi={handleAddApi}
          onRemoveApi={handleRemoveApi}
          onNext={handleGenerateCode}
          onBack={() => handleBackToStep(1)}
          projectConfig={projectConfig}
        />
      )}

      {step === 3 && (
        <CodePreview
          projectConfig={projectConfig}
          apis={apis}
          generatedCode={generatedCode}
          onDownload={handleDownloadProject}
          onBack={() => handleBackToStep(2)}
        />
      )}
    </div>
  );
}

export default App; 