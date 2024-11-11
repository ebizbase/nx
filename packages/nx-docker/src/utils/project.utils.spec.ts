// project-utils.spec.ts
import { ExecutorContext } from '@nx/devkit';
import { ProjectUtils } from './project.utils';

describe('ProjectUtils', () => {
  let projectUtils: ProjectUtils;
  const context: ExecutorContext = {
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

  beforeEach(() => {
    projectUtils = new ProjectUtils(context);
  });

  describe('constructor', () => {
    it('should throw an error if project name is not provided', () => {
      // Arrange: create context without projectName
      const invalidContext = { ...context, projectName: undefined };

      // Act & Assert
      expect(() => new ProjectUtils(invalidContext as ExecutorContext)).toThrow(
        'No project name provided'
      );
    });
  });

  describe('getProjectName', () => {
    it('should return the project name', () => {
      // Act
      const projectName = projectUtils.getProjectName();

      // Assert
      expect(projectName).toBe('test-project');
    });
  });

  describe('getProjectConfig', () => {
    it('should return the project configuration', () => {
      // Act
      const projectConfig = projectUtils.getProjectConfig();

      // Assert
      expect(projectConfig).toEqual({ root: '/root/test-project' });
    });
  });

  describe('getProjectRoot', () => {
    it('should return the project root path', () => {
      // Act
      const projectRoot = projectUtils.getProjectRoot();

      // Assert
      expect(projectRoot).toBe('/root/test-project');
    });
  });
});
