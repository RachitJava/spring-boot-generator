# Spring Boot Project Generator

A React-based intelligent Spring Boot project generator that creates complete, production-ready Spring Boot applications based on API purposes and requirements.

## 🚀 Features

- **Intelligent API Generation**: Select from predefined API purposes (User Management, Product Catalog, Order Management, etc.) and the system generates appropriate code
- **Smart Integration**: Automatically understands API relationships and generates integrated code that works seamlessly together
- **Purpose-Driven Development**: Instead of writing boilerplate code, describe what your API should do and let the generator handle the implementation
- **Complete Project Structure**: Generates Maven project with proper dependencies, configuration, and folder structure
- **No Database Required**: Uses H2 in-memory database for development, making it easy to get started
- **Download Ready**: Generates a complete ZIP file with your Spring Boot project ready to run

## 🎯 Supported API Types

### User Management
- Registration and authentication
- Profile management
- Role-based access control
- **Generated**: User entity, authentication endpoints, security configuration

### Product Catalog
- Product CRUD operations
- Category management
- Inventory tracking
- **Generated**: Product entity, catalog endpoints, validation

### Order Management
- Order creation and tracking
- Status management
- Customer integration
- **Generated**: Order entity, order processing endpoints, status workflows

### Content Management
- Article/blog management
- Publishing workflows
- Author management
- **Generated**: Content entity, publishing endpoints, metadata handling

### Notification System
- Multi-channel notifications
- Read/unread status
- User targeting
- **Generated**: Notification entity, delivery endpoints, status tracking

### File Management
- File upload and storage
- Metadata management
- Access control
- **Generated**: File entity, upload endpoints, storage configuration

## 🛠️ How It Works

### Step 1: Project Configuration
- Enter project name, group ID, package structure
- Select Java version (11, 17, or 21)
- Auto-generates Maven coordinates

### Step 2: API Builder
- Click "Add New API" to open the purpose-based builder
- Select the purpose that best matches your needs
- Customize endpoints, fields, and descriptions
- Add multiple APIs - the system will integrate them intelligently

### Step 3: Code Generation & Download
- Review the generated project structure
- Preview individual files (POM, entities, controllers, services)
- Download complete ZIP file with your Spring Boot project

## 🏗️ Generated Project Structure

```
your-project/
├── pom.xml                          # Maven configuration with smart dependencies
├── src/main/java/com/example/app/
│   ├── Application.java             # Main Spring Boot application
│   ├── config/
│   │   ├── WebConfig.java          # CORS and web configuration
│   │   └── SecurityConfig.java     # Security configuration (if needed)
│   ├── controller/                 # REST Controllers
│   │   ├── UserController.java
│   │   └── ProductController.java
│   ├── service/                    # Business logic layer
│   │   ├── UserService.java
│   │   └── ProductService.java
│   ├── repository/                 # Data access layer
│   │   ├── UserRepository.java
│   │   └── ProductRepository.java
│   ├── entity/                     # JPA Entities
│   │   ├── User.java
│   │   └── Product.java
│   └── dto/                        # Data Transfer Objects
│       ├── UserCreateRequest.java
│       ├── UserResponse.java
│       ├── ProductCreateRequest.java
│       └── ProductResponse.java
├── src/main/resources/
│   ├── application.properties      # Application configuration
│   └── data.sql                   # Sample data (if applicable)
└── README.md                      # Generated project documentation
```

## 🧠 Smart Features

### Intelligent Integration
- **User Management + Order Management**: Automatically creates user-order relationships
- **Product Catalog + Order Management**: Links products to order items
- **Cross-API Validation**: Ensures data consistency across related APIs

### Smart Dependencies
- Automatically includes Spring Security for user management APIs
- Adds file upload dependencies for file management APIs
- Includes validation dependencies for all APIs
- Uses H2 database for development, easily switchable to production databases

### Code Quality
- **Validation**: All endpoints include proper validation annotations
- **Error Handling**: Consistent error responses across all APIs
- **CORS Configuration**: Ready for frontend integration
- **Documentation**: Generated README with API documentation

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd springboot-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Usage

1. **Configure your project** - Enter project details in Step 1
2. **Add APIs** - Use the purpose-driven API builder in Step 2
3. **Generate & Download** - Review and download your complete Spring Boot project in Step 3
4. **Run your project**:
   ```bash
   cd your-downloaded-project
   ./mvnw spring-boot:run
   ```

## 🔧 Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Lucide React**: Beautiful icons
- **JSZip**: Client-side ZIP file generation
- **FileSaver.js**: File download functionality

### Generated Backend
- **Spring Boot 3.1.5**: Latest stable version
- **Spring Web**: REST API development
- **Spring Data JPA**: Database abstraction
- **Spring Security**: Authentication and authorization (when needed)
- **H2 Database**: In-memory database for development
- **Bean Validation**: Input validation

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with gradient backgrounds
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Progress Tracking**: Clear visual progress through the generation steps
- **File Preview**: Syntax-highlighted code preview with file tree navigation
- **Smart Forms**: Auto-completion and validation for project configuration
- **Interactive API Builder**: Visual purpose selection with customizable options

## 🔄 Example Workflow

Let's say you want to build an e-commerce backend:

1. **Project Setup**: Name it "E-commerce API", set package as `com.example.ecommerce`
2. **Add User Management API**: For customer registration and authentication
3. **Add Product Catalog API**: For managing products and categories
4. **Add Order Management API**: For handling customer orders
5. **Generate**: The system automatically:
   - Links users to orders
   - Links products to order items
   - Adds security configuration
   - Creates proper database relationships
   - Generates integrated endpoints

Result: A complete e-commerce backend with user auth, product management, and order processing!

## 📝 Generated API Examples

### User Management Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication  
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Product Catalog Endpoints
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/{id}` - Get product by ID
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- React team for the amazing frontend library
- All contributors who help make this project better

---

**Happy Coding! 🎉** 

Generate your next Spring Boot project in minutes, not hours! 