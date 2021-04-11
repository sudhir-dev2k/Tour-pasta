login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'api/users/login',
      data: {
        email,
        password,
      },
      withCredentials: true,
    });
    console.log(res.status);
    if (res.data.status === 'Success') {
      document.cookie = `jwt=${res.data.token}`;
      console.log(document.cookie);
      alert('logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

document.querySelector('.form--login').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
