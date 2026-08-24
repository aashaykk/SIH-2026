import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueService, IssueFilters } from '../services/issueService';

export const ISSUE_KEYS = {
  all: ['issues'] as const,
  lists: () => [...ISSUE_KEYS.all, 'list'] as const,
  list: (filters?: IssueFilters) => [...ISSUE_KEYS.lists(), filters] as const,
  details: () => [...ISSUE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ISSUE_KEYS.details(), id] as const,
};

/**
 * Hook to fetch issues list with optional filters
 */
export function useIssuesQuery(filters?: IssueFilters) {
  return useQuery({
    queryKey: ISSUE_KEYS.list(filters),
    queryFn: () => issueService.getIssues(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Hook to fetch single issue details
 */
export function useIssueDetailsQuery(id: string) {
  return useQuery({
    queryKey: ISSUE_KEYS.detail(id),
    queryFn: () => issueService.getIssueById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new issue
 */
export function useCreateIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => issueService.createIssue(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ISSUE_KEYS.all });
    },
  });
}

/**
 * Hook to verify issue resolution
 */
export function useVerifyIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      issueService.verifyIssue(id, verified),
    onSuccess: (updatedIssue) => {
      queryClient.invalidateQueries({ queryKey: ISSUE_KEYS.all });
      queryClient.setQueryData(ISSUE_KEYS.detail(updatedIssue.id), updatedIssue);
    },
  });
}

/**
 * Hook to reopen an issue
 */
export function useReopenIssueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => issueService.reopenIssue(id),
    onSuccess: (updatedIssue) => {
      queryClient.invalidateQueries({ queryKey: ISSUE_KEYS.all });
      queryClient.setQueryData(ISSUE_KEYS.detail(updatedIssue.id), updatedIssue);
    },
  });
}

/**
 * Hook to fetch aggregate issues statistics
 */
export function useIssuesStatsQuery() {
  return useQuery({
    queryKey: [...ISSUE_KEYS.all, 'stats'],
    queryFn: () => issueService.getIssueStats(),
    staleTime: 1000 * 30, // 30 seconds
  });
}
