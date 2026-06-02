import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import Hero from "@/components/Hero";
import WhoAmI from "@/components/WhoAmI";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import BackToTop from "@/components/BackToTop";
import WaveDivider from "@/components/WaveDivider";

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <div className="bg-bglight dark:bg-bgdark overflow-hidden">
        <div className="selection:bg-marrsgreen selection:text-bglight dark:selection:bg-carrigreen dark:selection:text-bgdark">
          <Header />
          <SideNav />
          <BackToTop />
          <main id="main">
            <Hero />
            <WaveDivider from="#f0f5fa" to="#ffffff" />
            <WhoAmI />
            <WaveDivider from="#ffffff" to="#f0f5fa" flip />
            <div className="bg-gradient-to-b from-bglight via-white to-bglight dark:from-bgdark dark:via-[#0a0f14] dark:to-bgdark">
              <Projects />
            </div>
            <WaveDivider from="#f0f5fa" to="#ffffff" />
            <Blog />
            <WaveDivider from="#ffffff" to="#f0f5fa" flip />
            <Contact />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
