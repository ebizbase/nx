import { logger, PromiseExecutor } from '@nx/devkit';
import { join } from 'path';
import { existsSync } from 'fs';
import { execFileSync } from 'child_process';

import { DockerExecutorSchema } from './schema';

const dockerExecutor: PromiseExecutor<DockerExecutorSchema> = async (options, context) => {
  try {
    execFileSync('docker', ['info'], { stdio: context.isVerbose ? 'inherit' : 'ignore' });
  } catch {
    logger.error('Docker is not installed or docker daemon is not running');
    return { success: false };
  }

  let buildCommand = ['docker', 'build'];
  try {
    execFileSync('docker', ['buildx', 'version'], {
      stdio: context.isVerbose ? 'inherit' : 'ignore',
    });
    buildCommand = ['docker', 'buildx', 'build'];
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

  const tagArgs = [];
  if (options.tags) {
    for (const tag of options.tags) {
      tagArgs.push('-t', tag);
    }
  }

  const buildArgs = [];
  const args = options.args || [];
  for (const arg of args) {
    buildArgs.push('--build-arg', arg);
  }

  try {
    const command = [...buildCommand, ...buildArgs, ...tagArgs, '-f', dockerfilePath, contextPath];
    logger.info(`Build command: ${command.join(' ')}`);
    execFileSync(command[0], command.slice(1), { stdio: 'inherit', cwd: context.root });
    return { success: true };
  } catch (error) {
    logger.fatal('Failed to build Docker image', error);
    return { success: false };
  }
};

export default dockerExecutor;
