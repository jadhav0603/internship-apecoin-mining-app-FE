import type { Asset } from 'react-native-image-picker';
import API from './api';

export type TicketPriority = 'low' | 'medium' | 'high';

export type TicketItem = {
  _id: string;
  ticketId: string;
  userId: string;
  category: string;
  priority: TicketPriority;
  description: string;
  attachments: string[];
  allowContact: boolean;
  contactEmail: string | null;
  contactPhone: string | null;
  status: 'PENDING';
  createdAt: string;
  updatedAt: string;
};

export type CreateTicketPayload = {
  category: string;
  priority: TicketPriority;
  description: string;
  attachments?: string[];
  allowContact: boolean;
  contactEmail?: string | null;
  contactPhone?: string | null;
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

const CLOUDINARY_CONFIG = {
  cloudName: 'dvamyyoox',
  uploadPreset: 'apecoin_unsigned',
  folder: 'apecoin/tickets',
};

const getUploadAssetParts = (asset: Asset) => ({
  uri: asset.uri ?? '',
  type: asset.type ?? 'image/jpeg',
  name: asset.fileName ?? `ticket-${Date.now()}.jpg`,
});

export const ticketService = {
  async createTicket(payload: CreateTicketPayload): Promise<TicketItem> {
    const response = await API.post<CreateTicketResponse>('/tickets/create', payload);
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
    if (!asset.uri) {
      throw new Error('Selected file is missing a local URI.');
    }

    const formData = new FormData();
    const file = getUploadAssetParts(asset);

    formData.append('file', file as any);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', CLOUDINARY_CONFIG.folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || typeof data?.secure_url !== 'string') {
      throw new Error(data?.error?.message ?? 'Attachment upload failed.');
    }

    return data.secure_url;
  },
};
