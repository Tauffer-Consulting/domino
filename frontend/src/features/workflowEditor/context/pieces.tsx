import {
  type IGetRepoPiecesResponseInterface,
  useAuthenticatedGetPieceRepositories,
  useFetchAuthenticatedGetRepoIdPieces,
} from "features/workflows/api";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import localForage from "services/config/localForage.config";
import { createCustomContext } from "utils";

export interface IPiecesContext {
  repositories: PieceRepository[];
  repositoriesError: boolean;
  repositoriesLoading: boolean;
  repositoryPieces: PiecesRepository;

  search: string;
  handleSearch: (word: string) => void;

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
  const [search, handleSearch] = useState("");
  const [repositoryPieces, setRepositoryPieces] = useState<PiecesRepository>(
    {},
  );

  const fetchRepoById = useFetchAuthenticatedGetRepoIdPieces();

  const {
    data,
    error: repositoriesError,
    isValidating: repositoriesLoading,
    // mutate: repositoriesRefresh
  } = useAuthenticatedGetPieceRepositories({});

  const repositories: PieceRepository[] = useMemo(
    () => data?.data.filter((repo) => repo.name.includes(search)) ?? [],
    [data, search],
  );

  const fetchForagePieceById = useCallback(async (id: number) => {
    const pieces = await localForage.getItem<PieceForageSchema>("pieces");
    if (pieces !== null) {
      return pieces[id];
    }
  }, []);

  useEffect(() => {
    const updateRepositoriesPieces = async () => {
      const repositoryPiecesAux: PiecesRepository = {};
      const foragePieces: PieceForageSchema = {};
      for (const repo of repositories) {
        fetchRepoById({ id: repo.id })
          .then((pieces: any) => {
            repositoryPiecesAux[repo.id] = [];
            for (const op of pieces) {
              repositoryPiecesAux[repo.id].push(op);
              foragePieces[op.id] = op;
            }
            setRepositoryPieces(repositoryPiecesAux);
            void localForage.setItem("pieces", foragePieces);
          })
          .catch((e) => {
            console.log(e);
          });
        // Set piece item to storage -> {piece_id: Piece}
      }
    };
    void updateRepositoriesPieces();
  }, [repositories, fetchRepoById]);

  useEffect(() => {
    if (repositoriesError) {
      toast.error("Error loading repositories, try again later");
    }
  }, [repositoriesError]);

  const value: IPiecesContext = {
    fetchForagePieceById,
    fetchRepoById,
    handleSearch,
    repositories,
    repositoriesError,
    repositoriesLoading,
    repositoryPieces,
    search,
  };

  return (
    <PiecesContext.Provider value={value}>{children}</PiecesContext.Provider>
  );
};

export default PiecesProvider;
