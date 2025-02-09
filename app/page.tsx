import {
  Landing,
  About,
  Stats,
  Sponsors,
  FAQ,
  Contact,
} from "./components/home";
import Navbar from "./components/home/Navbar";
import { Divider } from "./components/ui/Divider";

export default function Home() {
  return (
    <>
      <Landing />
      <Navbar />
      <main className="relative">
        <div className="h-screen pointer-events-none" />{" "}
        {/* Spacer for first viewport */}
        <div className="bg-white relative min-h-[200vh]">
          {" "}
          {/* Added min-height to ensure enough content */}
          <About />
          <Divider />
          <Stats />
          <Divider />
          <Sponsors />
          <Divider />
          <FAQ />
          <Divider />
          <Contact />
        </div>
      </main>
    </>
  );
}
