document.addEventListener('DOMContentLoaded',async function () {
    setUpApplicationCoursesBtns();
    setUpSortByDropdown();
    setUpEligibilityCriteriaOptions();
    setUpApplicationTypeBtns();
    //setUpViewProfileEventListener();
    setUpShortlistSelectNotifyButtonEventListener();
    await fetchApplicationsCourses();
    fetchApplications();
    fetchCoursesAndShortlistedApplications();
    fetchCoursesAndSelectedApplications();
    setUpExpandCollapseButtons('shortlisted');
    setUpExpandCollapseButtons('selected');

    setUpExportApplicationsBtn();
});

function setUpExportApplicationsBtn() {
    const exportApplicationsBtn = document.querySelector('.export_applications_btn');
    const applicationsTypeAndFieldSelectionContainer = document.getElementById('ApplicationTypeAndfieldSelectionPopup');
    const overlay = document.querySelector('.overlay');
    const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');

    // Show the field selection container and overlay when the button is clicked
    exportApplicationsBtn.addEventListener('click', () => {
        applicationsTypeAndFieldSelectionContainer.style.display = 'grid';
        overlay.style.display = 'block'; // Show overlay
    });

    // Hide the field selection container and overlay when the Cancel button is clicked
    cancelSelectionBtn.addEventListener('click', () => {
        applicationsTypeAndFieldSelectionContainer.style.display = 'none';
        overlay.style.display = 'none';
    });

    // Hide the field selection container and overlay when the overlay itself is clicked
    overlay.addEventListener('click', () => {
        applicationsTypeAndFieldSelectionContainer.style.display = 'none';
        overlay.style.display = 'none';
    });
}


