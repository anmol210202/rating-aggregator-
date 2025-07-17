import { Reorder } from 'framer-motion';

const ReorderList = ({ items, onReorder, renderItem, keyExtractor }) => {
    return (
        <Reorder.Group
            axis="y"
            values={items}
            onReorder={onReorder}
            className="space-y-2"
        >
            {items.map((item) => (
                <Reorder.Item
                    key={keyExtractor(item)}
                    value={item}
                    className="cursor-grab"
                    whileDrag={{ scale: 1.05 }}
                >
                    {renderItem(item)}
                </Reorder.Item>
            ))}
        </Reorder.Group>
    );
};

export default ReorderList;
