import { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { AutoGrowTextInput } from "react-native-auto-grow-textinput";
import { IconSymbol } from "../ui/icon-symbol";


const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      backgroundColor: '#eee',
      gap: 10,
      alignItems: 'flex-end',
      maxHeight: 250,
    },
    input: {
      flex: 1,
      maxHeight: '100%',
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      minHeight: 50,
      backgroundColor: '#f9f9f9',
      textAlignVertical: 'top',
      flexGrow: 1,
    },
    button: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 50,
      
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
  
interface MessageInputFormProps {
    isEditable?: boolean;
    isSubmitDisabled?: boolean;
    onSubmit: (value: string) => void;
};

export const MessageInputForm = ({
    isEditable = false,
    isSubmitDisabled = false,
    onSubmit,
}: MessageInputFormProps) => {
    const [inputValue, setInputValue] = useState('');
    const handleSubmit = useCallback(() => {
        if (!inputValue.trim()) {
            return;
        }

        onSubmit(inputValue.trim());
        setInputValue('');
    }, [inputValue, onSubmit]);

    const isSubmitButtonDisabled = !inputValue.trim() || isSubmitDisabled;

    return (
      <View style={styles.inputContainer}>
        <AutoGrowTextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Ask for a cocktail recipe..."
          placeholderTextColor="#999"
          multiline
          editable={isEditable}
          autoFocus={true}
        />
        <TouchableOpacity
          style={StyleSheet.flatten([styles.button, isSubmitButtonDisabled ? styles.buttonDisabled: null])}
          onPress={handleSubmit}
          disabled={isSubmitButtonDisabled}
        >
          {/* <Text style={styles.buttonText}>Send</Text> */}
          {/* <Text style={styles.buttonText}>Send</Text> */}
          <IconSymbol name="paperplane.fill" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
};