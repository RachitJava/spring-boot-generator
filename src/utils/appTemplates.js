// Comprehensive app templates with complete project structures

export const generateAppTemplate = (templateKey, projectConfig, databaseConfig) => {
  console.log(`=== GENERATING APP TEMPLATE: ${templateKey} ===`);
  
  const templates = {
    freelancer: generateFreelancerTemplate(projectConfig, databaseConfig),
    github: generateGithubTemplate(projectConfig, databaseConfig),
    youtube: generateYoutubeTemplate(projectConfig, databaseConfig),
    facebook: generateFacebookTemplate(projectConfig, databaseConfig),
    instagram: generateInstagramTemplate(projectConfig, databaseConfig),
    udemy: generateUdemyTemplate(projectConfig, databaseConfig),
    uber: generateUberTemplate(projectConfig, databaseConfig),
    zerodha: generateZerodhaTemplate(projectConfig, databaseConfig),
    canva: generateCanvaTemplate(projectConfig, databaseConfig),
    zomato: generateZomatoTemplate(projectConfig, databaseConfig)
  };

  const selectedTemplate = templates[templateKey] || templates.freelancer;
  console.log(`Template '${templateKey}' loaded:`, {
    entityCount: selectedTemplate.entities?.length || 0,
    apiCount: selectedTemplate.apis?.length || 0,
    enumCount: Object.keys(selectedTemplate.enums || {}).length
  });
  
  return selectedTemplate;
};

