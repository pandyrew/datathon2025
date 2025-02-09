import StatsBox from "./components/StatsBox";
import { Blob } from "../ui/Blob";

const STATS = [
  {
    label: "TEAMS",
    value: "22",
  },
  {
    label: "PARTICIPANTS",
    value: "100+",
  },
  {
    label: "ROWS OF DATA ANALYZED",
    value: "20M+",
  },
  {
    label: "WORKSHOPS",
    value: "10",
  },
];

export default function Stats() {
  return (
    <section className="relative min-h-screen bg-white/90 py-32 px-6 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden z-[5]">
        <Blob className="bg-blue-200/20 top-[15%] right-[10%] w-[450px] h-[450px] animate-delay-3000" />
        <Blob className="bg-indigo-200/30 bottom-[10%] left-[5%] w-[400px] h-[400px] animate-delay-5000" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[500px,1fr] gap-12">
          {/* Left side - Label */}
          <div>
            <div className="flex items-center gap-4">
              <div className="w-[6px] h-[6px] rounded-full bg-indigo-400" />
              <span className="text-sm uppercase tracking-wider text-gray-500">
                stats
              </span>
            </div>
          </div>

          {/* Right side - Staggered Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-[10]">
            <div className="space-y-6">
              <StatsBox {...STATS[0]} delay={0} />
              <StatsBox {...STATS[2]} delay={0.2} />
            </div>
            <div className="space-y-6 md:mt-12">
              <StatsBox {...STATS[1]} delay={0.1} />
              <StatsBox {...STATS[3]} delay={0.3} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
