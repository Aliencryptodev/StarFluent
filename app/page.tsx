import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-56 h-56 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-500 rounded-full blur-2xl opacity-25 animate-pulse"></div>
      </div>

      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }}></div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="pt-16 pb-8 text-center">
          <h1 className="text-6xl font-bold text-white tracking-wider mb-4 drop-shadow-2xl">
            STARCRAFT
          </h1>
          <h2 className="text-3xl font-semibold text-gray-300 tracking-wide mb-6">
            TOWER DEFENSE
          </h2>
          <div className="w-64 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 mx-auto rounded-full"></div>
          
          <p className="mt-8 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Command your race in epic tower defense battles. Build, upgrade, and unleash devastating 
            defensive structures against endless waves of enemies.
          </p>
        </header>

        <div className="flex-1 flex flex-col justify-center px-8">
          <section className="mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-yellow-900/40 
                              rounded-3xl p-12 border border-gray-600/50 shadow-2xl backdrop-blur-sm
                              transform hover:scale-105 transition-all duration-300">
                
                <div className="text-center">
                  <div className="text-5xl mb-6">🏆</div>
                  <h3 className="text-4xl font-bold text-white mb-6 tracking-wide">
                    CAMPAIGN MODE
                  </h3>
                  <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Experience the complete story across three unique races. Master strategic 
                    tower placement, unlock powerful upgrades, and earn perfect scores through 
                    challenging campaign missions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-black/30 rounded-xl p-4 border border-blue-500/30">
                      <div className="text-3xl mb-2">🛡️</div>
                      <div className="font-semibold text-blue-400">Human</div>
                      <div className="text-sm text-gray-400">Technology & Firepower</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 border border-purple-500/30">
                      <div className="text-3xl mb-2">🧬</div>
                      <div className="font-semibold text-purple-400">Sliver</div>
                      <div className="text-sm text-gray-400">Biological Evolution</div>
                    </div>
                    <div className="bg-black/30 rounded-xl p-4 border border-yellow-500/30">
                      <div className="text-3xl mb-2">🔮</div>
                      <div className="font-semibold text-yellow-400">Alien</div>
                      <div className="text-sm text-gray-400">Psionic Energy</div>
                    </div>
                  </div>
                  
                  <Link 
                    href="/campaign"
                    className="inline-flex items-center gap-3 px-12 py-4 
                               bg-gradient-to-r from-blue-600 to-purple-600 
                               hover:from-blue-500 hover:to-purple-500 
                               text-white font-bold text-xl rounded-xl 
                               shadow-lg shadow-blue-500/25 hover:shadow-blue-400/50 
                               transform hover:scale-105 transition-all duration-300 
                               border-2 border-blue-400/50"
                  >
                    <span>START CAMPAIGN</span>
                    <span className="text-2xl">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="pb-8 text-center">
          <p className="text-gray-500 text-sm">
            Built with Next.js • Powered by Fluent Network
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Web3 integration coming soon with NFT race unlocks
          </p>
        </footer>
      </div>
    </main>
  );
}
