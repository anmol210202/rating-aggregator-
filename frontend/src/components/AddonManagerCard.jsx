// components/AddonManagerCard.jsx
import { motion } from 'framer-motion';
import { RiArrowRightUpLine } from 'react-icons/ri';

const AddonManagerCard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-8"
        >
            <div className="absolute inset-0 bg-[radial-gradient(200px_at_70%_30%,#9333ea80_0%,transparent_100%)]" />
            <div className="relative z-10">
                <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
                        <RiArrowRightUpLine className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">Optimize Your Experience</h3>
                </div>
                <p className="mb-6 text-gray-300">
                    Ensure you see ratings first! Use the Stremio Addon Manager to pin
                    Ratings Aggregator at the top of your addons list for instant access.
                </p>
                <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://stremio-addon-manager.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/20"
                >
                    Open Addon Manager
                    <RiArrowRightUpLine className="h-4 w-4" />
                </motion.a>
            </div>
        </motion.div>
    );
};

export default AddonManagerCard;