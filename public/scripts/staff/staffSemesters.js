document.addEventListener('DOMContentLoaded', function () {
    setUpSemestersMainBtns();
});


function setUpSemestersMainBtns() {
    const semestersBtn = document.getElementById("semesters_btn");
    semestersBtn.addEventListener("click", async function () {
        await fetchAllSemesters();
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
}

async function fetchCurrentYear() {
    const response = await fetch('/currentYear'); // Replace with your actual endpoint
    const data = await response.json();
    return data.currentYear; // Adjust based on your response structure
}

async function fetchAllSemesters() {
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
                await fetchAllSemesters();
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
                    await fetchAllSemesters(); // Refresh the department list
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

        // Add or remove the active class based on the new status
        const semesterItem = button.closest('.semester_item');
        if (newStatus === 'active') {
            semesterItem.classList.add('activeSemester');
        } else {
            semesterItem.classList.remove('activeSemester');
        }

        // Optional: Send the new status to the server
        const semesterName = button.getAttribute('data-semester'); // Get the semester name from data attribute
        await updateSemesterStatus(semesterName, newStatus); // Function to update on the backend
        await fetchAllSemesters();
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

