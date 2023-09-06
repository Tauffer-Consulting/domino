import { useWorkspaces } from "context/workspaces";
import { type FC, useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  type IGetPiecesRepositoriesReleasesParams,
  type IGetPiecesRepositoriesReleasesResponseInterface,
  useAuthenticatedGetPieceRepositories,
} from "services/requests/piece";
import { useAuthenticatedGetPieceRepositoriesReleases } from "services/requests/piece/getPiecesRepositoriesReleases.request";
import { useAuthenticatedDeleteRepository } from "services/requests/repository";
import {
  type IPostWorkspaceRepositoryPayload,
  type IPostWorkspaceRepositoryResponseInterface,
  type IWorkspaceSummary,
  useAuthenticatedGetWorkspace,
  useAuthenticatedPostPiecesRepository,
} from "services/requests/workspaces";
import { createCustomContext } from "utils";

interface IWorkspaceSettingsContext {
  workspace: IWorkspaceSummary | null;

  workspaceData: IWorkspaceSummary | undefined;
  workspaceDataError: boolean;
  workspaceDataLoading: boolean;
  handleRefreshWorkspaceData: () => void;

  repositories: PieceRepository[];
  repositoriesError: boolean;
  repositoriesLoading: boolean;
  handleRefreshRepositories: () => void;

  handleAddRepository: (
    params: Omit<IPostWorkspaceRepositoryPayload, "workspace_id">,
  ) => Promise<IPostWorkspaceRepositoryResponseInterface | unknown>;

  handleFetchRepoReleases: (
    params: IGetPiecesRepositoriesReleasesParams,
  ) => Promise<IGetPiecesRepositoriesReleasesResponseInterface>;
  handleDeleteRepository: (id: string) => Promise<any>;
  selectedRepositoryId: number | null;
  setSelectedRepositoryId: (id: number | null) => void;

  defaultRepositories: PieceRepository[];
  defaultRepositoriesError: boolean;
  defaultRepositoriesLoading: boolean;
  handleRefreshDefaultRepositories: () => void;
}

export const [WorkspaceSettingsContext, useWorkspaceSettings] =
  createCustomContext<IWorkspaceSettingsContext>("Workspace Settings Context");

interface IWorkspaceSettingsProviderProps {
  children: React.ReactNode;
}
export const WorkspaceSettingsProvider: FC<IWorkspaceSettingsProviderProps> = ({
  children,
}) => {
  const { workspace } = useWorkspaces();

  const [selectedRepositoryId, setSelectedRepositoryId] = useState<
    number | null
  >(null);

  // Requests hooks
  const {
    data: workspaceData,
    error: workspaceDataError,
    isValidating: workspaceDataLoading,
    mutate: refreshWorkspaceData,
  } = useAuthenticatedGetWorkspace({ id: workspace?.id ?? "" });

  /**
   * @todo add pagination
   */
  const {
    data: repositories,
    error: repositoriesError,
    isValidating: repositoriesLoading,
    mutate: refreshRepositories,
  } = useAuthenticatedGetPieceRepositories({});

  const {
    data: defaultRepositories,
    error: defaultRepositoriesError,
    isValidating: defaultRepositoriesLoading,
    mutate: refreshDefaultRepositories,
  } = useAuthenticatedGetPieceRepositories({ source: "default" });

  const postRepository = useAuthenticatedPostPiecesRepository({
    workspace: workspace?.id ?? "",
  });
  const handleFetchRepoReleases =
    useAuthenticatedGetPieceRepositoriesReleases();
  const handleDeleteRepository = useAuthenticatedDeleteRepository();

  // Handlers
  const handleAddRepository = useCallback(
    async (payload: Omit<IPostWorkspaceRepositoryPayload, "workspace_id">) =>
      await postRepository({ ...payload, workspace_id: workspace?.id ?? "" })
        .then((data) => {
          toast.success(`Repository added successfully!`);
          void refreshWorkspaceData();
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
    [postRepository, refreshWorkspaceData, workspace?.id],
  );

  return (
    <WorkspaceSettingsContext.Provider
      value={{
        workspace,
        workspaceData,
        workspaceDataError: !!workspaceDataError,
        workspaceDataLoading,
        repositories: repositories?.data ?? [],
        repositoriesLoading,
        repositoriesError,
        handleRefreshRepositories: async () => await refreshRepositories(),
        handleRefreshWorkspaceData: async () => await refreshWorkspaceData(),
        handleAddRepository,
        handleFetchRepoReleases,
        selectedRepositoryId,
        setSelectedRepositoryId,
        handleDeleteRepository,
        defaultRepositories: defaultRepositories?.data ?? [],
        defaultRepositoriesError: !!defaultRepositoriesError,
        defaultRepositoriesLoading,
        handleRefreshDefaultRepositories: async () =>
          await refreshDefaultRepositories(),
      }}
    >
      {children}
    </WorkspaceSettingsContext.Provider>
  );
};
