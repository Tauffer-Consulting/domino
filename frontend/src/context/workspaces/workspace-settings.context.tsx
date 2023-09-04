import { type FC, useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  type IGetOperatorsRepositoriesReleasesParams,
  type IGetOperatorsRepositoriesReleasesResponseInterface,
  type IOperatorRepository,
  useAuthenticatedGetOperatorRepositories,
} from "services/requests/piece";
import { useAuthenticatedGetOperatorRepositoriesReleases } from "services/requests/piece/get-operators-repositories-releases.request";
import { useAuthenticatedDeleteRepository } from "services/requests/repository";
import {
  type IPostWorkspaceRepositoryPayload,
  type IPostWorkspaceRepositoryResponseInterface,
  type IWorkspaceSummary,
  useAuthenticatedGetWorkspace,
  useAuthenticatedPostOperatorsRepository,
} from "services/requests/workspaces";
import { createCustomContext } from "utils";

import { useWorkspaces } from "./workspaces.context";

interface IWorkspaceSettingsContext {
  workspace: IWorkspaceSummary | null;

  workspaceData: IWorkspaceSummary | undefined;
  workspaceDataError: boolean;
  workspaceDataLoading: boolean;
  handleRefreshWorkspaceData: () => void;

  repositories: IOperatorRepository[];
  repositoriesError: boolean;
  repositoriesLoading: boolean;
  handleRefreshRepositories: () => void;

  handleAddRepository: (
    params: Omit<IPostWorkspaceRepositoryPayload, "workspace_id">,
  ) => Promise<IPostWorkspaceRepositoryResponseInterface | unknown>;

  handleFetchRepoReleases: (
    params: IGetOperatorsRepositoriesReleasesParams,
  ) => Promise<IGetOperatorsRepositoriesReleasesResponseInterface>;
  handleDeleteRepository: (id: string) => Promise<any>;
  selectedRepositoryId: number | null;
  setSelectedRepositoryId: (id: number | null) => void;

  defaultRepositories: IOperatorRepository[];
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
  } = useAuthenticatedGetOperatorRepositories({});

  const {
    data: defaultRepositories,
    error: defaultRepositoriesError,
    isValidating: defaultRepositoriesLoading,
    mutate: refreshDefaultRepositories,
  } = useAuthenticatedGetOperatorRepositories({ source: "default" });

  const postRepository = useAuthenticatedPostOperatorsRepository({
    workspace: workspace?.id ?? "",
  });
  const handleFetchRepoReleases =
    useAuthenticatedGetOperatorRepositoriesReleases();
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
