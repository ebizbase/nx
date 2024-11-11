import { logger, PromiseExecutor } from '@nx/devkit';
import { execFileSync } from 'child_process';

import { AnalyzeExecutorSchema } from './schema';

const executor: PromiseExecutor<AnalyzeExecutorSchema> = async (options, context) => {
  try {
    execFileSync('docker', ['info'], { stdio: context.isVerbose ? 'inherit' : 'ignore' });
  } catch {
    logger.error('Docker is not installed or docker daemon is not running');
    return { success: false };
  }

  const args = [];

  if (!options.ci) {
    if (options.highestUserWastedBytes) {
      logger.error('highestUserWastedBytes is not supported in non-CI mode');
      return { success: false };
    }

    if (options.highestUserWastedRatio) {
      logger.error('highestUserWastedRatio is not supported in non-CI mode');
      return { success: false };
    }

    if (options.lowestEfficiencyRatio) {
      logger.error('lowestEfficiencyRatio is not supported in non-CI mode');
      return { success: false };
    }
  } else {
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

  args.push(`--source=${options.source}`);

  try {
    logger.info(
      [
        'docker',
        'run',
        '-ti',
        '--rm',
        '-v',
        '/var/run/docker.sock:/var/run/docker.sock',
        'wagoodman/dive',
        options.image,
        ...args,
      ].join(' ')
    );

    execFileSync(
      'docker',
      [
        'run',
        ...(options.ci ? ['--rm'] : ['-ti', '--rm']),
        '-v',
        '/var/run/docker.sock:/var/run/docker.sock',
        'wagoodman/dive',
        options.image,
        ...args,
      ],
      { stdio: 'inherit', cwd: context.root }
    );
    return { success: true };
  } catch (error) {
    logger.fatal('Failed to build Docker image', error);
    return { success: false };
  }
};

export default executor;
