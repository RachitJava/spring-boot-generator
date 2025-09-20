import React, { useState } from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight, Zap, Database, Shield, Search } from 'lucide-react';

const API_PURPOSES = {
  'user-management': {
    name: 'User Management',
    icon: Shield,
    description: 'Handle user registration, authentication, and profile management',
    suggestedEndpoints: ['POST /users/register', 'POST /users/login', 'GET /users/profile', 'PUT /users/profile'],
    fields: ['username', 'email', 'password', 'firstName', 'lastName', 'role']
  },
  'product-catalog': {
    name: 'Product Catalog',
    icon: Database,
    description: 'Manage products, categories, and inventory',
    suggestedEndpoints: ['GET /products', 'POST /products', 'GET /products/{id}', 'PUT /products/{id}', 'DELETE /products/{id}'],
    fields: ['name', 'description', 'price', 'category', 'stock', 'sku']
  },
  'order-management': {
    name: 'Order Management',
    icon: Search,
    description: 'Handle orders, payments, and order tracking',
    suggestedEndpoints: ['POST /orders', 'GET /orders', 'GET /orders/{id}', 'PUT /orders/{id}/status'],
    fields: ['customerId', 'items', 'totalAmount', 'status', 'orderDate', 'shippingAddress']
  },
  'content-management': {
    name: 'Content Management',
    icon: Database,
    description: 'Manage articles, blogs, or any content-based system',
    suggestedEndpoints: ['GET /content', 'POST /content', 'GET /content/{id}', 'PUT /content/{id}', 'DELETE /content/{id}'],
    fields: ['title', 'content', 'author', 'publishDate', 'status', 'tags']
  },
  'notification-system': {
    name: 'Notification System',
    icon: Zap,
    description: 'Send and manage notifications across different channels',
    suggestedEndpoints: ['POST /notifications', 'GET /notifications', 'PUT /notifications/{id}/read'],
    fields: ['userId', 'message', 'type', 'channel', 'sentDate', 'isRead']
  },
  'file-management': {
    name: 'File Management',
    icon: Database,
    description: 'Upload, store, and manage files and documents',
    suggestedEndpoints: ['POST /files/upload', 'GET /files', 'GET /files/{id}', 'DELETE /files/{id}'],
    fields: ['filename', 'fileType', 'fileSize', 'uploadDate', 'uploadedBy', 'url']
  }
};

