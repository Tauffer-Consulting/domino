import axios from "axios";
import { type IWorkflowPieceData } from "features/workflowEditor/context/types";
import { type Edge, type Node } from "reactflow";
import useSWR from "swr";

const REPO_URL =
  "https://raw.githubusercontent.com/Tauffer-Consulting/domino_pieces_gallery/feature/workflows_gallery/workflows_gallery";

const getWorkflowsExampleUrl = `${REPO_URL}/index.json`;

type GithubReposContent = Array<{
  title: string;
  description: string;
  jsonFile: string;
  levelTag: "Advanced" | "Beginner" | "Intermediate";
}>;

interface JSONFile {
  workflowPieces: Record<string, Piece>;
  workflowPiecesData: IWorkflowPieceData;
  workflowNodes: Node[];
  workflowEdges: Edge[];
}

export type WorkflowsGalleryExamples = Array<{
  title: string;
  description: string;
  jsonFile: JSONFile;
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

export const useAuthenticatedGetWorkflowsExamples = (fetch: boolean) => {
  const fetcher = async () => await getWorkflowsExample().then((data) => data);

  return useSWR(
    fetch ? getWorkflowsExampleUrl : null,
    async () => await fetcher(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
