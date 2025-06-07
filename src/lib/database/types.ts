export interface PersonalInfo {
  id?: number;
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  bio?: string;
  tagline?: string;
  executiveSummary?: string;
  yearsExperience?: number;
  startYear?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Project {
  id?: number;
  name: string;
  status?: string;
  description?: string;
  detailedDescription?: string;
  stage: 'production' | 'mvp' | 'backend' | 'concept' | 'research' | 'legacy';
  progress: number;
  experimental?: boolean;
  legacy?: boolean;
  liveUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  displayOrder?: number;
  technologies?: string[];
  features?: ProjectFeature[];
  impacts?: ProjectImpact[];
  challenges?: ProjectChallenge[];
  outcomes?: ProjectOutcome[];
  screenshots?: ProjectScreenshot[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectFeature {
  id?: number;
  projectId?: number;
  feature: string;
  displayOrder?: number;
}

export interface ProjectImpact {
  id?: number;
  projectId?: number;
  metricKey: string;
  metricValue: string;
}

export interface ProjectChallenge {
  id?: number;
  projectId?: number;
  challenge: string;
  displayOrder?: number;
}

export interface ProjectOutcome {
  id?: number;
  projectId?: number;
  outcome: string;
  displayOrder?: number;
}

export interface ProjectScreenshot {
  id?: number;
  projectId?: number;
  filePath: string;
  altText?: string;
  displayOrder?: number;
  createdAt?: Date;
}

export interface WorkExperience {
  id?: number;
  title: string;
  company: string;
  startDate?: Date | string;
  endDate?: Date | string;
  start_date?: Date | string;
  end_date?: Date | string;
  isCurrent?: boolean;
  is_current?: boolean;
  responsibilities?: WorkResponsibility[];
  displayOrder?: number;
  display_order?: number;
  createdAt?: Date;
  created_at?: Date;
  updatedAt?: Date;
  updated_at?: Date;
}

export interface WorkResponsibility {
  id?: number;
  experienceId?: number;
  experience_id?: number;
  responsibility: string;
  displayOrder?: number;
  display_order?: number;
}

export interface Education {
  id?: number;
  degree: string;
  school: string;
  institution?: string;
  graduationYear?: string;
  graduation_year?: string;
  concentration?: string;
  courses?: EducationCourse[];
  displayOrder?: number;
  display_order?: number;
  createdAt?: Date;
  created_at?: Date;
  updatedAt?: Date;
  updated_at?: Date;
}

export interface EducationCourse {
  id?: number;
  educationId?: number;
  education_id?: number;
  courseName?: string;
  course_name?: string;
  name?: string;
  displayOrder?: number;
  display_order?: number;
}

export interface TechStackItem {
  id?: number;
  name: string;
  icon?: string;
  level?: number;
  category?: string;
  displayOrder?: number;
  showInPortfolio?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SkillCategory {
  id?: number;
  name: string;
  icon?: string;
  skills?: Skill[];
  displayOrder?: number;
}

export interface Skill {
  id?: number;
  categoryId?: number;
  skillName: string;
  displayOrder?: number;
}

export interface ProcessStrategy {
  id?: number;
  title: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SiteMetrics {
  id?: number;
  performanceScore?: number;
  deployDate?: Date | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminUser {
  id?: number;
  githubId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  createdAt?: Date;
  lastLogin?: Date;
}

// Product Management Metrics Types
export interface ProductMetricsSummary {
  id?: number;
  tenantId?: string;
  totalUsersImpacted?: number;
  totalRevenueInfluenced?: number;
  totalCostSavings?: number;
  totalEfficiencyGains?: number;
  totalNpsImprovement?: number;
  totalTeamMembersLed?: number;
  totalStakeholdersManaged?: number;
  totalProductsLaunched?: number;
  averageTimeToMarket?: number;
  featureAdoptionRate?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectProductMetrics {
  id?: number;
  projectId: number;
  tenantId?: string;
  // User Impact
  usersImpacted?: number;
  userGrowthRate?: number;
  dauMauRatio?: number;
  retentionRate?: number;
  // Business Impact
  revenueImpact?: number;
  costSavings?: number;
  roiPercentage?: number;
  paybackPeriodMonths?: number;
  // Product Performance
  launchDate?: Date | string;
  timeToMarketDays?: number;
  featureAdoptionRate?: number;
  npsScore?: number;
  npsImprovement?: number;
  customerSatisfaction?: number;
  // Technical Excellence
  performanceImprovement?: number;
  systemUptime?: number;
  deploymentFrequency?: string;
  leadTimeHours?: number;
  mttrMinutes?: number;
  // Team & Process
  teamSize?: number;
  stakeholdersCount?: number;
  crossFunctionalTeams?: number;
  sprintVelocityImprovement?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KeyAchievement {
  id?: number;
  tenantId?: string;
  title: string;
  metricValue: string;
  metricUnit?: string;
  context?: string;
  achievementDate?: Date | string;
  category: 'user_impact' | 'revenue' | 'efficiency' | 'leadership' | 'innovation';
  displayOrder?: number;
  isFeatured?: boolean;
  createdAt?: Date;
}

export interface ProductStrategy {
  id?: number;
  projectId: number;
  tenantId?: string;
  strategyType: 'vision' | 'goal' | 'initiative' | 'hypothesis' | 'experiment';
  description: string;
  successCriteria?: string;
  actualOutcome?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'validated' | 'invalidated';
  displayOrder?: number;
  createdAt?: Date;
}

export interface StakeholderImpact {
  id?: number;
  projectId: number;
  tenantId?: string;
  stakeholderType: string;
  impactDescription: string;
  satisfactionScore?: number;
  displayOrder?: number;
}

export interface ExpertiseRadarItem {
  id?: number;
  tenantId?: string;
  skillName: string;
  skillLevel: number; // 0-10 scale
  category?: string;
  description?: string;
  color?: string; // hex color for visualization
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}