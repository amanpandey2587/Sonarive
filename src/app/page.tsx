import { HeroSection } from '@/components/ui/sections/heroSection';
import { FeaturesSection } from '@/components/ui/sections/featuresSection';
import { PageContainer } from '@/components/ui/common/pageContainer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Footer } from '@/components/ui/layout/footer';
export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      {/* <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-background">
        <PageContainer className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl mb-6">
              Ready to Understand Your Scans?
            </h2>
            <p className="text-lg text-muted-foreground md:text-xl mb-8 max-w-2xl mx-auto">
              Take control of your health information. Upload your medical scan today and let MediScan AI provide you with clear, actionable insights.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all hover:shadow-xl transform hover:scale-105">
              <Link href="/scan">Get Started Now</Link>
            </Button>
        </PageContainer>
      </section> */}
      <Footer/>
    </>
  );
}
