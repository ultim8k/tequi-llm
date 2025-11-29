import { useCactusLM } from "cactus-react-native";
// import * as DocumentPicker from 'expo-document-picker';
import { Directory } from "expo-file-system";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { cleanCactusResponse, generateUID } from "../../utils";
import SimpleScrollView from "../scroll-view";
import { IconSymbol } from "../ui/icon-symbol";
import { MessageInputForm } from "./message-input-form";

// const CHAT_HISTORY_FILE = 'chat-history.json';

// Type definition for CactusLM complete response
// type CactusCompleteResponse = {
//     decodeTokens: number;
//     functionCalls?: Array<{ name: string; arguments: { [key: string]: any } }> | undefined;
//     prefillTokens: number;
//     response: string;
//     success: boolean;
//     timeToFirstTokenMs: number;
//     tokensPerSecond: number;
//     totalTimeMs: number;
//     totalTokens: number;
// };

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
  id: string;
}

interface ChatState {
  messages: ChatMessage[];
}

type ChatAction =
  | {
      type: "add_message";
      message: ChatMessage;
    }
  | {
      type: "clear_messages";
    };

const chatInstructions = `
You are an experienced bartender. You are able to help with cocktail recipes and instructions on how to make your favorite drinks. You only reply in English and only answer about cocktails. 
If the user asks for a recipe, you will provide the recipe in a short easy format.
If there is an attached corpus directory with recipes, suggest a recipe from that directory.
If there is no corpus directory attached, just suggest a random cocktail recipe.
`;

