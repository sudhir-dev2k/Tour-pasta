signup = async (email, password, name, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/users/signup',
      data: {
        email,
        password,
        name,
        passwordConfirm,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      document.cookie = `jwt=${res.data.token}`;
      console.log(document.cookie);
      alert('SignUp successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    if (err.response.data.error.code === 11000) {
      // run some code here //
      alert('Email ID belongs to someone else');
    } else {
      alert(err.response.data.message);
    }
  }
};

document.querySelector('.form--signup').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;

  signup(email, password, name, passwordConfirm);
});
