import { type repositorySource } from "context/workspaces/types";

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
  data: Repository[];
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
  source: repositorySource;
  path: string;
  workspaceId?: string;
}
