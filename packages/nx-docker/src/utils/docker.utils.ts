// docker-service.ts
import { execFileSync } from 'child_process';

export class DockerUtils {
  checkDockerInstalled(verbose: boolean): boolean {
    try {
      execFileSync('docker', ['info'], { stdio: verbose ? 'inherit' : 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  checkBuildxInstalled(verbose: boolean): boolean {
    try {
      execFileSync('docker', ['buildx', 'version'], { stdio: verbose ? 'inherit' : 'ignore' });
      return true;
    } catch {
      return false;
    }
  }
}
