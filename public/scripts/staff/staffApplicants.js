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
});

function setUpApplicantsMainBtn() {
    const applicantsBtn = document.getElementById("applicants_btn");

    applicantsBtn.addEventListener('click', async function () {

        await fetchAndRenderSemesters();
        setUpSortApplicantsByDropdown();
        setUpSelectBtns();
        setUpExportApplicantsBtn();
    });
}





async function fetchAndRenderSemesters() {

    try {
        const semesterResponse = await fetch('/semesterList');
        if (semesterResponse.ok) {
            const semesters = await semesterResponse.json();
            const semesterContainer = document.querySelector('.StaffApplicantsContent .semesters_container');

            semesterContainer.innerHTML = ''; 

            // Render semester buttons and find the first active button
            const buttons = semesters.map(semester => createSemesterButton(semester));
            buttons.forEach(button => semesterContainer.appendChild(button));
            await setUpSemesterBtns(buttons);

            if (buttons.length > 0) buttons[0].click(); // Trigger a click on the first button if it exists

        } else {
            const errorData = await semesterResponse.json();
            console.error('Error fetching active semester data:', errorData.error);
        }
    } catch (error) {
        console.error("Error fetching active semester data:", error);
    }
}

function createSemesterButton(semester) {
    const button = document.createElement('button');
    const span = document.createElement('span');
    span.textContent = semester.semester;
    span.classList.add('semester-span');
    button.appendChild(span);
    button.classList.add('semester-button');
    button.dataset.semester = semester.semester;
    button.dataset.status = semester.status; 
    return button;
}

async function setUpSemesterBtns(buttons) {
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            buttons.forEach(btn => btn.classList.remove("active_semester_button"));
            button.classList.add("active_semester_button");

            const courseDropdown = document.getElementById('courseDropdownApplicants');
            courseDropdown.innerHTML = '';


            await fetchCoursesListInApplicants(button.dataset.semester);
            await fetchApplicantsBySemester(button.dataset.semester);
        });
    });
}


















