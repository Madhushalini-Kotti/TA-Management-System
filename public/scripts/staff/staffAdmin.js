
document.addEventListener('DOMContentLoaded', function () {
    setUpAdminMainBtn();
});

function setUpAdminMainBtn() {
    const adminBtn = document.getElementById("admin_btn");

    adminBtn.addEventListener('click', async function () {
        await fetchAdminDepartments();
        setUpNavigationBtns();
        setUpAddNewDepartmentBtn();
        setUpAddNewSemesterBtn();
    });
}


async function fetchCurrentYear() {
    const response = await fetch('/currentYear'); // Replace with your actual endpoint
    const data = await response.json();
    return data.currentYear; // Adjust based on your response structure
}

function setUpNavigationBtns() {
    const departmentBtn = document.getElementById('adminDepartmentBtn');
    const semestersBtn = document.getElementById('adminSemesterBtn');
    const manageUsersBtn = document.getElementById('adminManageUsersBtn');

    const departmentContent = document.getElementsByClassName('departments_content')[0];
    const semestersContent = document.getElementsByClassName('semesters_content')[0];
    const manageUsersContent = document.getElementsByClassName('manage_users_content')[0];

    departmentBtn.addEventListener('click', async function (event) {
        handleAdminNavigationBtnClick(event);
        await fetchAdminDepartments();
        departmentContent.style.display = "grid";
        semestersContent.style.display = "none";
        manageUsersContent.style.display = "none";
        setUpAddNewDepartmentBtn();
    });

    semestersBtn.addEventListener('click', async function (event) {
        handleAdminNavigationBtnClick(event);
        await fetchAdminSemesters();
        departmentContent.style.display = "none";
        semestersContent.style.display = "grid";
        manageUsersContent.style.display = "none";
        setUpAddNewSemesterBtn();

        const currentYear = await fetchCurrentYear(); // Fetch the current year from the backend
        const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i); // Generate next 10 years

        const selectYear = document.getElementById('selectYearNewSemester');

        selectYear.innerHTML = '';

        const option = document.createElement('option');
        option.value = 'Select Year';
        option.textContent = 'Select Year';
        selectYear.appendChild(option);
        option.disabled = true;

        yearOptions.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            selectYear.appendChild(option);
        });

    });

    manageUsersBtn.addEventListener('click', async function (event) {
        handleAdminNavigationBtnClick(event);
        await fetchAdminUsers();
        departmentContent.style.display = "none";
        semestersContent.style.display = "none";
        manageUsersContent.style.display = "grid";
    });
}

