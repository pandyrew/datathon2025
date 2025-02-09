import {
  Landing,
  About,
  Stats,
  Sponsors,
  FAQ,
  Contact,
} from "./components/home";

export const APPLICATIONS_OPEN_DATE = new Date("2024-03-01T00:00:00Z");

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
