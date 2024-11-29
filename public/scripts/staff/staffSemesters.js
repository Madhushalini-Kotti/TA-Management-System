document.addEventListener('DOMContentLoaded', function () {
    setUpSemestersMainBtns();
});


function setUpSemestersMainBtns() {
    const semestersBtn = document.getElementById("semesters_btn");
    semestersBtn.addEventListener("click", async function () {
        await fetchAllSemesters();

        const endDateInput = document.querySelector(".select_end_date");
        await setUpNewSemesterEndDate(endDateInput);

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
    const response = await fetch('/currentYear');
    const data = await response.json();
    return data.currentYear; 
}

async function fetchCurrentDate() {
    const response = await fetch('/currentDate');
    const data = await response.json();
    return data; // Contains { year, month, date }
}

async function fetchAllSemesters() {
    try {
        const semesterResponse = await fetch('/semesterList')
        const semesterData = await semesterResponse.json();
        console.log("Fetched semesters are", semesterData);
        appendSemesters(semesterData);
    } catch (error) {
        console.error("Error fetching semesters:", error);
    }
}

function appendSemesters(semesterData) {
    const semestersListContainer = document.querySelector('.semesters_list_container');
    semestersListContainer.innerHTML = '';
    semesterData.forEach(item => {
        const semesterItem = createSemesterItem(item);
        semestersListContainer.appendChild(semesterItem);

        setUpDeleteSemesterBtn(semesterItem.querySelector('.delete_semester_btn button'), item.semester);
        setUpEditSemesterBtn(semesterItem.querySelector('.edit_semester_btn button'), item);
    });
}

function createSemesterItem(item) {
    const semesterItem = document.createElement('div');
    semesterItem.classList.add('semester_item');
    if (item.semester_status === 'active') semesterItem.classList.add('activeSemester');
    const formattedDate = formatDate(item.semester_deadline);

    semesterItem.innerHTML = `
        <div class="semester_name"><span>${item.semester}</span></div>
        <div class="semester_status"><span>${item.semester_status}</span></div>
        <div class="semester_deadline"><span>Deadline - ${formattedDate}</span></div>
        <div class="edit_semester_btn">
            <button id="editSemesterBtn" class="btn btn-secondary" type="button" data-semester="${item.semester}">
                Edit
            </button>
        </div>
        <div class="delete_semester_btn">
            <button id="deleteSemesterBtn" class="btn btn-secondary" type="button" data-semester="${item.semester}">
                Delete
            </button>
        </div>
    `;
    return semesterItem;
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const monthName = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    return `${monthName} ${day}${suffix}, ${year}`;
}

function setUpAddNewSemesterBtn() {

    const addSemesterBtn = document.getElementById("new_semester_btn");

    const semesterNameInput = document.querySelector(".add_semester_container .select_semester_name");
    const semesterYearInput = document.querySelector(".add_semester_container .select_year");
    const semesterStatusInput = document.querySelector(".add_semester_container .select_status");
    const semesterEndDateInput = document.querySelector(".add_semester_container .select_end_date");

    const newAddSemesterBtn = addSemesterBtn.cloneNode(true);
    addSemesterBtn.parentNode.replaceChild(newAddSemesterBtn, addSemesterBtn);

    newAddSemesterBtn.addEventListener('click', async () => {

        const semesterName = semesterNameInput.value;
        const semesterYear = semesterYearInput.value;
        const semesterStatus = semesterStatusInput.value;
        const semesterEndDate = semesterEndDateInput.value;

        if (semesterName === "Select Semester Name" || semesterYear === "Select Year" || semesterStatus === "Select Status" || !semesterEndDate) {
            alert("Please select all fields.");
            return;
        }

        try {
            const response = await fetch('/newSemester', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    semester: `${semesterName} ${semesterYear}`,
                    semesterStatus,
                    semesterEndDate,
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Semester created successfully.");
                await fetchAllSemesters();
                semesterNameInput.selectedIndex = 0;
                semesterYearInput.selectedIndex = 0;
                semesterStatusInput.selectedIndex = 0;
                semesterEndDateInput.value = "";
            } else {
                alert(result.message);
            }

        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred. Please try again.");
        }
    });

}

function setUpEditSemesterBtn(editButton, item) {
    editButton.addEventListener('click', async () => {
        const semesterItem = editButton.closest('.semester_item');

        if (semesterItem.nextElementSibling?.classList.contains('edit_row')) {
            semesterItem.nextElementSibling.remove();
            return;
        }

        const editRow = document.createElement('div');
        editRow.classList.add('edit_row');

        editRow.innerHTML = `
            <div class="edit_row_content">

                <div>
                    <label for="edit_status"><span>Status : </span></label>
                    <select id="edit_status">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div>
                    <label for="edit_deadline"><span>Deadline : </span></label>
                    <input type="date" id="edit_deadline" class="edit_deadline_input">
                </div>

                <div>
                    <button id="update_semester_btn" class="btn btn-primary" data-semester="${item.semester}">
                        Update
                    </button>
                </div>

            </div>
        `;

        semesterItem.insertAdjacentElement('afterend', editRow);

        const currentStatus = semesterItem.querySelector('.semester_status span').textContent.trim();
        editRow.querySelector('#edit_status').value = currentStatus;

        const originalDeadline = item.semester_deadline;
        const formattedDate = formatDateForInput(originalDeadline);
        editRow.querySelector('#edit_deadline').value = formattedDate;

        await setUpNewSemesterEndDate(editRow.querySelector('#edit_deadline'));

        setUpUpdateSemesterBtn(editRow.querySelector('#update_semester_btn'), item.semester, semesterItem);
    });
}

function formatDateForInput(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


function setUpUpdateSemesterBtn(updateButton, semesterName, semesterItem) {

    updateButton.addEventListener('click', async () => {

        console.log(semesterName, semesterItem);

        const newStatus = semesterItem.nextElementSibling.querySelector('#edit_status').value;
        const newDeadline = semesterItem.nextElementSibling.querySelector('#edit_deadline').value;

        try {
            const response = await fetch('/updateSemester', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ semester: semesterName, status: newStatus, deadline: newDeadline })
            });

            const result = await response.json();

            if (result.success) {
                console.log(`Successfully updated ${semesterName}`);
                await fetchAllSemesters();
            } else {
                console.error(`Failed to update semester ${semesterName}`);
            }

        } catch (error) {
            console.error("Error updating semester:", error);
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



async function setUpNewSemesterEndDate(endDateInput) {
    const todayDate = await fetchCurrentDate();

    const newTodayDate = `${todayDate.year}-${todayDate.month}-${todayDate.date}`;
    endDateInput.setAttribute("min", newTodayDate);
}



