import { type QueryConfig } from "@services/clients/react-query.client";
import { useQuery, skipToken } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";
import { type WorkflowPieceData } from "features/workflowEditor/context/types";
import { toast } from "react-toastify";
import { type Edge, type Node } from "reactflow";

interface JSONFile {
  workflowPieces: Record<string, Piece>;
  workflowPiecesData: WorkflowPieceData;
  workflowNodes: Node[];
  workflowEdges: Edge[];
}

export type WorkflowsGalleryExamples = Array<{
  title: string;
  description: string;
  jsonFile: JSONFile;
  levelTag: "Advanced" | "Beginner" | "Intermediate";
}>;

export const useWorkflowsExamples = (
  fetch: boolean,
  config: QueryConfig<WorkflowsGalleryExamples> = {},
) => {
  return useQuery({
    queryKey: ["WORKFLOWS-EXAMPLES"],
    queryFn: fetch ? async () => await getWorkflowsExample() : skipToken,
    throwOnError(e, _query) {
      const message =
        ((e as AxiosError<{ detail?: string }>).response?.data?.detail ??
          e?.message) ||
        "Something went wrong";

      toast.error(message, {
        toastId: message,
      });

      return false;
    },
    ...config,
  });
};

const REPO_URL =
  "https://raw.githubusercontent.com/Tauffer-Consulting/domino_pieces_gallery/main/workflows_gallery";

const getWorkflowsExampleUrl = `${REPO_URL}/index.json`;

type GithubReposContent = Array<{
  title: string;
  description: string;
  jsonFile: string;
  levelTag: "Advanced" | "Beginner" | "Intermediate";
}>;

const getWorkflowsExample: () => Promise<WorkflowsGalleryExamples> =
  async () => {
    const { data } = await axios.get<GithubReposContent>(
      getWorkflowsExampleUrl,
    );
    const jsons: WorkflowsGalleryExamples = [];
    for (const value of data) {
      const { data: json } = await axios.get<JSONFile>(
        `${REPO_URL}/${value.jsonFile}`,
      );
      jsons.push({ ...value, jsonFile: json });
    }

    return jsons;
  };
