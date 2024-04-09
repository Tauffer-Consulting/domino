import { type MutationConfig } from "@services/clients/react-query.client";
import { useMutation } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { toast } from "react-toastify";
import { dominoApiClient } from "services/clients/domino.client";

export const useDeleteRepository = (
  config: MutationConfig<{ id: string }> = {},
) => {
  return useMutation({
    mutationFn: async ({ id }) => {
      await deleteRepository(id);
    },
    onError: (e: AxiosError<{ detail: string }>) => {
      const message =
        (e.response?.data?.detail ?? e?.message) || "Something went wrong";

      toast.error(message, {
        toastId: message,
      });
    },
    ...config,
  });
};

const deleteRepository: (id: string) => Promise<void> = async (id) => {
  await dominoApiClient.delete(`/pieces-repositories/${id}`);
};
