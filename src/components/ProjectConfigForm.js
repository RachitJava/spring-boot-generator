import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Plus, Copy, Settings, Package, Code, Globe, Shield, Database, Server, Zap } from 'lucide-react';

const ProjectConfigForm = ({ onSubmit, initialData, mode, onBack }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    groupId: 'com.example',
    artifactId: '',
    packageName: '',
    description: '',
    javaVersion: '17',
    springBootVersion: '3.3.0',
    packaging: 'jar',
    buildTool: 'maven',
    dependencies: [],
    serverPort: '8080',
    profileActive: 'dev',
    enableSecurity: false,
    enableJPA: true,
    enableWeb: true,
    enableActuator: false,
    enableSwagger: true,
    enableDevTools: true,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [isArtifactIdManuallyEdited, setIsArtifactIdManuallyEdited] = useState(false);
  const [isPackageNameManuallyEdited, setIsPackageNameManuallyEdited] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Version compatibility matrix
  const versionCompatibility = {
    springBoot: {
      '3.3.0': { minJava: '17', maxJava: '25', supportedJava: ['17', '21', '25'] },
      '3.2.0': { minJava: '17', maxJava: '25', supportedJava: ['17', '21', '25'] },
      '3.1.5': { minJava: '17', maxJava: '21', supportedJava: ['17', '21'] },
      '3.0.12': { minJava: '17', maxJava: '21', supportedJava: ['17', '21'] },
      '2.7.17': { minJava: '8', maxJava: '19', supportedJava: ['11', '17'] }
    },
    dependencies: {
      'spring-boot-starter-web': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-data-jpa': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-security': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-actuator': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-validation': { minSpringBoot: '2.3.0', minJava: '8' },
      'spring-boot-starter-cache': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-mail': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-test': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-webflux': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-data-mongodb': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-data-redis': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-oauth2-client': { minSpringBoot: '2.1.0', minJava: '8' },
      'spring-boot-starter-thymeleaf': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-websocket': { minSpringBoot: '2.0.0', minJava: '8' }
    }
  };

  const availableDependencies = [
    { id: 'spring-boot-starter-web', name: 'Spring Web', description: 'Build web applications with Spring MVC', icon: Globe, category: 'Web' },
    { id: 'spring-boot-starter-webflux', name: 'Spring WebFlux', description: 'Build reactive web applications', icon: Zap, category: 'Web' },
    { id: 'spring-boot-starter-data-jpa', name: 'Spring Data JPA', description: 'Persist data in SQL stores with Java Persistence API', icon: Database, category: 'Data' },
    { id: 'spring-boot-starter-data-mongodb', name: 'Spring Data MongoDB', description: 'Store data in flexible, JSON-like documents', icon: Database, category: 'Data' },
    { id: 'spring-boot-starter-data-redis', name: 'Spring Data Redis', description: 'Advanced and thread-safe Java Redis client', icon: Database, category: 'Data' },
    { id: 'spring-boot-starter-security', name: 'Spring Security', description: 'Highly customizable authentication and access-control framework', icon: Shield, category: 'Security' },
    { id: 'spring-boot-starter-oauth2-client', name: 'OAuth2 Client', description: 'Spring Boot integration for Spring Security OAuth2/OpenID Connect client', icon: Shield, category: 'Security' },
    { id: 'spring-boot-starter-actuator', name: 'Spring Boot Actuator', description: 'Monitor and manage your application', icon: Settings, category: 'Ops' },
    { id: 'spring-boot-starter-validation', name: 'Validation', description: 'Bean Validation with Hibernate validator', icon: Code, category: 'Core' },
    { id: 'spring-boot-starter-cache', name: 'Spring Cache', description: 'Spring Framework caching support', icon: Zap, category: 'Core' },
    { id: 'spring-boot-starter-mail', name: 'Java Mail Sender', description: 'Send email using Java Mail and Spring Framework', icon: Server, category: 'Messaging' },
    { id: 'spring-boot-starter-websocket', name: 'WebSocket', description: 'Build WebSocket applications with SockJS and STOMP', icon: Globe, category: 'Messaging' },
    { id: 'spring-boot-starter-thymeleaf', name: 'Thymeleaf', description: 'Build MVC web applications using Thymeleaf views', icon: Code, category: 'Template' },
    { id: 'spring-boot-starter-test', name: 'Spring Boot Test', description: 'Test Spring Boot applications', icon: Code, category: 'Test' }
  ];

  // Filter dependencies based on compatibility
  const getCompatibleDependencies = () => {
    return availableDependencies.filter(dep => {
      const depCompatibility = versionCompatibility.dependencies[dep.id];
      if (!depCompatibility) return true;

      const springBootVersion = formData.springBootVersion;
      const javaVersion = parseInt(formData.javaVersion);
      const minJavaVersion = parseInt(depCompatibility.minJava);

      // Check Spring Boot version compatibility
      const isSpringBootCompatible = compareVersions(springBootVersion, depCompatibility.minSpringBoot) >= 0;
      
      // Check Java version compatibility
      const isJavaCompatible = javaVersion >= minJavaVersion;

      return isSpringBootCompatible && isJavaCompatible;
    });
  };

  // Helper function to compare semantic versions
  const compareVersions = (version1, version2) => {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;
      
      if (v1part > v2part) return 1;
      if (v1part < v2part) return -1;
    }
    return 0;
  };

  // Get compatible Java versions for selected Spring Boot version
  const getCompatibleJavaVersions = () => {
    const springBootCompat = versionCompatibility.springBoot[formData.springBootVersion];
    return springBootCompat ? springBootCompat.supportedJava : ['11', '17', '21'];
  };

  // Get compatible Spring Boot versions for selected Java version
  const getCompatibleSpringBootVersions = () => {
    const javaVersion = parseInt(formData.javaVersion);
    return Object.entries(versionCompatibility.springBoot)
      .filter(([version, compat]) => {
        const minJava = parseInt(compat.minJava);
        const maxJava = parseInt(compat.maxJava);
        return javaVersion >= minJava && javaVersion <= maxJava;
      })
      .map(([version]) => version);
  };

  useEffect(() => {
    // Auto-generate artifactId based on project name if not manually edited
    if (formData.projectName && !isArtifactIdManuallyEdited) {
      const artifactId = formData.projectName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      setFormData(prev => ({
        ...prev,
        artifactId
      }));
    }
  }, [formData.projectName, isArtifactIdManuallyEdited]);

  useEffect(() => {
    // Auto-generate packageName based on groupId and artifactId if not manually edited
    if (formData.groupId && formData.artifactId && !isPackageNameManuallyEdited) {
      const packageName = `${formData.groupId}.${formData.artifactId.replace(/-/g, '')}`;
      
      setFormData(prev => ({
        ...prev,
        packageName
      }));
    }
  }, [formData.groupId, formData.artifactId, isPackageNameManuallyEdited]);

  // Version compatibility validation
  useEffect(() => {
    const compatibleJavaVersions = getCompatibleJavaVersions();
    const compatibleSpringBootVersions = getCompatibleSpringBootVersions();
    
    // Auto-correct Java version if incompatible with Spring Boot version
    if (!compatibleJavaVersions.includes(formData.javaVersion)) {
      setFormData(prev => ({
        ...prev,
        javaVersion: compatibleJavaVersions[0] || '17'
      }));
    }
    
    // Auto-correct Spring Boot version if incompatible with Java version
    if (!compatibleSpringBootVersions.includes(formData.springBootVersion)) {
      setFormData(prev => ({
        ...prev,
        springBootVersion: compatibleSpringBootVersions[0] || '3.3.0'
      }));
    }
    
    // Remove incompatible dependencies
    const compatibleDeps = getCompatibleDependencies();
    const compatibleDepIds = compatibleDeps.map(dep => dep.id);
    const filteredDependencies = formData.dependencies.filter(depId => compatibleDepIds.includes(depId));
    
    if (filteredDependencies.length !== formData.dependencies.length) {
      setFormData(prev => ({
        ...prev,
        dependencies: filteredDependencies
      }));
    }
  }, [formData.javaVersion, formData.springBootVersion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Track manual edits to prevent auto-generation override
    if (name === 'artifactId') {
      setIsArtifactIdManuallyEdited(true);
    } else if (name === 'packageName') {
      setIsPackageNameManuallyEdited(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDependencyToggle = (dependencyId) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.includes(dependencyId)
        ? prev.dependencies.filter(id => id !== dependencyId)
        : [...prev.dependencies, dependencyId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }

    if (!formData.groupId.trim()) {
      newErrors.groupId = 'Group ID is required';
    } else if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/.test(formData.groupId)) {
      newErrors.groupId = 'Invalid group ID format (e.g., com.example)';
    }

    if (!formData.artifactId.trim()) {
      newErrors.artifactId = 'Artifact ID is required';
    } else if (!/^[a-z][a-z0-9-]*$/.test(formData.artifactId)) {
      newErrors.artifactId = 'Invalid artifact ID format (lowercase, hyphens allowed)';
    }

    if (!formData.packageName.trim()) {
      newErrors.packageName = 'Package name is required';
    }

    if (formData.serverPort && (!/^\d+$/.test(formData.serverPort) || parseInt(formData.serverPort) < 1024 || parseInt(formData.serverPort) > 65535)) {
      newErrors.serverPort = 'Port must be a number between 1024 and 65535';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info', icon: Package },
    { id: 'advanced', name: 'Advanced', icon: Settings },
    { id: 'dependencies', name: 'Dependencies', icon: Code }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-3 sm:mb-4">
          {mode === 'custom' ? <Plus className="text-blue-600" size={14} /> : <Copy className="text-purple-600" size={14} />}
          <span className="text-gray-700 text-xs sm:text-sm font-medium">
            {mode === 'custom' ? 'Custom API Builder' : 'Clone Existing Apps'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Configure Your Project
        </h1>
        <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto px-4">
          Set up comprehensive configuration for your Spring Boot project. Configure basic settings, advanced options, and select dependencies to match your requirements.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4 sm:px-6 lg:px-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group">
                  <label htmlFor="projectName" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">Project Name *</label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="My Spring Boot App"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base ${errors.projectName ? 'border-red-400' : ''}`}
                  />
                  {errors.projectName && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.projectName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">Description</label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="A brief description of your application"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="form-group">
                  <label htmlFor="groupId" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">Group ID *</label>
                  <input
                    type="text"
                    id="groupId"
                    name="groupId"
                    value={formData.groupId}
                    onChange={handleChange}
                    placeholder="com.example"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base ${errors.groupId ? 'border-red-400' : ''}`}
                  />
                  {errors.groupId && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.groupId}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="artifactId" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">
                    Artifact ID *
                    {!isArtifactIdManuallyEdited && formData.artifactId && (
                      <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">auto-generated</span>
                    )}
                  </label>
                  <input
                    type="text"
                    id="artifactId"
                    name="artifactId"
                    value={formData.artifactId}
                    onChange={handleChange}
                    placeholder="my-spring-boot-app"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base ${errors.artifactId ? 'border-red-400' : ''}`}
                  />
                  {errors.artifactId && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.artifactId}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="packageName" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">
                  Package Name *
                  {!isPackageNameManuallyEdited && formData.packageName && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">auto-generated</span>
                  )}
                </label>
                <input
                  type="text"
                  id="packageName"
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleChange}
                  placeholder="com.example.myspringbootapp"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base ${errors.packageName ? 'border-red-400' : ''}`}
                />
                {errors.packageName && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.packageName}</span>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="form-group">
                  <label htmlFor="javaVersion" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">
                    Java Version
                    <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      Compatible with Spring Boot {formData.springBootVersion}
                    </span>
                  </label>
                  <select
                    id="javaVersion"
                    name="javaVersion"
                    value={formData.javaVersion}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                  >
                    {getCompatibleJavaVersions().map(version => (
                      <option key={version} value={version}>Java {version}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="springBootVersion" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">
                    Spring Boot Version
                    <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      Compatible with Java {formData.javaVersion}
                    </span>
                  </label>
                  <select
                    id="springBootVersion"
                    name="springBootVersion"
                    value={formData.springBootVersion}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                  >
                    {getCompatibleSpringBootVersions().map(version => (
                      <option key={version} value={version}>{version}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="packaging" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">Packaging</label>
                  <select
                    id="packaging"
                    name="packaging"
                    value={formData.packaging}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                  >
                    <option value="jar">JAR</option>
                    <option value="war">WAR</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="buildTool" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">Build Tool</label>
                  <select
                    id="buildTool"
                    name="buildTool"
                    value={formData.buildTool}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                  >
                    <option value="maven">Maven</option>
                    <option value="gradle">Gradle</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="form-group">
                  <label htmlFor="serverPort" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">Server Port</label>
                  <input
                    type="text"
                    id="serverPort"
                    name="serverPort"
                    value={formData.serverPort}
                    onChange={handleChange}
                    placeholder="8080"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base ${errors.serverPort ? 'border-red-400' : ''}`}
                  />
                  {errors.serverPort && <span className="text-red-500 text-xs sm:text-sm mt-1 block">{errors.serverPort}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="profileActive" className="text-gray-700 font-medium mb-2 block text-sm sm:text-base">Active Profile</label>
                  <select
                    id="profileActive"
                    name="profileActive"
                    value={formData.profileActive}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm sm:text-base"
                  >
                    <option value="dev">Development</option>
                    <option value="test">Test</option>
                    <option value="prod">Production</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Configuration</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableWeb"
                      checked={formData.enableWeb}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Web Application</div>
                      <div className="text-xs text-gray-500">Enable Spring MVC</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableJPA"
                      checked={formData.enableJPA}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Database (JPA)</div>
                      <div className="text-xs text-gray-500">Enable data persistence</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableSecurity"
                      checked={formData.enableSecurity}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Security</div>
                      <div className="text-xs text-gray-500">Enable authentication</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableActuator"
                      checked={formData.enableActuator}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Actuator</div>
                      <div className="text-xs text-gray-500">Monitoring endpoints</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableSwagger"
                      checked={formData.enableSwagger}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">API Documentation</div>
                      <div className="text-xs text-gray-500">Swagger/OpenAPI</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enableDevTools"
                      checked={formData.enableDevTools}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">Dev Tools</div>
                      <div className="text-xs text-gray-500">Hot reload & debugging</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Dependencies Tab */}
          {activeTab === 'dependencies' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Dependencies</h3>
                <p className="text-sm text-gray-600">Choose the Spring Boot starters and dependencies for your project</p>
              </div>

              {/* Compatibility Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Shield size={16} />
                  Current Configuration Compatibility
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-blue-800">Java {formData.javaVersion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-blue-800">Spring Boot {formData.springBootVersion}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-blue-800">{getCompatibleDependencies().length} Compatible Dependencies</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCompatibleDependencies().map((dep) => {
                  const Icon = dep.icon;
                  const isSelected = formData.dependencies.includes(dep.id);
                  const depCompatibility = versionCompatibility.dependencies[dep.id];
                  
                  return (
                    <div
                      key={dep.id}
                      onClick={() => handleDependencyToggle(dep.id)}
                      className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-gray-600'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                              {dep.name}
                            </h4>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                              }`}>
                                {dep.category}
                              </span>
                              {depCompatibility && (
                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                  ✓ Compatible
                                </span>
                              )}
                            </div>
                          </div>
                          <p className={`text-xs mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-500'}`}>
                            {dep.description}
                          </p>
                          {depCompatibility && (
                            <p className="text-xs mt-1 text-gray-400">
                              Requires: Spring Boot {depCompatibility.minSpringBoot}+, Java {depCompatibility.minJava}+
                            </p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {formData.dependencies.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Selected Dependencies ({formData.dependencies.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.dependencies.map((depId) => {
                      const dep = availableDependencies.find(d => d.id === depId);
                      return (
                        <span key={depId} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {dep?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between pt-6 sm:pt-8 gap-3 sm:gap-0 border-t border-gray-200 mt-8">
            <button 
              type="button" 
              onClick={onBack}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to Mode Selection</span>
              <span className="sm:hidden">Back</span>
            </button>
            <button 
              type="submit" 
              className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 font-medium text-sm sm:text-base"
            >
              <span className="hidden sm:inline">{mode === 'custom' ? 'Configure APIs' : 'Choose Template'}</span>
              <span className="sm:hidden">{mode === 'custom' ? 'APIs' : 'Template'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectConfigForm; 