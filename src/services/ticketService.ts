import type { Asset } from 'react-native-image-picker';
import { NativeModules, Platform } from 'react-native';
import API from './api';

export type TicketItem = {
  _id: string;
  ticketId: string;
  userId: string;
  category: string;
  description: string;
  attachments: string[];
  allowContact: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  appVersion?: string | null;
  deviceName?: string | null;
  osVersion?: string | null;
  resolution?: string | null;
  status: 'PENDING';
  createdAt: string;
  updatedAt: string;
};

export type CreateTicketPayload = {
  category: string;
  description: string;
  attachments?: string[];
  allowContact: boolean;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

type CreateTicketRequestPayload = CreateTicketPayload & {
  appVersion?: string | null;
  deviceName?: string | null;
  osVersion?: string | null;
};

type CreateTicketResponse = {
  success: boolean;
  message: string;
  ticket: TicketItem;
};

type TicketsResponse = {
  success: boolean;
  count: number;
  tickets: TicketItem[];
};

type TicketDetailResponse = {
  success: boolean;
  ticket: TicketItem;
};
type UploadAttachmentsResponse = {
  success: boolean;
  message: string;
  attachments: string[];
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

type TicketAttachmentSignatureResponse = {
  success: boolean;
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

const packageVersion =
  typeof require === 'function'
    ? (require('../../package.json')?.version as string | undefined)
    : undefined;

const normalizeOptionalString = (value: unknown) => {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const getTicketAppInfo = () => {
  const platformConstants =
    (Platform.constants as Record<string, unknown> | undefined) ??
    (NativeModules.PlatformConstants as Record<string, unknown> | undefined) ??
    {};

  const appVersion = normalizeOptionalString(
    platformConstants.appVersion ??
      platformConstants.VersionName ??
      packageVersion,
  );

  const model = normalizeOptionalString(platformConstants.Model);
  const brand = normalizeOptionalString(platformConstants.Brand);
  const iosDevice =
    normalizeOptionalString(platformConstants.interfaceIdiom) ??
    normalizeOptionalString(platformConstants.systemName);
  const deviceName =
    normalizeOptionalString([brand, model].filter(Boolean).join(' ')) ??
    model ??
    iosDevice;

  const osVersion = normalizeOptionalString(
    platformConstants.Release ??
      platformConstants.osVersion ??
      (typeof Platform.Version === 'string' || typeof Platform.Version === 'number'
        ? String(Platform.Version)
        : ''),
  );

  return {
    appVersion,
    deviceName,
    osVersion,
  };
};

const buildCloudinaryFileValue = (asset: Asset) => {
  if (asset.base64) {
    const mimeType = asset.type ?? 'image/jpeg';
    return `data:${mimeType};base64,${asset.base64}`;
  }

  return getUploadAssetParts(asset) as any;
};

const getUploadAssetParts = (asset: Asset) => ({
  uri: asset.uri ?? '',
  type: asset.type ?? 'image/jpeg',
  name: asset.fileName ?? `ticket-${Date.now()}.jpg`,
});

const buildCloudinaryFormData = (
  asset: Asset,
  signatureData: TicketAttachmentSignatureResponse,
) => {
  const formData = new FormData();
  formData.append('file', buildCloudinaryFileValue(asset));
  formData.append('api_key', signatureData.apiKey);
  formData.append('folder', signatureData.folder);
  formData.append('timestamp', String(signatureData.timestamp));
  formData.append('signature', signatureData.signature);
  return formData;
};

export const ticketService = {
  async createTicket(payload: CreateTicketPayload): Promise<TicketItem> {
    const response = await API.post<CreateTicketResponse>(
      '/tickets/create',
      {
        ...payload,
        ...getTicketAppInfo(),
      } satisfies CreateTicketRequestPayload,
    );
    return response.data.ticket;
  },

  async getTickets(): Promise<TicketItem[]> {
    const response = await API.get<TicketsResponse>('/tickets');
    return response.data.tickets;
  },

  async getTicketById(ticketId: string): Promise<TicketItem> {
    const response = await API.get<TicketDetailResponse>(`/tickets/${ticketId}`);
    return response.data.ticket;
  },

  async uploadAttachment(asset: Asset): Promise<string> {
    if (!asset.uri && !asset.base64) {
      throw new Error('Selected file is missing upload data.');
    }

    console.log('formData payload ready');
    console.log('attachment upload source:', asset.base64 ? 'base64' : 'uri');

    try {
      const signatureResponse =
        await API.get<TicketAttachmentSignatureResponse>(
          '/tickets/attachments/signature',
        );

      const signatureData = signatureResponse.data;
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: 'POST',
          body: buildCloudinaryFormData(asset, signatureData),
        },
      );

      const cloudinaryData =
        (await cloudinaryResponse.json().catch(() => null)) as CloudinaryUploadResponse | null;

      if (
        cloudinaryResponse.ok &&
        typeof cloudinaryData?.secure_url === 'string' &&
        cloudinaryData.secure_url.trim()
      ) {
        return cloudinaryData.secure_url;
      }

      throw new Error(
        cloudinaryData?.error?.message ?? 'Cloudinary attachment upload failed.',
      );
    } catch (cloudinaryError: any) {
      throw new Error(
        cloudinaryError?.message ??
          'Attachment upload failed.',
      );
    }
  },
};
