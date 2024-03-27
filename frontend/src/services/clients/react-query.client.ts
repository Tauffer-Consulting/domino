import {
  QueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type DefaultOptions,
} from "@tanstack/react-query";
import { type AxiosError } from "axios";

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export type QueryConfig<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;

export type MutationConfig<Variables = unknown, Data = unknown> = Omit<
  UseMutationOptions<Data, AxiosError, Variables>,
  "mutationKey" | "mutationFn"
>;
