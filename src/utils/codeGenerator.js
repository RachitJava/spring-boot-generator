// Spring Boot Project Code Generator with Intelligent API Integration
import { generateAppTemplate } from './appTemplates';

// Version compatibility and dependency validation
const validateProjectConfiguration = (projectConfig) => {
  const errors = [];
  const warnings = [];
  
  // Version compatibility matrix (same as in ProjectConfigForm)
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
      'spring-boot-starter-webflux': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-data-jpa': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-data-mongodb': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-data-redis': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-security': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-oauth2-client': { minSpringBoot: '2.1.0', minJava: '8' },
      'spring-boot-starter-actuator': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-validation': { minSpringBoot: '2.3.0', minJava: '8' },
      'spring-boot-starter-cache': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-mail': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-websocket': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-thymeleaf': { minSpringBoot: '2.0.0', minJava: '8' },
      'spring-boot-starter-test': { minSpringBoot: '2.0.0', minJava: '8' }
    }
  };

  // Validate Java and Spring Boot version compatibility
  const springBootCompat = versionCompatibility.springBoot[projectConfig.springBootVersion];
  if (springBootCompat) {
    const javaVersion = parseInt(projectConfig.javaVersion);
    const minJava = parseInt(springBootCompat.minJava);
    const maxJava = parseInt(springBootCompat.maxJava);
    
    if (javaVersion < minJava || javaVersion > maxJava) {
      errors.push(`Java ${projectConfig.javaVersion} is not compatible with Spring Boot ${projectConfig.springBootVersion}. Supported Java versions: ${springBootCompat.supportedJava.join(', ')}`);
    }
  } else {
    warnings.push(`Unknown Spring Boot version: ${projectConfig.springBootVersion}`);
  }

  // Validate dependencies
  if (projectConfig.dependencies) {
    projectConfig.dependencies.forEach(depId => {
      const depCompat = versionCompatibility.dependencies[depId];
      if (depCompat) {
        // Check Spring Boot compatibility
        if (compareVersions(projectConfig.springBootVersion, depCompat.minSpringBoot) < 0) {
          errors.push(`Dependency ${depId} requires Spring Boot ${depCompat.minSpringBoot}+ but ${projectConfig.springBootVersion} is selected`);
        }
        
        // Check Java compatibility
        const javaVersion = parseInt(projectConfig.javaVersion);
        const minJavaVersion = parseInt(depCompat.minJava);
        if (javaVersion < minJavaVersion) {
          errors.push(`Dependency ${depId} requires Java ${depCompat.minJava}+ but Java ${projectConfig.javaVersion} is selected`);
        }
      }
    });
  }

  return { errors, warnings, isValid: errors.length === 0 };
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

// Export validation function for external use
export { validateProjectConfiguration };

export const generateSpringBootProject = (projectConfig, apis) => {
  // Validate configuration before generation
  const validation = validateProjectConfiguration(projectConfig);
  
  if (!validation.isValid) {
    console.error('Project configuration validation failed:', validation.errors);
    throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Project configuration warnings:', validation.warnings);
  }
  const packagePath = projectConfig.packageName.replace(/\./g, '/');
  const className = toPascalCase(projectConfig.artifactId);
  
  // Analyze APIs for smart integration
  const apiAnalysis = analyzeApis(apis);
  
  const files = {
    'pom.xml': generatePomXml(projectConfig, apiAnalysis),
    'src/main/resources/application.properties': generateApplicationProperties(projectConfig, apiAnalysis),
    [`src/main/java/${packagePath}/${className}Application.java`]: generateMainApplication(projectConfig),
    [`src/main/java/${packagePath}/config/WebConfig.java`]: generateWebConfig(projectConfig),
    'README.md': generateReadme(projectConfig, apis, apiAnalysis)
  };

  // Generate API-specific files
  apis.forEach(api => {
    const apiFiles = generateApiFiles(projectConfig, api, apiAnalysis);
    Object.assign(files, apiFiles);
  });

  // Generate integration files if needed
  if (apiAnalysis.needsUserManagement || apiAnalysis.needsSecurity) {
    const securityFiles = generateSecurityFiles(projectConfig, apiAnalysis);
    Object.assign(files, securityFiles);
  }

  if (apiAnalysis.needsDatabase) {
    const dbFiles = generateDatabaseFiles(projectConfig, apiAnalysis);
    Object.assign(files, dbFiles);
  }

  return {
    files,
    analysis: apiAnalysis
  };
};

const analyzeApis = (apis) => {
  const analysis = {
    needsDatabase: false,
    needsUserManagement: false,
    needsSecurity: false,
    needsValidation: false,
    needsFileUpload: false,
    needsNotifications: false,
    entities: new Set(),
    relationships: [],
    commonFields: new Set()
  };

  apis.forEach(api => {
    // Determine what integrations are needed
    if (api.purposeKey === 'user-management') {
      analysis.needsUserManagement = true;
      analysis.needsSecurity = true;
      analysis.needsDatabase = true;
    }
    
    if (['product-catalog', 'order-management', 'content-management'].includes(api.purposeKey)) {
      analysis.needsDatabase = true;
    }
    
    if (api.purposeKey === 'file-management') {
      analysis.needsFileUpload = true;
    }
    
    if (api.purposeKey === 'notification-system') {
      analysis.needsNotifications = true;
    }

    // Extract entities and relationships
    const entityName = getEntityName(api);
    analysis.entities.add(entityName);
    
    // Check for common fields that suggest relationships
    api.fields.forEach(field => {
      if (field.toLowerCase().includes('userid') || field.toLowerCase().includes('user_id')) {
        analysis.relationships.push({ from: entityName, to: 'User', type: 'ManyToOne' });
      }
      if (field.toLowerCase().includes('customerid') || field.toLowerCase().includes('customer_id')) {
        analysis.relationships.push({ from: entityName, to: 'Customer', type: 'ManyToOne' });
      }
    });
    
    analysis.needsValidation = true; // Always add validation
  });

  return analysis;
};

