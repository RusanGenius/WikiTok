/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useAppContext } from './store/AppContext';
import Feed from './components/Feed';
import Profile from './components/Profile';
import { AnimatePresence, motion } from 'motion/react';

function MainApp() {
  const { currentView } = useAppContext();
  
  return (
    <div className="h-screen w-full bg-[#09090b] text-white font-sans overflow-hidden flex items-center justify-center relative">
      {/* Immersive ambient blurred background lights for PC backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/20 via-black to-zinc-950/10 -z-10 hidden md:block" />
      <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[120px] -z-10 hidden md:block" />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[120px] -z-10 hidden md:block" />

      {/* Centered Device Viewport for PC, Full Screen on Mobile */}
      <div className={`w-full h-full md:h-[92vh] md:rounded-[32px] md:border md:border-white/10 md:shadow-[0_24px_60px_rgba(0,0,0,0.9)] bg-black overflow-hidden md:overflow-visible relative flex flex-col transition-all duration-300 ${
        currentView === 'feed' ? 'md:max-w-[506px]' : 'md:max-w-[1150px]'
      }`}>
        <AnimatePresence mode="wait">
          {currentView === 'feed' ? (
            <motion.div
              key="feed"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <Feed />
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <Profile />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

