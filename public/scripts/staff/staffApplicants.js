const yes_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-check-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
</svg>`;

const no_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-x-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>`;


document.addEventListener('DOMContentLoaded', function () {
    setUpApplicantsMainBtn();
    setUpSortApplicantsByDropdown();
});

let inWhichView = 'all';

function setUpApplicantsMainBtn() {
    const applicantsBtn = document.getElementById("applicants_btn");

    applicantsBtn.addEventListener('click', async function () {
        await fetchApplicants();
        setUpApplicantTypebtns();
        fetchCoursesListApplicants();
        setUpShorlistSelectBtns();
        setUpExportApplicantsBtn();
    });
}


function setUpExportApplicantsBtn() {

    const exportApplicantsBtn = document.querySelector('#exportApplicants');
    const confirmSelectionBtn = document.getElementById('confirmSelectionBtn');
    const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');

    const overlay = document.createElement('div');
    overlay.classList.add('overlay'); // Use the existing overlay class for styling
    document.body.appendChild(overlay);

    const selectionPopup = document.getElementById('ApplicantTypeAndfieldSelectionPopup');
    overlay.appendChild(selectionPopup);

    exportApplicantsBtn.addEventListener('click', function () {
        overlay.style.display = 'block';
        selectionPopup.style.display = 'grid';
    });

    confirmSelectionBtn.addEventListener('click', async function () {
        hideFieldSelectionAndOverlay();
        await exportApplicants();
    });

    cancelSelectionBtn.addEventListener('click', function () {
        hideFieldSelectionAndOverlay();
    });

    function hideFieldSelectionAndOverlay() {
        overlay.style.display = 'none';
        selectionPopup.style.display = 'none';
    }

}

async function exportApplicants() {

    const selectedFields = {
        name: document.getElementById('nameCheckbox').checked,
        netid: document.getElementById('netidCheckbox').checked,
        znumber: document.getElementById('znumberCheckbox').checked,
        currentgpa: document.getElementById('gpaCheckbox').checked,
        email: document.getElementById('emailCheckbox').checked,
        mobilenumber: document.getElementById('phoneCheckbox').checked,
        graduateprogram: document.getElementById('programTypeCheckbox').checked,
        programstartdate: document.getElementById('startDateCheckbox').checked,
        expectedgraduationdate: document.getElementById('graduationDateCheckbox').checked,
        enrollementstatus: document.getElementById('enrollmentStatusCheckbox').checked,
        citizenshipstatus: document.getElementById('citizenshipStatusCheckbox').checked,
        creditscompletedatfau: document.getElementById('creditsCompletedCheckbox').checked,
        creditsplannedtoregisterforupcomingsemester: document.getElementById('creditsPlannedCheckbox').checked,
    };

    const selectedApplicationTypes = {
        allApplicants: document.getElementById('allApplicationsCheckbox').checked,
        shortlistedApplicants: document.getElementById('shortlistedApplicationsCheckbox').checked,
        selectedApplicants: document.getElementById('selectedApplicationsCheckbox').checked,
    };

    try {
        const response = await fetch('/exportApplicants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selectedFields , selectedApplicationTypes })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "applicant_data.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            alert("Applicant data exported successfully. Check your downloads.");
        } else {
            alert("Error exporting applicant data.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while exporting the data.");
    }
}



async function fetchApplicants() {
    try {
        const response = await fetch("/fetchApplicants", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }); 

        if (response.redirected) {
            window.location.href = '/?sessionExpired=true'; 
            return; 
        }

        if (!response.ok) {
            throw new Error("Failed to fetch applicants");
        }

        const applicants = await response.json();
        displayApplicants(applicants);
        return applicants;
    } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch applicants. Please try again.");
        return []; // Return an empty array on error to prevent further issues
    }
}

