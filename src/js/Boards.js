export default class Boards {
  constructor(element) {
    this.boards = element;
    this.columns = element.querySelectorAll('.boards__list');
    this.add = element.querySelectorAll('.boards__add');
    this.tasks = [
      ['Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laboriosam, aliquam.', 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Non nam aut quisquam ipsam illum odio!', 'Lorem ipsum dolor sit.', 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Adipisci ab rerum dicta', 'Lorem ipsum dolor sit amet consectetur.'],
      ['Lorem ipsum dolor sit amet consectetur adipisicing elit.', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam.', 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Architecto, natus eaque?', 'Lorem ipsum dolor sit amet consectetur.'],
      ['Welcome to Trello', 'Thid is a card'],
    ];

    this.addItem = this.addItem.bind(this);
    this.addItemSubmit = this.addItemSubmit.bind(this);
    this.addItemClose = this.addItemClose.bind(this);
    this.closeItemMouseOver = this.closeItemMouseOver.bind(this);
    this.closeItemMouseOut = this.closeItemMouseOut.bind(this);
    this.closeItem = this.closeItem.bind(this);
    this.loadTasks = this.loadTasks.bind(this);
    this.saveTasks = this.saveTasks.bind(this);
    this.dragStart = this.dragStart.bind(this);
    this.dragMove = this.dragMove.bind(this);
    this.dragFinish = this.dragFinish.bind(this);
    this.dragTakePlace = this.dragTakePlace.bind(this);
    this.dragPlaceRemove = this.dragPlaceRemove.bind(this);
  }

  init() {
    document.addEventListener('DOMContentLoaded', this.loadTasks);
    window.addEventListener('beforeunload', this.saveTasks);

    this.render();

    [...this.add].forEach((element) => { element.addEventListener('click', this.addItem); });
    [...this.columns].forEach((element) => { element.addEventListener('mouseover', this.closeItemMouseOver); });
    [...this.columns].forEach((element) => { element.addEventListener('mouseout', this.closeItemMouseOut); });
    [...this.columns].forEach((element) => { element.addEventListener('mousedown', this.dragStart); });
  }

  render() {
    for (const column of this.columns) {
      column.innerHTML = '';
    }

    if (this.tasks.length) {
      for (let i = 0; i < this.columns.length; i += 1) {
        this.tasks[i].forEach((item) => {
          const itemNode = document.createElement('li');
          itemNode.classList.add('boards__item');
          itemNode.innerText = item;
          this.columns[i].append(itemNode);
        });
      }
    }
  }

  addItem(event) {
    const addForm = document.createElement('form');
    addForm.classList.add('boards__add_form');
    addForm.innerHTML = `
	  <textarea class="boards__add_textarea" placeholder="Inter a title for this card..."></textarea>
	  <div class="boards__add_controls">
		 <button class="boards__add_button">Add card</button>
		 <div class="boards__add_close">✕</div>
	  </div>`;
    event.target.replaceWith(addForm);

    addForm.addEventListener('submit', this.addItemSubmit);
    const closeFormElement = addForm.querySelector('.boards__add_close');
    closeFormElement.addEventListener('click', this.addItemClose);
  }

  addItemSubmit(event) {
    event.preventDefault();
    const textarea = event.target.querySelector('.boards__add_textarea');
    if (textarea.value) {
      const currentColumn = event.target.parentElement.querySelector('.boards__list');
      const columnIndex = [...this.columns].findIndex((column) => column === currentColumn);
      this.tasks[columnIndex].push(textarea.value);
      this.render();
      event.target.replaceWith(this.add[columnIndex]);
    } else {
      const error = document.createElement('div');
      error.classList.add('boards__add_error');
      error.innerText = "You didn't write anything";
      textarea.after(error);
      error.style.top = `${textarea.offsetTop + textarea.offsetHeight - error.offsetHeight}px`;
      setTimeout(() => error.remove(), 2000);
    }
  }

  addItemClose(event) {
    const currentColumn = event.target.closest('.boards__column').querySelector('.boards__list');
    const columnIndex = [...this.columns].findIndex((column) => column === currentColumn);
    event.target.closest('.boards__add_form').replaceWith(this.add[columnIndex]);
  }

  closeItemMouseOver(event) {
    if (!event.target.classList.contains('boards__item')) {
      return;
    }
    if (event.relatedTarget && event.relatedTarget.parentNode === event.target) {
      return;
    }
    if (this.draggedElement) {
      return;
    }
    const closeItemElement = document.createElement('div');
    closeItemElement.classList.add('boards__close');
    event.target.append(closeItemElement);
    const coords = event.target.getBoundingClientRect();
    closeItemElement.style.top = `${window.scrollY + coords.top}px`;
    closeItemElement.style.left = `${window.scrollX + coords.left + event.target.offsetWidth - closeItemElement.offsetWidth}px`;

    closeItemElement.addEventListener('click', this.closeItem);
  }

  // eslint-disable-next-line class-methods-use-this
  closeItemMouseOut(event) {
    if (event.relatedTarget.parentNode === event.target) {
      return;
    }
    const closeElement = event.target.querySelector('.boards__close');
    const closeParentElement = event.target.parentNode.querySelector('.boards__close');
    if (closeElement) {
      closeElement.remove();
    } else if (closeParentElement) {
      closeParentElement.remove();
    }
  }

  closeItem(event) {
    const itemText = event.target.closest('.boards__item').innerText;
    const currentColumn = event.target.closest('.boards__column').querySelector('.boards__list');
    const columnIndex = [...this.columns].findIndex((column) => column === currentColumn);
    const itemIndex = this.tasks[columnIndex].findIndex((item) => item === itemText);
    this.tasks[columnIndex].splice(itemIndex, 1);
    this.render();
  }

  loadTasks() {
    const tasksLoaded = localStorage.getItem('boards');
    if (tasksLoaded) {
      this.tasks = JSON.parse(tasksLoaded);
    }
    this.render();
  }

  saveTasks() {
    localStorage.setItem('boards', JSON.stringify(this.tasks));
  }

  dragStart(event) {
    if (!event.target.classList.contains('boards__item') || event.which !== 1) {
      return;
    }
    this.targetElement = event.target;
    this.draggedElement = this.targetElement.cloneNode(true);
    this.draggedElement.classList.add('boards__dragged');
    this.draggedElement.querySelector('.boards__close').remove();
    document.body.append(this.draggedElement);

    this.draggedX = event.pageX - this.targetElement.getBoundingClientRect().x;
    this.draggedY = event.pageY - this.targetElement.getBoundingClientRect().y;
    this.draggedElement.style.width = `${this.targetElement.offsetWidth}px`;
    this.draggedElement.style.height = `${this.targetElement.offsetHeight}px`;
    this.draggedElement.style.left = `${event.pageX - this.draggedX - 5}px`;
    this.draggedElement.style.top = `${event.pageY - this.draggedY - 5}px`;

    this.targetElement.style.display = 'none';

    document.addEventListener('mousemove', this.dragMove);
    [...this.columns].forEach((element) => { element.addEventListener('mousemove', this.dragTakePlace); });
    [...this.columns].forEach((element) => { element.addEventListener('mouseleave', this.dragPlaceRemove); });
    document.addEventListener('mouseup', this.dragFinish);
  }

  dragMove(event) {
    event.preventDefault();
    if (!this.draggedElement) {
      return;
    }
    this.draggedElement.style.left = `${event.pageX - this.draggedX - 5}px`;
    this.draggedElement.style.top = `${event.pageY - this.draggedY - 5}px`;
  }

  dragTakePlace(event) {
    if (!this.draggedElement) {
      return;
    }
    const column = event.target.closest('.boards__list');
    const columnItems = column.querySelectorAll('.boards__item');
    const allPos = [column.getBoundingClientRect().top];
    for (const item of columnItems) {
      allPos.push(item.getBoundingClientRect().top + item.offsetHeight / 2);
    }

    if (!this.targetPlace) {
      this.targetPlace = document.createElement('div');
      this.targetPlace.classList.add('boards__targetplace');
      this.targetPlace.style.width = `${this.draggedElement.offsetWidth}px`;
      this.targetPlace.style.height = `${this.draggedElement.offsetHeight}px`;
    }

    const itemIndex = allPos.findIndex((item) => item > event.pageY);
    if (itemIndex !== -1) {
      columnItems[itemIndex - 1].before(this.targetPlace);
    } else {
      column.append(this.targetPlace);
    }
  }

  dragPlaceRemove() {
    if (!this.draggedElement) {
      return;
    }
    if (this.targetPlace) {
      this.targetPlace.remove();
      this.targetPlace = null;
    }
  }

  dragFinish(event) {
    if (!this.draggedElement) {
      return;
    }
    if (!event.target.closest('.boards__list')) {
      this.dragClean();
      return;
    }

    this.targetPlace.replaceWith(this.targetElement);
    this.dragClean();
    this.tasksCollect();
  }

  dragClean() {
    this.targetElement.style.display = 'list-item';
    this.draggedElement.remove();
    this.draggedElement = null;
    this.draggedX = null;
    this.draggedY = null;
    this.targetPlace = null;
    document.removeEventListener('mousemove', this.dragMove);
    [...this.columns].forEach((element) => { element.removeEventListener('mousemove', this.dragTakePlace); });
    [...this.columns].forEach((element) => { element.removeEventListener('mouseleave', this.dragPlaceRemove); });
    document.removeEventListener('mouseup', this.dragFinish);
  }

  tasksCollect() {
    this.tasks = [[], [], []];
    for (let i = 0; i < this.columns.length; i += 1) {
      const tasksElement = this.columns[i].querySelectorAll('.boards__item');
      for (const task of tasksElement) {
        this.tasks[i].push(task.innerText);
      }
    }
  }
}
