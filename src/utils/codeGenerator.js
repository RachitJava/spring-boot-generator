// Spring Boot Project Code Generator with Intelligent API Integration

export const generateSpringBootProject = (projectConfig, apis) => {
  const packagePath = projectConfig.packageName.replace(/\./g, '/');
  const className = toPascalCase(projectConfig.artifactId);
  
  // Analyze APIs for smart integration
  const apiAnalysis = analyzeApis(apis);
  
  const files = {
    'pom.xml': generatePomXml(projectConfig, apiAnalysis),
    'src/main/resources/application.properties': generateApplicationProperties(projectConfig, apiAnalysis),
    [`src/main/java/${packagePath}/${className}Application.java`]: generateMainApplication(projectConfig),
    [`src/main/java/${packagePath}/config/WebConfig.java`]: generateWebConfig(projectConfig),
    'README.md': generateReadme(projectConfig, apis)
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
  const dependencies = [
    'spring-boot-starter-web',
    'spring-boot-starter-validation'
  ];

  if (analysis.needsDatabase) {
    dependencies.push('spring-boot-starter-data-jpa', 'h2');
  }
  
  if (analysis.needsSecurity) {
    dependencies.push('spring-boot-starter-security');
  }
  
  if (analysis.needsFileUpload) {
    dependencies.push('commons-fileupload:commons-fileupload:1.4');
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.5</version>
        <relativePath/>
    </parent>
    <groupId>${projectConfig.groupId}</groupId>
    <artifactId>${projectConfig.artifactId}</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>${projectConfig.projectName}</name>
    <description>${projectConfig.description || 'Generated Spring Boot Application'}</description>
    <properties>
        <java.version>${projectConfig.javaVersion}</java.version>
    </properties>
    <dependencies>
${dependencies.map(dep => {
  if (dep.includes(':')) {
    const [groupId, artifactId, version] = dep.split(':');
    return `        <dependency>
            <groupId>${groupId}</groupId>
            <artifactId>${artifactId}</artifactId>
            <version>${version}</version>
        </dependency>`;
  } else {
    return `        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>${dep}</artifactId>
        </dependency>`;
  }
}).join('\n')}
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
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

const generateApplicationProperties = (projectConfig, analysis) => {
  let properties = `# Application Configuration
server.port=8080
spring.application.name=${projectConfig.artifactId}

# Logging
logging.level.${projectConfig.packageName}=DEBUG
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

const generateDatabaseFiles = (projectConfig, analysis) => {
  const files = {};

  files[`src/main/resources/data.sql`] = `-- Sample data for development
-- This file will be executed on application startup

-- Add your sample data here
-- INSERT INTO users (username, email, password, first_name, last_name, created_at, updated_at) 
-- VALUES ('admin', 'admin@example.com', '$2a$10$...', 'Admin', 'User', NOW(), NOW());
`;

  return files;
};

const generateReadme = (projectConfig, apis) => {
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

### Running the Application

1. Clone this repository
2. Navigate to the project directory
3. Run the application:
   \`\`\`bash
   mvn spring-boot:run
   \`\`\`

The application will start on \`http://localhost:8080\`

### API Documentation

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