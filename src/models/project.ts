// Project type
export enum ProjectStauts { Active, Finished }

export class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStauts
  ) {}
}
