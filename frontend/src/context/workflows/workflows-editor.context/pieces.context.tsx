import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import localForage from "services/config/local-forage.config";
import {
  type IGetRepoOperatorsResponseInterface,
  type IOperator,
  type IOperatorForageSchema,
  type IOperatorRepository,
  type IRepositoryOperators,
  useAuthenticatedGetOperatorRepositories,
} from "services/requests/piece";
import { useFetchAuthenticatedGetRepoIdOperators } from "services/requests/piece/get-piece-repository-pieces.request";
import { createCustomContext } from "utils";

export interface IPiecesContext {
  repositories: IOperatorRepository[];
  repositoriesError: boolean;
  repositoriesLoading: boolean;
  repositoryOperators: IRepositoryOperators;

  search: string;
  handleSearch: (word: string) => void;

  fetchRepoById: (params: {
    id: string;
  }) => Promise<IGetRepoOperatorsResponseInterface>;
  fetchForagePieceById: (id: number) => Promise<IOperator | undefined>;
}

export const [PiecesContext, usesPieces] =
  createCustomContext<IPiecesContext>("Pieces Context");

const PiecesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [search, handleSearch] = useState("");
  const [repositoryOperators, setRepositoryOperatos] =
    useState<IRepositoryOperators>({});

  const fetchRepoById = useFetchAuthenticatedGetRepoIdOperators();

  const {
    data,
    error: repositoriesError,
    isValidating: repositoriesLoading,
    // mutate: repositoriesRefresh
  } = useAuthenticatedGetOperatorRepositories({});

  const repositories: IOperatorRepository[] = useMemo(
    () => data?.data.filter((repo) => repo.name.includes(search)) ?? [],
    [data, search],
  );

  const fetchForagePieceById = useCallback(async (id: number) => {
    const pieces = await localForage.getItem<IOperatorForageSchema>("pieces");
    if (pieces !== null) {
      return pieces[id];
    }
  }, []);

  useEffect(() => {
    const updateRepositoriesOperators = async () => {
      const repositoyOperatorsAux: IRepositoryOperators = {};
      const forageOperators: IOperatorForageSchema = {};
      for (const repo of repositories) {
        fetchRepoById({ id: repo.id })
          .then((pieces: any) => {
            repositoyOperatorsAux[repo.id] = [];
            for (const op of pieces) {
              repositoyOperatorsAux[repo.id].push(op);
              forageOperators[op.id] = op;
            }
            setRepositoryOperatos(repositoyOperatorsAux);
            void localForage.setItem("pieces", forageOperators);
          })
          .catch((e) => {
            console.log(e);
          });
        // Set piece item to storage -> {piece_id: Operator}
      }
    };
    void updateRepositoriesOperators();
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
    repositoryOperators,
    search,
  };

  return (
    <PiecesContext.Provider value={value}>{children}</PiecesContext.Provider>
  );
};

export default PiecesProvider;