// Function to handle TA selection status button clicks
function handleApplicationTypeBtnClick(event) {
    const buttons = document.querySelectorAll('.Application_type_btns_container button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// Function to set up event listeners for application type buttons
function setUpApplicationTypeBtns() {
    const allApplicationsBtn = document.getElementById('allApplicationsBtn');
    const shortlistedApplicationsBtn = document.getElementById('shortlistedApplicationsBtn');
    const selectedApplicationsBtn = document.getElementById('selectedApplicationsBtn');

    const allApplicationsContainer = document.querySelector('.all_applications_container');
    const shortlistedApplicationsContainer = document.querySelector('.shortlisted_applications_container');
    const selectedApplicationsContainer = document.querySelector('.selected_applications_container');

    allApplicationsBtn.addEventListener('click', function (event) {
        handleApplicationTypeBtnClick(event);
        allApplicationsContainer.style.display = 'flex';
        shortlistedApplicationsContainer.style.display = 'none';
        selectedApplicationsContainer.style.display = 'none';
        fetchApplicationsCourses();
    });

    shortlistedApplicationsBtn.addEventListener('click', function (event) {
        handleApplicationTypeBtnClick(event);
        allApplicationsContainer.style.display = 'none';
        shortlistedApplicationsContainer.style.display = 'flex';
        selectedApplicationsContainer.style.display = 'none';

        fetchCoursesAndShortlistedApplications();
        handleExpandCollapseCourses('shortlisted');

    });

    selectedApplicationsBtn.addEventListener('click', function (event) {
        handleApplicationTypeBtnClick(event);
        allApplicationsContainer.style.display = 'none';
        shortlistedApplicationsContainer.style.display = 'none';
        selectedApplicationsContainer.style.display = 'flex';

        fetchCoursesAndSelectedApplications();
        handleExpandCollapseCourses('selected');
    });
}

function setUpApplicationCoursesBtns() {

    const applicationsBtn = document.getElementById("applications_btn");
    applicationsBtn.addEventListener("click",async function () {
        await fetchApplicationsCourses();
        fetchApplications();
        fetchCoursesAndShortlistedApplications();
    });

    const courseDropdown = document.getElementById("courseDropdown");
    // Call fetchCourses when the course dropdown is clicked
    courseDropdown.addEventListener("click", function () {
        fetchApplicationsCourses();
        fetchApplications();
    });

    // Call fetchApplications when the course is changed
    courseDropdown.addEventListener("change", function () {
        fetchApplications();
    });
}

function setUpSortByDropdown() {
    // Sorting by selected criteria
    const sortByDropdown = document.getElementById('sortByDropdown');
    sortByDropdown.addEventListener('change', function () {
        sortApplications(); // Sort based on the selected criterion
    });
}

function setUpEligibilityCriteriaOptions() {
    // Sorting by Eligibility criteria
    const servedAsTACheckbox = document.getElementById('servedAsTA');
    const securedAGradeCheckbox = document.getElementById('securedAGrade');
    const professionalExperienceCheckbox = document.getElementById('professionalExperience');

    servedAsTACheckbox.addEventListener('change', function () {
        selectBasedOnEligibility();
    });
    securedAGradeCheckbox.addEventListener('change', function () {
        selectBasedOnEligibility();
    });
    professionalExperienceCheckbox.addEventListener('change', function () {
        selectBasedOnEligibility();
    });
}

function setUpViewProfileEventListener() {
    const viewProfileBtns = document.querySelectorAll('.view_profile_btn');

    // Add event listeners for dynamically created "View Profile" buttons
    viewProfileBtns.forEach(button => {
        button.addEventListener('click', async function () {
            const applicationId = this.getAttribute('data-application-id');
            await viewProfile(applicationId);
        });
    });
}

function setUpShortlistSelectNotifyButtonEventListener() {

    const shortlistBtns = document.querySelectorAll('.shortlist_btn');
    // Add event listeners for dynamically created "Shortlist" buttons
    shortlistBtns.forEach(button => {
        button.addEventListener('click', async function () {
            const applicationId = this.getAttribute('data-application-id');
            const name = this.getAttribute('data-name');
            const courseTitle = this.getAttribute('data-course-title');
            fetchApplications();
            fetchCoursesAndShortlistedApplications();
            fetchCoursesAndSelectedApplications();
        });
    });


    const selectBtns = document.querySelectorAll('.select_btn');
    // Add event listeners for dynamically created "Select" buttons
    selectBtns.forEach(button => {
        button.addEventListener('click', async function () {
            const applicationId = this.getAttribute('data-application-id');
            const name = this.getAttribute('data-name');
            const courseTitle = this.getAttribute('data-course-title');
            await selectApplication(applicationId, name, courseTitle);
            fetchApplications();
            fetchCoursesAndShortlistedApplications();
        });
    });

    const removeShortlistedBtn = document.querySelectorAll('.remove_shortlisted_btn');
    // Add event listeners for dynamically created "Remove Shortlist" buttons
    removeShortlistedBtn.forEach(button => {
        button.addEventListener('click', async function () {
            const applicationId = this.getAttribute('data-application-id');
            const name = this.getAttribute('data-name');
            const courseTitle = this.getAttribute('data-course-title');
            await removeShortlistedApplication(applicationId, name, courseTitle);
            fetchApplications();
            fetchCoursesAndShortlistedApplications();
        });
    });

    const removeSelectedtBtn = document.querySelectorAll('.remove_selected_btn');
    // Add event listeners for dynamically created "Remove Shortlist" buttons
    removeSelectedtBtn.forEach(button => {
        button.addEventListener('click', async function () {
            const applicationId = this.getAttribute('data-application-id');
            const name = this.getAttribute('data-name');
            const courseTitle = this.getAttribute('data-course-title');
            await removeSelectedApplication(applicationId, name, courseTitle);
            fetchApplications();
            fetchCoursesAndSelectedApplications();
        });
    });

    const notifyBtn = document.querySelectorAll('.notify_applicant_btn');
    // Add event listeners for dynamically created "Notify Applicant" buttons
    notifyBtn.forEach(button => {
        button.addEventListener('click', async function () {
            const applicationId = this.getAttribute('data-application-id');
            const name = this.getAttribute('data-name');
            const courseTitle = this.getAttribute('data-course-title');
            await showNotifyMessageModel(applicationId, name, courseTitle);;
            fetchCoursesAndSelectedApplications();
        });
    });

}


// Function to fetch courses from the backend
async function fetchApplicationsCourses() {

    try {
        const response = await fetch('/coursesListDeptSemesterStaff');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const courses = await response.json();
        const courseDropdown = document.getElementById('courseDropdown');

        // Store the currently selected value
        const previouslySelectedValue = courseDropdown.value;

        // Clear previous options
        courseDropdown.innerHTML = '';

        // Populate new options
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course_number; // Assuming each course has an 'id'
            option.setAttribute('data-course-name', course.course_name); // Add custom data attribute for course_name
            option.textContent = `${course.course_title} (${course.course_name}) (${course.course_number})`; // Customize as needed
            courseDropdown.appendChild(option);
        });

        // Re-select the previously selected value if it exists in the new options
        if (previouslySelectedValue) {
            courseDropdown.value = previouslySelectedValue; // This will select the previously chosen course
        } else if (courseDropdown.options.length > 0) {
            courseDropdown.selectedIndex = 0; // If no previous selection, select the first option
        }

        fetchApplications();

    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}

// Function to fetch applications from the backend based on selected course and TA selection status
async function fetchApplications() {
    const courseDropdown = document.getElementById('courseDropdown');
    const selectedCourseNumber = courseDropdown.value; // Get the selected course

    const selectedOption = courseDropdown.options[courseDropdown.selectedIndex];
    const selectedCourseName = selectedOption.dataset.courseName; // Use dataset to access the data-course-name

    if (!selectedCourseNumber) {
        return; // Exit if no course is selected
    }

    // Perform a fetch request to your backend to get the applications for the selected course and status
    try {
        const response = await fetch(`/staff/getAllApplications?courseNumber=${selectedCourseNumber}&courseName=${selectedCourseName}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json(); // Assuming the response is in JSON
        updateApplicationsList(data); // Update the applications list with the fetched data
        sortApplications();

    } catch (error) {
        console.error('Error fetching applications:', error);
    }
}

async function updateApplicationsList(applications) {
    const container = document.querySelector('.applications_list_container');

    const heading = document.getElementById('heading');
    container.innerHTML = ''; // Clear everything
    container.appendChild(heading); // Re-add the heading

    // Check if there are no applications
    if (applications.length === 0) {
        // Create and append the "Select A Course" message
        const noApplicationsMessage = document.createElement('div');
        noApplicationsMessage.classList.add('select_course_tag');
        noApplicationsMessage.innerHTML = `<span>No Applications are submitted for this Course, Please select Other course</span>`;
        container.appendChild(noApplicationsMessage);
    } else {
        // Loop through the applications and append them to the container
        applications.forEach(application => {
            const applicationItem = document.createElement('div');
            applicationItem.classList.add('application_item');
            applicationItem.setAttribute('data-application-id', application.applicationId);
            applicationItem.setAttribute('data-gpa', application.gpa);
            applicationItem.setAttribute('data-name', application.name);
            applicationItem.setAttribute('data-course-title', application.course_title);
            applicationItem.setAttribute('data-program-type', application.programType);
            applicationItem.setAttribute('data-served-As-Ta', application.served_as_ta === 'true' ? "True" : "False");
            applicationItem.setAttribute('data-a-grade', application.a_grade === 'true' ? "True" : "False");
            applicationItem.setAttribute('data-professional-experience', application.professional_experience === 'true' ? "True" : "False");
            applicationItem.setAttribute('data-application-type', application.applicationType);

            // Determine which buttons to display based on application_type
            let buttonHTML = '';

            if (application.applicationType === 'new') {
                buttonHTML = `
            <button type="button" class="shortlist_btn" data-application-id="${application.applicationId}" data-name="${application.name}" data-course-title="${application.course_title}"></button>
            <button type="button" class="select_btn" data-application-id="${application.applicationId}" data-name="${application.name}" data-course-title="${application.course_title}"></button>
        `;
            } else if (application.applicationType === 'shortlisted') {
                buttonHTML = `
            <button type="button" class="remove_shortlisted_btn" data-application-id="${application.applicationId}" data-name="${application.name}" data-course-title="${application.course_title}"></button>
            <button type="button" class="select_btn" data-application-id="${application.applicationId}" data-name="${application.name}" data-course-title="${application.course_title}"></button>
        `;
            } else if (application.applicationType === 'selected') {
                if (application.notifiedApplicant === true) {
                    buttonHTML = `<button type="button" class="notified_applicant_btn">Notified Applicant</button>`;
                } else {
                    buttonHTML = `
            <button type="button" class="remove_selected_btn" data-application-id="${application.applicationId}" data-name="${application.name}" data-course-title="${application.course_title}"></button>
        `;
                }
                
            }

            applicationItem.innerHTML = `
        <div><button type="button" class="view_profile_btn" data-application-id="${application.applicationId}">${application.name}</button></div>
        <div><span>${application.netid}</span></div>
        <div><span>${application.gpa}</span></div>
        <div class="programType_value"><span>${application.programType}</span></div>
        <div class="servedAsTA eligibility_value"><span>${application.served_as_ta === 'true' ? 'Yes' : 'No'}</span></div>
        <div class="AGrade eligibility_value"><span>${application.a_grade === 'true' ? 'Yes' : 'No'}</span></div>
        <div class="Experience eligibility_value"><span>${application.professional_experience === 'true' ? 'Yes' : 'No'}</span></div>
        <div><span>${application.comments}</span></div>
        <div class="application_management_btns">
            ${buttonHTML}
        </div>
    `;
            container.appendChild(applicationItem);
        });

        //setUpViewProfileEventListener();
        setUpShortlistSelectNotifyButtonEventListener();
    }
}

function setUpExpandCollapseButtons(section) {
    const expandAllCoursesBtn = document.getElementById(`expandAllCoursesBtn${capitalize(section)}`);
    const collapseAllCoursesBtn = document.getElementById(`collapseAllCoursesBtn${capitalize(section)}`);

    // Check if the buttons exist before adding event listeners
    if (expandAllCoursesBtn && collapseAllCoursesBtn) {
        expandAllCoursesBtn.addEventListener('click', () => {
            handleExpandCollapseCourses(true, section);
        });

        collapseAllCoursesBtn.addEventListener('click', () => {
            handleExpandCollapseCourses(false, section);
        });
    } else {
        console.error(`Buttons for ${section} not found`);
    }
}

// Utility function to capitalize the first letter
function capitalize(str) {
    if (typeof str === 'string') {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return ''; // If it's not a string, return an empty string
}

// Function to handle expand and collapse actions
function handleExpandCollapseCourses(expand = true, section) {
    const courseContainers = document.querySelectorAll(`.${section}_applications_container .course_applications_container`);
    const expandAllCoursesBtn = document.getElementById(`expandAllCoursesBtn${capitalize(section)}`);
    const collapseAllCoursesBtn = document.getElementById(`collapseAllCoursesBtn${capitalize(section)}`);

    // Ensure the buttons exist
    if (!expandAllCoursesBtn || !collapseAllCoursesBtn) {
        console.error(`Buttons not found for section: ${section}`);
        return;
    }

    courseContainers.forEach(courseContainer => {
        const applicationsContainer = courseContainer.querySelector('.applications_container');
        if (expand) {
            applicationsContainer.style.display = 'flex'; // Show applications
        } else {
            applicationsContainer.style.display = 'none'; // Hide applications
        }
    });

    // Hide/show buttons based on the state
    if (expand) {
        expandAllCoursesBtn.style.display = 'none';
        collapseAllCoursesBtn.style.display = 'block';
    } else {
        expandAllCoursesBtn.style.display = 'block';
        collapseAllCoursesBtn.style.display = 'none';
    }
}


async function fetchCoursesAndShortlistedApplications() {
    try {
        const response = await fetch('/staff/getShortlistedApplications');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const coursesWithApplications = await response.json();

        const shortlistedApplicationsContainer = document.querySelector('.shortlistedApplications_list_container');
        shortlistedApplicationsContainer.innerHTML = ''; // Clear previous entries

        coursesWithApplications.forEach(course => {
            const courseContainer = document.createElement('div');
            courseContainer.classList.add('course_applications_container');

            // Create course details
            const courseDetailsContainer = document.createElement('div');
            courseDetailsContainer.classList.add('course_details_container');
            courseDetailsContainer.innerHTML = `
                <span>${course.course_title}</span>
                <span>${course.course_name}</span>
                <span>${course.course_number}</span>
            `;
            courseContainer.appendChild(courseDetailsContainer);

            // Create applications container
            const applicationsContainer = document.createElement('div');
            applicationsContainer.classList.add('applications_container');

            if (course.applications.length > 0) {
                course.applications.forEach(application => {
                    const applicationItem = document.createElement('div');
                    applicationItem.classList.add('applicationItem');
                    applicationItem.setAttribute('data-application-id', application.applicationId);

                    applicationItem.innerHTML = `
                    <div class="shortlistedApplication_item_details">
                    <button type="button" class="view_profile_btn2" data-application-id="${application.applicationId}">${application.name}</button>
                    <button type="button" class="remove_shortlisted_btn2" data-application-id="${application.applicationId}" data-name="${application.name}" data-course-title="${application.course_title}"></button>
                    <button type="button" class="select_btn2" data-application-id="${application.applicationId}" data-name="${application.name}" data-course-title="${application.course_title}"></button>
                    </div>`;
                    applicationsContainer.appendChild(applicationItem);
                });
            } else {
                // Change class name to a valid one
                const noApplications = document.createElement('div');
                noApplications.classList.add('no-shortlisted-applications'); // Use hyphens instead of spaces
                noApplications.innerHTML = '<span>No Shortlisted Applications</span>';
                applicationsContainer.appendChild(noApplications);
            }

            courseContainer.appendChild(applicationsContainer);
            shortlistedApplicationsContainer.appendChild(courseContainer);
        });

        // Show the shortlisted applications container
        const shortlistedApplicationsSection = document.querySelector('.shortlisted_applications_container');
        shortlistedApplicationsSection.style.display = 'flex';
        setUpExpandCollapseButtons('shortlisted');
        setUpShortlistSelectNotifyButtonEventListener();
        //setUpViewProfileEventListener();

    } catch (error) {
        console.error('Error fetching shortlisted applications:', error);
    }
}

async function fetchCoursesAndSelectedApplications() {
    try {
        const response = await fetch('/staff/getSelectedApplications');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const coursesWithApplications = await response.json();

        const selectedApplicationsContainer = document.querySelector('.selectedApplications_list_container');
        selectedApplicationsContainer.innerHTML = ''; // Clear previous entries

        coursesWithApplications.forEach(course => {
            const courseContainer = document.createElement('div');
            courseContainer.classList.add('course_applications_container');

            // Create course details
            const courseDetailsContainer = document.createElement('div');
            courseDetailsContainer.classList.add('course_details_container');
            courseDetailsContainer.innerHTML = `
                <span>${course.course_title}</span>
                <span>${course.course_name}</span>
                <span>${course.course_number}</span>
            `;
            courseContainer.appendChild(courseDetailsContainer);

            // Create applications container
            const applicationsContainer = document.createElement('div');
            applicationsContainer.classList.add('applications_container');

            if (course.applications.length > 0) {
                course.applications.forEach(application => {
                    const applicationItem = document.createElement('div');
                    applicationItem.classList.add('applicationItem');
                    applicationItem.setAttribute('data-application-id', application.applicationId);
                    const notifiedApplicant = application.notifiedApplicant;

                    let btnHTML = '';

                    if (notifiedApplicant) {
                        btnHTML = `
                        <button type="button" class="notified_applicant_btn">Notified Applicant</button>`;
                    } else {
                        btnHTML = `
                        <button type="button" class="remove_selected_btn" data-application-id="${application.applicationId}" data-name="${application.name}" data-course-title="${application.course_title}"></button>
                        <button type="button" class="notify_applicant_btn" data-application-id="${application.applicationId}" data-name="${application.name}" data-course-title="${application.course_title}"></button>`;
                    }

                    btnHTML = '';

                    applicationItem.innerHTML = `
                    <div class="selectedApplications_item_details">
                    <button type="button" class="view_profile_btn" data-application-id="${application.applicationId}">${application.name}</button>
                    ${btnHTML}
                    </div>`;
                    applicationsContainer.appendChild(applicationItem);
                });
            } else {
                // Change class name to a valid one
                const noApplications = document.createElement('div');
                noApplications.classList.add('no-shortlisted-applications'); // Use hyphens instead of spaces
                noApplications.innerHTML = '<span>No Selected Applications</span>';
                applicationsContainer.appendChild(noApplications);
            }

            courseContainer.appendChild(applicationsContainer);
            selectedApplicationsContainer.appendChild(courseContainer);
        });

        // Show the shortlisted applications container
        const selectedApplicationsSection = document.querySelector('.selected_applications_container');
        selectedApplicationsSection.style.display = 'flex';
        setUpExpandCollapseButtons('selected');
        setUpShortlistSelectNotifyButtonEventListener();
        //setUpViewProfileEventListener();

    } catch (error) {
        console.error('Error fetching shortlisted applications:', error);
    }
}

// Function to create the Profile container when view profile is clicked
async function createProfileContainer2(profileData) {
    // Remove any existing profile container
    const existingProfileContainer = document.querySelector('.profile_container');
    if (existingProfileContainer) {
        existingProfileContainer.remove();
    }

    console.log(profileData);

    // Dynamically create a new profile container with the received profileData
    const profileContainer = document.createElement('div');
    profileContainer.classList.add('profile_container');
    profileContainer.style.display = 'block';  // Make it visible

    profileContainer.innerHTML = `
        <div class="profile_name">
            <span>Name: </span><span>${profileData.name}</span>
        </div>
        <div class="profile_netid">
            <span>NetId : </span><span>${profileData.netid}</span>
        </div>
        <div class="profile_znumber">
            <span>Z Number</span><span>${profileData.znumber}</span>
        </div>
        <div class="profile_gpa">
            <span>GPA</span><span>${profileData.gpa}</span>
        </div>
        <div class="profile_phonenumber">
            <span>Mobile Number</span><span>${profileData.mobile_number}</span>
        </div>
        <div class="profile_email">
            <span>Email</span><span>${profileData.email}</span>
        </div>
        <div class="profile_programType" value="${profileData.programType}">
            <span>Program Type</span><span class="programTypeValue">${profileData.programType}</span>
        </div>
        <div class="profile_advisor_name">
            <span>Advisor Name</span><span>${profileData.advisorname}</span>
        </div>
        <div class="profile_advisor_email" >
            <span>Advisor Email</span><span>${profileData.advisoremail}</span>
        </div>
        <div class="profile_enrollementstatus">
            <span>Enrollement Status</span><span>${profileData.enrollementstatus}</span>
        </div>
        <div class="profile_citizenshipstatus">
            <span>Citizenship Status</span><span>${profileData.citizenshipstatus}</span>
        </div>
        <div class="profile_programstartDate">
            <span>Program Start Date</span><span>${profileData.programstartDate}</span>
        </div>
        <div class="profile_expectedGraduationDate">
            <span>Expected Graduation Date</span><span>${profileData.expectedgraduationdate}</span>
        </div>
        <div class="profile_creditscompletedatfau">
            <span>Credits Completed at FAU </span><span>${profileData.creditscompletedatfau}</span>
        </div>
        <div class="profile_credits_will_register">
            <span>Credits Planned to register next semester</span><span>${profileData.creditsplannedtoregisterforupcomingsemester}</span>
        </div>
        <div class="profile_resume">
            <a href="../resume/${profileData.netid}.pdf" target="_blank"><span>View Resume </span></a> 
        </div>
        <div class="profile_transcripts">
            <a href="/transcripts/${profileData.netid}.pdf" target="_blank"><span>View Transcripts </span></a> 
        </div>
        

        <button class="close_profile_btn">Close</button>
    `;

    // Append the newly created profile container to the body (or a specific container)
    document.body.appendChild(profileContainer);

    // Show the overlay
    const overlay = document.querySelector('.overlay');
    overlay.style.display = 'block';

    setUpCloseProfileOverlayEventListeners();

}

async function viewProfile2(applicationId) {
    try {
        // Fetch profile data for the selected application ID
        const response = await fetch(`/staff/getUserProfile?applicationId=${applicationId}`);
        const profileData = await response.json();

        if (profileData) {
            await createProfileContainer2(profileData); // Dynamically create and show the profile container with fetched data

            const programTypetext = document.querySelector(".programTypeValue").textContent;
            const advisorNameDiv = document.querySelector(".profile_advisor_name");
            const advisorEmailDiv = document.querySelector(".profile_advisor_email");

            // Handle "MS - Non Thesis" scenario
            if (programTypetext === "MS Non Thesis") {
                advisorNameDiv.remove();
                advisorEmailDiv.remove();
            }
        } else {
            console.error('Profile data not found for the selected application.');
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
}

// Function to create the confirmation modal
function createConfirmationModal2() {
    const modal = document.createElement('div');
    modal.id = 'confirmationModal';
    modal.classList.add('modal');

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const message = document.createElement('p');
    message.innerHTML = `Are you sure you want to <strong id="actionText"></strong> <strong id="applicantName"></strong> for <strong id="courseTitle"></strong>?`;

    const confirmBtn = document.createElement('button');
    confirmBtn.id = 'confirmBtn';
    confirmBtn.textContent = 'Yes';

    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelBtn';
    cancelBtn.textContent = 'No';

    modalContent.appendChild(message);
    modalContent.appendChild(confirmBtn);
    modalContent.appendChild(cancelBtn);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);

    return modal;
}

// Function to show the modal with dynamic content (action can be 'shortlist' or 'select')
function showConfirmationModal2(name, courseTitle, actionText) {
    const modal = document.getElementById('confirmationModal') || createConfirmationModal();

    document.getElementById('applicantName').textContent = name;
    document.getElementById('courseTitle').textContent = courseTitle;
    document.getElementById('actionText').textContent = actionText;

    modal.style.display = 'block';

    return new Promise((resolve) => {
        document.getElementById('confirmBtn').onclick = () => {
            hideConfirmationModal();
            resolve(true);
        };

        document.getElementById('cancelBtn').onclick = () => {
            hideConfirmationModal();
            resolve(false);
        };
    });
}

// Function to hide the modal
function hideConfirmationModal2() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Function to handle the click on shortlist button
async function shortlistApplication(applicationId, name, courseTitle) {
    const userConfirmed = await showConfirmationModal2(name, courseTitle, 'shortlist');

    if (userConfirmed) {
        try {
            const response = await fetch(`/staff/shortlistApplication?applicationId=${applicationId}`);

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                fetchApplications(); // Refresh the applications list after shortlisting
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to shortlist the application.");
            }
        } catch (error) {
            console.log('Error occurred while shortlisting the application:', error);
            alert("An error occurred. Please try again later.");
        }
    }
}

// Function to handle the click on select button 
async function selectApplication(applicationId, name, courseTitle) {
    const userConfirmed = await showConfirmationModal2(name, courseTitle, 'select');

    if (userConfirmed) {
        try {
            const response = await fetch(`/staff/selectApplication?applicationId=${applicationId}`);

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                fetchApplications(); // Refresh the applications list after selecting
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to select the application.");
            }
        } catch (error) {
            console.log('Error occurred while selecting the application:', error);
            alert("An error occurred. Please try again later.");
        }
    }
}

// Function to handle the click on "Remove Shortlisted" button
async function removeShortlistedApplication(applicationId, name, courseTitle) {
    const userConfirmed = await showConfirmationModal2(name, courseTitle, 'remove');

    if (userConfirmed) {
        try {
            const response = await fetch(`/staff/removeShortlistedApplication2?applicationId=${applicationId}`);

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                fetchApplications(); // Refresh the applications list after removing from shortlist
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to remove from shortlist.");
            }
        } catch (error) {
            console.log('Error occurred while removing from shortlist:', error);
            alert("An error occurred. Please try again later.");
        }
    }
}

// Function to handle the click on "Remove Selected" button
async function removeSelectedApplication(applicationId, name, courseTitle) {
    const userConfirmed = await showConfirmationModal2(name, courseTitle, 'unselect');

    if (userConfirmed) {
        try {
            const response = await fetch(`/staff/removeSelectedApplication?applicationId2=${applicationId}`);

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                fetchApplications(); // Refresh the applications list after removing from selection
                fetchCoursesAndSelectedApplications();
                
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to remove from selection.");
            }
        } catch (error) {
            console.log('Error occurred while removing from selection:', error);
            alert("An error occurred. Please try again later.");
        }
    }
}

async function showNotifyMessageModel(applicationId, name, courseTitle) {
    // Remove any existing message container or overlay (in case they exist)
    const existingMessageContainer = document.getElementById('notifyMessageContainer');
    const existingOverlay = document.getElementById('overlay');
    if (existingMessageContainer) existingMessageContainer.remove();
    if (existingOverlay) existingOverlay.remove();


    // Create the message container
    const messageContainer = document.createElement('div');
    messageContainer.id = 'notifyMessageContainer';
    messageContainer.classList.add('notifyMessageModal'); // Add modal class for styling

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'NotifyMessageOverlay';

    // Create the content for the message box
    messageContainer.innerHTML = `
        <h3>Enter Message for ${name}</h3>
            <input type="text" id="messageTitle" placeholder="Message Title" />
            <textarea id="messageContent" placeholder="Enter your message here..."></textarea>
            <button id="notifyBtn">Notify</button>
            <button id="cancleNotifyBtn">Cancel</button>
    `;

    // Append overlay and message box to the body
    document.body.appendChild(messageContainer);
    document.body.appendChild(overlay);

    setUpNotifyCancelEventListeners(applicationId);
}

async function notifyApplicant(applicationId, messageTitle, messageContent) {
    try {
        // Send a POST request with applicationId, messageTitle, and messageContent
        const response = await fetch(`/staff/notifyApplicant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                applicationId,
                messageTitle,
                messageContent,
            }),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message); // Success message
            fetchApplications(); // Refresh the applications list after removing from selection
            fetchCoursesAndSelectedApplications();
            closeMessageContainer();
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Failed to Notify Applicant.");
        }
    } catch (error) {
        console.log('Error occurred while notifying the applicant:', error);
        alert("An error occurred. Please try again later.");
    }
}


