import { type QueryConfig } from "@services/clients/react-query.client";
import { skipToken, useQuery } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

interface RepositorySecretsParams {
  repositoryId: string;
}

interface RepositorySecrets {
  id: number;
  name: string;
  is_filled: boolean;
}

export const useRepositorySecrets = (
  { repositoryId }: Partial<RepositorySecretsParams>,
  config: QueryConfig<RepositorySecrets[]> = {},
) => {
  return useQuery({
    queryKey: ["REPOSITORIES-SECRETS", repositoryId],
    queryFn: repositoryId
      ? async () => await getRepositorySecrets(repositoryId)
      : skipToken,
    throwOnError(e, _query) {
      const message =
        ((e as AxiosError<{ detail?: string }>).response?.data?.detail ??
          e?.message) ||
        "Something went wrong";

      toast.error(message, {
        toastId: message,
      });

      return false;
    },
    ...config,
  });
};

const getRepositorySecrets = async (
  repositoryId: string,
): Promise<RepositorySecrets[]> => {
  return await dominoApiClient.get(
    `/pieces-repositories/${repositoryId}/secrets`,
  );
};
