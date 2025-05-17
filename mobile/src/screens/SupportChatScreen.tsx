import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Text,
  TextInput,
  IconButton,
  ActivityIndicator,
  Avatar,
  Card
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useSupportChat } from '../hooks/useSupportChat';
import { theme } from '../theme';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
}

export const SupportChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Message['attachments']>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    isTyping
  } = useSupportChat();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    await sendMessage({
      text: message.trim(),
      attachments
    });

    setMessage('');
    setAttachments([]);
  };

  const handleAttachment = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setAttachments(prev => [
        ...prev,
        {
          type: asset.type === 'image' ? 'image' : 'file',
          url: asset.uri,
          name: asset.uri.split('/').pop() || 'file'
        }
      ]);
    }
  };

  const renderMessage = (msg: Message) => (
    <View
      key={msg.id}
      style={[
        styles.messageContainer,
        msg.sender === 'user' ? styles.userMessage : styles.supportMessage
      ]}
    >
      {msg.sender === 'support' && (
        <Avatar.Icon
          size={32}
          icon="headset"
          style={styles.avatar}
          accessibilityLabel={t('support.agentAvatar')}
        />
      )}
      <Card style={styles.messageCard}>
        <Card.Content>
          {msg.text && <Text style={styles.messageText}>{msg.text}</Text>}
          {msg.attachments?.map((attachment, index) => (
            <TouchableOpacity
              key={index}
              style={styles.attachment}
              onPress={() => {/* Handle attachment preview */}}
              accessibilityRole="button"
              accessibilityLabel={t('support.viewAttachment', { name: attachment.name })}
            >
              <IconButton
                icon={attachment.type === 'image' ? 'image' : 'file'}
                size={24}
              />
              <Text numberOfLines={1} style={styles.attachmentName}>
                {attachment.name}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.timestamp}>
            {format(msg.timestamp, 'HH:mm')}
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{t('errors.failedToLoadChat')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(renderMessage)}
        {isTyping && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" />
            <Text style={styles.typingText}>{t('support.agentTyping')}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <IconButton
          icon="paperclip"
          size={24}
          onPress={handleAttachment}
          accessibilityLabel={t('support.attachFile')}
        />
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={t('support.typeMessage')}
          multiline
          maxLength={1000}
          accessibilityLabel={t('support.messageInput')}
        />
        <IconButton
          icon="send"
          size={24}
          onPress={handleSend}
          disabled={!message.trim() && attachments.length === 0}
          accessibilityLabel={t('support.sendMessage')}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  messagesContainer: {
    flex: 1
  },
  messagesContent: {
    padding: 16
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%'
  },
  userMessage: {
    alignSelf: 'flex-end'
  },
  supportMessage: {
    alignSelf: 'flex-start'
  },
  avatar: {
    marginRight: 8,
    backgroundColor: theme.colors.primary
  },
  messageCard: {
    backgroundColor: theme.colors.surface
  },
  messageText: {
    fontSize: 16
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8
  },
  attachmentName: {
    flex: 1,
    marginLeft: 8
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 48
  },
  typingText: {
    marginLeft: 8,
    color: theme.colors.onSurfaceVariant
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 100
  }
}); 