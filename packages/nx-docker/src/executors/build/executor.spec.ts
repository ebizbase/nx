// executor.spec.ts
import { ExecutorContext, logger } from '@nx/devkit';
import { existsSync } from 'fs';
import { DockerExecutorSchema } from './schema';
import executor from './executor';
import { ProjectUtils } from '../../utils/project.utils';
import { DockerUtils } from '../../utils/docker.utils';
import { execFileSync } from 'child_process';

jest.mock('@nx/devkit', () => ({
  logger: {
    error: jest.fn(),
    fatal: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
}));

jest.mock('../../utils/docker.utils');
jest.mock('../../utils/project.utils');
jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));

describe('executor', () => {
  const context: ExecutorContext = {
    isVerbose: false,
    projectName: 'test-project',
    projectsConfigurations: {
      version: 1,
      projects: {
        'test-project': { root: '/path/to/test-project' },
      },
    },
    root: '/path/to/root',
    nxJsonConfiguration: {},
    cwd: '/path/to/root',
    projectGraph: {
      nodes: {},
      dependencies: {},
    },
  };
  const options: DockerExecutorSchema = {
    file: undefined,
    context: undefined,
    tags: ['latest'],
    args: ['ARG1=value1'],
    ci: false,
    outputs: ['image'],
    flatforms: [],
  };
  let dockerUtils: jest.Mocked<DockerUtils>;
  let projectUtils: jest.Mocked<ProjectUtils>;

  beforeEach(() => {
    dockerUtils = new DockerUtils() as jest.Mocked<DockerUtils>;
    dockerUtils.checkDockerInstalled.mockReturnValue(true);
    dockerUtils.checkBuildxInstalled.mockReturnValue(true);

    (DockerUtils as jest.Mock).mockImplementation(() => dockerUtils);

    projectUtils = new ProjectUtils(context) as jest.Mocked<ProjectUtils>;
    projectUtils.getProjectRoot.mockReturnValue('/path/to/test-project');

    (ProjectUtils as jest.Mock).mockImplementation(() => projectUtils);
    (existsSync as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return success when Docker build is successful', async () => {
    // Arrange

    // Act
    const result = await executor(options, context);

    // Assert
    expect(result).toEqual({ success: true });
    expect(execFileSync).toHaveBeenCalled();
  });

  it('should return failure if Docker is not installed', async () => {
    // Arrange
    dockerUtils.checkDockerInstalled.mockReturnValue(false);

    // Act
    const result = await executor(options, context);

    // Assert
    expect(result).toEqual({ success: false });
    expect(logger.error).toHaveBeenCalledWith(
      'Docker is not installed or docker daemon is not running'
    );
  });

  it('should warn if buildx is not installed and fallback to docker build', async () => {
    // Arrange
    dockerUtils.checkBuildxInstalled.mockReturnValue(false);

    // Act
    await executor(options, context);

    // Assert
    expect(logger.warn).toHaveBeenCalledWith(
      'Buildx is not installed falling back to docker build. Docker buildx is not installed so performance may be degraded'
    );
    expect(execFileSync).toHaveBeenCalledWith('docker', expect.arrayContaining(['build']), {
      stdio: 'inherit',
      cwd: context.root,
    });
  });

  it('should return failure if project name is missing', async () => {
    // Arrange
    (ProjectUtils as jest.Mock).mockImplementation(() => {
      throw new Error('No project name provided');
    });

    // Act
    const result = await executor(options, context);

    // Assert
    expect(result).toEqual({ success: false });
    expect(logger.fatal).toHaveBeenCalledWith('No project name provided', expect.any(Error));
  });

  it('should return failure if Dockerfile is missing', async () => {
    // Arrange
    (existsSync as jest.Mock).mockImplementation((path) => !path.includes('Dockerfile'));

    // Act
    const result = await executor(options, context);

    // Assert
    expect(result).toEqual({ success: false });
    expect(logger.error).toHaveBeenCalledWith(
      'Dockerfile not found at /path/to/test-project/Dockerfile'
    );
  });

  it('should return failure if context path is missing', async () => {
    // Arrange
    (existsSync as jest.Mock).mockImplementation((path) => !path.includes('.'));

    // Act
    const result = await executor(options, context);

    // Assert
    expect(result).toEqual({ success: false });
    expect(logger.error).toHaveBeenCalledWith('Context path not found at .');
  });

  it('should build Docker image with provided tags and build args', async () => {
    // Arrange
    const expectedCommand = 'docker';
    const expectedCommandArgs = [
      'buildx',
      'build',
      '--output=image',
      '--build-arg',
      'ARG1=value1',
      '-t',
      'latest',
      '-f',
      '/path/to/test-project/Dockerfile',
      '.',
    ];

    // Act
    await executor(options, context);

    // Assert
    expect(execFileSync).toHaveBeenCalledWith(expectedCommand, expectedCommandArgs, {
      stdio: 'inherit',
      cwd: context.root,
    });
  });

  it('should log failure if Docker build fails', async () => {
    // Arrange
    (execFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('Docker build failed');
    });

    // Act
    const result = await executor(options, context);

    // Assert
    expect(result).toEqual({ success: false });
    expect(logger.fatal).toHaveBeenCalledWith('Failed to build Docker image', expect.any(Error));
  });

  it('should build Docker image with tag arguments when tags are provided', async () => {
    options.tags = ['latest', 'v1.0.0'];

    await executor(options, context);

    const expectedTagArgs = ['-t', 'latest', '-t', 'v1.0.0'];
    expect(execFileSync).toHaveBeenCalledWith('docker', expect.arrayContaining(expectedTagArgs), {
      stdio: 'inherit',
      cwd: context.root,
    });
  });

  it('should build Docker image with build arguments when args are provided', async () => {
    options.args = ['ARG1=value1', 'ARG2=value2'];

    await executor(options, context);

    const expectedBuildArgs = ['--build-arg', 'ARG1=value1', '--build-arg', 'ARG2=value2'];
    expect(execFileSync).toHaveBeenCalledWith('docker', expect.arrayContaining(expectedBuildArgs), {
      stdio: 'inherit',
      cwd: context.root,
    });
  });

  it('should not add build arguments if args are not provided', async () => {
    options.args = undefined;

    await executor(options, context);

    expect(execFileSync).toHaveBeenCalledWith(
      'docker',
      expect.not.arrayContaining(['--build-arg']),
      { stdio: 'inherit', cwd: context.root }
    );
  });
});
