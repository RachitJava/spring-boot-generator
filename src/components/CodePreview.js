import React, { useState } from 'react';
import { Download, ArrowLeft, Eye, FileText, Folder, Check } from 'lucide-react';

const CodePreview = ({ projectConfig, apis, generatedCode, onDownload, onBack }) => {
  const [selectedFile, setSelectedFile] = useState('pom.xml');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleDownload = () => {
    onDownload();
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
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
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold">Project Preview</h2>
        </div>

        {/* Project Summary */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Project Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Project Name:</span> {projectConfig.projectName}
            </div>
            <div>
              <span className="font-medium">Package:</span> {projectConfig.packageName}
            </div>
            <div>
              <span className="font-medium">Java Version:</span> {projectConfig.javaVersion}
            </div>
            <div>
              <span className="font-medium">APIs Generated:</span> {apis.length}
            </div>
          </div>
        </div>

        {/* API Summary */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Generated APIs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apis.map((api) => (
              <div key={api.id} className="border rounded-lg p-3 bg-gray-50">
                <h4 className="font-medium text-sm">{api.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{api.purpose}</p>
                <div className="text-xs text-green-600">
                  ✓ {api.endpoints.length} endpoints, {api.fields.length} fields
                </div>
              </div>
            ))}
          </div>
        </div>

        {generatedCode && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* File Tree */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Folder size={16} />
                Project Structure
              </h3>
              <div className="border rounded-lg p-3 bg-gray-50 max-h-96 overflow-y-auto">
                {fileTree.map((filename) => (
                  <div
                    key={filename}
                    className={`flex items-center gap-2 p-2 cursor-pointer rounded text-sm transition-colors ${
                      selectedFile === filename 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedFile(filename)}
                  >
                    <span>{getFileIcon(filename)}</span>
                    <span className="truncate">{filename}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File Content */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText size={16} />
                {selectedFile}
              </h3>
              <div className="border rounded-lg bg-gray-900 text-green-400 p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {generatedCode.files[selectedFile] || 'Select a file to view its content'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Check size={16} />
            Project downloaded successfully!
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          Back to API Builder
        </button>
        <button onClick={handleDownload} className="btn btn-success">
          <Download size={16} />
          Download Project
        </button>
      </div>
    </div>
  );
};

export default CodePreview; 