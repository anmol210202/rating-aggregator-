import { motion } from 'framer-motion'
import { RATING_SOURCES } from '../utils/constants'

// Build a quick map of id → label for lookup
const LABEL_MAP = RATING_SOURCES.reduce(
    (acc, { id, label }) => ({ ...acc, [id]: label }),
    {}
)

const PreviewCard = ({ config }) => {
    // Pull enabled ratings, sort by config.order
    const ordered = Object.entries(config.ratings)
        .filter(([, v]) => v.enabled)
        .sort(([, a], [, b]) => a.order - b.order)
        .map(([id]) => id)

    return (
        <motion.div
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap leading-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="text-gray-500">───────────────</div>

            {ordered.map((id) => {
                const label = LABEL_MAP[id]
                if (Array.isArray(label)) {
                    return label.map((line, i) => <div key={`${id}-${i}`}>{line}</div>)
                }
                return <div key={id}>{label}</div>
            })}

            <div className="text-gray-500">───────────────</div>
        </motion.div>
    )
}

export default PreviewCard
