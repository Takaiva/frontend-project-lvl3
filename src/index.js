import './styles.scss';

const button = document.querySelector('button');

button.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('hi!');
});