const generateFreelancerTemplate = (projectConfig, databaseConfig) => {
  const packageName = projectConfig.packageName;
  const packagePath = packageName.replace(/\./g, '/');
  
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'password', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'firstName', type: 'String' },
          { name: 'lastName', type: 'String' },
          { name: 'profileImage', type: 'String' },
          { name: 'bio', type: 'String', annotations: ['@Column(length = 1000)'] },
          { name: 'hourlyRate', type: 'BigDecimal' },
          { name: 'rating', type: 'Double', annotations: ['@Column(columnDefinition = "DECIMAL(3,2)")'] },
          { name: 'totalEarnings', type: 'BigDecimal', annotations: ['@Column(precision = 10, scale = 2)'] },
          { name: 'userType', type: 'UserType', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'isActive', type: 'Boolean', annotations: ['@Column(nullable = false, columnDefinition = "boolean default true")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] },
          { name: 'updatedAt', type: 'LocalDateTime', annotations: ['@UpdateTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Project', mappedBy: 'client' },
          { type: 'OneToMany', target: 'Bid', mappedBy: 'freelancer' },
          { type: 'OneToMany', target: 'Review', mappedBy: 'reviewer' },
          { type: 'ManyToMany', target: 'Skill', joinTable: 'user_skills' }
        ],
        enums: ['UserType']
      },
      {
        name: 'Project',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'title', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'description', type: 'String', annotations: ['@Column(length = 5000, nullable = false)'] },
          { name: 'budget', type: 'BigDecimal', annotations: ['@Column(precision = 10, scale = 2)'] },
          { name: 'deadline', type: 'LocalDate' },
          { name: 'status', type: 'ProjectStatus', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'isRemote', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default true")'] },
          { name: 'experienceLevel', type: 'ExperienceLevel', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] },
          { name: 'updatedAt', type: 'LocalDateTime', annotations: ['@UpdateTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'client' },
          { type: 'ManyToOne', target: 'User', name: 'assignedFreelancer' },
          { type: 'ManyToOne', target: 'Category', name: 'category' },
          { type: 'OneToMany', target: 'Bid', mappedBy: 'project' },
          { type: 'ManyToMany', target: 'Skill', joinTable: 'project_skills' }
        ],
        enums: ['ProjectStatus', 'ExperienceLevel']
      },
      {
        name: 'Bid',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'amount', type: 'BigDecimal', annotations: ['@Column(precision = 10, scale = 2, nullable = false)'] },
          { name: 'proposal', type: 'String', annotations: ['@Column(length = 2000, nullable = false)'] },
          { name: 'deliveryTime', type: 'Integer', annotations: ['@Column(nullable = false)'] },
          { name: 'status', type: 'BidStatus', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'Project', name: 'project' },
          { type: 'ManyToOne', target: 'User', name: 'freelancer' }
        ],
        enums: ['BidStatus']
      },
      {
        name: 'Category',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'name', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'description', type: 'String' },
          { name: 'isActive', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default true")'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Project', mappedBy: 'category' }
        ]
      },
      {
        name: 'Skill',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'name', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'description', type: 'String' }
        ],
        relationships: [
          { type: 'ManyToMany', target: 'User', mappedBy: 'skills' },
          { type: 'ManyToMany', target: 'Project', mappedBy: 'requiredSkills' }
        ]
      },
      {
        name: 'Payment',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'amount', type: 'BigDecimal', annotations: ['@Column(precision = 10, scale = 2, nullable = false)'] },
          { name: 'paymentMethod', type: 'PaymentMethod', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'transactionId', type: 'String', annotations: ['@Column(unique = true)'] },
          { name: 'status', type: 'PaymentStatus', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'paidAt', type: 'LocalDateTime' },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'Project', name: 'project' },
          { type: 'ManyToOne', target: 'User', name: 'payer' },
          { type: 'ManyToOne', target: 'User', name: 'recipient' }
        ],
        enums: ['PaymentMethod', 'PaymentStatus']
      },
      {
        name: 'Review',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'rating', type: 'Integer', annotations: ['@Column(nullable = false)', '@Min(1)', '@Max(5)'] },
          { name: 'comment', type: 'String', annotations: ['@Column(length = 1000)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'Project', name: 'project' },
          { type: 'ManyToOne', target: 'User', name: 'reviewer' },
          { type: 'ManyToOne', target: 'User', name: 'reviewee' }
        ]
      },
      {
        name: 'Message',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'content', type: 'String', annotations: ['@Column(length = 2000, nullable = false)'] },
          { name: 'isRead', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default false")'] },
          { name: 'sentAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'sender' },
          { type: 'ManyToOne', target: 'User', name: 'recipient' },
          { type: 'ManyToOne', target: 'Project', name: 'project' }
        ]
      }
    ],
    enums: {
      UserType: ['CLIENT', 'FREELANCER', 'ADMIN'],
      ProjectStatus: ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      ExperienceLevel: ['BEGINNER', 'INTERMEDIATE', 'EXPERT'],
      BidStatus: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      PaymentMethod: ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'WALLET'],
      PaymentStatus: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
    },
    apis: [
      {
        name: 'User Management',
        purpose: 'Handle user registration, authentication, and profile management',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login', 
          'GET /api/users/profile',
          'PUT /api/users/profile',
          'GET /api/users/{id}',
          'PUT /api/users/{id}/skills',
          'GET /api/users/search'
        ],
        entity: 'User'
      },
      {
        name: 'Project Management',
        purpose: 'Manage project creation, updates, and lifecycle',
        endpoints: [
          'POST /api/projects',
          'GET /api/projects',
          'GET /api/projects/{id}',
          'PUT /api/projects/{id}',
          'DELETE /api/projects/{id}',
          'GET /api/projects/search',
          'PUT /api/projects/{id}/assign'
        ],
        entity: 'Project'
      },
      {
        name: 'Bidding System',
        purpose: 'Handle bid creation, management, and selection',
        endpoints: [
          'POST /api/projects/{projectId}/bids',
          'GET /api/projects/{projectId}/bids',
          'GET /api/bids/{id}',
          'PUT /api/bids/{id}',
          'DELETE /api/bids/{id}',
          'PUT /api/bids/{id}/accept'
        ],
        entity: 'Bid'
      },
      {
        name: 'Payment Processing',
        purpose: 'Handle payments, transactions, and financial operations',
        endpoints: [
          'POST /api/payments',
          'GET /api/payments/{id}',
          'GET /api/users/{userId}/payments',
          'PUT /api/payments/{id}/status',
          'POST /api/payments/{id}/refund'
        ],
        entity: 'Payment'
      },
      {
        name: 'Review System',
        purpose: 'Manage reviews and ratings between users',
        endpoints: [
          'POST /api/projects/{projectId}/reviews',
          'GET /api/users/{userId}/reviews',
          'GET /api/reviews/{id}',
          'PUT /api/reviews/{id}',
          'DELETE /api/reviews/{id}'
        ],
        entity: 'Review'
      },
      {
        name: 'Messaging System',
        purpose: 'Handle communication between clients and freelancers',
        endpoints: [
          'POST /api/messages',
          'GET /api/messages/conversations',
          'GET /api/messages/conversations/{userId}',
          'PUT /api/messages/{id}/read',
          'GET /api/messages/unread-count'
        ],
        entity: 'Message'
      }
    ]
  };
};

