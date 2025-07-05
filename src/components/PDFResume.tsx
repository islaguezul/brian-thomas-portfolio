'use client'

import React, { memo } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Link } from '@react-pdf/renderer';
import type { WorkExperience, Education, PersonalInfo } from '@/lib/database/types';
import type { Tenant } from '@/middleware';
import { formatMonthYearShort } from '@/lib/utils/dateFormatter';

// Define modern styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1f2937',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 15,
    borderBottom: '2pt solid #2563eb',
    paddingBottom: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    fontSize: 9,
    color: '#4b5563',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    textTransform: 'uppercase',
  },
  paragraph: {
    marginBottom: 8,
    textAlign: 'justify',
    color: '#374151',
    fontSize: 9.5,
    lineHeight: 1.5,
  },
  experienceItem: {
    marginBottom: 12,
    breakInside: 'avoid',
    breakBefore: 'auto',
    breakAfter: 'auto',
  },
  jobHeader: {
    marginBottom: 6,
    breakInside: 'avoid',
    breakAfter: 'avoid',
  },
  jobTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  company: {
    fontSize: 10,
    color: '#2563eb',
    marginBottom: 4,
  },
  date: {
    fontSize: 9,
    color: '#6b7280',
    whiteSpace: 'nowrap',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  bullet: {
    width: 10,
    fontSize: 8,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  subBulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 20,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  column: {
    flex: 1,
  },
  skillCategory: {
    marginBottom: 6,
  },
  skillTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 3,
  },
  skillList: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.3,
  },
  educationItem: {
    marginBottom: 6,
  },
  jobHeaderWithFirstBullet: {
    breakInside: 'avoid',
  },
  degree: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  school: {
    fontSize: 9,
    color: '#4b5563',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
});

interface PDFDocumentProps {
  personalInfo?: PersonalInfo | null;
  experience: WorkExperience[];
  education: Education[];
  tenant: Tenant;
}

