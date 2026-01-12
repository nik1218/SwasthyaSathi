// User and Authentication Types
export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  dateOfBirth?: Date | string;
  gender?: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address: string;
  city: string;
  country: string;
  profileComplete?: boolean;
  storageUsed?: number; // in bytes
  storageQuota?: number; // in bytes
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  fullName: string;
  dateOfBirth: string; // ISO date string
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface AuthCredentials {
  phoneNumber: string;
  password: string;
}

export interface RegisterData {
  phoneNumber: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Document Types
export enum DocumentType {
  LAB_REPORT = 'lab_report',
  PRESCRIPTION = 'prescription',
  MEDICAL_CERTIFICATE = 'medical_certificate',
  XRAY = 'xray',
  CT_SCAN = 'ct_scan',
  MRI = 'mri',
  OTHER = 'other',
}

export enum DocumentStatus {
  PENDING_PROCESSING = 'pending_processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

export interface Document {
  id: string;
  userId: string;
  type: DocumentType;
  title?: string;
  description?: string;
  notes?: string; // User-added notes or annotations
  fileUrl: string;
  thumbnailUrl?: string; // 300x400px thumbnail
  fileSize: number; // in bytes
  mimeType: string;
  status: DocumentStatus;
  ocrStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedAt: Date;
  aiAnalysis?: {
    extractedText?: string;
    summary?: string;
    insights?: string[];
    processedAt: Date;
  };
}

export interface UploadDocumentRequest {
  type: DocumentType;
  title: string;
  description?: string;
  processWithAI?: boolean;
  processWithOCR?: boolean;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  notes?: string;
  type?: DocumentType;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Error Types
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  DUPLICATE_PHONE = 'DUPLICATE_PHONE',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE = 'UNSUPPORTED_FILE_TYPE',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',
  OCR_PROCESSING_FAILED = 'OCR_PROCESSING_FAILED',
  OCR_QUOTA_EXCEEDED = 'OCR_QUOTA_EXCEEDED',
  OCR_TIMEOUT = 'OCR_TIMEOUT',
}
