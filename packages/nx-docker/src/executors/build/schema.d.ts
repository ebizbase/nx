export interface DockerExecutorSchema {
  ci: boolean;
  file?: string;
  context?: string;
  args: Array<string>;
  outputs: Array<string>;
  tags: Array<string>;
}