const generatePomXml = (projectConfig, analysis) => {
  // Start with user-selected dependencies or defaults
  let dependencies = [];
  
  // Use user-selected dependencies if available
  if (projectConfig.dependencies && projectConfig.dependencies.length > 0) {
    dependencies = [...projectConfig.dependencies];
  } else {
    // Fallback to analysis-based dependencies
    dependencies = ['spring-boot-starter-web', 'spring-boot-starter-validation'];
    
    if (analysis.needsDatabase) {
      dependencies.push('spring-boot-starter-data-jpa');
    }
    
    if (analysis.needsSecurity) {
      dependencies.push('spring-boot-starter-security');
    }
  }

  // Add additional dependencies based on analysis
  if (analysis.needsDatabase && !dependencies.includes('spring-boot-starter-data-jpa')) {
    dependencies.push('spring-boot-starter-data-jpa');
  }
  
  if (analysis.needsSecurity && !dependencies.includes('spring-boot-starter-security')) {
    dependencies.push('spring-boot-starter-security');
  }
  
  // Add database driver based on configuration
  const databaseDrivers = {
    'h2': 'com.h2database:h2',
    'mysql': 'mysql:mysql-connector-java',
    'postgresql': 'org.postgresql:postgresql',
    'mongodb': 'org.springframework.boot:spring-boot-starter-data-mongodb'
  };
  
  // Add appropriate database driver
  if (analysis.needsDatabase || dependencies.includes('spring-boot-starter-data-jpa')) {
    const dbType = projectConfig.database || 'h2';
    const driver = databaseDrivers[dbType];
    if (driver && !dependencies.some(dep => dep.includes(driver.split(':')[1]))) {
      dependencies.push(driver);
    }
  }
  
  if (analysis.needsFileUpload) {
    dependencies.push('commons-fileupload:commons-fileupload:1.4');
  }

  // Always include test dependency
  if (!dependencies.includes('spring-boot-starter-test')) {
    dependencies.push('spring-boot-starter-test');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>${projectConfig.springBootVersion || '3.3.0'}</version>
        <relativePath/>
    </parent>
    <groupId>${projectConfig.groupId}</groupId>
    <artifactId>${projectConfig.artifactId}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>${projectConfig.packaging || 'jar'}</packaging>
    <name>${projectConfig.projectName}</name>
    <description>${projectConfig.description || 'Generated Spring Boot Application'}</description>
    <properties>
        <java.version>${projectConfig.javaVersion}</java.version>
    </properties>
    <dependencies>
${dependencies.filter(dep => dep !== 'spring-boot-starter-test').map(dep => {
  if (dep.includes(':')) {
    const [groupId, artifactId, version] = dep.split(':');
    return `        <dependency>
            <groupId>${groupId}</groupId>
            <artifactId>${artifactId}</artifactId>
            ${version ? `<version>${version}</version>` : ''}
        </dependency>`;
  } else {
    return `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>${dep}</artifactId>
        </dependency>`;
  }
}).join('\n')}
        
        <!-- Test Dependencies -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <!-- JWT Dependencies (if security is enabled) -->
        ${analysis.needsSecurity ? `<dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>` : ''}
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                ${projectConfig.packaging === 'war' ? `
                <configuration>
                    <executable>true</executable>
                </configuration>` : ''}
            </plugin>
            ${parseInt(projectConfig.javaVersion) >= 17 ? `
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>${projectConfig.javaVersion}</source>
                    <target>${projectConfig.javaVersion}</target>
                    ${parseInt(projectConfig.javaVersion) >= 21 ? `<compilerArgs>
                        <arg>--enable-preview</arg>
                    </compilerArgs>` : ''}
                </configuration>
            </plugin>` : ''}
        </plugins>
    </build>

</project>`;
};

const generateApplicationProperties = (projectConfig, analysis) => {
  let properties = `# Application Configuration
server.port=${projectConfig.serverPort || '8080'}
spring.application.name=${projectConfig.artifactId}
spring.profiles.active=${projectConfig.profileActive || 'dev'}

# Logging
logging.level.${projectConfig.packageName}=DEBUG
logging.level.org.springframework.web=${projectConfig.profileActive === 'dev' ? 'DEBUG' : 'INFO'}
`;

  if (analysis.needsDatabase) {
    properties += `
# Database Configuration (H2 for development)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
`;
  }

  if (analysis.needsFileUpload) {
    properties += `
# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=./uploads
`;
  }

  return properties;
};

const generateMainApplication = (projectConfig) => {
  const className = toPascalCase(projectConfig.artifactId);
  return `package ${projectConfig.packageName};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${className}Application {

    public static void main(String[] args) {
        SpringApplication.run(${className}Application.class, args);
    }

}`;
};

const generateWebConfig = (projectConfig) => {
  return `package ${projectConfig.packageName}.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:8080")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}`;
};

const generateApiFiles = (projectConfig, api, analysis) => {
  const packagePath = projectConfig.packageName.replace(/\./g, '/');
  const entityName = getEntityName(api);
  const controllerName = `${entityName}Controller`;
  const serviceName = `${entityName}Service`;
  const repositoryName = `${entityName}Repository`;
  
  const files = {};

  // Generate Entity
  files[`src/main/java/${packagePath}/entity/${entityName}.java`] = generateEntity(projectConfig, api, analysis);
  
  // Generate Repository
  if (analysis.needsDatabase) {
    files[`src/main/java/${packagePath}/repository/${repositoryName}.java`] = generateRepository(projectConfig, api);
  }
  
  // Generate Service
  files[`src/main/java/${packagePath}/service/${serviceName}.java`] = generateService(projectConfig, api, analysis);
  
  // Generate Controller
  files[`src/main/java/${packagePath}/controller/${controllerName}.java`] = generateController(projectConfig, api, analysis);
  
  // Generate DTOs
  files[`src/main/java/${packagePath}/dto/${entityName}CreateRequest.java`] = generateCreateRequestDto(projectConfig, api);
  files[`src/main/java/${packagePath}/dto/${entityName}Response.java`] = generateResponseDto(projectConfig, api);

  return files;
};

const generateEntity = (projectConfig, api, analysis) => {
  const entityName = getEntityName(api);
  const fields = api.fields.map(field => generateEntityField(field, api.purposeKey)).join('\n');
  
  let imports = `package ${projectConfig.packageName}.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;`;

  if (api.purposeKey === 'user-management') {
    imports += `
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.Collections;`;
  }

  let classDeclaration = `@Entity
@Table(name = "${entityName.toLowerCase()}s")
public class ${entityName}`;

  if (api.purposeKey === 'user-management') {
    classDeclaration += ` implements UserDetails`;
  }

  return `${imports}

${classDeclaration} {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

${fields}

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Constructors
    public ${entityName}() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

${api.fields.map(field => generateGetterSetter(field)).join('\n')}

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

${api.purposeKey === 'user-management' ? generateUserDetailsImplementation() : ''}
}`;
};

const generateEntityField = (field, purposeKey) => {
  const fieldName = toCamelCase(field);
  const columnName = toSnakeCase(field);
  
  let annotations = `    @Column(name = "${columnName}")`;
  let type = 'String';
  
  // Smart field type detection
  if (field.toLowerCase().includes('email')) {
    annotations = `    @Column(name = "${columnName}", unique = true)
    @Email
    @NotBlank`;
  } else if (field.toLowerCase().includes('password')) {
    annotations = `    @Column(name = "${columnName}")
    @NotBlank
    @Size(min = 6)`;
  } else if (field.toLowerCase().includes('price') || field.toLowerCase().includes('amount')) {
    type = 'java.math.BigDecimal';
    annotations = `    @Column(name = "${columnName}", precision = 10, scale = 2)`;
  } else if (field.toLowerCase().includes('date')) {
    type = 'LocalDateTime';
    annotations = `    @Column(name = "${columnName}")`;
  } else if (field.toLowerCase().includes('stock') || field.toLowerCase().includes('quantity')) {
    type = 'Integer';
    annotations = `    @Column(name = "${columnName}")
    @Min(0)`;
  } else if (field.toLowerCase().includes('id') && !field.toLowerCase().startsWith('id')) {
    type = 'Long';
    annotations = `    @Column(name = "${columnName}")`;
  }

  return `${annotations}
    private ${type} ${fieldName};`;
};

const generateGetterSetter = (field) => {
  const fieldName = toCamelCase(field);
  const capitalizedName = capitalize(fieldName);
  let type = 'String';
  
  if (field.toLowerCase().includes('price') || field.toLowerCase().includes('amount')) {
    type = 'java.math.BigDecimal';
  } else if (field.toLowerCase().includes('date')) {
    type = 'LocalDateTime';
  } else if (field.toLowerCase().includes('stock') || field.toLowerCase().includes('quantity')) {
    type = 'Integer';
  } else if (field.toLowerCase().includes('id') && !field.toLowerCase().startsWith('id')) {
    type = 'Long';
  }

  return `    public ${type} get${capitalizedName}() { return ${fieldName}; }
    public void set${capitalizedName}(${type} ${fieldName}) { this.${fieldName} = ${fieldName}; }`;
};

const generateUserDetailsImplementation = () => {
  return `
    // UserDetails implementation
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return username; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }`;
};

const generateRepository = (projectConfig, api) => {
  const entityName = getEntityName(api);
  const repositoryName = `${entityName}Repository`;
  
  return `package ${projectConfig.packageName}.repository;

import ${projectConfig.packageName}.entity.${entityName};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ${repositoryName} extends JpaRepository<${entityName}, Long> {

${generateRepositoryMethods(api)}
}`;
};

const generateRepositoryMethods = (api) => {
  const methods = [];
  
  api.fields.forEach(field => {
    const fieldName = toCamelCase(field);
    const capitalizedName = capitalize(fieldName);
    
    if (field.toLowerCase().includes('email') || field.toLowerCase().includes('username')) {
      methods.push(`    Optional<${getEntityName(api)}> findBy${capitalizedName}(String ${fieldName});`);
    }
    
    if (field.toLowerCase().includes('status') || field.toLowerCase().includes('category')) {
      methods.push(`    List<${getEntityName(api)}> findBy${capitalizedName}(String ${fieldName});`);
    }
  });

  return methods.join('\n');
};

const generateService = (projectConfig, api, analysis) => {
  const entityName = getEntityName(api);
  const serviceName = `${entityName}Service`;
  const repositoryName = analysis.needsDatabase ? `${entityName}Repository` : null;
  
  let imports = `package ${projectConfig.packageName}.service;

import ${projectConfig.packageName}.entity.${entityName};
import ${projectConfig.packageName}.dto.${entityName}CreateRequest;
import ${projectConfig.packageName}.dto.${entityName}Response;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;`;

  if (analysis.needsDatabase) {
    imports += `
import ${projectConfig.packageName}.repository.${repositoryName};
import org.springframework.beans.factory.annotation.Autowired;`;
  } else {
    imports += `
import java.util.ArrayList;
import java.util.concurrent.atomic.AtomicLong;`;
  }

  return `${imports}

@Service
public class ${serviceName} {

${analysis.needsDatabase ? 
  `    @Autowired
    private ${repositoryName} repository;` :
  `    private final List<${entityName}> items = new ArrayList<>();
    private final AtomicLong idGenerator = new AtomicLong(1);`
}

    public List<${entityName}Response> getAll() {
${analysis.needsDatabase ?
  `        return repository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());` :
  `        return items.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());`
}
    }

    public Optional<${entityName}Response> getById(Long id) {
${analysis.needsDatabase ?
  `        return repository.findById(id)
                .map(this::convertToResponse);` :
  `        return items.stream()
                .filter(item -> item.getId().equals(id))
                .findFirst()
                .map(this::convertToResponse);`
}
    }

    public ${entityName}Response create(${entityName}CreateRequest request) {
        ${entityName} entity = convertToEntity(request);
${analysis.needsDatabase ?
  `        entity = repository.save(entity);` :
  `        entity.setId(idGenerator.getAndIncrement());
        items.add(entity);`
}
        return convertToResponse(entity);
    }

    public Optional<${entityName}Response> update(Long id, ${entityName}CreateRequest request) {
${analysis.needsDatabase ?
  `        return repository.findById(id)
                .map(entity -> {
                    updateEntityFromRequest(entity, request);
                    return repository.save(entity);
                })
                .map(this::convertToResponse);` :
  `        return items.stream()
                .filter(item -> item.getId().equals(id))
                .findFirst()
                .map(entity -> {
                    updateEntityFromRequest(entity, request);
                    return convertToResponse(entity);
                });`
}
    }

    public boolean delete(Long id) {
${analysis.needsDatabase ?
  `        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;` :
  `        return items.removeIf(item -> item.getId().equals(id));`
}
    }

    private ${entityName} convertToEntity(${entityName}CreateRequest request) {
        ${entityName} entity = new ${entityName}();
${api.fields.map(field => {
  const fieldName = toCamelCase(field);
  return `        entity.set${capitalize(fieldName)}(request.get${capitalize(fieldName)}());`;
}).join('\n')}
        return entity;
    }

    private void updateEntityFromRequest(${entityName} entity, ${entityName}CreateRequest request) {
${api.fields.map(field => {
  const fieldName = toCamelCase(field);
  return `        entity.set${capitalize(fieldName)}(request.get${capitalize(fieldName)}());`;
}).join('\n')}
    }

    private ${entityName}Response convertToResponse(${entityName} entity) {
        ${entityName}Response response = new ${entityName}Response();
        response.setId(entity.getId());
${api.fields.map(field => {
  const fieldName = toCamelCase(field);
  return `        response.set${capitalize(fieldName)}(entity.get${capitalize(fieldName)}());`;
}).join('\n')}
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}`;
};

