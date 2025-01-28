import React from 'react';
import { Spotlight } from './ui/Spotlight';
import { TextGenerateEffect } from './ui/TextGenerateEffect';

const Hero = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-darkBlue text-white">
      {/* Spotlight effects */} {/* Left Side (mix of colours!) */}
      <Spotlight
        className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
        fill="white"
      />
      <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="blue" />
      <Spotlight
        className="-top-40 -right-10 md:-left-32 md:-top-20 h-screen"
        fill="red"
      />
      <Spotlight className="top-28 left-80 h-[80vh] w-[50vw]" fill="green" />
      {/* Nav Bar */}
      <div className="absolute top-8 w-full flex justify-between items-center px-12">
        <h1 className="text-lg font-thin">WAJEEH ALAM</h1>
      </div>
      {/* Main Heading */}
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold">
          Hey, I'm <span className="text-purple">Wajeeh</span>! 👋
        </h1>
        <TextGenerateEffect
          className="font-light text-lg sm:text-2xl animate-pulse"
          words="Engineering Ideas Into Code"
        />
      </div>
      {/* Buttons / Status */}
      <div className="mt-4 flex items-center gap-4">
        <div
          className="px-4 py-2 rounded-lg flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #161A31, #06091F' }}
        >
          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
          <p>Offline</p>
        </div>
        <button
          className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 
          bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors 
          focus:outline-none hover:ring-2 focus:ring-slate-400 hover:ring-offset-1 focus:ring-offset-slate-50"
        >
          View My Blog
        </button>
        <div
          className="px-4 py-2 rounded-lg flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #161A31, #06091F' }}
        >
          <span className="text-sm">🕒</span>
          <p>7:48 PM</p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
