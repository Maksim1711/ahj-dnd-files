import Boards from './Boards';

const boards = new Boards(document.querySelector('.boards'));
boards.init();
boards.tasks = [
  ['Lorem ipsum dolor sit amet consectetur, adipisicing elit. Laboriosam, aliquam.', 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Non nam aut quisquam ipsam illum odio!', 'Lorem ipsum dolor sit.', 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Adipisci ab rerum dicta', 'Lorem ipsum dolor sit amet consectetur.'],
  ['Lorem ipsum dolor sit amet consectetur adipisicing elit.', 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam.', 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Architecto, natus eaque?', 'Lorem ipsum dolor sit amet consectetur.'],
  ['Welcome to Trello', 'Thid is a card'],
];
boards.render();
