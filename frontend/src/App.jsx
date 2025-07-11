import { motion } from 'framer-motion';
import { SiStremio } from "react-icons/si";
import { useEffect, useState, useRef } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Digit from './components/Digit';

// Helper function to calculate time left
const calculateTimeLeft = (expirationDate) => {
  const difference = +new Date(expirationDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  } else {
    timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return timeLeft;
};

function App() {
  const manifestUrl = `/manifest.json`;
  const expirationDateTime = new Date('2025-07-23T00:00:00Z');
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(expirationDateTime));
  const timerRef = useRef(null);

  const handleSwitchNow = () => {
    const deepLink = 'https://rating-aggregator.elfhosted.com/configure/';
    window.location.href = deepLink;
  };

  const isExpired = timeLeft.days <= 0 && timeLeft.hours <= 0 && timeLeft.minutes <= 0 && timeLeft.seconds <= 0;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 bg-[#0f172a] text-white relative overflow-hidden">
      <Analytics />
      <SpeedInsights />

      <div className="gradient-bg-1"></div>
      <div className="gradient-bg-2"></div>
      <div className="shape-1"></div>
      <div className="shape-2"></div>

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-10 p-8 rounded-3xl backdrop-blur-lg bg-white/5 shadow-2xl border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <header className="mb-8 space-y-4">
          <motion.h1
            className="text-4xl sm:text-6xl font-extrabold text-white leading-tight drop-shadow-lg"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            🚨 Upgrade Required: Legacy Version Detected
          </motion.h1>

          <p className="text-xl sm:text-3xl text-gray-200 font-medium">
            Your current version is running on the old Vercel deployment — it's being retired.
          </p>

          {isExpired ? (
            <motion.p
              className="text-2xl sm:text-4xl text-red-400 font-bold mt-4 text-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
            >
              🚨 VERSION DEACTIVATED! PLEASE UPGRADE. 🚨
            </motion.p>
          ) : (
            <>
              <motion.p
                className="text-2xl sm:text-4xl text-yellow-300 font-bold mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                🚀 Upgrade Now for Better Speed, Stability, and Future Features!
              </motion.p>
              <motion.p
                className="text-lg sm:text-xl text-blue-300 font-semibold mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                ⚠️ The Vercel-hosted version will stop receiving updates.<br className="sm:hidden" />
                Migrate to our optimized <span className="font-bold text-green-400">Elfhosted</span> instance for<br className="hidden sm:inline" />
                🛡️ Better reliability, 💨 faster loading, and 🔧 ongoing support.
              </motion.p>
            </>
          )}
        </header>

        <motion.div
          className="bg-purple-900/30 p-6 rounded-2xl mb-8 border border-purple-700/50 shadow-inner-xl flex flex-col items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-lg sm:text-xl text-gray-300 mb-4 font-semibold uppercase tracking-wide">
            Countdown Until Deactivation
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-2 gap-y-4 sm:gap-x-4 text-white text-center">
            {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
              <div key={unit} className="flex flex-col items-center">
                <div className="flex">
                  <Digit value={String(timeLeft[unit]).padStart(2, '0')[0]} />
                  <Digit value={String(timeLeft[unit]).padStart(2, '0')[1]} />
                </div>
                <span className="text-sm sm:text-base font-normal mt-2 opacity-80 uppercase">
                  {unit.charAt(0).toUpperCase() + unit.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.button
          onClick={handleSwitchNow}
          className="relative px-12 py-6 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white text-3xl sm:text-5xl font-bold uppercase shadow-2xl overflow-hidden
                     flex items-center justify-center gap-4 cursor-pointer block mx-auto
                     hover:from-green-600 hover:to-teal-600
                     transform hover:scale-105 transition-transform duration-300 ease-in-out group"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 1,
            type: "spring",
            stiffness: 120,
            damping: 10
          }}
          whileHover={{
            scale: 1.1,
            boxShadow: "0 0 50px rgba(0, 255, 128, 0.8), 0 0 100px rgba(0, 200, 100, 0.6)",
            transition: { type: "spring", stiffness: 300, damping: 10 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <SiStremio className="text-4xl sm:text-6xl group-hover:rotate-12 transition-transform duration-300" />
          <span className="relative z-10">MIGRATE TO ELFHOSTED</span>
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-white opacity-0"
            animate={{ opacity: [0, 0.8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.button>

        <motion.footer
          className="text-center mt-20 text-gray-500 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          Made with ❤️ for Stremio users.
        </motion.footer>
      </motion.div>
    </div>
  );
}

export default App;
