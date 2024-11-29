

document.addEventListener("DOMContentLoaded", () => {
    setUpApplyMainBtn();
});

function setUpApplyMainBtn() {
    const applyBtn = document.getElementById("apply_btn");

    applyBtn.addEventListener("click",async () => {
        await fetchAndRenderSemestersInApply();
    });
}


function getActiveSemesterInApply() {
    const activeButton = document.querySelector('.semester-button-in-apply.active_semester_button_in_apply');
    return activeButton ? activeButton.dataset.semester : null;
}

async function fetchAndRenderSemestersInApply() {
    try {
        const semesterResponse = await fetch('/semesterList');
        if (semesterResponse.ok) {
            const semesters = await semesterResponse.json();
            const semesterContainer = document.querySelector('.StudentApplyContent .semesters_container');

            semesterContainer.innerHTML = '';

            // Render semester buttons and find the first active button
            const buttons = semesters.map(semester => createSemesterButtonInApply(semester));
            buttons.forEach(button => semesterContainer.appendChild(button));
            await setUpSemesterBtnsInApply(buttons);

            if (buttons.length > 0) buttons[0].click(); // Trigger a click on the first button if it exists

        } else {
            const errorData = await semesterResponse.json();
            console.error('Error fetching active semester data:', errorData.error);
        }
    } catch (error) {
        console.error("Error fetching active semester data:", error);
    }
}

function createSemesterButtonInApply(semester) {
    const button = document.createElement('button');
    const span = document.createElement('span');
    span.textContent = semester.semester;
    span.classList.add('semester-span');
    button.appendChild(span);
    button.classList.add('semester-button-in-apply');
    button.dataset.semester = semester.semester;
    button.dataset.status = semester.status;
    return button;
}

async function setUpSemesterBtnsInApply(buttons) {
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            buttons.forEach(btn => btn.classList.remove("active_semester_button_in_apply"));
            button.classList.add("active_semester_button_in_apply");
            await fetchCoursesListBySemester(button.dataset.semester);
        });
    });
}






