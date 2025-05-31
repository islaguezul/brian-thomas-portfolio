'use client'

import React, { memo } from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Link } from '@react-pdf/renderer';

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
    marginBottom: 20,
    borderBottom: '2pt solid #2563eb',
    paddingBottom: 15,
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
    marginBottom: 16,
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
    marginBottom: 14,
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
    marginBottom: 8,
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
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: 8,
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

// PDF Document Component with correct information
const PDFDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>Brian Thomas</Text>
        <Text style={styles.title}>Technical Product Manager</Text>
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Link style={styles.link} src="https://briantpm.com">
              briantpm.com
            </Link>
          </View>
          <View style={styles.contactItem}>
            <Text>brianjamesthomas@outlook.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Text>(707) 536-8398</Text>
          </View>
          <View style={styles.contactItem}>
            <Text>Tacoma, WA</Text>
          </View>
          <View style={styles.contactItem}>
            <Link style={styles.link} src="https://linkedin.com/in/brianjamesthomas">
              linkedin.com/in/brianjamesthomas
            </Link>
          </View>
        </View>
      </View>

      {/* Executive Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.paragraph}>
          I thrive at the intersection of technology, process, and people—translating ambiguity into clarity and vision into reality. 
          At Blue Origin, I&apos;ve built bridges between engineering and operations, launching process frameworks that empower teams to 
          deliver at scale. My experience spans the full product and process lifecycle: from mapping out the Engines business unit&apos;s 
          first end-to-end workflows, to championing BPMN 2.0 adoption, to guiding data-driven improvements that shape both culture 
          and outcomes. Whether I&apos;m architecting a new tool, aligning stakeholders, or untangling legacy systems, I bring curiosity, 
          rigor, and a bias for action. I&apos;m passionate about building systems and products that not only work, but make work better 
          for everyone involved.
        </Text>
      </View>

      {/* Professional Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        
        {/* Blue Origin */}
        <View style={styles.experienceItem}>
          <View wrap={false}>
            <View style={styles.jobHeader}>
              <View style={styles.jobTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>Business Process Analyst</Text>
                  <Text style={styles.company}>Blue Origin</Text>
                </View>
                <Text style={styles.date}>JAN 2022 - Present</Text>
              </View>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Partnered with engineering, operations, and leadership to define and optimize end-to-end business processes 
                for the Engines business unit, enabling scalable and efficient delivery of technical products and programs.
              </Text>
            </View>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Led requirements gathering, process mapping, and stakeholder alignment for the Engines Build Manifest tool, 
              directly supporting product development and lifecycle management.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Developed and implemented a process maturity model and roadmap, driving continuous improvement and supporting 
              the adoption of new technologies and systems.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Conducted gap analyses and provided actionable recommendations that informed product roadmaps and operational 
              strategies for mission-critical programs.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Evangelized BPMN 2.0 and best practices across the organization, fostering a culture of process excellence 
              and data-driven decision making.
            </Text>
          </View>
        </View>

        {/* Chelan PUD */}
        <View style={styles.experienceItem}>
          <View wrap={false}>
            <View style={styles.jobHeader}>
              <View style={styles.jobTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>Business Process Analyst</Text>
                  <Text style={styles.company}>Chelan P.U.D.</Text>
                </View>
                <Text style={styles.date}>NOV 2017 - DEC 2021</Text>
              </View>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Pioneered a comprehensive process management function, crafting roadmaps, risk assessments, and models to guide 
                organizational improvements, including renewable energy projects and high-load systems. Results included adopting 
                ERPs with enterprise architectures instead of inefficient manual process changes and complicated organizational 
                change management projects.
              </Text>
            </View>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Drove process maturity through actionable insights, leveraging data visualization tools such as Tableau and 
              Power BI for project outcomes in utility infrastructure and energy systems.
            </Text>
          </View>
        </View>

        {/* Microsoft */}
        <View style={styles.experienceItem}>
          <View wrap={false}>
            <View style={styles.jobHeader}>
              <View style={styles.jobTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>Technical Product/Project Manager (ERP Systems)</Text>
                  <Text style={styles.company}>Microsoft</Text>
                </View>
                <Text style={styles.date}>JAN 2016 - OCT 2017</Text>
              </View>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Managed the team&apos;s work structure, burndown tracking, and dependencies, using both Visual Studio Online 
                (customer-side) and MS Project (vendor).
              </Text>
            </View>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Collaborated with value-stream and scrum leads, and technical project managers, to define and model process 
              and inform users&apos; change impacts. This resulted in informed change management strategy and a smooth transition 
              of process to align with SAP out-of-the-box processes.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Worked alongside clients to create and execute a user-centric system adoption strategies for various projects, 
              including a worldwide SAP implementation impacting 21,000+ global employees, across multiple project and product 
              management roles.
            </Text>
          </View>
        </View>

        {/* Mosaic */}
        <View style={styles.experienceItem}>
          <View wrap={false}>
            <View style={styles.jobHeader}>
              <View style={styles.jobTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>Technical Product/Project Manager</Text>
                  <Text style={styles.company}>Mosaic</Text>
                </View>
                <Text style={styles.date}>JUL 2011 - JAN 2016</Text>
              </View>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Managed boutique mobile, onsite, and cloud-based SaaS app design and definition, and responsible for the full 
                SDLC project, from requirements to support, for customized performance improvement and knowledge management software.
              </Text>
            </View>
          </View>
          <View style={styles.subBulletPoint}>
            <Text style={styles.bullet}>◦</Text>
            <Text style={styles.bulletText}>
              Supported organizational change programs by delivering training strategies, curriculum, courseware, custom 
              software solutions, and training facilitation.
            </Text>
          </View>
          <View style={styles.subBulletPoint}>
            <Text style={styles.bullet}>◦</Text>
            <Text style={styles.bulletText}>
              Project revenues ranged from $20K - $3M.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Conducted front-end training needs and occupational analyses, consulted on program management, created workshops, 
              and developed program management models to ensure client success with their organizational development programs.
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Developed solutions with metrics aligned to business needs. Programs delivered impacted 15 client organizations, 
              in multiple business functions, including safety and compliance, finance & accounting, customer service, projects, 
              supply chain management, operations, human resources, procurement, business intelligence, etc.
            </Text>
          </View>
        </View>
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
            <View style={styles.educationItem}>
              <Text style={styles.degree}>Bachelor of Arts</Text>
              <Text style={styles.school}>University of Washington • 2013</Text>
            </View>
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

// Memoize the PDF document to prevent re-generation
const MemoizedPDFDocument = memo(PDFDocument);

// Export component that can be used in the Resume component
const PDFResumeDownload = memo(() => {
  // Create document instance once
  const documentInstance = <MemoizedPDFDocument />;
  
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
            Download Professional PDF
          </>
        )
      }
    </PDFDownloadLink>
  );
});

PDFResumeDownload.displayName = 'PDFResumeDownload';

// Default export for dynamic import
export default PDFResumeDownload;