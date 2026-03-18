import CaseStudyForm from '@/components/admin/CaseStudyForm';

export default function NewCaseStudy() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">New Case Study</h1>
      <CaseStudyForm isNew />
    </div>
  );
}
