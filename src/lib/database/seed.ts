import { sql } from '@vercel/postgres';

export async function seedDatabase() {
  try {
    // Personal Info
    await sql`
      INSERT INTO personal_info (
        name, title, email, phone, location, linkedin_url, github_url,
        bio, tagline, executive_summary, years_experience, start_year
      ) VALUES (
        'Brian Thomas',
        'Technical Product Manager',
        'brianjamesthomas@outlook.com',
        '(707) 536-8398',
        'Tacoma, WA',
        'https://linkedin.com/in/brianjamesthomas',
        'https://github.com/bthomas4',
        'I''m a Technical Product Manager passionate about leveraging AI and cutting-edge technology to solve complex business challenges. With over a decade of experience spanning process optimization, enterprise software development, and strategic product management, I bring a unique blend of technical expertise and business acumen to every project. I thrive at the intersection of innovation and practical implementation, transforming ambitious ideas into scalable solutions that drive real business value.',
        'Technical Product Manager | AI Enthusiast | Process Innovator',
        'Results-driven Technical Product Manager with a proven track record of driving innovation and operational excellence across diverse industries. I specialize in translating complex technical concepts into actionable business strategies, with particular expertise in AI/ML integration, process automation, and enterprise software development. My approach combines data-driven decision making with creative problem-solving to deliver products that not only meet user needs but exceed business expectations.',
        13,
        2011
      ) ON CONFLICT (id) DO NOTHING
    `;

    // Projects
    const projects = [
      {
        name: 'Crypto Trading Bot',
        status: 'Active Development',
        description: 'AI-powered cryptocurrency trading system with sentiment analysis',
        stage: 'mvp',
        progress: 65,
        experimental: true,
        technologies: ['Python', 'OpenAI', 'React', 'TensorFlow'],
        features: [
          'Real-time market sentiment analysis',
          'Automated trading strategies',
          'Risk management protocols',
          'Performance analytics dashboard'
        ]
      },
      {
        name: 'Konnosaur Social Platform',
        status: 'Scaling Phase',
        description: 'Professional networking platform for knowledge sharing',
        stage: 'production',
        progress: 100,
        technologies: ['Next.js', 'PostgreSQL', 'Redis', 'AWS'],
        features: [
          'Expert matching algorithm',
          'Video consultation booking',
          'Knowledge marketplace',
          'Reputation system'
        ]
      },
      {
        name: 'This Portfolio Site',
        status: 'Live',
        description: 'Next.js portfolio with real-time trading bot demo',
        stage: 'production',
        progress: 100,
        technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Recharts'],
        features: [
          'Interactive trading simulation',
          'Dynamic project showcases',
          'Responsive design',
          'SEO optimized'
        ]
      }
    ];

    for (const project of projects) {
      const result = await sql`
        INSERT INTO projects (
          name, status, description, stage, progress, experimental
        ) VALUES (
          ${project.name}, ${project.status}, ${project.description},
          ${project.stage}, ${project.progress}, ${project.experimental}
        ) RETURNING id
      `;
      
      const projectId = result.rows[0].id;
      
      // Add technologies
      for (const tech of project.technologies) {
        await sql`
          INSERT INTO project_technologies (project_id, technology)
          VALUES (${projectId}, ${tech})
        `;
      }
      
      // Add features
      for (let i = 0; i < project.features.length; i++) {
        await sql`
          INSERT INTO project_features (project_id, feature, display_order)
          VALUES (${projectId}, ${project.features[i]}, ${i})
        `;
      }
    }

    // Work Experience
    const experiences = [
      {
        title: 'Business Process Analyst',
        company: 'Blue Origin',
        startDate: '2022-01-01',
        isCurrent: true,
        responsibilities: [
          'Led cross-functional teams in implementing enterprise-wide process improvements',
          'Developed data-driven dashboards reducing decision-making time by 40%',
          'Architected automated workflows saving 1,000+ manual hours annually',
          'Managed stakeholder relationships across engineering, operations, and executive teams'
        ]
      },
      {
        title: 'Business Process Analyst',
        company: 'Chelan P.U.D.',
        startDate: '2017-11-01',
        endDate: '2021-12-31',
        responsibilities: [
          'Spearheaded digital transformation initiatives across multiple departments',
          'Designed and implemented process optimization strategies improving efficiency by 35%',
          'Created comprehensive documentation and training programs for new systems',
          'Collaborated with IT teams to develop custom software solutions'
        ]
      }
    ];

    for (const exp of experiences) {
      const result = await sql`
        INSERT INTO work_experience (
          title, company, start_date, end_date, is_current
        ) VALUES (
          ${exp.title}, ${exp.company}, ${exp.startDate},
          ${exp.endDate || null}, ${exp.isCurrent || false}
        ) RETURNING id
      `;
      
      const expId = result.rows[0].id;
      
      for (let i = 0; i < exp.responsibilities.length; i++) {
        await sql`
          INSERT INTO work_responsibilities (
            experience_id, responsibility, display_order
          ) VALUES (${expId}, ${exp.responsibilities[i]}, ${i})
        `;
      }
    }

    // Education
    const education = [
      {
        degree: 'Master of Business Administration (MBA)',
        school: 'University of Washington',
        graduationYear: '2018',
        concentration: 'Technology Management',
        courses: [
          'Product Strategy & Innovation',
          'Data Analytics for Business',
          'Financial Analysis & Valuation',
          'Operations & Supply Chain Management'
        ]
      },
      {
        degree: 'Bachelor of Science',
        school: 'Central Washington University',
        graduationYear: '2009',
        courses: [
          'Software Engineering',
          'Database Management',
          'Statistics & Probability',
          'Project Management'
        ]
      }
    ];

    for (const edu of education) {
      const result = await sql`
        INSERT INTO education (
          degree, school, graduation_year, concentration
        ) VALUES (
          ${edu.degree}, ${edu.school}, ${edu.graduationYear},
          ${edu.concentration || null}
        ) RETURNING id
      `;
      
      const eduId = result.rows[0].id;
      
      for (let i = 0; i < edu.courses.length; i++) {
        await sql`
          INSERT INTO education_courses (
            education_id, course_name, display_order
          ) VALUES (${eduId}, ${edu.courses[i]}, ${i})
        `;
      }
    }

    // Tech Stack
    const techStack = [
      { name: 'React', icon: '⚛️', level: 85, category: 'Frontend' },
      { name: 'Node.js', icon: '🟢', level: 80, category: 'Backend' },
      { name: 'Python', icon: '🐍', level: 90, category: 'Backend' },
      { name: 'OpenAI', icon: '🤖', level: 75, category: 'AI/ML' },
      { name: 'PostgreSQL', icon: '🐘', level: 85, category: 'Database' },
      { name: 'Docker', icon: '🐳', level: 70, category: 'DevOps' }
    ];

    for (let i = 0; i < techStack.length; i++) {
      await sql`
        INSERT INTO tech_stack (
          name, icon, level, category, display_order, show_in_portfolio
        ) VALUES (
          ${techStack[i].name}, ${techStack[i].icon}, ${techStack[i].level},
          ${techStack[i].category}, ${i}, true
        ) ON CONFLICT DO NOTHING
      `;
    }

    // Skill Categories
    const skillCategories = [
      {
        name: 'Process Management',
        icon: 'Settings',
        skills: [
          'Business Process Modeling',
          'Workflow Automation',
          'Continuous Improvement',
          'Change Management'
        ]
      },
      {
        name: 'Leadership & Management',
        icon: 'Users',
        skills: [
          'Cross-functional Team Leadership',
          'Stakeholder Management',
          'Strategic Planning',
          'Agile/Scrum Methodologies'
        ]
      },
      {
        name: 'Technical & Analytical',
        icon: 'Code',
        skills: [
          'Python & JavaScript',
          'Data Analysis & Visualization',
          'Machine Learning & AI',
          'Cloud Architecture (AWS)'
        ]
      }
    ];

    for (const category of skillCategories) {
      const result = await sql`
        INSERT INTO skill_categories (name, icon)
        VALUES (${category.name}, ${category.icon})
        RETURNING id
      `;
      
      const catId = result.rows[0].id;
      
      for (let i = 0; i < category.skills.length; i++) {
        await sql`
          INSERT INTO skills (category_id, skill_name, display_order)
          VALUES (${catId}, ${category.skills[i]}, ${i})
        `;
      }
    }

    // Process & Strategy
    const processStrategies = [
      {
        title: 'Agile Product Management',
        description: 'Leading cross-functional teams using Agile methodologies to deliver high-impact products on schedule',
        icon: 'Zap'
      },
      {
        title: 'Data-Driven Decision Making',
        description: 'Leveraging analytics and metrics to guide product strategy and measure success',
        icon: 'TrendingUp'
      },
      {
        title: 'Risk Management',
        description: 'Proactively identifying and mitigating technical and business risks throughout the product lifecycle',
        icon: 'Shield'
      },
      {
        title: 'Innovation & Ideation',
        description: 'Fostering creative problem-solving and exploring emerging technologies to drive competitive advantage',
        icon: 'Lightbulb'
      }
    ];

    for (let i = 0; i < processStrategies.length; i++) {
      await sql`
        INSERT INTO process_strategy (
          title, description, icon, display_order
        ) VALUES (
          ${processStrategies[i].title}, ${processStrategies[i].description},
          ${processStrategies[i].icon}, ${i}
        ) ON CONFLICT DO NOTHING
      `;
    }

    // Site Metrics
    await sql`
      INSERT INTO site_metrics (performance_score, deploy_date)
      VALUES (98, CURRENT_DATE)
      ON CONFLICT (id) DO NOTHING
    `;

    console.log('Database seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
}