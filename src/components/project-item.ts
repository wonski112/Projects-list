import { Autobind } from '../decorators/autobind';
import { Draggable } from '../models/drag-drop';
import { Project } from '../models/project';
import { Component } from './base-component';

// ProjectItem Class
export class ProjectItem extends Component<HTMLUListElement, HTMLLinkElement> implements Draggable {
  private project: Project;

  get persons() {
    if(this.project.people === 1)
      return '1 Person';

    return `${this.project.people} Persons`;

  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_1: DragEvent) {}

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = `${this.persons} assigned`;
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}
