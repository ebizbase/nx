import dockerExecutor from './executor';
import { logger } from '@nx/devkit';
import { execFileSync } from 'child_process';
import { existsSync } from 'fs';

jest.mock('child_process');
jest.mock('fs');
jest.mock('@nx/devkit', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    fatal: jest.fn(),
  },
}));

describe('dockerExecutor', () => {
  const context = {
    isVerbose: false,
    projectName: 'test-project',
    projectsConfigurations: {
      version: 1,
      projects: {
        'test-project': {
          root: '/root/test-project',
        },
      },
    },
    root: '/root',
    nxJsonConfiguration: {},
    cwd: '/root',
    projectGraph: {
      nodes: {},
      dependencies: {},
    },
  };

  const options = {
    ci: false,
    outputs: ['image'],
    file: '/root/test-project/Dockerfile',
    context: '.',
    tags: ['test:latest'],
    args: ['ARG1=value1'],
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return success false if docker is not installed', async () => {
    (execFileSync as jest.Mock).mockImplementation((command, args) => {
      if (command === 'docker' && args[0] === 'info') {
        throw new Error();
      }
    });
    const result = await dockerExecutor(options, context);
    expect(logger.error).toHaveBeenCalledWith(
      'Docker is not installed or docker daemon is not running'
    );
    expect(result).toEqual({ success: false });
  });

  it('should return success false if no project name is provided', async () => {
    const result = await dockerExecutor(options, { ...context, projectName: undefined });
    expect(logger.error).toHaveBeenCalledWith('No project name provided');
    expect(result).toEqual({ success: false });
  });

  it('should return success false if Dockerfile does not exist', async () => {
    (existsSync as jest.Mock).mockReturnValueOnce(false);

    const result = await dockerExecutor(options, context);

    expect(logger.error).toHaveBeenCalledWith(
      'Dockerfile not found at /root/test-project/Dockerfile'
    );
    expect(result).toEqual({ success: false });
  });

  it('should return success false if context path does not exist', async () => {
    (existsSync as jest.Mock).mockReturnValueOnce(true).mockReturnValueOnce(false);

    const result = await dockerExecutor(options, context);

    expect(logger.error).toHaveBeenCalledWith('Context path not found at .');
    expect(result).toEqual({ success: false });
  });

  it('should log a warning if docker buildx is not installed', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    (execFileSync as jest.Mock).mockImplementation((command: string, args: string[]) => {
      if (command === 'docker' && args[0] === 'buildx' && args[1] === 'version') {
        throw new Error('buildx not found');
      }
    });

    await dockerExecutor(options, context);

    expect(logger.warn).toHaveBeenCalledWith(
      'Docker buildx is not installed so performance may be degraded'
    );
  });

  it('should return success true if docker build succeeds', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    (execFileSync as jest.Mock).mockImplementation((command: string, args: string[]) => {
      if (command === 'docker' && args[0] === 'buildx' && args[1] === 'version') {
        throw new Error('buildx not found');
      }
    });

    const result = await dockerExecutor(options, context);
    expect(execFileSync).toHaveBeenLastCalledWith(
      'docker',
      [
        'build',
        '--build-arg',
        'ARG1=value1',
        '-t',
        'test:latest',
        '-f',
        '/root/test-project/Dockerfile',
        '.',
      ],
      { cwd: '/root', stdio: 'inherit' }
    );
    expect(result).toEqual({ success: true });
  });

  it('should return success false if docker build fails', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    (execFileSync as jest.Mock).mockImplementation((_command: string, args: string[]) => {
      if (args[args.length - 1] === '.') {
        throw new Error();
      }
    });

    const result = await dockerExecutor(options, context);

    expect(logger.fatal).toHaveBeenCalledWith('Failed to build Docker image', expect.any(Error));
    expect(result).toEqual({ success: false });
  });

  it('should handle multiple tags correctly', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    const multiTagOptions = { ...options, tags: ['test:latest', 'test:v1'] };
    await dockerExecutor(multiTagOptions, context);
    expect(execFileSync).toHaveBeenCalledWith(
      'docker',
      [
        'buildx',
        'build',
        '--build-arg',
        'ARG1=value1',
        '-t',
        'test:latest',
        '-t',
        'test:v1',
        '-f',
        '/root/test-project/Dockerfile',
        '.',
      ],
      expect.any(Object)
    );
  });

  it('should log additional info when verbose mode is on', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    const verboseContext = { ...context, isVerbose: true };
    await dockerExecutor(options, verboseContext);
    expect(execFileSync).toHaveBeenCalledWith(expect.any(String), expect.any(Array), {
      stdio: 'inherit',
      cwd: '/root',
    });
  });
});
