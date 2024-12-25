import Landing from "./components/Landing";
import About from "./components/About";
import Stats from "./components/Stats";
import Sponsors from "./components/Sponsors";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";

export default function Home() {
  return (
    <main>
      <Landing />
      <About />
      <Stats />
      <Sponsors />
      <FAQ />
      <Contact />
    </main>
  );
}
