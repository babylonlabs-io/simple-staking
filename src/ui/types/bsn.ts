export interface ETHL2MetadataAPI {
  finality_contract_address: string;
}

export interface BsnAPI {
  _id: string;
  name: string;
  description: string;
  max_multi_staked_fps: number;
  type: string;
  rollup_metadata?: ETHL2MetadataAPI;
}

export interface ETHL2Metadata {
  finalityContractAddress: string;
}

export interface Bsn {
  id: string;
  name: string;
  description: string;
  maxMultiStakedFps: number;
  type: string;
  rollupMetadata?: ETHL2Metadata;
}
