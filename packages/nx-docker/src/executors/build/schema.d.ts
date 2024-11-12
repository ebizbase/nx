export interface DockerExecutorSchema {
  ci: boolean;
  file?: string;
  context?: string;
  args?: Array<string>;
  outputs: Array<string>;
  tags: Array<string>;
  addHost?: string[];
  allow?: string[];
  annotation?: string[];
  attest?: string[];
  cacheFrom?: string[];
  cacheTo?: string[];
  shmSize?: string;
  target?: string;
  ulimit?: string[];
  metadataFile?: string;
  flatforms: string[];
}
