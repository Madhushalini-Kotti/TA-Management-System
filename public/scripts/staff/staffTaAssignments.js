
document.addEventListener('DOMContentLoaded', function () {
    setUpSelectedApplicantsMainBtn();
});

function setUpSelectedApplicantsMainBtn() {
    const taAssignmentsBtn = document.getElementById("taAssignments_btn");

    taAssignmentsBtn.addEventListener('click', async function () {

        await fetchAndRenderSemestersInSelectedApplicants();
    });
}


function getActiveSemesterInSelectedApplicants() {
    const activeButton = document.querySelector('.semester-button-in-selected-applicants.active_semester_button_in_selected_applicants');
    return activeButton ? activeButton.dataset.semester : null;
}

async function fetchAndRenderSemestersInSelectedApplicants() {
    try {
        const semesterResponse = await fetch('/semesterList');
        if (semesterResponse.ok) {
            const semesters = await semesterResponse.json();
            const semesterContainer = document.querySelector('.StaffTaAssignmentsContent .semesters_container');

            semesterContainer.innerHTML = '';

            // Render semester buttons and find the first active button
            const buttons = semesters.map(semester => createSemesterButtonInSelectedApplicants(semester));
            buttons.forEach(button => semesterContainer.appendChild(button));
            await setUpSemesterBtnsInSelectedApplicants(buttons);

            if (buttons.length > 0) buttons[0].click(); // Trigger a click on the first button if it exists

        } else {
            const errorData = await semesterResponse.json();
            console.error('Error fetching active semester data:', errorData.error);
        }
    } catch (error) {
        console.error("Error fetching active semester data:", error);
    }
}

function createSemesterButtonInSelectedApplicants(semester) {
    const button = document.createElement('button');
    const span = document.createElement('span');
    span.textContent = semester.semester;
    span.classList.add('semester-span');
    button.appendChild(span);
    button.classList.add('semester-button-in-selected-applicants');
    button.dataset.semester = semester.semester;
    button.dataset.status = semester.status;
    return button;
}

async function setUpSemesterBtnsInSelectedApplicants(buttons) {
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            buttons.forEach(btn => btn.classList.remove("active_semester_button_in_selected_applicants"));
            button.classList.add("active_semester_button_in_selected_applicants");
            await fetchSelectedApplicantsBySemester(button.dataset.semester);
        });
    });
}





