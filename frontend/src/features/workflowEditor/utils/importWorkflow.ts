import localForage from "services/config/localForage.config";
import { isEmpty } from "utils";
import * as yup from "yup";

import { type GenerateWorkflowsParams } from "../context/workflowsEditor";

export const importJsonWorkflow = (
  e: React.ChangeEvent<HTMLInputElement>,
): Promise<GenerateWorkflowsParams> | null => {
  const file = e.target.files?.[0];

  if (file) {
    return new Promise<GenerateWorkflowsParams>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(
            e.target?.result as string,
          ) as GenerateWorkflowsParams;

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

interface Differences {
  source: string;
  version: string;
  installed: boolean;
}

export const validateJsonImported = async (
  json: any,
): Promise<Differences[]> => {
  const schema = yup
    .object()
    .shape({
      workflowEdges: yup
        .array()
        .of(
          yup.object().shape({
            id: yup.string().required(),
            source: yup.string().required(),
            target: yup.string().required(),
          }),
        )
        .required(),
      workflowNodes: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              data: yup
                .object()
                .shape({
                  name: yup.string().required(),
                  orientation: yup.string().required(),
                })
                .required(),
              position: yup
                .object()
                .shape({
                  x: yup.number().required(),
                  y: yup.number().required(),
                })
                .required(),
            })
            .required(),
        )
        .required(),
      workflowPieces: yup.lazy((value) => {
        if (!isEmpty(value)) {
          const validationObject = {
            id: yup.number().required(),
            source_image: yup.string().required(),
            source_url: yup.string().required(),
            input_schema: yup.object().shape({}).required(),
            output_schema: yup.object().shape({}).required(),
          };
          const newEntries = Object.keys(value).reduce(
            (acc, val) => ({
              ...acc,
              [val]: yup.object(validationObject),
            }),
            {},
          );

          return yup.object().shape(newEntries).required();
        }
        return yup.mixed().notRequired();
      }),
      workflowPiecesData: yup.mixed(),
    })
    .strict()
    .noUnknown();

  await schema.validate(json);

  const currentRepositories: string[] = [
    ...new Set(
      Object.values((await localForage.getItem("pieces")) as any)?.map(
        (p: any) =>
          p?.source_image.replace("ghcr.io/", "").replace(/-group\d+$/g, ""),
      ),
    ),
  ];
  const incomeRepositories = [
    ...new Set(
      Object.values(json.workflowPieces)
        .reduce<Array<string | null>>((acc, next: any) => {
          acc.push(
            next.source_image
              .replace("ghcr.io/", "")
              .replace(/-group\d+$/g, ""),
          );
          return acc;
        }, [])
        .filter((su) => !!su) as string[],
    ),
  ];

  const differences = incomeRepositories.filter(
    (x) => !currentRepositories.includes(x),
  );

  const currentRepositoriesWithoutVersion = currentRepositories.map(
    (cr) => cr.split(":")[0],
  );

  const differencesWithoutVersion = differences.map((d) => d.split(":")[0]);

  const uninstalled = differencesWithoutVersion.filter(
    (x) => !currentRepositoriesWithoutVersion.includes(x),
  );

  return differences.map((d) => {
    const source = d.split(":")[0];
    const version = d.split(":")[1];
    const installed = !uninstalled.includes(source);
    return {
      source,
      version,
      installed,
    };
  });
};
