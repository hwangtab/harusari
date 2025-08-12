'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';

interface AboutWindowProps {
  windowId: string;
}

export default function AboutWindow({ windowId }: AboutWindowProps) {
  const { closeWindow } = useStore();

  const handleClose = () => {
    closeWindow(windowId);
  };

  return (
    <div className="h-full bg-gray-200 border-2 border-gray-400 flex flex-col items-center justify-center p-6 relative">
      {/* 3D Dialog Effect */}
      <div 
        className="absolute inset-0 border-t-2 border-l-2 border-white border-r-2 border-b-2 border-r-gray-500 border-b-gray-500"
        style={{
          boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.8), inset -1px -1px 0px rgba(0,0,0,0.3)'
        }}
      ></div>
      
      <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
        {/* Album Icon/Logo placeholder */}
        <div className="w-16 h-16 bg-album-purple border-2 border-retro-black flex items-center justify-center">
          <span className="text-white font-bold text-xs">하루살이</span>
        </div>
        
        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-retro-black">하루살이 프로젝트 2</h2>
          <h3 className="text-base text-retro-black">알 수 없는 느낌</h3>
        </div>
        
        {/* Separator */}
        <div className="w-64 h-px bg-gray-400 border-t border-gray-500 border-b border-white"></div>
        
        {/* Copyright */}
        <div className="text-xs text-retro-black leading-relaxed max-w-xs">
          <p className="mb-2">© & ℗ Harusali Project, 2025.</p>
          <p className="text-xs">All rights of the producer and of the owner of the work reproduced reserved. Unauthorised copying, hiring, lending, public performance and broadcasting of this recording prohibited.</p>
        </div>
        
        {/* Separator */}
        <div className="w-64 h-px bg-gray-400 border-t border-gray-500 border-b border-white"></div>
        
        {/* Developer Info */}
        <div className="text-sm text-retro-black space-y-1">
          <p className="font-medium">Website Developed by</p>
          <p className="font-bold">황경하 (Hwang Kyung Ha)</p>
          <p className="text-xs">hwangtab@gmail.com</p>
        </div>
        
        {/* Tech Stack */}
        <div className="text-xs text-gray-600 text-center">
          <p>Built with Next.js, TypeScript,</p>
          <p>Tailwind CSS, and Framer Motion</p>
        </div>
        
        {/* OK Button */}
        <motion.button
          className="mt-4 px-6 py-2 bg-gray-200 border-2 border-gray-400 border-t-white border-l-white border-r-gray-500 border-b-gray-500 text-sm font-medium text-retro-black hover:bg-gray-300 active:border-t-gray-500 active:border-l-gray-500 active:border-r-white active:border-b-white"
          onClick={handleClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            boxShadow: '1px 1px 0px rgba(0,0,0,0.3)'
          }}
        >
          OK
        </motion.button>
      </div>
    </div>
  );
}