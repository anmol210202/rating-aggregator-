import ReorderList from '../ReorderList';
import ToggleSwitch from '../ToggleSwitch';
import { RATING_SOURCES } from '../../utils/constants';

const RatingsConfig = ({ config, onChange }) => {
    const sources = RATING_SOURCES.filter(s => s.id !== 'mcUsers'); // not shown in config panel

    const handleToggle = (id) => {
        onChange({
            ...config,
            [id]: { ...config[id], enabled: !config[id]?.enabled }
        });
    };

    const handleReorder = (newOrder) => {
        const updated = { ...config };
        newOrder.forEach((item, idx) => {
            updated[item.id].order = idx + 1;
        });
        onChange(updated);
    };

    const enabledSources = sources
        .filter(s => config[s.id]?.enabled)
        .sort((a, b) => config[a.id].order - config[b.id].order);

    const disabledSources = sources.filter(s => !config[s.id]?.enabled);

    const renderRatingRow = (source) => (
        <div className="flex items-center justify-between w-full px-4 py-2 bg-gray-800 rounded">
            <div className="flex items-center gap-3">
                <ToggleSwitch
                    checked
                    onChange={() => handleToggle(source.id)}
                />
                <span className="text-lg">{source.label.slice(0, 2)}</span>
                <span>{source.id}</span>
            </div>
            <span className="text-gray-400">↕️</span>
        </div>
    );

    return (
        <div className="space-y-2">
            <ReorderList
                items={enabledSources}
                onReorder={handleReorder}
                renderItem={renderRatingRow}
                keyExtractor={(item) => item.id}
            />
            {disabledSources.map(source => (
                <div key={source.id} className="flex items-center justify-between w-full px-4 py-2 bg-gray-700 rounded opacity-60">
                    <div className="flex items-center gap-3">
                        <ToggleSwitch
                            checked={false}
                            onChange={() => handleToggle(source.id)}
                        />
                        <span className="text-lg">{source.label.slice(0, 2)}</span>
                        <span>{source.id}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RatingsConfig;
