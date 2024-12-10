document.addEventListener('DOMContentLoaded', function () {
    setUpCoursesMainBtns();
});

function setUpCoursesMainBtns() {
    const coursesBtn = document.getElementById("courses_btn");
    coursesBtn.addEventListener("click",async function () {
        await fetchAndRenderSemestersInCourses();
        setUpManageCoursesBtns();
    });
}








async function getActiveSemesterInCourses() {
    const activeButton = document.querySelector('.semester-button-in-courses.active_semester_button_in_courses');
    return activeButton ? activeButton.dataset.semester : null;
}

async function fetchAndRenderSemestersInCourses() {
    try {
        const semesterResponse = await fetch('/semesterList');
        if (semesterResponse.ok) {
            const semesters = await semesterResponse.json();
            const semesterContainer = document.querySelector('.StaffCoursesContent .semesters_container');

            semesterContainer.innerHTML = '';

            // Render semester buttons and find the first active button
            const buttons = semesters.map(semester => createSemesterButtonInCourses(semester));
            buttons.forEach(button => semesterContainer.appendChild(button));
            await setUpSemesterBtnsInCourses(buttons);

            if (buttons.length > 0) buttons[0].click(); // Trigger a click on the first button if it exists

        } else {
            const errorData = await semesterResponse.json();
            console.error('Error fetching active semester data:', errorData.error);
        }
    } catch (error) {
        console.error("Error fetching active semester data:", error);
    }
}

function createSemesterButtonInCourses(semester) {
    const button = document.createElement('button');
    const span = document.createElement('span');
    span.textContent = semester.semester;
    span.classList.add('semester-span');
    button.appendChild(span);
    button.classList.add('semester-button-in-courses');
    button.dataset.semester = semester.semester;
    button.dataset.status = semester.status;
    return button;
}

async function setUpSemesterBtnsInCourses(buttons) {
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            buttons.forEach(btn => btn.classList.remove("active_semester_button_in_courses"));
            button.classList.add("active_semester_button_in_courses");
            await fetchCoursesListBySemester(button.dataset.semester);
        });
    });
}





