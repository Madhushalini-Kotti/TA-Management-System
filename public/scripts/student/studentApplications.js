document.addEventListener("DOMContentLoaded", () => {
    setUpApplicationsMainBtn();
});

function setUpApplicationsMainBtn() {
    const applicationsBtn = document.getElementById("applications_btn");

    applicationsBtn.addEventListener("click",async () => {
        fetchDepartmentsApplications();
        fetchSemestersApplications();
        await fetchApplications();
        setUpFilterDropdownsForApplications();
    });
}

async function fetchDepartmentsApplications() {
    // Fetching departments (already implemented)
    const departmentResponse = await fetch('/departmentList');
    const departments = await departmentResponse.json();

    const departmentDropdown = document.getElementById('departmentDropdownApplications');
    departmentDropdown.innerHTML = '<option value="" selected>All Departments</option>';

    departments.forEach(department => {
        const option = document.createElement('option');
        option.value = department.department_abbre;
        option.textContent = `${department.department_abbre} - ${department.department_name}`;
        departmentDropdown.appendChild(option);
    });
}

async function fetchSemestersApplications() {
    // Fetching semesters (already implemented)
    const semesterResponse = await fetch('/semesterList');
    const semesters = await semesterResponse.json();
    const semesterDropdown = document.getElementById('semesterDropdownApplications');
    semesterDropdown.innerHTML = '<option value="" selected>All Semesters</option>';  // Reset dropdown

    semesters.forEach(semester => {
        const option = document.createElement('option');
        option.value = semester.semester;
        option.textContent = semester.semester;
        if (semester.semester_status === 'Active') {
            option.textContent += ' (Active)';
        }
        semesterDropdown.appendChild(option);
    });
}

async function fetchApplications() {

    // Fetch notified message for the student
    await fetchNotifiedMessages();

    const applicationsResponse = await fetch(`/applicationsByStudentNetid`);
    const applications = await applicationsResponse.json();

    const applicationsListContainer = document.getElementById('applicationsListContainer');
    applicationsListContainer.innerHTML = '';  // Clear previous list

    applications.forEach(application => {

        const applicationContainer = document.createElement('div');
        applicationContainer.classList.add('application_container');
        applicationContainer.id = `application-${application.id}`;
        applicationContainer.dataset.department = application.dept_name.toLowerCase().trim();
        applicationContainer.dataset.semester = application.semester.toLowerCase().trim();

        let courseStatusInnerHtml = ``;
        let applicationStatus = ``;

        if (application.application_status === 'selected' && application.notified_applicant === true) {
            courseStatusInnerHtml = `
                <span class="status_title">Status :</span><button class="view_message_btn btn" data-application-id="${application.id}" data-course-title="${application.course_title}"><span class="selected_status"> Selected</span><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="RED" class="bi bi-chat-right-text" viewBox="0 0 16 16">
  <path d="M2 1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h9.586a2 2 0 0 1 1.414.586l2 2V2a1 1 0 0 0-1-1zm12-1a2 2 0 0 1 2 2v12.793a.5.5 0 0 1-.854.353l-2.853-2.853a1 1 0 0 0-.707-.293H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"/>
  <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 6a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 6m0 2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5"/>
</svg> </button>
        `;
            applicationStatus = "Selected";
        } else {
            // Otherwise, update with the original status
            courseStatusInnerHtml = `
            <span class="status_title">Status :</span><span class="under_review_status">Under Review </span>
        `;
            applicationStatus = "Under Review";
        }


        applicationContainer.dataset.status = applicationStatus;

        applicationContainer.innerHTML = `
            <div class="course_title_status_container">
                <div class="course_title">
                    <span>${application.course_title}</span>
                </div>
                <div class="course_status">
                ${courseStatusInnerHtml}
                </div>
                
            </div>
            <div class="course_name_number_department_semester_container">
                <div>
                    <div class="title"><span>Course Name</span></div>
                    <div class="value"><span>${application.course_name}</span></div>
                </div>
                <div>
                    <div class="title"><span>Course Number</span></div>
                    <div class="value"><span>${application.course_number}</span></div>
                </div>
                <div>
                    <div class="title"><span>Department</span></div>
                    <div class="value"><span>${application.dept_name}</span></div>
                </div>
                <div>
                    <div class="title"><span>Semester</span></div>
                    <div class="value"><span>${application.semester}</span></div>
                </div>
            </div>
            <div class="eligibility_criteria_items_container">
                <div class="select_that_apply"><span>Select all that apply</span></div>
                <div class="eligibility_criteria_item">
                    <div class="criteria">
                        <input type="checkbox" id="a_grade_${application.id}" ${application.a_grade === 'true' ? 'checked' : ''} disabled>
                    </div>
                    <div><span class="title">Completed the Subject with A grade</span></div>
                </div>
                <div class="eligibility_criteria_item">
                    <div class="criteria">
                        <input type="checkbox" id="served_as_ta_${application.id}" ${application.served_as_ta === 'true' ? 'checked' : ''} disabled>
                    </div>
                    <div><span class="title">Already Served as a TA for this Subject</span></div>
                </div>
                <div class="eligibility_criteria_item">
                    <div class="criteria">
                        <input type="checkbox" id="professional_experience_${application.id}" ${application.professional_experience === 'true' ? 'checked' : ''} disabled>
                    </div>
                    <div><span class="title">Have Relevant Professional Experience</span></div>
                </div>
            </div>
            <div class="comments">
                <div class="title"><span>Your Comments</span></div>
                <div class="value">
                    <span id="comments_${application.id}">${application.comments || 'No Comments'}</span>
                </div>
            </div>
            <div class="edit_delete_save_cancel_btns_container">
                <button class="edit_btn" type="button" data-application-id="${application.id}">Edit</button>
                <button class="delete_btn" type="button" data-application-id="${application.id}">Delete</button>
                <button class="save_btn" type="button" style="display: none;" data-application-id="${application.id}">Save changes</button>
                <button class="cancel_btn" type="button" style="display: none;" data-application-id="${application.id}">Cancel</button>
            </div>
        `;

        // Append application container to the list
        applicationsListContainer.appendChild(applicationContainer);

        // Set up event listeners for buttons
        setUpApplicationButtons(application);
    });

    setUpFilterDropdownsForApplications();
}