function displayApplicants(applicants) {
    const applicantsContainer = document.querySelector(".applicants_container");
    const heading = document.getElementById('ApplicantItemHeading');
    applicantsContainer.innerHTML = ''; // Clear everything
    applicantsContainer.appendChild(heading); // Re-add the heading

    applicants.forEach(applicant => {
        const applicantItem = document.createElement("div");
        applicantItem.className = "applicant_item";
        applicantItem.setAttribute('data-gpa', applicant.gpa);
        applicantItem.setAttribute('data-name', applicant.name);
        applicantItem.setAttribute('data-program-type', applicant.programtype);
        applicantItem.setAttribute('data-applicant-type', applicant.applicant_type);

        let buttonHTML = '';

        if (inWhichView === 'all') {
            if (applicant.applicant_type === 'new') {
                buttonHTML = `
                    <button type="button" class="shortlist_btn" 
                        data-applicant-id="${applicant.applicant_id}" 
                        data-name="${applicant.name}"></button>
                    <button type="button" class="select_btn_from_new" 
                        data-applicant-id="${applicant.applicant_id}" 
                        data-name="${applicant.name}"></button>
                `;
            } else if (applicant.applicant_type === 'shortlisted') {
                buttonHTML = `
                    <button type="button" class="shortlisted_btn" 
                        data-applicant-id="${applicant.applicant_id}" 
                        data-name="${applicant.name}">Shortlisted</button>
                `;
            } else if (applicant.applicant_type === 'selected') {
                buttonHTML = `
                    <button type="button" class="selected_btn" 
                        data-applicant-id="${applicant.applicant_id}" 
                        data-name="${applicant.name}">Selected</button>
                `;
            }
        } else if (inWhichView === 'shortlisted') {
            buttonHTML = `
                <button type="button" class="remove_shortlisted_btn" 
                    data-applicant-id="${applicant.applicant_id}" 
                    data-name="${applicant.name}"></button>
                <button type="button" class="select_btn_from_shortlisted" 
                    data-applicant-id="${applicant.applicant_id}" 
                    data-name="${applicant.name}"></button>
            `;
        } else if (inWhichView === 'selected') {
            buttonHTML = `
                <button type="button" class="remove_selected_btn" 
                    data-applicant-id="${applicant.applicant_id}" 
                    data-name="${applicant.name}"></button>
            `;
        }

        // Create a string to display courses
        let coursesHTML = '';

        const courseListHeading = `
                <div class="course_list_heading course_item">
                    <span>Course Name</span>
                    <span>Course Number</span>
                    <span>Course Title</span>
                    <span>Served as TA</span>
                    <span>A Grade</span>
                    <span>Experience</span>
                    <span>Comments</span>
                </div>
            `;
        
        if (Array.isArray(applicant.courses) && applicant.courses.length > 0) {
            coursesHTML += courseListHeading;
            coursesHTML += applicant.courses.map(course => `
                <div class="course_item">
                    <span> ${course.course_name} </span>
                    <span> ${course.course_number} </span>
                    <span>${course.course_title}</span>
                    <span class="served_as_ta">${course.served_as_ta == 'true' ? yes_svg : no_svg}</span>
                    <span class="a_grade">${course.a_grade == 'true' ? yes_svg : no_svg}</span>
                    <span class="professional_experience">${course.professional_experience == 'true' ? yes_svg : no_svg}</span>
                    <span class="comments_value">${course.comments || 'No comments'}</span>
                </div>
            `).join('');
        } else {
            coursesHTML = '<div>No courses available</div>';
        }

        applicantItem.innerHTML = `
            <div>
                <button type="button" class="view_profile_btn" 
                    data-applicant-netid="${applicant.netid}" 
                    data-applicant-type="${applicant.applicant_type}" 
                    data-netid="${applicant.netid}">${applicant.name}</button>
            </div>
            <div><span>${applicant.netid}</span></div>
            <div><span>${applicant.gpa}</span></div>
            <div><span>${applicant.programtype}</span></div>
            <button type="button" class="toggle_courses_btn">View Courses </button>
            <div class="application_management_btns">
                ${buttonHTML}
            </div>
            <div class="applicant_applied_courses_list" style="display: none;">
                ${coursesHTML}
            </div>
        `;

        applicantsContainer.appendChild(applicantItem);

        const toggleCoursesBtn = applicantItem.querySelector(".toggle_courses_btn");
        const coursesList = applicantItem.querySelector(".applicant_applied_courses_list");

        // Toggle visibility with smooth transitions
        toggleCoursesBtn.addEventListener("click", () => {
            toggleCoursesBtn.classList.toggle("active");

            if (coursesList.classList.contains("show")) {
                // Slide up (hide)
                coursesList.style.maxHeight = "0"; // Start collapsing

                coursesList.addEventListener('transitionend', function handleTransitionEnd() {
                    coursesList.classList.remove("show"); // Remove "show" class after transition
                    coursesList.style.display = 'none'; // Fully hide the element
                    coursesList.removeEventListener('transitionend', handleTransitionEnd); // Clean up listener
                });

                // Change button text back to "View Courses"
                toggleCoursesBtn.textContent = "View Courses";
            } else {
                // Slide down (show)
                coursesList.style.display = 'block'; // Make it visible for height calculation
                const scrollHeight = coursesList.scrollHeight; // Get full content height
                coursesList.style.maxHeight = scrollHeight + "px"; // Set to expand height
                coursesList.classList.add("show"); // Add "show" class

                // Change button text to "Hide Courses"
                toggleCoursesBtn.textContent = "Hide Courses";
            }
        });

        // Recalculate maxHeight on window resize to adjust for responsive changes
        window.addEventListener("resize", () => {
            if (coursesList.classList.contains("show")) {
                coursesList.style.maxHeight = coursesList.scrollHeight + "px"; // Recalculate height
            }
        });

    });

    setUpViewProfileEventListener();
    setUpShorlistSelectBtns();
}






