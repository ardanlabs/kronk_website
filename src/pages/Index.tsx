import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { SdkSection } from "@/components/SdkSection";
import { InstallSection } from "@/components/InstallSection";
import { PlatformSupport } from "@/components/PlatformSupport";
import { ExamplesList } from "@/components/ExamplesList";
import { Footer } from "@/components/Footer";

const Index = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <SdkSection />
      <InstallSection />
      <PlatformSupport />
      <ExamplesList />
      <Footer />
    </div>
  );
};

export default Index;
