import { motion } from 'framer-motion';

const ConfigSection = ({ title, icon, description, children }) => {
    return (
        <motion.div
            className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="p-5 border-b border-gray-700 flex items-start gap-3">
                <div className="text-2xl mt-1">{icon}</div>
                <div>
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="text-gray-400 text-sm">{description}</p>
                </div>
            </div>
            <div className="p-5">
                {children}
            </div>
        </motion.div>
    );
};

export default ConfigSection;