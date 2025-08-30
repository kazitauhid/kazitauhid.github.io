const toggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  if (navLinks.style.display === 'flex') {
    navLinks.style.display = 'none';
  } else {
    navLinks.style.display = 'flex';
  }
});
