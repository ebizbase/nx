// docker-service.spec.ts
import { DockerUtils } from './docker.utils';
import { execFileSync } from 'child_process';

// Mock execFileSync function
jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));

describe('DockerService', () => {
  let dockerService: DockerUtils;

  beforeEach(() => {
    dockerService = new DockerUtils();
    jest.resetAllMocks();
  });

  describe('checkDockerInstalled', () => {
    it('should return true if Docker is installed', () => {
      // Arrange: execFileSync sẽ không ném ra lỗi
      (execFileSync as jest.Mock).mockImplementation(() => true);

      // Act
      const result = dockerService.checkDockerInstalled(true);

      // Assert
      expect(result).toBe(true);
      expect(execFileSync).toHaveBeenCalledWith('docker', ['info'], { stdio: 'inherit' });
    });

    it('should return false if Docker is not installed or daemon is not running', () => {
      // Arrange: execFileSync sẽ ném ra lỗi
      (execFileSync as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      // Act
      const result = dockerService.checkDockerInstalled(false);

      // Assert
      expect(result).toBe(false);
      expect(execFileSync).toHaveBeenCalledWith('docker', ['info'], { stdio: 'ignore' });
    });
  });

  describe('checkBuildxInstalled', () => {
    it('should return true if Docker buildx is installed', () => {
      // Arrange
      (execFileSync as jest.Mock).mockImplementation(() => true);

      // Act
      const result = dockerService.checkBuildxInstalled(true);

      // Assert
      expect(result).toBe(true);
      expect(execFileSync).toHaveBeenCalledWith('docker', ['buildx', 'version'], {
        stdio: 'inherit',
      });
    });

    it('should return false if Docker buildx is not installed', () => {
      // Arrange
      (execFileSync as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      // Act
      const result = dockerService.checkBuildxInstalled(false);

      // Assert
      expect(result).toBe(false);
      expect(execFileSync).toHaveBeenCalledWith('docker', ['buildx', 'version'], {
        stdio: 'ignore',
      });
    });
  });
});
