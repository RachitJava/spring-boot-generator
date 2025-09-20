import React, { useState, useEffect } from 'react';
import { Download, ArrowLeft, Eye, FileText, Folder, Check, Copy, CheckCircle2 } from 'lucide-react';

const CodePreview = ({ projectConfig, apis, generatedCode, onDownload, onBack }) => {
  const [selectedFile, setSelectedFile] = useState('pom.xml');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [copiedFile, setCopiedFile] = useState(null);




  const handleDownload = () => {
    onDownload();
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleCopyCode = async (filename) => {
    try {
      const code = generatedCode.files[filename] || '';
      await navigator.clipboard.writeText(code);
      setCopiedFile(filename);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getLanguageFromFilename = (filename) => {
    if (filename.endsWith('.java')) return 'java';
    if (filename.endsWith('.xml')) return 'xml';
    if (filename.endsWith('.properties')) return 'properties';
    if (filename.endsWith('.md')) return 'markdown';
    if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return 'yaml';
    if (filename.endsWith('.json')) return 'json';
    return 'text';
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.java')) return '☕';
    if (filename.endsWith('.xml')) return '📄';
    if (filename.endsWith('.properties')) return '⚙️';
    if (filename.endsWith('.md')) return '📝';
    return '📄';
  };

  const fileTree = generatedCode ? Object.keys(generatedCode.files).sort() : [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Eye className="text-blue-600" size={20} />
          <h2 className="text-xl sm:text-2xl font-bold">Project Preview</h2>
        </div>

        {/* Project Summary */}
        <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Project Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="font-medium">Project Name:</span> 
              <span className="break-all"> {projectConfig.projectName}</span>
            </div>
            <div>
              <span className="font-medium">Package:</span> 
              <span className="break-all"> {projectConfig.packageName}</span>
            </div>
            <div>
              <span className="font-medium">Java Version:</span> {projectConfig.javaVersion}
            </div>
            <div>
              <span className="font-medium">APIs Generated:</span> {apis?.length || 0}
            </div>
          </div>
        </div>

        {/* API Summary */}
        <div className="mb-4 sm:mb-6">
          <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Generated APIs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {apis?.map((api, index) => (
              <div key={api.id || `api-${index}`} className="border rounded-lg p-2 sm:p-3 bg-gray-50">
                <h4 className="font-medium text-xs sm:text-sm">{api.name}</h4>
                <p className="text-xs text-gray-600 mb-1 sm:mb-2">{api.purpose}</p>
                <div className="text-xs text-green-600">
                  ✓ {api.endpoints?.length || 0} endpoints, {api.fields?.length || 0} fields
                </div>
              </div>
            ))}
          </div>
        </div>

        {generatedCode && (
          <div className="hidden sm:grid sm:grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* File Tree */}
            <div className="hidden lg:block lg:col-span-1">
              <h3 className="font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Folder size={14} />
                Project Structure
              </h3>
              <div className="border rounded-lg p-2 sm:p-3 bg-gray-50 max-h-64 sm:max-h-96 overflow-y-auto">
                {fileTree.map((filename) => (
                  <div
                    key={filename}
                    className={`flex items-center gap-2 p-1.5 sm:p-2 cursor-pointer rounded text-xs sm:text-sm transition-colors ${
                      selectedFile === filename 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedFile(filename)}
                  >
                    <span className="text-sm">{getFileIcon(filename)}</span>
                    <span className="truncate">{filename}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File Content */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <FileText size={14} />
                  <span className="truncate">{selectedFile}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {getLanguageFromFilename(selectedFile).toUpperCase()}
                  </span>
                </h3>
                <button
                  onClick={() => handleCopyCode(selectedFile)}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                  title="Copy code to clipboard"
                >
                  {copiedFile === selectedFile ? (
                    <>
                      <CheckCircle2 size={12} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy
                    </>
                  )}
                </button>
              </div>
              
              <div className="border rounded-lg bg-white shadow-sm overflow-hidden code-editor-container w-full max-w-full">
                {/* Code Editor Header */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <span className="ml-1 sm:ml-2 font-mono text-xs sm:text-sm text-gray-700 truncate">{selectedFile}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-white rounded text-gray-600 font-medium">
                      {getLanguageFromFilename(selectedFile)}
                    </span>
                    <span>•</span>
                    <span>{(generatedCode.files[selectedFile] || '').split('\n').length} lines</span>
                  </div>
                </div>
                
                {/* Code Content - Responsive Editor */}
                <div className="relative bg-white border-t">
                  
                  
                  {/* Responsive Editor Container */}
                  <div className="flex w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[28rem] border-2 border-gray-300 rounded-b-lg overflow-hidden bg-white shadow-inner">
                    {/* Line Numbers */}
                    <div className="bg-gray-50 text-gray-400 text-xs font-mono py-2 px-2 sm:px-3 select-none border-r border-gray-200 flex-shrink-0 w-10 sm:w-12 overflow-hidden">
                      <div className="overflow-y-auto h-full line-numbers-scrollbar">
                        {(generatedCode.files[selectedFile] || '').split('\n').map((_, index) => (
                          <div key={index} className="leading-4 sm:leading-5 text-right whitespace-nowrap text-xs">
                            {index + 1}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Code Editor Area */}
                    <div className="flex-1 bg-white relative overflow-hidden">
                      <div 
                        className="absolute inset-0 overflow-auto editor-scrollbars"
                        style={{
                          scrollbarWidth: 'auto',
                          scrollbarColor: '#6B7280 #E5E7EB'
                        }}
                      >
                        <pre 
                          className="text-xs sm:text-sm font-mono leading-4 sm:leading-5 p-2 sm:p-3 md:p-4 m-0 whitespace-pre code-content"
                          style={{
                            minWidth: '100%',
                            width: 'max-content',
                            fontFamily: '"Fira Code", "JetBrains Mono", "Consolas", "Monaco", monospace',
                            tabSize: 2,
                            position: 'relative',
                            zIndex: 1
                          }}
                        >
                          {generatedCode.files[selectedFile] || 'Select a file to view its content'}
                        </pre>
                      </div>
                      

                    </div>
                  </div>
                </div>
              </div>
              
              {/* Copy Success Message */}
              {copiedFile === selectedFile && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">Code copied to clipboard!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-3 sm:p-4 rounded-lg shadow-lg flex items-center gap-2 text-sm sm:text-base z-50">
            <Check size={14} />
            <span className="hidden sm:inline">Project downloaded successfully!</span>
            <span className="sm:hidden">Downloaded!</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <button onClick={onBack} className="btn btn-secondary text-sm sm:text-base">
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to API Builder</span>
          <span className="sm:hidden">Back</span>
        </button>
        <button onClick={handleDownload} className="btn btn-success text-sm sm:text-base">
          <Download size={14} />
          <span className="hidden sm:inline">Download Project</span>
          <span className="sm:hidden">Download</span>
        </button>
      </div>
    </div>
  );
};

export default CodePreview; 