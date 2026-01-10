import AboutSection from '@/components/about/AboutSection';

export const metadata = {
  title: 'About Us - House of Transformation Church',
  description: 'Learn about our mission, vision, history, and leadership at House of Transformation Church',
};

export default function AboutPage() {
  return (
    <div className="pt-20">
      <AboutSection />
    </div>
  );
}