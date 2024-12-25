export default function About() {
  return (
    <section id="about" className="min-h-screen bg-white py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[200px,1fr] gap-12">
          {/* Left side - Label */}
          <div>
            <div className="flex items-center gap-4">
              <div className="w-[6px] h-[6px] rounded-full bg-blue-500" />
              <span className="text-sm uppercase tracking-wider text-gray-500">
                about
              </span>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-16">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight max-w-4xl text-gray-900">
              Empowering Students to Solve Real-World Problems Through Data
            </h2>

            <div className="max-w-3xl">
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Datathon is UCI&apos;s premier data science competition where
                students work in teams to solve real-world problems using data
                analytics and machine learning. Over the course of 36 hours,
                participants will have the opportunity to work with unique
                datasets, receive mentorship from industry professionals, and
                compete for prizes.
              </p>

              <p className="text-xl text-gray-700 leading-relaxed">
                Inspired by the Seven Wonders of the World, this year&apos;s
                Datathon challenges participants to analyze and derive insights
                from datasets related to world heritage sites, cultural
                landmarks, and historical monuments. Join us in exploring how
                data science can help preserve and understand humanity&apos;s
                greatest achievements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
