import { logger, PromiseExecutor } from '@nx/devkit';
import { join } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

import { DockerExecutorSchema } from './schema';

const dockerExecutor: PromiseExecutor<DockerExecutorSchema> = async (options, context) => {
  try {
    execSync('docker info', { stdio: context.isVerbose ? 'inherit' : 'ignore' });
  } catch {
    logger.error('Docker is not installed or docker daemon is not running');
    return { success: false };
  }

  let buildCommand = 'docker build'; // Fix typo here
  try {
    execSync('docker buildx version', { stdio: context.isVerbose ? 'inherit' : 'ignore' });
    buildCommand = 'docker buildx build';
  } catch {
    logger.warn('Docker buildx is not installed so performance may be degraded');
  }

  const projectName = context.projectName;
  if (!projectName) {
    logger.error('No project name provided');
    return { success: false };
  }

  const projectConfig = context.projectsConfigurations.projects[projectName];
  const projectRoot = projectConfig.root;
  const dockerfilePath = options.file || join(projectRoot, 'Dockerfile');
  const contextPath = options.context || '.';

  if (!existsSync(dockerfilePath)) {
    logger.error(`Dockerfile not found at ${dockerfilePath}`);
    return { success: false };
  }

  if (!existsSync(contextPath)) {
    logger.error(`Context path not found at ${contextPath}`);
    return { success: false };
  }

  const tagArgs = new Array<string>();
  if (options.tags) {
    for (const tag of options.tags) {
      tagArgs.push(`-t ${tag}`);
    }
  }

  const buildArgs = new Array<string>();
  const args = options.args || [];
  for (const arg of args) {
    buildArgs.push(`--build-arg ${arg}`); // Fix to use buildArgs instead of tagArgs
  }

  try {
    const command = `${buildCommand} ${buildArgs.join(' ')} ${tagArgs.join(' ')} -f ${dockerfilePath} ${contextPath}`;
    logger.info(`Build command: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: context.root });
    return { success: true };
  } catch (error) {
    logger.fatal('Failed to build Docker image', error);
    return { success: false };
  }
};

export default dockerExecutor;
