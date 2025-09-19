import React, { useState, useEffect } from 'react';
import { ArrowRight, Folder } from 'lucide-react';

const ProjectConfigForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    groupId: 'com.example',
    artifactId: '',
    packageName: '',
    description: '',
    javaVersion: '17',
    ...initialData
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Auto-generate fields based on project name
    if (formData.projectName && !formData.artifactId) {
      const artifactId = formData.projectName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      setFormData(prev => ({
        ...prev,
        artifactId,
        packageName: `${prev.groupId}.${artifactId.replace(/-/g, '')}`
      }));
    }
  }, [formData.projectName, formData.groupId, formData.artifactId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-6">
        <Folder className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold">Project Configuration</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Project Name *</label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="My Spring Boot App"
            className={errors.projectName ? 'border-red-500' : ''}
          />
          {errors.projectName && <span className="text-red-500 text-sm">{errors.projectName}</span>}
        </div>

        <div className="flex gap-4">
          <div className="form-group flex-1">
            <label htmlFor="groupId">Group ID *</label>
            <input
              type="text"
              id="groupId"
              name="groupId"
              value={formData.groupId}
              onChange={handleChange}
              placeholder="com.example"
              className={errors.groupId ? 'border-red-500' : ''}
            />
            {errors.groupId && <span className="text-red-500 text-sm">{errors.groupId}</span>}
          </div>

          <div className="form-group flex-1">
            <label htmlFor="artifactId">Artifact ID *</label>
            <input
              type="text"
              id="artifactId"
              name="artifactId"
              value={formData.artifactId}
              onChange={handleChange}
              placeholder="my-spring-boot-app"
              className={errors.artifactId ? 'border-red-500' : ''}
            />
            {errors.artifactId && <span className="text-red-500 text-sm">{errors.artifactId}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="packageName">Package Name *</label>
          <input
            type="text"
            id="packageName"
            name="packageName"
            value={formData.packageName}
            onChange={handleChange}
            placeholder="com.example.myspringbootapp"
            className={errors.packageName ? 'border-red-500' : ''}
          />
          {errors.packageName && <span className="text-red-500 text-sm">{errors.packageName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="A brief description of your Spring Boot application"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="javaVersion">Java Version</label>
          <select
            id="javaVersion"
            name="javaVersion"
            value={formData.javaVersion}
            onChange={handleChange}
          >
            <option value="11">Java 11</option>
            <option value="17">Java 17</option>
            <option value="21">Java 21</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn">
            Next: Add APIs
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectConfigForm; 