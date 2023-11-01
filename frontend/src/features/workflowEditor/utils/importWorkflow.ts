import localForage from "services/config/localForage.config";
import * as yup from "yup";

import { type DominoWorkflowForage } from "../context/workflowsEditor";

export const importJsonWorkflow = (
  e: React.ChangeEvent<HTMLInputElement>,
): Promise<DominoWorkflowForage> | null => {
  const file = e.target.files?.[0];

  if (file) {
    return new Promise<DominoWorkflowForage>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(
            e.target?.result as string,
          ) as DominoWorkflowForage;

          resolve(jsonData); // Resolve the promise with the JSON data
        } catch (error) {
          reject(error); // Reject the promise with an error if JSON parsing fails
        }
      };

      reader.readAsText(file);
    });
  }

  return null; // Return null if no file is selected
};

export const validateJsonImported = async (json: any) => {
  const schema = yup.object().shape({
    workflowPiecesData: yup.mixed(),
    workflowSettingsData: yup.mixed(),
    workflowNodes: yup.mixed(),
    workflowEdges: yup.array().of(yup.object().shape({})),
    workflowPieces: yup.object().shape({}),
  });

  await schema.validate(json);

  const currentRepositories = [
    ...new Set(
      Object.values((await localForage.getItem("pieces")) as any)?.map(
        (p: any) => p?.source_image,
      ),
    ),
  ];
  const incomeRepositories = [
    ...new Set(
      Object.values(json.workflowPieces)
        .reduce<Array<string | null>>((acc, next: any) => {
          acc.push(next.source_image);
          return acc;
        }, [])
        .filter((su) => !!su) as string[],
    ),
  ];

  const differences = incomeRepositories.filter(
    (x) => !currentRepositories.includes(x),
  );

  return differences.length ? differences : null;
};
