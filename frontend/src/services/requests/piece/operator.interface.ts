import { type ERepositorySource } from "common/interfaces/repositorySource.enum";

/**
 * Operator object
 */
export interface IOperator {
  id: string;
  name: string;
  description: string;
  dependency: {
    docker_image: string | null;
    dockerfile: string | null;
    requirements_file: string | null;
  };
  docker_image: string;
  input_schema: IIOSchema;
  output_schema: IIOSchema;
  secrets_schema: IIOSchema | null;
  source_url: string | null;
  style?: {
    module?: string;
    label?: string;
    nodeType?: string;
    nodeStyle?: any;
    useIcon?: boolean;
    iconClassName?: string;
    iconStyle?: any;
  };
  repository_id: string;
}

export type IOperatorForageSchema = Record<string | number, IOperator>;

export type IRepositoryOperators = Record<string | number, IOperator[]>;

/**
 * Operator input/output schema
 */
export interface IIOProperty {
  title: string;
  type: string;
  description: string | null;
  default: string | null;
  allOf: any[] | null;
}

export interface IIOSchema {
  title: string;
  description: string;
  type: string;
  properties: any;
  required: string[];
  definitions: any;
}

export interface IOperatorRepository {
  id: string;
  name: string;
  label: string;
  created_at: string;
  source: string;
  path: string;
  version: string;
  workspace_id: number;
}

export interface IOperatorSchema {
  Operator_config: IOperatorConfig;
  tasks: Record<string, unknown>;
}

export interface IOperatorConfig {
  name: string;
  start_date: string;
  end_date: string;
  schedule_interval: string;
  catchup: boolean;
  generate_report: string;
  description: string;
}

interface IPaginationMetadata {
  page: number;
  records: number;
  total: number;
  last_page: number;
}

/**
 * Get Operator Repositories response interface
 */
export interface IGetOperatorsRepositoriesResponseInterface {
  data: IOperatorRepository[];
  metadata: IPaginationMetadata;
}

/**
 * Get Operator Repositories id Operators
 */
export type IGetRepoOperatorsResponseInterface = IOperator[];

/**
 * Operator repository metadata
 */
export interface IOperatorRepositoryMetadata {
  version: string;
  last_modified: string;
}

/**
 * Get Operators Repositories Releases response interface
 */
export type IGetOperatorsRepositoriesReleasesResponseInterface =
  IOperatorRepositoryMetadata[];

/**
 * Get Operators Repositories Releases request params
 */
export interface IGetOperatorsRepositoriesReleasesParams {
  source: ERepositorySource;
  path: string;
  workspaceId?: string;
}
