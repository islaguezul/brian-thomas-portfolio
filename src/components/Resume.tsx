'use client'

import React, { memo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Download, Mail, Phone, MapPin, Globe, Database, Users, BarChart3 } from 'lucide-react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import type { WorkExperience, Education, PersonalInfo } from '@/lib/database/types';
import type { Tenant } from '@/middleware';
import { formatMonthYear } from '@/lib/utils/dateFormatter';

// Dynamically import PDF component to avoid SSR issues
const PDFResumeDownload = dynamic(
  () => import('./PDFResume'),
  { 
    ssr: false,
    loading: () => (
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 opacity-50 cursor-not-allowed">
        <Download className="w-5 h-5" />
        Loading PDF Generator...
      </button>
    )
  }
);

const Resume: React.FC = () => {
  const [experience, setExperience] = useState<WorkExperience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant>('internal');

  // Fetch experience data
  const fetchExperience = async () => {
    try {
      const response = await fetch('/api/resume/experience');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched experience data:', data);
        setExperience(data);
      } else {
        console.error('Failed to fetch experience:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching experience:', error);
    }
  };

  // Fetch education data
  const fetchEducation = async () => {
    try {
      const response = await fetch('/api/resume/education');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched education data:', data);
        setEducation(data);
      } else {
        console.error('Failed to fetch education:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching education:', error);
    }
  };

  // Fetch personal info data
  const fetchPersonalInfo = async () => {
    try {
      const response = await fetch('/api/personal');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched personal info:', data);
        setPersonalInfo(data);
      } else {
        console.error('Failed to fetch personal info:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching personal info:', error);
    }
  };

  // Real-time updates listener
  useRealtimeUpdates((message) => {
    if (message.type === 'content-update') {
      const contentType = message.data?.contentType;
      if (contentType === 'Work Experience') {
        fetchExperience();
      } else if (contentType === 'Education') {
        fetchEducation();
      } else if (contentType === 'Personal Info') {
        fetchPersonalInfo();
      }
    }
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Detect tenant from hostname and query params
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const searchParams = new URLSearchParams(window.location.search);
        const tenantOverride = searchParams.get('tenant');
        
        console.log('Resume: Detecting tenant from hostname:', hostname, 'Query param:', tenantOverride);
        
        // Check query parameter first (for local testing)
        if (tenantOverride === 'external') {
          console.log('Resume: Using external tenant from query param');
          setTenant('external');
        } else if (tenantOverride === 'internal') {
          console.log('Resume: Using internal tenant from query param');
          setTenant('internal');
        }
        // Then check hostname
        else if (hostname.includes('brianthomastpm')) {
          console.log('Resume: Detected external tenant from hostname');
          setTenant('external');
        } else {
          console.log('Resume: Defaulting to internal tenant');
          setTenant('internal');
        }
      }
      
      await Promise.all([fetchExperience(), fetchEducation(), fetchPersonalInfo()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="text-xl text-slate-400">Loading resume...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* PDF Download Button */}
        <div className="mb-8 text-center print:hidden">
          <PDFResumeDownload personalInfo={personalInfo} experience={experience} education={education} tenant={tenant} />
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-8 print:bg-white print:text-black">
          {/* Professional Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-2 text-blue-400 print:text-gray-800">Brian Thomas</h1>
            <p className="text-xl text-slate-300 mb-6 print:text-gray-600">Technical Product Manager</p>
            
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

          {/* Summary */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-4 text-blue-400 print:text-gray-800 border-b border-slate-700 pb-2">Summary</h3>
            <p className="text-slate-300 leading-relaxed">
              {personalInfo?.executiveSummary || "I thrive at the intersection of technology, process, and people—translating ambiguity into clarity and vision into reality. At Blue Origin, I've built bridges between engineering and operations, launching process frameworks that empower teams to deliver at scale. My experience spans the full product and process lifecycle: from mapping out the Engines business unit's first end-to-end workflows, to championing BPMN 2.0 adoption, to guiding data-driven improvements that shape both culture and outcomes. Whether I'm architecting a new tool, aligning stakeholders, or untangling legacy systems, I bring curiosity, rigor, and a bias for action. I'm passionate about building systems and products that not only work, but make work better for everyone involved."}
            </p>
          </div>

          {/* Professional Experience */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-6 text-blue-400 print:text-gray-800 border-b border-slate-700 pb-2">Professional Experience</h3>
            
            {experience.length === 0 ? (
              <p className="text-slate-400">No experience data available. Please add work experience in the admin panel.</p>
            ) : experience.map((job) => (
              <div key={job.id} className="mb-8">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xl font-bold text-green-400 print:text-gray-800">{job.title}</h4>
                    <p className="text-lg text-blue-300 print:text-gray-700">{job.company}</p>
                  </div>
                  <span className="text-slate-400 print:text-gray-600">
                    {formatMonthYear(job.start_date || null) || 'N/A'} - {
                      job.is_current ? 'Present' : (formatMonthYear(job.end_date || null) || 'Present')
                    }
                  </span>
                </div>
                <ul className="list-disc pl-5 text-slate-300 space-y-2">
                  {job.responsibilities && job.responsibilities.map((resp) => (
                    <li key={resp.id}>{resp.responsibility}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-6 text-blue-400 print:text-gray-800 border-b border-slate-700 pb-2">Education</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {education.length === 0 ? (
              <p className="text-slate-400 col-span-2 text-center">No education data available. Please add education in the admin panel.</p>
            ) : education.map((edu) => (
                <div key={edu.id} className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 border border-slate-700 print:bg-white print:border-gray-300">
                  <h4 className="text-lg font-bold mb-3 text-green-400 print:text-gray-800">{edu.degree}</h4>
                  <p className="text-blue-300 print:text-gray-700 mb-2">{edu.school}</p>
                  <p className="text-slate-400 print:text-gray-600 mb-4">{edu.graduationYear}</p>
                  {edu.concentration && (
                    <p className="text-slate-300 text-sm mb-2 print:text-gray-700">Concentration: {edu.concentration}</p>
                  )}
                  {edu.courses && edu.courses.length > 0 && (
                    <>
                      <p className="text-slate-300 text-sm mb-2 print:text-gray-700">Relevant coursework includes:</p>
                      <ul className="list-disc pl-5 text-slate-300 text-sm space-y-1 print:text-gray-700">
                        {edu.courses.map((course) => (
                          <li key={course.id}>{course.courseName}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Skills Section */}
          <div className="mb-10">
            <h3 className="text-2xl font-bold mb-6 text-blue-400 print:text-gray-800 border-b border-slate-700 pb-2">Professional Skills</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Process Management */}
              <div className="group bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 hover:bg-slate-700/30 transition-all border border-slate-700 print:bg-white print:border-gray-300">
                <div className="flex items-center mb-4">
                  <Database className="w-8 h-8 text-blue-400 mr-3 group-hover:scale-110 transition-transform print:text-gray-700" />
                  <h4 className="font-bold text-lg print:text-gray-800">Process Management</h4>
                </div>
                <ul className="text-slate-300 text-sm space-y-2 print:text-gray-700">
                  <li>• BPMN 2.0 Expert</li>
                  <li>• Process Mining & Analysis</li>
                  <li>• Workflow Automation</li>
                  <li>• Change Management</li>
                  <li>• Business Analysis</li>
                </ul>
              </div>

              {/* Product Leadership */}
              <div className="group bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 hover:bg-slate-700/30 transition-all border border-slate-700 print:bg-white print:border-gray-300">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-green-400 mr-3 group-hover:scale-110 transition-transform print:text-gray-700" />
                  <h4 className="font-bold text-lg print:text-gray-800">Product Leadership</h4>
                </div>
                <ul className="text-slate-300 text-sm space-y-2 print:text-gray-700">
                  <li>• Product Strategy</li>
                  <li>• Stakeholder Management</li>
                  <li>• Requirements Engineering</li>
                  <li>• Agile/Scrum Methods</li>
                  <li>• Technical Communication</li>
                </ul>
              </div>

              {/* Technical Skills */}
              <div className="group bg-slate-800/30 backdrop-blur-sm rounded-lg p-6 hover:bg-slate-700/30 transition-all border border-slate-700 print:bg-white print:border-gray-300">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-8 h-8 text-purple-400 mr-3 group-hover:scale-110 transition-transform print:text-gray-700" />
                  <h4 className="font-bold text-lg print:text-gray-800">Technical Skills</h4>
                </div>
                <ul className="text-slate-300 text-sm space-y-2 print:text-gray-700">
                  <li>• Data Analysis & Visualization</li>
                  <li>• API Integration</li>
                  <li>• SQL & Database Design</li>
                  <li>• Python Programming</li>
                  <li>• Enterprise Architecture</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Resume);