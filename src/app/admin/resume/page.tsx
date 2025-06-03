import Link from 'next/link';
import { Plus, Edit, Trash2, Calendar, Briefcase, GraduationCap, ChevronRight } from 'lucide-react';
import { getWorkExperience, getEducation } from '@/lib/database/db';

export default async function ResumePage() {
  const [experience, education] = await Promise.all([
    getWorkExperience(),
    getEducation(),
  ]);

  const formatDate = (date: Date | string | undefined, isCurrent?: boolean) => {
    if (isCurrent) return 'Present';
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Resume Management</h1>
        <p className="text-gray-400">Manage your work experience and education</p>
      </div>

      {/* Work Experience Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            Work Experience
          </h2>
          <Link
            href="/admin/resume/experience/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </Link>
        </div>

        {experience.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No work experience added yet</p>
            <Link
              href="/admin/resume/experience/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Experience
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{exp.title}</h3>
                    <p className="text-blue-400 font-medium mb-2">{exp.company}</p>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate, exp.isCurrent)}
                      </span>
                    </div>
                    
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <ul className="space-y-2">
                        {exp.responsibilities.slice(0, 2).map((resp, idx) => (
                          <li key={idx} className="flex items-start text-gray-400 text-sm">
                            <ChevronRight className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{resp.responsibility}</span>
                          </li>
                        ))}
                        {exp.responsibilities.length > 2 && (
                          <li className="text-gray-500 text-sm italic ml-6">
                            +{exp.responsibilities.length - 2} more responsibilities
                          </li>
                        )}
                      </ul>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/admin/resume/experience/${exp.id}/edit`}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit experience"
                    >
                      <Edit className="w-4 h-4 text-gray-300" />
                    </Link>
                    <button
                      className="p-2 bg-gray-800 hover:bg-red-900/50 rounded-lg transition-colors"
                      title="Delete experience"
                    >
                      <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-400" />
            Education
          </h2>
          <Link
            href="/admin/resume/education/new"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </Link>
        </div>

        {education.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400 mb-4">No education added yet</p>
            <Link
              href="/admin/resume/education/new"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Education
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">{edu.degree}</h3>
                    <p className="text-purple-400 font-medium mb-2">{edu.school}</p>
                    {edu.graduationYear && (
                      <p className="text-gray-400 text-sm mb-2">Graduated {edu.graduationYear}</p>
                    )}
                    {edu.concentration && (
                      <p className="text-gray-400 text-sm mb-4">
                        Concentration: {edu.concentration}
                      </p>
                    )}
                    
                    {edu.courses && edu.courses.length > 0 && (
                      <div>
                        <p className="text-gray-500 text-sm mb-2">Key Courses:</p>
                        <div className="flex flex-wrap gap-2">
                          {edu.courses.slice(0, 4).map((course, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded">
                              {course.courseName}
                            </span>
                          ))}
                          {edu.courses.length > 4 && (
                            <span className="px-2 py-1 text-gray-500 text-xs">
                              +{edu.courses.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/admin/resume/education/${edu.id}/edit`}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit education"
                    >
                      <Edit className="w-4 h-4 text-gray-300" />
                    </Link>
                    <button
                      className="p-2 bg-gray-800 hover:bg-red-900/50 rounded-lg transition-colors"
                      title="Delete education"
                    >
                      <Trash2 className="w-4 h-4 text-gray-300 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}