export const Cactus = () => {
  const scrollRef = useRef<ScrollView>(null);
  const [corpus, setCorpus] = useState<string | undefined | null>(null);

  // Create model instance
  const {
    isDownloaded,
    isDownloading,
    download,
    complete,
    error: cactusError,
    completion,
    isGenerating,
  } = useCactusLM({
    model: "qwen3-0.6",
    corpusDir: corpus ?? undefined,
  });

  const initialChatState: ChatState = {
    messages: [
      {
        role: "system",
        content: chatInstructions,
        id: "initial",
      },
    ],
  };

  const chatReducer = (state: ChatState, action: ChatAction) => {
    switch (action.type) {
      case "add_message":
        return {
          ...state,
          messages: [...state.messages, action.message],
        };
      case "clear_messages":
        setCorpus(null);
        return {
          ...state,
          messages: initialChatState.messages,
        };
      default:
        return state;
    }
  };

  const [chatState, chatDispatch] = useReducer(chatReducer, initialChatState);

  const handleUserSubmit = async (inputValue: string) => {
    if (!isDownloaded || cactusError || !inputValue.trim() || isGenerating) {
      return;
    }

    // Add user message to the chat history
    chatDispatch({
      type: "add_message",
      message: {
        role: "user",
        content: inputValue.trim(),
        id: generateUID(),
      },
    });

    complete({
      messages: chatState?.messages?.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });
  };

  const handleOpenDir = async () => {
    if (isDownloading || !isDownloaded || isGenerating || !!corpus) {
      return;
    }

    try {
      const directory = await Directory.pickDirectoryAsync();
      console.log("directory", directory);

      setCorpus(directory.uri);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCleanChat = () => {
    chatDispatch({
      type: "clear_messages",
    });
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  // Download the model once
  useEffect(() => {
    if (isDownloaded || cactusError || isDownloading || isGenerating) {
      return;
    }

    download();
  }, [isDownloaded, cactusError, isDownloading, download, isGenerating]);

  // Handle Cactus response
  useEffect(() => {
    // If Cactus has a completion and it is not generating, add the assistant message to the chat history
    if (!isGenerating && completion) {
      // Parse the completion to get the cleaned response
      const cleanedResponse = cleanCactusResponse(completion);

      const id = `assistant-${cleanedResponse}`;

      if (chatState?.messages?.find((message) => message.id === id)) {
        return;
      }

      // Add assistant message to the chat history
      chatDispatch({
        type: "add_message",
        message: {
          role: "assistant",
          content: cleanedResponse,
          id,
        },
      });
    }
  }, [completion, isGenerating]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatState?.messages?.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    }
  }, [chatState?.messages, complete, isDownloaded, isGenerating]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>🌵🍸 TequiLLM</Text>
        <TouchableOpacity
          onPress={handleOpenDir}
          accessibilityLabel="Attach a corpus directory"
          disabled={isDownloading || !isDownloaded || isGenerating || !!corpus}
        >
          <IconSymbol
            name="folder.badge.plus"
            size={24}
            color={
              isDownloading || !isDownloaded || isGenerating || !!corpus
                ? "#ccc"
                : "black"
            }
          />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {isDownloading && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              Downloading model... Please wait.
            </Text>
          </View>
        )}

        {!isDownloaded && !isDownloading && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Model not downloaded</Text>
          </View>
        )}

        {cactusError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>{cactusError}</Text>
          </View>
        )}

        {(chatState?.messages?.length > 1 || isGenerating) && (
          <SimpleScrollView
            scrollRef={scrollRef as React.RefObject<Animated.ScrollView>}
          >
            <View style={styles.messagesContainer}>
              {chatState.messages
                .filter((message) => message.id !== "initial")
                .map((message) => (
                  <View
                    style={StyleSheet.flatten([
                      styles.resultContainer,
                      message.role === "user"
                        ? styles.userMessageContainer
                        : message.role === "assistant"
                        ? styles.assistantMessageContainer
                        : styles.fileMessageContainer,
                    ])}
                    key={message.id}
                  >
                    <Text
                      style={StyleSheet.flatten([
                        styles.resultText,
                        message.role === "user"
                          ? styles.userMessageText
                          : styles.assistantMessageText,
                      ])}
                    >
                      {message.content}
                    </Text>
                  </View>
                ))}

              {isGenerating && (
                <View
                  style={StyleSheet.flatten([
                    styles.resultContainer,
                    styles.assistantMessageContainer,
                  ])}
                  key="completing"
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.resultText,
                      styles.assistantMessageText,
                    ])}
                  >
                    Cactus is typing...
                  </Text>
                </View>
              )}
            </View>
          </SimpleScrollView>
        )}

        {isDownloaded &&
          !isGenerating &&
          (!chatState?.messages?.length || chatState.messages.length === 1) && (
            <View style={styles.placeholderContainer}>
              <IconSymbol name="wineglass.fill" size={24} color="gray" />
            </View>
          )}

        <View style={styles.controlBarContainer}>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "red" }}>
              {
                chatState.messages.filter(
                  (message) => message.role === "system"
                )?.length
              }{" "}
              System
            </Text>
            <Text style={{ color: "blue" }}>
              {
                chatState.messages.filter((message) => message.role === "user")
                  ?.length
              }{" "}
              User
            </Text>
            <Text style={{ color: "green" }}>
              {
                chatState.messages.filter(
                  (message) => message.role === "assistant"
                )?.length
              }{" "}
              Assistant
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCleanChat}
            disabled={isDownloading || !isDownloaded || isGenerating}
          >
            <IconSymbol
              name="x.circle"
              size={24}
              color={
                isDownloading || !isDownloaded || isGenerating
                  ? "#ccc"
                  : "white"
              }
            />
          </TouchableOpacity>
        </View>
        {isDownloaded && !cactusError && (
          <View style={styles.inputContainer}>
            <MessageInputForm
              isEditable={!isGenerating}
              onSubmit={handleUserSubmit}
              isSubmitDisabled={isGenerating}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#372",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    flexGrow: 1,
    height: "100%",
    maxHeight: "100%",
  },
  scrollView: {
    maxHeight: "100%",
    overflow: "scroll",
  },
  scrollContent: {
    flex: 1,
    flexGrow: 1,
    paddingBottom: 10,
    justifyContent: "space-between",
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 10,
    justifyContent: "flex-end",
  },
  statusContainer: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 15,
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  inputContainer: {
    // Need to fix it to bottom of the screen
  },
  errorContainer: {
    padding: 15,
    backgroundColor: "#fee",
    borderRadius: 8,
    marginBottom: 15,
  },
  errorTitle: {
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  errorMessage: {
    color: "red",
    fontSize: 12,
  },
  resultContainer: {
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 15,
    flexGrow: 1,
  },
  resultText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexGrow: 1,
  },
  placeholderText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  userMessageContainer: {
    backgroundColor: "#6644cc",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  assistantMessageContainer: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
    maxWidth: "80%",
  },
  fileMessageContainer: {
    backgroundColor: "#ff4433",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  userMessageText: {
    color: "#fff",
  },
  assistantMessageText: {
    color: "#333",
  },
});