async function fetchNotifiedMessages() {
    const response = await fetch('/fetchNotifiedMessageOfStudent');
    const messages = await response.json();

    const notifiedMessageContainer = document.querySelector('.notified_message_container'); 

    if (messages.length > 0) {
        // Display the notification message if available
        const messageTitle = messages[0].message_title;
        const messageContent = messages[0].message_content; 

        console.log(messageTitle, messageContent);

        notifiedMessageContainer.style.display = 'block';
        notifiedMessageContainer.querySelector('.message_title span').textContent = messageTitle;
        notifiedMessageContainer.querySelector('.message_content span').textContent = messageContent;
    } else {
        // Hide the notification message container if no message
        notifiedMessageContainer.style.display = 'none'; 
    }
}

function setUpFilterDropdownsForApplications() {

    const departmentDropdownApplications = document.getElementById("departmentDropdownApplications");
    const semesterDropdownApplications = document.getElementById("semesterDropdownApplications");
    const statusApplication = document.getElementById("statusDropdownApplications");

    departmentDropdownApplications.addEventListener("change", filterApplications);
    semesterDropdownApplications.addEventListener("change", filterApplications);
    statusApplication.addEventListener("change", filterApplications);

}

function filterApplications() {
    const department = document.getElementById("departmentDropdownApplications").value.toLowerCase().trim();
    const semester = document.getElementById("semesterDropdownApplications").value.toLowerCase().trim();
    const status = document.getElementById("statusDropdownApplications").value.toLowerCase().trim();

    document.querySelectorAll(".application_container").forEach(application => {
        const applicationDept = application.dataset.department;  
        const applicationSemester = application.dataset.semester;  
        const applicationStatus = application.dataset.status.toLowerCase().trim();

        const matchesDept = !department || applicationDept === department;
        const matchesSem = !semester || applicationSemester === semester;
        const matchesStatus = !status || applicationStatus === status;

        application.style.display = (matchesDept && matchesSem && matchesStatus) ? "grid" : "none";
    });
}

