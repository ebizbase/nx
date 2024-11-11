import { execFileSync } from 'child_process';
import { logger } from '@nx/devkit';
import executor from './executor';
import { AnalyzeExecutorSchema } from './schema';

jest.mock('child_process');
jest.mock('@nx/devkit', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
}));

describe('AnalyzeExecutor', () => {
  const mockContext = {
    isVerbose: false,
    root: '/root/path',
    projectsConfigurations: {
      version: 1,
      projects: {
        'test-project': {
          root: '/root/test-project',
        },
      },
    },
    nxJsonConfiguration: {},
    cwd: '/root/path',
    projectGraph: {
      nodes: {},
      dependencies: {},
    },
  };
  const mockOptions: AnalyzeExecutorSchema = {
    ci: false,
    source: 'src',
    image: 'image_name',
    highestUserWastedBytes: undefined,
    highestUserWastedRatio: undefined,
    lowestEfficiencyRatio: undefined,
    ignoreError: false,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return success false if docker is not running', async () => {
    (execFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Docker not running');
    });

    const result = await executor(mockOptions, mockContext);

    expect(result).toEqual({ success: false });
    expect(logger.error).toHaveBeenCalledWith(
      'Docker is not installed or docker daemon is not running'
    );
  });

  it('should return success false and log errors if non-CI mode has unsupported options', async () => {
    const options = { ...mockOptions, highestUserWastedBytes: 100 };
    const result = await executor(options, mockContext);

    expect(result).toEqual({ success: false });
    expect(logger.error).toHaveBeenCalledWith(
      'highestUserWastedBytes is not supported in non-CI mode'
    );
  });

  it('should add CI specific args when options.ci is true', async () => {
    const options = {
      ...mockOptions,
      ci: true,
      highestUserWastedBytes: 100,
      highestUserWastedRatio: 50,
      lowestEfficiencyRatio: 20,
    };

    (execFileSync as jest.Mock).mockReturnValueOnce(undefined);

    const result = await executor(options, mockContext);

    expect(result).toEqual({ success: true });
    expect(execFileSync).toHaveBeenCalledWith(
      'docker',
      [
        'run',
        '--rm',
        '-v',
        '/var/run/docker.sock:/var/run/docker.sock',
        'wagoodman/dive',
        'image_name',
        '--ci',
        '--highestUserWastedBytes=100',
        '--highestUserWastedPercent=50',
        '--lowestEfficiency=20',
        '--source=src',
      ],
      { stdio: 'inherit', cwd: '/root/path' }
    );
  });
});
