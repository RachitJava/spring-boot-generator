import React, { useState } from 'react';
import { 
  Copy, 
  Database, 
  Settings, 
  ArrowLeft, 
  ArrowRight, 
  Video, 
  Users, 
  Camera, 
  BookOpen, 
  Car, 
  TrendingUp, 
  Palette, 
  UtensilsCrossed,
  Code,
  DollarSign,
  Server,
  HardDrive,
  Cloud,
  Zap,
  Shield,
  CheckCircle,
  Briefcase,
  GitBranch,
  Play,
  Share2,
  Heart,
  GraduationCap,
  Navigation,
  BarChart3,
  Brush,
  ChefHat,
  Wallet,
  ShoppingBag,
  Music,
  MessageCircle,
  Globe,
  Smartphone
} from 'lucide-react';

const APP_TEMPLATES = {
  'freelancer': {
    name: 'Freelancer Clone',
    icon: Briefcase,
    description: 'Complete freelancing platform with project management, bidding, and payment systems',
    color: 'bg-emerald-500 text-white border-emerald-500',
    features: ['User Management', 'Project Posting', 'Bidding System', 'Payment Integration', 'Rating & Reviews', 'Messaging'],
    entities: ['User', 'Project', 'Bid', 'Payment', 'Review', 'Message', 'Category', 'Skill'],
    complexity: 'Advanced'
  },
  'github': {
    name: 'GitHub Clone',
    icon: GitBranch,
    description: 'Code repository management with version control, issues, and collaboration features',
    color: 'bg-gray-800 text-white border-gray-800',
    features: ['Repository Management', 'Issue Tracking', 'Pull Requests', 'User Collaboration', 'Organizations'],
    entities: ['User', 'Repository', 'Issue', 'PullRequest', 'Commit', 'Organization', 'Team'],
    complexity: 'Advanced'
  },
  'youtube': {
    name: 'YouTube Clone',
    icon: Play,
    description: 'Video sharing platform with upload, streaming, comments, and subscription features',
    color: 'bg-red-500 text-white border-red-500',
    features: ['Video Upload', 'Streaming', 'Comments', 'Subscriptions', 'Playlists', 'Analytics'],
    entities: ['User', 'Video', 'Comment', 'Subscription', 'Playlist', 'Category', 'Analytics'],
    complexity: 'Advanced'
  },
  'facebook': {
    name: 'Facebook Clone',
    icon: Share2,
    description: 'Social media platform with posts, friends, messaging, and news feed',
    color: 'bg-blue-600 text-white border-blue-600',
    features: ['Social Posts', 'Friend System', 'News Feed', 'Messaging', 'Groups', 'Events'],
    entities: ['User', 'Post', 'Friendship', 'Message', 'Group', 'Event', 'Like', 'Comment'],
    complexity: 'Advanced'
  },
  'instagram': {
    name: 'Instagram Clone',
    icon: Heart,
    description: 'Photo sharing app with stories, followers, and media management',
    color: 'bg-pink-500 text-white border-pink-500',
    features: ['Photo/Video Upload', 'Stories', 'Following System', 'Likes & Comments', 'Direct Messages'],
    entities: ['User', 'Post', 'Story', 'Follow', 'Like', 'Comment', 'DirectMessage'],
    complexity: 'Intermediate'
  },
  'udemy': {
    name: 'Udemy Clone',
    icon: GraduationCap,
    description: 'Online learning platform with courses, videos, quizzes, and certifications',
    color: 'bg-purple-600 text-white border-purple-600',
    features: ['Course Management', 'Video Lessons', 'Quizzes', 'Certificates', 'Student Progress'],
    entities: ['User', 'Course', 'Lesson', 'Quiz', 'Certificate', 'Enrollment', 'Progress'],
    complexity: 'Intermediate'
  },
  'uber': {
    name: 'Uber Clone',
    icon: Navigation,
    description: 'Ride-sharing app with booking, tracking, payments, and driver management',
    color: 'bg-black text-white border-black',
    features: ['Ride Booking', 'Real-time Tracking', 'Payment Processing', 'Driver Management', 'Trip History'],
    entities: ['User', 'Driver', 'Ride', 'Payment', 'Vehicle', 'Location', 'Trip'],
    complexity: 'Advanced'
  },
  'zerodha': {
    name: 'Zerodha Clone',
    icon: BarChart3,
    description: 'Stock trading platform with portfolio management, market data, and trading features',
    color: 'bg-orange-500 text-white border-orange-500',
    features: ['Stock Trading', 'Portfolio Management', 'Market Data', 'Watchlist', 'Trading History'],
    entities: ['User', 'Stock', 'Portfolio', 'Trade', 'Watchlist', 'MarketData', 'Order'],
    complexity: 'Advanced'
  },
  'canva': {
    name: 'Canva Clone',
    icon: Brush,
    description: 'Design platform with templates, image editing, and collaboration tools',
    color: 'bg-cyan-500 text-white border-cyan-500',
    features: ['Design Templates', 'Image Editing', 'Collaboration', 'Asset Library', 'Export Options'],
    entities: ['User', 'Design', 'Template', 'Asset', 'Project', 'Team', 'Export'],
    complexity: 'Intermediate'
  },
  'zomato': {
    name: 'Zomato Clone',
    icon: ChefHat,
    description: 'Food delivery app with restaurant listings, orders, and delivery tracking',
    color: 'bg-red-600 text-white border-red-600',
    features: ['Restaurant Listings', 'Food Ordering', 'Delivery Tracking', 'Reviews', 'Payment Integration'],
    entities: ['User', 'Restaurant', 'MenuItem', 'Order', 'Delivery', 'Review', 'Payment'],
    complexity: 'Intermediate'
  }
};

