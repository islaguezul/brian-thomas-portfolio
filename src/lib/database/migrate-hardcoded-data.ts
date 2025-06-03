import { sql } from '@vercel/postgres';
import type { 
  PersonalInfo, 
  Project, 
  WorkExperience, 
  Education, 
  SkillCategory,
  TechStackItem
} from './types';

export async function migrateHardcodedData() {
  console.log('🚀 Starting migration of hardcoded data...');

  try {
    // 1. PERSONAL INFO
    console.log('📝 Migrating personal info...');
    const personalInfo = {
      name: 'Brian Thomas',
      title: 'Technical Product Manager',
      email: 'brianjamesthomas@outlook.com',
      phone: '(707) 536-8398',
      location: 'Tacoma, WA',
      linkedinUrl: 'https://linkedin.com/in/brianjamesthomas',
      githubUrl: '', // Add if you have one
      bio: 'I thrive at the intersection of technology, process, and people—translating ambiguity into clarity and vision into reality.',
      tagline: 'Turning Vision into Reality Through Technology & Process',
      executiveSummary: "I thrive at the intersection of technology, process, and people—translating ambiguity into clarity and vision into reality. At Blue Origin, I've built bridges between engineering and operations, launching process frameworks that empower teams to deliver at scale. My experience spans the full product and process lifecycle: from mapping out the Engines business unit's first end-to-end workflows, to championing BPMN 2.0 adoption, to guiding data-driven improvements that shape both culture and outcomes. Whether I'm architecting a new tool, aligning stakeholders, or untangling legacy systems, I bring curiosity, rigor, and a bias for action. I'm passionate about building systems and products that not only work, but make work better for everyone involved.",
      yearsExperience: 13,
      startYear: 2011
    };

    // Check if personal info exists
    const existing = await sql`SELECT * FROM personal_info LIMIT 1`;
    if (existing.rows.length === 0) {
      await sql`
        INSERT INTO personal_info (
          name, title, email, phone, location, linkedin_url, github_url,
          bio, tagline, executive_summary, years_experience, start_year
        ) VALUES (
          ${personalInfo.name}, ${personalInfo.title}, ${personalInfo.email}, 
          ${personalInfo.phone}, ${personalInfo.location}, ${personalInfo.linkedinUrl}, 
          ${personalInfo.githubUrl}, ${personalInfo.bio}, ${personalInfo.tagline}, 
          ${personalInfo.executiveSummary}, ${personalInfo.yearsExperience}, ${personalInfo.startYear}
        )
      `;
    }

    // 2. WORK EXPERIENCE
    console.log('💼 Migrating work experience...');
    const workExperiences = [
      {
        title: 'Business Process Analyst',
        company: 'Blue Origin',
        startDate: '2022-01-01',
        endDate: null,
        isCurrent: true,
        displayOrder: 1,
        responsibilities: [
          'Partnered with engineering, operations, and leadership to define and optimize end-to-end business processes for the Engines business unit, enabling scalable and efficient delivery of technical products and programs.',
          'Led requirements gathering, process mapping, and stakeholder alignment for the Engines Build Manifest tool, directly supporting product development and lifecycle management.',
          'Developed and implemented a process maturity model and roadmap, driving continuous improvement and supporting the adoption of new technologies and systems.',
          'Conducted gap analyses and provided actionable recommendations that informed product roadmaps and operational strategies for mission-critical programs.',
          'Evangelized BPMN 2.0 and best practices across the organization, fostering a culture of process excellence and data-driven decision making.'
        ]
      },
      {
        title: 'Business Process Analyst',
        company: 'Chelan P.U.D.',
        startDate: '2017-11-01',
        endDate: '2021-12-31',
        isCurrent: false,
        displayOrder: 2,
        responsibilities: [
          'Pioneered a comprehensive process management function, crafting roadmaps, risk assessments, and models to guide organizational improvements, including renewable energy projects and high-load systems. Results included adopting ERPs with enterprise architectures instead of inefficient manual process changes and complicated organizational change management projects',
          'Drove process maturity through actionable insights, leveraging data visualization tools such as Tableau and Power BI for project outcomes in utility infrastructure and energy systems'
        ]
      },
      {
        title: 'Technical Product/Project Manager (ERP Systems)',
        company: 'Microsoft',
        startDate: '2016-01-01',
        endDate: '2017-10-31',
        isCurrent: false,
        displayOrder: 3,
        responsibilities: [
          'Managed the team\'s work structure, burndown tracking, and dependencies, using both Visual Studio Online (customer-side) and MS Project (vendor)',
          'Collaborated with value-stream and scrum leads, and technical project managers, to define and model process and inform users\' change impacts. This resulted in informed change management strategy and a smooth transition of process to align with SAP out-of-the-box processes',
          'Worked alongside clients to create and execute a user-centric system adoption strategies for various projects, including a worldwide SAP implementation impacting 21,000+ global employees, across multiple project and product management roles'
        ]
      },
      {
        title: 'Technical Product/Project Manager',
        company: 'Mosaic',
        startDate: '2011-07-01',
        endDate: '2016-01-31',
        isCurrent: false,
        displayOrder: 4,
        responsibilities: [
          'Managed boutique mobile, onsite, and cloud-based SaaS app design and definition, and responsible for the full SDLC project, from requirements to support, for customized performance improvement and knowledge management software',
          'Supported organizational change programs by delivering training strategies, curriculum, courseware, custom software solutions, and training facilitation',
          'Project revenues ranged from $20K - $3M',
          'Conducted front-end training needs and occupational analyses, consulted on program management, created workshops, and developed program management models to ensure client success with their organizational development programs',
          'Developed solutions with metrics aligned to business needs. Programs delivered impacted 15 client organizations, in multiple business functions, including safety and compliance, finance & accounting, customer service, projects, supply chain management, operations, human resources, procurement, business intelligence, etc'
        ]
      },
      {
        title: 'Multiple Positions',
        company: 'U.S. Coast Guard',
        startDate: '2002-01-01',
        endDate: '2011-12-31',
        isCurrent: false,
        displayOrder: 5,
        responsibilities: [
          'Master Training Specialist (2009-2011)',
          'Training Program Manager (2005-2009)',
          'Telecommunications Center Supervisor (2002-2005)'
        ]
      }
    ];

    // Insert work experiences
    for (const exp of workExperiences) {
      const result = await sql`
        INSERT INTO work_experience (
          title, company, start_date, end_date, is_current, display_order
        ) VALUES (
          ${exp.title}, ${exp.company}, ${exp.startDate}, ${exp.endDate},
          ${exp.isCurrent}, ${exp.displayOrder}
        ) RETURNING id
      `;
      
      const expId = result.rows[0].id;
      
      // Insert responsibilities
      for (let i = 0; i < exp.responsibilities.length; i++) {
        await sql`
          INSERT INTO work_responsibilities (
            experience_id, responsibility, display_order
          ) VALUES (
            ${expId}, ${exp.responsibilities[i]}, ${i}
          )
        `;
      }
    }

    // 3. EDUCATION
    console.log('🎓 Migrating education...');
    const educationData = [
      {
        degree: 'Master of Business Administration (MBA)',
        school: 'University of Washington - Foster School of Business',
        graduationYear: '2018',
        concentration: 'Operations Management & Strategic Leadership',
        displayOrder: 1,
        courses: [
          'Supply Chain Management',
          'Operations Strategy',
          'Financial Analysis & Decision Making',
          'Leadership & Organizational Behavior',
          'Project Management'
        ]
      },
      {
        degree: 'Bachelor of Science',
        school: 'Central Washington University',
        graduationYear: '2009',
        concentration: 'Industrial & Engineering Technology',
        displayOrder: 2,
        courses: [
          'Labor Relations',
          'Management Training & Development',
          'Human Resource Management',
          'Organizational Behavior',
          'Cross-Cultural Management'
        ]
      }
    ];

    // Insert education
    for (const edu of educationData) {
      const result = await sql`
        INSERT INTO education (
          degree, school, graduation_year, concentration, display_order
        ) VALUES (
          ${edu.degree}, ${edu.school}, ${edu.graduationYear},
          ${edu.concentration}, ${edu.displayOrder}
        ) RETURNING id
      `;
      
      const eduId = result.rows[0].id;
      
      // Insert courses
      for (let i = 0; i < edu.courses.length; i++) {
        await sql`
          INSERT INTO education_courses (
            education_id, course_name, display_order
          ) VALUES (
            ${eduId}, ${edu.courses[i]}, ${i}
          )
        `;
      }
    }

    // 4. SKILLS
    console.log('🛠️ Migrating skills...');
    const skillCategories = [
      {
        name: 'Process Management',
        icon: '🔄',
        displayOrder: 1,
        skills: [
          'BPMN 2.0 Modeling',
          'Process Maturity Models',
          'Process Analysis & Design',
          'Change Management',
          'Kaizen / Lean Methodologies'
        ]
      },
      {
        name: 'Leadership & Management',
        icon: '👥',
        displayOrder: 2,
        skills: [
          'Team Leadership & Development',
          'Strategic Planning',
          'Performance Management',
          'Cross-functional Collaboration',
          'Stakeholder Management'
        ]
      },
      {
        name: 'Technical & Analytical',
        icon: '📊',
        displayOrder: 3,
        skills: [
          'Data Analysis & Reporting',
          'SCADA Systems',
          'Risk Assessment',
          'Quality Management',
          'Regulatory Compliance'
        ]
      }
    ];

    // Insert skill categories and skills
    for (const category of skillCategories) {
      const result = await sql`
        INSERT INTO skill_categories (
          name, icon, display_order
        ) VALUES (
          ${category.name}, ${category.icon}, ${category.displayOrder}
        ) RETURNING id
      `;
      
      const categoryId = result.rows[0].id;
      
      // Insert skills
      for (let i = 0; i < category.skills.length; i++) {
        await sql`
          INSERT INTO skills (
            category_id, skill_name, display_order
          ) VALUES (
            ${categoryId}, ${category.skills[i]}, ${i}
          )
        `;
      }
    }

    // 5. PROJECTS
    console.log('🚀 Migrating projects...');
    const projects = [
      {
        name: 'Crypto Trading Bot',
        status: 'Active Development',
        description: 'AI-powered cryptocurrency trading system with sentiment analysis, technical indicators, and risk management. Built with Python, integrates multiple exchanges, and uses machine learning for market prediction.',
        detailedDescription: 'A sophisticated cryptocurrency trading system that combines multiple data sources including real-time market data, social media sentiment analysis, and technical indicators to make automated trading decisions. The system uses machine learning models trained on historical data to predict price movements and includes comprehensive risk management features to protect capital during volatile market conditions.',
        stage: 'mvp',
        progress: 75,
        experimental: true,
        legacy: false,
        displayOrder: 1,
        technologies: ['Python', 'TensorFlow', 'Pandas', 'WebSocket', 'REST APIs', 'PostgreSQL', 'Docker', 'AWS'],
        features: [
          'Real-time market data processing',
          'Machine learning price prediction',
          'Automated risk management',
          'Multi-exchange integration',
          'Sentiment analysis from social media',
          'Technical indicator analysis',
          'Portfolio optimization',
          'Real-time alerting system'
        ],
        impacts: [
          { metricKey: 'roi', metricValue: '23%' },
          { metricKey: 'trades', metricValue: '1,247' },
          { metricKey: 'accuracy', metricValue: '68%' }
        ]
      },
      {
        name: 'Konnosaur Social Platform',
        status: 'Backend Complete',
        description: 'Next-generation social media platform with microservices architecture, real-time messaging, and comprehensive strategic documentation using enterprise methodologies.',
        detailedDescription: 'A scalable social media platform built on microservices architecture designed to handle millions of users. Features include real-time messaging, content recommendation algorithms, and AI-powered content moderation. The backend is fully implemented with comprehensive API documentation and testing coverage.',
        stage: 'backend',
        progress: 70,
        experimental: false,
        legacy: false,
        displayOrder: 2,
        technologies: ['Node.js', 'GraphQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Confluence'],
        features: [
          'Microservices architecture',
          'Real-time messaging',
          'Content moderation AI',
          'Analytics engine'
        ],
        impacts: [
          { metricKey: 'microservices', metricValue: '8 Services' },
          { metricKey: 'apis', metricValue: '40+ Endpoints' },
          { metricKey: 'documentation', metricValue: '95% Coverage' }
        ]
      },
      {
        name: 'Ecco Stream Global Search',
        status: 'Conceptual',
        description: 'Global streaming rights search engine addressing JustWatch limitations with country-specific availability and price comparison across 50+ streaming services.',
        detailedDescription: 'A comprehensive solution to the fragmented global streaming landscape. This platform would aggregate streaming availability data from 50+ services across multiple countries, providing users with accurate, real-time information about where content is available and at what price. Includes features for VPN-friendly searches and historical availability tracking.',
        stage: 'concept',
        progress: 35,
        experimental: false,
        legacy: false,
        displayOrder: 3,
        technologies: ['React', 'Node.js', 'MongoDB', 'Streaming APIs', 'GitLab CI/CD', 'D3.js'],
        features: [
          'Global rights database',
          'Country-specific search',
          'Price comparison engine',
          'Availability alerts'
        ],
        impacts: [
          { metricKey: 'market-size', metricValue: '$2.1B TAM' },
          { metricKey: 'countries', metricValue: '15+ Target' },
          { metricKey: 'differentiation', metricValue: 'First-to-Market' }
        ]
      },
      {
        name: 'Enterprise Process Analytics',
        status: 'Trade Studies',
        description: 'Advanced process modeling platform with canonical object creation, inspired by Blue Origin process maturity initiatives and enterprise BPMN 2.0 adoption.',
        detailedDescription: 'An enterprise-grade platform for process modeling, analysis, and optimization. Leverages graph database technology to create canonical process objects that can be reused across the organization. Includes machine learning capabilities to identify process bottlenecks and suggest optimizations based on historical performance data.',
        stage: 'research',
        progress: 25,
        experimental: false,
        legacy: false,
        displayOrder: 4,
        technologies: ['React', 'D3.js', 'Python', 'Machine Learning', 'Neo4j Graph DB', 'BPMN 2.0'],
        features: [
          'BPMN 2.0 modeling',
          'Process analytics',
          'Canonical object library',
          'Enterprise integration'
        ],
        impacts: [
          { metricKey: 'enterprise-roi', metricValue: '$500K+ Potential' },
          { metricKey: 'processes', metricValue: '100+ Modeled' },
          { metricKey: 'efficiency', metricValue: '40% Target' }
        ]
      },
      {
        name: 'This Portfolio Site',
        status: 'Production',
        description: 'Self-referential demonstration of modern web architecture and technical product management methodology.',
        detailedDescription: 'A modern portfolio website built with cutting-edge web technologies. Features include real-time data integration, advanced animations, and AI-powered content. Serves as both a personal showcase and a demonstration of technical capabilities in full-stack development.',
        stage: 'production',
        progress: 95,
        experimental: false,
        legacy: false,
        displayOrder: 5,
        technologies: ['React', 'Next.js', 'Three.js', 'Recharts', 'Tailwind CSS', 'Vercel'],
        features: [
          'Live data integration',
          'Responsive design',
          'Performance optimization',
          'AI personalization'
        ],
        impacts: [
          { metricKey: 'performance', metricValue: '98/100' },
          { metricKey: 'accessibility', metricValue: '96/100' },
          { metricKey: 'innovation', metricValue: 'High' }
        ]
      },
      {
        name: 'Enterprise Process Knowledge System',
        status: 'Legacy Project',
        description: 'SharePoint-based knowledge management platform with custom process modeling that connected employees to role-specific training and job aids within two clicks, while visualizing organizational workflows.',
        detailedDescription: 'A comprehensive knowledge management system built on SharePoint that revolutionized how employees accessed role-specific information. The platform featured custom-built SVG process visualizations that allowed users to navigate complex organizational workflows intuitively. Achieved significant adoption rates and measurable efficiency improvements across the organization.',
        stage: 'legacy',
        progress: 100,
        experimental: false,
        legacy: true,
        displayOrder: 6,
        technologies: ['SharePoint', 'HTML/CSS', 'JavaScript', 'SQL Server', 'Custom SVG Graphics', 'D3.js'],
        features: [
          'Custom-built SVG process modeling visualization',
          'Role-based content delivery',
          'Two-click navigation to any resource',
          'Upstream/downstream dependency mapping',
          'Integrated training modules',
          'Real-time process documentation',
          'Automated workflow triggers',
          'Performance analytics dashboard'
        ],
        impacts: [
          { metricKey: 'adoption', metricValue: '2,500+ Users' },
          { metricKey: 'efficiency', metricValue: '40% Task Time Reduction' },
          { metricKey: 'training', metricValue: '85% Self-Service Rate' }
        ]
      }
    ];

    // Insert projects
    for (const project of projects) {
      const result = await sql`
        INSERT INTO projects (
          name, status, description, detailed_description, stage, progress,
          experimental, legacy, display_order
        ) VALUES (
          ${project.name}, ${project.status}, ${project.description}, 
          ${project.detailedDescription}, ${project.stage}, ${project.progress},
          ${project.experimental}, ${project.legacy}, ${project.displayOrder}
        ) RETURNING id
      `;
      
      const projectId = result.rows[0].id;
      
      // Insert technologies
      for (const tech of project.technologies) {
        await sql`
          INSERT INTO project_technologies (project_id, technology) 
          VALUES (${projectId}, ${tech})
        `;
      }
      
      // Insert features
      for (let i = 0; i < project.features.length; i++) {
        await sql`
          INSERT INTO project_features (project_id, feature, display_order) 
          VALUES (${projectId}, ${project.features[i]}, ${i})
        `;
      }
      
      // Insert impacts
      for (const impact of project.impacts) {
        await sql`
          INSERT INTO project_impacts (project_id, metric_key, metric_value) 
          VALUES (${projectId}, ${impact.metricKey}, ${impact.metricValue})
        `;
      }
    }

    // 6. TECH STACK
    console.log('💻 Migrating tech stack...');
    const techStack = [
      // Frontend
      { name: 'React', icon: '⚛️', level: 95, category: 'Frontend', displayOrder: 1 },
      { name: 'Next.js', icon: '▲', level: 95, category: 'Frontend', displayOrder: 2 },
      { name: 'TypeScript', icon: '🔷', level: 90, category: 'Frontend', displayOrder: 3 },
      { name: 'Tailwind CSS', icon: '🎨', level: 85, category: 'Frontend', displayOrder: 4 },
      { name: 'Three.js', icon: '🎮', level: 70, category: 'Frontend', displayOrder: 5 },
      
      // Backend
      { name: 'Node.js', icon: '🟢', level: 88, category: 'Backend', displayOrder: 6 },
      { name: 'Python', icon: '🐍', level: 88, category: 'Backend', displayOrder: 7 },
      { name: 'GraphQL', icon: '◈', level: 80, category: 'Backend', displayOrder: 8 },
      { name: 'REST APIs', icon: '🔌', level: 92, category: 'Backend', displayOrder: 9 },
      
      // Databases
      { name: 'PostgreSQL', icon: '🐘', level: 85, category: 'Database', displayOrder: 10 },
      { name: 'MongoDB', icon: '🍃', level: 82, category: 'Database', displayOrder: 11 },
      { name: 'Redis', icon: '🔴', level: 78, category: 'Database', displayOrder: 12 },
      
      // DevOps & Cloud
      { name: 'AWS', icon: '☁️', level: 82, category: 'Cloud', displayOrder: 13 },
      { name: 'Docker', icon: '🐳', level: 85, category: 'DevOps', displayOrder: 14 },
      { name: 'Vercel', icon: '▼', level: 90, category: 'Cloud', displayOrder: 15 },
      
      // Product & Process
      { name: 'BPMN 2.0', icon: '📊', level: 96, category: 'Process', displayOrder: 16 },
      { name: 'Product Strategy', icon: '🎯', level: 92, category: 'Product', displayOrder: 17 },
      { name: 'Data Analysis', icon: '📈', level: 85, category: 'Analytics', displayOrder: 18 },
      
      // AI/ML
      { name: 'TensorFlow', icon: '🤖', level: 75, category: 'AI/ML', displayOrder: 19 },
      { name: 'Machine Learning', icon: '🧠', level: 78, category: 'AI/ML', displayOrder: 20 }
    ];

    // Insert tech stack
    for (const tech of techStack) {
      await sql`
        INSERT INTO tech_stack (
          name, icon, level, category, display_order, show_in_portfolio
        ) VALUES (
          ${tech.name}, ${tech.icon}, ${tech.level}, 
          ${tech.category}, ${tech.displayOrder}, true
        )
      `;
    }

    // 7. PROCESS STRATEGIES (from Portfolio if mentioned)
    console.log('📋 Migrating process strategies...');
    const processStrategies = [
      {
        title: 'End-to-End Process Mapping',
        description: 'Define and optimize complete workflows from inception to delivery',
        icon: '🗺️',
        displayOrder: 1
      },
      {
        title: 'Stakeholder Alignment',
        description: 'Bridge technical and business teams through clear communication',
        icon: '🤝',
        displayOrder: 2
      },
      {
        title: 'Data-Driven Optimization',
        description: 'Use metrics and analytics to drive continuous improvement',
        icon: '📊',
        displayOrder: 3
      },
      {
        title: 'Risk Mitigation',
        description: 'Identify and address potential issues before they impact delivery',
        icon: '🛡️',
        displayOrder: 4
      }
    ];

    // Insert process strategies
    for (const strategy of processStrategies) {
      await sql`
        INSERT INTO process_strategy (
          title, description, icon, display_order
        ) VALUES (
          ${strategy.title}, ${strategy.description}, 
          ${strategy.icon}, ${strategy.displayOrder}
        )
      `;
    }

    // 8. SITE METRICS
    console.log('📈 Initializing site metrics...');
    await sql`
      INSERT INTO site_metrics (
        performance_score, deploy_date
      ) VALUES (
        98, '2024-12-01'
      )
    `;

    console.log('✅ Migration completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error };
  }
}

// Export a function to run this migration
export async function runMigration() {
  const result = await migrateHardcodedData();
  if (result.success) {
    console.log('🎉 All hardcoded data has been migrated to the database!');
  } else {
    console.error('💥 Migration failed:', result.error);
  }
}