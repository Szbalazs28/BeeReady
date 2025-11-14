const card = document.querySelector('.card');
  const loginDiv = document.querySelector('.login');
  const signinDiv = document.querySelector('.signin');
  const forgetDiv = document.querySelector('.forget_password_div');

  // Ha az „Elfelejtettem a jelszavam”-ra rákattintunk, a másik két div eltűnik, viszont a másik kettő cserélgeti egymást
  function login_signin() {
    const isLoginVisible = loginDiv.style.display === 'block' || loginDiv.style.display === '';

    card.classList.remove('fade-in');
    card.classList.add('fade-out');

    setTimeout(() => {
      if (isLoginVisible) {
        loginDiv.style.display = 'none';
        signinDiv.style.display = 'block';
        forgetDiv.style.display = 'none';
      } else {
        signinDiv.style.display = 'none';
        loginDiv.style.display = 'block';
        forgetDiv.style.display = 'none';
      }

      card.classList.remove('fade-out');
      card.classList.add('fade-in');
    }, 200);
  }

  function forget_Password() {
    let isFPassVisible = loginDiv.style.display === 'block' || loginDiv.style.display === '';

    card.classList.remove('fade-in');
    card.classList.add('fade-out');

    setTimeout(() => {
      if (isFPassVisible) {
        loginDiv.style.display = 'none';
        signinDiv.style.display = 'block';
        forgetDiv.style.display = 'none';
      } else {
        signinDiv.style.display = 'none';
        loginDiv.style.display = 'none';
        forgetDiv.style.display = 'block';
      }

      card.classList.remove('fade-out');
      card.classList.add('fade-in');
    }, 200);
  }

  let uzenet = document.getElementById("uzenet")
  document.getElementById("regform").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:4000/regisztracio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    message = await response.json()
    uzenet.innerHTML = message.message

  });
  document.getElementById("loginform").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginemail").value;
    const password = document.getElementById("loginpassword").value;

    const response = await fetch("http://localhost:4000/bejelentkezes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    message = await response.json()
    uzenet.innerHTML = message.message

  });