const DATABASE_CONFIGS = {
  'mysql': {
    name: 'MySQL',
    description: 'Popular open-source relational database',
    icon: Database,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    features: ['ACID Compliance', 'High Performance', 'Scalable', 'Open Source'],
    useCase: 'Web Applications',
    dependencies: ['mysql-connector-java'],
    properties: {
      'spring.datasource.driver-class-name': 'com.mysql.cj.jdbc.Driver',
      'spring.datasource.url': 'jdbc:mysql://localhost:3306/{dbname}?useSSL=false&serverTimezone=UTC',
      'spring.datasource.username': 'root',
      'spring.datasource.password': 'password123',
      'spring.jpa.database-platform': 'org.hibernate.dialect.MySQL8Dialect',
      'spring.jpa.hibernate.ddl-auto': 'update',
      'spring.jpa.show-sql': 'true',
      'spring.jpa.properties.hibernate.format_sql': 'true'
    }
  },
  'postgresql': {
    name: 'PostgreSQL',
    description: 'Advanced open-source relational database',
    icon: Server,
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    features: ['Advanced SQL', 'JSON Support', 'Extensions', 'ACID Compliance'],
    useCase: 'Complex Applications',
    dependencies: ['postgresql'],
    properties: {
      'spring.datasource.driver-class-name': 'org.postgresql.Driver',
      'spring.datasource.url': 'jdbc:postgresql://localhost:5432/{dbname}',
      'spring.datasource.username': 'postgres',
      'spring.datasource.password': 'password123',
      'spring.jpa.database-platform': 'org.hibernate.dialect.PostgreSQLDialect',
      'spring.jpa.hibernate.ddl-auto': 'update',
      'spring.jpa.show-sql': 'true',
      'spring.jpa.properties.hibernate.format_sql': 'true',
      'spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation': 'true'
    }
  },
  'oracle': {
    name: 'Oracle Database',
    description: 'Enterprise-grade relational database',
    icon: Shield,
    color: 'from-red-500 to-orange-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    features: ['Enterprise Features', 'High Availability', 'Security', 'Performance'],
    useCase: 'Enterprise Applications',
    dependencies: ['ojdbc8'],
    properties: {
      'spring.datasource.driver-class-name': 'oracle.jdbc.OracleDriver',
      'spring.datasource.url': 'jdbc:oracle:thin:@localhost:1521:XE',
      'spring.datasource.username': 'system',
      'spring.datasource.password': 'password123',
      'spring.jpa.database-platform': 'org.hibernate.dialect.Oracle12cDialect',
      'spring.jpa.hibernate.ddl-auto': 'update',
      'spring.jpa.show-sql': 'true',
      'spring.jpa.properties.hibernate.format_sql': 'true'
    }
  },
  'h2': {
    name: 'H2 Database',
    description: 'Lightweight in-memory database for development',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    features: ['In-Memory', 'Fast Setup', 'Web Console', 'Development'],
    useCase: 'Development & Testing',
    dependencies: ['h2'],
    properties: {
      'spring.datasource.driver-class-name': 'org.h2.Driver',
      'spring.datasource.url': 'jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE',
      'spring.datasource.username': 'sa',
      'spring.datasource.password': '',
      'spring.jpa.database-platform': 'org.hibernate.dialect.H2Dialect',
      'spring.jpa.hibernate.ddl-auto': 'create-drop',
      'spring.jpa.show-sql': 'true',
      'spring.h2.console.enabled': 'true',
      'spring.h2.console.path': '/h2-console'
    }
  },
  'mongodb': {
    name: 'MongoDB',
    description: 'NoSQL document database',
    icon: HardDrive,
    color: 'from-green-500 to-teal-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    features: ['Document Store', 'Flexible Schema', 'Horizontal Scaling', 'JSON-like'],
    useCase: 'Modern Applications',
    dependencies: ['spring-boot-starter-data-mongodb'],
    properties: {
      'spring.data.mongodb.uri': 'mongodb://admin:password123@localhost:27017/{dbname}?authSource=admin',
      'spring.data.mongodb.database': '{dbname}',
      'spring.data.mongodb.host': 'localhost',
      'spring.data.mongodb.port': '27017',
      'spring.data.mongodb.username': 'admin',
      'spring.data.mongodb.password': 'password123',
      'spring.data.mongodb.authentication-database': 'admin'
    }
  },
  'sqlite': {
    name: 'SQLite',
    description: 'Lightweight file-based SQL database',
    icon: Cloud,
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-500',
    features: ['File-based', 'Zero Config', 'Lightweight', 'Embedded'],
    useCase: 'Small Applications',
    dependencies: ['sqlite-jdbc'],
    properties: {
      'spring.datasource.driver-class-name': 'org.sqlite.JDBC',
      'spring.datasource.url': 'jdbc:sqlite:./{dbname}.db',
      'spring.datasource.username': '',
      'spring.datasource.password': '',
      'spring.jpa.database-platform': 'org.hibernate.community.dialect.SQLiteDialect',
      'spring.jpa.hibernate.ddl-auto': 'update',
      'spring.jpa.show-sql': 'true',
      'spring.jpa.properties.hibernate.format_sql': 'true'
    }
  }
};

