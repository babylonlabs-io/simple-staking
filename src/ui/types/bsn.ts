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
