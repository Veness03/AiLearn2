import React, { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, BrainCircuit, Zap, ArrowRight, Activity } from "lucide-react";
import { Button } from "./ui";

export function Landing() {
  const [topic, setTopic] = useState("");
  const navigate = useNavigate();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      navigate(`/learn/new?q=${encodeURIComponent(topic)}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center -mt-16 px-4">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-indigo-400/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * -200],
                x: [null, (Math.random() - 0.5) * 200],
                opacity: [0.3, 0.8, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-4xl w-full text-center space-y-8"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Generate intelligent learning modules instantly</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
            Master Any Topic with <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              AI-Powered Learning
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light">
            Enter a subject, and our system will generate a comprehensive module with 
            key concepts, flashcards, and interactive quizzes in seconds.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="max-w-xl mx-auto w-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:ring-2 focus-within:ring-violet-500/50">
            <div className="pl-4">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g., Quantum Physics, Roman Empire, Python Decorators..."
              className="w-full bg-transparent border-none text-white placeholder:text-slate-500 px-4 py-3 focus:outline-none text-lg font-medium"
            />
            <Button 
              type="submit" 
              size="lg"
              className="rounded-xl bg-white text-black hover:bg-slate-200 gap-2 h-12 px-6 font-bold shadow-lg shadow-white/5"
              disabled={!topic.trim()}
            >
              Start Learning
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-5xl mx-auto">
          {[
            { icon: BrainCircuit, title: "Smart Summaries", desc: "Instantly grasp core concepts with AI-distilled overviews." },
            { icon: Zap, title: "Active Recall", desc: "Interactive flashcards and quizzes test your retention." },
            { icon: Activity, title: "Track Progress", desc: "Monitor your accuracy, streaks, and learning trends over time." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + (i * 0.1) }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl text-center shadow-2xl"
            >
              <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
