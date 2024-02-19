export interface Piece {
  id: number;
  name: string;
  description: string;

  container_resources: ContainerResources;
  tags: string[];

  repository_id: number;

  input_schema: Schema;
  output_schema: Schema;
  secrets_schema: Schema | null;

  source_image: string;
  source_url: string | null;
  repository_url: string;
  dependency: {
    docker_image: string | null;
    dockerfile: string | null;
    requirements_file: string | null;
  };

  style?: {
    label?: string;
    module?: string;

    nodeType?: string;
    nodeStyle?: CSSProperties;

    useIcon?: boolean;
    iconClassName?: string;
    iconStyle?: CSSProperties;
  };
}

interface ContainerResources {
  limits: {
    cpu: number;
    memory: number;
  };
  requests: {
    cpu: number;
    memory: number;
  };
  use_gpu?: boolean;
}

export type PiecesRepository = Record<string | number, Piece[]>;

export interface Repository {
  id: string;
  name: string;
  label: string;
  created_at: string;
  source: string;
  path: string;
  version: string;
  workspace_id: number;
}