const generateInstagramTemplate = (projectConfig, databaseConfig) => {
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'password', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'fullName', type: 'String' },
          { name: 'bio', type: 'String', annotations: ['@Column(length = 500)'] },
          { name: 'profilePicture', type: 'String' },
          { name: 'website', type: 'String' },
          { name: 'isPrivate', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default false")'] },
          { name: 'isVerified', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default false")'] },
          { name: 'followerCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'followingCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'postCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Post', mappedBy: 'user' },
          { type: 'OneToMany', target: 'Story', mappedBy: 'user' },
          { type: 'OneToMany', target: 'Follow', mappedBy: 'follower' },
          { type: 'OneToMany', target: 'Follow', mappedBy: 'following' }
        ]
      },
      {
        name: 'Post',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'caption', type: 'String', annotations: ['@Column(length = 2200)'] },
          { name: 'location', type: 'String' },
          { name: 'likeCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'commentCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'isArchived', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default false")'] },
          { name: 'commentsDisabled', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default false")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'user' },
          { type: 'OneToMany', target: 'PostMedia', mappedBy: 'post' },
          { type: 'OneToMany', target: 'Like', mappedBy: 'post' },
          { type: 'OneToMany', target: 'Comment', mappedBy: 'post' }
        ]
      },
      {
        name: 'PostMedia',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'mediaUrl', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'mediaType', type: 'MediaType', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'orderIndex', type: 'Integer', annotations: ['@Column(nullable = false)'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'Post', name: 'post' }
        ],
        enums: ['MediaType']
      },
      {
        name: 'Story',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'mediaUrl', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'mediaType', type: 'MediaType', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'viewCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'expiresAt', type: 'LocalDateTime', annotations: ['@Column(nullable = false)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'user' },
          { type: 'OneToMany', target: 'StoryView', mappedBy: 'story' }
        ],
        enums: ['MediaType']
      },
      {
        name: 'Follow',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'follower' },
          { type: 'ManyToOne', target: 'User', name: 'following' }
        ]
      },
      {
        name: 'Like',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'user' },
          { type: 'ManyToOne', target: 'Post', name: 'post' }
        ]
      },
      {
        name: 'Comment',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'text', type: 'String', annotations: ['@Column(length = 2200, nullable = false)'] },
          { name: 'likeCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'user' },
          { type: 'ManyToOne', target: 'Post', name: 'post' },
          { type: 'ManyToOne', target: 'Comment', name: 'parentComment' },
          { type: 'OneToMany', target: 'Comment', mappedBy: 'parentComment' }
        ]
      },
      {
        name: 'DirectMessage',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'content', type: 'String', annotations: ['@Column(length = 1000)'] },
          { name: 'mediaUrl', type: 'String' },
          { name: 'messageType', type: 'MessageType', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'isRead', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default false")'] },
          { name: 'sentAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'sender' },
          { type: 'ManyToOne', target: 'User', name: 'recipient' }
        ],
        enums: ['MessageType']
      },
      {
        name: 'StoryView',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'viewedAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'Story', name: 'story' },
          { type: 'ManyToOne', target: 'User', name: 'viewer' }
        ]
      }
    ],
    enums: {
      MediaType: ['IMAGE', 'VIDEO'],
      MessageType: ['TEXT', 'IMAGE', 'VIDEO', 'POST_SHARE', 'STORY_SHARE']
    },
    apis: [
      {
        name: 'User Management',
        purpose: 'Handle user registration, authentication, and profile management',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'GET /api/users/profile',
          'PUT /api/users/profile',
          'GET /api/users/{username}',
          'GET /api/users/search'
        ],
        entity: 'User'
      },
      {
        name: 'Post Management',
        purpose: 'Handle post creation, updates, and feed generation',
        endpoints: [
          'POST /api/posts',
          'GET /api/posts/feed',
          'GET /api/posts/{id}',
          'PUT /api/posts/{id}',
          'DELETE /api/posts/{id}',
          'GET /api/users/{userId}/posts'
        ],
        entity: 'Post'
      },
      {
        name: 'Social Interactions',
        purpose: 'Handle likes, comments, and social engagement',
        endpoints: [
          'POST /api/posts/{postId}/like',
          'DELETE /api/posts/{postId}/like',
          'POST /api/posts/{postId}/comments',
          'GET /api/posts/{postId}/comments',
          'PUT /api/comments/{id}',
          'DELETE /api/comments/{id}'
        ],
        entity: 'Like'
      },
      {
        name: 'Follow System',
        purpose: 'Manage following relationships between users',
        endpoints: [
          'POST /api/users/{userId}/follow',
          'DELETE /api/users/{userId}/follow',
          'GET /api/users/{userId}/followers',
          'GET /api/users/{userId}/following'
        ],
        entity: 'Follow'
      },
      {
        name: 'Story Management',
        purpose: 'Handle story creation, viewing, and expiration',
        endpoints: [
          'POST /api/stories',
          'GET /api/stories/feed',
          'GET /api/stories/{id}/views',
          'POST /api/stories/{id}/view',
          'DELETE /api/stories/{id}'
        ],
        entity: 'Story'
      },
      {
        name: 'Direct Messaging',
        purpose: 'Handle private messaging between users',
        endpoints: [
          'POST /api/messages',
          'GET /api/messages/conversations',
          'GET /api/messages/conversations/{userId}',
          'PUT /api/messages/{id}/read'
        ],
        entity: 'DirectMessage'
      }
    ]
  };
};