const generateController = (projectConfig, api, analysis) => {
  const entityName = getEntityName(api);
  const controllerName = `${entityName}Controller`;
  const serviceName = `${entityName}Service`;
  
  // Parse endpoints to generate appropriate methods
  const endpoints = api.endpoints.map(endpoint => parseEndpoint(endpoint, entityName));
  
  return `package ${projectConfig.packageName}.controller;

import ${projectConfig.packageName}.service.${serviceName};
import ${projectConfig.packageName}.dto.${entityName}CreateRequest;
import ${projectConfig.packageName}.dto.${entityName}Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/${entityName.toLowerCase()}s")
@CrossOrigin(origins = "*")
public class ${controllerName} {

    @Autowired
    private ${serviceName} service;

${endpoints.map(endpoint => generateControllerMethod(endpoint, entityName)).join('\n\n')}
}`;
};

const parseEndpoint = (endpointStr, entityName) => {
  const [method, path] = endpointStr.split(' ');
  return { method, path, entityName };
};

const generateControllerMethod = (endpoint, entityName) => {
  const { method, path } = endpoint;
  
  switch (method) {
    case 'GET':
      if (path.includes('{id}')) {
        return `    @GetMapping("/{id}")
    public ResponseEntity<${entityName}Response> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(response -> ResponseEntity.ok(response))
                .orElse(ResponseEntity.notFound().build());
    }`;
      } else {
        return `    @GetMapping
    public ResponseEntity<List<${entityName}Response>> getAll() {
        List<${entityName}Response> items = service.getAll();
        return ResponseEntity.ok(items);
    }`;
      }
    
    case 'POST':
      return `    @PostMapping
    public ResponseEntity<${entityName}Response> create(@Valid @RequestBody ${entityName}CreateRequest request) {
        ${entityName}Response response = service.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }`;
    
    case 'PUT':
      return `    @PutMapping("/{id}")
    public ResponseEntity<${entityName}Response> update(@PathVariable Long id, @Valid @RequestBody ${entityName}CreateRequest request) {
        return service.update(id, request)
                .map(response -> ResponseEntity.ok(response))
                .orElse(ResponseEntity.notFound().build());
    }`;
    
    case 'DELETE':
      return `    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }`;
    
    default:
      return `    // TODO: Implement ${method} ${path}`;
  }
};

const generateCreateRequestDto = (projectConfig, api) => {
  const entityName = getEntityName(api);
  
  return `package ${projectConfig.packageName}.dto;

import jakarta.validation.constraints.*;

public class ${entityName}CreateRequest {

${api.fields.map(field => generateDtoField(field, true)).join('\n')}

    // Constructors
    public ${entityName}CreateRequest() {}

    // Getters and Setters
${api.fields.map(field => generateGetterSetter(field)).join('\n')}
}`;
};

const generateResponseDto = (projectConfig, api) => {
  const entityName = getEntityName(api);
  
  return `package ${projectConfig.packageName}.dto;

import java.time.LocalDateTime;

public class ${entityName}Response {

    private Long id;
${api.fields.map(field => generateDtoField(field, false)).join('\n')}
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public ${entityName}Response() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

${api.fields.map(field => generateGetterSetter(field)).join('\n')}

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}`;
};

const generateDtoField = (field, isRequest) => {
  const fieldName = toCamelCase(field);
  let type = 'String';
  let annotations = '';
  
  if (field.toLowerCase().includes('email')) {
    annotations = isRequest ? '    @Email\n    @NotBlank\n' : '';
  } else if (field.toLowerCase().includes('password')) {
    annotations = isRequest ? '    @NotBlank\n    @Size(min = 6)\n' : '';
    if (!isRequest) return ''; // Don't include password in response
  } else if (field.toLowerCase().includes('price') || field.toLowerCase().includes('amount')) {
    type = 'java.math.BigDecimal';
    annotations = isRequest ? '    @NotNull\n    @DecimalMin("0.0")\n' : '';
  } else if (field.toLowerCase().includes('date')) {
    type = 'LocalDateTime';
  } else if (field.toLowerCase().includes('stock') || field.toLowerCase().includes('quantity')) {
    type = 'Integer';
    annotations = isRequest ? '    @NotNull\n    @Min(0)\n' : '';
  } else if (field.toLowerCase().includes('id') && !field.toLowerCase().startsWith('id')) {
    type = 'Long';
  }

  return `${annotations}    private ${type} ${fieldName};`;
};

const generateSecurityFiles = (projectConfig, analysis) => {
  const packagePath = projectConfig.packageName.replace(/\./g, '/');
  const files = {};

  files[`src/main/java/${packagePath}/config/SecurityConfig.java`] = `package ${projectConfig.packageName}.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/users/register", "/api/users/login", "/h2-console/**").permitAll()
                .anyRequest().authenticated()
            )
            .headers().frameOptions().disable(); // For H2 console

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}`;

  return files;
};

const generateDatabaseFiles = (projectConfig, appTemplate) => {
  const files = {};

  // Generate comprehensive data.sql with sample data for all entities
  let dataSql = `-- Sample data for development
-- This file will be executed on application startup
-- Generated for ${projectConfig.projectName}

`;

  if (appTemplate.entities && appTemplate.entities.length > 0) {
    dataSql += `-- ==============================================\n`;
    dataSql += `-- SAMPLE DATA FOR ${projectConfig.projectName.toUpperCase()}\n`;
    dataSql += `-- ==============================================\n\n`;

    appTemplate.entities.forEach((entity, entityIndex) => {
      const tableName = entity.name.toLowerCase();
      const fields = entity.fields || [];
      
      dataSql += `-- ${entity.name} sample data\n`;
      
      if (fields.length > 0) {
        // Generate INSERT statements for each entity
        const fieldNames = fields.map(field => field.name).join(', ');
        
        dataSql += `INSERT INTO ${tableName} (${fieldNames}) VALUES\n`;
        
        // Generate 3-5 sample records per entity
        const sampleCount = Math.min(5, Math.max(3, entityIndex + 3));
        const sampleRecords = [];
        
        for (let i = 1; i <= sampleCount; i++) {
          const values = fields.map(field => generateSampleValue(field, i, entity.name)).join(', ');
          sampleRecords.push(`  (${values})`);
        }
        
        dataSql += sampleRecords.join(',\n') + ';\n\n';
      } else {
        dataSql += `-- No fields defined for ${entity.name}\n\n`;
      }
    });
  } else {
    dataSql += `-- No entities found in template\n`;
    dataSql += `-- Add your sample data here\n`;
    dataSql += `-- INSERT INTO your_table (column1, column2) VALUES ('value1', 'value2');\n\n`;
  }

  dataSql += `-- ==============================================\n`;
  dataSql += `-- END OF SAMPLE DATA\n`;
  dataSql += `-- ==============================================\n`;

  files[`src/main/resources/data.sql`] = dataSql;

  return files;
};

