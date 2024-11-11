import { logger } from '@nx/devkit';
import { execFileSync } from 'child_process';
import executor, { getDiveArgs } from './executor';
import { AnalyzeExecutorSchema } from './schema';
import { DockerUtils } from '../../utils/docker.utils';

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));
jest.mock('@nx/devkit', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));
jest.mock('../../utils/docker.utils');

describe('Docker Analyze Executor', () => {
  let context: any;
  let dockerServiceMock: jest.Mocked<DockerUtils>;

  beforeEach(() => {
    context = { isVerbose: false, root: '/test' };
    dockerServiceMock = new DockerUtils() as jest.Mocked<DockerUtils>;
    dockerServiceMock.checkDockerInstalled.mockReturnValue(true);
    (DockerUtils as jest.Mock).mockImplementation(() => dockerServiceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDiveArgs function', () => {
    it('should build arguments for CI mode with specified options', () => {
      const options: AnalyzeExecutorSchema = {
        ci: true,
        image: 'test-image',
        highestUserWastedBytes: 500,
        highestUserWastedRatio: 0.3,
        lowestEfficiencyRatio: 0.8,
        source: '/source/path',
        ignoreError: true,
        version: 'latest',
      };
      const args = getDiveArgs(options);
      expect(args).toEqual([
        'test-image',
        '--ci',
        '--highestUserWastedBytes=500',
        '--highestUserWastedPercent=0.3',
        '--lowestEfficiency=0.8',
        '--ignore-errors',
        '--source=/source/path',
      ]);
    });

    it('should build arguments without CI-specific options if CI mode is disabled', () => {
      const options: AnalyzeExecutorSchema = {
        ci: false,
        image: 'test-image',
        source: '/source/path',
        ignoreError: false,
        version: 'latest',
      };
      const args = getDiveArgs(options);
      expect(args).toEqual(['test-image', '--source=/source/path']);
    });
  });

  describe('executor function', () => {
    it('should return success if Docker command executes without errors', async () => {
      const options: AnalyzeExecutorSchema = {
        ci: true,
        image: 'test-image',
        source: '/source/path',
        ignoreError: false,
        version: 'latest',
      };
      const result = await executor(options, context);
      expect(result).toEqual({ success: true });
      expect(execFileSync).toHaveBeenCalled();
    });

    it('should log error and return failure if Docker is not installed', async () => {
      dockerServiceMock.checkDockerInstalled.mockReturnValue(false);
      const options: AnalyzeExecutorSchema = {
        ci: true,
        image: 'test-image',
        source: '/source/path',
        ignoreError: false,
        version: 'latest',
      };
      const result = await executor(options, context);
      expect(result).toEqual({ success: false });
      expect(logger.error).toHaveBeenCalledWith(
        'Docker is not installed or docker daemon is not running'
      );
      expect(execFileSync).not.toHaveBeenCalled();
    });

    it('should log error if unsupported options are provided in non-CI mode', async () => {
      const optionsToChecks = [
        'highestUserWastedBytes',
        'highestUserWastedRatio',
        'lowestEfficiencyRatio',
      ];
      for (let i = 0; i < optionsToChecks.length; i++) {
        const options: any = {
          ci: false,
          image: 'test-image',
          source: '/source/path',
          ignoreError: false,
        };
        options[optionsToChecks[i]] = 1;
        const result = await executor(options, context);
        expect(result).toEqual({ success: false });
        expect(logger.error).toHaveBeenCalledWith(
          'highestUserWastedBytes, highestUserWastedRatio, and lowestEfficiencyRatio are only supported in CI mode'
        );
      }
    });

    it('should add ignore-errors flag if specified', async () => {
      const options: AnalyzeExecutorSchema = {
        ci: true,
        image: 'test-image',
        source: '/source/path',
        ignoreError: true,
        version: 'latest',
      };
      await executor(options, context);
      expect(execFileSync).toHaveBeenCalledWith(
        'docker',
        expect.arrayContaining(['--ignore-errors']),
        expect.anything()
      );
    });

    it('should add ignore-errors flag if specified', async () => {
      const options: AnalyzeExecutorSchema = {
        ci: true,
        image: 'test-image',
        source: '/source/path',
        ignoreError: true,
        version: 'latest',
      };
      await executor(options, context);
      expect(execFileSync).toHaveBeenCalledWith(
        'docker',
        expect.arrayContaining(['--ignore-errors']),
        expect.anything()
      );
    });

    it('should add -ti on non ci mode', async () => {
      const options: AnalyzeExecutorSchema = {
        ci: false,
        image: 'test-image',
        source: '/source/path',
        ignoreError: true,
        version: 'latest',
      };
      await executor(options, context);
      expect(execFileSync).toHaveBeenCalledWith(
        'docker',
        expect.arrayContaining(['-ti']),
        expect.anything()
      );
    });

    it('should set version of dive', async () => {
      const options: AnalyzeExecutorSchema = {
        ci: false,
        image: 'test-image',
        source: '/source/path',
        ignoreError: true,
        version: '1.0.0',
      };
      await executor(options, context);
      expect(execFileSync).toHaveBeenCalledWith(
        expect.anything(),
        expect.arrayContaining(['wagoodman/dive:1.0.0']),
        expect.anything()
      );
    });

    it('should handle failure in Docker command and log fatal error', async () => {
      const options: AnalyzeExecutorSchema = {
        ci: true,
        image: 'test-image',
        source: '/source/path',
        ignoreError: false,
        version: 'latest',
      };
      (execFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Docker error');
      });
      const result = await executor(options, context);
      expect(result).toEqual({ success: false });
      expect(logger.fatal).toHaveBeenCalledWith('Failed to build Docker image', expect.any(Error));
    });
  });
});
