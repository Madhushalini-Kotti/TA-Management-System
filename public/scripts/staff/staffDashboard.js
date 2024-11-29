document.addEventListener("DOMContentLoaded", async function () {

    window.history.pushState({}, "", "/staff");

    setUpDashboardBtn();
    setUpDepartmentsBtn();
    setUpSemestersBtn();
    setUpManageUsersBtn();
    setUpCoursesBtn();
    setUpApplicantsBtn();
    setUpSelectedApplicantsBtn();
    setUpLogoutBtn();

    document.getElementById("dashboard_btn").click();
    
});

// Utility function to populate a dropdown
function populateDropdown(dropdownElement, data, defaultOptionText) {
    dropdownElement.innerHTML = ''; // Clear existing options

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = defaultOptionText;
    dropdownElement.appendChild(defaultOption);

    data.forEach(item => {
        const option = document.createElement('option');
        option.value = item.department_abbre || item.semester;  // Adjust based on your data structure
        option.textContent = item.department_name || item.semester;  // Adjust based on your data structure
        dropdownElement.appendChild(option);
    });
}

async function updateDepartmentSemesterOptionsInOverlay() {

    const semesterSelect = document.getElementById('semester');
    const departmentSelect = document.getElementById('department');

    try {
        // Fetch and populate departments
        const departmentResponse = await fetch('/departmentList');
        const departmentData = await departmentResponse.json();
        populateDropdown(departmentSelect, departmentData, 'Select Department');
    } catch (error) {
        console.error('Error fetching department list:', error);
    }

    try {
        // Fetch and populate semesters
        const semesterResponse = await fetch('/semesterList');
        const semesterData = await semesterResponse.json();
        populateDropdown(semesterSelect, semesterData, 'Select Semester');
    } catch (error) {
        console.error('Error fetching semester list:', error);
    }
}

async function setUpSubmitBtn() {
    const overlay = document.getElementById("initial-overlay");
    const semesterSelect = document.getElementById('semester');
    const departmentSelect = document.getElementById('department');

    const selectedSemester = semesterSelect.value;
    const selectedDepartment = departmentSelect.value;

    console.log(selectedSemester, selectedDepartment);

    if (selectedSemester && selectedDepartment) {
        try {
            // Send selected semester and department to the backend
            const response = await fetch('/updateSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    semester: selectedSemester,
                    departmentAbbreviation: selectedDepartment
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                overlay.style.display = 'none';
                hideOverlayAndSemesterDepartmentModel();
            } else {
                alert("Error logging in. Please try again.");
            }

        } catch (error) {
            console.error("Error submitting selection:", error);
            alert("An error occurred. Please try again.");
        }
    }
}





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



function setUpDashboardBtn() {
    const dashboardBtn = document.getElementById("dashboard_btn");
    const dashboardContent = document.querySelector(".StaffDashboardContent");

    dashboardBtn.addEventListener("click", async () => {

        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            dashboardContent.style.display = "flex";
            resetButtonStyles();
            setActiveButton(dashboardBtn);
        } else {
            window.location.href = "/?sessionExpired=true"; 
        }
    });  
}  

function setUpDepartmentsBtn() {
    const departmentsBtn = document.getElementById("departments_btn");
    const departmentsContent = document.querySelector(".StaffDepartmentsContent");

    departmentsBtn.addEventListener("click", async () => {
        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            departmentsContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(departmentsBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }
    });
}  

function setUpSemestersBtn() {
    const semestersBtn = document.getElementById("semesters_btn");
    const semestersContent = document.querySelector(".StaffSemestersContent");

    semestersBtn.addEventListener("click", async () => {

        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            semestersContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(semestersBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }

    });
}

function setUpManageUsersBtn() {
    const manageUsersBtn = document.getElementById("manageUsers_btn");
    const manageUsersContent = document.querySelector(".StaffManageUsersContent");

    manageUsersBtn.addEventListener('click', async () => {

        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            manageUsersContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(manageUsersBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }
        
    });
}