// Function to set up event listeners for Notify and Cancel buttons
function setUpNotifyCancelEventListeners(applicationId) {

    const notifyBtn = document.getElementById('notifyBtn');
    const cancleNotifyBtn = document.getElementById('cancleNotifyBtn');

    notifyBtn.addEventListener('click', () => {

        const messageTitle = document.getElementById('messageTitle').value;
        const messageContent = document.getElementById('messageContent').value;

        if (messageTitle && messageContent) {
            notifyApplicant(applicationId, messageTitle, messageContent);
        } else {
            alert('Please fill in both the title and content.');
        }
    });

    cancleNotifyBtn.addEventListener('click', () => {
        closeMessageContainer(); // Hide message box and confirmation modal
    });
}

// Function to close the message container and overlay
function closeMessageContainer() {
    // Remove the message container and overlay from the DOM
    const messageContainer = document.getElementById('notifyMessageContainer');
    const overlay = document.getElementById('NotifyMessageOverlay');

    if (messageContainer) {
        messageContainer.remove();
    }
    if (overlay) {
        overlay.remove();
    }

    // Hide the confirmation modal (assuming `hideConfirmationModal` is a function you have)
    hideConfirmationModal();
}


// Function to sort applications based on the selected criteria
function sortApplications() {
    const container = document.querySelector('.applications_list_container');
    const applicationItems = Array.from(container.querySelectorAll('.application_item'));

    const applicationsToSort = applicationItems.slice(1);

    if (applicationsToSort.length <= 1) {
        return;
    }

    // Get the selected sort criteria
    const criterion = document.getElementById('sortByDropdown').value;

    // Sort the applications based on the selected criteria
    applicationsToSort.sort((a, b) => {
        if (criterion === 'gpa') {
            return parseFloat(b.getAttribute('data-gpa')) - parseFloat(a.getAttribute('data-gpa')); // Sort by GPA (highest first)
        } else if (criterion === 'name') {
            return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name')); // Sort by name alphabetically
        } else if (criterion === 'programType') {
            return a.getAttribute('data-program-type').localeCompare(b.getAttribute('data-program-type')); // Sort by program type
        }
    });

    // Clear the container and re-append sorted items
    const heading = document.getElementById('heading');
    container.innerHTML = ''; // Clear everything
    container.appendChild(heading); // Re-add the heading
    applicationsToSort.forEach(item => container.appendChild(item)); // Append sorted items
}
    
