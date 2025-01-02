import StatsBox from "./components/StatsBox";

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
    <section className="min-h-screen bg-slate-100 pt-0 py-32 px-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
