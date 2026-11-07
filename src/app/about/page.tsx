import type { Metadata } from 'next';
import AboutUsSection from '@/components/AboutUsSection';

export const metadata: Metadata = {
  title: 'من نحن | فريق عمل وتطوير منصة سَنَد',
  description: 'تعرف على رسالة منصة سَنَد وفريق البرمجة والتطوير بإشراف المهندس محمد حجو. تواصل مباشر وشراء شفاف لمرة واحدة للعائلات في سوريا.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 py-6 sm:py-12 w-full overflow-x-hidden">
      <AboutUsSection />
    </div>
  );
}
