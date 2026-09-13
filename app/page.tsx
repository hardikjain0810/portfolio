import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { BackToTop } from "@/components/effects/BackToTop";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <Nav />

      {/* relative + z-10 keeps content above the cursor glow layer */}
      <main className="relative z-10 flex-1">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>

      <Footer />
      <BackToTop />
      <ChatWidget />
    </>
  );
}
