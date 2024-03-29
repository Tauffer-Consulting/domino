import {
  QueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type DefaultOptions,
  type UseInfiniteQueryOptions,
  type InfiniteData,
} from "@tanstack/react-query";
import { type AxiosError } from "axios";

const queryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: true,
    retry: false,
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });

export type QueryConfig<T = unknown> = Omit<
  UseQueryOptions<T, AxiosError>,
  "queryKey" | "queryFn"
>;

export type InfiniteQueryConfig<T = unknown> = Omit<
  UseInfiniteQueryOptions<
    T,
    AxiosError,
    InfiniteData<T, unknown>,
    T,
    Array<string | undefined>,
    number
  >,
  "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
>;
export type MutationConfig<Variables = unknown, Data = unknown> = Omit<
  UseMutationOptions<Data, AxiosError, Variables>,
  "mutationKey" | "mutationFn"
>;