async function fetchSelectedApplicantsBySemester(semester) {
    try {
        const response = await fetch(`/fetchSelectedApplicantsBySemester?semester=${semester}`, {
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
        displaySelectedApplicants(applicants);
        return applicants;

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch applicants. Please try again.");
        return [];
    }    
}

function displaySelectedApplicants(applicants) {
    const selectedApplicantsContainer = document.querySelector(".selected_applicants_container");
    selectedApplicantsContainer.innerHTML = '';

    applicants.forEach(applicant => {
        const applicantItem = document.createElement("div");
        applicantItem.className = "selected_applicant_item";
        applicantItem.setAttribute('data-gpa', applicant.gpa);
        applicantItem.setAttribute('data-name', applicant.name);
        applicantItem.setAttribute('data-program-type', applicant.programtype);
        applicantItem.setAttribute('data-applicant-type', applicant.applicant_type);
        applicantItem.setAttribute('data-semester', applicant.semester);

        const coursesHTML = generateCoursesHTML(applicant.courses);
        const assignedCoursesHTML = generateAssignedCoursesHTML(applicant.assignedcourses, applicant.applicant_id);

        applicantItem.innerHTML = `
            <div>
                <button type="button" class="view_profile_btn" 
                    data-applicant-netid="${applicant.netid}" 
                    data-applicant-type="${applicant.applicant_type}" 
                    data-netid="${applicant.netid}">${applicant.name} (${applicant.netid})</button>
            </div> 
            <button type="button" class="toggle_selected_applicant_courses_btn">View Courses </button>
            <button type="button" class="assign_course_btn">Assign Course</button>
            <div class="applicant_assigned_courses_list">${assignedCoursesHTML}</div>
            <div class="applicant_applied_courses_list" style="display: none;">${coursesHTML}</div>
        `;

        selectedApplicantsContainer.appendChild(applicantItem);

        const toggleSelectedApplicantCoursesBtn = applicantItem.querySelector(".toggle_selected_applicant_courses_btn");
        const coursesList = applicantItem.querySelector(".applicant_applied_courses_list");

        toggleSelectedApplicantCoursesBtn.addEventListener("click", () => {
            toggleSelectedApplicantCoursesBtn.classList.toggle("active");
            if (coursesList.classList.contains("show")) {
                coursesList.style.display = 'none';
                coursesList.classList.remove("show");
                toggleSelectedApplicantCoursesBtn.textContent = "View Courses";
                toggleSelectedApplicantCoursesBtn.classList.remove("active_btn_in_applicant");
            } else {
                coursesList.style.display = 'block';
                coursesList.classList.add("show");
                toggleSelectedApplicantCoursesBtn.classList.add("active_btn_in_applicant");
                toggleSelectedApplicantCoursesBtn.textContent = "Hide Courses";
            }
        });

        if (applicant.courseAssigned) {
            const coursesAssignedListDiv = applicantItem.querySelector('.applicant_assigned_courses_list');
            coursesAssignedListDiv.style.display = "flex";
        } else {
            const coursesAssignedListDiv = applicantItem.querySelector('.applicant_assigned_courses_list');
            coursesAssignedListDiv.style.display = "none";
        }

        const assignCourseBtn = applicantItem.querySelector(".assign_course_btn");
        setUpAssignCourseLogic(assignCourseBtn, applicantItem, applicant);

        const removeAssignedCourseBtns = applicantItem.querySelectorAll(".remove_assigned_course_btn");
        setUpRemoveAssignedCourseLogic(removeAssignedCourseBtns);

        const editAssignedCourseBtns = applicantItem.querySelectorAll(".edit_assigned_course_btn");
        setUpEditAssignedCourseLogic(editAssignedCourseBtns);

    });

    window.addEventListener("resize", () => {
        const coursesList = document.querySelector(".applicant_applied_courses_list.show");
        if (coursesList) {
            coursesList.style.maxHeight = coursesList.scrollHeight + "px";
        }
    });

    setUpViewProfileEventListener();

}

function generateCoursesHTML(courses) {
    if (!Array.isArray(courses) || courses.length === 0) {
        return '<div>Applicant has not applied to any courses yet</div>';
    }

    const coursesListAppliedHeading = `
        <div class="coursesListAppliedHeading"><span>Applied Courses</span></div>
    `;

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

    const coursesHTML = courses.map(course => `
        <div class="course_item">
            <span>${course.course_name}</span>
            <span>${course.course_number}</span>
            <span>${course.course_title}</span>
            <span class="served_as_ta">${course.served_as_ta === 'true' ? yes_svg : no_svg}</span>
            <span class="a_grade">${course.a_grade === 'true' ? yes_svg : no_svg}</span>
            <span class="professional_experience">${course.professional_experience === 'true' ? yes_svg : no_svg}</span>
            <span class="comments_value">${course.comments || 'No comments'}</span>
        </div>
    `).join('');

    return coursesListAppliedHeading + courseListHeading + coursesHTML;
}

function generateAssignedCoursesHTML(assignedCourses, applicantId) {
    if (!Array.isArray(assignedCourses) || assignedCourses.length === 0) {
        return '<div>No Courses are assigned yet</div>';
    }

    const assignedCoursesListHeading = `
        <span>TA Assignment Details</span>
    `;

    const assignedCoursesHTML = assignedCourses.map(course => `
        <div class="assigned_course_item">
            <span>${course.course_title}</span>
            <span>${course.course_name}</span>
            <span>${course.course_number}</span>
            <span>${course.ta_hours} Hours</span>
            <button type="button" class="edit_assigned_course_btn" 
                data-applicant-id="${applicantId}" 
                data-course-name="${course.course_name}" 
                data-course-number="${course.course_number}">
                Edit
            </button>
            <button type="button" class="remove_assigned_course_btn" 
                data-applicant-id="${applicantId}" 
                data-course-name="${course.course_name}" 
                data-course-number="${course.course_number}">
                Remove
            </button>
        </div>
    `).join('');

    return assignedCoursesListHeading + assignedCoursesHTML;
}

function setUpAssignCourseLogic(assignCourseBtn, applicantItem, applicant) {
    assignCourseBtn.addEventListener("click", () => {
        assignCourseBtn.classList.add('active_btn_in_applicant');
        const allButtons = applicantItem.querySelectorAll("button");
        allButtons.forEach(button => button.disabled = true);

        // Create course assignment div
        const assignmentDiv = document.createElement("div");
        assignmentDiv.className = "course_assignment_details";

        // Generate course options dropdown
        const courseOptions = `
            <option value="" disabled selected>Select Course</option>
            ${applicant.courses.map(course => `
                <option 
                    value="${course.course_number}" 
                    data-course-name="${course.course_name}" 
                    data-course-number="${course.course_number}" 
                    data-course-title="${course.course_title}">
                    ${course.course_title}
                </option>
            `).join('')}
            <option value="other">Other</option>
        `;

        assignmentDiv.innerHTML = `
            <select class="course_selection">
                ${courseOptions}
            </select>
            <input type="number" class="course_hours" placeholder="Hours" min="1">
            <button type="button" class="confirm_assign_btn">Assign</button>
            <button type="button" class="cancel_assign_btn">Cancel</button>
        `;

        applicantItem.appendChild(assignmentDiv);

        const courseSelection = assignmentDiv.querySelector('.course_selection');
        const cancelAssignBtn = assignmentDiv.querySelector(".cancel_assign_btn");
        const confirmAssignBtn = assignmentDiv.querySelector(".confirm_assign_btn");

        // Handle "Other" course selection
        courseSelection.addEventListener("change", async () => {
            if (courseSelection.value === "other") {
                await fetchAndUpdateCourses(applicant.semester);
            }
        });

        // Cancel button functionality
        cancelAssignBtn.addEventListener("click", () => {
            assignmentDiv.remove();
            assignCourseBtn.classList.remove('active_btn_in_applicant');
            allButtons.forEach(button => button.disabled = false);
        });

        // Assign button functionality
        confirmAssignBtn.addEventListener("click", async () => {
            const courseHours = assignmentDiv.querySelector(".course_hours").value;
            const selectedCourse = courseSelection.value === "other"
                ? document.getElementById("courseDropdownApplicants").value
                : courseSelection.value;

            if (!selectedCourse || !courseHours || courseHours <= 0) {
                alert("Please select a valid course and enter hours.");
                return;
            }

            const selectedCourseOption = courseSelection.querySelector(`option[value="${selectedCourse}"]`);
            const courseName = selectedCourseOption?.getAttribute("data-course-name") || "Unknown Course Name";
            const courseNumber = selectedCourseOption?.getAttribute("data-course-number") || "Unknown Course Number";
            const courseTitle = selectedCourseOption?.getAttribute("data-course-title") || "Unknown Course Title";

            const applicantId = applicant.applicant_id;
            const applicantNetid = applicant.netid;
            const department = applicant.dept_name;
            const semester = applicant.semester;


            const payload = {
                applicantId,
                applicantNetid,
                courseHours,
                courseNumber,
                courseName,
                courseTitle,
                department,
                semester,
            };

            try {
                // Send data to the backend
                const response = await fetch("/assignCourse", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message || "Course assigned successfully!");
                    // Update the list of assigned courses dynamically
                } else {
                    alert(result.error || "Failed to assign course.");
                }
            } catch (error) {
                console.error("Error while assigning course:", error);
                alert("An error occurred while assigning the course. Please try again.");
            }

            assignmentDiv.remove();
            allButtons.forEach(button => button.disabled = false);
            const activeSemester = getActiveSemesterInSelectedApplicants();
            await fetchSelectedApplicantsBySemester(activeSemester);
        });
    });
}

function setUpRemoveAssignedCourseLogic(removeAssignedCourseBtns) {
    removeAssignedCourseBtns.forEach(button => {
        button.addEventListener("click", async (event) => {
            const applicantId = event.target.getAttribute("data-applicant-id");
            const courseName = event.target.getAttribute("data-course-name");
            const courseNumber = event.target.getAttribute("data-course-number");
            const semester = getActiveSemesterInSelectedApplicants();

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
                    event.target.closest('.assigned_course_item').remove();

                    const activeSemester = await getActiveSemesterInSelectedApplicants();
                    await fetchSelectedApplicantsBySemester(activeSemester);
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

function setUpEditAssignedCourseLogic(editAssignedCourseBtns) {
    editAssignedCourseBtns.forEach(button => {
        button.addEventListener("click", (event) => {

            button.style.display = 'none';

            const assignedCourseItem = event.target.closest(".assigned_course_item");
            const currentHoursSpan = assignedCourseItem.querySelector("span:nth-child(4)");
            const currentHours = currentHoursSpan.textContent.split(' ')[0];

            // Replace hours span with an input field
            const inputField = document.createElement("input");
            inputField.type = "number";
            inputField.className = "edit_course_hours";
            inputField.value = currentHours;
            inputField.min = 1;
            currentHoursSpan.replaceWith(inputField);

            // Hide 'Remove' button
            const removeBtn = assignedCourseItem.querySelector(".remove_assigned_course_btn");
            if (removeBtn) removeBtn.style.display = 'none';

            // Add 'Update' and 'Cancel' buttons
            const cancelBtn = document.createElement("button");
            cancelBtn.type = "button";
            cancelBtn.textContent = "Cancel";
            cancelBtn.className = "cancel_edit_assigned_course_btn";

            const updateBtn = document.createElement("button");
            updateBtn.type = "button";
            updateBtn.textContent = "Update";
            updateBtn.className = "update_course_assignment_btn";

            assignedCourseItem.appendChild(updateBtn);
            assignedCourseItem.appendChild(cancelBtn);

            // Cancel button logic
            cancelBtn.addEventListener("click", () => {
                inputField.replaceWith(currentHoursSpan);
                currentHoursSpan.textContent = `${currentHours} Hours`;

                cancelBtn.remove();
                updateBtn.remove();
                if (removeBtn) removeBtn.style.display = '';

                // Show the "Edit" button again
                button.style.display = '';
            });

            // Update button logic
            updateBtn.addEventListener("click", async () => {
                const updatedHours = inputField.value;

                if (!updatedHours || updatedHours <= 0 || isNaN(updatedHours)) {
                    alert("Please enter a valid number of hours.");
                    return;
                }

                const applicantId = assignedCourseItem.querySelector(".remove_assigned_course_btn").getAttribute("data-applicant-id");
                const courseName = assignedCourseItem.querySelector(".remove_assigned_course_btn").getAttribute("data-course-name");
                const courseNumber = assignedCourseItem.querySelector(".remove_assigned_course_btn").getAttribute("data-course-number");
                const semester = getActiveSemesterInSelectedApplicants();

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
                if (removeBtn) removeBtn.style.display = '';

                // Show the "Edit" button again
                button.style.display = '';
            });
        });
    });
}

function createOverlayForEmails(overlayId, containerId) {
    const overlay = document.createElement("div");
    overlay.id = overlayId;
    overlay.className = "email-overlay";

    const container = document.createElement("div");
    container.id = containerId;
    container.className = "email-message-container";

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.className = "email-close-button";

    closeButton.addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    container.appendChild(closeButton);
    overlay.appendChild(container);

    return { overlay, container };
}






async function fetchAndUpdateCourses(semester) {
    try {
        const response = await fetch(`/CoursesListBySemester?semester=${semester}`);

        // Check for session expiration or other network errors
        if (response.redirected) {
            alert("Your session has expired. You have been logged out.");
            window.location.href = '/';
            return;
        }

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the fetched courses from the server
        const courses = await response.json();

        // Expand the current course options with new courses
        let newCoursesOptions = courses.map(course =>
            `<option value="${course.course_number}"
                data-course-name="${course.course_name}" 
                data-course-title="${course.course_title}"
                data-course-number="${course.course_number}">
                ${course.course_title}</option>`
        ).join('');

        courseSelection = document.querySelector('.course_selection');
        courseSelection.innerHTML += `
            <option value="" disabled selected>Please Select Other Course</option>
            ${courses.map(course =>
                `<option 
                value="${course.course_number}" 
                data-course-name="${course.course_name}" 
                data-course-title="${course.course_title}"
                data-course-number="${course.course_number}">
                ${course.course_title}
                </option>`
        ).join('')}
            ${newCoursesOptions}
        `;
    } catch (error) {
        console.error('Error fetching additional courses:', error);
    }
}