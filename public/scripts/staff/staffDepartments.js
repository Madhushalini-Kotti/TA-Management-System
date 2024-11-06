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



