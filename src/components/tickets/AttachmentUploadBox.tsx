import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import {
  MAX_TICKET_ATTACHMENTS,
  TICKET_THEME,
} from './ticketTheme';

export type TicketAttachmentItem = {
  id: string;
  uri: string;
  fileName: string;
  type: string;
  size: number;
  url?: string;
  uploading?: boolean;
};

type AttachmentUploadBoxProps = {
  attachments: TicketAttachmentItem[];
  isUploading: boolean;
  onPick: () => void;
  onRemove: (id: string) => void;
};

const AttachmentUploadBox = ({
  attachments,
  isUploading,
  onPick,
  onRemove,
}: AttachmentUploadBoxProps) => (
  <View>
    <Pressable style={styles.uploadBox} onPress={onPick}>
      <View style={styles.uploadIconWrap}>
        {isUploading ? (
          <ActivityIndicator color={TICKET_THEME.accent} />
        ) : (
          <Ionicons name="cloud-upload-outline" size={26} color={TICKET_THEME.accent} />
        )}
      </View>
      <Text style={styles.uploadTitle}>
        {attachments.length > 0 ? 'Add more attachments' : 'Tap to upload files'}
      </Text>
      <Text style={styles.uploadSubtitle}>
        Max {MAX_TICKET_ATTACHMENTS} images • 5MB each • JPG, PNG, WEBP, GIF
      </Text>
    </Pressable>

    {attachments.length > 0 ? (
      <View style={styles.previewGrid}>
        {attachments.map(item => (
          <View key={item.id} style={styles.previewCard}>
            <Image source={{ uri: item.url ?? item.uri }} style={styles.previewImage} />
            {item.uploading ? (
              <View style={styles.previewOverlay}>
                <ActivityIndicator color={TICKET_THEME.accent} />
              </View>
            ) : null}
            <Pressable style={styles.removeButton} onPress={() => onRemove(item.id)}>
              <Ionicons name="close" size={16} color={TICKET_THEME.textPrimary} />
            </Pressable>
          </View>
        ))}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: TICKET_THEME.inputBorder,
    backgroundColor: '#0F150D',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TICKET_THEME.successSoft,
    marginBottom: 12,
  },
  uploadTitle: {
    color: TICKET_THEME.accent,
    fontSize: 17,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  uploadSubtitle: {
    color: TICKET_THEME.textMuted,
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 8,
    textAlign: 'center',
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 12,
  },
  previewCard: {
    width: 90,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: TICKET_THEME.input,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: TICKET_THEME.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AttachmentUploadBox;
