import { logger, PromiseExecutor } from '@nx/devkit';
import { dirname, join } from 'path';
import { DockerExecutorSchema } from './schema';
import { DockerUtils } from '../../utils/docker.utils';
import { existsSync, mkdirSync } from 'fs';
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
  const outputArgs = options.outputs ? [`--output=${options.outputs.join(',')}`] : [];
  const cacheFromArgs =
    options.cacheFrom && options.cacheFrom.length > 0
      ? [`--cache-from=${options.cacheFrom.join(',')}`]
      : [];
  const cacheToArgs =
    options.cacheFrom && options.cacheFrom.length > 0
      ? [`--cache-to=${options.cacheFrom.join(',')}`]
      : [];
  const flatformsArgs =
    options.flatforms && options.flatforms.length > 0
      ? [`--platform=${options.flatforms.join(',')}`]
      : [];
  const metadataFileArgs = options.metadataFile ? ['--metadata-file', options.metadataFile] : [];
  if (options.metadataFile && !existsSync(options.metadataFile)) {
    try {
      mkdirSync(dirname(options.metadataFile), { recursive: true });
    } catch (error: unknown) {
      logger.fatal('Failed to create metadata file', error);
      return { success: false };
    }
  }
  const tagArgs = options.tags.flatMap((tag) => ['-t', tag]) || [];
  const buildArgs = options.args?.flatMap((arg) => ['--build-arg', arg]) || [];
  const addHostArgs = options.addHost?.flatMap((host) => ['--add-host', host]) || [];
  const allowArgs = options.allow?.flatMap((allow) => ['--allow', allow]) || [];
  const annotationArgs =
    options.annotation?.flatMap((annotation) => ['--annotation', annotation]) || [];
  const attestArgs = options.attest?.flatMap((attest) => ['--attest', attest]) || [];
  const shmSizeArgs = options.shmSize ? ['--shm-size', options.shmSize] : [];
  const uLimitArgs = options.ulimit ? [`--ulimit${options.ulimit}`] : [];
  const targetArgs = options.target ? ['--target', options.target] : [];

  try {
    const command = [
      ...buildCommand,
      ...outputArgs,
      ...cacheFromArgs,
      ...cacheToArgs,
      ...flatformsArgs,
      ...metadataFileArgs,
      ...buildArgs,
      ...addHostArgs,
      ...allowArgs,
      ...annotationArgs,
      ...attestArgs,
      ...shmSizeArgs,
      ...uLimitArgs,
      ...tagArgs,
      ...targetArgs,
      '-f',
      dockerfilePath,
      contextPath,
    ];
    logger.info(`${command.join(' ')}\n`);
    execFileSync(command[0], command.slice(1), { stdio: 'inherit', cwd: context.root });
    return { success: true };
  } catch (error) {
    logger.fatal('Failed to build Docker image', error);
    return { success: false };
  }
};

export default executor;