// Simplified templates for other apps (can be expanded similarly)
const generateYoutubeTemplate = (projectConfig, databaseConfig) => {
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'channelName', type: 'String' },
          { name: 'subscriberCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Video', mappedBy: 'creator' },
          { type: 'OneToMany', target: 'Subscription', mappedBy: 'subscriber' }
        ]
      },
      {
        name: 'Video',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'title', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'description', type: 'String', annotations: ['@Column(length = 5000)'] },
          { name: 'videoUrl', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'thumbnailUrl', type: 'String' },
          { name: 'duration', type: 'Integer' },
          { name: 'viewCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'likeCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'dislikeCount', type: 'Long', annotations: ['@Column(columnDefinition = "bigint default 0")'] },
          { name: 'isPublic', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default true")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'creator' },
          { type: 'ManyToOne', target: 'Category', name: 'category' },
          { type: 'OneToMany', target: 'Comment', mappedBy: 'video' }
        ]
      }
    ],
    enums: {},
    apis: [
      {
        name: 'Video Management',
        purpose: 'Handle video upload, streaming, and management',
        endpoints: [
          'POST /api/videos/upload',
          'GET /api/videos',
          'GET /api/videos/{id}',
          'PUT /api/videos/{id}',
          'DELETE /api/videos/{id}',
          'POST /api/videos/{id}/view'
        ],
        entity: 'Video'
      }
    ]
  };
};