// Helper function to generate sample values based on field type
const generateSampleValue = (field, index, entityName) => {
  const fieldName = field.name.toLowerCase();
  const fieldType = field.type.toLowerCase();
  
  // Handle ID fields
  if (fieldName === 'id' || fieldName.endsWith('_id')) {
    return index.toString();
  }
  
  // Handle specific field patterns with realistic data
  if (fieldName.includes('email')) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];
    const domain = domains[index % domains.length];
    return `'user${index}@${domain}'`;
  }
  
  if (fieldName.includes('username') || fieldName === 'name') {
    const names = ['john_doe', 'jane_smith', 'alex_wilson', 'sarah_johnson', 'mike_brown'];
    return `'${names[index % names.length]}${index}'`;
  }
  
  if (fieldName.includes('firstname') || fieldName.includes('first_name')) {
    const firstNames = ['John', 'Jane', 'Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa'];
    return `'${firstNames[index % firstNames.length]}'`;
  }
  
  if (fieldName.includes('lastname') || fieldName.includes('last_name')) {
    const lastNames = ['Doe', 'Smith', 'Wilson', 'Johnson', 'Brown', 'Davis', 'Miller', 'Garcia'];
    return `'${lastNames[index % lastNames.length]}'`;
  }
  
  if (fieldName.includes('password')) {
    return `'$2a$10$hashedPassword${index}Example'`;
  }
  
  if (fieldName.includes('phone')) {
    return `'+1-555-${String(index).padStart(3, '0')}-${String(1000 + index).slice(-4)}'`;
  }
  
  if (fieldName.includes('url') || fieldName.includes('link') || fieldName.includes('website')) {
    const domains = ['example.com', 'demo.org', 'test.net', 'sample.io'];
    return `'https://${domains[index % domains.length]}/${entityName.toLowerCase()}${index}'`;
  }
  
  if (fieldName.includes('description') || fieldName.includes('content') || fieldName.includes('bio')) {
    const descriptions = [
      'This is a comprehensive description for',
      'Detailed information about',
      'Professional overview of',
      'Complete details regarding',
      'Extensive description for'
    ];
    return `'${descriptions[index % descriptions.length]} ${entityName} ${index}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'`;
  }
  
  if (fieldName.includes('title') || fieldName.includes('subject')) {
    const titles = ['Professional', 'Advanced', 'Complete', 'Ultimate', 'Premium'];
    return `'${titles[index % titles.length]} ${entityName} Title ${index}'`;
  }
  
  if (fieldName.includes('address')) {
    const streets = ['Main St', 'Oak Ave', 'Park Blvd', 'First St', 'Second Ave'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    return `'${index * 100} ${streets[index % streets.length]}, ${cities[index % cities.length]}, NY ${10000 + index}'`;
  }
  
  if (fieldName.includes('city')) {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
    return `'${cities[index % cities.length]}'`;
  }
  
  if (fieldName.includes('state') || fieldName.includes('province')) {
    const states = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA'];
    return `'${states[index % states.length]}'`;
  }
  
  if (fieldName.includes('country')) {
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'India'];
    return `'${countries[index % countries.length]}'`;
  }
  
  if (fieldName.includes('price') || fieldName.includes('amount') || fieldName.includes('cost') || fieldName.includes('salary')) {
    const basePrice = fieldName.includes('salary') ? 50000 : 99;
    return `${(basePrice + index * (fieldName.includes('salary') ? 10000 : 50)).toFixed(2)}`;
  }
  
  if (fieldName.includes('rating') || fieldName.includes('score')) {
    return `${(3.5 + (index % 15) / 10).toFixed(1)}`;
  }
  
  if (fieldName.includes('count') || fieldName.includes('number') || fieldName.includes('quantity') || fieldName.includes('views')) {
    return (index * 25 + 100).toString();
  }
  
  if (fieldName.includes('status')) {
    const statuses = ['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED', 'DRAFT'];
    return `'${statuses[index % statuses.length]}'`;
  }
  
  if (fieldName.includes('type') || fieldName.includes('category')) {
    const types = ['STANDARD', 'PREMIUM', 'BASIC', 'ADVANCED', 'PROFESSIONAL'];
    return `'${types[index % types.length]}'`;
  }
  
  if (fieldName.includes('role')) {
    const roles = ['USER', 'ADMIN', 'MODERATOR', 'EDITOR', 'VIEWER'];
    return `'${roles[index % roles.length]}'`;
  }
  
  if (fieldName.includes('priority')) {
    const priorities = ['HIGH', 'MEDIUM', 'LOW', 'URGENT', 'NORMAL'];
    return `'${priorities[index % priorities.length]}'`;
  }
  
  if (fieldName.includes('language') || fieldName.includes('locale')) {
    const languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT'];
    return `'${languages[index % languages.length]}'`;
  }
  
  if (fieldName.includes('timezone')) {
    const timezones = ['UTC', 'EST', 'PST', 'CST', 'MST'];
    return `'${timezones[index % timezones.length]}'`;
  }
  
  if (fieldName.includes('duration')) {
    return `${(index * 30 + 60)}`;  // Duration in minutes
  }
  
  if (fieldName.includes('size') || fieldName.includes('length') || fieldName.includes('width') || fieldName.includes('height')) {
    return `${(index * 5 + 10).toFixed(1)}`;
  }
  
  if (fieldName.includes('weight')) {
    return `${(index * 2.5 + 5).toFixed(2)}`;
  }
  
  if (fieldName.includes('version')) {
    return `'v${index}.${(index % 10)}.0'`;
  }
  
  if (fieldName.includes('code') || fieldName.includes('token')) {
    return `'${entityName.toUpperCase()}_${String(index).padStart(4, '0')}'`;
  }
  
  // Handle by field type
  switch (fieldType) {
    case 'string':
    case 'varchar':
    case 'text':
      return `'Sample ${fieldName.replace(/_/g, ' ')} ${index}'`;
    
    case 'int':
    case 'integer':
    case 'long':
      return (index * 10 + 1).toString();
    
    case 'double':
    case 'float':
    case 'decimal':
      return `${(index * 10.5 + 1.5).toFixed(2)}`;
    
    case 'boolean':
      return index % 2 === 0 ? 'true' : 'false';
    
    case 'date':
      const date = new Date();
      date.setDate(date.getDate() - (index * 7));  // Weekly intervals
      return `'${date.toISOString().split('T')[0]}'`;
    
    case 'datetime':
    case 'timestamp':
      const datetime = new Date();
      datetime.setHours(datetime.getHours() - (index * 2));  // 2-hour intervals
      return `'${datetime.toISOString().replace('T', ' ').split('.')[0]}'`;
    
    case 'time':
      const hour = (8 + index) % 24;  // Start from 8 AM
      const minute = (index * 15) % 60;  // 15-minute intervals
      return `'${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00'`;
    
    case 'enum':
      // For enum fields, we'll use common enum values
      const enumValues = ['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED', 'DRAFT'];
      return `'${enumValues[index % enumValues.length]}'`;
    
    case 'uuid':
      // Generate a simple UUID-like string
      return `'${entityName.toLowerCase()}-${String(index).padStart(4, '0')}-4${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-a${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}'`;
    
    case 'json':
    case 'jsonb':
      return `'{"key": "value${index}", "index": ${index}, "active": ${index % 2 === 0}}'`;
    
    default:
      return `'${fieldName.replace(/_/g, ' ')} value ${index}'`;
  }
};

const generateReadme = (projectConfig, apis, analysis) => {
  return `# ${projectConfig.projectName}

${projectConfig.description || 'A Spring Boot application generated with intelligent API creation.'}

## Features

This project includes the following APIs:

${apis.map(api => `### ${api.name}
- **Purpose**: ${api.purpose}
- **Endpoints**: ${api.endpoints.join(', ')}
- **Fields**: ${api.fields.join(', ')}
`).join('\n')}

## Getting Started

### Prerequisites
- Java ${projectConfig.javaVersion}
- Maven 3.6+
- Database (if configured)

### Running the Application

1. Clone this repository
2. Navigate to the project directory
3. Configure database settings in \`application.properties\` (if needed)
4. Run the application:
   \`\`\`bash
   mvn spring-boot:run
   \`\`\`

The application will start on \`http://localhost:8080\`

${analysis.needsSecurity ? `### Security Configuration

This application includes Spring Security with OAuth2 and JWT support.

#### OAuth2 Setup (Optional)

To enable OAuth2 login with Google, GitHub, or Facebook, update your \`application.properties\`:

\`\`\`properties
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=your-google-client-id
spring.security.oauth2.client.registration.google.client-secret=your-google-client-secret

# GitHub OAuth2  
spring.security.oauth2.client.registration.github.client-id=your-github-client-id
spring.security.oauth2.client.registration.github.client-secret=your-github-client-secret

# Facebook OAuth2
spring.security.oauth2.client.registration.facebook.client-id=your-facebook-client-id
spring.security.oauth2.client.registration.facebook.client-secret=your-facebook-client-secret
\`\`\`

#### Getting OAuth2 Credentials

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add \`http://localhost:8080/oauth2/callback/google\` as redirect URI

**GitHub:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: \`http://localhost:8080/oauth2/callback/github\`

**Facebook:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URI: \`http://localhost:8080/oauth2/callback/facebook\`

#### Authentication Endpoints

- **Login**: \`POST /api/auth/signin\`
- **Register**: \`POST /api/auth/signup\`
- **OAuth2 Login**: \`GET /oauth2/authorization/{provider}\` (google, github, facebook)

#### Default Credentials
- Username: \`admin\`
- Password: \`admin123\`

` : ''}### API Documentation

Once the application is running, you can access the APIs at:

${apis.map(api => `- **${api.name}**: \`http://localhost:8080/api/${getEntityName(api).toLowerCase()}s\``).join('\n')}

### Database

This application uses H2 in-memory database for development. 
You can access the H2 console at: \`http://localhost:8080/h2-console\`

**Connection details:**
- JDBC URL: \`jdbc:h2:mem:testdb\`
- Username: \`sa\`
- Password: \`password\`

## Project Structure

\`\`\`
src/
├── main/
│   ├── java/${projectConfig.packageName.replace(/\./g, '/')}/
│   │   ├── controller/     # REST Controllers
│   │   ├── service/        # Business Logic
│   │   ├── repository/     # Data Access Layer
│   │   ├── entity/         # JPA Entities
│   │   ├── dto/            # Data Transfer Objects
│   │   └── config/         # Configuration Classes
│   └── resources/
│       ├── application.properties
│       └── data.sql
└── test/
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
`;
};

// Utility functions
const toPascalCase = (str) => {
  return str.replace(/(^|-)([a-z])/g, (_, __, char) => char.toUpperCase());
};

const toCamelCase = (str) => {
  return str.replace(/(^|_)([a-z])/g, (match, prefix, char, index) => 
    index === 0 ? char.toLowerCase() : char.toUpperCase()
  ).replace(/_/g, '');
};

const toSnakeCase = (str) => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getEntityName = (api) => {
  return api.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
};

