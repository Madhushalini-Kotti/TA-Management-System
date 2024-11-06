document.addEventListener('DOMContentLoaded', function () {

    setUpDepartmentsMainBtn();

});

function setUpDepartmentsMainBtn() {
    const departmentsBtn = document.getElementById("departments_btn");
    departmentsBtn.addEventListener("click", () => {
        fetchDepartmentsList()
    });
}

async function fetchDepartmentsList() {
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

            // Append dept_abbre and dept_name to dept_item
            deptItemDiv.appendChild(deptAbbreDiv);
            deptItemDiv.appendChild(deptNameDiv);

            // Append dept_item to the container
            departmentsContainer.appendChild(deptItemDiv);
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
    }
}
