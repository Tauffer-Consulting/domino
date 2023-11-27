import {
  type IGetRepoPiecesResponseInterface,
  useAuthenticatedGetPieceRepositories,
  useFetchAuthenticatedGetRepoIdPieces,
  type IGetPiecesRepositoriesResponseInterface,
  type IGetPiecesRepositoriesReleasesParams,
  type IGetPiecesRepositoriesReleasesResponseInterface,
  useAuthenticatedGetPieceRepositoriesReleases,
  useAuthenticatedDeleteRepository,
} from "features/myWorkflows/api";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import localForage from "services/config/localForage.config";
import { type KeyedMutator } from "swr";
import { createCustomContext } from "utils";

import { useAuthenticatedPostPiecesRepository } from "./api";
import {
  type IPostWorkspaceRepositoryPayload,
  type IPostWorkspaceRepositoryResponseInterface,
} from "./types";
import { useWorkspaces } from "./workspaces";

export interface IPiecesContext {
  repositories: PieceRepository[];
  defaultRepositories: PieceRepository[];
  repositoryPieces: PiecesRepository;
  repositoriesLoading: boolean;

  selectedRepositoryId: null | number;
  setSelectedRepositoryId: React.Dispatch<React.SetStateAction<number | null>>;

  handleRefreshRepositories: KeyedMutator<
    IGetPiecesRepositoriesResponseInterface | undefined
  >;
  handleAddRepository: (
    params: Omit<IPostWorkspaceRepositoryPayload, "workspace_id">,
  ) => Promise<IPostWorkspaceRepositoryResponseInterface | unknown>;

  handleFetchRepoReleases: (
    params: IGetPiecesRepositoriesReleasesParams,
  ) => Promise<IGetPiecesRepositoriesReleasesResponseInterface | undefined>;

  handleDeleteRepository: (id: string) => Promise<any>;

  fetchRepoById: (params: {
    id: string;
  }) => Promise<IGetRepoPiecesResponseInterface>;
  fetchForagePieceById: (id: number) => Promise<Piece | undefined>;
}

export const [PiecesContext, usesPieces] =
  createCustomContext<IPiecesContext>("Pieces Context");

const PiecesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<
    number | null
  >(null);
  const [repositoryPieces, setRepositoryPieces] = useState<PiecesRepository>(
    {},
  );

  const { workspace, handleRefreshWorkspaces } = useWorkspaces();

  const fetchRepoById = useFetchAuthenticatedGetRepoIdPieces();

  const {
    data: repositories,
    error: repositoriesError,
    isValidating: repositoriesLoading,
    mutate: handleRefreshRepositories,
  } = useAuthenticatedGetPieceRepositories({});

  useEffect(() => {
    let active = true;
    void loadRepositoriesPieces();
    return () => {
      active = false;
    };

    async function loadRepositoriesPieces() {
      const repositoryPiecesAux: PiecesRepository = {};
      const foragePieces: PieceForageSchema = {};
      if (!active) {
        return;
      }
      if (!repositories?.data?.length) {
        void localForage.setItem("pieces", foragePieces);
        setRepositoryPieces(repositoryPiecesAux);
      } else {
        for (const repo of repositories.data) {
          await fetchRepoById({ id: repo.id })
            .then((pieces: any) => {
              repositoryPiecesAux[repo.id] = [];
              for (const op of pieces) {
                repositoryPiecesAux[repo.id].push(op);
                foragePieces[op.id] = op;
              }
              void localForage.setItem("pieces", foragePieces);
            })
            .catch((e) => {
              console.log(e);
            });
        }
        setRepositoryPieces(repositoryPiecesAux);
      }
    }
  }, [repositories, fetchRepoById]);

  const { data: defaultRepositories } = useAuthenticatedGetPieceRepositories({
    source: "default",
  });

  const fetchForagePieceById = useCallback(async (id: number) => {
    const pieces = await localForage.getItem<PieceForageSchema>("pieces");
    if (pieces !== null) {
      return pieces[id];
    }
  }, []);

  const postRepository = useAuthenticatedPostPiecesRepository({
    workspace: workspace?.id ?? "",
  });

  const handleAddRepository = useCallback(
    async (payload: Omit<IPostWorkspaceRepositoryPayload, "workspace_id">) =>
      await postRepository({ ...payload, workspace_id: workspace?.id ?? "" })
        .then(async (data) => {
          toast.success(`Repository added successfully!`);
          handleRefreshWorkspaces();
          await handleRefreshRepositories();
          return data;
        })
        .catch((e) => {
          if (e.response?.status === 403) {
            toast.error(
              `You don't have permission to add repositories to this workspace.`,
            );
            return;
          }
          toast.error(`Error adding repository, try again later.`);
        }),
    [postRepository, handleRefreshWorkspaces, workspace?.id],
  );

  const handleFetchRepoReleases =
    useAuthenticatedGetPieceRepositoriesReleases();

  const handleDeleteRepository = useAuthenticatedDeleteRepository();

  useEffect(() => {
    if (repositoriesError) {
      toast.error("Error loading repositories, try again later");
    }
  }, [repositoriesError]);

  const value: IPiecesContext = {
    repositories: repositories?.data ?? [],
    defaultRepositories: defaultRepositories?.data ?? [],
    repositoryPieces,
    repositoriesLoading,

    selectedRepositoryId,
    setSelectedRepositoryId,

    handleRefreshRepositories,
    handleAddRepository,
    handleFetchRepoReleases,
    handleDeleteRepository,

    fetchForagePieceById,
    fetchRepoById,
  };

  return (
    <PiecesContext.Provider value={value}>{children}</PiecesContext.Provider>
  );
};

export default PiecesProvider;
