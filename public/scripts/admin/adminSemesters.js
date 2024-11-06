document.addEventListener('DOMContentLoaded', function () {
    setUpSemestersMainBtn();
});

function setUpSemestersMainBtn() {
    const semestersBtn = document.getElementById("semesters_btn");
    semestersBtn.addEventListener("click", () => {
        fetchSemestersList();
    });
}

async function fetchCurrentYear() {
    const response = await fetch('/currentYear'); // Replace with your actual endpoint
    const data = await response.json();
    return data.currentYear; // Adjust based on your response structure
}

async function fetchSemestersList() {
    const currentYear = await fetchCurrentYear(); // Fetch the current year from the backend
    const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i); // Generate next 10 years

    // Populate the year dropdown
    const yearSelect = document.querySelector('.select_year');

    yearSelect.innerHTML = ''; 
    
    yearOptions.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Fetch semesters data
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
            semesterItem.classList.add('active');
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

        // Append the semester name and status to the semester item
        semesterItem.appendChild(semesterNameDiv);
        semesterItem.appendChild(document.createTextNode(" - ")); // Add a dash between name and status
        semesterItem.appendChild(semesterStatusDiv);
        semesterItem.appendChild(changeStatusBtn); // Append the change status button

        // Append the semester item to the container
        semestersListContainer.appendChild(semesterItem);

        // Set up the button to change status
        setUpChangeStatusBtn(changeStatusBtn, semesterStatusDiv);
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
        document.getElementById("semesters_btn").click();
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
