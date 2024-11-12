import { logger, PromiseExecutor } from '@nx/devkit';
import { execFileSync } from 'child_process';
import { AnalyzeExecutorSchema } from './schema';
import { DockerUtils } from '../../utils/docker.utils';

export function getDiveArgs(options: AnalyzeExecutorSchema): string[] {
  const args = [];

  args.push(options.image);

  if (options.ci) {
    args.push('--ci');
    if (options.highestUserWastedBytes) {
      args.push(`--highestUserWastedBytes=${options.highestUserWastedBytes}`);
    }

    if (options.highestUserWastedRatio) {
      args.push(`--highestUserWastedPercent=${options.highestUserWastedRatio}`);
    }

    if (options.lowestEfficiencyRatio) {
      args.push(`--lowestEfficiency=${options.lowestEfficiencyRatio}`);
    }
  }

  if (options.ignoreError) {
    args.push('--ignore-errors');
  }

  // args.push(`--source=${options.source}`);

  return args;
}

const executor: PromiseExecutor<AnalyzeExecutorSchema> = async (options, context) => {
  const dockerService = new DockerUtils();

  // Check docker installed and docker daemon is running
  if (!dockerService.checkDockerInstalled(context.isVerbose)) {
    logger.error('Docker is not installed or docker daemon is not running');
    return { success: false };
  }

  if (!options.ci) {
    if (
      options.highestUserWastedBytes ||
      options.highestUserWastedRatio ||
      options.lowestEfficiencyRatio
    ) {
      logger.error(
        'highestUserWastedBytes, highestUserWastedRatio, and lowestEfficiencyRatio are only supported in CI mode'
      );
      return { success: false };
    }
  }

  const dockerLocalSocket = options.dockerSocket || '/var/run/docker.sock';
  const dockerArgs = [
    'run',
    ...(options.ci ? ['--rm'] : ['-ti', '--rm']),
    '-v',
    `${dockerLocalSocket}:/var/run/docker.sock`,
    `wagoodman/dive:${options.version}`,
  ];
  const diveArgs = getDiveArgs(options);

  try {
    logger.info(['docker', ...dockerArgs, ...diveArgs].join(' '));
    execFileSync('docker', [...dockerArgs, ...diveArgs], { stdio: 'inherit', cwd: context.root });
    return { success: true };
  } catch (error) {
    logger.fatal('Failed to build Docker image', error);
    return { success: false };
  }
};

export default executor;
