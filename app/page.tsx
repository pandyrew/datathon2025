import {
  Landing,
  About,
  Stats,
  Sponsors,
  FAQ,
  Contact,
} from "./components/home";

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
