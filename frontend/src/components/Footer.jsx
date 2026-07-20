import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGithub } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#0a0f1c] border-t border-slate-800/50 pt-16 pb-8 px-6 text-sm relative z-10 w-full mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8 mb-12">
        <div className="md:max-w-sm">
           <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="ASTRA Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-wide text-white">ASTRA</span>
          </div>
          <p className="text-slate-500 leading-relaxed">The Complete Competitive Programming Companion</p>
        </div>
        
        <div className="md:text-right">
          <h4 className="font-semibold mb-4 text-slate-300">Platform Features</h4>
          <ul className="flex flex-col sm:flex-row sm:justify-end flex-wrap gap-4 sm:gap-6 text-slate-500">
            <li><Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Dashboard</Link></li>
            <li><Link to="/sheets" className="hover:text-indigo-400 transition-colors">DSA Sheets</Link></li>
            <li><Link to="/contest-radar" className="hover:text-indigo-400 transition-colors">Contest Radar</Link></li>
            <li><Link to="/analytics" className="hover:text-indigo-400 transition-colors">Analytics</Link></li>
            <li><Link to="/revision" className="hover:text-indigo-400 transition-colors">Intelligent Revision</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800 text-slate-500">
        <p>© {new Date().getFullYear()} ASTRA. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <motion.a 
            whileHover={{ y: -3, color: '#fff' }} 
            href="https://github.com/ananyatiwari05/ASTRA"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors flex items-center gap-2 hover:text-indigo-400"
          >
            <FaGithub size={18} />
            <span className="font-medium text-xs">View on GitHub</span>
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
