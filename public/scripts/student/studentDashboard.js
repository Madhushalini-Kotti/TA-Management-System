document.addEventListener("DOMContentLoaded", function () {

    window.history.pushState({}, "", "/student");
    
    setUpAccountBtn();
    setUpDashboardBtn();
    setUpApplyBtn();
    setUpApplicationsBtn();
    setUpInboxBtn();
    setUpLogoutBtn();

    document.getElementById("dashboard_btn").click();

});



async function checkSession() {
    try {
        const response = await fetch('/check-session', { method: 'GET', credentials: 'include' });

        if (response.ok) {
            const data = await response.json();
            return data.sessionActive;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error checking session:", error);
        return false;
    }
}

function setUpAccountBtn() {
    const accountBtnDashboard = document.getElementById("account_btn_dashboard");
    const accountBtn = document.getElementById("account_btn");
    const accountContent = document.querySelector(".StudentAccountContent");

    accountBtn.addEventListener("click", async () => {
        const sessionActive = await checkSession();

        if (sessionActive) {
            hideAllContents();
            accountContent.style.display = "block";
            resetButtonStyles();
            setActiveButton(accountBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }

    });

    accountBtnDashboard.addEventListener("click", async () => {

        const sessionActive = await checkSession();

        if (sessionActive) {
            hideAllContents();
            accountContent.style.display = "block";
            resetButtonStyles();
            setActiveButton(accountBtn);
            accountBtn.click();
        } else {
            window.location.href = "/?sessionExpired=true";
        }

    });

}

function setUpDashboardBtn() {
    const dashboardBtn = document.getElementById("dashboard_btn");
    const dashboardContent = document.querySelector(".StudentDashboardContent");

    dashboardBtn.addEventListener("click", async () => {

        const sessionActive = await checkSession();

        if (sessionActive) {
            hideAllContents();
            dashboardContent.style.display = "inline-flex";
            resetButtonStyles();
            setActiveButton(dashboardBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }

    });

}

function setUpApplyBtn() {
    const applyBtn = document.getElementById("apply_btn");
    const applyBtnDashboard = document.getElementById("apply_btn_dashboard");
    const applyContent = document.querySelector(".StudentApplyContent");

    applyBtn.addEventListener("click", async () => {

        const sessionActive = await checkSession();

        if (sessionActive) {
            hideAllContents();
            applyContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(applyBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }
        
    });

    applyBtnDashboard.addEventListener("click", async () => {

        const sessionActive = await checkSession();

        if (sessionActive) {
            hideAllContents();
            applyContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(applyBtn);
            applyBtn.click();
        } else {
            window.location.href = "/?sessionExpired=true";
        }

    });

}

function setUpApplicationsBtn() {
    const applicationsBtnDashboard = document.getElementById("applications_btn_dashboard");
    const applicationsBtn = document.getElementById("applications_btn");
    const applicationsContent = document.querySelector(".StudentApplicationsContent");

    applicationsBtn.addEventListener("click", async () => {

        const sessionActive = await checkSession();

        if (sessionActive) {
            hideAllContents();
            applicationsContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(applicationsBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }

    });
   
    applicationsBtnDashboard.addEventListener("click", async () => {

        const sessionActive = await checkSession();

        if (sessionActive) {
            hideAllContents();
            applicationsContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(applicationsBtn);
            applicationsBtn.click();
        } else {
            window.location.href = "/?sessionExpired=true";
        }

    });

}

function setUpInboxBtn() {
    const inboxBtn = document.getElementById("inbox_btn");
    const inboxBtnDashboard = document.getElementById("inbox_btn_dashboard");
    const inboxContent = document.querySelector(".StudentInboxContent");

    inboxBtn.addEventListener("click", () => {
        hideAllContents();
        inboxContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(inboxBtn);
    });

    inboxBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        inboxContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(inboxBtn);
        inboxBtn.click();
    });

}

function setUpLogoutBtn() {
    const logoutBtn = document.getElementById("logout_btn");
    logoutBtn.addEventListener('click', async function () {
        window.location.href = '/';
    });
}

function hideAllContents() {
    const dashboardContent = document.querySelector(".StudentDashboardContent");
    const accountContent = document.querySelector(".StudentAccountContent");
    const applyContent = document.querySelector(".StudentApplyContent");
    const applicationsContent = document.querySelector(".StudentApplicationsContent");
    const inboxContent = document.querySelector(".StudentInboxContent");

    dashboardContent.style.display = "none";
    accountContent.style.display = "none";
    applyContent.style.display = "none";
    applicationsContent.style.display = "none";
    inboxContent.style.display = "none";
}

function resetButtonStyles() {
    const dashboardBtn = document.getElementById("dashboard_btn");
    const accountBtn = document.getElementById("account_btn");
    const applyBtn = document.getElementById("apply_btn");
    const applicationsBtn = document.getElementById("applications_btn");
    const inboxBtn = document.getElementById("inbox_btn");

    const buttons = [dashboardBtn, accountBtn, applyBtn, applicationsBtn, inboxBtn];
    buttons.forEach(btn => {
        btn.style.backgroundColor = "#003366"; // Reset background color
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', "white"); // Reset SVG color
        const span = btn.querySelector('span');
        if (span) span.style.color = "white"; // Reset text color]
    });
}

function setActiveButton(button) {
    button.style.backgroundColor = "white"; // white color for the active button
    const svg = button.querySelector('svg');
    if (svg) svg.setAttribute('fill', "#003366");
    const span = button.querySelector('span');
    if (span) span.style.color = "#003366";
}
