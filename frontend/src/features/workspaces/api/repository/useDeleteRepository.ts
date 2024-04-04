import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { dominoApiClient } from "services/clients/domino.client";

export const useDeleteRepository = (
  config: MutationConfig<{ id: string }> = {},
) => {
  return useMutation({
    mutationFn: async ({ id }) => {
      await deleteRepository(id);
    },

    ...config,
  });
};

const deleteRepository: (id: string) => Promise<void> = async (id) => {
  await dominoApiClient.delete(`/pieces-repositories/${id}`);
};
