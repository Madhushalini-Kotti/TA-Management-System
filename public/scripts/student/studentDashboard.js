document.addEventListener("DOMContentLoaded", function () {

    window.history.pushState({}, "", "/student");
    setUpAccountBtn();
    setUpDashboardBtn();
    setUpApplyBtn();
    setUpApplicationsBtn();
    setUpStatusBtn();
    setUpInboxBtn();
    setUpLogoutBtn();

    document.getElementById("dashboard_btn").click();

});

function setUpAccountBtn() {
    const accountBtnDashboard = document.getElementById("account_btn_dashboard");
    const accountBtn = document.getElementById("account_btn");
    const accountContent = document.querySelector(".StudentAccountContent");

    accountBtn.addEventListener("click", () => {
        hideAllContents();
        accountContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(accountBtn);
    });

    accountBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        accountContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(accountBtn);
        accountBtn.click();
    });

}

function setUpDashboardBtn() {
    const dashboardBtn = document.getElementById("dashboard_btn");
    const dashboardContent = document.querySelector(".StudentDashboardContent");

    dashboardBtn.addEventListener("click", () => {
        hideAllContents();
        dashboardContent.style.display = "inline-flex";
        resetButtonStyles();
        setActiveButton(dashboardBtn);
    });
}

function setUpApplyBtn() {
    const applyBtn = document.getElementById("apply_btn");
    const applyBtnDashboard = document.getElementById("apply_btn_dashboard");
    const applyContent = document.querySelector(".StudentApplyContent");

    applyBtn.addEventListener("click", () => {
        hideAllContents();
        applyContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(applyBtn);
    });

    applyBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        applyContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(applyBtn);
        applyBtn.click();
    });

}

function setUpApplicationsBtn() {
    const applicationsBtnDashboard = document.getElementById("applications_btn_dashboard");
    const applicationsBtn = document.getElementById("applications_btn");
    const applicationsContent = document.querySelector(".StudentApplicationsContent");

    applicationsBtn.addEventListener("click", () => {
        hideAllContents();
        applicationsContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(applicationsBtn);
    });
   
    applicationsBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        applicationsContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(applicationsBtn);
        applicationsBtn.click();
    });

}

function setUpStatusBtn() {
    const statusBtn = document.getElementById("status_btn");
    const statusBtnDashboard = document.getElementById("status_btn_dashboard");
    const statusContent = document.querySelector(".StudentStatusContent");

    statusBtn.addEventListener("click", () => {
        hideAllContents();
        statusContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(statusBtn);
    });

    statusBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        statusContent.style.display = "block";
        resetButtonStyles();
        setActiveButton(statusBtn);
        statusBtn.click();
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
    const statusContent = document.querySelector(".StudentStatusContent");
    const inboxContent = document.querySelector(".StudentInboxContent");

    dashboardContent.style.display = "none";
    accountContent.style.display = "none";
    applyContent.style.display = "none";
    applicationsContent.style.display = "none";
    statusContent.style.display = "none";
    inboxContent.style.display = "none";
}

function resetButtonStyles() {
    const dashboardBtn = document.getElementById("dashboard_btn");
    const accountBtn = document.getElementById("account_btn");
    const applyBtn = document.getElementById("apply_btn");
    const applicationsBtn = document.getElementById("applications_btn");
    const statusBtn = document.getElementById("status_btn");
    const inboxBtn = document.getElementById("inbox_btn");

    const buttons = [dashboardBtn, accountBtn, applyBtn, applicationsBtn, statusBtn, inboxBtn];
    buttons.forEach(btn => {
        btn.style.backgroundColor = "#003366"; // Reset background color
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', "white"); // Reset SVG color
        const span = btn.querySelector('span');
        if (span) span.style.color = "white"; // Reset text color
        btn.classList.remove("disabled_btn");
    });
}

function setActiveButton(button) {
    // Set the active button styles
    button.classList.add("disabled_btn"); // Add the disabled class to the active button
    button.style.backgroundColor = "white"; // white color for the active button
    const svg = button.querySelector('svg');
    if (svg) svg.setAttribute('fill', "#003366");
    const span = button.querySelector('span');
    if (span) span.style.color = "#003366";
}
