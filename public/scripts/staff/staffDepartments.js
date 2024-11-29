document.addEventListener('DOMContentLoaded', function () {
    setUpDepartmentsMainBtns();
});


function setUpDepartmentsMainBtns() {
    const departmentsBtn = document.getElementById("departments_btn");
    departmentsBtn.addEventListener("click", async function () {
        await fetchAllDepartments();
        setUpAddNewDepartmentBtn();
    });
}

async function fetchAllDepartments() {
    try {
        const departmentResponse = await fetch('/departmentList');
        const departmentData = await departmentResponse.json();
        console.log("Fetched Departments are", departmentData);

        const departmentsContainer = document.querySelector('.departments_list_container');
        departmentsContainer.innerHTML = ''; // Clear existing department items

        departmentData.forEach(item => {
            const deptItemDiv = createDepartmentItem(item);
            departmentsContainer.appendChild(deptItemDiv);

            const viewProgramsBtn = deptItemDiv.querySelector('.view_programs_btn');
            const deleteBtn = deptItemDiv.querySelector('.delete_dept_btn');
            const programsListDiv = deptItemDiv.querySelector('.programs_list');

            setUpViewProgramsEventListener(viewProgramsBtn, programsListDiv, item.course_programs, item.department_abbre);
            setUpDeleteDeptEventListener(deleteBtn, item.department_abbre);
        });

    } catch (error) {
        console.error("Error fetching departments:", error);
    }
}

function createDepartmentItem(item) {
    const deptItemDiv = document.createElement('div');
    deptItemDiv.classList.add('dept_item');

    const deptAbbreDiv = document.createElement('div');
    deptAbbreDiv.classList.add('dept_abbre');
    deptAbbreDiv.innerHTML = `<span>${item.department_abbre}</span>`;

    const deptNameDiv = document.createElement('div');
    deptNameDiv.classList.add('dept_name');
    deptNameDiv.innerHTML = `<span>${item.department_name}</span>`;

    const viewProgramsBtn = document.createElement('button');
    viewProgramsBtn.classList.add('view_programs_btn', 'btn', 'btn-secondary');
    viewProgramsBtn.textContent = "View Programs";

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete_dept_btn', 'btn', 'btn-secondary');
    deleteBtn.textContent = "Delete";

    const programsList = document.createElement('div');
    programsList.classList.add('programs_list');
    programsList.style.display = 'none';

    deptItemDiv.append(deptAbbreDiv, deptNameDiv, viewProgramsBtn, deleteBtn, programsList);
    return deptItemDiv;
}

function setUpViewProgramsEventListener(button, programsList, coursePrograms, dept_name) {
    button.addEventListener('click', async () => {

        programsList.innerHTML = '';

        programsList.innerHTML = `
            <div class="add_program_container">
                <input type="text" class="program_abbr_input" placeholder="Program Abbreviation" />
                <input type="text" class="program_name_input" placeholder="Program Name" />
                <button type="button" class="add_program_btn btn btn-primary">Add Program</button>
            </div>
        `;

        if (coursePrograms.length === 0) {
            programsList.innerHTML += `
                <div class="program_item">
                    <span class="no_courses_available">No Course Programs Available</span>
                </div>
            `;
        } else {
            coursePrograms.forEach(program => {
                programsList.innerHTML += `
                    <div class="program_item">
                        <span class="program_name">${program.courseprogram_abbre}</span>
                        <span class="program_duration">${program.courseprogram_name}</span>
                        <button type="button" class="delete_program_btn btn btn-danger" data-program-abbre="${program.courseprogram_abbre}">Delete Program</button>
                    </div>
                `;
            });
        }

        programsList.style.display = programsList.style.display === 'none' ? 'block' : 'none';
        button.textContent = programsList.style.display === 'block' ? "Hide Programs" : "View Programs";

        const addProgramButton = programsList.querySelector('.add_program_btn');
        addProgramButton.addEventListener('click', () => handleAddProgram(programsList, dept_name));

        const deleteProgramBtns = programsList.querySelectorAll('.delete_program_btn');
        deleteProgramBtns.forEach(deleteBtn => {
            setUpDeleteProgramEventListener(deleteBtn, dept_name);
        });
    });
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
                await fetchAllDepartments();
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
                    await fetchAllDepartments(); // Refresh the department list
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

async function handleAddProgram(programsList, deptAbbre) {
    const programAbbrInput = programsList.querySelector('.program_abbr_input');
    const programNameInput = programsList.querySelector('.program_name_input');
    const programAbbr = programAbbrInput.value.trim();
    const programName = programNameInput.value.trim();

    // Check if both fields are filled
    if (!programAbbr || !programName) {
        alert("Please fill in both fields.");
        return;
    }

    const requestData = {
        dept_abbre: deptAbbre,  // Assuming deptAbbre is passed as a parameter
        courseprogram_abbre: programAbbr,
        courseprogram_name: programName
    };

    try {
        // Send a request to the backend to add the new program
        const response = await fetch('/addNewProgram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
        });

        const result = await response.json();
        if (result.success) {
            alert("Program added successfully.");
            await fetchAllDepartments();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error adding program:", error);
        alert("An error occurred while adding the program. Please try again.");
    }
}

function setUpDeleteProgramEventListener(deleteBtn, deptAbbre) {
    deleteBtn.addEventListener('click', async () => {
        const programAbbre = deleteBtn.getAttribute('data-program-abbre');
        const confirmed = confirm(`Are you sure you want to delete the program "${programAbbre}"?`);

        if (confirmed) {
            try {
                const deleteResponse = await fetch(`/deleteProgram?dept_name=${deptAbbre}&programAbbre=${programAbbre}`, {
                    method: 'DELETE',
                });

                const deleteResult = await deleteResponse.json();
                if (deleteResult.success) {
                    alert("Program deleted successfully.");
                    await fetchAllDepartments(); // Refresh the department list
                } else {
                    alert(deleteResult.message); // Display error message if deletion fails
                }
            } catch (error) {
                console.error("Error deleting program:", error);
                alert("An error occurred while deleting the program. Please try again.");
            }
        }
    });
}