async function fetchApplicantsBySemester(semester) {
    try {
        const response = await fetch(`/fetchApplicantsBySemester?semester=${semester}`, {
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
        return [];
    }
}

function displayApplicants(applicants) {
    const applicantsContainer = document.querySelector(".applicants_container");
    applicantsContainer.innerHTML = '';

    applicants.forEach(applicant => {
        const applicantItem = document.createElement("div");
        applicantItem.className = "applicant_item";
        applicantItem.setAttribute('data-gpa', applicant.gpa);
        applicantItem.setAttribute('data-name', applicant.name);
        applicantItem.setAttribute('data-program-type', applicant.programtype);
        applicantItem.setAttribute('data-applicant-type', applicant.applicant_type);
        applicantItem.setAttribute('data-semester', applicant.semester);

        let buttonHTML = '';

        if (applicant.applicant_type === 'new') {
            buttonHTML = `
                <button type="button" class="select_btn" 
                    data-applicant-id="${applicant.applicant_id}" 
                    data-name="${applicant.name}">Select</button>
            `;
        } else if (applicant.applicant_type === 'selected') {
            buttonHTML = `
                <button type="button" class="unselect_btn"
                data-applicant-id="${applicant.applicant_id}" 
                data-name="${applicant.name}">UnSelect</button>
            `;
        }

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
            coursesHTML = '<div>Applicant has not applied to any courses yet</div>';
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

        toggleCoursesBtn.addEventListener("click", () => {
            toggleCoursesBtn.classList.toggle("active");

            if (coursesList.classList.contains("show")) {
                coursesList.style.maxHeight = "0";

                coursesList.addEventListener('transitionend', function handleTransitionEnd() {
                    coursesList.classList.remove("show");
                    coursesList.style.display = 'none';
                    coursesList.removeEventListener('transitionend', handleTransitionEnd);
                });

                toggleCoursesBtn.textContent = "View Courses";
            } else {
                coursesList.style.display = 'block';
                const scrollHeight = coursesList.scrollHeight;
                coursesList.style.maxHeight = scrollHeight + "px";
                coursesList.classList.add("show");

                toggleCoursesBtn.textContent = "Hide Courses";
            }
        });

        window.addEventListener("resize", () => {
            if (coursesList.classList.contains("show")) {
                coursesList.style.maxHeight = coursesList.scrollHeight + "px";
            }
        });

    });

    setUpViewProfileEventListener();
    setUpSelectBtns();
}

function setUpViewProfileEventListener() {
    const viewProfileBtns = document.querySelectorAll('.view_profile_btn');

    viewProfileBtns.forEach(button => {
        button.addEventListener('click', async function () {
            const applicantNetId = this.getAttribute('data-applicant-netid');
            viewProfile(applicantNetId);
        });
    });
}

async function viewProfile(applicantNetid) {
    try {
        const response = await fetch(`/fetchApplicantDetails?ApplicantNetid=${applicantNetid}`);
        const ApplicantProfileData = await response.json();

        if (ApplicantProfileData) {
            await createProfileContainer(ApplicantProfileData);

            const programTypetext = document.querySelector(".programTypeValue").textContent;
            const advisorNameDiv = document.querySelector(".profile_advisor_name");
            const advisorEmailDiv = document.querySelector(".profile_advisor_email");

            if (programTypetext !== "MS Thesis" && programTypetext !== "PHD Thesis") {
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

async function createProfileContainer(profileData) {

    const existingProfileContainer = document.querySelector('.profile_container');
    if (existingProfileContainer) {
        existingProfileContainer.remove();
    }

    const profileContainer = document.createElement('div');
    profileContainer.classList.add('profile_container');
    profileContainer.style.display = 'block';

    let resumeSection;
    if (profileData.resume === "not_available" || !profileData.resume) {
        resumeSection = `
        <div><span>Resume:</span> <span>No Resume Available</span></div>
    `;
    } else {
        resumeSection = `
        <div><span>Resume:</span> 
            <a href="../resume/${profileData.resume}" target="_blank">${profileData.resume}</a>
        </div>
    `;
    }

    let transcriptSection;
    if (profileData.transcriptCount === 0 || !profileData.transcripts || profileData.transcripts.length === 0) {
        transcriptSection = `
        <div><span>Transcripts:</span> <span>No Transcripts Available</span></div>
    `;
    } else {
        transcriptSection = `
        <div><span>Transcripts:</span></div>
        <ul>
            ${profileData.transcripts.map(transcript => `
                <li><a href="/transcripts/${transcript}" target="_blank">${transcript}</a></li>
            `).join('')}
        </ul>
    `;
    }



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

        ${resumeSection}

        ${transcriptSection}

        <button class="close_profile_btn">Close</button>
    `;

    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    document.body.appendChild(overlay);
    document.body.appendChild(profileContainer);

    setUpCloseProfileOverlayEventListeners();
}

function setUpCloseProfileOverlayEventListeners() {
    const profileContainer = document.querySelector('.profile_container');
    const closeProfileBtn = profileContainer.querySelector('.close_profile_btn');
    const overlay = document.querySelector('.modal-overlay');

    closeProfileBtn.removeEventListener('click', closeProfilePopup);
    overlay.removeEventListener('click', closeProfilePopup);

    closeProfileBtn.addEventListener('click', closeProfilePopup);
    overlay.addEventListener('click', closeProfilePopup);
}

function closeProfilePopup() {
    const profileContainer = document.querySelector('.profile_container');
    const overlay = document.querySelector('.modal-overlay');

    if (profileContainer) profileContainer.remove();
    if (overlay) overlay.remove();
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
        return;
    }

    const criterion = document.getElementById('sortApplicantsByDropdown').value;

    applicantsToSort.sort((a, b) => {
        if (criterion === 'gpa') {
            return parseFloat(b.getAttribute('data-gpa')) - parseFloat(a.getAttribute('data-gpa'));
        } else if (criterion === 'name') {
            return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
        } else if (criterion === 'programType') {
            const programOrder = {
                'combined bs/ms': 1,
                'phd thesis': 2,
                'phd thesis ( advisor unknown )': 3,
                'ms thesis': 4,
                'ms thesis ( advisor unknown )': 5,
                'ms non thesis': 6,
                'undergraduate (ug)': 7
            };
            const aProgram = a.getAttribute('data-program-type').toLowerCase();
            const bProgram = b.getAttribute('data-program-type').toLowerCase();
            return programOrder[aProgram] - programOrder[bProgram];
        } 
    });

    container.innerHTML = '';
    applicantsToSort.forEach(item => container.appendChild(item));

}





function getActiveSemester() {
    const activeButton = document.querySelector('.semester-button.active_semester_button');
    return activeButton ? activeButton.dataset.semester : null;
}






async function fetchCoursesListInApplicants(semester) {

    try {
        const response = await fetch(`/CoursesListBySemester?semester=${semester}`);

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

        const previouslySelectedValue = courseDropdown.value;

        courseDropdown.innerHTML = '';

        const option = document.createElement('option');
        option.value = "select here";
        option.textContent = "Select Here";
        courseDropdown.appendChild(option);

        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course_number;
            option.setAttribute('data-course-name', course.course_name);
            option.textContent = `${course.course_title} (${course.course_name}) (${course.course_number}) (${course.semester})`;
            courseDropdown.appendChild(option);
        });

        if (previouslySelectedValue) {
            courseDropdown.value = previouslySelectedValue;
        } else if (courseDropdown.options.length > 0) {
            courseDropdown.selectedIndex = 0;
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
    const semester = getActiveSemester();
    const applicants = await fetchApplicantsBySemester(semester);

    applicantsContainer.innerHTML = '';

    let filteredApplicants = applicants;
    if (selectedCourse !== 'select here' && selectedCourse) {
        filteredApplicants = applicants.filter(applicant =>
            applicant.courses.some(course => course.course_number === selectedCourse)
        );
    }

    if (filteredApplicants.length > 0) {
        displayApplicants(filteredApplicants);

    } else {
        const noApplicantsMessage = document.createElement('p');
        noApplicantsMessage.textContent = 'No Applicants Found for this Course and View';
        applicantsContainer.appendChild(noApplicantsMessage);
    }

}







function setUpSelectBtns() {
    const selectBtn= document.querySelectorAll('.select_btn');
    const unselectBtn = document.querySelectorAll('.unselect_btn');

    selectBtn.forEach(button => {
        button.addEventListener('click', async function () {
            const applicantId = this.getAttribute('data-applicant-id');
            const applicantName = this.getAttribute('data-name');
            await selectApplicant(applicantId, applicantName);
        });
    });

    unselectBtn.forEach(button => {
        button.addEventListener('click', async function () {
            const applicantId = this.getAttribute('data-applicant-id');
            const applicantName = this.getAttribute('data-name');
            await unSelectApplicant(applicantId, applicantName);
        });
    });
}

async function selectApplicant(applicantId, applicantName) {
    const userConfirmed = await showConfirmationModal(applicantName, "Select");

    if (userConfirmed) {
        try {
            const semester = getActiveSemester();
            const response = await fetch(`/selectApplicant?applicantId=${applicantId}&semester=${semester}`);

            if (response.redirected) {
                window.location.href = '/?sessionExpired=true';
                return;
            }

            if (response.ok) {
                const result = await response.json();
                alert(result.message);

                const activeSemesterButton = document.querySelector(`.semester-button[data-semester="${semester}"]`);
                if (activeSemesterButton) {
                    activeSemesterButton.click();
                }
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

async function unSelectApplicant(applicantId, applicantName) {
    const userConfirmed = await showConfirmationModal(applicantName, "Unselect");

    if (userConfirmed) {
        try {
            const semester = getActiveSemester();
            const response = await fetch(`/unSelectApplicant?applicantId=${applicantId}&semester=${semester}`);


            if (response.redirected) {
                window.location.href = '/?sessionExpired=true';
                return;
            }

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                
                const activeSemesterButton = document.querySelector(`.semester-button[data-semester="${semester}"]`);
                if (activeSemesterButton) {
                    activeSemesterButton.click();
                }

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

function hideConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

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







function setUpExportApplicantsBtn() {
    const exportApplicantsBtn = document.querySelector('#exportApplicants');
    const confirmSelectionBtn = document.getElementById('confirmSelectionBtn');
    const cancelSelectionBtn = document.getElementById('cancelSelectionBtn');

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    const selectionPopup = document.getElementById('ApplicantTypeAndfieldSelectionPopup');

    if (selectionPopup) {
        overlay.appendChild(selectionPopup);
    } else {
        console.error('ApplicantTypeAndfieldSelectionPopup not found in the DOM');
    }

    exportApplicantsBtn.addEventListener('click', function () {
        overlay.style.display = 'block';
        if (selectionPopup) {
            selectionPopup.style.display = 'grid';
        }
    });

    confirmSelectionBtn.addEventListener('click', async function () {
        await exportApplicants();
    });

    cancelSelectionBtn.addEventListener('click', function () {
        hideFieldSelectionAndOverlay();
    });

    function hideFieldSelectionAndOverlay() {
        overlay.style.display = 'none';
        if (selectionPopup) {
            selectionPopup.style.display = 'none';
        }
    }
}

async function exportApplicants() {
    const fileName = document.getElementById('fileNameInput').value.trim();

    if (!fileName) {
        alert("Please enter a file name.");
        return;
    }

    const selectedFields = {
        name: document.getElementById('nameCheckbox').checked,
        netid: document.getElementById('netidCheckbox').checked,
        znumber: document.getElementById('znumberCheckbox').checked,
        currentgpa: document.getElementById('gpaCheckbox').checked,
        department: document.getElementById('departmentCheckbox').checked,
        courseprogram: document.getElementById('courseProgramCheckbox').checked,
        email: document.getElementById('emailCheckbox').checked,
        mobilenumber: document.getElementById('phoneCheckbox').checked,
        graduateprogram: document.getElementById('programTypeCheckbox').checked,
        programstartdate: document.getElementById('startDateCheckbox').checked,
        expectedgraduationdate: document.getElementById('graduationDateCheckbox').checked,
        enrollementstatus: document.getElementById('enrollmentStatusCheckbox').checked,
        citizenshipstatus: document.getElementById('citizenshipStatusCheckbox').checked,
        creditscompletedatfau: document.getElementById('creditsCompletedCheckbox').checked,
        creditsplannedtoregisterforupcomingsemester: document.getElementById('creditsPlannedCheckbox').checked,
        workedforfau: document.getElementById('workedForFauCheckbox').checked,
        externalwork: document.getElementById('externalWorkCheckbox').checked,
        hoursofexternalwork: document.getElementById('hoursOfExternalWorkFauCheckbox').checked,
    };

    const selectedApplicationTypes = {
        allApplicants: document.getElementById('allApplicationsCheckbox').checked,
        selectedApplicants: document.getElementById('selectedApplicationsCheckbox').checked,
    };

    try {
        const response = await fetch('/exportApplicants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileName, selectedFields, selectedApplicationTypes })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            alert("Applicant data exported successfully. Check your downloads.");

            document.querySelector('.overlay').style.display = 'none';
            document.getElementById('ApplicantTypeAndfieldSelectionPopup').style.display = 'none';
        } else {
            alert("Error exporting applicant data.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while exporting the data.");
    }
}

