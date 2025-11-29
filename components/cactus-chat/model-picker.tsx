import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';



export const ModelPicker = ({ models, onSelect }: { models: string[], onSelect: (model: string) => void }) => {
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    
    const handleSelect = (itemValue: string | null) => {
        if (!itemValue || itemValue === selectedModel) return;

        setSelectedModel(itemValue);
        onSelect(itemValue);
    };
    
    return (
        <Picker
        enabled={true}
        mode="dropdown"
        selectedValue={selectedModel}
        accessibilityLabel="Select a model"
        onValueChange={(itemValue) =>
            handleSelect(itemValue ?? null)
        }>
            {models.map((model) => (
                <Picker.Item key={model} label={model} value={model} enabled={true} />
            ))}
        </Picker>
    )
};