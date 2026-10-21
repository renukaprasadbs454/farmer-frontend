import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { colors } from '../../src/constants/theme';
import { useFarmerStore } from '../../src/store/farmerStore';
import { useAuthStore } from '../../src/store/authStore';
import { fetchUserConversationApi, postUserMessageApi } from '../../src/services/api';

interface MessageItem {
  id: string;
  senderRole: 'USER' | 'ADMIN';
  senderName: string;
  text?: string | null;
  type: 'TEXT' | 'VOICE' | 'IMAGE' | 'VIDEO';
  mediaUrl?: string | null;
  durationSeconds?: number | null;
  createdAt: string;
}

export default function ChatScreen() {
  const { farmer, farm, crops } = useFarmerStore();
  const { mobile: authMobile } = useAuthStore();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Media Attachment State
  const [attachedMedia, setAttachedMedia] = useState<{
    type: 'IMAGE' | 'VIDEO' | 'VOICE';
    url: string;
    label: string;
    duration?: number;
  } | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<any[]>([]);

  // Playing audio state
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Identity to link conversation
  const farmerPhone = farmer.mobile || authMobile || '';
  const farmerName = farmer.name || 'Kisan User';
  const regionName = [farm.district, farm.state].filter(Boolean).join(', ');

  // Load conversation
  const loadConversation = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetchUserConversationApi({
        farmerPhone,
        farmerName,
        regionName,
      });

      if (res?.success && res?.data) {
        setConversationId(res.data.id);
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.warn('Failed to load farmer conversation:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();

    // Auto-poll every 3.5 seconds to receive replies in real-time from admin panel
    const interval = setInterval(() => {
      loadConversation(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [farmerPhone]);

  useEffect(() => {
    // Auto scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages.length]);

  // Voice Recording Logic
  const startVoiceRecording = async () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    // Web MediaRecorder if supported
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new (window as any).MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e: any) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.start();
      } catch (e) {
        console.warn('Microphone permission not granted or available, running audio note recorder:', e);
      }
    }

    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopVoiceRecording = (cancel = false) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (cancel) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setRecordingSeconds(0);
      return;
    }

    const finalDuration = Math.max(recordingSeconds, 2);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAttachedMedia({
          type: 'VOICE',
          url: audioUrl,
          label: `Voice Note (${finalDuration}s)`,
          duration: finalDuration,
        });
      };
      mediaRecorderRef.current.stop();
    } else {
      // Audio simulation fallback
      setAttachedMedia({
        type: 'VOICE',
        url: 'https://cdn.freesound.org/previews/263/263133_2064400-lq.mp3',
        label: `Voice Note (${finalDuration}s)`,
        duration: finalDuration,
      });
    }

    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // Image & Video file handlers
  const handleFileChange = (e: any, type: 'IMAGE' | 'VIDEO') => {
    const file = e.target?.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedMedia({
        type,
        url,
        label: file.name,
      });
    }
  };

  const openImagePicker = () => {
    if (Platform.OS === 'web' && imageInputRef.current) {
      imageInputRef.current.click();
    } else {
      // Fallback sample crop leaf image
      setAttachedMedia({
        type: 'IMAGE',
        url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?w=800&auto=format&fit=crop&q=80',
        label: 'crop_leaf_spots.jpg',
      });
    }
  };

  const openVideoPicker = () => {
    if (Platform.OS === 'web' && videoInputRef.current) {
      videoInputRef.current.click();
    } else {
      // Fallback sample crop video
      setAttachedMedia({
        type: 'VIDEO',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        label: 'field_pest_damage.mp4',
      });
    }
  };

  // Sample quick questions
  const sendQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  // Send message
  const sendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride !== undefined ? textOverride : inputText).trim();

    if (!textToSend && !attachedMedia) {
      return;
    }

    try {
      setSending(true);

      const payload = {
        conversationId: conversationId || undefined,
        farmerName,
        farmerPhone,
        regionName,
        text: textToSend || (attachedMedia ? attachedMedia.label : ''),
        type: attachedMedia ? attachedMedia.type : ('TEXT' as const),
        mediaUrl: attachedMedia?.url || undefined,
        durationSeconds: attachedMedia?.duration || undefined,
      };

      const res = await postUserMessageApi(payload);
      if (res?.success && res?.data) {
        setMessages((prev) => [...prev, res.data]);
        setInputText('');
        setAttachedMedia(null);
      } else {
        Alert.alert('Error', 'Unable to deliver message. Please retry.');
      }
    } catch (err: any) {
      console.error('Send message error:', err);
      Alert.alert('Error', 'Network error sending message.');
    } finally {
      setSending(false);
    }
  };

  const togglePlayAudio = (msgId: string, audioUrl?: string | null) => {
    if (playingMessageId === msgId) {
      setPlayingMessageId(null);
      return;
    }

    setPlayingMessageId(msgId);
    if (Platform.OS === 'web' && audioUrl) {
      try {
        const audio = new Audio(audioUrl);
        audio.play().catch(() => {});
        audio.onended = () => setPlayingMessageId(null);
      } catch (e) {
        setTimeout(() => setPlayingMessageId(null), 3000);
      }
    } else {
      setTimeout(() => setPlayingMessageId(null), 3000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hidden Web File Inputs */}
      {Platform.OS === 'web' && (
        <View style={{ display: 'none' }}>
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef as any}
            onChange={(e) => handleFileChange(e, 'IMAGE')}
          />
          <input
            type="file"
            accept="video/*"
            ref={videoInputRef as any}
            onChange={(e) => handleFileChange(e, 'VIDEO')}
          />
        </View>
      )}

      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={{ fontSize: 24 }}>👨‍🌾</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Agri Expert Helpline</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Agronomist & Franchise Admin Live</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={() => loadConversation()} style={styles.refreshBtn}>
          <Text style={{ fontSize: 16 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Linked Farmer Info Ribbon */}
      <View style={styles.farmerCard}>
        <Text style={styles.farmerCardText}>
          👤 <Text style={{ fontWeight: '800' }}>{farmerName}</Text> • 📞 {farmerPhone || 'Mobile not available'}
        </Text>
        <Text style={styles.farmerSubText}>
          📍 {regionName} {crops.length > 0 ? `• 🌾 Growing: ${crops.slice(0, 3).join(', ')}` : ''}
        </Text>
      </View>

      {/* Messages Scroll Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Connecting to Agri Support Desk...</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Help Chips */}
          <View style={styles.chipsContainer}>
            <Text style={styles.chipsHeader}>Quick Agriculture Questions:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => sendQuickPrompt('🐛 My crop leaves have yellow spots and pests, what medicine to spray?')}
              >
                <Text style={styles.chipText}>🐛 Yellow Spots / Pest</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chip}
                onPress={() => sendQuickPrompt('🌧️ Will it rain this week in my district? Should I harvest now?')}
              >
                <Text style={styles.chipText}>🌧️ Weather / Harvest Advice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chip}
                onPress={() => sendQuickPrompt('🧪 Which fertilizer is best for flowering stage this season?')}
              >
                <Text style={styles.chipText}>🧪 Fertilizer Advice</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chip}
                onPress={() => sendQuickPrompt('🚜 I need an emergency tractor booking for tilling tomorrow.')}
              >
                <Text style={styles.chipText}>🚜 Machinery Booking Help</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Messages */}
          {messages.map((msg) => {
            const isUser = msg.senderRole === 'USER';
            const isAudioPlaying = playingMessageId === msg.id;

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageBubbleWrapper,
                  isUser ? styles.userBubbleWrapper : styles.adminBubbleWrapper,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.adminBubble,
                  ]}
                >
                  {/* Sender Tag */}
                  <View style={styles.msgHeader}>
                    <Text style={[styles.msgSender, isUser ? styles.userSender : styles.adminSender]}>
                      {isUser ? 'You (Farmer)' : `🌾 ${msg.senderName || 'Agri Expert'}`}
                    </Text>
                    <Text style={[styles.msgTime, isUser ? styles.userTime : styles.adminTime]}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>

                  {/* VOICE NOTE */}
                  {msg.type === 'VOICE' && (
                    <View style={styles.voiceCard}>
                      <TouchableOpacity
                        style={styles.voicePlayBtn}
                        onPress={() => togglePlayAudio(msg.id, msg.mediaUrl)}
                      >
                        <Text style={{ fontSize: 18 }}>{isAudioPlaying ? '⏸️' : '▶️'}</Text>
                      </TouchableOpacity>
                      <View style={{ flex: 1, marginHorizontal: 8 }}>
                        <Text style={styles.voiceWaveform}>
                          {isAudioPlaying ? ' ▂▃▅▆▇▅▃▂ ▂▃▅▆' : '||||||||||||||||||||'}
                        </Text>
                        <Text style={styles.voiceLabel}>
                          Voice Note • {msg.durationSeconds || 5}s {isAudioPlaying ? '(Playing...)' : ''}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* IMAGE */}
                  {msg.type === 'IMAGE' && (
                    <View style={styles.mediaContainer}>
                      <Image
                        source={{ uri: msg.mediaUrl || 'https://via.placeholder.com/300' }}
                        style={styles.messageImage}
                        resizeMode="cover"
                      />
                      <Text style={styles.mediaCaption}>📷 Field Inspection Photo</Text>
                    </View>
                  )}

                  {/* VIDEO */}
                  {msg.type === 'VIDEO' && (
                    <View style={styles.mediaContainer}>
                      <View style={styles.videoPreview}>
                        <Text style={{ fontSize: 32 }}>🎬</Text>
                        <Text style={styles.videoPreviewText}>Video Clip Attached</Text>
                      </View>
                    </View>
                  )}

                  {/* TEXT CONTENT */}
                  {Boolean(msg.text) && msg.type !== 'VOICE' && (
                    <Text style={[styles.msgText, isUser ? styles.userMsgText : styles.adminMsgText]}>
                      {msg.text}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Attachment Preview Box */}
      {attachedMedia && (
        <View style={styles.previewBar}>
          <View style={styles.previewInfo}>
            <Text style={{ fontSize: 18 }}>
              {attachedMedia.type === 'VOICE' ? '🎙️' : attachedMedia.type === 'IMAGE' ? '📷' : '🎥'}
            </Text>
            <Text style={styles.previewText} numberOfLines={1}>
              {attachedMedia.label}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setAttachedMedia(null)} style={styles.removePreviewBtn}>
            <Text style={{ color: '#D32F2F', fontWeight: '800' }}>✕ Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recording Voice Note Active Overlay */}
      {isRecording ? (
        <View style={styles.recordingBar}>
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingPulseDot} />
            <Text style={styles.recordingTime}>
              Recording Voice Note: 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
            </Text>
          </View>

          <View style={styles.recordingActions}>
            <TouchableOpacity onPress={() => stopVoiceRecording(true)} style={styles.cancelRecordBtn}>
              <Text style={styles.cancelRecordText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => stopVoiceRecording(false)} style={styles.doneRecordBtn}>
              <Text style={styles.doneRecordText}>✓ Attach Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Bottom Input Bar */
        <View style={styles.inputBar}>
          {/* Action buttons: Camera, Video, Mic */}
          <TouchableOpacity onPress={openImagePicker} style={styles.actionIconBtn}>
            <Text style={{ fontSize: 20 }}>📷</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openVideoPicker} style={styles.actionIconBtn}>
            <Text style={{ fontSize: 20 }}>🎥</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={startVoiceRecording} style={styles.actionIconBtn}>
            <Text style={{ fontSize: 20 }}>🎙️</Text>
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="Ask question, pest problem..."
            placeholderTextColor="#8898AA"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={600}
          />

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() && !attachedMedia) && styles.sendBtnDisabled]}
            disabled={(!inputText.trim() && !attachedMedia) || sending}
            onPress={() => sendMessage()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendBtnText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F4',
  },
  header: {
    paddingTop: 45,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2EBE5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1B3B2B',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
  },
  statusText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F2',
  },
  farmerCard: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D7E9D9',
  },
  farmerCardText: {
    fontSize: 12,
    color: '#1E4620',
  },
  farmerSubText: {
    fontSize: 11,
    color: '#38703C',
    marginTop: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#527958',
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 14,
    paddingBottom: 24,
  },
  chipsContainer: {
    marginBottom: 14,
  },
  chipsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#63826C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CDE4D2',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  chipText: {
    fontSize: 12,
    color: '#1F5E30',
    fontWeight: '600',
  },
  messageBubbleWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  adminBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#2E7D32',
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0EDE3',
    borderBottomLeftRadius: 4,
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  msgSender: {
    fontSize: 11,
    fontWeight: '700',
  },
  userSender: {
    color: '#C8E6C9',
  },
  adminSender: {
    color: '#2E7D32',
  },
  msgTime: {
    fontSize: 10,
  },
  userTime: {
    color: '#A5D6A7',
  },
  adminTime: {
    color: '#8A9E90',
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMsgText: {
    color: '#FFFFFF',
  },
  adminMsgText: {
    color: '#1B3B2B',
  },
  voiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 12,
    padding: 8,
    marginVertical: 4,
  },
  voicePlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceWaveform: {
    color: '#1B5E20',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
  },
  voiceLabel: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
    marginTop: 2,
  },
  mediaContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 4,
  },
  messageImage: {
    width: 220,
    height: 150,
    borderRadius: 8,
  },
  mediaCaption: {
    fontSize: 11,
    color: '#4C6E53',
    marginTop: 4,
    fontStyle: 'italic',
  },
  videoPreview: {
    width: 220,
    height: 120,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreviewText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  previewBar: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
  },
  previewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  previewText: {
    fontSize: 13,
    color: '#1B5E20',
    fontWeight: '600',
    flex: 1,
  },
  removePreviewBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  recordingBar: {
    backgroundColor: '#FFF2F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#FFCDD2',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordingPulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D32F2F',
  },
  recordingTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D32F2F',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelRecordBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EEEEEE',
  },
  cancelRecordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
  doneRecordBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#2E7D32',
  },
  doneRecordText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2EBE5',
    gap: 6,
  },
  actionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7E4D9',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F4F7F4',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1B3B2B',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#A5D6A7',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
