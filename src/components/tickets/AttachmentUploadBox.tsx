import React from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { FONTS } from '../../constants/FONTS';
import {
  MAX_TICKET_ATTACHMENTS,
  TICKET_THEME,
} from './ticketTheme';
import styles from './AttachmentUploadBox.style';


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

export default AttachmentUploadBox;
