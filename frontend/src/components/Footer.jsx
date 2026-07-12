import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGithub, FaDiscord, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-[#0a0f1c] border-t border-slate-800/50 pt-16 pb-8 px-6 text-sm relative z-10 w-full mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2">
           <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="ASTRA Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold tracking-wide text-white">ASTRA</span>
          </div>
          <p className="text-slate-500 max-w-xs leading-relaxed">The Complete Competitive Programming Companion</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-slate-300">Platform</h4>
          <ul className="space-y-2 text-slate-500">
            <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link to="/sheets" className="hover:text-white transition-colors">Sheets</Link></li>
            <li><Link to="/contest-radar" className="hover:text-white transition-colors">Contest Radar</Link></li>
            <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
            <li><Link to="/revision" className="hover:text-white transition-colors">Revision</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-slate-300">Resources</h4>
          <ul className="space-y-2 text-slate-500">
            <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" className="hover:text-white transition-colors">API</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-slate-300">Company</h4>
          <ul className="space-y-2 text-slate-500">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-800 text-slate-500">
        <p>© 2026 ASTRA. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" className="transition-colors"><FaGithub size={18} /></motion.a>
          <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" className="transition-colors"><FaDiscord size={18} /></motion.a>
          <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" className="transition-colors"><FaTwitter size={18} /></motion.a>
          <motion.a whileHover={{ y: -3, color: '#fff' }} href="#" className="transition-colors"><FaLinkedin size={18} /></motion.a>
        </div>
      </div>
    </footer>
  );
}