function setUpApplicationButtons(application) {
    const applicationContainer = document.getElementById(`application-${application.id}`);

    const editButton = applicationContainer.querySelector(".edit_btn");
    editButton.addEventListener('click', function () {
        enableEditing(application.id);
    });

    const deleteButton = applicationContainer.querySelector(".delete_btn");
    deleteButton.addEventListener('click', function () {
        deleteApplication(application.id);
    });

    const saveButton = applicationContainer.querySelector(".save_btn");
    saveButton.addEventListener('click', function () {
        saveApplication(application.id);
    });

    const cancelButton = applicationContainer.querySelector('.cancel_btn');
    cancelButton.addEventListener('click', function () {
        cancelEditing(application.id);
    });
}

let originalApplicationData = {};

function enableEditing(applicationId) {
    const container = document.getElementById(`application-${applicationId}`);

    // Store original data before enabling editing
    originalApplicationData[applicationId] = {
        comments: container.querySelector(`#comments_${applicationId}`).innerText,
        a_grade: container.querySelector(`#a_grade_${applicationId}`).checked,
        served_as_ta: container.querySelector(`#served_as_ta_${applicationId}`).checked,
        professional_experience: container.querySelector(`#professional_experience_${applicationId}`).checked
    };

    // Enable checkboxes and make comments editable
    container.querySelector(`#a_grade_${applicationId}`).disabled = false;
    container.querySelector(`#served_as_ta_${applicationId}`).disabled = false;
    container.querySelector(`#professional_experience_${applicationId}`).disabled = false;

    const commentsValue = container.querySelector(`#comments_${applicationId}`).innerText.trim();
    container.querySelector(`#comments_${applicationId}`).innerHTML =
    `<textarea name="additional_comments" placeholder="Additional comments" maxlength="500" autocomplete="no">${commentsValue === 'No Comments' ? '' : commentsValue}</textarea>`;

    // Toggle buttons
    container.querySelector('.edit_btn').style.display = 'none';
    container.querySelector('.delete_btn').style.display = 'none';
    container.querySelector('.save_btn').style.display = 'inline-block';
    container.querySelector('.cancel_btn').style.display = 'inline-block';
}

function saveApplication(applicationId) {
    const container = document.getElementById(`application-${applicationId}`);

    // Gather updated data
    const a_grade = container.querySelector(`#a_grade_${applicationId}`).checked;
    const served_as_ta = container.querySelector(`#served_as_ta_${applicationId}`).checked;
    const professional_experience = container.querySelector(`#professional_experience_${applicationId}`).checked;
    const comments = container.querySelector(`#comments_${applicationId} textarea`).value.trim();

    // Send the updated data to the server
    fetch(`/updateApplication/${applicationId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            a_grade,
            served_as_ta,
            professional_experience,
            comments,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update the UI after saving
                container.querySelector(`#a_grade_${applicationId}`).disabled = true;
                container.querySelector(`#served_as_ta_${applicationId}`).disabled = true;
                container.querySelector(`#professional_experience_${applicationId}`).disabled = true;

                container.querySelector(`#comments_${applicationId}`).innerHTML = `<span>${comments || 'No Comments'}</span>`;

                // Toggle buttons back
                container.querySelector('.edit_btn').style.display = 'inline-block';
                container.querySelector('.delete_btn').style.display = 'inline-block';
                container.querySelector('.save_btn').style.display = 'none';
                container.querySelector('.cancel_btn').style.display = 'none';
            } else {
                alert('Error updating application');
            }
        })
        .catch(error => {
            console.error('Error during save:', error);
            alert('An error occurred while saving the application.');
        });
}

