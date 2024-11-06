document.addEventListener("DOMContentLoaded", async function () {

    window.history.pushState({}, "", "/committee");

    const btn = document.querySelector('button');
    btn.addEventListener('click', () => {
        window.location.href = '/';
    });

});