// Function to select and display applications only with specific eligibility criteria
async function selectBasedOnEligibility() {

    const servedAsTACheckbox = document.getElementById('servedAsTA');
    const securedAGradeCheckbox = document.getElementById('securedAGrade');
    const professionalExperienceCheckbox = document.getElementById('professionalExperience');

    const servedAsTA = servedAsTACheckbox.checked;  // Boolean value
    const securedAGrade = securedAGradeCheckbox.checked;
    const professionalExperience = professionalExperienceCheckbox.checked;

    const applicationItems = document.querySelectorAll('.application_item');
    const applicationsArray = Array.from(applicationItems);

    // Skip the first element (the header) while sorting
    const applicationsToSort = applicationsArray.slice(1);

    applicationsToSort.forEach(application => {
        // Get attributes as strings
        const servedAsTAValue = application.getAttribute('data-served-as-ta') === 'True';  // Convert 'True'/'False' strings to boolean
        const securedAGradeValue = application.getAttribute('data-a-grade') === 'True';
        const professionalExperienceValue = application.getAttribute('data-professional-experience') === 'True';

        let isVisible = true;

        // Compare checkbox status with application attributes
        if (servedAsTA && !servedAsTAValue) {
            isVisible = false;
        }

        if (securedAGrade && !securedAGradeValue) {
            isVisible = false;
        }

        if (professionalExperience && !professionalExperienceValue) {
            isVisible = false;
        }

        // Toggle visibility of the application based on the comparison
        if (isVisible) {
            application.style.display = 'grid';  // Show the application if it meets criteria
        } else {
            application.style.display = 'none';  // Hide the application if it doesn't meet criteria
        }
    });
}

// Function to clear eligibility checkboxes
async function clearEligibilityCheckboxes() {
    const checkboxes = document.querySelectorAll('.eligibility input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false; // Clear all eligibility checkboxes
    });
}








