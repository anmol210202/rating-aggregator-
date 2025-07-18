import ReorderList from '../ReorderList'
import ToggleSwitch from '../ToggleSwitch'
import { RATING_SOURCES } from '../../utils/constants'

const RatingsConfig = ({ config, onChange }) => {
    // All sources, in the constant order
    const all = RATING_SOURCES.map((s) => s.id)

    const handleToggle = (id) =>
        onChange({
            ...config,
            [id]: { ...config[id], enabled: !config[id].enabled },
        })

    const handleReorder = (newOrder) => {
        const updated = { ...config }
        newOrder.forEach((id, idx) => {
            updated[id].order = idx + 1
        })
        onChange(updated)
    }

    const enabled = all.filter((id) => config[id].enabled)
    // Sort by config.order
    enabled.sort((a, b) => config[a].order - config[b].order)
    const disabled = all.filter((id) => !config[id].enabled)

    const renderItem = (id) => {
        const src = RATING_SOURCES.find((s) => s.id === id)
        return (
            <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 rounded">
                <div className="flex items-center gap-3">
                    <ToggleSwitch
                        checked={config[id].enabled}
                        onChange={() => handleToggle(id)}
                    />
                    <span className="text-lg">{Array.isArray(src.label) ? src.label[0] : src.label}</span>
                </div>
                <span className="text-gray-400">↕️</span>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <ReorderList
                items={enabled}
                onReorder={handleReorder}
                renderItem={renderItem}
                keyExtractor={(id) => id}
            />
            {disabled.map((id) => {
                const src = RATING_SOURCES.find((s) => s.id === id)
                return (
                    <div
                        key={id}
                        className="flex items-center justify-between w-full px-4 py-2 bg-gray-700 rounded opacity-60"
                    >
                        <div className="flex items-center gap-3">
                            <ToggleSwitch
                                checked={false}
                                onChange={() => handleToggle(id)}
                            />
                            <span className="text-lg">
                                {Array.isArray(src.label) ? src.label[0] : src.label}
                            </span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default RatingsConfig