function setUpApplicantTypebtns() {
    const allApplicantsBtn = document.getElementById('allApplicantsBtn');
    const shortlistedApplicantsBtn = document.getElementById('shortlistedApplicantsBtn');
    const selectedApplicantsBtn = document.getElementById('selectedApplicantsBtn');

    allApplicantsBtn.addEventListener('click', async function (event) {
        handleApplicantTypeBtnClick(event);
        inWhichView = 'all';
        const applicants = await fetchApplicants(); // Await the fetched data
        displayApplicants(applicants); // Display all applicants
    });

    shortlistedApplicantsBtn.addEventListener('click', async function (event) {
        handleApplicantTypeBtnClick(event);
        inWhichView = 'shortlisted';
        const applicants = await fetchApplicants(); // Await the fetched data
        const shortlisted = applicants.filter(applicant => applicant.applicant_type === 'shortlisted');
        displayApplicants(shortlisted);
    });

    selectedApplicantsBtn.addEventListener('click', async function (event) {
        handleApplicantTypeBtnClick(event);
        inWhichView = 'selected';
        const applicants = await fetchApplicants(); // Await the fetched data
        const selected = applicants.filter(applicant => applicant.applicant_type === 'selected');
        displayApplicants(selected);
    }); 
}

function handleApplicantTypeBtnClick(event) {
    const buttons = document.querySelectorAll('.Applicant_type_btns_container button');
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}




function setUpSortApplicantsByDropdown() {
    const sortByDropdown = document.getElementById('sortApplicantsByDropdown');
    sortByDropdown.addEventListener('change', function () {
        sortApplicants(); 
    });
}

function sortApplicants() {
    const container = document.querySelector('.applicants_container');
    const applicantItems = Array.from(container.querySelectorAll('.applicant_item'));

    const applicantsToSort = applicantItems.slice(1);

    if (applicantItems.length <= 1) {
        return; // If there are fewer than 2 applicants, no sorting is needed
    }

    const criterion = document.getElementById('sortApplicantsByDropdown').value;

    applicantsToSort.sort((a, b) => {
        if (criterion === 'gpa') {
            return parseFloat(b.getAttribute('data-gpa')) - parseFloat(a.getAttribute('data-gpa')); // Sort by GPA (highest first)
        } else if (criterion === 'name') {
            return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name')); // Sort alphabetically by name
        } else if (criterion === 'programType') {
            // Custom sort order for program type
            const programOrder = {
                'ms non thesis': 1,
                'ms thesis': 2,
                'phd thesis' : 3
            };
            const aProgram = a.getAttribute('data-program-type').toLowerCase();
            const bProgram = b.getAttribute('data-program-type').toLowerCase();
            return programOrder[aProgram] - programOrder[bProgram];
        } else if (criterion === 'applicationType') {
            const typeOrder = {
                'new': 1,
                'shortlisted': 2,
                'selected': 3
            };
            const aType = a.getAttribute('data-applicant-type').toLowerCase();
            const bType = b.getAttribute('data-applicant-type').toLowerCase();
            return typeOrder[aType] - typeOrder[bType];
        }
    });

    // Clear the container and re-append sorted items
    const heading = document.getElementById('ApplicantItemHeading');
    container.innerHTML = ''; // Clear everything
    container.appendChild(heading); // Re-add the heading
    applicantsToSort.forEach(item => container.appendChild(item)); // Append sorted items

}




