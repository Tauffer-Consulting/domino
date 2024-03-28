import { type workspaceStatus } from "@context/workspaces/types";
import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { dominoApiClient } from "services/clients/domino.client";
import { type QueryConfig } from "services/clients/react-query.client";

interface GetWorkspaceUsersParams {
  page: number;
  pageSize: number;
}

export interface GetWorkspaceUsersResponse {
  data: Array<{
    user_id: number;
    user_email: string;
    user_permission: string;
    status: workspaceStatus;
  }>;
  metadata: PaginationMetadata;
}

type UseGetWorkspaceUsers = Partial<GetWorkspaceUsersParams> & {
  workspaceId?: string;
};

export const useWorkspaceUsers = (
  { page = 0, pageSize = 10, workspaceId }: UseGetWorkspaceUsers,
  config: QueryConfig<GetWorkspaceUsersResponse> = {},
) => {
  const queryClient = useQueryClient();

  const response = useQuery({
    queryKey: ["USERS", workspaceId, page, pageSize],
    queryFn: workspaceId
      ? async () => await getWorkspaceMembers({ page, pageSize, workspaceId })
      : skipToken,
    ...config,
  });

  useEffect(() => {
    if (
      response.data?.metadata.last_page &&
      response.data?.metadata.last_page > page
    )
      void queryClient.prefetchQuery({
        queryKey: ["USERS", workspaceId, page + 1, pageSize],
        queryFn: workspaceId
          ? async () =>
              await getWorkspaceMembers({
                page: page + 1,
                pageSize,
                workspaceId,
              })
          : skipToken,
      });
  }, [response, page, pageSize, workspaceId]);

  return response;
};

const getWorkspaceMembers = async ({
  page,
  pageSize,
  workspaceId,
}: GetWorkspaceUsersParams &
  UseGetWorkspaceUsers): Promise<GetWorkspaceUsersResponse> => {
  return await dominoApiClient.get(
    `/workspaces/${workspaceId}/users?page=${page}&page_size=${pageSize}`,
  );
};
