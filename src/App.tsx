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
    <div className="h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col relative">
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
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