function cancelEditing(applicationId) {
    const container = document.getElementById(`application-${applicationId}`);

    // Restore original comments and checkboxes without making a request
    const originalData = originalApplicationData[applicationId];

    if (originalData) {
        container.querySelector(`#comments_${applicationId}`).innerHTML = `<span>${originalData.comments || 'No Comments'}</span>`;
        container.querySelector(`#a_grade_${applicationId}`).checked = originalData.a_grade;
        container.querySelector(`#served_as_ta_${applicationId}`).checked = originalData.served_as_ta;
        container.querySelector(`#professional_experience_${applicationId}`).checked = originalData.professional_experience;

        // Disable checkboxes
        container.querySelector(`#a_grade_${applicationId}`).disabled = true;
        container.querySelector(`#served_as_ta_${applicationId}`).disabled = true;
        container.querySelector(`#professional_experience_${applicationId}`).disabled = true;

        // Toggle buttons back
        container.querySelector('.edit_btn').style.display = 'inline-block';
        container.querySelector('.delete_btn').style.display = 'inline-block';
        container.querySelector('.save_btn').style.display = 'none';
        container.querySelector('.cancel_btn').style.display = 'none';
    } else {
        console.error('Original data not found for application:', applicationId);
    }
}

function deleteApplication(applicationId) {
    if (confirm('Are you sure you want to delete this application?')) {
        fetch(`/deleteApplication/${applicationId}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the application container from the DOM
                    const container = document.getElementById(`application-${applicationId}`);
                    container.remove();
                } else {
                    alert('Error deleting application');
                }
            })
            .catch(error => {
                console.error('Error during delete:', error);
                alert('An error occurred while deleting the application.');
            });
    }

    fetchApplications();
}

async function showMessageContainer(applicationId, courseTitle) {

    const overlayContainer = document.createElement('div');
    overlayContainer.classList.add('overlayContainer');

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message_container');

    // Create congratulations title
    const congratulationsTitle = document.createElement('div');
    congratulationsTitle.classList.add('congratulations_title');
    const congratulationsText = document.createElement('span');
    congratulationsText.textContent = 'Congratulations';
    congratulationsTitle.appendChild(congratulationsText);

    // Create course title row
    const courseTitleRow = document.createElement('div');
    const courseTitleLabel = document.createElement('span');
    courseTitleLabel.textContent = 'Course Title : ';
    const courseTitleValue = document.createElement('span');
    courseTitleValue.textContent = courseTitle;
    courseTitleRow.appendChild(courseTitleLabel);
    courseTitleRow.appendChild(courseTitleValue);

    try {
        // Fetch message title and content from backend using async/await
        const response = await fetch(`/taNotifiedMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ applicationId: applicationId }) // Send applicationId
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json(); // Wait for the response to be parsed as JSON
        const messageTitle = data.messageTitle || 'N/A'; // Use fetched message title;
        const messageContent = data.messageContent || 'No message available';

        // Create message title row
        const messageTitleRow = document.createElement('div');
        const messageTitleLabel = document.createElement('span');
        messageTitleLabel.textContent = 'Message Title : ';
        const messageTitleValue = document.createElement('span');
        messageTitleValue.textContent = messageTitle;
        messageTitleRow.appendChild(messageTitleLabel);
        messageTitleRow.appendChild(messageTitleValue);

        // Create message content row
        const messageContentRow = document.createElement('div');
        const messageContentLabel = document.createElement('span');
        messageContentLabel.textContent = 'Message : ';
        const messageContentValue = document.createElement('span');
        messageContentValue.textContent = messageContent;
        messageContentRow.appendChild(messageContentLabel);
        messageContentRow.appendChild(messageContentValue);

        // Append the fetched data to the message container
        messageContainer.appendChild(congratulationsTitle);
        messageContainer.appendChild(courseTitleRow);
        messageContainer.appendChild(messageTitleRow);
        messageContainer.appendChild(messageContentRow);

    } catch (error) {
        console.error('Error fetching message:', error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Failed to load message. Please try again later.';
        messageContainer.appendChild(errorMessage);
    }

    // Create close button
    const closeButtonRow = document.createElement('div');
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButtonRow.appendChild(closeButton);

    messageContainer.appendChild(closeButtonRow);

    // Append overlay and message container to the body
    document.body.appendChild(overlayContainer);
    document.body.appendChild(messageContainer);

    // Add event listener for overlay click
    closeButton.addEventListener('click', () => hidePopup(overlayContainer, messageContainer));
    overlayContainer.addEventListener('click', () => hidePopup(overlayContainer, messageContainer));
}

// Function to hide the popup
function hidePopup(overlayContainer, messageContainer) {
    overlayContainer.remove();
    messageContainer.remove();
}

