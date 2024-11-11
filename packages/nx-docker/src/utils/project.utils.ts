import { ExecutorContext, ProjectConfiguration } from '@nx/devkit';

export class ProjectUtils {
  private projectName: string;

  constructor(private context: ExecutorContext) {
    const projectName = context.projectName;
    if (!projectName) {
      throw new Error('No project name provided');
    }
    this.projectName = projectName;
  }

  public getProjectName(): string {
    return this.projectName;
  }

  public getProjectConfig(): ProjectConfiguration {
    return this.context.projectsConfigurations.projects[this.projectName];
  }

  public getProjectRoot(): string {
    return this.getProjectConfig().root;
  }
}
