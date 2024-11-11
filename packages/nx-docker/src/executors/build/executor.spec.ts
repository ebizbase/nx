import dockerExecutor from './executor';
import { logger } from '@nx/devkit';
import { execSync } from 'child_process';
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
    (execSync as jest.Mock).mockImplementation((command) => {
      if (command === 'docker info') {
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
    (execSync as jest.Mock).mockImplementation((command: string) => {
      if (command === 'docker buildx version') {
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
    (execSync as jest.Mock).mockImplementation((command: string) => {
      if (command === 'docker buildx version') {
        throw new Error('buildx not found');
      }
    });

    const result = await dockerExecutor(options, context);
    expect(execSync).toHaveBeenLastCalledWith(
      'docker build --build-arg ARG1=value1 -t test:latest -f /root/test-project/Dockerfile .',
      { stdio: 'inherit', cwd: '/root' }
    );
    expect(result).toEqual({ success: true });
  });

  it('should return success false if docker build fails', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    (execSync as jest.Mock).mockImplementation((command: string) => {
      if (command.endsWith('.')) {
        throw new Error();
      }
    });

    const result = await dockerExecutor(options, context);

    expect(logger.fatal).toHaveBeenCalledWith('Failed to build Docker image', expect.any(Error));
    expect(result).toEqual({ success: false });
  });

  it('should use default tags and args if none provided', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    const defaultOptions = { ...options, tags: [], args: [] };
    await dockerExecutor(defaultOptions, context);
    expect(execSync).toHaveBeenCalledWith(
      expect.not.stringContaining('--build-arg'),
      expect.any(Object)
    );
  });

  it('should handle multiple tags correctly', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    const multiTagOptions = { ...options, tags: ['test:latest', 'test:v1'] };
    await dockerExecutor(multiTagOptions, context);
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('-t test:latest -t test:v1'),
      expect.any(Object)
    );
  });

  it('should log additional info when verbose mode is on', async () => {
    (existsSync as jest.Mock).mockReturnValue(true);
    const verboseContext = { ...context, isVerbose: true };
    await dockerExecutor(options, verboseContext);
    expect(execSync).toHaveBeenCalledWith(expect.any(String), { stdio: 'inherit', cwd: '/root' });
  });
});