function handleAdminNavigationBtnClick(event) {
    const buttons = document.querySelectorAll('.admin_navigation_btns button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}






async function fetchAdminDepartments() {
    try {
        // Fetch the department data
        const departmentResponse = await fetch('/departmentList');
        const departmentData = await departmentResponse.json();
        console.log("Fetched Departments are", departmentData);

        // Get the container where department items will be appended
        const departmentsContainer = document.querySelector('.departments_list_container');
        departmentsContainer.innerHTML = ''; // Clear existing department items

        // Loop through each department and create the HTML structure
        departmentData.forEach(item => {
            const department_abbre = item.department_abbre;
            const department_name = item.department_name;

            // Create dept_item div
            const deptItemDiv = document.createElement('div');
            deptItemDiv.classList.add('dept_item');

            // Create dept_abbre div
            const deptAbbreDiv = document.createElement('div');
            deptAbbreDiv.classList.add('dept_abbre');
            deptAbbreDiv.innerHTML = `<span>${department_abbre}</span>`;

            // Create dept_name div
            const deptNameDiv = document.createElement('div');
            deptNameDiv.classList.add('dept_name');
            deptNameDiv.innerHTML = `<span>${department_name}</span>`;

            // Create delete button
            const deleteBtn = document.createElement('div');
            deleteBtn.classList.add('delete_dept_btn');
            const button = document.createElement('button');
            button.id = "deleteDeptBtn"; // It's good to have unique IDs, consider using a class instead
            button.type = "button";
            button.classList.add('btn');
            button.classList.add('btn-secondary');
            button.dataset.deptAbbre = department_abbre; // Use data attribute for department abbreviation
            button.textContent = "Delete";
            deleteBtn.appendChild(button);

            // Append dept_abbre and dept_name to dept_item
            deptItemDiv.appendChild(deptAbbreDiv);
            deptItemDiv.appendChild(deptNameDiv);
            deptItemDiv.appendChild(deleteBtn);

            // Append dept_item to the container
            departmentsContainer.appendChild(deptItemDiv);

            setUpDeleteDeptEventListener(deleteBtn, department_abbre);
        });

    } catch (error) {
        console.error("Error fetching departments:", error);
    }
}

function setUpAddNewDepartmentBtn() {
    const addDepartmentBtn = document.getElementById("new_department_btn");
    const departmentAbbrInput = document.querySelector(".add_department_container input[placeholder='Department Abbr.']");
    const departmentNameInput = document.querySelector(".add_department_container input[placeholder='Department name']");

    const newAddDepartmentBtn = addDepartmentBtn.cloneNode(true);
    addDepartmentBtn.parentNode.replaceChild(newAddDepartmentBtn, addDepartmentBtn);

    newAddDepartmentBtn.addEventListener('click', async () => {

        const departmentAbbr = departmentAbbrInput.value.trim();
        const departmentName = departmentNameInput.value.trim();

        // Check if both fields are filled
        if (!departmentAbbr || !departmentName) {
            alert("Please fill in both fields.");
            return;
        }

        try {
            // Send a request to the backend
            const response = await fetch('/newDepartment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    department_abbre: departmentAbbr,
                    department_name: departmentName,
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert("Department created successfully.");
                await fetchAdminDepartments();
                departmentAbbrInput.value = "";
                departmentNameInput.value = "";
            } else {
                alert(result.message); // Display error message (e.g., "Department already exists with the same abbreviation")
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });
}

function setUpDeleteDeptEventListener(deleteBtn, department_abbre) {

    deleteBtn.addEventListener('click', async () => {
        const confirmed = confirm(`Are you sure you want to delete the department "${department_abbre}"?`);
        if (confirmed) {
            try {
                const deleteResponse = await fetch(`/deleteDepartment/${department_abbre}`, {
                    method: 'DELETE',
                });

                const deleteResult = await deleteResponse.json();
                if (deleteResult.success) {
                    alert("Department deleted successfully.");
                    await fetchAdminDepartments(); // Refresh the department list
                } else {
                    alert(deleteResult.message); // Display error message if deletion fails
                }
            } catch (error) {
                console.error("Error deleting department:", error);
                alert("An error occurred while deleting the department. Please try again.");
            }
        }
    });

}







async function fetchAdminSemesters() {
    try {
        // Fetch the semester data
        const semesterResponse = await fetch('/semesterList'); // Replace with your actual endpoint
        const semesterData = await semesterResponse.json();
        console.log("Fetched semesters are", semesterData);

        // Select the container where the semester items will be appended
        const semestersListContainer = document.querySelector('.semesters_list_container');
        semestersListContainer.innerHTML = ''; // Clear existing semester items

        // Loop through each semester data and create a semester item
        semesterData.forEach(item => {
            const semesterName = item.semester;
            const semesterStatus = item.semester_status;

            // Create the semester item div
            const semesterItem = document.createElement('div');
            semesterItem.classList.add('semester_item');

            // Add the 'active' class if the semester status is 'active'
            if (semesterStatus === 'active') {
                semesterItem.classList.add('activeSemester');
            }

            // Create the semester name element
            const semesterNameDiv = document.createElement('div');
            semesterNameDiv.classList.add('semester_name');
            semesterNameDiv.innerHTML = `<span>${semesterName}</span>`;

            // Create the semester status element
            const semesterStatusDiv = document.createElement('div');
            semesterStatusDiv.classList.add('semester_status');
            semesterStatusDiv.innerHTML = `<span>${semesterStatus}</span>`;

            // Create the button to change status
            const changeStatusBtn = document.createElement('button');
            changeStatusBtn.classList.add('change_status_btn');
            changeStatusBtn.classList.add('btn');
            changeStatusBtn.classList.add('btn-secondary');
            changeStatusBtn.textContent = 'Change Status';
            changeStatusBtn.setAttribute('data-semester', semesterName); // Store semester name as a data attribute

            // Create delete button
            const deleteBtn = document.createElement('div');
            deleteBtn.classList.add('delete_semester_btn');
            const button = document.createElement('button');
            button.id = "deleteSemesterBtn"; // It's good to have unique IDs, consider using a class instead
            button.type = "button";
            button.classList.add('btn');
            button.classList.add('btn-secondary');
            button.dataset.semester = semesterName; // Use data attribute for department abbreviation
            button.textContent = "Delete";
            deleteBtn.appendChild(button);

            // Append the semester name and status to the semester item
            semesterItem.appendChild(semesterNameDiv);
            semesterItem.appendChild(document.createTextNode(" - ")); // Add a dash between name and status
            semesterItem.appendChild(semesterStatusDiv);
            semesterItem.appendChild(changeStatusBtn); // Append the change status button
            semesterItem.appendChild(deleteBtn);

            // Append the semester item to the container
            semestersListContainer.appendChild(semesterItem);

            // Set up the button to change status
            setUpChangeStatusBtn(changeStatusBtn, semesterStatusDiv);
            setUpDeleteSemesterBtn(deleteBtn, semesterName);
        });

    } catch (error) {
        console.error("Error fetching semesters:", error);
    }
}

function setUpAddNewSemesterBtn() {

    const addSemesterBtn = document.getElementById("new_semester_btn");
    const semesterNameInput = document.querySelector(".add_semester_container .select_semester_name");
    const semesterYearInput = document.querySelector(".add_semester_container .select_year");
    const semesterStatusInput = document.querySelector(".add_semester_container .select_status");

    const newAddSemesterBtn = addSemesterBtn.cloneNode(true);
    addSemesterBtn.parentNode.replaceChild(newAddSemesterBtn, addSemesterBtn);

    newAddSemesterBtn.addEventListener('click', async () => {

        const semesterName = semesterNameInput.value;
        const semesterYear = semesterYearInput.value;
        const semesterStatus = semesterStatusInput.value;

        if (semesterName === "Select Semester Name" || semesterYear === "Select Year" || semesterStatus === "Select Status") {
            alert("Please select all fields.");
            return;
        }

        try {
            //send a request to the backend
            const response = await fetch('/newSemester', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    semester: `${semesterName} ${semesterYear}`,
                    semesterStatus: semesterStatus,
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Semester created successfully.");
                await fetchAdminSemesters();
                // Clear the selected fields by resetting to the default option
                semesterNameInput.selectedIndex = 0;
                semesterYearInput.selectedIndex = 0;
                semesterStatusInput.selectedIndex = 0;
            } else {
                alert(result.message); // Display error message (e.g., "Semester already exists")
            }

        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });

}

function setUpDeleteSemesterBtn(deleteBtn, semesterName) {

    deleteBtn.addEventListener('click', async () => {
        const confirmed = confirm(`Are you sure you want to delete the semester "${semesterName}"?`);
        if (confirmed) {
            try {
                const deleteResponse = await fetch(`/deleteSemester/${semesterName}`, {
                    method: 'DELETE',
                });

                const deleteResult = await deleteResponse.json();
                if (deleteResult.success) {
                    alert("Semester deleted successfully.");
                    await fetchAdminSemesters(); // Refresh the department list
                } else {
                    alert(deleteResult.message); // Display error message if deletion fails
                }
            } catch (error) {
                console.error("Error deleting semester:", error);
                alert("An error occurred while deleting the semester. Please try again.");
            }
        }
    });
}

function setUpChangeStatusBtn(button, statusDiv) {
    button.addEventListener('click', async () => {
        // Get the current status from the DOM
        const currentStatus = statusDiv.textContent.trim(); // Get the current status text

        const newStatus = currentStatus === 'active' ? 'inactive' : 'active'; // Toggle status
        statusDiv.innerHTML = `<span>${newStatus}</span>`; // Update status in the DOM

        // Optional: Send the new status to the server
        const semesterName = button.getAttribute('data-semester'); // Get the semester name from data attribute
        await updateSemesterStatus(semesterName, newStatus); // Function to update on the backend
        await fetchAdminSemesters();
    });
}

// Function to update the semester status on the backend (optional)
async function updateSemesterStatus(semesterName, newStatus) {
    try {
        const response = await fetch('/updateSemesterStatus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ semester: semesterName, status: newStatus })
        });

        const result = await response.json();
        if (result.success) {
            console.log(`Successfully updated ${semesterName} to ${newStatus}`);
        } else {
            console.error(`Failed to update status for ${semesterName}`);
        }
    } catch (error) {
        console.error("Error updating semester status:", error);
    }
}









async function fetchAdminUsers() {

}


