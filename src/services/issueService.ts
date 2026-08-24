import apiClient from './apiClient';
import { ApiResponse, Issue, IssueStatus, IssueCategory, Department } from '../types/models';

export interface IssueFilters {
  status?: IssueStatus;
  category?: IssueCategory;
  department?: Department;
  assignedOfficer?: string;
}

export const issueService = {
  /**
   * Fetch all issues with optional filtering
   */
  async getIssues(filters?: IssueFilters): Promise<Issue[]> {
    const response = await apiClient.get<ApiResponse<Issue[]>>('/issues', {
      params: filters,
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    return [];
  },

  /**
   * Fetch single issue details by UUID
   */
  async getIssueById(id: string): Promise<Issue> {
    const response = await apiClient.get<ApiResponse<Issue>>(`/issues/${id}`);

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Issue not found');
  },

  /**
   * Create a new issue (Multipart form data: image, description, latitude, longitude)
   */
  async createIssue(formData: FormData): Promise<Issue> {
    const response = await apiClient.post<ApiResponse<Issue>>('/issues', formData);

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Failed to submit issue');
  },


  /**
   * Update issue status
   */
  async updateStatus(id: string, status: IssueStatus): Promise<Issue> {
    const response = await apiClient.patch<ApiResponse<Issue>>(`/issues/${id}/status`, {
      status,
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Failed to update status');
  },

  /**
   * Assign issue to officer (Officer/Admin only)
   */
  async assignOfficer(id: string, assignedOfficer: string): Promise<Issue> {
    const response = await apiClient.patch<ApiResponse<Issue>>(`/issues/${id}/assign`, {
      assignedOfficer,
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Failed to assign officer');
  },

  /**
   * Verify issue resolution (Citizen confirmation)
   */
  async verifyIssue(id: string, verified: boolean): Promise<Issue> {
    const response = await apiClient.post<ApiResponse<Issue>>(`/issues/${id}/verify`, {
      verified,
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Failed to verify issue');
  },

  /**
   * Reopen a resolved issue
   */
  async reopenIssue(id: string): Promise<Issue> {
    const response = await apiClient.post<ApiResponse<Issue>>(`/issues/${id}/reopen`);

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data?.message || 'Failed to reopen issue');
  },

  /**
   * Fetch aggregate statistics
   */
  async getIssueStats(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/issues/stats');
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  },
};

export default issueService;
