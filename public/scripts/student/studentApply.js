

document.addEventListener("DOMContentLoaded", () => {
    setUpApplyMainBtn();
});

function setUpApplyMainBtn() {
    const applyBtn = document.getElementById("apply_btn");

    applyBtn.addEventListener("click", () => {
        fetchDepartmentsApply();
        fetchSemestersApply();
        fetchCourses();
    });
}


// Fetch and populate departments
async function fetchDepartmentsApply() {
    try {
        const response = await fetch('/departmentList');
        const departments = await response.json();

        const dropdown = document.getElementById('departmentDropdownApply');
        dropdown.innerHTML = '<option value="">All Departments</option>';

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.department_abbre;
            option.textContent = `${dept.department_abbre} - ${dept.department_name}`;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
    }
}

// Fetch and populate semesters
async function fetchSemestersApply() {
    try {
        const response = await fetch('/semesterList');
        const semesters = await response.json();

        const dropdown = document.getElementById('semesterDropdownApply');
        dropdown.innerHTML = '<option value="">All Semesters</option>';

        semesters.forEach(sem => {
            const option = document.createElement('option');
            option.value = sem.semester;
            option.textContent = `${sem.semester} ${sem.semester_status === 'Active' ? '(Active)' : ''}`;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching semesters:", error);
    }
}

// Setup event listeners for Apply buttons
function setupApplyButtons() {

    const newApplicationContainer = document.querySelector(".new_application_container");
    const popupOverlay = document.querySelector(".overlay");

    const courseTitleSpan = newApplicationContainer.querySelector(".course_title span");
    const courseNameSpan = newApplicationContainer.querySelector(".course_name_container .value span");
    const courseNumberSpan = newApplicationContainer.querySelector(".course_number_container .value span");
    const departmentSpan = newApplicationContainer.querySelector(".department_name_container .value span");
    const semesterSpan = newApplicationContainer.querySelector(".semester_name_container .value span");

    document.querySelectorAll(".apply_btn_container button").forEach(button => {
        button.addEventListener("click", function () {
            const courseContainer = this.closest(".course_container");

            // Populate the new application form with course data
            courseTitleSpan.textContent = courseContainer.querySelector(".course_title span").textContent;
            courseNameSpan.textContent = courseContainer.querySelector(".course_name .value").textContent;
            courseNumberSpan.textContent = courseContainer.querySelector(".course_number .value").textContent;
            departmentSpan.textContent = courseContainer.querySelector(".department_name .value").textContent;
            semesterSpan.textContent = courseContainer.querySelector(".semester_name .value").textContent;

            // Show the form and overlay
            popupOverlay.style.display = "block";
            newApplicationContainer.style.display = "inline-flex";
            setupSubmitCancelApplicationBtns();
        });
    });
}

// Submit or Cancel application form
function setupSubmitCancelApplicationBtns() {
    const newApplicationContainer = document.querySelector(".new_application_container");
    const popupOverlay = document.querySelector(".overlay");

    const submitApplicationBtn = document.querySelector(".submit_application_btn");
    const cancleApplicationBtn = document.querySelector(".cancel_application_btn");

    // Remove existing event listeners to avoid duplicate triggers
    const newSubmitApplicationBtn = submitApplicationBtn.cloneNode(true);
    submitApplicationBtn.parentNode.replaceChild(newSubmitApplicationBtn, submitApplicationBtn);

    const newCancelApplicationBtn = cancleApplicationBtn.cloneNode(true);
    cancleApplicationBtn.parentNode.replaceChild(newCancelApplicationBtn, cancleApplicationBtn);

    // Handle form submission
    newSubmitApplicationBtn.addEventListener("click", async function (event) {
        event.preventDefault();
        const formData = collectFormData(newApplicationContainer);

        try {
            const response = await fetch('/submitNewApplication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                closePopup(newApplicationContainer, popupOverlay);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to submit application.");
                closePopup(newApplicationContainer, popupOverlay);
            }
            document.getElementById("apply_btn").click(); // Refresh courses

        } catch (error) {
            console.error("Error submitting application:", error);
            alert("An error occurred. Please try again later.");
            closePopup(newApplicationContainer, popupOverlay);
        }
    });

    // Handle cancel button click
    newCancelApplicationBtn.addEventListener("click", function () {
        closePopup(newApplicationContainer, popupOverlay);
    });
}


// Submit or Cancel application form
function setupSubmitCancelApplicationBtns2() {
    const newApplicationContainer = document.querySelector(".new_application_container");
    const popupOverlay = document.querySelector(".overlay");

    const submitApplicationBtn = document.querySelector(".submit_application_btn");
    const cancleApplicationBtn = document.querySelector(".cancel_application_btn");

    // Handle form submission
    submitApplicationBtn.addEventListener("click", async function (event) {
        event.preventDefault();
        const formData = collectFormData(newApplicationContainer);

        try {
            const response = await fetch('/submitNewApplication', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                closePopup(newApplicationContainer, popupOverlay);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to submit application.");
                closePopup(newApplicationContainer, popupOverlay);
            }
            document.getElementById("apply_btn").click();

        } catch (error) {
            console.error("Error submitting application:", error);
            alert("An error occurred. Please try again later.");
            closePopup(newApplicationContainer, popupOverlay);
        }
    });

    // Handle cancel button click
    cancleApplicationBtn.addEventListener("click", function () {
        closePopup(newApplicationContainer, popupOverlay);
    });
}

// Collect form data for submission
function collectFormData(container) {
    return {
        dept_name: container.querySelector(".department_name_container .value span").textContent.trim(),
        semester: container.querySelector(".semester_name_container .value span").textContent.trim(),
        a_grade: container.querySelector("input[name='a_grade']").checked,
        served_as_ta: container.querySelector("input[name='served_as_ta']").checked,
        professional_experience: container.querySelector("input[name='professional_experience']").checked,
        comments: container.querySelector("textarea[name='additional_comments']").value.trim(),
        course_name: container.querySelector(".course_name_container .value span").textContent.trim(),
        course_number: container.querySelector(".course_number_container .value span").textContent.trim(),
        course_title: container.querySelector(".course_title span").textContent.trim()
    };
}

// Close the popup and reset form
function closePopup(container, overlay) {
    container.style.display = "none";
    overlay.style.display = "none";
    resetForm(container);
}

// Reset form fields
function resetForm(container) {
    container.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
        checkbox.checked = false;
    });
    container.querySelector("textarea[name='additional_comments']").value = "";
}