const AppCloner = ({ onSelectTemplate, onNext, onBack, projectConfig }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDatabase, setSelectedDatabase] = useState('h2');
  const [showDetails, setShowDetails] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTemplateSelect = (templateKey) => {
    setSelectedTemplate(templateKey);
    setShowDetails(true);
    // Clear any error message when template is selected
    setErrorMessage('');
  };

  const handleConfirmSelection = async () => {
    // Clear any previous error messages
    setErrorMessage('');
    
    // Validate template selection
    if (!selectedTemplate) {
      setErrorMessage('Please select an application template before generating the project.');
      return;
    }
    
    if (selectedTemplate && selectedDatabase) {
      setIsGenerating(true);
      
      // Add a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const templateSelection = {
          template: selectedTemplate,
          templateData: APP_TEMPLATES[selectedTemplate],
          database: selectedDatabase,
          databaseConfig: DATABASE_CONFIGS[selectedDatabase]
        };
        
        console.log('AppCloner: Sending template selection:', templateSelection);
        onSelectTemplate(templateSelection);
        
        // Template selection and generation is handled by parent component
        // No need to call onNext() here
      } catch (error) {
        console.error('Error generating template:', error);
        setIsGenerating(false);
      }
    }
  };

  const canProceed = selectedTemplate && selectedDatabase;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2">
            <Copy className="text-purple-600" size={20} />
            <h2 className="text-xl sm:text-2xl font-bold">Clone Existing Apps</h2>
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            Project: <span className="font-semibold">{projectConfig.projectName}</span>
          </div>
        </div>

        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Choose from popular application templates to generate a complete Spring Boot project with all necessary APIs, 
          entities, and business logic. Perfect for rapid prototyping and learning.
        </p>

        {!showDetails ? (
          <>
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center">🚀 Choose Your Application Template</h3>
            
            {/* Popular Templates Section */}
            <div className="mb-6 sm:mb-8">
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">🔥 Most Popular</h4>
              <div className="sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
                <div className="flex overflow-x-scroll gap-3 pb-4 scrollbar-hide sm:contents sm:overflow-visible sm:pb-0">
                {Object.entries(APP_TEMPLATES).slice(0, 5).map(([key, template]) => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={key}
                      className={`group relative p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl flex-shrink-0 w-44 sm:w-auto ${
                        selectedTemplate === key 
                          ? `${template.color} shadow-lg transform scale-105 ring-2 sm:ring-4 ring-green-200` 
                          : `${template.color} opacity-90 hover:opacity-100 shadow-md hover:shadow-lg`
                      }`}
                      onClick={() => handleTemplateSelect(key)}
                    >
                      {/* Selection Indicator */}
                      {selectedTemplate === key && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="flex justify-center mb-2 sm:mb-3">
                          <div className="p-2 sm:p-3 rounded-full bg-white bg-opacity-20 group-hover:bg-opacity-30 transition-all">
                            <Icon size={20} className="text-white" />
                          </div>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm mb-1 sm:mb-2 text-white">
                          {template.name}
                        </h4>
                        <p className="text-xs mb-2 sm:mb-3 line-clamp-2 text-white text-opacity-90 hidden sm:block">
                          {template.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-center text-xs gap-1 sm:gap-0">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium text-xs ${
                            selectedTemplate === key 
                              ? 'bg-white bg-opacity-30 text-white ring-1 sm:ring-2 ring-white ring-opacity-50' 
                              : 'bg-white bg-opacity-20 text-white'
                          }`}>
                            {template.complexity}
                          </span>
                          <span className="font-medium text-white text-opacity-90 text-xs">
                            {template.entities?.length || 0} APIs
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>

            {/* All Templates Section */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-700">📱 All Application Templates</h4>
              <div className="sm:grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-4">
                <div className="flex overflow-x-scroll gap-3 pb-4 scrollbar-hide sm:contents sm:overflow-visible sm:pb-0">
                {Object.entries(APP_TEMPLATES).map(([key, template]) => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={key}
                      className={`group relative p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl flex-shrink-0 w-44 sm:w-auto ${
                        selectedTemplate === key 
                          ? `${template.color} shadow-lg transform scale-105 ring-2 sm:ring-4 ring-green-200` 
                          : `${template.color} opacity-90 hover:opacity-100 shadow-md hover:shadow-lg`
                      }`}
                      onClick={() => handleTemplateSelect(key)}
                    >
                      {/* Selection Indicator */}
                      {selectedTemplate === key && (
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="flex justify-center mb-2 sm:mb-3">
                          <div className="p-2 sm:p-3 rounded-full bg-white bg-opacity-20 group-hover:bg-opacity-30 transition-all">
                            <Icon size={20} className="text-white" />
                          </div>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm mb-1 sm:mb-2 text-white">
                          {template.name}
                        </h4>
                        <p className="text-xs mb-2 sm:mb-3 line-clamp-2 text-white text-opacity-90 hidden sm:block">
                          {template.description}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-center text-xs gap-1 sm:gap-0">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium text-xs ${
                            selectedTemplate === key 
                              ? 'bg-white bg-opacity-30 text-white ring-1 sm:ring-2 ring-white ring-opacity-50' 
                              : 'bg-white bg-opacity-20 text-white'
                          }`}>
                            {template.complexity}
                          </span>
                          <span className="font-medium text-white text-opacity-90 text-xs">
                            {template.entities?.length || 0} APIs
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Selected Template Details */}
            <div className="border-2 border-purple-200 rounded-lg p-4 sm:p-6 bg-purple-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  {React.createElement(APP_TEMPLATES[selectedTemplate].icon, { size: 20 })}
                  <h3 className="text-lg sm:text-xl font-semibold">{APP_TEMPLATES[selectedTemplate].name}</h3>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn btn-secondary text-xs sm:text-sm"
                >
                  Change Template
                </button>
              </div>
              
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">{APP_TEMPLATES[selectedTemplate].description}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Key Features</h4>
                  <ul className="text-xs sm:text-sm space-y-1">
                    {APP_TEMPLATES[selectedTemplate]?.features?.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Entities & Models</h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {APP_TEMPLATES[selectedTemplate]?.entities?.map((entity, index) => (
                      <span key={index} className="px-2 py-1 bg-white rounded text-xs sm:text-sm border">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Database Configuration */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Database className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Database Configuration</h3>
                  <p className="text-gray-600 text-xs sm:text-sm">Choose your preferred database technology</p>
                </div>
              </div>
              
              {/* Database Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {Object.entries(DATABASE_CONFIGS).map(([key, db]) => {
                  const Icon = db.icon;
                  const isSelected = selectedDatabase === key;
                  
                  return (
                    <div
                      key={key}
                      className={`group relative p-4 sm:p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        isSelected 
                          ? `${db.borderColor} ${db.bgColor} shadow-md` 
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDatabase(key)}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                          <CheckCircle className="text-green-500" size={16} />
                        </div>
                      )}
                      
                      {/* Database Icon */}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 sm:mb-4 ${
                        isSelected 
                          ? `bg-gradient-to-r ${db.color}` 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      } transition-all duration-300`}>
                        <Icon className={isSelected ? 'text-white' : 'text-gray-600'} size={20} />
                      </div>
                      
                      {/* Database Info */}
                      <div className="mb-3 sm:mb-4">
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{db.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">{db.description}</p>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                          isSelected ? 'bg-white bg-opacity-70' : 'bg-gray-100'
                        }`}>
                          {db.useCase}
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="space-y-1 hidden sm:block">
                        {db.features?.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              isSelected ? 'bg-current' : 'bg-gray-400'
                            }`}></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                        {db.features?.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{db.features?.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Selected Database Details */}
              {selectedDatabase && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Configuration Preview - Hidden on mobile */}
                    <div className="hidden lg:block bg-gray-50 rounded-xl p-5">
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Settings size={16} />
                        Spring Boot Configuration
                      </h5>
                      <div className="space-y-2">
                        {Object.entries(DATABASE_CONFIGS[selectedDatabase].properties).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <div className="font-mono text-blue-600">{key}</div>
                            <div className="font-mono text-green-600 ml-4 break-all">
                              {value.replace('{dbname}', projectConfig.artifactId || 'myapp')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Database Features & Info */}
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Key Features</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {DATABASE_CONFIGS[selectedDatabase]?.features?.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="text-green-500" size={14} />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Dependencies</h5>
                        <div className="flex flex-wrap gap-2">
                          {DATABASE_CONFIGS[selectedDatabase]?.dependencies?.map((dep, index) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 font-medium">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
        <button onClick={onBack} className="btn btn-secondary text-sm sm:text-base">
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Back to Project Setup</span>
          <span className="sm:hidden">Back</span>
        </button>
        <button 
          onClick={handleConfirmSelection} 
          className="btn text-sm sm:text-base"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
              <span className="hidden sm:inline">Generating Project...</span>
              <span className="sm:hidden">Generating...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Generate Complete Project</span>
              <span className="sm:hidden">Generate Project</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AppCloner; 