// GitHub Clone Template
const generateGithubTemplate = (projectConfig, databaseConfig) => {
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'fullName', type: 'String' },
          { name: 'bio', type: 'String', annotations: ['@Column(length = 500)'] },
          { name: 'avatarUrl', type: 'String' },
          { name: 'location', type: 'String' },
          { name: 'website', type: 'String' },
          { name: 'publicRepos', type: 'Integer', annotations: ['@Column(columnDefinition = "int default 0")'] },
          { name: 'followers', type: 'Integer', annotations: ['@Column(columnDefinition = "int default 0")'] },
          { name: 'following', type: 'Integer', annotations: ['@Column(columnDefinition = "int default 0")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Repository', mappedBy: 'owner' },
          { type: 'OneToMany', target: 'Issue', mappedBy: 'author' },
          { type: 'OneToMany', target: 'PullRequest', mappedBy: 'author' }
        ]
      },
      {
        name: 'Repository',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'name', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'description', type: 'String', annotations: ['@Column(length = 1000)'] },
          { name: 'isPrivate', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default false")'] },
          { name: 'language', type: 'String' },
          { name: 'stars', type: 'Integer', annotations: ['@Column(columnDefinition = "int default 0")'] },
          { name: 'forks', type: 'Integer', annotations: ['@Column(columnDefinition = "int default 0")'] },
          { name: 'watchers', type: 'Integer', annotations: ['@Column(columnDefinition = "int default 0")'] },
          { name: 'defaultBranch', type: 'String', annotations: ['@Column(columnDefinition = "varchar(255) default \'main\'")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] },
          { name: 'updatedAt', type: 'LocalDateTime', annotations: ['@UpdateTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'owner' },
          { type: 'OneToMany', target: 'Issue', mappedBy: 'repository' },
          { type: 'OneToMany', target: 'PullRequest', mappedBy: 'repository' }
        ]
      },
      {
        name: 'Issue',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'title', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'body', type: 'String', annotations: ['@Column(length = 5000)'] },
          { name: 'state', type: 'IssueState', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'labels', type: 'String' },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] },
          { name: 'updatedAt', type: 'LocalDateTime', annotations: ['@UpdateTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'Repository', name: 'repository' },
          { type: 'ManyToOne', target: 'User', name: 'author' },
          { type: 'ManyToOne', target: 'User', name: 'assignee' }
        ],
        enums: ['IssueState']
      },
      {
        name: 'PullRequest',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'title', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'body', type: 'String', annotations: ['@Column(length = 5000)'] },
          { name: 'state', type: 'PullRequestState', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'sourceBranch', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'targetBranch', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] },
          { name: 'updatedAt', type: 'LocalDateTime', annotations: ['@UpdateTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'Repository', name: 'repository' },
          { type: 'ManyToOne', target: 'User', name: 'author' }
        ],
        enums: ['PullRequestState']
      }
    ],
    enums: {
      IssueState: ['OPEN', 'CLOSED'],
      PullRequestState: ['OPEN', 'CLOSED', 'MERGED']
    },
    apis: [
      {
        name: 'User Management',
        purpose: 'Handle user registration, authentication, and profile management',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'GET /api/users/{username}',
          'PUT /api/users/profile',
          'GET /api/users/{username}/repos'
        ],
        entity: 'User'
      },
      {
        name: 'Repository Management',
        purpose: 'Handle repository creation, updates, and management',
        endpoints: [
          'POST /api/repositories',
          'GET /api/repositories',
          'GET /api/repositories/{id}',
          'PUT /api/repositories/{id}',
          'DELETE /api/repositories/{id}',
          'POST /api/repositories/{id}/star',
          'POST /api/repositories/{id}/fork'
        ],
        entity: 'Repository'
      },
      {
        name: 'Issue Management',
        purpose: 'Handle issue creation, tracking, and management',
        endpoints: [
          'POST /api/repositories/{repoId}/issues',
          'GET /api/repositories/{repoId}/issues',
          'GET /api/issues/{id}',
          'PUT /api/issues/{id}',
          'PUT /api/issues/{id}/state'
        ],
        entity: 'Issue'
      },
      {
        name: 'Pull Request Management',
        purpose: 'Handle pull request creation, review, and merging',
        endpoints: [
          'POST /api/repositories/{repoId}/pulls',
          'GET /api/repositories/{repoId}/pulls',
          'GET /api/pulls/{id}',
          'PUT /api/pulls/{id}',
          'POST /api/pulls/{id}/merge'
        ],
        entity: 'PullRequest'
      }
    ]
  };
};

