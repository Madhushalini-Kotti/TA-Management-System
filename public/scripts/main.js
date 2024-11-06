document.addEventListener("DOMContentLoaded",async () => {
    setUpTMSLabelButton();
    setUpLoginButton();

});

function setUpLoginButton() {
    const loginBtn = document.querySelector('.loginBtn');
    loginBtn.addEventListener('click', async function () {
        await submitLogin();
    });
}

async function submitLogin() {

    const netid = document.querySelector('.netid_input').value;
    const password = document.querySelector('.password_input').value;

    // Basic validation
    if (!netid) {
    alert('Please enter netid');
    return;
    }

    const form = document.createElement('form');
    form.action = '/login';
    form.method = 'POST';

    const netidInput = document.createElement('input');
    netidInput.type = 'hidden';
    netidInput.name = 'netid';
    netidInput.value = netid;

    const passwordInput = document.createElement('input');
    passwordInput.type = 'hidden';
    passwordInput.name = 'password';
    passwordInput.value = password;

    form.appendChild(netidInput);
    form.appendChild(passwordInput);

    document.body.appendChild(form);
    form.submit();
}

function setUpTMSLabelButton() {
    const tmsLabel = document.getElementById('TmsLabel');
    tmsLabel.addEventListener('click', async function () {
        await fetch('/');
    });
}

