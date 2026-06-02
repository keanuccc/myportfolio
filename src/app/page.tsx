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
            <WhoAmI />
            <Projects />
            <Blog />
            <Contact />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
