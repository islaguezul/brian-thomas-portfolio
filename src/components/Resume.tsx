'use client'

import React from 'react';
import { Download, Mail, Phone, MapPin, Globe, Database, Users, BarChart3 } from 'lucide-react';

const Resume: React.FC = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Print Button */}
        <div className="mb-8 text-center print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download / Print Resume
          </button>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-8 print:bg-white print:text-black">
          {/* Professional Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-4 text-blue-400 print:text-gray-800">Brian Thomas</h1>
            <p className="text-xl text-slate-300 mb-6 print:text-gray-600">Senior Operations Manager & Technical Leader</p>
            
            <div className="grid md:grid-cols-2 gap-4 text-slate-300 print:text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>brianjamesthomas@outlook.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>(707) 536-8398</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Tacoma, WA</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>linkedin.com/in/brianjamesthomas</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4 text-blue-400 print:text-gray-800 border-b border-slate-700 pb-2">Executive Summary</h3>
            <p className="text-slate-300 leading-relaxed">
              I thrive at the intersection of technology, process, and people—translating ambiguity into clarity and vision into reality. At Blue Origin, I’ve built bridges between engineering and operations, launching process frameworks that empower teams to deliver at scale. My experience spans the full product and process lifecycle: from mapping out the Engines business unit’s first end-to-end workflows, to championing BPMN 2.0 adoption, to guiding data-driven improvements that shape both culture and outcomes. Whether I’m architecting a new tool, aligning stakeholders, or untangling legacy systems, I bring curiosity, rigor, and a bias for action. I’m passionate about building systems and products that not only work, but make work better for everyone involved.
            </p>
          </div>

          {/* Professional Experience */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-6 text-blue-400 print:text-gray-800 border-b border-slate-700 pb-2">Professional Experience</h3>
            
            {/* Blue Origin */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-xl font-bold text-green-400 print:text-gray-800">Business Process Analyst</h4>
                  <p className="text-lg text-blue-300 print:text-gray-700">Blue Origin</p>
                </div>
                <span className="text-slate-400 print:text-gray-600">JAN 2022 - Present</span>
              </div>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li>Partnered with engineering, operations, and leadership to define and optimize end-to-end business processes for the Engines business unit, enabling scalable and efficient delivery of technical products and programs.</li>
                <li>Led requirements gathering, process mapping, and stakeholder alignment for the Engines Build Manifest tool, directly supporting product development and lifecycle management.</li>
                <li>Developed and implemented a process maturity model and roadmap, driving continuous improvement and supporting the adoption of new technologies and systems.</li>
                <li>Conducted gap analyses and provided actionable recommendations that informed product roadmaps and operational strategies for mission-critical programs.</li>
                <li>Evangelized BPMN 2.0 and best practices across the organization, fostering a culture of process excellence and data-driven decision making.</li>
              </ul>
            </div>

            {/* Chelan PUD */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-xl font-bold text-green-400 print:text-gray-800">Business Process Analyst</h4>
                  <p className="text-lg text-blue-300 print:text-gray-700">Chelan P.U.D.</p>
                </div>
                <span className="text-slate-400 print:text-gray-600">NOV 2017 - DEC 2021</span>
              </div>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li>Pioneered a comprehensive process management function, crafting roadmaps, risk assessments, and models to guide organizational improvements, including renewable energy projects and high-load systems. Results included adopting ERPs with enterprise architectures instead of inefficient manual process changes and complicated organizational change management projects</li>
                <li>Drove process maturity through actionable insights, leveraging data visualization tools such as Tableau and Power BI for project outcomes in utility infrastructure and energy systems</li>
              </ul>
            </div>

            {/* Change Management Consultant */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-xl font-bold text-green-400 print:text-gray-800">Technical Product/Project Manager (ERP Systems)</h4>
                  <p className="text-lg text-blue-300 print:text-gray-700">Microsoft</p>
                </div>
                <span className="text-slate-400 print:text-gray-600">JAN 2016 - OCT 2017</span>
              </div>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li>Managed the team&apos;s work structure, burndown tracking, and dependencies, using both Visual Studio Online (customer-side) and MS Project (vendor)</li>
                <li>Collaborated with value-stream and scrum leads, and technical project managers, to define and model process and inform users&apos; change impacts. This resulted in informed change management strategy and a smooth transition of process to align with SAP out-of-the-box processes</li>
                <li>Worked alongside clients to create and execute a user-centric system adoption strategies for various projects, including a worldwide SAP implementation impacting 21,000+ global employees, across multiple project and product management roles</li>
              </ul>
            </div>

            {/* Mosaic */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-xl font-bold text-green-400 print:text-gray-800">Technical Product/Project Manager</h4>
                  <p className="text-lg text-blue-300 print:text-gray-700">Mosaic</p>
                </div>
                <span className="text-slate-400 print:text-gray-600">JUL 2011 - JAN 2016</span>
              </div>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li>Managed boutique mobile, onsite, and cloud-based SaaS app design and definition, and responsible for the full SDLC project, from requirements to support, for customized performance improvement and knowledge management software
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Supported organizational change programs by delivering training strategies, curriculum, courseware, custom software solutions, and training facilitation</li>
                    <li>Project revenues ranged from $20K - $3M</li>
                  </ul>
                </li>
                <li>Conducted front-end training needs and occupational analyses, consulted on program management, created workshops, and developed program management models to ensure client success with their organizational development programs</li>
                <li>Developed solutions with metrics aligned to business needs. Programs delivered impacted 15 client organizations, in multiple business functions, including safety and compliance, finance & accounting, customer service, projects, supply chain management, operations, human resources, procurement, business intelligence, etc</li>
              </ul>
            </div>

            {/* U.S. Coast Guard */}
            <div className="mb-8">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-xl font-bold text-green-400 print:text-gray-800">Multiple Positions</h4>
                  <p className="text-lg text-blue-300 print:text-gray-700">U.S. Coast Guard</p>
                </div>
                <span className="text-slate-400 print:text-gray-600">2002 - 2011</span>
              </div>
              <ul className="list-disc pl-5 text-slate-300 space-y-2">
                <li>Master Training Specialist (2009-2011)</li>
                <li>Training Program Manager (2005-2009)</li>
                <li>Telecommunications Center Supervisor (2002-2005)</li>
              </ul>
            </div>
          </div>

          {/* Education */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-6 text-blue-400 print:text-gray-800 border-b border-slate-700 pb-2">Education</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* MBA */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700 print:bg-white print:border-gray-300">
                <h4 className="text-lg font-bold mb-3 text-green-400 print:text-gray-800">Master of Business Administration (MBA)</h4>
                <p className="text-blue-300 print:text-gray-700 mb-2">University of Washington - Foster School of Business</p>
                <p className="text-slate-400 print:text-gray-600 mb-4">2018</p>
                <div>
                  <p className="text-slate-300 text-sm mb-2 print:text-gray-700">Concentration: Operations Management & Strategic Leadership</p>
                  <p className="text-slate-300 text-sm mb-2 print:text-gray-700">Relevant coursework includes:</p>
                  <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1 print:text-gray-700">
                    <li>Supply Chain Management</li>
                    <li>Operations Strategy</li>
                    <li>Financial Analysis & Decision Making</li>
                    <li>Leadership & Organizational Behavior</li>
                    <li>Project Management</li>
                  </ul>
                </div>
              </div>

              {/* Bachelor's */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700 print:bg-white print:border-gray-300">
                <h4 className="text-lg font-bold mb-3 text-green-400 print:text-gray-800">Bachelor of Science</h4>
                <p className="text-blue-300 print:text-gray-700 mb-2">Central Washington University</p>
                <p className="text-slate-400 print:text-gray-600 mb-4">2009</p>
                <div>
                  <p className="text-slate-300 text-sm mb-2 print:text-gray-700">Major: Industrial & Engineering Technology</p>
                  <p className="text-slate-300 text-sm mb-2 print:text-gray-700">Relevant courses include:</p>
                  <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1 print:text-gray-700">
                    <li>Labor Relations</li>
                    <li>Management Training & Development</li>
                    <li>Human Resource Management</li>
                    <li>Organizational Behavior</li>
                    <li>Cross-Cultural Management</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Skills Section */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-6 text-blue-400 print:text-gray-800 border-b border-slate-700 pb-2">Professional Skills</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Process Management */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700 print:bg-white print:border-gray-300">
                <h4 className="text-lg font-bold mb-4 text-green-400 print:text-gray-800 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Process Management
                </h4>
                <ul className="list-disc pl-5 text-slate-300 space-y-2 print:text-gray-700">
                  <li>BPMN 2.0 Modeling</li>
                  <li>Process Maturity Models</li>
                  <li>Process Analysis & Design</li>
                  <li>Change Management</li>
                  <li>Kaizen / Lean Methodologies</li>
                </ul>
              </div>

              {/* Leadership */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700 print:bg-white print:border-gray-300">
                <h4 className="text-lg font-bold mb-4 text-green-400 print:text-gray-800 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Leadership & Management
                </h4>
                <ul className="list-disc pl-5 text-slate-300 space-y-2 print:text-gray-700">
                  <li>Team Leadership & Development</li>
                  <li>Strategic Planning</li>
                  <li>Performance Management</li>
                  <li>Cross-functional Collaboration</li>
                  <li>Stakeholder Management</li>
                </ul>
              </div>

              {/* Technical */}
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700 print:bg-white print:border-gray-300">
                <h4 className="text-lg font-bold mb-4 text-green-400 print:text-gray-800 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Technical & Analytical
                </h4>
                <ul className="list-disc pl-5 text-slate-300 space-y-2 print:text-gray-700">
                  <li>Data Analysis & Reporting</li>
                  <li>SCADA Systems</li>
                  <li>Risk Assessment</li>
                  <li>Quality Management</li>
                  <li>Regulatory Compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;