async function fetchCoursesListApplicants() {
    try {
        const response = await fetch('/coursesListDeptSemesterStaff');

        if (response.redirected) {
            alert("Your session has expired. You have been logged out.");
            window.location.href = '/';
            return;
        }
         
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const courses = await response.json();
        const courseDropdown = document.getElementById('courseDropdownApplicants');

        // Store the currently selected value
        const previouslySelectedValue = courseDropdown.value;

        // Clear previous options
        courseDropdown.innerHTML = '';

        const option = document.createElement('option');
        option.value = "select here";
        option.textContent = "Select Here";
        courseDropdown.appendChild(option);

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

        setUpCourseDropdownApplicants();

    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}

function setUpCourseDropdownApplicants() {
    const courseDropdown = document.getElementById('courseDropdownApplicants');
    courseDropdown.addEventListener('change', function () {
        filterApplicantsByCourse(courseDropdown.value);
    });
}

async function filterApplicantsByCourse(selectedCourse) {
    const applicantsContainer = document.querySelector('.applicants_container');
    await fetchApplicants(); 
    const applicantItems = applicantsContainer.querySelectorAll('.applicant_item');

    // Convert NodeList to an array
    const applicantsToSort = Array.from(applicantItems).slice(1);

    // Clear the container and re-append heading
    const heading = document.getElementById('ApplicantItemHeading');
    applicantsContainer.innerHTML = ''; // Clear everything
    applicantsContainer.appendChild(heading); // Re-add the heading

    // If the selected course is empty or 'Select here', show all applicants
    if (!selectedCourse || selectedCourse === 'select here') {
        applicantsToSort.forEach(item => {
            item.style.display = 'grid'; // Show all applicants
            applicantsContainer.appendChild(item); // Append all items back to the container
        });
        return; // Exit the function early
    }

    // Keep track of whether any applicants are visible
    let hasVisibleApplicants = false;

    applicantsToSort.forEach(item => {
        const courses = Array.from(item.querySelectorAll('.course_item span'));
        // Sanitize course names by trimming spaces
        const courseNames = courses.map(course => course.innerText.trim().toLowerCase());

        // Check if the selected course is included in the applicant's courses
        if (courseNames.includes(selectedCourse.trim().toLowerCase())) {
            item.style.display = 'grid'; // Show applicant if it matches the selected course
            hasVisibleApplicants = true; // Set flag to true if at least one applicant is visible
        } else {
            item.style.display = 'none'; // Hide applicant if it doesn't match
        }
    });

    if (hasVisibleApplicants) {
        // Append visible applicants if any
        applicantsToSort.forEach(item => {
            if (item.style.display === 'grid') {
                applicantsContainer.appendChild(item); // Append sorted items
            }
        });
    } else {
        // Create and append the 'No Applicants' message
        const noApplicantsMessage = document.createElement('p');
        noApplicantsMessage.textContent = 'No Applicants Have Applied to this Course';
        applicantsContainer.appendChild(noApplicantsMessage);
    }
}




function setUpViewProfileEventListener() {
    const viewProfileBtns = document.querySelectorAll('.view_profile_btn');

    // Add event listeners for dynamically created "View Profile" buttons
    viewProfileBtns.forEach(button => {
        button.addEventListener('click', async function () {
            const applicantNetId = this.getAttribute('data-applicant-netid');
            viewProfile(applicantNetId);
        });
    });
}

async function viewProfile(applicantNetid) {
    try {
        // Fetch profile data for the selected application ID
        const response = await fetch(`/fetchApplicantDetails?ApplicantNetid=${applicantNetid}`);
        const ApplicantProfileData = await response.json();

        if (ApplicantProfileData) {
            await createProfileContainer(ApplicantProfileData); // Dynamically create and show the profile container with fetched data

            const programTypetext = document.querySelector(".programTypeValue").textContent;
            const advisorNameDiv = document.querySelector(".profile_advisor_name");
            const advisorEmailDiv = document.querySelector(".profile_advisor_email");

            // Handle "MS - Non Thesis" scenario
            if (programTypetext === "MS Non Thesis") {
                advisorNameDiv.remove();
                advisorEmailDiv.remove();
            }
        } else {
            console.error('Profile data not found for the selected applicant.');
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
    }
}

// Function to create the Profile container when view profile is clicked
async function createProfileContainer(profileData) {

    // Remove any existing profile container
    const existingProfileContainer = document.querySelector('.profile_container');
    if (existingProfileContainer) {
        existingProfileContainer.remove();
    }

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
            <span>Mobile Number</span><span>${profileData.mobilenumber}</span>
        </div>
        <div class="profile_email">
            <span>Email</span><span>${profileData.email}</span>
        </div>
        <div class="profile_programType" value="${profileData.graduateprogram}">
            <span>Program Type</span><span class="programTypeValue">${profileData.graduateprogram}</span>
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
            <span>Program Start Date</span><span>${profileData.programstartdate}</span>
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

    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // Append the newly created profile container to the body and overlay
    document.body.appendChild(overlay);
    document.body.appendChild(profileContainer);

    setUpCloseProfileOverlayEventListeners();

}

function setUpCloseProfileOverlayEventListeners() {
    const profileContainer = document.querySelector('.profile_container');
    const closeProfileBtn = profileContainer.querySelector('.close_profile_btn');
    const overlay = document.querySelector('.modal-overlay');

    // Remove event listeners if they already exist, just to be safe
    closeProfileBtn.removeEventListener('click', closeProfilePopup);
    overlay.removeEventListener('click', closeProfilePopup);

    // Add event listeners for both the button and overlay click
    closeProfileBtn.addEventListener('click', closeProfilePopup);
    overlay.addEventListener('click', closeProfilePopup);
}

function closeProfilePopup() {
    const profileContainer = document.querySelector('.profile_container');
    const overlay = document.querySelector('.modal-overlay');

    // Remove the profile container and the overlay from the DOM
    if (profileContainer) profileContainer.remove();
    if (overlay) overlay.remove();
}






function setUpShorlistSelectBtns() {
    const shortlistBtns = document.querySelectorAll('.shortlist_btn');
    const selectBtnsFromNew = document.querySelectorAll('.select_btn_from_new');
    const selectBtnsFromShortlisted = document.querySelectorAll('.select_btn_from_shortlisted');
    const removeShortlistedBtns = document.querySelectorAll('.remove_shortlisted_btn');
    const removeSelectedBtns = document.querySelectorAll('.remove_selected_btn');

    shortlistBtns.forEach(button => {
        button.addEventListener('click', async function () {

            const applicantId = this.getAttribute('data-applicant-id');
            const applicantName = this.getAttribute('data-name');
            await shortlistApplicant(applicantId, applicantName);
            document.getElementById("applicants_btn").click();
        });
    });

    selectBtnsFromNew.forEach(button => {
        button.addEventListener('click', async function () {
            const applicantId = this.getAttribute('data-applicant-id');
            const applicantName = this.getAttribute('data-name');
            await selectApplicant(applicantId, applicantName);
            document.getElementById("applicants_btn").click();
        });
    });

    selectBtnsFromShortlisted.forEach(button => {
        button.addEventListener('click', async function () {
            const applicantId = this.getAttribute('data-applicant-id');
            const applicantName = this.getAttribute('data-name');
            await selectApplicant(applicantId, applicantName);
            document.getElementById("shortlistedApplicantsBtn").click();
        });
    });

    removeShortlistedBtns.forEach(button => {
        button.addEventListener('click', async function () {

            const applicantId = this.getAttribute('data-applicant-id');
            const applicantName = this.getAttribute('data-name');
            await unShortlistApplicant(applicantId, applicantName);
            document.getElementById("shortlistedApplicantsBtn").click();
        });
    });

    removeSelectedBtns.forEach(button => {
        button.addEventListener('click', async function () {

            const applicantId = this.getAttribute('data-applicant-id');
            const applicantName = this.getAttribute('data-name');
            await unSelectApplicant(applicantId, applicantName);
            document.getElementById("selectedApplicantsBtn").click();
        });
    });
}

async function shortlistApplicant(applicantId, applicantName) {
    const userConfirmed = await showConfirmationModal(applicantName, "Shortlist");

    if (userConfirmed) {
        try {
            const response = await fetch(`/shortlistApplicant?applicantId=${applicantId}`);

            if (response.redirected) {
                window.location.href = '/?sessionExpired=true';
                return;
            }

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                fetchApplicants(); // Refresh the applicants list after shortlisting
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to shortlist the applicant.");
            }
        } catch (error) {
            console.log('Error occurred while shortlisting the applicant:', error);
            alert("An error occurred. Please try again later.");
        }
    }
}

async function selectApplicant(applicantId, applicantName) {
    const userConfirmed = await showConfirmationModal(applicantName, "Select");

    if (userConfirmed) {
        try {
            const response = await fetch(`/selectApplicant?applicantId=${applicantId}`);

            if (response.redirected) {
                window.location.href = '/?sessionExpired=true';
                return;
            }

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                fetchApplicants(); // Refresh the applicants list after shortlisting
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to select the applicant.");
            }
        } catch (error) {
            console.log('Error occurred while selecting the applicant:', error);
            alert("An error occurred. Please try again later.");
        }
    }
}

