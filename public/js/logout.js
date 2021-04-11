logout = async () => {
  alert('logged out successfully!');
  window.setTimeout(() => {
    location.assign('/login');
  }, 1500);
  document.cookie = 'jwt=';
};
