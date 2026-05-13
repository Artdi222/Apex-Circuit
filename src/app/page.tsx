import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  Car, 
  ShieldCheck, 
  ArrowRight, 
  Timer, 
  MapPin, 
  Users 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center overflow-hidden">
          {/* Background Video */}
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/videos/Hero.mp4" type="video/mp4" />
            </video>
            {/* Left-side overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/60 to-transparent" />
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <div className="max-w-3xl">

              <h1
                className="text-6xl font-extrabold tracking-tight text-white sm:text-8xl lg:text-9xl mb-8 animate-fade-up delay-100"
                style={{
                  textShadow:
                    '0 2px 4px rgba(0,0,0,0.9), 0 4px 16px rgba(0,0,0,0.8), 0 8px 40px rgba(0,0,0,0.6), 0 0 80px rgba(0,0,0,0.4)',
                }}
              >
                Master the <br />
                <span
                  className="text-blue-300"
                  style={{
                    textShadow:
                      '0 0 20px rgba(59,130,246,0.7), 0 2px 4px rgba(0,0,0,0.95), 0 4px 20px rgba(0,0,0,0.85)',
                  }}
                >
                  Nürburgring.
                </span>
              </h1>

              <p
                className="text-xl text-white mb-12 max-w-xl leading-relaxed animate-fade-up delay-200"
                style={{
                  textShadow:
                    '0 1px 3px rgba(0,0,0,0.95), 0 2px 12px rgba(0,0,0,0.85), 0 4px 30px rgba(0,0,0,0.7)',
                }}
              >
                Experience the &quot;Green Hell&quot; at APEX. Premium track sessions,
                professional-grade vehicle rentals, and top-tier safety equipment
                at the world&apos;s most demanding racing circuit.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up delay-300">
                <Button size="lg" className="h-14 px-8 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/30 active:scale-95 transition-all text-base font-bold">
                  <Link href="/schedule" className="flex items-center">
                    Book Your Session <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-2xl border-white/30 bg-black/20 text-white backdrop-blur-md hover:bg-black/30 active:scale-95 transition-all text-base font-bold">
                  <Link href="/vehicles">Explore the Fleet</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-base font-bold tracking-wider text-blue-600 uppercase mb-4">Why Choose APEX?</h2>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">Designed for those who live in the redline.</p>
            </div>

            <div className="grid gap-12 md:grid-cols-3">
              {[
                {
                  icon: Timer,
                  title: 'Real-time Scheduling',
                  desc: 'Our dynamic booking system lets you reserve slots instantly. No wait times, just drive.',
                  image: '/hero.png'
                },
                {
                  icon: Car,
                  title: 'Elite Vehicle Fleet',
                  desc: 'From GT3 powerhouses to nimble touring cars, our fleet is meticulously maintained for peak performance.',
                  image: '/fleet.png'
                },
                {
                  icon: ShieldCheck,
                  title: 'Pro Safety Gear',
                  desc: 'Safety is non-negotiable. We provide FIA-certified helmets, suits, and gear for every driver.',
                  image: '/gear.png'
                }
              ].map((feature, i) => (
                <div key={i} className="group relative">
                  <div className="relative h-64 w-full overflow-hidden rounded-3xl mb-8 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                    <Image src={feature.image} alt={feature.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                    <div className="absolute bottom-6 left-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nürburgring Map Section */}
        <section className="py-24 bg-gray-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <Image 
              src="/nurburgring.png" 
              alt="Track Background" 
              fill 
              className="object-contain grayscale brightness-100 scale-150" 
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-base font-bold tracking-wider text-blue-500 uppercase mb-4">The Legendary Circuit</h2>
                <h3 className="text-4xl lg:text-5xl font-extrabold text-white mb-8 tracking-tight">The Green Hell <br />Awaits.</h3>
                <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                  The Nürburgring Nordschleife isn't just a track, it's a 20.8km pilgrimage. 
                  With 73 corners and 300 meters of elevation change, it remains the ultimate 
                  test for man and machine.
                </p>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">20.8 km</div>
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">Track Length</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">73</div>
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">Corners</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">300m</div>
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">Elevation Change</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">1927</div>
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">Established</div>
                  </div>
                </div>
                
                <Button variant="outline" className="border-white/20 text-black hover:bg-white/90 rounded-xl px-8 h-12 font-bold transition-all">
                  Learn Track History
                </Button>
              </div>

              <div className="relative aspect-square lg:aspect-auto lg:h-[600px] bg-gray-900/50 rounded-[3rem] border border-white/10 p-12 backdrop-blur-md overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center p-8 transition-transform duration-700 group-hover:scale-110">
                   <Image
                      src="/nurburgring-circuit.png"
                      alt="Nürburgring Nordschleife Map"
                      width={800}
                      height={600}
                      className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(59,130,246,0.5)] filter brightness-200"
                    />
                </div>
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-white uppercase tracking-widest">Nürburgring Nordschleife</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-medium text-gray-300">Nürburg, Germany</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Track Access Levels */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-base font-bold tracking-wider text-blue-600 uppercase mb-4">Track Access</h2>
              <p className="text-4xl font-bold text-gray-900 tracking-tight">Choose Your Experience</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Open Track */}
              <div className="group bg-gray-50 rounded-[2.5rem] p-10 border border-gray-100 transition-all hover:shadow-2xl hover:bg-white hover:-translate-y-2">
                <div className="flex justify-between items-start mb-8">
                  <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-gray-900">$150<span className="text-sm font-normal text-gray-500">/hr</span></div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Starting Price</div>
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Open Track Session</h4>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Join the public "Touristenfahrten". A vibrant atmosphere where you share the 
                  track with other enthusiasts. Perfect for regular practice and social track days.
                </p>
                <ul className="space-y-3 mb-10">
                  {['Shared track access', 'Social atmosphere', 'Up to 6 cars per heat', 'Technical support available'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600">
                      <ShieldCheck className="h-4 w-4 text-green-500 mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full h-14 rounded-2xl bg-gray-900 text-white hover:bg-black font-bold">
                  <Link href="/schedule">Book Open Session</Link>
                </Button>
              </div>

              {/* Exclusive Track */}
              <div className="group bg-gray-900 rounded-[2.5rem] p-10 border border-white/5 transition-all hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-6 py-2 rounded-bl-2xl uppercase tracking-widest">
                  Premium
                </div>
                <div className="flex justify-between items-start mb-8">
                  <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                    <Timer className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white">$500<span className="text-sm font-normal text-gray-400">/hr</span></div>
                    <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Starting Price</div>
                  </div>
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">Exclusive Session</h4>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  The ultimate privilege. A private session with strictly limited drivers. 
                  Maximum focus, minimum traffic. Ideal for testing and performance refinement.
                </p>
                <ul className="space-y-3 mb-10">
                  {['Full private track access', 'Minimum traffic (1-2 cars)', 'Priority technical team', 'Telemetry analysis included'].map((item, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-300">
                      <ShieldCheck className="h-4 w-4 text-blue-500 mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full h-14 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-xl shadow-blue-600/30">
                  <Link href="/schedule">Book Exclusive Session</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Dashboard Style */}
        <section className="py-24 bg-gray-50 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="rounded-[3rem] bg-gray-900 p-12 lg:p-20 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px]" />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
                {[
                  { label: 'Vehicle Classes', val: '5+', sub: 'GT to Formula' },
                  { label: 'Session Max', val: '6', sub: 'Drivers per heat' },
                  { label: 'Available', val: '24/7', sub: 'Digital booking' },
                  { label: 'Safety Rating', val: 'A+', sub: 'Track certified' },
                ].map((stat, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className="text-5xl font-black text-white mb-2 font-mono tracking-tighter">{stat.val}</div>
                    <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className="text-xs text-gray-400">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="mt-20 pt-12 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold text-white">Ready to hit the track?</h3>
                  <p className="text-gray-400">Join over 1,000+ drivers who trust APEX for their racing needs.</p>
                </div>
                <Button asChild size="lg" className="rounded-2xl bg-white text-gray-900 hover:bg-gray-100 h-14 px-10 font-bold transition-transform active:scale-95">
                  <Link href="/register">Create Your Profile</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
