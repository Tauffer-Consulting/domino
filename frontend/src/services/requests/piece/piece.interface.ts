import { type ERepositorySource } from "interfaces/repositorySource.enum";

interface IPaginationMetadata {
  page: number;
  records: number;
  total: number;
  last_page: number;
}

/**
 * Get Piece Repositories response interface
 */
export interface IGetPiecesRepositoriesResponseInterface {
  data: PieceRepository[];
  metadata: IPaginationMetadata;
}

/**
 * Get Piece Repositories id Pieces
 */
export type IGetRepoPiecesResponseInterface = Piece[];

/**
 * Piece repository metadata
 */
export interface IPieceRepositoryMetadata {
  version: string;
  last_modified: string;
}

/**
 * Get Pieces Repositories Releases response interface
 */
export type IGetPiecesRepositoriesReleasesResponseInterface =
  IPieceRepositoryMetadata[];

/**
 * Get Pieces Repositories Releases request params
 */
export interface IGetPiecesRepositoriesReleasesParams {
  source: ERepositorySource;
  path: string;
  workspaceId?: string;
}
