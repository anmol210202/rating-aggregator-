import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const digitVariants = {
    initial: { y: -10, opacity: 0, scale: 0.8 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: 10, opacity: 0, scale: 0.8 },
};

const Digit = ({ value }) => {
    return (
        <div className="relative inline-flex flex-col items-center justify-center w-8 sm:w-12 h-10 sm:h-14 overflow-hidden rounded-md bg-purple-900/50 border border-purple-700/50 mr-1 last:mr-0">
            <AnimatePresence mode="wait">
                <motion.span
                    key={value} // Crucial for animating on value change
                    variants={digitVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.15, ease: "easeOut" }} // Fast transition for "flip" feel
                    className="absolute inset-0 flex items-center justify-center font-mono text-4xl sm:text-5xl text-white text-shadow-neon" // Custom neon glow
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    );
};

export default Digit;