// Facebook Clone Template
const generateFacebookTemplate = (projectConfig, databaseConfig) => {
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'firstName', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'lastName', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'profilePicture', type: 'String' },
          { name: 'coverPhoto', type: 'String' },
          { name: 'bio', type: 'String', annotations: ['@Column(length = 500)'] },
          { name: 'dateOfBirth', type: 'LocalDate' },
          { name: 'location', type: 'String' },
          { name: 'relationship', type: 'String' },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Post', mappedBy: 'author' },
          { type: 'OneToMany', target: 'Friendship', mappedBy: 'requester' },
          { type: 'OneToMany', target: 'Friendship', mappedBy: 'addressee' }
        ]
      },
      {
        name: 'Post',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'content', type: 'String', annotations: ['@Column(length = 5000)'] },
          { name: 'imageUrl', type: 'String' },
          { name: 'privacy', type: 'PostPrivacy', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'likeCount', type: 'Integer', annotations: ['@Column(columnDefinition = "int default 0")'] },
          { name: 'commentCount', type: 'Integer', annotations: ['@Column(columnDefinition = "int default 0")'] },
          { name: 'shareCount', type: 'Integer', annotations: ['@Column(columnDefinition = "int default 0")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'author' },
          { type: 'OneToMany', target: 'Like', mappedBy: 'post' },
          { type: 'OneToMany', target: 'Comment', mappedBy: 'post' }
        ],
        enums: ['PostPrivacy']
      },
      {
        name: 'Friendship',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'status', type: 'FriendshipStatus', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'requester' },
          { type: 'ManyToOne', target: 'User', name: 'addressee' }
        ],
        enums: ['FriendshipStatus']
      }
    ],
    enums: {
      PostPrivacy: ['PUBLIC', 'FRIENDS', 'PRIVATE'],
      FriendshipStatus: ['PENDING', 'ACCEPTED', 'BLOCKED']
    },
    apis: [
      {
        name: 'User Management',
        purpose: 'Handle user registration, authentication, and profile management',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'GET /api/users/profile',
          'PUT /api/users/profile',
          'GET /api/users/{id}'
        ],
        entity: 'User'
      },
      {
        name: 'Post Management',
        purpose: 'Handle post creation, updates, and news feed',
        endpoints: [
          'POST /api/posts',
          'GET /api/posts/feed',
          'GET /api/posts/{id}',
          'PUT /api/posts/{id}',
          'DELETE /api/posts/{id}',
          'POST /api/posts/{id}/like'
        ],
        entity: 'Post'
      },
      {
        name: 'Friend Management',
        purpose: 'Handle friend requests and relationships',
        endpoints: [
          'POST /api/friends/request',
          'PUT /api/friends/{id}/accept',
          'DELETE /api/friends/{id}',
          'GET /api/friends',
          'GET /api/friends/requests'
        ],
        entity: 'Friendship'
      }
    ]
  };
};

// Simplified templates for remaining apps
const generateUdemyTemplate = (projectConfig, databaseConfig) => {
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'fullName', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'userType', type: 'UserType', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Course', mappedBy: 'instructor' },
          { type: 'OneToMany', target: 'Enrollment', mappedBy: 'student' }
        ],
        enums: ['UserType']
      },
      {
        name: 'Course',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'title', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'description', type: 'String', annotations: ['@Column(length = 2000)'] },
          { name: 'price', type: 'BigDecimal', annotations: ['@Column(precision = 10, scale = 2)'] },
          { name: 'level', type: 'CourseLevel', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'instructor' },
          { type: 'OneToMany', target: 'Lesson', mappedBy: 'course' },
          { type: 'OneToMany', target: 'Enrollment', mappedBy: 'course' }
        ],
        enums: ['CourseLevel']
      }
    ],
    enums: {
      UserType: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
      CourseLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
    },
    apis: [
      {
        name: 'Course Management',
        purpose: 'Handle course creation, updates, and enrollment',
        endpoints: [
          'POST /api/courses',
          'GET /api/courses',
          'GET /api/courses/{id}',
          'PUT /api/courses/{id}',
          'POST /api/courses/{id}/enroll'
        ],
        entity: 'Course'
      }
    ]
  };
};

const generateUberTemplate = (projectConfig, databaseConfig) => {
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'phone', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'userType', type: 'UserType', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Ride', mappedBy: 'passenger' },
          { type: 'OneToMany', target: 'Ride', mappedBy: 'driver' }
        ],
        enums: ['UserType']
      },
      {
        name: 'Ride',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'pickupLocation', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'dropoffLocation', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'fare', type: 'BigDecimal', annotations: ['@Column(precision = 10, scale = 2)'] },
          { name: 'status', type: 'RideStatus', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'passenger' },
          { type: 'ManyToOne', target: 'User', name: 'driver' }
        ],
        enums: ['RideStatus']
      }
    ],
    enums: {
      UserType: ['PASSENGER', 'DRIVER', 'ADMIN'],
      RideStatus: ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    },
    apis: [
      {
        name: 'Ride Management',
        purpose: 'Handle ride booking, tracking, and completion',
        endpoints: [
          'POST /api/rides',
          'GET /api/rides/{id}',
          'PUT /api/rides/{id}/accept',
          'PUT /api/rides/{id}/complete',
          'GET /api/rides/history'
        ],
        entity: 'Ride'
      }
    ]
  };
};

