import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from 'framer-motion';
import { 
  MapPin, 
  Globe, 
  Youtube, 
  Mic, 
  FileText, 
  ArrowUpRight, 
  Twitter, 
  Linkedin, 
  Github, 
  Mail,
  PlayCircle,
  Calendar
} from 'lucide-react';

// --- DATA MOCKUP ---
// In a real app, this would come from a CMS or API
const PORTFOLIO_DATA = {
  profile: {
    name: "Chris Dabatos",
    role: "Developer Advocate",
    location: "Las Vegas, NV",
    tagline: "Bridging the gap between code and community.",
    bio: "I turn complex technical concepts into accessible stories. Whether I'm live-coding on stream, writing deep-dives, or speaking on stage, my goal is to empower developers to build better software."
  },
  content: [
    {
      id: 1,
      type: 'video',
      title: "Mastering React Server Components",
      platform: "YouTube",
      url: "#",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
      date: "Oct 2023"
    },
    {
      id: 2,
      type: 'blog',
      title: "State Management in 2024: A Guide",
      platform: "Dev.to",
      url: "#",
      summary: "Why we are moving away from global stores to atomic state.",
      date: "Nov 2023"
    },
    {
      id: 3,
      type: 'talk',
      title: "The Future of DevRel",
      event: "TechWiki Conf",
      location: "San Francisco, CA",
      hasRecording: true,
      recordingUrl: "#",
      date: "Sep 2023"
    },
    {
      id: 4,
      type: 'talk',
      title: "Building Community in a Remote World",
      event: "DevConnect LV",
      location: "Las Vegas, NV",
      hasRecording: false, // This triggers the 'In Person Only' UI
      date: "Aug 2023"
    },
    {
      id: 5,
      type: 'video',
      title: "Live Coding: Building a SaaS in 1 Hour",
      platform: "YouTube",
      url: "#",
      thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
      date: "July 2023"
    },
     {
      id: 6,
      type: 'blog',
      title: "Why I moved to Las Vegas as a Dev",
      platform: "Medium",
      url: "#",
      summary: "The tech scene in the desert is heating up more than the weather.",
      date: "June 2023"
    }
  ]
};

// --- COMPONENTS ---

// 1. Spotlight Card Effect
// This creates the "flashlight" effect on hover
function SpotlightCard({ children, className = "" }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`group relative border border-slate-800 bg-slate-900/50 overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(147, 51, 234, 0.15),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}

// 2. TypeBadge Component
const TypeBadge = ({ type }) => {
  const styles = {
    video: "bg-red-500/10 text-red-400 border-red-500/20",
    blog: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    talk: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  };
  
  const icons = {
    video: <Youtube size={12} />,
    blog: <FileText size={12} />,
    talk: <Mic size={12} />
  };

  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[type]}`}>
      {icons[type]}
      {type.toUpperCase()}
    </span>
  );
};

// 3. Content Cards
const ContentCard = ({ item }) => {
  return (
    <SpotlightCard className="h-full flex flex-col transition-transform hover:scale-[1.02]">
      {/* Image Section for Videos */}
      {item.type === 'video' && (
        <div className="relative h-48 w-full overflow-hidden bg-slate-950">
          <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3 backdrop-blur-sm border border-white/10">
              <PlayCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <TypeBadge type={item.type} />
          <span className="text-slate-500 text-xs font-mono">{item.date}</span>
        </div>

        <h3 className="text-xl font-semibold text-slate-100 mb-2 leading-snug group-hover:text-purple-400 transition-colors">
          {item.title}
        </h3>

        {/* Talk Specific Details */}
        {item.type === 'talk' && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Globe size={14} /> <span>{item.event}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin size={14} /> <span>{item.location}</span>
            </div>
            {!item.hasRecording && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300">
                 <Calendar size={12} /> In-Person / No Recording
              </div>
            )}
          </div>
        )}

        {/* Blog Specific Details */}
        {item.type === 'blog' && (
          <p className="text-slate-400 text-sm line-clamp-3 mb-4">
            {item.summary}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center text-sm font-medium text-slate-300 group-hover:text-white">
          {item.type === 'talk' && !item.hasRecording ? 'View Event Details' : 'Check it out'}
          <ArrowUpRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </div>
      </div>
    </SpotlightCard>
  );
};

// 4. Stats Component
const Stat = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-2xl font-bold text-slate-100">{value}</span>
    <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
  </div>
);

// --- MAIN APP ---

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter logic
  const filteredContent = activeFilter === 'all' 
    ? PORTFOLIO_DATA.content 
    : PORTFOLIO_DATA.content.filter(item => item.type === activeFilter);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30">
      
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        
        {/* HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sm text-purple-400 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>
                Available for speaking
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-bold tracking-tight text-white mb-6">
                Hello, I'm <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                  {PORTFOLIO_DATA.profile.name}.
                </span>
              </h1>
              
              <p className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-8">
                {PORTFOLIO_DATA.profile.tagline} Based in <span className="text-white font-medium">{PORTFOLIO_DATA.profile.location}</span>, 
                {PORTFOLIO_DATA.profile.bio}
              </p>

              <div className="flex gap-4">
                <SocialBtn icon={<Twitter size={20} />} href="#" />
                <SocialBtn icon={<Github size={20} />} href="#" />
                <SocialBtn icon={<Linkedin size={20} />} href="#" />
                <SocialBtn icon={<Mail size={20} />} href="mailto:hello@chris.com" />
              </div>
            </motion.div>
          </div>

          {/* Stats / Sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-end">
            <SpotlightCard className="p-8 bg-slate-900/80 backdrop-blur-md">
              <div className="grid grid-cols-2 gap-8">
                <Stat label="Talks Given" value="25+" />
                <Stat label="Content Views" value="500k+" />
                <Stat label="Years Exp" value="8+" />
                <Stat label="Coffee" value="∞" />
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800">
                <p className="text-sm text-slate-400 mb-4">Need a speaker for your next event?</p>
                <button className="w-full py-3 bg-white text-slate-950 font-bold rounded-lg hover:bg-purple-50 transition-colors">
                  Contact Me
                </button>
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* FILTER TABS */}
        <div className="sticky top-4 z-50 mb-12 flex justify-center">
          <div className="p-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-full shadow-2xl shadow-black/50 inline-flex gap-1">
            {['all', 'video', 'blog', 'talk'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}s
              </button>
            ))}
          </div>
        </div>

        {/* MASONRY GRID */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredContent.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={item.id}
            >
              <ContentCard item={item} />
            </motion.div>
          ))}
        </motion.div>

        {/* FOOTER */}
        <footer className="mt-32 border-t border-slate-900 py-12 text-center text-slate-600 text-sm">
          <p>&copy; {new Date().getFullYear()} Chris Dabatos. Built with React & Tailwind.</p>
          <p className="mt-2">Las Vegas, NV</p>
        </footer>

      </main>
    </div>
  );
}

// Helper Component
function SocialBtn({ icon, href }) {
  return (
    <a 
      href={href}
      className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all"
    >
      {icon}
    </a>
  );
}