function setUpCoursesBtn() {
    const coursesBtn = document.getElementById("courses_btn");
    const coursesBtnDashboard = document.getElementById("courses_btn_dashboard");
    const coursesContent = document.querySelector(".StaffCoursesContent");

    coursesBtn.addEventListener("click", async () => {

        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            coursesContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(coursesBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }

    });

    coursesBtnDashboard.addEventListener("click", async () => {

        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            coursesContent.style.display = "inline-flex";
            resetButtonStyles();
            setActiveButton(coursesBtn);
            coursesBtn.click();
        } else {
            window.location.href = "/?sessionExpired=true";
        }
        
    });
}

function setUpApplicantsBtn() {
    const applicantsBtn = document.getElementById("applicants_btn");
    const applicantsBtnDashboard = document.getElementById("applicants_btn_dashboard");
    const applicantsContent = document.querySelector(".StaffApplicantsContent");

    applicantsBtn.addEventListener("click", async () => {

        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            applicantsContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(applicantsBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }
        
    });

    applicantsBtnDashboard.addEventListener("click", async () => {

        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            applicantsContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(applicantsBtn);
            applicantsBtn.click();
        } else {
            window.location.href = "/?sessionExpired=true";
        }

    });
}

function setUpSelectedApplicantsBtn() {
    const selectedApplicantsBtn = document.getElementById("selectedApplicants_btn");
    const selectedApplicantsBtnDashboard = document.getElementById("selectedApplicants_btn_dashboard");
    const selectedApplicantsContent = document.querySelector(".StaffSelectedApplicantsContent");

    selectedApplicantsBtn.addEventListener("click", async () => {

        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            selectedApplicantsContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(selectedApplicantsBtn);
        } else {
            window.location.href = "/?sessionExpired=true";
        }
        
    });

    selectedApplicantsBtnDashboard.addEventListener("click", async () => {

        const sessionActive = await checkSession();
        if (sessionActive) {
            hideAllContents();
            selectedApplicantsContent.style.display = "grid";
            resetButtonStyles();
            setActiveButton(selectedApplicantsBtn);
            selectedApplicantsBtn.click();
        } else {
            window.location.href = "/?sessionExpired=true";
        }
        
    });
}

function setUpLogoutBtn() {
    const logoutBtn = document.getElementById("logout_btn");
    logoutBtn.addEventListener('click', async function () {
        window.location.href = '/';
    });
}

function hideAllContents() {
    const dashboardContent = document.querySelector(".StaffDashboardContent");
    const manageUsersContent = document.querySelector(".StaffManageUsersContent");
    const departmentsContent = document.querySelector(".StaffDepartmentsContent");
    const semestersContent = document.querySelector(".StaffSemestersContent");
    const coursesContent = document.querySelector(".StaffCoursesContent");
    const applicantsContent = document.querySelector(".StaffApplicantsContent");
    const selectedApplicantsContent = document.querySelector(".StaffSelectedApplicantsContent");

    dashboardContent.style.display = "none";
    manageUsersContent.style.display = "none";
    departmentsContent.style.display = "none";
    semestersContent.style.display = "none";
    coursesContent.style.display = "none";
    applicantsContent.style.display = "none";
    selectedApplicantsContent.style.display = "none";
}

function resetButtonStyles() {
    const dashboardBtn = document.getElementById("dashboard_btn");
    const departmentsBtn = document.getElementById("departments_btn");
    const semestersBtn = document.getElementById("semesters_btn");
    const manageUsersBtn = document.getElementById("manageUsers_btn");
    const coursesBtn = document.getElementById("courses_btn");
    const applicantsBtn = document.getElementById("applicants_btn");
    const selectedApplicantsBtn = document.getElementById("selectedApplicants_btn");

    const buttons = [dashboardBtn, departmentsBtn, semestersBtn, manageUsersBtn, coursesBtn, applicantsBtn, selectedApplicantsBtn];
    buttons.forEach(btn => {
        btn.style.backgroundColor = "#003366";
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', "white");
        const span = btn.querySelector('span');
        if (span) span.style.color = "white";
        btn.classList.remove("disabled_btn");
    });
}

function setActiveButton(button) {
    button.classList.add("disabled_btn"); 
    button.style.backgroundColor = "white"; 
    const svg = button.querySelector('svg');
    if (svg) svg.setAttribute('fill', "#003366");
    const span = button.querySelector('span');
    if (span) span.style.color = "#003366";

}