// Fetch and populate courses
async function fetchCoursesListBySemester(semester) {
    try {
        const response = await fetch(`/CoursesListBySemesterInStudent?semester=${semester}`);
        const courses = await response.json();

        const semesterStatusResponse = await fetch(`/SemesterStatus?semester=${semester}`);
        const semesterStatus = await semesterStatusResponse.json();

        const container = document.getElementById('coursesContainer');
        container.innerHTML = '';

        if (semesterStatus.status !== 'active') {
            const notAcceptingApplications = document.createElement('div'); // Create a new div
            notAcceptingApplications.classList.add('not_accepting');
            notAcceptingApplications.innerHTML = `<span>Applications are not being accepted for this semester at the moment.</span>`;
            container.appendChild(notAcceptingApplications);
        }

        courses.forEach(course => {
            const courseContainer = document.createElement('div');
            courseContainer.classList.add('course_item');
            courseContainer.dataset.department = course.dept_name.toLowerCase().trim();
            courseContainer.dataset.semester = course.semester.toLowerCase().trim();
            courseContainer.dataset.applied = course.applied;

            let btnInnerHTML = ``;

            if (semesterStatus.status === 'inactive') {
                btnInnerHTML = `
        <div class="apply_btn_container">
            <button type="button" class="ApplyNowBtn" disabled>Unavailable</button>
        </div>`;
            } else if (course.applied) {
                btnInnerHTML = `
        <div class="applied_btn_container">
            <button type="button" class="AppliedBtn" disabled>Applied</button>
        </div>`;
            } else {
                btnInnerHTML = `
        <div class="apply_btn_container">
            <button type="button" class="ApplyNowBtn">Apply now</button>
        </div>`;
            }

            courseContainer.innerHTML = `
                <div class="course_title"><span>${course.course_title}</span></div>
                <div class="course_name"><span class="value">${course.course_name}</span></div>
                <div class="course_number"><span class="value">${course.course_number}</span></div>
                <div class="department_name"><span class="value">${course.dept_name}</span></div>
                <div class="semester_name"><span class="value">${course.semester}</span></div>
                ${btnInnerHTML}
            `;
            container.appendChild(courseContainer);
        });

        if (semesterStatus.status !== 'active') {
            container.classList.add('disabled');
        } else {
            container.classList.remove('disabled');
        }

        setupApplyButtons();

    } catch (error) {
        console.error("Error fetching courses:", error);
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
            const courseContainer = this.closest(".course_item");

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

        const eligibilityCheckboxes = document.querySelectorAll('.eligibility_criteria_container .checkbox');
        let eligibilitySelected = false;

        eligibilityCheckboxes.forEach(function (checkbox) {
            if (checkbox.checked) {
                eligibilitySelected = true;
            }
        });

        if (!eligibilitySelected) {
            event.preventDefault();

            let overlay = document.createElement('div');
            overlay.className = 'error-overlay';

            let errorMessageContainer = document.createElement('div');
            errorMessageContainer.classList.add('error_message_container');
            errorMessageContainer.innerHTML = `
            <span>You are not eligible to apply for this course. Please select another course that you are eligible for.</span>
            <button class="okay-button">Okay</button>
        `;
            
            overlay.appendChild(errorMessageContainer);
            document.body.appendChild(overlay);

            document.querySelector('.okay-button').addEventListener('click', function () {
                overlay.style.display = 'none';
            });

        } else {
            const formData = collectFormData(newApplicationContainer);

            try {
                const response = await fetch('/submitNewApplication', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    const result = await response.json();
                    showSuccessMessageOverlay(result.message);
                    closePopup(newApplicationContainer, popupOverlay);
                } else {
                    const errorData = await response.json();
                    showFailureMessageOverlay(errorData.message || "Failed to submit application.");
                    closePopup(newApplicationContainer, popupOverlay);
                }

                const semester = getActiveSemesterInApply();
                await fetchCoursesListBySemester(semester);

            } catch (error) {
                console.error("Error submitting application:", error);
                alert("An error occurred. Please try again later.");
                closePopup(newApplicationContainer, popupOverlay);
            }
        }

        
    });

    // Handle cancel button click
    newCancelApplicationBtn.addEventListener("click", function () {
        closePopup(newApplicationContainer, popupOverlay);
    });
}

function showSuccessMessageOverlay(successMessage) {

    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.classList.add('overlay'); // Add a class for styling

    // Create the message container
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    // Create a paragraph to hold the message
    const messageText = document.createElement('p');
    messageText.classList.add('message-text');
    messageText.classList.add('success-message');
    messageText.textContent = successMessage;

    // Create a button to close the overlay
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-overlay-btn');
    closeButton.textContent = 'Close';

    // Close the overlay when the button is clicked
    closeButton.addEventListener('click', function () {
        overlay.remove();
    });

    // Append the message text and close button to the message container
    messageContainer.appendChild(messageText);
    messageContainer.appendChild(closeButton);

    // Append the message container to the overlay
    overlay.appendChild(messageContainer);

    // Append the overlay to the body of the document
    document.body.appendChild(overlay);
}

function showFailureMessageOverlay(successMessage) {

    // Create the overlay container
    const overlay = document.createElement('div');
    overlay.classList.add('overlay'); // Add a class for styling

    // Create the message container
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');

    // Create a paragraph to hold the message
    const messageText = document.createElement('p');
    messageText.classList.add('message-text');
    messageText.classList.add('failure-message');
    messageText.textContent = successMessage;

    // Create a button to close the overlay
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-overlay-btn');
    closeButton.textContent = 'Close';

    // Close the overlay when the button is clicked
    closeButton.addEventListener('click', function () {
        overlay.remove();
    });

    // Append the message text and close button to the message container
    messageContainer.appendChild(messageText);
    messageContainer.appendChild(closeButton);

    // Append the message container to the overlay
    overlay.appendChild(messageContainer);

    // Append the overlay to the body of the document
    document.body.appendChild(overlay);
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
