import { motion } from 'framer-motion';
import { RATING_SOURCES } from '../utils/constants';

const PreviewCard = ({ config }) => {
    const enabled = new Set(
        Object.entries(config.ratings)
            .filter(([_, val]) => val.enabled)
            .map(([key]) => key)
    );

    return (
        <motion.div
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap leading-6"
        >
            <div className="text-gray-500">───────────────</div>

            {RATING_SOURCES.map(({ id, label }) => {
                if (!enabled.has(id)) return null;

                if (Array.isArray(label)) {
                    return label.map((line, i) => <div key={`${id}-${i}`}>{line}</div>);
                }

                return <div key={id}>{label}</div>;
            })}

            <div className="text-gray-500">───────────────</div>
        </motion.div>
    );
};

export default PreviewCard;
