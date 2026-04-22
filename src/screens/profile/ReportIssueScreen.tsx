import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import AttachmentUploadBox, {
  type TicketAttachmentItem,
} from '../../components/tickets/AttachmentUploadBox';
import PrioritySelector from '../../components/tickets/PrioritySelector';
import TicketCard from '../../components/tickets/TicketCard';
import TicketHeader from '../../components/tickets/TicketHeader';
import {
  ISSUE_CATEGORIES,
  MAX_TICKET_ATTACHMENTS,
  MAX_TICKET_ATTACHMENT_SIZE_BYTES,
  TICKET_THEME,
} from '../../components/tickets/ticketTheme';
import { useUser } from '../../context/UserContext';
import { FONTS } from '../../constants/FONTS';
import { RootStackParamList } from '../../navigation/types';
import { ticketService, type TicketItem, type TicketPriority } from '../../services/ticketService';

const ALLOWED_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const ReportIssueScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const [category, setCategory] = useState<string>('');
  const [priority, setPriority] = useState<TicketPriority | ''>('');
  const [description, setDescription] = useState('');
  const [allowContact, setAllowContact] = useState(false);
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [contactPhone, setContactPhone] = useState('');
  const [attachments, setAttachments] = useState<TicketAttachmentItem[]>([]);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isRefreshingReports, setIsRefreshingReports] = useState(false);
  const [recentTickets, setRecentTickets] = useState<TicketItem[]>([]);

  const previousReports = useMemo(() => recentTickets.slice(0, 2), [recentTickets]);

  const fetchRecentTickets = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshingReports(true);
      } else {
        setIsLoadingReports(true);
      }

      const tickets = await ticketService.getTickets();
      setRecentTickets(tickets);
    } catch (error: any) {
      if (!showRefresh) {
        Alert.alert(
          'Unable to Load Reports',
          error?.response?.data?.message ?? 'Please try again in a moment.'
        );
      }
    } finally {
      setIsLoadingReports(false);
      setIsRefreshingReports(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecentTickets();
    }, [fetchRecentTickets])
  );

  const validateForm = () => {
    if (!category) {
      Alert.alert('Validation', 'Please select a category.');
      return false;
    }

    if (!priority) {
      Alert.alert('Validation', 'Please select a priority.');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Validation', 'Please enter a description.');
      return false;
    }

    if (allowContact && !contactEmail.trim() && !contactPhone.trim()) {
      Alert.alert('Validation', 'Please enter an email or phone number.');
      return false;
    }

    if (attachments.some(item => !item.url)) {
      Alert.alert('Validation', 'Please wait for all attachments to finish uploading.');
      return false;
    }

    return true;
  };

  const handleAttachmentPick = useCallback(async () => {
    if (attachments.length >= MAX_TICKET_ATTACHMENTS) {
      Alert.alert('Attachment limit', `You can upload up to ${MAX_TICKET_ATTACHMENTS} files.`);
      return;
    }

      const result = await new Promise<{
      assets?: Asset[];
      didCancel?: boolean;
      errorCode?: string;
      errorMessage?: string;
    }>(resolve => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: MAX_TICKET_ATTACHMENTS - attachments.length,
          quality: 0.8,
        },
        resolve
      );
    });

    if (result.didCancel) {
      return;
    }

    if (result.errorCode) {
      Alert.alert('Upload Failed', result.errorMessage ?? 'Unable to select images.');
      return;
    }

    const validAssets = (result.assets ?? []).filter(asset => {
      if (!asset.uri) {
        return false;
      }

      if ((asset.fileSize ?? 0) > MAX_TICKET_ATTACHMENT_SIZE_BYTES) {
        Alert.alert(
          'File too large',
          `${asset.fileName ?? 'One file'} exceeds the 5MB size limit.`
        );
        return false;
      }

      if (asset.type && !ALLOWED_ATTACHMENT_TYPES.includes(asset.type)) {
        Alert.alert(
          'Unsupported file type',
          'Please upload JPG, PNG, WEBP, or GIF images only.'
        );
        return false;
      }

      return true;
    });

    if (!validAssets.length) {
      return;
    }

    const pendingItems = validAssets.map((asset, index) => ({
      id: `${Date.now()}-${index}`,
      uri: asset.uri ?? '',
      fileName: asset.fileName ?? `attachment-${index + 1}.jpg`,
      type: asset.type ?? 'image/jpeg',
      size: asset.fileSize ?? 0,
      uploading: true,
    }));

    setAttachments(current => [...current, ...pendingItems]);
    setIsUploadingAttachments(true);

    for (let index = 0; index < validAssets.length; index += 1) {
      const asset = validAssets[index];
      const pendingItem = pendingItems[index];

      try {
        const url = await ticketService.uploadAttachment(asset);
        setAttachments(current =>
          current.map(item => (item.id === pendingItem.id ? { ...item, url, uploading: false } : item))
        );
      } catch (error: any) {
        setAttachments(current => current.filter(item => item.id !== pendingItem.id));
        Alert.alert(
          'Attachment Upload Failed',
          error?.message ?? 'Please try again with another image.'
        );
      }
    }

    setIsUploadingAttachments(false);
  }, [attachments.length]);

  const handleRemoveAttachment = (id: string) => {
    setAttachments(current => current.filter(item => item.id !== id));
  };

  const resetForm = () => {
    setCategory('');
    setPriority('');
    setDescription('');
    setAllowContact(false);
    setContactEmail(user?.email ?? '');
    setContactPhone('');
    setAttachments([]);
  };

  const handleSubmit = async () => {
    if (!validateForm() || !priority) {
      return;
    }

    try {
      setIsSubmitting(true);

      const ticket = await ticketService.createTicket({
        category,
        priority,
        description: description.trim(),
        attachments: attachments.map(item => item.url).filter(Boolean) as string[],
        allowContact,
        contactEmail: allowContact && contactEmail.trim() ? contactEmail.trim() : null,
        contactPhone: allowContact && contactPhone.trim() ? contactPhone.trim() : null,
      });

      resetForm();
      await fetchRecentTickets();

      Alert.alert('Report Submitted', `Your report ${ticket.ticketId} has been created.`, [
        {
          text: 'View Details',
          onPress: () => navigation.navigate('TicketDetail', { ticketId: ticket.ticketId }),
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Submission Failed',
        error?.response?.data?.message ?? 'Unable to submit your report right now.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + 12, 28),
            paddingBottom: Math.max(insets.bottom + 28, 40),
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingReports}
            onRefresh={() => fetchRecentTickets(true)}
            tintColor={TICKET_THEME.accent}
          />
        }
      >
        <TicketHeader title="Report an Issue" onBack={() => navigation.goBack()} />

        <View style={styles.helpCard}>
          <View style={styles.helpIconWrap}>
            <Ionicons name="shield-checkmark-outline" size={22} color={TICKET_THEME.accent} />
          </View>
          <View style={styles.helpTextWrap}>
            <Text style={styles.helpTitle}>Need help?</Text>
            <Text style={styles.helpDescription}>
              Describe your issue clearly and we will review it as soon as possible.
            </Text>
          </View>
        </View>

        <Text style={styles.label}>Category</Text>
        <Pressable style={styles.selector} onPress={() => setIsCategoryModalVisible(true)}>
          <Text style={[styles.selectorText, !category && styles.placeholderText]}>
            {category || 'Select a category'}
          </Text>
          <Ionicons name="chevron-down" size={20} color={TICKET_THEME.textSecondary} />
        </Pressable>

        <Text style={styles.label}>Priority</Text>
        <PrioritySelector value={priority} onChange={setPriority} />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Explain what happened, what you expected, and any steps to reproduce it."
          placeholderTextColor={TICKET_THEME.textMuted}
          multiline
          textAlignVertical="top"
          style={styles.descriptionInput}
        />

        <Text style={styles.label}>Attachments (Optional)</Text>
        <AttachmentUploadBox
          attachments={attachments}
          isUploading={isUploadingAttachments}
          onPick={handleAttachmentPick}
          onRemove={handleRemoveAttachment}
        />

        <View style={styles.contactCard}>
          <View style={styles.contactRow}>
            <View style={styles.contactCopy}>
              <Text style={styles.contactTitle}>Allow Contact</Text>
              <Text style={styles.contactDescription}>
                Turn this on if you want us to reach you for extra details.
              </Text>
            </View>
            <Switch
              value={allowContact}
              onValueChange={value => {
                setAllowContact(value);
                if (!value) {
                  setContactPhone('');
                }
              }}
              thumbColor={allowContact ? TICKET_THEME.accent : '#f4f3f4'}
              trackColor={{ false: '#3A4035', true: `${TICKET_THEME.accent}66` }}
            />
          </View>

          {allowContact ? (
            <View style={styles.contactFields}>
              <TextInput
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder="Contact email"
                placeholderTextColor={TICKET_THEME.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.singleLineInput}
              />
              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="Contact phone"
                placeholderTextColor={TICKET_THEME.textMuted}
                keyboardType="phone-pad"
                style={styles.singleLineInput}
              />
            </View>
          ) : null}
        </View>

        <Pressable
          style={[styles.submitButton, (isSubmitting || isUploadingAttachments) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || isUploadingAttachments}
        >
          {isSubmitting ? (
            <ActivityIndicator color={TICKET_THEME.background} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Previous Reports</Text>
          <Pressable onPress={() => navigation.navigate('TicketList')}>
            <Text style={styles.viewAllText}>View All</Text>
          </Pressable>
        </View>

        {isLoadingReports ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={TICKET_THEME.accent} />
          </View>
        ) : previousReports.length ? (
          <View style={styles.reportList}>
            {previousReports.map(ticket => (
              <TicketCard
                key={ticket.ticketId}
                ticket={ticket}
                onPress={() => navigation.navigate('TicketDetail', { ticketId: ticket.ticketId })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.stateCard}>
            <Text style={styles.emptyTitle}>No reports yet</Text>
            <Text style={styles.emptyDescription}>
              Your submitted tickets will appear here.
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsCategoryModalVisible(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {ISSUE_CATEGORIES.map(item => (
              <Pressable
                key={item}
                style={styles.modalOption}
                onPress={() => {
                  setCategory(item);
                  setIsCategoryModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>{item}</Text>
                {category === item ? (
                  <Ionicons name="checkmark" size={18} color={TICKET_THEME.accent} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TICKET_THEME.background,
  },
  content: {
    paddingHorizontal: 18,
  },
  helpCard: {
    backgroundColor: '#14210F',
    borderColor: TICKET_THEME.cardBorder,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
  },
  helpIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: TICKET_THEME.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  helpTextWrap: {
    flex: 1,
  },
  helpTitle: {
    color: TICKET_THEME.accent,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  helpDescription: {
    color: TICKET_THEME.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  label: {
    color: TICKET_THEME.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 14,
  },
  selector: {
    backgroundColor: TICKET_THEME.input,
    borderWidth: 1,
    borderColor: TICKET_THEME.inputBorder,
    borderRadius: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    color: TICKET_THEME.textPrimary,
    fontSize: 16,
  },
  placeholderText: {
    color: TICKET_THEME.textMuted,
  },
  descriptionInput: {
    minHeight: 150,
    borderRadius: 18,
    backgroundColor: TICKET_THEME.input,
    borderColor: TICKET_THEME.inputBorder,
    borderWidth: 1,
    color: TICKET_THEME.textPrimary,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: TICKET_THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
    padding: 16,
    marginTop: 18,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactCopy: {
    flex: 1,
    paddingRight: 16,
  },
  contactTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  contactDescription: {
    color: TICKET_THEME.textSecondary,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },
  contactFields: {
    marginTop: 14,
    gap: 12,
  },
  singleLineInput: {
    height: 52,
    borderRadius: 14,
    backgroundColor: TICKET_THEME.input,
    borderWidth: 1,
    borderColor: TICKET_THEME.inputBorder,
    color: TICKET_THEME.textPrimary,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  submitButton: {
    marginTop: 22,
    backgroundColor: TICKET_THEME.accent,
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: TICKET_THEME.background,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 22,
    fontFamily: FONTS.bold,
    fontWeight: '700',
  },
  viewAllText: {
    color: TICKET_THEME.accent,
    fontSize: 14,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  reportList: {
    gap: 12,
  },
  stateCard: {
    backgroundColor: TICKET_THEME.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 17,
    fontFamily: FONTS.semibold,
    fontWeight: '600',
  },
  emptyDescription: {
    color: TICKET_THEME.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: TICKET_THEME.cardStrong,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: TICKET_THEME.cardBorder,
  },
  modalTitle: {
    color: TICKET_THEME.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalOption: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: TICKET_THEME.input,
    paddingHorizontal: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOptionText: {
    color: TICKET_THEME.textPrimary,
    fontSize: 15,
  },
});

export default ReportIssueScreen;