export const generateTemplateProject = (projectConfig, templateSelection) => {
  const { template, templateData, databaseConfig } = templateSelection;
  
  // Generate complete project structure from template
  const appTemplate = generateAppTemplate(template, projectConfig, databaseConfig);
  console.log('Generated app template:', {
    template,
    entityCount: appTemplate.entities?.length || 0,
    apiCount: appTemplate.apis?.length || 0,
    enumCount: Object.keys(appTemplate.enums || {}).length,
    entities: appTemplate.entities?.map(e => e.name) || [],
    apis: appTemplate.apis?.map(a => a.name) || []
  });
  
  const packagePath = projectConfig.packageName.replace(/\./g, '/');
  const className = toPascalCase(projectConfig.artifactId);
  
  const files = {
    'pom.xml': generateTemplatePomXml(projectConfig, databaseConfig),
    'src/main/resources/application.properties': generateTemplateApplicationProperties(projectConfig, databaseConfig),
    [`src/main/java/${packagePath}/${className}Application.java`]: generateMainApplication(projectConfig),
    [`src/main/java/${packagePath}/config/WebConfig.java`]: generateWebConfig(projectConfig),
    [`src/main/java/${packagePath}/config/DatabaseConfig.java`]: generateDatabaseConfig(projectConfig, databaseConfig),
    [`src/main/java/${packagePath}/config/SecurityConfig.java`]: generateSecurityConfig(projectConfig),
    [`src/main/java/${packagePath}/config/JwtConfig.java`]: generateJwtConfig(projectConfig),
    [`src/main/java/${packagePath}/config/CorsConfig.java`]: generateCorsConfig(projectConfig),
    [`src/main/java/${packagePath}/security/JwtAuthenticationEntryPoint.java`]: generateJwtAuthenticationEntryPoint(projectConfig),
    [`src/main/java/${packagePath}/security/JwtAuthenticationFilter.java`]: generateJwtAuthenticationFilter(projectConfig),
    [`src/main/java/${packagePath}/security/JwtTokenProvider.java`]: generateJwtTokenProvider(projectConfig),
    [`src/main/java/${packagePath}/security/CustomOAuth2UserService.java`]: generateCustomOAuth2UserService(projectConfig),
    [`src/main/java/${packagePath}/security/OAuth2AuthenticationSuccessHandler.java`]: generateOAuth2AuthenticationSuccessHandler(projectConfig),
    [`src/main/java/${packagePath}/entity/User.java`]: generateUserEntity(projectConfig),
    [`src/main/java/${packagePath}/entity/Role.java`]: generateRoleEntity(projectConfig),
    [`src/main/java/${packagePath}/repository/UserRepository.java`]: generateUserRepository(projectConfig),
    [`src/main/java/${packagePath}/repository/RoleRepository.java`]: generateRoleRepository(projectConfig),
    [`src/main/java/${packagePath}/service/UserService.java`]: generateUserService(projectConfig),
    [`src/main/java/${packagePath}/service/CustomUserDetailsService.java`]: generateCustomUserDetailsService(projectConfig),
    [`src/main/java/${packagePath}/controller/AuthController.java`]: generateAuthController(projectConfig),
    [`src/main/java/${packagePath}/dto/LoginRequest.java`]: generateLoginRequest(projectConfig),
    [`src/main/java/${packagePath}/dto/SignUpRequest.java`]: generateSignUpRequest(projectConfig),
    [`src/main/java/${packagePath}/dto/JwtAuthenticationResponse.java`]: generateJwtAuthenticationResponse(projectConfig),
    [`src/main/java/${packagePath}/security/UserPrincipal.java`]: generateUserPrincipal(projectConfig),
    'README.md': generateTemplateReadme(projectConfig, templateData, appTemplate)
  };

  // Generate entities
  if (appTemplate.entities) {
    console.log(`Generating ${appTemplate.entities.length} entities:`, appTemplate.entities.map(e => e.name));
    appTemplate.entities.forEach(entity => {
      console.log(`Generating files for entity: ${entity.name}`);
      const entityFiles = generateCompleteEntityFiles(projectConfig, entity, appTemplate.enums);
      console.log(`Generated ${Object.keys(entityFiles).length} files for ${entity.name}:`, Object.keys(entityFiles));
      Object.assign(files, entityFiles);
    });
  } else {
    console.log('No entities found in appTemplate');
  }

  // Generate enums
  if (appTemplate.enums) {
    Object.entries(appTemplate.enums).forEach(([enumName, values]) => {
      files[`src/main/java/${packagePath}/enums/${enumName}.java`] = generateEnumClass(projectConfig, enumName, values);
    });
  }

  // Generate API files based on template
  if (appTemplate.apis) {
    console.log(`Generating ${appTemplate.apis.length} APIs:`, appTemplate.apis.map(a => a.name));
    appTemplate.apis.forEach(api => {
      console.log(`Generating API files for: ${api.name} (entity: ${api.entity})`);
      const apiFiles = generateTemplateApiFiles(projectConfig, api, appTemplate);
      console.log(`Generated ${Object.keys(apiFiles).length} API files for ${api.name}:`, Object.keys(apiFiles));
      Object.assign(files, apiFiles);
    });
  } else {
    console.log('No APIs found in appTemplate');
  }

  // Add database initialization files
  const dbFiles = generateDatabaseFiles(projectConfig, appTemplate);
  Object.assign(files, dbFiles);

  console.log(`Total files generated: ${Object.keys(files).length}`);
  console.log('All generated files:', Object.keys(files));

  return { 
    files, 
    analysis: {
      hasDatabase: true,
      hasValidation: true,
      hasSecurity: true,
      hasWebSupport: true,
      entityCount: appTemplate.entities?.length || 0,
      apiCount: appTemplate.apis?.length || 0,
      template: templateData.name,
      database: databaseConfig.name
    }
  };
};