const generateZerodhaTemplate = (projectConfig, databaseConfig) => {
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'panNumber', type: 'String', annotations: ['@Column(unique = true)'] },
          { name: 'accountBalance', type: 'BigDecimal', annotations: ['@Column(precision = 15, scale = 2)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Trade', mappedBy: 'user' },
          { type: 'OneToMany', target: 'Portfolio', mappedBy: 'user' }
        ]
      },
      {
        name: 'Stock',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'symbol', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'companyName', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'currentPrice', type: 'BigDecimal', annotations: ['@Column(precision = 10, scale = 2)'] },
          { name: 'sector', type: 'String' }
        ]
      }
    ],
    enums: {},
    apis: [
      {
        name: 'Trading Management',
        purpose: 'Handle stock trading and portfolio management',
        endpoints: [
          'POST /api/trades',
          'GET /api/trades',
          'GET /api/portfolio',
          'GET /api/stocks',
          'GET /api/stocks/{symbol}'
        ],
        entity: 'Stock'
      }
    ]
  };
};

const generateCanvaTemplate = (projectConfig, databaseConfig) => {
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'subscriptionType', type: 'SubscriptionType', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Design', mappedBy: 'creator' }
        ],
        enums: ['SubscriptionType']
      },
      {
        name: 'Design',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'title', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'designData', type: 'String', annotations: ['@Column(length = 10000)'] },
          { name: 'thumbnail', type: 'String' },
          { name: 'isPublic', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default false")'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'creator' }
        ]
      }
    ],
    enums: {
      SubscriptionType: ['FREE', 'PRO', 'TEAM']
    },
    apis: [
      {
        name: 'Design Management',
        purpose: 'Handle design creation, editing, and sharing',
        endpoints: [
          'POST /api/designs',
          'GET /api/designs',
          'GET /api/designs/{id}',
          'PUT /api/designs/{id}',
          'DELETE /api/designs/{id}'
        ],
        entity: 'Design'
      }
    ]
  };
};

const generateZomatoTemplate = (projectConfig, databaseConfig) => {
  return {
    entities: [
      {
        name: 'User',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'username', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'email', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'phone', type: 'String', annotations: ['@Column(unique = true, nullable = false)'] },
          { name: 'address', type: 'String', annotations: ['@Column(length = 500)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'Order', mappedBy: 'customer' }
        ]
      },
      {
        name: 'Restaurant',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'name', type: 'String', annotations: ['@Column(nullable = false)'] },
          { name: 'address', type: 'String', annotations: ['@Column(length = 500)'] },
          { name: 'cuisine', type: 'String' },
          { name: 'rating', type: 'Double', annotations: ['@Column(columnDefinition = "DECIMAL(3,2)")'] },
          { name: 'isActive', type: 'Boolean', annotations: ['@Column(columnDefinition = "boolean default true")'] }
        ],
        relationships: [
          { type: 'OneToMany', target: 'MenuItem', mappedBy: 'restaurant' },
          { type: 'OneToMany', target: 'Order', mappedBy: 'restaurant' }
        ]
      },
      {
        name: 'Order',
        fields: [
          { name: 'id', type: 'Long', annotations: ['@Id', '@GeneratedValue(strategy = GenerationType.IDENTITY)'] },
          { name: 'totalAmount', type: 'BigDecimal', annotations: ['@Column(precision = 10, scale = 2)'] },
          { name: 'status', type: 'OrderStatus', annotations: ['@Enumerated(EnumType.STRING)'] },
          { name: 'deliveryAddress', type: 'String', annotations: ['@Column(length = 500)'] },
          { name: 'createdAt', type: 'LocalDateTime', annotations: ['@CreationTimestamp'] }
        ],
        relationships: [
          { type: 'ManyToOne', target: 'User', name: 'customer' },
          { type: 'ManyToOne', target: 'Restaurant', name: 'restaurant' }
        ],
        enums: ['OrderStatus']
      }
    ],
    enums: {
      OrderStatus: ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
    },
    apis: [
      {
        name: 'Restaurant Management',
        purpose: 'Handle restaurant listings and menu management',
        endpoints: [
          'GET /api/restaurants',
          'GET /api/restaurants/{id}',
          'GET /api/restaurants/{id}/menu',
          'GET /api/restaurants/search'
        ],
        entity: 'Restaurant'
      },
      {
        name: 'Order Management',
        purpose: 'Handle food ordering and delivery tracking',
        endpoints: [
          'POST /api/orders',
          'GET /api/orders/{id}',
          'PUT /api/orders/{id}/status',
          'GET /api/users/{userId}/orders'
        ],
        entity: 'Order'
      }
    ]
  };
}; 