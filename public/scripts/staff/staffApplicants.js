const yes_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-check-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425z"/>
</svg>`;

const no_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-x-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
</svg>`;

const selectedSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-check-square-fill" viewBox="0 0 16 16">
            <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"/>
        </svg>
    `;


document.addEventListener('DOMContentLoaded', function () {
    setUpApplicantsMainBtn();
});

function setUpApplicantsMainBtn() {
    const applicantsBtn = document.getElementById("applicants_btn");

    applicantsBtn.addEventListener('click', async function () {
        setUpSortApplicantsByDropdown();
        document.querySelector('.applicant_details_container').style.display = 'none';
        await fetchAndRenderSemesters();
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

            document.querySelector(".applicant_details_container").style.display = "none";

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
        const applicantItem = createApplicantContainer(applicant);
        applicantsContainer.appendChild(applicantItem);
    });

    SortApplicantsBySelectionStatus();
    setUpApplicantButtonListeners();
}

function createApplicantContainer(applicant) {
    const applicantItem = document.createElement("button");
    applicantItem.className = "applicant_item";
    applicantItem.setAttribute('data-applicant-id', applicant.applicant_id);
    applicantItem.setAttribute('data-applicant-netid', applicant.netid);
    applicantItem.setAttribute('data-name', applicant.name);
    applicantItem.setAttribute('data-gpa', applicant.gpa);
    applicantItem.setAttribute('data-program-type', applicant.programtype);

    const applicant_status = applicant.applicant_type === 'new' ? 'notselected' : 'selected';
    applicantItem.setAttribute('data-applicant-status', applicant_status);

    const svgHTML = applicant_status === 'selected' ? selectedSVG : '';

    applicantItem.innerHTML = `
        <div class="applicant_name">
            <span class="value">${applicant.name}</span> 
            ${svgHTML}
        </div>
        <div class="applicant_netid_gpa_program">
            <span>${applicant.netid}</span>
            <span>${applicant.gpa}</span>
            <span>${applicant.programtype}</span>
        </div>
    `;

    return applicantItem;
}

function setUpApplicantButtonListeners() {
    const applicantButtons = document.querySelectorAll('.applicant_item');
    applicantButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const applicantId = button.getAttribute('data-applicant-id');
            const applicantNetid = button.getAttribute('data-applicant-netid');
            const applicantStatus = button.getAttribute('data-applicant-status');
            
            applicantButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            await fetchAndUpdateApplicantDetails(applicantId, applicantNetid, applicantStatus);
        });
    });
}

async function fetchAndUpdateApplicantDetails(applicantId, applicantNetid, applicantStatus) {
    try {
        const semester = await getActiveSemester();
        const response = await fetch(`/ApplicantDetails?applicantId=${applicantId}&applicantNetid=${applicantNetid}&semester=${semester}`);
        if (response.ok) {
            const applicantDetails = await response.json();
            updateApplicantDetailsContainer(applicantDetails, applicantNetid, applicantStatus);
        } else {
            console.error('Failed to fetch applicant details.');
        }
    } catch (error) {
        console.error('Error fetching applicant details:', error);
    }
}

function updateApplicantDetailsContainer(applicantDetails, applicantNetid, applicantStatus) {

    const applicantDetailsContainer = document.querySelector('.applicant_details_container');
    const assignedCoursesDisplay = applicantStatus === 'selected' ? 'block' : 'none';

    const yes_svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="green" class="bi bi-check-square-fill" viewBox="0 0 16 16">
        <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm10.03 4.97a.75.75 0 0 1 .011 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.75.75 0 0 1 1.08-.022z"/>
        </svg>
        `;

    const no_svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-x-square-fill" viewBox="0 0 16 16">
        <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708"/>
        </svg>
        `;

    const appliedCoursesContentHTML = applicantDetails.courses.map(course => {
        let commentsSection = '';
        if (course.comments) {
            commentsSection = `
            <div>
                <span class="comments_title">Comments: </span><span class="comments_value">${course.comments}</span>
            </div>
        `;
        }
        return `
            <div class="applied_course_item">
                <div>
                    <span class="title">${course.course_title}</span>
                    <span class="name">${course.course_name}</span>
                    <span class="number">${course.course_number}</span>
                </div>
                <div>
                    <span>A Grade: ${course.a_grade === "true" ? yes_svg : no_svg}</span>
                    <span>Served as TA: ${course.served_as_ta === "true" ? yes_svg : no_svg}</span>
                    <span>Professional Experience: ${course.professional_experience === "true" ? yes_svg : no_svg}</span>
                </div>

                ${commentsSection}
            </div>
        `;
    }).join('');

    const assignedCoursesContentHTML = applicantDetails.assignedCourses.map(course => {
        return `
            <div class="assigned_course_item">
                <div class="course">
                    <span class="title">${course.course_title}</span>
                    <span class="name">${course.course_name}</span>
                    <span class="number">${course.course_number}</span>
                </div>
                <div class="hours">
                    <span>${course.ta_hours} Hours</span>
                </div>
                <button class="edit_assigned_course_btn" data-applicant-id="${applicantDetails.applicantId}" data-course-name="${course.course_name}" data-course-number="${course.course_number}"><span>Edit</span></button>
                <button class="remove_assigned_course_btn" data-applicant-id="${applicantDetails.applicantId}" data-course-name="${course.course_name}" data-course-number="${course.course_number}"><span>Remove</span></button>
            </div>
        `;
    }).join('');

    const assignedCoursesMessage = "No course is assigned yet";

    const assignedCoursesContent = assignedCoursesContentHTML || `<p>${assignedCoursesMessage}</p>`;

    let buttonHTML = '';

    if (applicantStatus === 'selected') {
        buttonHTML = ` 
        <button type="button" class="view_profile_btn" data-applicant-netid="${applicantDetails.netid}"><span>View Profile</span></button>
        <button type="button" class="assign_course_btn" ><span>Assign Course</span></button>
        <button type="button" class="unselect_btn" data-applicant-id="${applicantDetails.applicantId}" data-name="${applicantDetails.name}">UnSelect</button>`;
    } else if (applicantStatus === 'notselected') {
        buttonHTML = `
        <button type="button" class="view_profile_btn" data-applicant-netid="${applicantDetails.netid}"><span>View Profile</span></button>
        <button type="button" class="select_btn" data-applicant-id="${applicantDetails.applicant_id}" data-name="${applicantDetails.name}">Select</button>`;
    }

    applicantDetailsContainer.innerHTML = `
        <div class="applicant_main_details">
            <span class="applicant_name">${applicantDetails.name}</span>
            <span class="applicant_netid">${applicantDetails.netid}</span>
        </div>
        <div class="applicant_btns">
            ${buttonHTML}
        </div>
        <div class="assigned_courses_list" style="display: ${assignedCoursesDisplay}">
            <div class="assigned_courses_title">
                <span>TA Assignment</span>
            </div>
            ${assignedCoursesContent}
        </div>
        <div class="applied_courses_list">
            <div class="applied_courses_title">
                <span>Applied Courses</span>
            </div>
            ${appliedCoursesContentHTML}
        </div>
    `;

    const selectBtn = applicantDetailsContainer.querySelector('.select_btn');
    if (selectBtn) {
        selectBtn.addEventListener('click', async function () {
            await selectApplicant(applicantDetails.applicantId, applicantDetails.name, applicantDetails.netid);
        });
    }

    const unselectBtn = applicantDetailsContainer.querySelector('.unselect_btn');
    if (unselectBtn) {
        unselectBtn.addEventListener('click', async function () {
            await unSelectApplicant(applicantDetails.applicantId, applicantDetails.name, applicantDetails.netid);
        });
    }

    const assignCourseBtn = applicantDetailsContainer.querySelector('.assign_course_btn');
    if (assignCourseBtn) {
        assignCourseBtn.addEventListener('click', async function () {
            createAssignCoursePopup(applicantDetails);
        });
    }

    setUpViewProfileEventListener();

    const removeAssignedCourseBtns = applicantDetailsContainer.querySelectorAll(".remove_assigned_course_btn");
    setUpRemoveAssignedCourseBtns(removeAssignedCourseBtns, applicantNetid, applicantStatus);
    applicantDetailsContainer.style.display = 'flex';


    const editAssignedCourseBtns = applicantDetailsContainer.querySelectorAll(".edit_assigned_course_btn");
    if (editAssignedCourseBtns) {
        setUpEditAssignedCourseLogic(editAssignedCourseBtns);
    }
}


function setUpEditAssignedCourseLogic(editAssignedCourseBtns) {
    editAssignedCourseBtns.forEach(button => {

        button.addEventListener('click', function (event) {
            const assignedCourseItem = event.target.closest(".assigned_course_item");

            // Ensure that assignedCourseItem is found
            if (!assignedCourseItem) {
                console.error("assignedCourseItem not found.");
                return;
            }

            const currentHoursSpan = assignedCourseItem.querySelector(".hours > span");

            // Check if currentHoursSpan is found before accessing its textContent
            if (!currentHoursSpan) {
                console.error("currentHoursSpan not found.");
                return;
            }

            const currentHours = currentHoursSpan.textContent.split(' ')[0];

            const inputField = document.createElement("input");
            inputField.type = "number";
            inputField.value = currentHours;
            inputField.min = 1;
            currentHoursSpan.replaceWith(inputField);

            // Hide 'Edit' button
            const removeBtn = assignedCourseItem.querySelector(".remove_assigned_course_btn");
            const saveBtn = assignedCourseItem.querySelector(".edit_assigned_course_btn");
            saveBtn.style.display = 'none';
            removeBtn.style.display = 'none';

            // Add 'Save' and 'Cancel' buttons
            const cancelBtn = document.createElement("button");
            cancelBtn.type = "button";
            cancelBtn.textContent = "Cancel";
            cancelBtn.className = "cancel_edit_assigned_course_btn";

            const updateBtn = document.createElement("button");
            updateBtn.type = "button";
            updateBtn.textContent = "Save";
            updateBtn.className = "update_course_assignment_btn";

            assignedCourseItem.appendChild(updateBtn);
            assignedCourseItem.appendChild(cancelBtn);

            // Cancel button logic
            cancelBtn.addEventListener("click", () => {
                inputField.replaceWith(currentHoursSpan);
                currentHoursSpan.textContent = `${currentHours} Hours`;

                cancelBtn.remove();
                updateBtn.remove();
                removeBtn.style.display = '';
                saveBtn.style.display = '';

                // Show the "Edit" button again
                button.style.display = '';
            });

            // Save button logic
            updateBtn.addEventListener("click", async () => {
                const updatedHours = inputField.value;

                if (!updatedHours || updatedHours <= 0 || isNaN(updatedHours)) {
                    alert("Please enter a valid number of hours.");
                    return;
                }

                const applicantId = assignedCourseItem.querySelector(".remove_assigned_course_btn").getAttribute("data-applicant-id");
                const courseName = assignedCourseItem.querySelector(".remove_assigned_course_btn").getAttribute("data-course-name");
                const courseNumber = assignedCourseItem.querySelector(".remove_assigned_course_btn").getAttribute("data-course-number");
                const semester = await getActiveSemester();

                const payload = { applicantId, courseName, courseNumber, updatedHours, semester };

                try {
                    const response = await fetch("/updateAssignedCourse", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    });

                    const result = await response.json();
                    if (response.ok) {
                        alert(result.message || "Course assignment updated successfully!");
                        currentHoursSpan.textContent = `${updatedHours} Hours`;
                    } else {
                        alert(result.error || "Failed to update course assignment.");
                    }
                } catch (error) {
                    console.error("Error while updating course assignment:", error);
                    alert("An error occurred while updating the course assignment. Please try again.");
                }

                inputField.replaceWith(currentHoursSpan);
                cancelBtn.remove();
                updateBtn.remove();
                removeBtn.style.display = '';
                saveBtn.style.display = '';

                // Show the "Edit" button again
                button.style.display = '';
            });

        });

    });
}

function createAssignCoursePopup(applicantDetails) {
    const existingPopup = document.querySelector(".assignCoursePopUpOverlay");
    if (existingPopup) existingPopup.remove();

    const popupOverlay = document.createElement("div");
    popupOverlay.className = "assignCoursePopUpOverlay";

    const popupContent = document.createElement("div");
    popupContent.className = "assignCoursePopUpContent";

    popupContent.innerHTML = `
        <span class="assign_course_title">Assign Course to ${applicantDetails.name} (${applicantDetails.netid})</span>
        <form>
            <div class="select_course_container">
                <span>Select Course</span>
                <select id="courseSelect" class="courseSelect">
                    <option value="" disabled selected>Select Course</option>
                    ${applicantDetails.courses.map(course => `
                        <option value="${course.course_number}" 
                            data-course-name="${course.course_name}" 
                            data-course-number="${course.course_number}";
                            data-course-title="${course.course_title}">
                            ${course.course_title}
                        </option>
                    `).join('')}
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <span>Number of Hours : </span>
                <input type="number" id="courseHours" class="courseHours" min="1" placeholder="Enter hours" />
            </div>
            <div class="btn_container">
                <button type="button" class="confirmAssignBtn">Assign</button>
                <button type="close" class="closePopUp">Cancel</button>
            </button>

        </form>
    `;

    popupOverlay.appendChild(popupContent);
    document.body.appendChild(popupOverlay);

    const courseSelect = popupContent.querySelector("#courseSelect");

    courseSelect.addEventListener("change", async () => {
        if (courseSelect.value === "other") {
            try {
                const activeSemester = await getActiveSemester();
                const response = await fetch(`/CoursesListBySemester?semester=${activeSemester}`);
                if (!response.ok) throw new Error("Failed to fetch additional courses");

                const courses = await response.json();
                courseSelect.innerHTML = `
                    <option value="" disabled selected>Select Course</option>
                    ${applicantDetails.courses.map(course => `
                        <option value="${course.course_number}" 
                            data-course-name="${course.course_name}" 
                            data-course-number="${course.course_number}"
                            data-course-title="${course.course_title}">
                            ${course.course_title}
                        </option>
                    `).join('')}
                    ${courses.map(course => `
                        <option value="${course.course_number}" 
                            data-course-name="${course.course_name}" 
                            data-course-number="${course.course_number}"
                            data-course-title="${course.course_title}">
                            ${course.course_title}
                        </option>
                    `).join('')}
                    <option value="other">Other</option>
                `;
            } catch (error) {
                console.error("Error fetching additional courses:", error);
                alert("An error occurred while fetching additional courses.");
            }
        }
    });

    const closePopUp = popupContent.querySelector(".closePopUp");
    const confirmAssignBtn = popupContent.querySelector(".confirmAssignBtn");

    closePopUp.addEventListener("click", () => popupOverlay.remove());
    popupOverlay.addEventListener("click", (e) => {
        if (e.target === popupOverlay) popupOverlay.remove();
    });

    confirmAssignBtn.addEventListener("click", async () => {
        const selectedCourse = courseSelect.value;
        const selectedCourseOption = courseSelect.querySelector(`option[value="${selectedCourse}"]`);
        const courseHours = popupContent.querySelector("#courseHours").value;

        if (!selectedCourse || !courseHours || courseHours <= 0) {
            alert("Please select a valid course and enter hours.");
            return;
        }

        const courseName = selectedCourseOption?.getAttribute("data-course-name") || "Unknown";
        const courseNumber = selectedCourseOption?.getAttribute("data-course-number") || "Unknown";
        const courseTitle = selectedCourseOption?.getAttribute("data-course-title") || "Unknown";

        const applicantId = applicantDetails.applicantId;
        const applicantNetid = applicantDetails.netid;
        const semester = await getActiveSemester();

        const payload = {
            applicantId,
            applicantNetid,
            courseHours,
            courseNumber,
            courseName,
            courseTitle,
            semester,
        };

        try {
            const response = await fetch("/assignCourse", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message || "Course assigned successfully!");
                popupOverlay.remove();

                const activeApplicantButton = await getActiveApplicantButton();
                if (activeApplicantButton) {
                    activeApplicantButton.setAttribute('data-applicant-status', 'selected');
                }
                activeApplicantButton.click();

            } else {
                alert(result.error || "Failed to assign course.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while assigning the course.");
        }
    });

    popupOverlay.style.display = "flex";
}

function setUpRemoveAssignedCourseBtns(removeAssignedCourseBtns, applicantNetid, applicantStatus) {
    removeAssignedCourseBtns.forEach(button => {
        button.addEventListener("click", async (event) => {
            const applicantId = event.currentTarget.getAttribute("data-applicant-id");
            const courseName = event.currentTarget.getAttribute("data-course-name");
            const courseNumber = event.currentTarget.getAttribute("data-course-number");
            const semester = await getActiveSemester();

            const payload = { applicantId, courseName, courseNumber, semester };
            try {
                const response = await fetch("/removeAssignedCourse", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();
                if (response.ok) {

                    alert(result.message || "Assigned Course removed successfully!");
                    await fetchAndUpdateApplicantDetails(applicantId, applicantNetid, applicantStatus)

                } else {
                    alert(result.error || "Failed to remove course.");
                }
            } catch (error) {
                console.error("Error while removing assigned course:", error);
                alert("An error occurred while removing the course. Please try again.");
            }
        });
    });
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



function SortApplicantsBySelectionStatus() {
    const container = document.querySelector('.applicants_container');
    const applicantItems = Array.from(container.querySelectorAll('.applicant_item'));

    if (applicantItems.length <= 1) {
        return;
    }

    applicantItems.sort((a, b) => {
        const aStatus = a.getAttribute('data-applicant-status');
        const bStatus = b.getAttribute('data-applicant-status');

        // "selected" should come before "notselected"
        if (aStatus === 'selected' && bStatus === 'notselected') {
            return -1; // a comes before b
        } else if (aStatus === 'notselected' && bStatus === 'selected') {
            return 1; // b comes before a
        } else {
            return 0; // No change in order if statuses are the same
        }
    });

    container.innerHTML = '';
    applicantItems.forEach(item => container.appendChild(item));
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

    if (applicantItems.length <= 1) {
        return;
    }

    const criterion = document.getElementById('sortApplicantsByDropdown').value;

    if (!criterion) {
        alert("Please select a valid sorting criterion.");
        return;
    }

    applicantItems.sort((a, b) => {
        if (criterion === 'gpa') {
            const aGpa = parseFloat(a.getAttribute('data-gpa'));
            const bGpa = parseFloat(b.getAttribute('data-gpa'));
            return bGpa - aGpa; // Sort descending
        } else if (criterion === 'name') {
            const aName = a.getAttribute('data-name');
            const bName = b.getAttribute('data-name');
            return aName.localeCompare(bName); // Sort alphabetically
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
            return programOrder[aProgram] - programOrder[bProgram]; // Sort by program type
        } else {
            return 0; // Default case, no sorting
        }
    });

    // Clear container and re-add sorted items
    container.innerHTML = '';
    applicantItems.forEach(item => container.appendChild(item));

    SortApplicantsBySelectionStatus();
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
            option.textContent = `${course.course_title} (${course.course_name}) (${course.course_number})`;
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
    document.querySelector(".applicant_details_container").style.display = 'none';
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






async function getActiveApplicantButton() {
    const activeButton = document.querySelector('.applicant_item.active');
    if (activeButton) {
        return activeButton;
    } else {
        console.log("No active applicant button found.");
        return null;
    }
}

async function selectApplicant(applicantId, applicantName, applicantNetid) {
    const userConfirmed = await showConfirmationModal(applicantName, "Select");

    if (userConfirmed) {
        try {
            const semester = getActiveSemester();
            console.log(semester, applicantId);
            const response = await fetch(`/selectApplicant?applicantId=${applicantId}&semester=${semester}`);

            if (response.redirected) {
                window.location.href = '/?sessionExpired=true';
                return;
            }

            if (response.ok) {
                const result = await response.json();
                alert(result.message);

                const activeApplicantButton = await getActiveApplicantButton();
                if (activeApplicantButton) {
                    activeApplicantButton.setAttribute('data-applicant-status', 'selected');

                    const svgElement = document.createElement('div');
                    svgElement.innerHTML = selectedSVG;
                    activeApplicantButton.querySelector('.applicant_name').appendChild(svgElement);
                }

                activeApplicantButton.click();
                SortApplicantsBySelectionStatus();

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

async function unSelectApplicant(applicantId, applicantName, applicantNetid) {
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
                
                const activeApplicantButton = await getActiveApplicantButton();
                if (activeApplicantButton) {
                    activeApplicantButton.setAttribute('data-applicant-status', 'notselected');

                    // Remove the SVG (green check) from the applicant item
                    const svgElement = activeApplicantButton.querySelector('.applicant_name svg');
                    if (svgElement) {
                        svgElement.remove(); // Remove the green check SVG
                    }
                }
                
                activeApplicantButton.click();
                SortApplicantsBySelectionStatus();
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
    overlay.classList.add('overlay', 'exportoverlay');
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