async function fetchCoursesListBySemester(semester) {
    try {
        const response = await fetch(`/CoursesListBySemester?semester=${semester}`);

        if (response.redirected) {
            window.location.href = '/?sessionExpired=true';
            return;
        }

        if (response.ok) {
            const courses = await response.json();
            console.log(courses);
            updateCoursesList(courses);
        } else {
            console.error('Failed to fetch courses.');
            showNoCoursesMessage(); // Show 'No courses available' if request fails
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
        showNoCoursesMessage();
    }
}

function updateCoursesList(courses) {
    const coursesListContainer = document.querySelector('.courses_list_container');
    coursesListContainer.innerHTML = ''; // Clear the current list

    const courseHeadingContainer = document.createElement('div');
    courseHeadingContainer.classList.add('course_heading_container');
    courseHeadingContainer.innerHTML = `
        <div class="course_details">
        </div>
        <div class="course_sections"><span>Sections</span></div>
        <div class="course_total_ta_hours"><span>Total TA Hours</span></div>
        <div class="course_ta_hours_assigned"><span>TA Hours Assigned</span></div>
        <div class="course_ta_details"><span>TA Details</span></div>
        <div></div>
        <div></div>
    `;
    coursesListContainer.appendChild(courseHeadingContainer);

    if (courses.length > 0) {
        courses.forEach(course => {
            const courseContainer = createCourseContainer(course);
            coursesListContainer.appendChild(courseContainer);

            // Edit button toggle
            const editThisCourseBtn = courseContainer.querySelector('.edit_this_course_btn');
            const editCourseContainerDiv = courseContainer.querySelector('.edit_course_container');

            editThisCourseBtn.addEventListener("click", () => {
                const isVisible = editCourseContainerDiv.style.display === 'grid';
                editCourseContainerDiv.style.display = isVisible ? 'none' : 'grid';
                editThisCourseBtn.textContent = isVisible ? 'Edit' : 'Cancel';
            });

            // Only attach one event listener for update
            const updateBtn = courseContainer.querySelector('.update_course_btn');

            if (!updateBtn.hasListener) {
                updateBtn.addEventListener('click', async () => {
                    
                    await updateCourse(course.course_number, course.course_name, courseContainer);
                    
                    editCourseContainerDiv.style.display = 'none'; 
                    editThisCourseBtn.textContent = 'Edit';

                    const activeSemester = await getActiveSemesterInCourses();
                    await fetchCoursesListBySemester(activeSemester);
                    
                });

                updateBtn.hasListener = true; // Mark that the listener is attached
            }

            // Toggle TA details
            const toggleTaBtn = courseContainer.querySelector('.toggle_ta_btn');
            const taListDiv = courseContainer.querySelector('.applicant_ta_list');

            toggleTaBtn.addEventListener("click", () => {
                toggleTaBtn.classList.toggle("active");

                if (taListDiv.classList.contains("show")) {
                    taListDiv.style.maxHeight = "0";
                    taListDiv.addEventListener('transitionend', function handleTransitionEnd() {
                        taListDiv.classList.remove("show");
                        taListDiv.style.display = 'none';
                        taListDiv.removeEventListener('transitionend', handleTransitionEnd);
                    });
                    toggleTaBtn.textContent = "TAs";
                } else {
                    taListDiv.style.display = 'block';
                    const scrollHeight = taListDiv.scrollHeight;
                    taListDiv.style.maxHeight = scrollHeight + "px";
                    taListDiv.classList.add("show");
                    toggleTaBtn.textContent = "TAs";
                }
            });

            // Window resize for dynamic TA list height adjustment
            window.addEventListener("resize", () => {
                if (taListDiv.classList.contains("show")) {
                    taListDiv.style.maxHeight = taListDiv.scrollHeight + "px";
                }
            });
        });
        setUpdeleteThisCourseBtn();
        setUpViewProfileEventListener();
    } else {
        showNoCoursesMessage();
    }
}

function createCourseContainer(course) {

    const courseContainer = document.createElement('div');
    courseContainer.classList.add('course_container');
    courseContainer.dataset.semester = course.semester;

    // Determine and assign the appropriate class based on TA hours for visibility
    if (course.ta_hours_assigned === 0) {
        courseContainer.classList.add('ta_selection_process_not_started');
    } else if (course.ta_hours_assigned > 0 && course.ta_hours_assigned < course.ta_hours_total) {
        courseContainer.classList.add('ta_selection_process_in_process');
    } else if (course.ta_hours_assigned >= course.ta_hours_total) {
        courseContainer.classList.add('ta_selection_process_completed');
    }

    let taHTML = generateTaHTML(course);

    courseContainer.innerHTML = `
                <div class="course_name">
                    <span class="value">${course.course_name}</span>
                </div>
                <div class="course_number">
                    <span class="value">${course.course_number}</span>
                </div>
                <div class="course_title">
                    <span class="value">${course.course_title}</span>
                </div>
                <div class="course_sections">
                    <span class="value">${course.sections}</span>
                </div>
                <div class="ta_hours_total">
                    <span class="value">${course.ta_hours_total}</span>
                </div>
                <div class="ta_hours_assigned">
                    <span class="value">${course.ta_hours_assigned}</span>
                </div>
                <div class="view_tas_assigned">
                    <button type="button" class="toggle_ta_btn btn btn-link" ${course.tas.length === 0 ? 'disabled' : ''}> TAs </button>
                </div>
                <button class="edit_this_course_btn btn btn-secondary" data-course-number="${course.course_number}" data-course-name="${course.course_name}" data-course-semester="${course.semester}">
                    <span>Edit</span>
                </button>
                <button class="delete_this_course_btn btn btn-secondary" data-course-number="${course.course_number}" data-course-name="${course.course_name}" data-course-semester="${course.semester}">
                    <span>Delete</span>
                </button>
                <div class="edit_course_container" style="display: none">
                    <div>
                        <label for="total_ta_hours">Total TA Hours Available:</label>
                        <input type="number" id="total_ta_hours" class="edit_input" value="${course.ta_hours_total}" min="0">
                    </div>

                    <div>
                        <label for="number_of_sections">Number of Sections:</label>
                        <input type="number" id="number_of_sections" class="edit_input" value="${course.sections}" min="1">
                    </div>

                    <button type="button" class="update_course_btn btn btn-primary">Update</button>
                </div>
                <div class="applicant_ta_list" style="display: none;">
                    ${taHTML}
                </div>
            `;

    return courseContainer;
}

function generateTaHTML(course) {
    if (Array.isArray(course.tas) && course.tas.length > 0) {
        return `
            <div class="ta_details_title"><span>TAs Assigned</span></div>
            ${course.tas.map(ta => `
                <div class="ta_item">
                    <button type="button" class="view_profile_btn" data-applicant-netid="${ta.applicant_netid}" >${ta.name} - ${ta.applicant_netid} ( ${ta.ta_hours} Hours )</button>
                </div>
            `).join('')}
            <div class="more_details_of_ta">
                <span>For more details about applicants and TA assignments, please check the selected Applicants List</span>
            </div>`;
    } else {
        return '<div class="no_tas_assigned">NO TAs are Assigned for this course</div>';
    }
}


async function updateCourse(courseNumber, courseName, courseContainer) {
    const totalTaHours = courseContainer.querySelector('#total_ta_hours').value;
    const numberOfSections = courseContainer.querySelector('#number_of_sections').value;

    if (isNaN(totalTaHours) || isNaN(numberOfSections) || totalTaHours < 0 || numberOfSections < 0) {
        alert('Please enter valid numbers for both fields.');
        return;
    }

    const semester = await getActiveSemesterInCourses();

    try {
        const response = await fetch(`/updateCourse/${courseNumber}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                course_name: courseName,
                course_number: courseNumber,
                semester: semester,
                ta_hours_total: totalTaHours,
                sections: numberOfSections,
            }),
        });

        const result = await response.json();
        if (result.success) {
            alert('Course updated successfully!');
        } else {
            alert('Failed to update course.');
        }
    } catch (error) {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
    }
}




function setUpdeleteThisCourseBtn() {
    const delete_this_course_btn = document.querySelectorAll('.delete_this_course_btn');
    delete_this_course_btn.forEach(button => {
        button.addEventListener('click', async function () {
            const courseName = button.getAttribute('data-course-name');
            const courseNumber = button.getAttribute('data-course-number');
            showConfirmDeleteSingleCourseModal(courseNumber, courseName);
        });
    });
}

function showConfirmDeleteSingleCourseModal(courseNumber, courseName) {

    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    const confirmModal = document.createElement('div');
    confirmModal.classList.add('confirm-modal');
    confirmModal.innerHTML = `
        <div class="modal-content">
            <p>Are you sure you want to delete this course?</p>
            <button id="confirmDeleteBtn" class="btn btn-primary">Yes</button>
            <button id="cancelDeleteBtn" class="btn btn-secondary">No</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(confirmModal);

    document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
        deleteSingleCourse(courseNumber, courseName);
        document.body.removeChild(confirmModal);
        document.body.removeChild(overlay);
    });

    document.getElementById('cancelDeleteBtn').addEventListener('click', function () {
        document.body.removeChild(confirmModal);
        document.body.removeChild(overlay);
    });
}

async function deleteSingleCourse(courseNumber, courseName) {
    try {

        const semester = await getActiveSemesterInCourses();
        const response = await fetch('/delete_single_course', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseNumber: courseNumber,
                courseName: courseName,
                semester: semester,
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Course deleted successfully!");
            const semester = await getActiveSemesterInCourses();
            await fetchCoursesListBySemester(semester);
        } else {
            alert(`Failed to delete course: ${result.message || 'Unknown error'}`);
        }

    } catch (error) {
        console.error('Error deleting course:', error);
        alert('An error occurred while deleting the course. Please try again later.');
    }
}





function setUpManageCoursesBtns() {

    const addMultipleCoursesBtn = document.getElementById('addMultipleCoursesBtn');
    const coursesFileUploadContainer = document.querySelector('.CoursesFileUploadContainer');
    const uploadCsvBtn = document.getElementById('uploadCsvBtn');
    const cancleFileUploadBtn = document.getElementById('cancleFileUploadBtn');

    const addSingleCourseBtn = document.getElementById('addSingleCourseBtn');
    const singleCourseUploadContainer = document.querySelector('.SingleCourseUploadContainer');
    const uploadSingleCourseBtn = document.getElementById('uploadSingleCourseBtn');
    const cancelSingleCourseUploadBtn = document.getElementById('cancelSingleCourseUploadBtn');

    addMultipleCoursesBtn.addEventListener('click', function () {
        if (coursesFileUploadContainer.style.display === 'none' || coursesFileUploadContainer.style.display === '') {
            coursesFileUploadContainer.style.display = 'flex'; 
            addMultipleCoursesBtn.classList.add('active');
        } else {
            coursesFileUploadContainer.style.display = 'none';
            addMultipleCoursesBtn.classList.remove('active');
        }
    });

    cancleFileUploadBtn.addEventListener('click', function () {
        coursesFileUploadContainer.style.display = 'none'; 
        addMultipleCoursesBtn.classList.remove('active');
    });

    uploadCsvBtn.addEventListener('click',async function () {

        const fileInput = document.getElementById('csvFileInput');
        const file = fileInput.files[0];

        if (file) {
            showConfirmUploadFileModal(); 
            addMultipleCoursesBtn.classList.remove('active'); 
            coursesFileUploadContainer.style.display = 'none'; 
        } else {
            alert('Please select a CSV file before uploading.');
        }
    });

    addSingleCourseBtn.addEventListener('click', function () {
        if (singleCourseUploadContainer.style.display === 'none' || singleCourseUploadContainer.style.display === '') {
            singleCourseUploadContainer.style.display = 'grid'; 
            addSingleCourseBtn.classList.add('active');
        } else {
            singleCourseUploadContainer.style.display = 'none'; 
            addSingleCourseBtn.classList.remove('active');
        }
    });

    cancelSingleCourseUploadBtn.addEventListener('click', function () {
        singleCourseUploadContainer.style.display = 'none';
        addSingleCourseBtn.classList.remove('active');
    });

    uploadSingleCourseBtn.addEventListener('click', function () {
        const courseTitle = document.getElementById('courseTitle').value.trim();
        const courseName = document.getElementById('courseName').value.trim();
        const courseNumber = document.getElementById('courseNumber').value.trim();
        const sections = document.getElementById('sections').value.trim();
        const taHoursTotal = document.getElementById('taHoursTotal').value.trim();

        if (!courseTitle || !courseName || !courseNumber || !sections || !taHoursTotal) {
            alert("Please fill in all fields before uploading the course.");
            return;
        }

        showConfirmUploadSingleCourseModal();
        addSingleCourseBtn.classList.remove('active');
        singleCourseUploadContainer.style.display = 'none';
    });

}

function showConfirmUploadFileModal() {

    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    const confirmModal = document.createElement('div');
    confirmModal.classList.add('confirm-modal');
    confirmModal.innerHTML = `
        <div class="modal-content">
            <p>Are you sure you want to upload this File?</p>
            <button id="confirmUploadBtn" class="btn btn-primary">Yes</button>
            <button id="cancelUploadBtn" class="btn btn-secondary">No</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(confirmModal);

    document.getElementById('confirmUploadBtn').addEventListener('click', async function () {
        uploadCourseListFile(); 
        document.body.removeChild(confirmModal);
        document.body.removeChild(overlay); 
    });

    document.getElementById('cancelUploadBtn').addEventListener('click', function () {
        document.body.removeChild(confirmModal); 
        document.body.removeChild(overlay);
    });
}

function showConfirmUploadSingleCourseModal() {
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    const confirmModal = document.createElement('div');
    confirmModal.classList.add('confirm-modal');
    confirmModal.innerHTML = `
        <div class="modal-content">
            <p>Are you sure you want to Add this Course?</p>
            <button id="confirmUploadBtn" class="btn btn-primary">Yes</button>
            <button id="cancelUploadBtn" class="btn btn-secondary">No</button>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(confirmModal);

    document.getElementById('confirmUploadBtn').addEventListener('click', async function () {
        uploadSingleCourse();
        document.body.removeChild(confirmModal);
        document.body.removeChild(overlay);
    });

    document.getElementById('cancelUploadBtn').addEventListener('click', function () {
        document.body.removeChild(confirmModal);
        document.body.removeChild(overlay);
    });
}

async function uploadSingleCourse() {

    const courseTitle = document.getElementById('courseTitle').value.trim();
    const courseName = document.getElementById('courseName').value.trim();
    const courseNumber = document.getElementById('courseNumber').value.trim();
    const sections = parseInt(document.getElementById('sections').value.trim(), 10);
    const taHoursTotal = parseInt(document.getElementById('taHoursTotal').value.trim(), 10);
    const semester = await getActiveSemesterInCourses();

    if (!courseTitle || !courseName || !courseNumber || isNaN(sections) || isNaN(taHoursTotal)) {
        alert("Please fill in all fields before uploading the course.");
        return;
    }

    try { 

        const response = await fetch('/add_single_course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseTitle,
                courseName,
                courseNumber,
                sections,
                taHoursTotal,
                semester,
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert("Course uploaded successfully!");
            fetchCoursesListBySemester(semester); 
            document.getElementById('courseTitle').value = '';
            document.getElementById('courseName').value = '';
            document.getElementById('courseNumber').value = '';
            document.getElementById('sections').value = '';
            document.getElementById('taHoursTotal').value = '';
        } else {
            alert(`Failed to upload course: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error uploading course:', error);
        alert('An error occurred while uploading the course. Please try again later.');
    }

}

async function uploadCourseListFile() {

    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0]; 
    const semester = await getActiveSemesterInCourses();

    if (!file) {
        alert('Please select a CSV file before uploading.');
        return;
    }

    const formData = new FormData();
    formData.append('semesterCourses', file);
    formData.append('semester', semester);

    try {
        const response = await fetch('/add_multiple_courses', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert("File uploaded successfully!");
            const semester = await getActiveSemesterInCourses();
            fetchCoursesListBySemester(semester);
        } else {
            alert("Error uploading file.");
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert("An error occurred while uploading the file.");
    }
    
}








function showNoCoursesMessage() {
    const coursesListContainer = document.querySelector('.courses_list_container');
    coursesListContainer.innerHTML = '<p>No courses available. Please upload csv File to Upload the courses List</p>';
}






