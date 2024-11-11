import { logger, PromiseExecutor } from '@nx/devkit';
import { join } from 'path';
import { DockerExecutorSchema } from './schema';
import { DockerUtils } from '../../utils/docker.utils';
import { existsSync } from 'fs';
import { ProjectUtils } from '../../utils/project.utils';
import { execFileSync } from 'child_process';

const executor: PromiseExecutor<DockerExecutorSchema> = async (options, context) => {
  const dockerService = new DockerUtils();

  // Check docker installed and docker daemon is running
  if (!dockerService.checkDockerInstalled(context.isVerbose)) {
    logger.error('Docker is not installed or docker daemon is not running');
    return { success: false };
  }

  // Determine using build or buildx for building Docker image
  const isBuildxInstalled = dockerService.checkBuildxInstalled(context.isVerbose);
  if (!isBuildxInstalled) {
    logger.warn(
      'Buildx is not installed falling back to docker build. Docker buildx is not installed so performance may be degraded'
    );
  }
  const buildCommand = isBuildxInstalled ? ['docker', 'buildx', 'build'] : ['docker', 'build'];

  let projectUtils;
  try {
    projectUtils = new ProjectUtils(context);
  } catch (error: unknown) {
    logger.fatal('No project name provided', error);
    return { success: false };
  }

  const dockerfilePath = options.file || join(projectUtils.getProjectRoot(), 'Dockerfile');
  const contextPath = options.context || '.';

  // Kiểm tra Dockerfile và context
  if (!existsSync(dockerfilePath)) {
    logger.error(`Dockerfile not found at ${dockerfilePath}`);
    return { success: false };
  }

  if (!existsSync(contextPath)) {
    logger.error(`Context path not found at ${contextPath}`);
    return { success: false };
  }

  // Build tag và build arg
  const tagArgs = options.tags.flatMap((tag) => ['-t', tag]);
  const buildArgs = options.args?.flatMap((arg) => ['--build-arg', arg]) || [];

  try {
    const command = [...buildCommand, ...buildArgs, ...tagArgs, '-f', dockerfilePath, contextPath];
    logger.info(`${command.join(' ')}\n`);
    execFileSync(command[0], command.slice(1), { stdio: 'inherit', cwd: context.root });
    return { success: true };
  } catch (error) {
    logger.fatal('Failed to build Docker image', error);
    return { success: false };
  }
};

export default executor;
