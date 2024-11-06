document.addEventListener("DOMContentLoaded", async function () {

    try {

        // Check if semester and department are set in session
        const response = await fetch("/checkDeptSemester");
        const sessionData = await response.json();

        if (sessionData.allSet) {
            hideOverlayAndSemesterDepartmentModel();
        } else {
            showOverlayAndSemesterDepartmentModel();
        }
    } catch (error) {
        console.error("Error checking session:", error);
    }
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

async function hideOverlayAndSemesterDepartmentModel() {

    const overlay = document.getElementById("initial-overlay");

    overlay.style.display = "none";
    window.history.pushState({}, "", "/staff");

    setUpDashboardBtn();
    setUpDepartmentsBtn();
    setUpSemestersBtn();
    setUpManageUsersBtn();
    setUpCoursesBtn();
    setUpApplicantsBtn();
    setUpSelectedApplicantsBtn();
    setUpLogoutBtn();
    await setUpSemesterDepartmentTitles();

    document.getElementById("dashboard_btn").click();

}

async function showOverlayAndSemesterDepartmentModel() {
    const overlay = document.getElementById("initial-overlay");
    overlay.style.display = "flex";

    await updateDepartmentSemesterOptionsInOverlay();

    const semesterSelect = document.getElementById('semester');
    const departmentSelect = document.getElementById('department');


    const submitButton = document.getElementById('submitSelection');

    function enableSubmitButton() {
        if (semesterSelect.value && departmentSelect.value) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }

    semesterSelect.addEventListener('change', enableSubmitButton);
    departmentSelect.addEventListener('change', enableSubmitButton);

    submitButton.addEventListener('click', setUpSubmitBtn);

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





function setUpDashboardBtn() {
    const dashboardBtn = document.getElementById("dashboard_btn");
    const dashboardContent = document.querySelector(".StaffDashboardContent");

    dashboardBtn.addEventListener("click", () => {
        hideAllContents();
        dashboardContent.style.display = "flex";
        resetButtonStyles();
        setActiveButton(dashboardBtn);
    });
}

function setUpDepartmentsBtn() {
    const departmentsBtn = document.getElementById("departments_btn");
    const departmentsContent = document.querySelector(".StaffDepartmentsContent");

    departmentsBtn.addEventListener("click", () => {
        hideAllContents();
        departmentsContent.style.display = "grid";
        resetButtonStyles();
        setActiveButton(departmentsBtn);
    });
}

function setUpSemestersBtn() {
    const semestersBtn = document.getElementById("semesters_btn");
    const semestersContent = document.querySelector(".StaffSemestersContent");

    semestersBtn.addEventListener("click", () => {
        hideAllContents();
        semestersContent.style.display = "grid";
        resetButtonStyles();
        setActiveButton(semestersBtn);
    });
}

function setUpManageUsersBtn() {
    const manageUsersBtn = document.getElementById("manageUsers_btn");
    const manageUsersContent = document.querySelector(".StaffManageUsersContent");

    manageUsersBtn.addEventListener('click', () => {
        hideAllContents();
        manageUsersContent.style.display = "grid";
        resetButtonStyles();
        setActiveButton(manageUsersBtn);
    });
}

function setUpCoursesBtn() {
    const coursesBtn = document.getElementById("courses_btn");
    const coursesBtnDashboard = document.getElementById("courses_btn_dashboard");
    const coursesContent = document.querySelector(".StaffCoursesContent");

    coursesBtn.addEventListener("click", () => {
        hideAllContents();
        coursesContent.style.display = "inline-flex";
        resetButtonStyles();
        setActiveButton(coursesBtn);
    });

    coursesBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        coursesContent.style.display = "inline-flex";
        resetButtonStyles();
        setActiveButton(coursesBtn);
        coursesBtn.click();
    });
}

function setUpApplicantsBtn() {
    const applicantsBtn = document.getElementById("applicants_btn");
    const applicantsBtnDashboard = document.getElementById("applicants_btn_dashboard");
    const applicantsContent = document.querySelector(".StaffApplicantsContent");

    applicantsBtn.addEventListener("click", () => {
        hideAllContents();
        applicantsContent.style.display = "grid";
        resetButtonStyles();
        setActiveButton(applicantsBtn);
    });

    applicantsBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        applicantsContent.style.display = "grid";
        resetButtonStyles();
        setActiveButton(applicantsBtn);
        applicantsBtn.click();
    });
}

function setUpSelectedApplicantsBtn() {
    const selectedApplicantsBtn = document.getElementById("selectedApplicants_btn");
    const selectedApplicantsBtnDashboard = document.getElementById("selectedApplicants_btn_dashboard");
    const selectedApplicantsContent = document.querySelector(".StaffSelectedApplicantsContent");

    selectedApplicantsBtn.addEventListener("click", () => {
        hideAllContents();
        selectedApplicantsContent.style.display = "grid";
        resetButtonStyles();
        setActiveButton(selectedApplicantsBtn);
    });

    selectedApplicantsBtnDashboard.addEventListener("click", () => {
        hideAllContents();
        selectedApplicantsContent.style.display = "grid";
        resetButtonStyles();
        setActiveButton(selectedApplicantsBtn);
        selectedApplicantsBtn.click();
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

async function setUpSemesterDepartmentTitles() {
    try {
        const response = await fetch('/semester');
        if (response.ok) {
            const semester = await response.json();
            const semesterTitles = document.querySelectorAll('.department_semester_container .semester_title_container span');
            // Update each span with the fetched semester title
            semesterTitles.forEach(semesterTitle => {
                semesterTitle.innerHTML = `<span>${semester}</span>`; // Assuming 'semester' is a string; adjust if it's an array
            });
        } else {
            const errorData = await response.json();
            console.error('Error fetching semester data:', errorData.error);
        }
    } catch (error) {
        console.error("Error fetching semester data:", error);
    }

    try {
        const response = await fetch('/department');
        if (response.ok) {
            const department = await response.json();
            const departmentTitles = document.querySelectorAll('.department_semester_container .department_title_container span');
            // Update each span with the fetched department title
            departmentTitles.forEach(departmentTitle => {
                departmentTitle.innerHTML = `<span>${department}</span>`; // Assuming 'department' is a string; adjust if it's an array
            });
        } else {
            const errorData = await response.json();
            console.error('Error fetching department data:', errorData.error);
        }
    } catch (error) {
        console.error("Error fetching department data:", error);
    }
}
