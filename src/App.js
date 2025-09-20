import React, { useState } from 'react';
import ProjectConfigForm from './components/ProjectConfigForm';
import ApiBuilder from './components/ApiBuilder';
import AppCloner from './components/AppCloner';
import CodePreview from './components/CodePreview';
import { generateSpringBootProject, generateTemplateProject } from './utils/codeGenerator';
import { downloadProject } from './utils/downloadUtils';
import { generateAppTemplate } from './utils/appTemplates';
import { Code, Settings, Plus, Copy, Zap, ArrowRight, Database } from 'lucide-react';

function App() {
  const [step, setStep] = useState(1); // Start with mode selection
  const [mode, setMode] = useState(null); // 'custom' or 'template'
  const [projectConfig, setProjectConfig] = useState({
    projectName: '',
    groupId: 'com.example',
    artifactId: '',
    packageName: '',
    description: '',
    javaVersion: '17'
  });
  const [apis, setApis] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleProjectConfigSubmit = (config) => {
    setProjectConfig(config);
    if (mode === 'custom') {
      setStep(3); // Go to API Builder
    } else {
      setStep(4); // Go to App Cloner
    }
  };

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    setStep(2); // Go to Project Configuration
  };

  const handleAddApi = (api) => {
    setApis([...(apis || []), { ...api, id: Date.now() }]);
  };

  const handleRemoveApi = (id) => {
    setApis((apis || []).filter(api => api.id !== id));
  };

  const handleTemplateSelection = (templateData) => {
    console.log('App: Received template selection:', templateData);
    setSelectedTemplate(templateData);
  };

  const handleTemplateSelectionAndGenerate = async (templateData) => {
    console.log('App: Received template selection and generating:', templateData);
    setSelectedTemplate(templateData);
    
    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate code with the template data directly
    await generateCodeWithTemplate(templateData);
  };

  const generateCodeWithTemplate = async (templateData) => {
    console.log('=== STARTING CODE GENERATION WITH TEMPLATE ===');
    console.log('Template data:', templateData);
    
    setIsGenerating(true);
    
    try {
      // Add a delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('=== TEMPLATE MODE ===');
      console.log('Generating template project with:', {
        template: templateData.template,
        templateData: templateData.templateData?.name,
        databaseConfig: templateData.databaseConfig?.name
      });
      
      const code = generateTemplateProject(projectConfig, templateData);
      
      console.log('=== GENERATION COMPLETE ===');
      console.log('Generated code structure:', {
        fileCount: Object.keys(code.files || {}).length,
        analysis: code.analysis,
        fileNames: Object.keys(code.files || {}).slice(0, 10) // Show first 10 files
      });
      
      if (!code || !code.files) {
        console.error('ERROR: No code generated or missing files property');
        return;
      }
      
      setGeneratedCode(code);
      setStep(5); // Final step
      console.log('=== MOVING TO PREVIEW STEP ===');
    } catch (error) {
      console.error('=== ERROR DURING GENERATION ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
    } finally {
      setIsGenerating(false);
    }
  };

  const getTemplateApis = () => {
    console.log('=== GET TEMPLATE APIS ===');
    if (!selectedTemplate) {
      console.log('No selected template');
      return [];
    }
    
    try {
      console.log('Generating app template for APIs display...');
      const appTemplate = generateAppTemplate(
        selectedTemplate.template, 
        projectConfig, 
        selectedTemplate.databaseConfig
      );
      console.log('App template for APIs:', {
        entityCount: appTemplate.entities?.length || 0,
        apiCount: appTemplate.apis?.length || 0,
        apis: appTemplate.apis?.map(api => ({ name: api.name, entity: api.entity })) || []
      });
      return appTemplate.apis || [];
    } catch (error) {
      console.error('Error generating template APIs:', error);
      return [];
    }
  };

  const handleGenerateCode = async () => {
    console.log('=== STARTING CODE GENERATION ===');
    console.log('Mode:', mode);
    console.log('Selected template:', selectedTemplate);
    console.log('Project config:', projectConfig);
    
    setIsGenerating(true);
    
    try {
      // Add a delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let code;
      if (mode === 'template' && selectedTemplate) {
        console.log('=== TEMPLATE MODE ===');
        console.log('Generating template project with:', {
          template: selectedTemplate.template,
          templateData: selectedTemplate.templateData?.name,
          databaseConfig: selectedTemplate.databaseConfig?.name
        });
        
        code = generateTemplateProject(projectConfig, selectedTemplate);
        
        console.log('=== GENERATION COMPLETE ===');
        console.log('Generated code structure:', {
          fileCount: Object.keys(code.files || {}).length,
          analysis: code.analysis,
          fileNames: Object.keys(code.files || {}).slice(0, 10) // Show first 10 files
        });
      } else {
        console.log('=== CUSTOM MODE ===');
        code = generateSpringBootProject(projectConfig, apis);
      }
      
      if (!code || !code.files) {
        console.error('ERROR: No code generated or missing files property');
        return;
      }
      
      setGeneratedCode(code);
      setStep(5); // Final step
      console.log('=== MOVING TO PREVIEW STEP ===');
    } catch (error) {
      console.error('=== ERROR DURING GENERATION ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadProject = () => {
    downloadProject(projectConfig, generatedCode);
  };

  const handleBackToStep = (stepNumber) => {
    setStep(stepNumber);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Project</h3>
            <p className="text-gray-600">
              Creating all entities, controllers, services, repositories, and configuration files...
            </p>
            <div className="mt-4 text-sm text-gray-500">
              This may take a few moments
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Code className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Spring Boot Generator</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Professional project scaffolding</p>
              </div>
            </div>
            {step > 1 && (
              <div className="text-xs sm:text-sm text-gray-600 hidden md:block">
                {mode === 'custom' ? 'Custom API Builder' : mode === 'template' ? 'App Cloner' : 'Getting Started'}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

      {step === 1 && (
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-4 sm:mb-6">
              <Zap className="text-blue-600" size={14} />
              <span className="text-blue-700 text-xs sm:text-sm font-medium">AI-Powered Project Generation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
              Choose Your
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Development Mode
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Select how you want to create your Spring Boot project. Build from scratch with custom APIs or clone popular applications.
            </p>
          </div>
          
          {/* Mode Selection Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {/* Custom API Builder */}
            <div 
              className="group relative bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 cursor-pointer hover:border-blue-500 hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => handleModeSelection('custom')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="text-white" size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Custom API Builder</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Build your project from scratch by defining custom APIs, entities, and business logic. Perfect for unique requirements and learning.
                </p>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm">Define custom entities and relationships</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm">Create tailored API endpoints</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm">Full control over project structure</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm">Intelligent code generation</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 inline-flex items-center gap-2 text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span className="font-medium text-sm sm:text-base">Get Started</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            
            {/* Clone Existing Apps */}
            <div 
              className="group relative bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 cursor-pointer hover:border-purple-500 hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => handleModeSelection('template')}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Copy className="text-white" size={24} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Clone Existing Apps</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Generate complete projects based on popular applications like Instagram, YouTube, Uber, and more. Production-ready code in minutes.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">10+ popular app templates</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Complete entity relationships</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Multiple database support</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Production-ready architecture</span>
                  </div>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 text-purple-600 group-hover:text-purple-700 transition-colors">
                  <span className="font-medium">Explore Templates</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 text-center">Why Choose Our Generator?</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
              <div className="text-center p-4 sm:p-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-white" size={24} />
                </div>
                <h4 className="text-gray-900 font-semibold mb-3 text-base sm:text-lg">Lightning Fast</h4>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Generate complete projects in seconds with intelligent code scaffolding</p>
              </div>
              <div className="text-center p-4 sm:p-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Database className="text-white" size={24} />
                </div>
                <h4 className="text-gray-900 font-semibold mb-3 text-base sm:text-lg">Production Ready</h4>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Best practices, security, validation, and database integration included</p>
              </div>
              <div className="text-center p-4 sm:p-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="text-white" size={24} />
                </div>
                <h4 className="text-gray-900 font-semibold mb-3 text-base sm:text-lg">Highly Customizable</h4>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">Adapt generated code to your specific needs and requirements</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <ProjectConfigForm
          onSubmit={handleProjectConfigSubmit}
          initialData={projectConfig}
          mode={mode}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && mode === 'custom' && (
        <ApiBuilder
          apis={apis}
          onAddApi={handleAddApi}
          onRemoveApi={handleRemoveApi}
          onNext={handleGenerateCode}
          onBack={() => handleBackToStep(2)}
          projectConfig={projectConfig}
        />
      )}

      {step === 4 && mode === 'template' && (
        <AppCloner
          onSelectTemplate={handleTemplateSelectionAndGenerate}
          onNext={() => {}} // Empty function since generation is handled in onSelectTemplate
          onBack={() => handleBackToStep(2)}
          projectConfig={projectConfig}
        />
      )}

      {step === 5 && (
        <CodePreview
          projectConfig={projectConfig}
          apis={mode === 'custom' ? apis : getTemplateApis()}
          generatedCode={generatedCode}
          onDownload={handleDownloadProject}
          onBack={() => handleBackToStep(mode === 'custom' ? 3 : 4)}
          mode={mode}
          selectedTemplate={selectedTemplate}
        />
      )}
      </div>
    </div>
  );
}

export default App; 