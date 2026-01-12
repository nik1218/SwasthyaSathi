import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiResponse,
  AuthResponse,
  RegisterData,
  AuthCredentials,
  Document,
  UploadDocumentRequest,
  User,
  UpdateProfileData,
} from '@swasthyasathi/shared';

const API_BASE_URL = 'http://localhost:3000/api'; // Change for production
const TOKEN_KEY = '@swasthyasathi_token';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage
          await AsyncStorage.removeItem(TOKEN_KEY);
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    );
    if (response.data.data?.token) {
      await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
    }
    return response.data.data!;
  }

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    if (response.data.data?.token) {
      await AsyncStorage.setItem(TOKEN_KEY, response.data.data.token);
    }
    return response.data.data!;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  }

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  }

  // Documents
  async uploadDocument(
    file: { uri: string; type: string; name: string },
    metadata: UploadDocumentRequest,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    if (metadata.type) {
      formData.append('type', metadata.type);
    }
    if (metadata.title) {
      formData.append('title', metadata.title);
    }
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    if (metadata.processWithAI !== undefined) {
      formData.append('processWithAI', String(metadata.processWithAI));
    }

    const response = await this.client.post<ApiResponse<Document>>(
      '/documents/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return response.data.data!;
  }

  async getMyDocuments(): Promise<Document[]> {
    const response = await this.client.get<ApiResponse<Document[]>>(
      '/documents/my-documents'
    );
    return response.data.data!;
  }

  async getDocument(documentId: string): Promise<Document> {
    const response = await this.client.get<ApiResponse<Document>>(
      `/documents/${documentId}`
    );
    return response.data.data!;
  }

  async updateDocument(
    documentId: string,
    data: { title?: string; description?: string; notes?: string; type?: string }
  ): Promise<Document> {
    const response = await this.client.put<ApiResponse<Document>>(
      `/documents/${documentId}`,
      data
    );
    return response.data.data!;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.client.delete(`/documents/${documentId}`);
  }

  async getStorageInfo(): Promise<{
    used: number;
    quota: number;
    remaining: number;
    usedPercentage: number;
  }> {
    const response = await this.client.get<ApiResponse<{
      used: number;
      quota: number;
      remaining: number;
      usedPercentage: number;
    }>>('/documents/storage/info');
    return response.data.data!;
  }

  // Profile
  async getProfile(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/profile');
    return response.data.data!;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await this.client.put<ApiResponse<User>>(
      '/profile',
      data
    );
    return response.data.data!;
  }
}

export default new ApiService();
