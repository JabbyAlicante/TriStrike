// import style from './component.module.css';

export default function Counter(root) {
  let counter = 0;

  const button = document.createElement('button');
  button.innerText = `Click Me (${counter})`;
  // button.className = style['counter-btn'];

  button.addEventListener('click', () => {
    counter++;
    button.innerText = `Click Me (${counter})`;
  });

  // root.appendChild(button);
}
