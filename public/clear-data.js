window.clearSoulData = () => {
  localStorage.clear();
  console.log('LocalStorage cleared!');
  location.reload();
};