// PDF Document Component with correct information
const PDFDocument = ({ personalInfo, experience, education, tenant }: PDFDocumentProps) => {
  const websiteUrl = tenant === 'external' ? 'https://brianthomastpm.com' : 'https://briantpm.com';
  console.log('PDFDocument: Rendering with tenant:', tenant, 'URL:', websiteUrl);
  
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{personalInfo?.name || 'Brian Thomas'}</Text>
        <Text style={styles.title}>{personalInfo?.title || 'Technical Product Manager'}</Text>
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Link style={styles.link} src={websiteUrl}>
              {websiteUrl.replace('https://', '')}
            </Link>
          </View>
          {personalInfo?.email && (
            <View style={styles.contactItem}>
              <Text>{personalInfo.email}</Text>
            </View>
          )}
          {personalInfo?.phone && (
            <View style={styles.contactItem}>
              <Text>{personalInfo.phone}</Text>
            </View>
          )}
          {personalInfo?.location && (
            <View style={styles.contactItem}>
              <Text>{personalInfo.location}</Text>
            </View>
          )}
          {personalInfo?.linkedinUrl ? (
            <View style={styles.contactItem}>
              <Link style={styles.link} src={personalInfo.linkedinUrl}>
                {personalInfo.linkedinUrl.replace('https://', '')}
              </Link>
            </View>
          ) : (
            <View style={styles.contactItem}>
              <Link style={styles.link} src="https://linkedin.com/in/brianjamesthomas">
                linkedin.com/in/brianjamesthomas
              </Link>
            </View>
          )}
        </View>
      </View>

      {/* Summary */}
      {personalInfo?.executiveSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.paragraph}>
            {personalInfo.executiveSummary}
          </Text>
        </View>
      )}

      {/* Professional Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        
        {experience.map((exp) => {
          const formatDate = (date: string | Date | undefined | null, isCurrent: boolean | undefined) => {
            if (isCurrent) return 'Present';
            if (!date) return '';
            const formatted = formatMonthYearShort(date instanceof Date ? date.toISOString() : date);
            return formatted.toUpperCase();
          };

          // Check if this is the Operations Specialist role with sub-roles
          const isOperationsSpecialist = exp.title === 'Operations Specialist, First Class' && 
            exp.responsibilities?.[0]?.responsibility?.startsWith('Roles Include:');

          if (isOperationsSpecialist && exp.responsibilities) {
            // Special handling for Operations Specialist with multiple roles
            return (
              <View key={exp.id} style={styles.experienceItem}>
                <View wrap={false}>
                  <View style={styles.jobHeader}>
                    <View style={styles.jobTitleRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle}>{exp.title}</Text>
                        <Text style={styles.company}>{exp.company}</Text>
                      </View>
                      <Text style={styles.date}>
                        {formatDate(exp.start_date, false)} - {formatDate(exp.end_date, exp.is_current)}
                      </Text>
                    </View>
                  </View>
                  {/* "Roles Include:" without bullet */}
                  <Text style={[styles.bulletText, { paddingLeft: 0, marginBottom: 4 }]}>
                    Roles Include:
                  </Text>
                </View>
                {/* Sub-roles as bullets */}
                <View style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>
                    Program Manager{'\n'}2005 – 2011
                  </Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>
                    Telecommunications Center Supervisor{'\n'}2002-2005
                  </Text>
                </View>
              </View>
            );
          }

          // Standard experience item rendering
          return (
            <View key={exp.id} style={styles.experienceItem}>
              <View wrap={false}>
                <View style={styles.jobHeader}>
                  <View style={styles.jobTitleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.jobTitle}>{exp.title}</Text>
                      <Text style={styles.company}>{exp.company}</Text>
                    </View>
                    <Text style={styles.date}>
                      {formatDate(exp.start_date, false)} - {formatDate(exp.end_date, exp.is_current)}
                    </Text>
                  </View>
                </View>
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <View style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>
                      {exp.responsibilities[0].responsibility}
                    </Text>
                  </View>
                )}
              </View>
              {exp.responsibilities && exp.responsibilities.slice(1).map((resp) => (
                <View key={resp.id} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>
                    {resp.responsibility}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>

      {/* Skills & Education in two columns */}
      <View style={styles.twoColumn}>
        {/* Skills Column */}
        <View style={styles.column}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Skills</Text>
            <View style={styles.skillCategory}>
              <Text style={styles.skillTitle}>Technical</Text>
              <Text style={styles.skillList}>
                • React/Next.js, Python, SQL{'\n'}
                • BPMN 2.0, Process Modeling{'\n'}
                • Tableau, Power BI{'\n'}
                • SAP, ERP Systems{'\n'}
                • API Integration
              </Text>
            </View>
            <View style={styles.skillCategory}>
              <Text style={styles.skillTitle}>Product & Process</Text>
              <Text style={styles.skillList}>
                • Product Lifecycle Management{'\n'}
                • Requirements Gathering{'\n'}
                • Stakeholder Alignment{'\n'}
                • Process Optimization{'\n'}
                • Change Management
              </Text>
            </View>
          </View>
        </View>

        {/* Education Column */}
        <View style={styles.column}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={styles.educationItem}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.school}>
                  {edu.school}{edu.graduation_year ? ` • ${edu.graduation_year}` : ''}
                </Text>
                {edu.concentration && (
                  <Text style={styles.school}>
                    Concentration: {edu.concentration}
                  </Text>
                )}
                {edu.courses && edu.courses.length > 0 && (
                  <Text style={[styles.school, { marginTop: 2 }]}>
                    Relevant coursework: {edu.courses.map(course => course.course_name).join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <Text style={styles.skillList}>
              • BPMN 2.0 Practitioner{'\n'}
              • Agile/Scrum Certified{'\n'}
              • Change Management{'\n'}
              • Data Visualization
            </Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
  );
};

// Memoize the PDF document to prevent re-generation
const MemoizedPDFDocument = memo(PDFDocument);

interface PDFResumeDownloadProps {
  personalInfo?: PersonalInfo | null;
  experience: WorkExperience[];
  education: Education[];
  tenant: Tenant;
}

// Export component that can be used in the Resume component
const PDFResumeDownload = memo(({ personalInfo, experience, education, tenant }: PDFResumeDownloadProps) => {
  console.log('PDFResumeDownload: Received tenant prop:', tenant);
  
  // Create document instance once
  const documentInstance = <MemoizedPDFDocument personalInfo={personalInfo} experience={experience} education={education} tenant={tenant} />;
  
  return (
    <PDFDownloadLink
      document={documentInstance}
      fileName="Brian_Thomas_Resume.pdf"
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
    >
      {({ loading }) =>
        loading ? 'Generating PDF...' : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF Résumé
          </>
        )
      }
    </PDFDownloadLink>
  );
});

PDFResumeDownload.displayName = 'PDFResumeDownload';

// Default export for dynamic import
export default PDFResumeDownload;