const ApiBuilder = ({ apis, onAddApi, onRemoveApi, onNext, onBack, projectConfig }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [customApi, setCustomApi] = useState({
    name: '',
    purpose: '',
    endpoints: [],
    fields: []
  });

  const handlePurposeSelect = (purposeKey) => {
    const purpose = API_PURPOSES[purposeKey];
    setSelectedPurpose(purposeKey);
    setCustomApi({
      name: purpose.name,
      purpose: purpose.description,
      endpoints: [...purpose.suggestedEndpoints],
      fields: [...purpose.fields]
    });
  };

  const handleCustomFieldChange = (field, value) => {
    setCustomApi(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEndpointChange = (index, value) => {
    const newEndpoints = [...customApi.endpoints];
    newEndpoints[index] = value;
    setCustomApi(prev => ({
      ...prev,
      endpoints: newEndpoints
    }));
  };

  const addEndpoint = () => {
    setCustomApi(prev => ({
      ...prev,
      endpoints: [...prev.endpoints, '']
    }));
  };

  const removeEndpoint = (index) => {
    setCustomApi(prev => ({
      ...prev,
      endpoints: prev.endpoints.filter((_, i) => i !== index)
    }));
  };

  const handleFieldChange = (index, value) => {
    const newFields = [...customApi.fields];
    newFields[index] = value;
    setCustomApi(prev => ({
      ...prev,
      fields: newFields
    }));
  };

  const addField = () => {
    setCustomApi(prev => ({
      ...prev,
      fields: [...prev.fields, '']
    }));
  };

  const removeField = (index) => {
    setCustomApi(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitApi = () => {
    if (customApi.name && customApi.purpose) {
      onAddApi({
        ...customApi,
        purposeKey: selectedPurpose,
        endpoints: customApi.endpoints.filter(e => e.trim()),
        fields: customApi.fields.filter(f => f.trim())
      });
      
      // Reset form
      setCustomApi({
        name: '',
        purpose: '',
        endpoints: [],
        fields: []
      });
      setSelectedPurpose('');
      setShowAddForm(false);
    }
  };

  const canProceed = apis?.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2">
            <Plus className="text-blue-600" size={20} />
            <h2 className="text-xl sm:text-2xl font-bold">API Builder</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            Project: <span className="font-semibold">{projectConfig.projectName}</span>
          </div>
        </div>

        {/* Existing APIs */}
        {apis?.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your APIs ({apis?.length || 0})</h3>
                          <div className="space-y-2 sm:space-y-3">
                {apis?.map((api) => {
                const Icon = API_PURPOSES[api.purposeKey]?.icon || Database;
                return (
                  <div key={api.id} className="api-card selected">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <Icon className="text-blue-600 mt-1 flex-shrink-0" size={18} />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm sm:text-base">{api.name}</h4>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{api.purpose}</p>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Endpoints:</span> 
                            <span className="break-all"> {api.endpoints.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveApi(api.id)}
                        className="btn btn-danger p-1.5 sm:p-2 flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add API Button */}
        {!showAddForm && (
          <div className="text-center">
            <button
              onClick={() => setShowAddForm(true)}
              className="btn border-2 border-dashed border-gray-300 bg-transparent text-gray-600 hover:border-gray-400 transition-colors text-sm sm:text-base"
            >
              <Plus size={14} />
              Add New API
            </button>
          </div>
        )}

        {/* Add API Form */}
        {showAddForm && (
          <div className="border-2 border-blue-200 rounded-lg p-4 sm:p-6 bg-blue-50">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">What's the purpose of your API?</h3>
            
            {/* Purpose Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
              {Object.entries(API_PURPOSES).map(([key, purpose]) => {
                const Icon = purpose.icon;
                return (
                  <div
                    key={key}
                    className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPurpose === key 
                        ? 'border-blue-500 bg-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePurposeSelect(key)}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Icon className="text-blue-600 flex-shrink-0" size={18} />
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm sm:text-base">{purpose.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{purpose.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Configuration */}
            {selectedPurpose && (
              <div className="space-y-3 sm:space-y-4">
                <div className="form-group">
                  <label className="text-sm sm:text-base">API Name</label>
                  <input
                    type="text"
                    value={customApi.name}
                    onChange={(e) => handleCustomFieldChange('name', e.target.value)}
                    placeholder="Enter API name"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="form-group">
                  <label className="text-sm sm:text-base">Purpose Description</label>
                  <textarea
                    value={customApi.purpose}
                    onChange={(e) => handleCustomFieldChange('purpose', e.target.value)}
                    placeholder="Describe what this API does"
                    rows="2"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="form-group">
                  <label className="text-sm sm:text-base">API Endpoints</label>
                  {customApi.endpoints.map((endpoint, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={endpoint}
                        onChange={(e) => handleEndpointChange(index, e.target.value)}
                        placeholder="GET /api/resource"
                        className="flex-1 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => removeEndpoint(index)}
                        className="btn btn-danger p-1.5 sm:p-2"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEndpoint}
                    className="btn btn-secondary text-xs sm:text-sm"
                  >
                    <Plus size={12} />
                    Add Endpoint
                  </button>
                </div>

                <div className="form-group">
                  <label className="text-sm sm:text-base">Data Fields</label>
                  {customApi.fields.map((field, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={field}
                        onChange={(e) => handleFieldChange(index, e.target.value)}
                        placeholder="Field name (e.g., username, email)"
                        className="flex-1 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => removeField(index)}
                        className="btn btn-danger p-1.5 sm:p-2"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addField}
                    className="btn btn-secondary text-xs sm:text-sm"
                  >
                    <Plus size={12} />
                    Add Field
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-2">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setSelectedPurpose('');
                      setCustomApi({
                        name: '',
                        purpose: '',
                        endpoints: [],
                        fields: []
                      });
                    }}
                    className="btn btn-secondary text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitApi}
                    className="btn btn-success text-sm sm:text-base"
                    disabled={!customApi.name || !customApi.purpose}
                  >
                    Add API
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <button onClick={onBack} className="btn btn-secondary text-sm sm:text-base">
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Project Setup</span>
          <span className="sm:hidden">Back</span>
        </button>
        <button 
          onClick={onNext} 
          className="btn text-sm sm:text-base"
          disabled={!canProceed}
        >
          <span className="hidden sm:inline">Generate Code</span>
          <span className="sm:hidden">Generate</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default ApiBuilder; 