async function unShortlistApplicant(applicantId, applicantName) {
    const userConfirmed = await showConfirmationModal(applicantName, "unshorlist");

    if (userConfirmed) {
        try {
            const response = await fetch(`/unShortlistApplicant?applicantId=${applicantId}`);

            if (response.redirected) {
                window.location.href = '/?sessionExpired=true';
                return;
            }

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                fetchApplicants(); // Refresh the applicants list after shortlisting
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to Un Shortlist the applicant.");
            }
        } catch (error) {
            console.log('Error occurred while un shortlisting the applicant:', error);
            alert("An error occurred. Please try again later.");
        }
    }
}

async function unSelectApplicant(applicantId, applicantName) {
    const userConfirmed = await showConfirmationModal(applicantName, "Unselect");

    if (userConfirmed) {
        try {
            const response = await fetch(`/unSelectApplicant?applicantId=${applicantId}`);

            if (response.redirected) {
                window.location.href = '/?sessionExpired=true';
                return;
            }

            if (response.ok) {
                const result = await response.json();
                alert(result.message); // Success message
                fetchApplicants(); // Refresh the applicants list after shortlisting
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to un Select the applicant.");
            }
        } catch (error) {
            console.log('Error occurred while un selecting the applicant:', error);
            alert("An error occurred. Please try again later.");
        }
    }
}




function showConfirmationModal(applicantName, actionText) {
    const modal = document.getElementById('confirmationModal') || createConfirmationModal();

    document.getElementById('applicantName').textContent = applicantName;
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
function hideConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Function to create the confirmation modal
function createConfirmationModal() {
    const overlay = document.createElement('div');
    overlay.id = 'confirmationModal';
    overlay.classList.add('overlay');

    const modalContent = document.createElement('div');
    modalContent.classList.add('confirmation-model-content');

    const message = document.createElement('p');
    message.innerHTML = `Are you sure you want to <strong id="actionText"></strong> the applicant <strong id="applicantName"></strong>`;

    const confirmBtn = document.createElement('button');
    confirmBtn.id = 'confirmBtn';
    confirmBtn.classList.add('btn');
    confirmBtn.classList.add('btn-primary');
    confirmBtn.textContent = 'Yes';

    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelBtn';
    cancelBtn.classList.add('btn');
    cancelBtn.classList.add('btn-secondary');
    cancelBtn.textContent = 'No';

    modalContent.appendChild(message);
    modalContent.appendChild(confirmBtn);
    modalContent.appendChild(cancelBtn);
    overlay.appendChild(modalContent);

    document.body.appendChild(overlay);

    return overlay;
}