// Helper functions for template generation
const generateTemplatePomXml = (projectConfig, databaseConfig) => {
  const dependencies = [
    'spring-boot-starter-web',
    'spring-boot-starter-data-jpa',
    'spring-boot-starter-validation',
    'spring-boot-starter-security',
    'spring-boot-starter-oauth2-client',
    'spring-boot-starter-oauth2-resource-server',
    ...databaseConfig.dependencies
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    <groupId>${projectConfig.groupId}</groupId>
    <artifactId>${projectConfig.artifactId}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>${projectConfig.projectName}</name>
    <description>${projectConfig.description}</description>
    <properties>
        <java.version>${projectConfig.javaVersion}</java.version>
    </properties>
    <dependencies>
        ${dependencies.map(dep => {
          if (dep === 'mysql-connector-java') {
            return `<dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>`;
          } else if (dep === 'postgresql') {
            return `<dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>`;
          } else if (dep === 'h2') {
            return `<dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>`;
          } else if (dep === 'spring-boot-starter-data-mongodb') {
            return `<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>`;
          } else {
            return `<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>${dep}</artifactId>
        </dependency>`;
          }
        }).join('\n        ')}
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <!-- JWT Dependencies -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`;
};

const generateTemplateApplicationProperties = (projectConfig, databaseConfig) => {
  const dbName = projectConfig.artifactId.replace(/-/g, '_');
  let properties = `# Application Configuration
server.port=8080
spring.application.name=${projectConfig.artifactId}

# Database Configuration
`;

  Object.entries(databaseConfig.properties).forEach(([key, value]) => {
    properties += `${key}=${value.replace('{dbname}', dbName)}\n`;
  });

  properties += `
# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Security Configuration
spring.security.user.name=admin
spring.security.user.password=admin123
spring.security.user.roles=ADMIN

# OAuth2 Configuration
# Google OAuth2
spring.security.oauth2.client.registration.google.client-id=your-google-client-id
spring.security.oauth2.client.registration.google.client-secret=your-google-client-secret
spring.security.oauth2.client.registration.google.scope=profile,email
spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/oauth2/callback/{registrationId}

# GitHub OAuth2
spring.security.oauth2.client.registration.github.client-id=your-github-client-id
spring.security.oauth2.client.registration.github.client-secret=your-github-client-secret
spring.security.oauth2.client.registration.github.scope=read:user,user:email
spring.security.oauth2.client.registration.github.redirect-uri={baseUrl}/oauth2/callback/{registrationId}

# Facebook OAuth2
spring.security.oauth2.client.registration.facebook.client-id=your-facebook-client-id
spring.security.oauth2.client.registration.facebook.client-secret=your-facebook-client-secret
spring.security.oauth2.client.registration.facebook.scope=email,public_profile
spring.security.oauth2.client.registration.facebook.redirect-uri={baseUrl}/oauth2/callback/{registrationId}

# JWT Configuration
app.jwt.secret=mySecretKey123456789012345678901234567890
app.jwt.expiration-ms=86400000
app.jwt.refresh-expiration-ms=604800000

# CORS Configuration
app.cors.allowed-origins=http://localhost:3000,http://localhost:8080
app.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
app.cors.allowed-headers=*
app.cors.allow-credentials=true

# Logging Configuration
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
`;

  return properties;
};

const generateDatabaseConfig = (projectConfig, databaseConfig) => {
  return `package ${projectConfig.packageName}.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableJpaRepositories(basePackages = "${projectConfig.packageName}.repository")
@EnableTransactionManagement
public class DatabaseConfig {
    // Database configuration will be handled by Spring Boot auto-configuration
    // Custom configurations can be added here if needed
}`;
};

const generateCompleteEntityFiles = (projectConfig, entity, enums) => {
  const packagePath = projectConfig.packageName.replace(/\./g, '/');
  const files = {};
  
  // Generate Entity class
  files[`src/main/java/${packagePath}/entity/${entity.name}.java`] = generateEntityClass(projectConfig, entity);
  
  // Generate Repository
  files[`src/main/java/${packagePath}/repository/${entity.name}Repository.java`] = generateRepositoryClass(projectConfig, entity);
  
  // Generate Service
  files[`src/main/java/${packagePath}/service/${entity.name}Service.java`] = generateServiceClass(projectConfig, entity);
  
  // Generate Controller
  files[`src/main/java/${packagePath}/controller/${entity.name}Controller.java`] = generateControllerClass(projectConfig, entity);
  
  // Generate DTO classes
  files[`src/main/java/${packagePath}/dto/${entity.name}CreateDTO.java`] = generateCreateDTO(projectConfig, entity);
  files[`src/main/java/${packagePath}/dto/${entity.name}UpdateDTO.java`] = generateUpdateDTO(projectConfig, entity);
  files[`src/main/java/${packagePath}/dto/${entity.name}ResponseDTO.java`] = generateResponseDTO(projectConfig, entity);
  
  return files;
};

const generateEntityClass = (projectConfig, entity) => {
  const imports = new Set([
    'javax.persistence.*',
    'javax.validation.constraints.*',
    'org.hibernate.annotations.CreationTimestamp',
    'org.hibernate.annotations.UpdateTimestamp',
    'java.time.LocalDateTime',
    'java.util.List',
    'java.util.Set',
    'java.math.BigDecimal'
  ]);

  // Add custom imports based on field types
  entity.fields?.forEach(field => {
    if (field.type === 'LocalDate') imports.add('java.time.LocalDate');
    if (field.type === 'LocalDateTime') imports.add('java.time.LocalDateTime');
    if (field.type === 'BigDecimal') imports.add('java.math.BigDecimal');
  });

  const fieldsCode = entity.fields?.map(field => {
    const annotations = field.annotations?.join('\n    ') || '';
    return `    ${annotations}${annotations ? '\n    ' : ''}private ${field.type} ${field.name};`;
  }).join('\n\n') || '';

  const relationshipsCode = entity.relationships?.map(rel => {
    let annotation = `@${rel.type}`;
    if (rel.mappedBy) annotation += `(mappedBy = "${rel.mappedBy}")`;
    if (rel.joinTable) annotation += `\n    @JoinTable(name = "${rel.joinTable}")`;
    
    const fieldType = rel.type.includes('Many') ? `Set<${rel.target}>` : rel.target;
    const fieldName = rel.name || (rel.type.includes('Many') ? rel.target.toLowerCase() + 's' : rel.target.toLowerCase());
    
    return `    ${annotation}
    private ${fieldType} ${fieldName};`;
  }).join('\n\n') || '';

  return `package ${projectConfig.packageName}.entity;

${Array.from(imports).map(imp => `import ${imp};`).join('\n')}

@Entity
@Table(name = "${toSnakeCase(entity.name)}")
public class ${entity.name} {

${fieldsCode}

${relationshipsCode ? '\n' + relationshipsCode + '\n' : ''}
    // Constructors
    public ${entity.name}() {}

    // Getters and Setters
${entity.fields?.map(field => `    public ${field.type} get${capitalize(field.name)}() {
        return ${field.name};
    }

    public void set${capitalize(field.name)}(${field.type} ${field.name}) {
        this.${field.name} = ${field.name};
    }`).join('\n\n') || ''}
}`;
};

const generateEnumClass = (projectConfig, enumName, values) => {
  return `package ${projectConfig.packageName}.enums;

public enum ${enumName} {
    ${values.join(', ')}
}`;
};

const generateRepositoryClass = (projectConfig, entity) => {
  return `package ${projectConfig.packageName}.repository;

import ${projectConfig.packageName}.entity.${entity.name};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ${entity.name}Repository extends JpaRepository<${entity.name}, Long> {
    
    // Custom query methods can be added here
    List<${entity.name}> findByIsActiveTrue();
    
    @Query("SELECT e FROM ${entity.name} e WHERE e.createdAt >= :date")
    List<${entity.name}> findRecentEntities(@Param("date") java.time.LocalDateTime date);
}`;
};

const generateServiceClass = (projectConfig, entity) => {
  return `package ${projectConfig.packageName}.service;

import ${projectConfig.packageName}.entity.${entity.name};
import ${projectConfig.packageName}.repository.${entity.name}Repository;
import ${projectConfig.packageName}.dto.${entity.name}CreateDTO;
import ${projectConfig.packageName}.dto.${entity.name}UpdateDTO;
import ${projectConfig.packageName}.dto.${entity.name}ResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ${entity.name}Service {

    @Autowired
    private ${entity.name}Repository ${entity.name.toLowerCase()}Repository;

    public List<${entity.name}ResponseDTO> findAll() {
        return ${entity.name.toLowerCase()}Repository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<${entity.name}ResponseDTO> findById(Long id) {
        return ${entity.name.toLowerCase()}Repository.findById(id)
                .map(this::convertToResponseDTO);
    }

    public ${entity.name}ResponseDTO create(${entity.name}CreateDTO createDTO) {
        ${entity.name} entity = convertToEntity(createDTO);
        ${entity.name} savedEntity = ${entity.name.toLowerCase()}Repository.save(entity);
        return convertToResponseDTO(savedEntity);
    }

    public Optional<${entity.name}ResponseDTO> update(Long id, ${entity.name}UpdateDTO updateDTO) {
        return ${entity.name.toLowerCase()}Repository.findById(id)
                .map(existingEntity -> {
                    updateEntityFromDTO(existingEntity, updateDTO);
                    ${entity.name} updatedEntity = ${entity.name.toLowerCase()}Repository.save(existingEntity);
                    return convertToResponseDTO(updatedEntity);
                });
    }

    public boolean delete(Long id) {
        if (${entity.name.toLowerCase()}Repository.existsById(id)) {
            ${entity.name.toLowerCase()}Repository.deleteById(id);
            return true;
        }
        return false;
    }

    private ${entity.name}ResponseDTO convertToResponseDTO(${entity.name} entity) {
        ${entity.name}ResponseDTO dto = new ${entity.name}ResponseDTO();
        // Map entity fields to DTO
        return dto;
    }

    private ${entity.name} convertToEntity(${entity.name}CreateDTO createDTO) {
        ${entity.name} entity = new ${entity.name}();
        // Map DTO fields to entity
        return entity;
    }

    private void updateEntityFromDTO(${entity.name} entity, ${entity.name}UpdateDTO updateDTO) {
        // Update entity fields from DTO
    }
}`;
};

const generateControllerClass = (projectConfig, entity) => {
  return `package ${projectConfig.packageName}.controller;

import ${projectConfig.packageName}.service.${entity.name}Service;
import ${projectConfig.packageName}.dto.${entity.name}CreateDTO;
import ${projectConfig.packageName}.dto.${entity.name}UpdateDTO;
import ${projectConfig.packageName}.dto.${entity.name}ResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/${entity.name.toLowerCase()}s")
@CrossOrigin(origins = "*")
public class ${entity.name}Controller {

    @Autowired
    private ${entity.name}Service ${entity.name.toLowerCase()}Service;

    @GetMapping
    public ResponseEntity<List<${entity.name}ResponseDTO>> getAllEntities() {
        List<${entity.name}ResponseDTO> entities = ${entity.name.toLowerCase()}Service.findAll();
        return ResponseEntity.ok(entities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<${entity.name}ResponseDTO> getEntityById(@PathVariable Long id) {
        return ${entity.name.toLowerCase()}Service.findById(id)
                .map(entity -> ResponseEntity.ok(entity))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<${entity.name}ResponseDTO> createEntity(@Valid @RequestBody ${entity.name}CreateDTO createDTO) {
        ${entity.name}ResponseDTO createdEntity = ${entity.name.toLowerCase()}Service.create(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEntity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<${entity.name}ResponseDTO> updateEntity(
            @PathVariable Long id,
            @Valid @RequestBody ${entity.name}UpdateDTO updateDTO) {
        return ${entity.name.toLowerCase()}Service.update(id, updateDTO)
                .map(entity -> ResponseEntity.ok(entity))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntity(@PathVariable Long id) {
        if (${entity.name.toLowerCase()}Service.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}`;
};

const generateCreateDTO = (projectConfig, entity) => {
  const fields = entity.fields?.filter(field => 
    !field.annotations?.some(ann => ann.includes('@Id') || ann.includes('@CreationTimestamp') || ann.includes('@UpdateTimestamp'))
  ) || [];

  return `package ${projectConfig.packageName}.dto;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

public class ${entity.name}CreateDTO {

${fields.map(field => `    private ${field.type} ${field.name};`).join('\n')}

    // Constructors
    public ${entity.name}CreateDTO() {}

    // Getters and Setters
${fields.map(field => `    public ${field.type} get${capitalize(field.name)}() {
        return ${field.name};
    }

    public void set${capitalize(field.name)}(${field.type} ${field.name}) {
        this.${field.name} = ${field.name};
    }`).join('\n\n')}
}`;
};

const generateUpdateDTO = (projectConfig, entity) => {
  return generateCreateDTO(projectConfig, entity).replace(/CreateDTO/g, 'UpdateDTO');
};

const generateResponseDTO = (projectConfig, entity) => {
  const allFields = entity.fields || [];
  
  return `package ${projectConfig.packageName}.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

public class ${entity.name}ResponseDTO {

${allFields.map(field => `    private ${field.type} ${field.name};`).join('\n')}

    // Constructors
    public ${entity.name}ResponseDTO() {}

    // Getters and Setters
${allFields.map(field => `    public ${field.type} get${capitalize(field.name)}() {
        return ${field.name};
    }

    public void set${capitalize(field.name)}(${field.type} ${field.name}) {
        this.${field.name} = ${field.name};
    }`).join('\n\n')}
}`;
};

const generateTemplateApiFiles = (projectConfig, api, appTemplate) => {
  // Find the corresponding entity for this API
  console.log(`Looking for entity '${api.entity}' for API '${api.name}'`);
  console.log('Available entities:', appTemplate.entities?.map(e => e.name) || []);
  
  const entity = appTemplate.entities?.find(e => e.name === api.entity);
  if (entity) {
    console.log(`Found entity '${entity.name}', generating files...`);
    return generateCompleteEntityFiles(projectConfig, entity, appTemplate.enums);
  } else {
    console.log(`Entity '${api.entity}' not found for API '${api.name}'`);
    return {};
  }
};

const generateTemplateReadme = (projectConfig, templateData, appTemplate) => {
  return `# ${projectConfig.projectName}

${projectConfig.description || `A ${templateData.name} built with Spring Boot`}

## 📋 Template Information

**Based on**: ${templateData.name}  
**Complexity**: ${templateData.complexity}  
**Entities**: ${appTemplate.entities?.length || 0}  
**APIs**: ${appTemplate.apis?.length || 0}  

## ✨ Features

${templateData.features?.map(feature => `- ✅ ${feature}`).join('\n') || ''}

## 🗄️ Database Entities

${appTemplate.entities?.map(entity => `### ${entity.name}
- **Fields**: ${entity.fields?.length || 0}
- **Relationships**: ${entity.relationships?.length || 0}
- **Purpose**: Core entity for ${entity.name.toLowerCase()} management
`).join('\n') || ''}

## 🚀 API Endpoints

${appTemplate.apis?.map(api => `### ${api.name}
**Purpose**: ${api.purpose}

**Available Endpoints**:
${api.endpoints?.map(endpoint => `- \`${endpoint}\``).join('\n') || ''}
`).join('\n') || ''}

## 🛠️ Getting Started

### Prerequisites

- ☕ **Java ${projectConfig.javaVersion}** or higher
- 📦 **Maven 3.6+** or **Gradle 6+**
- 🗄️ **Database** (see configuration below)
- 🔧 **IDE** (IntelliJ IDEA, Eclipse, VS Code)

### 📥 Installation & Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repository-url>
   cd ${projectConfig.artifactId}
   \`\`\`

2. **Database Setup** (Choose your database)

   #### 🐬 MySQL Setup
   \`\`\`bash
   # Install MySQL (if not already installed)
   # Create database
   mysql -u root -p
   CREATE DATABASE ${projectConfig.artifactId.replace(/-/g, '_')};
   CREATE USER '${projectConfig.artifactId}'@'localhost' IDENTIFIED BY 'password123';
   GRANT ALL PRIVILEGES ON ${projectConfig.artifactId.replace(/-/g, '_')}.* TO '${projectConfig.artifactId}'@'localhost';
   FLUSH PRIVILEGES;
   \`\`\`

   #### 🐘 PostgreSQL Setup
   \`\`\`bash
   # Install PostgreSQL (if not already installed)
   # Create database and user
   sudo -u postgres psql
   CREATE DATABASE ${projectConfig.artifactId.replace(/-/g, '_')};
   CREATE USER ${projectConfig.artifactId} WITH ENCRYPTED PASSWORD 'password123';
   GRANT ALL PRIVILEGES ON DATABASE ${projectConfig.artifactId.replace(/-/g, '_')} TO ${projectConfig.artifactId};
   \\q
   \`\`\`

   #### 🍃 MongoDB Setup
   \`\`\`bash
   # Install MongoDB (if not already installed)
   # Start MongoDB service
   sudo systemctl start mongod
   
   # Create database and user
   mongo
   use ${projectConfig.artifactId.replace(/-/g, '_')}
   db.createUser({
     user: "admin",
     pwd: "password123",
     roles: ["readWrite", "dbAdmin"]
   })
   \`\`\`

   #### ⚡ H2 Database (No setup required)
   H2 is embedded and will create the database automatically.
   Access H2 Console: http://localhost:8080/h2-console

3. **Configure Database Connection**
   
   Edit \`src/main/resources/application.properties\`:
   
   \`\`\`properties
   # Update these values according to your database setup:
   spring.datasource.url=jdbc:mysql://localhost:3306/YOUR_DATABASE_NAME
   spring.datasource.username=YOUR_USERNAME
   spring.datasource.password=YOUR_PASSWORD
   
   # For production, consider using environment variables:
   # spring.datasource.url=\${DB_URL:jdbc:mysql://localhost:3306/${projectConfig.artifactId.replace(/-/g, '_')}}
   # spring.datasource.username=\${DB_USERNAME:root}
   # spring.datasource.password=\${DB_PASSWORD:password123}
   \`\`\`

4. **Install Dependencies & Run**
   \`\`\`bash
   # Using Maven
   mvn clean install
   mvn spring-boot:run
   
   # OR using Gradle
   ./gradlew build
   ./gradlew bootRun
   \`\`\`

5. **Access the Application**
   - 🌐 **Application**: http://localhost:8080
   - 📚 **API Documentation**: http://localhost:8080/swagger-ui.html (if Swagger is configured)
   - 🗄️ **H2 Console** (if using H2): http://localhost:8080/h2-console

### 🔐 Default Security Configuration

- **Username**: \`admin\`
- **Password**: \`admin123\`
- **Role**: \`ADMIN\`

⚠️ **Important**: Change these credentials before deploying to production!

## 📁 Project Structure

\`\`\`
src/main/java/${projectConfig.packageName}/
├── 📱 controller/          # REST API controllers
├── 🏢 service/            # Business logic layer  
├── 🗄️ repository/         # Data access layer
├── 📊 entity/             # JPA entities
├── 📦 dto/               # Data transfer objects
├── 🔧 config/            # Configuration classes
├── 📋 enums/             # Enum definitions
└── 🛡️ security/          # Security configurations

src/main/resources/
├── 📝 application.properties    # Application configuration
├── 🗄️ data.sql                # Sample data (if any)
└── 📋 schema.sql              # Database schema (if any)
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run all tests
mvn test

# Run with coverage
mvn test jacoco:report

# Run integration tests
mvn verify
\`\`\`

## 🚀 Deployment

### 📦 Building for Production

\`\`\`bash
# Create JAR file
mvn clean package -Pprod

# The JAR file will be created in target/ directory
java -jar target/${projectConfig.artifactId}-0.0.1-SNAPSHOT.jar
\`\`\`

### 🐳 Docker Deployment

\`\`\`dockerfile
# Dockerfile
FROM openjdk:${projectConfig.javaVersion}-jre-slim
COPY target/${projectConfig.artifactId}-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app.jar"]
\`\`\`

\`\`\`bash
# Build and run with Docker
docker build -t ${projectConfig.artifactId} .
docker run -p 8080:8080 ${projectConfig.artifactId}
\`\`\`

## 🔧 Configuration

### Environment Variables

For production deployment, use environment variables:

\`\`\`bash
export DB_URL="jdbc:mysql://your-db-host:3306/your-db-name"
export DB_USERNAME="your-username"
export DB_PASSWORD="your-password"
export JWT_SECRET="your-jwt-secret-key"
export SERVER_PORT="8080"
\`\`\`

### Application Profiles

- \`application.properties\` - Default configuration
- \`application-dev.properties\` - Development environment
- \`application-prod.properties\` - Production environment

Run with specific profile:
\`\`\`bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
\`\`\`

## 🔍 Monitoring & Health Checks

- **Health Check**: http://localhost:8080/actuator/health
- **Metrics**: http://localhost:8080/actuator/metrics
- **Info**: http://localhost:8080/actuator/info

## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. 💾 Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. 📤 Push to the branch (\`git push origin feature/amazing-feature\`)
5. 🔄 Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify database is running
   - Check connection credentials in \`application.properties\`
   - Ensure database exists

2. **Port 8080 Already in Use**
   - Change port in \`application.properties\`: \`server.port=8081\`
   - Or kill the process using port 8080

3. **Maven/Gradle Build Fails**
   - Ensure Java ${projectConfig.javaVersion} is installed: \`java -version\`
   - Clear cache: \`mvn clean\` or \`./gradlew clean\`

4. **H2 Console Not Accessible**
   - Ensure \`spring.h2.console.enabled=true\` in properties
   - Check URL: http://localhost:8080/h2-console
   - Use JDBC URL: \`jdbc:h2:mem:testdb\`

## 📞 Support

If you encounter any issues or have questions:
- 📧 Create an issue in this repository
- 📖 Check the [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- 🔍 Search [Stack Overflow](https://stackoverflow.com/questions/tagged/spring-boot)

---

**Happy Coding! 🎉**
`;
};

// Security Configuration Functions
function generateSecurityConfig(projectConfig) {
  return `package ${projectConfig.packageName}.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import ${projectConfig.packageName}.security.JwtAuthenticationEntryPoint;
import ${projectConfig.packageName}.security.JwtAuthenticationFilter;
import ${projectConfig.packageName}.security.CustomOAuth2UserService;
import ${projectConfig.packageName}.security.OAuth2AuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint unauthorizedHandler;

    @Autowired
    private CustomOAuth2UserService customOAuth2UserService;

    @Autowired
    private OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
                .exceptionHandling().authenticationEntryPoint(unauthorizedHandler).and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/", "/error", "/favicon.ico", "/**/*.png", "/**/*.gif", 
                                       "/**/*.svg", "/**/*.jpg", "/**/*.html", "/**/*.css", "/**/*.js").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2AuthenticationSuccessHandler)
                );

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        // For H2 Console
        http.headers().frameOptions().disable();

        return http.build();
    }
}`;
}

function generateJwtConfig(projectConfig) {
  return `package ${projectConfig.packageName}.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.jwt")
public class JwtConfig {
    
    private String secret = "mySecretKey123456789012345678901234567890";
    private long expirationMs = 86400000; // 24 hours
    private long refreshExpirationMs = 604800000; // 7 days

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    public void setRefreshExpirationMs(long refreshExpirationMs) {
        this.refreshExpirationMs = refreshExpirationMs;
    }
}`;
}

function generateCorsConfig(projectConfig) {
  return `package ${projectConfig.packageName}.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Value("\${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Value("\${app.cors.allowed-methods}")
    private String[] allowedMethods;

    @Value("\${app.cors.allowed-headers}")
    private String allowedHeaders;

    @Value("\${app.cors.allow-credentials}")
    private boolean allowCredentials;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList(allowedMethods));
        configuration.setAllowedHeaders(Arrays.asList(allowedHeaders));
        configuration.setAllowCredentials(allowCredentials);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}`;
}

function generateJwtAuthenticationEntryPoint(projectConfig) {
  return `package ${projectConfig.packageName}.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationEntryPoint.class);

    @Override
    public void commence(HttpServletRequest httpServletRequest,
                         HttpServletResponse httpServletResponse,
                         AuthenticationException e) throws IOException, ServletException {
        logger.error("Responding with unauthorized error. Message - {}", e.getMessage());
        httpServletResponse.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                "Sorry, You're not authorized to access this resource.");
    }
}`;
}

function generateJwtAuthenticationFilter(projectConfig) {
  return `package ${projectConfig.packageName}.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                String username = tokenProvider.getUsernameFromJWT(jwt);

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}`;
}

function generateJwtTokenProvider(projectConfig) {
  return `package ${projectConfig.packageName}.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import ${projectConfig.packageName}.config.JwtConfig;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Autowired
    private JwtConfig jwtConfig;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtConfig.getSecret().getBytes());
    }

    public String generateToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateTokenFromUsername(userPrincipal.getUsername());
    }

    public String generateTokenFromUsername(String username) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtConfig.getExpirationMs());

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshToken(String username) {
        Date expiryDate = new Date(System.currentTimeMillis() + jwtConfig.getRefreshExpirationMs());

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(authToken);
            return true;
        } catch (SecurityException ex) {
            logger.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            logger.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }
        return false;
    }
}`;
}

function generateCustomOAuth2UserService(projectConfig) {
  return `package ${projectConfig.packageName}.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            // Throwing an instance of AuthenticationException will trigger the OAuth2AuthenticationFailureHandler
            throw new InternalAuthenticationServiceException(ex.getMessage(), ex.getCause());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
                oAuth2UserRequest.getClientRegistration().getRegistrationId(), 
                oAuth2User.getAttributes()
        );
        
        if(StringUtils.isEmpty(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        // Here you would typically save or update user in database
        // For now, we'll just return the OAuth2User
        return oAuth2User;
    }
}

class OAuth2AuthenticationProcessingException extends AuthenticationException {
    public OAuth2AuthenticationProcessingException(String msg) {
        super(msg);
    }
}

abstract class OAuth2UserInfo {
    protected Map<String, Object> attributes;

    public OAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public abstract String getId();
    public abstract String getName();
    public abstract String getEmail();
    public abstract String getImageUrl();
}

class GoogleOAuth2UserInfo extends OAuth2UserInfo {
    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return (String) attributes.get("sub");
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getImageUrl() {
        return (String) attributes.get("picture");
    }
}

class FacebookOAuth2UserInfo extends OAuth2UserInfo {
    public FacebookOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return (String) attributes.get("id");
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getImageUrl() {
        Map<String, Object> picture = (Map<String, Object>) attributes.get("picture");
        if(picture != null) {
            Map<String, Object> data = (Map<String, Object>) picture.get("data");
            if(data != null) {
                return (String) data.get("url");
            }
        }
        return null;
    }
}

class GithubOAuth2UserInfo extends OAuth2UserInfo {
    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        return ((Integer) attributes.get("id")).toString();
    }

    @Override
    public String getName() {
        return (String) attributes.get("name");
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getImageUrl() {
        return (String) attributes.get("avatar_url");
    }
}

class OAuth2UserInfoFactory {
    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if(registrationId.equalsIgnoreCase("google")) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("facebook")) {
            return new FacebookOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase("github")) {
            return new GithubOAuth2UserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationProcessingException("Sorry! Login with " + registrationId + " is not supported yet.");
        }
    }
}`;
}

function generateOAuth2AuthenticationSuccessHandler(projectConfig) {
  return `package ${projectConfig.packageName}.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, 
                                      Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, 
                                      Authentication authentication) {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        
        // Generate JWT token for OAuth2 user
        String token = tokenProvider.generateTokenFromUsername(email);
        
                 return UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/redirect")
                 .queryParam("token", token)
                 .build().toUriString();
         }
}`;
}

// User Entity and Security-related Functions
function generateUserEntity(projectConfig) {
  return `package ${projectConfig.packageName}.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.NaturalId;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 40)
    private String name;

    @NotBlank
    @Size(max = 15)
    private String username;

    @NaturalId
    @NotBlank
    @Size(max = 40)
    @Email
    private String email;

    @NotBlank
    @Size(max = 100)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private String providerId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    public User() {}

    public User(String name, String username, String email, String password) {
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public AuthProvider getProvider() { return provider; }
    public void setProvider(AuthProvider provider) { this.provider = provider; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
}

enum AuthProvider {
    local,
    facebook,
    google,
    github
}`;
}

function generateRoleEntity(projectConfig) {
  return `package ${projectConfig.packageName}.entity;

import org.hibernate.annotations.NaturalId;

import javax.persistence.*;

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @NaturalId
    @Column(length = 60)
    private RoleName name;

    public Role() {}

    public Role(RoleName name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RoleName getName() { return name; }
    public void setName(RoleName name) { this.name = name; }
}

enum RoleName {
    ROLE_USER,
    ROLE_ADMIN
}`;
}

function generateUserRepository(projectConfig) {
  return `package ${projectConfig.packageName}.repository;

import ${projectConfig.packageName}.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    Optional<User> findByUsername(String username);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}`;
}

function generateRoleRepository(projectConfig) {
  return `package ${projectConfig.packageName}.repository;

import ${projectConfig.packageName}.entity.Role;
import ${projectConfig.packageName}.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName roleName);
}`;
}

function generateUserService(projectConfig) {
  return `package ${projectConfig.packageName}.service;

import ${projectConfig.packageName}.entity.User;
import ${projectConfig.packageName}.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByUsernameOrEmail(String username, String email) {
        return userRepository.findByUsernameOrEmail(username, email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}`;
}

function generateCustomUserDetailsService(projectConfig) {
  return `package ${projectConfig.packageName}.service;

import ${projectConfig.packageName}.entity.User;
import ${projectConfig.packageName}.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found with username or email : " + usernameOrEmail)
                );

        return UserPrincipal.create(user);
    }

    @Transactional
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(
                () -> new UsernameNotFoundException("User not found with id : " + id)
        );

        return UserPrincipal.create(user);
    }
}`;
}

function generateAuthController(projectConfig) {
  return `package ${projectConfig.packageName}.controller;

import ${projectConfig.packageName}.dto.JwtAuthenticationResponse;
import ${projectConfig.packageName}.dto.LoginRequest;
import ${projectConfig.packageName}.dto.SignUpRequest;
import ${projectConfig.packageName}.entity.Role;
import ${projectConfig.packageName}.entity.RoleName;
import ${projectConfig.packageName}.entity.User;
import ${projectConfig.packageName}.repository.RoleRepository;
import ${projectConfig.packageName}.repository.UserRepository;
import ${projectConfig.packageName}.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtTokenProvider tokenProvider;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        if(userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest()
                    .body("Username is already taken!");
        }

        if(userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body("Email Address already in use!");
        }

        // Creating user's account
        User user = new User(signUpRequest.getName(), signUpRequest.getUsername(),
                signUpRequest.getEmail(), passwordEncoder.encode(signUpRequest.getPassword()));

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("User Role not set."));

        user.setRoles(Collections.singleton(userRole));

        User result = userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }
}`;
}

function generateLoginRequest(projectConfig) {
  return `package ${projectConfig.packageName}.dto;

import javax.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank
    private String usernameOrEmail;

    @NotBlank
    private String password;

    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}`;
}

function generateSignUpRequest(projectConfig) {
  return `package ${projectConfig.packageName}.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class SignUpRequest {
    @NotBlank
    @Size(min = 4, max = 40)
    private String name;

    @NotBlank
    @Size(min = 3, max = 15)
    private String username;

    @NotBlank
    @Size(max = 40)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 20)
    private String password;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}`;
}

function generateJwtAuthenticationResponse(projectConfig) {
  return `package ${projectConfig.packageName}.dto;

public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";

    public JwtAuthenticationResponse(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
}`;
}

function generateUserPrincipal(projectConfig) {
  return `package ${projectConfig.packageName}.security;

import ${projectConfig.packageName}.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;
import java.util.stream.Collectors;

public class UserPrincipal implements OAuth2User, UserDetails {
    private Long id;
    private String name;
    private String username;
    private String email;
    @JsonIgnore
    private String password;
    private Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes;

    public UserPrincipal(Long id, String name, String username, String email, String password, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream().map(role ->
                new SimpleGrantedAuthority(role.getName().name())
        ).collect(Collectors.toList());

        return new UserPrincipal(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities
        );
    }

    public static UserPrincipal create(User user, Map<String, Object> attributes) {
        UserPrincipal userPrincipal = UserPrincipal.create(user);
        userPrincipal.setAttributes(attributes);
        return userPrincipal;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return username; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public Map<String, Object> getAttributes() { return attributes; }

    public void setAttributes(Map<String, Object> attributes) { this.attributes = attributes; }

    @Override
    public String getName() { return String.valueOf(id); }
}`;
} 