// Handle filter dropdowns
function setupFilterDropdowns() {
    const departmentDropdownApply = document.getElementById("departmentDropdownApply");
    const semesterDropdownApply = document.getElementById("semesterDropdownApply");
    const statusDropdown = document.getElementById("statusDropdown");

    departmentDropdownApply.addEventListener("change", filterCourses);
    semesterDropdownApply.addEventListener("change", filterCourses);
    statusDropdown.addEventListener("change", filterCourses);
}

// Filter courses based on department, semester, and status
function filterCourses() {
    const department = document.getElementById("departmentDropdownApply").value.toLowerCase().trim();
    const semester = document.getElementById("semesterDropdownApply").value.toLowerCase().trim();
    const status = document.getElementById("statusDropdown").value.toLowerCase().trim();

    document.querySelectorAll(".course_container").forEach(course => {
        const courseDept = course.getAttribute("data-department").toLowerCase().trim();
        const courseSem = course.getAttribute("data-semester").toLowerCase().trim();
        const courseStatus = course.getAttribute("data-status").toLowerCase().trim();

        const matchesDept = !department || courseDept === department;
        const matchesSem = !semester || courseSem === semester;
        const matchesStatus = !status || courseStatus === status;

        course.style.display = (matchesDept && matchesSem && matchesStatus) ? "inline-flex" : "none";
    });
}

// Fetch and populate courses
async function fetchCourses() {
    try {
        const response = await fetch('/allCoursesStudent');
        const courses = await response.json();
        
        const container = document.getElementById('coursesListContainer');
        container.innerHTML = '';

        courses.forEach(course => {
            const courseContainer = document.createElement('div');
            courseContainer.classList.add('course_container');
            courseContainer.dataset.department = course.dept_name.toLowerCase().trim();
            courseContainer.dataset.semester = course.semester.toLowerCase().trim();
            courseContainer.dataset.status = course.course_status.toLowerCase().trim();
            courseContainer.dataset.applied = course.applied;

            let btnInnerHTML = ``;
            if (course.applied) {
                btnInnerHTML = `<div class="applied_btn_container"><button type="button" class="AppliedBtn" disabled>Applied</button></div>`;
            } else {
                btnInnerHTML = `<div class="apply_btn_container"><button type="button">Apply now</button></div>`;
            }

            courseContainer.innerHTML = `
                <div class="course_title"><span>${course.course_title}</span></div>
                <div class="course_name"><span class="heading">Course Name</span><span class="value">${course.course_name}</span></div>
                <div class="course_number"><span class="heading">Course Number</span><span class="value">${course.course_number}</span></div>
                <div class="department_name"><span class="heading">Department</span><span class="value">${course.dept_name}</span></div>
                <div class="semester_name"><span class="heading">Semester</span><span class="value">${course.semester}</span></div>
                ${btnInnerHTML}
            `;
            container.appendChild(courseContainer);
        });

        setupApplyButtons();
        setupFilterDropdowns()

    } catch (error) {
        console.error("Error fetching courses:", error);
    }
}

