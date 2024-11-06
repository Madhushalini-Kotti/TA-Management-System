document.addEventListener('DOMContentLoaded', function () {
    
    window.history.pushState({}, "", "/admin");
    setUpDashboardBtn();
    setUpDepartmentsBtn();
    setUpSemestersBtn();
    setUpLogoutBtn();

    document.getElementById("dashboard_btn").click();

});

function setUpDashboardBtn() {
    const dashboardBtn = document.getElementById("dashboard_btn");
    const dashboardContent = document.querySelector(".AdminDashboardContent");

    dashboardBtn.addEventListener("click", () => {
        hideAllContents();
        dashboardContent.style.display = "inline-flex";
        resetButtonStyles();
        setActiveButton(dashboardBtn);
    });
}

function setUpDepartmentsBtn() {
    const departmentsBtn = document.getElementById("departments_btn");
    const departmentsBtnDashboard = document.getElementById("departments_btn_dashboard");
    const departmentsContent = document.querySelector(".AdminDepartmentsContent");

    departmentsBtn.addEventListener("click", () => {
        hideAllContents();
        departmentsContent.style.display = "inline-flex";
        resetButtonStyles();
        setActiveButton(departmentsBtn);
    });

    departmentsBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        departmentsContent.style.display = "inline-flex";
        resetButtonStyles();
        setActiveButton(departmentsBtn);
        departmentsBtn.click();
    });
}

function setUpSemestersBtn() {
    const semestersBtn = document.getElementById("semesters_btn");
    const semestersBtnDashboard = document.getElementById("semesters_btn_dashboard");
    const semestersContent = document.querySelector(".AdminSemestersContent");

    semestersBtn.addEventListener("click", () => {
        hideAllContents();
        semestersContent.style.display = "inline-flex";
        resetButtonStyles();
        setActiveButton(semestersBtn);
    });

    semestersBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        semestersContent.style.display = "inline-flex";
        resetButtonStyles();
        setActiveButton(semestersBtn);
        semestersBtn.click();
    });
}

function setUpLogoutBtn() {
    const logoutBtn = document.getElementById("logout_btn");
    logoutBtn.addEventListener('click', async function () {
        window.location.href = '/';
    });
}

function hideAllContents() {
    const dashboardContent = document.querySelector(".AdminDashboardContent");
    const departmentsContent = document.querySelector(".AdminDepartmentsContent");
    const semestersContent = document.querySelector(".AdminSemestersContent");

    dashboardContent.style.display = "none";
    departmentsContent.style.display = "none";
    semestersContent.style.display = "none";
}

function resetButtonStyles() {
    const dashboardBtn = document.getElementById("dashboard_btn");
    const departmentsBtn = document.getElementById("departments_btn");
    const semestersBtn = document.getElementById("semesters_btn");

    const buttons = [dashboardBtn, departmentsBtn, semestersBtn];
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