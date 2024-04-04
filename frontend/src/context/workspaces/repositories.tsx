import { useQueryClient } from "@tanstack/react-query";
import { useStorage } from "context/storage/useStorage";
import {
  useRepositories,
  useRepositoriesReleases,
  useAddRepository,
  useDeleteRepository,
  usePieces,
  type AddRepositoryParams,
  type AddRepositoryResponse,
  type RepositoriesReleasesParams,
  type RepositoriesReleasesResponse,
} from "features/workspaces/api";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { createCustomContext } from "utils";

import { useWorkspaces } from "./workspaces";

export interface IPiecesContext {
  repositories: Repository[];
  defaultRepositories: Repository[];
  repositoryPieces: PiecesRepository;
  repositoriesLoading: boolean;

  selectedRepositoryId?: number;
  setSelectedRepositoryId: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;

  handleAddRepository: (
    params: AddRepositoryParams,
  ) => Promise<AddRepositoryResponse>;

  handleFetchRepoReleases: (
    params: RepositoriesReleasesParams,
  ) => Promise<RepositoriesReleasesResponse[]>;

  handleDeleteRepository: (params: { id: string }) => Promise<void>;

  fetchForagePieceById: (id: number) => Piece | undefined;
}

type PieceForageSchema = Record<string | number, Piece>;

export const [PiecesContext, usesPieces] =
  createCustomContext<IPiecesContext>("Pieces Context");

const PiecesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { workspace } = useWorkspaces();
  const localStorage = useStorage();

  const [selectedRepositoryId, setSelectedRepositoryId] = useState<
    number | undefined
  >();

  const queryClient = useQueryClient();

  const { data: defaultRepositories } = useRepositories({
    source: "default",
  });

  const { data: repositories, isLoading: repositoriesLoading } =
    useRepositories({
      workspaceId: workspace?.id,
      source: "github",
    });

  const { data: pieces } = usePieces({
    repositoryIds: repositories?.data.map(({ id }) => id) ?? [],
  });

  const { data: _defaultPieces } = usePieces({
    repositoryIds: defaultRepositories?.data.map(({ id }) => id) ?? [],
  });

  const { mutateAsync: handleFetchRepoReleases } = useRepositoriesReleases({
    workspaceId: workspace?.id,
  });

  const { mutateAsync: handleAddRepository } = useAddRepository(
    {
      workspaceId: workspace?.id,
    },
    {
      onSuccess: async () => {
        toast.success(`Repository added successfully!`);
        await queryClient.invalidateQueries({
          queryKey: ["REPOSITORIES", workspace?.id],
        });
      },
    },
  );

  const { mutateAsync: handleDeleteRepository } = useDeleteRepository({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["REPOSITORIES"] });
    },
  });

  const repositoryPieces = useMemo(() => {
    const repositoryPiecesAux: PiecesRepository = {};
    const foragePieces: PieceForageSchema = {};

    if (!pieces?.length) {
      localStorage.setItem("pieces", foragePieces);
      return repositoryPiecesAux;
    } else {
      for (const piece of pieces) {
        if (repositoryPiecesAux[piece.repository_id]?.length) {
          repositoryPiecesAux[piece.repository_id].push(piece);
        } else {
          repositoryPiecesAux[piece.repository_id] = [];
          repositoryPiecesAux[piece.repository_id].push(piece);
        }
        foragePieces[piece.id] = piece;
      }

      localStorage.setItem("pieces", foragePieces);
      return repositoryPiecesAux;
    }
  }, [pieces]);

  const fetchForagePieceById = useCallback((id: number) => {
    const pieces = localStorage.getItem<PieceForageSchema>("pieces");
    if (pieces !== null) {
      return pieces[id];
    }
  }, []);

  const value: IPiecesContext = {
    repositories: repositories?.data ?? [],
    defaultRepositories: defaultRepositories?.data ?? [],
    repositoryPieces,
    repositoriesLoading,

    selectedRepositoryId,
    setSelectedRepositoryId,

    handleAddRepository,
    handleFetchRepoReleases,
    handleDeleteRepository,

    fetchForagePieceById,
  };

  return (
    <PiecesContext.Provider value={value}>{children}</PiecesContext.Provider>
  );
};

export default PiecesProvider;
