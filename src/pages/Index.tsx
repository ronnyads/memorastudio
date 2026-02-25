import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import BeforeAfterGallery from "@/components/landing/BeforeAfterGallery";
import ThemesGallery from "@/components/landing/ThemesGallery";
import HowItWorks from "@/components/landing/HowItWorks";
import ServicesSection from "@/components/landing/ServicesSection";
import PricingPreview from "@/components/landing/PricingPreview";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <BeforeAfterGallery />
      <ThemesGallery />
      <HowItWorks />
      <ServicesSection />
      <PricingPreview />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
