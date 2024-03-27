import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

export const useDeleteRepository = (
  config: MutationConfig<{ id: string }> = {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }) => {
      await deleteRepository(id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["REPOSITORIES"] });
    },
    ...config,
  });
};

const deleteRepository: (id: string) => Promise<void> = async (id) => {
  await dominoApiClient.delete(`/pieces-repositories/${id}`);
};
