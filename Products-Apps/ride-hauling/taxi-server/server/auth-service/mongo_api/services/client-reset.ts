export {};
const linkUrl = 'http://localhost:12000/api/v1/auth/resetpassword';
const msgg = document.getElementById('msg') as HTMLElement | null;

function launchSubmit() {
  const passwordInput = document.getElementById('password') as HTMLInputElement | null;
  const confirmPasswordInput = document.getElementById('confirm-password') as HTMLInputElement | null;
  const resetForm = document.getElementById('reset-form') as HTMLElement | null;
  const successAnimationStart = document.getElementById('success-mark') as HTMLElement | null;

  const password = passwordInput?.value;
  const confirmPassword = confirmPasswordInput?.value;

  if (!password) {
    if (msgg) msgg.innerHTML = 'Password is required';
    setTimeout(() => {
      if (msgg) msgg.innerHTML = '';
    }, 6000);
    return;
  }

  console.log('working code');

  const credentials = {
    password,
    confirmPassword,
  };

  fetch(linkUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify(credentials),
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data) {
        if (resetForm) resetForm.style.display = 'none';
        setTimeout(() => {
          if (successAnimationStart) successAnimationStart.style.display = 'block';
        }, 10);
      } else {
        if (msgg) msgg.innerHTML = 'SOME ERROR OCCURED';
      }
    })
    .catch(error => {
      throw error;
    });
}

function triggerSubmit() {
  const reset = document.getElementById('reset');
  if (reset) {
    reset.addEventListener('click', (e) => {
      e.preventDefault();
      launchSubmit();
    });
  }
}

triggerSubmit();
