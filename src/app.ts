// Project type
enum ProjectStauts { Active, Finished }

class Project {
  constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStauts) {}
}

// Listeners type
type Listener = (items: Project[]) => void;

// Project State Managment
class ProjectState {
  private listeners: Listener[] = [];

  private projects: Project[] = [];

  private static instance: ProjectState;

  private constructor() {

  }

  static getInstance() {
    if(this.instance)
      return this.instance;


    this.instance = new ProjectState();

    return this.instance;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStauts.Active);

    this.projects.push(newProject);

    for(const listenerFn of this.listeners)
      listenerFn(this.projects.slice());

  }
}

const projectState = ProjectState.getInstance();

// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = (validatableInput: Validatable) => {
  let isValid = true;

  if(validatableInput.required)
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;


  if(validatableInput.minLength !== undefined && typeof validatableInput.value === 'string')
    isValid = isValid && validatableInput.value.length > validatableInput.minLength;


  if(validatableInput.maxLength !== undefined && typeof validatableInput.value === 'string')
    isValid = isValid && validatableInput.value.length < validatableInput.maxLength;


  if(validatableInput.min !== undefined && typeof validatableInput.value === 'number')
    isValid = isValid && validatableInput.value > validatableInput.min;


  if(validatableInput.max !== undefined && typeof validatableInput.value === 'number')
    isValid = isValid && validatableInput.value < validatableInput.max;


  return isValid;
};

// Autobind decorator
const Autobind = (_1: any, _2: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);

      return boundFn;
    }
  };

  return adjDescriptor;
};

// ProjectList Class
class ProjectList {
  templateElement: HTMLTemplateElement;

  hostElement: HTMLDivElement;

  element: HTMLElement;

  assignedProjects: Project[];


  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = [];

    const importNode = document.importNode(this.templateElement.content, true);
    this.element = importNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter(prj => {
        if(this.type === 'active')
          return prj.status === ProjectStauts.Active;


        return prj.status === ProjectStauts.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = '';

    for(const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);

  }
}

// ProjectInput class
class ProjectInput {
  templateElement: HTMLTemplateElement;

  hostElement: HTMLDivElement;

  element: HTMLFormElement;

  titleInputElement: HTMLInputElement;

  descriptionInputElement: HTMLInputElement;

  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importNode = document.importNode(this.templateElement.content, true);
    this.element = importNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

    this.configure();
    this.attach();
  }

  // eslint-disable-next-line consistent-return
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeopleAmount = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    };

    const peopleValidatable: Validatable = {
      value: +enteredPeopleAmount,
      required: true,
      min: 1,
      max: 5
    };

    if(!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable))
      alert('Invalid input, please try again!');
    else
      return [ enteredTitle, enteredDescription, +enteredPeopleAmount ];


  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    if(Array.isArray(userInput)) {
      const [ title, desc, people ] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
const activePrjLsit = new ProjectList('active');
const finishedPrjLsit = new ProjectList('finished');
