document.addEventListener('DOMContentLoaded', function () {
    setUpCoursesMainBtns();
});

function setUpCoursesMainBtns() {
    const coursesBtn = document.getElementById("courses_btn");
    coursesBtn.addEventListener("click", async function () {
        document.body.querySelector('.course_details_container').style.display = 'none';
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
            updateCoursesList(courses);
        } else {
            console.error('Failed to fetch courses.');
            showNoCoursesMessage(); 
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
        showNoCoursesMessage();
    }
}

function updateCoursesList(courses) {
    const coursesListContainer = document.querySelector('.courses_list_container');
    coursesListContainer.innerHTML = ''; // Clear the current list

    if (courses.length > 0) {
        courses.forEach(course => {
            const courseContainer = createCourseContainer(course);
            coursesListContainer.appendChild(courseContainer);
        });
        setUpCourseButtonListeners();
    } else {
        showNoCoursesMessage();
    }
}

function createCourseContainer(course) {
    const courseContainer = document.createElement('button');
    courseContainer.classList.add('course_container');
    courseContainer.dataset.semester = course.semester;
    courseContainer.dataset.courseNumber = course.course_number;
    courseContainer.dataset.courseName = course.course_name;

    if (course.ta_hours_assigned === 0) {
        courseContainer.classList.add('ta_selection_process_not_started');
    } else if (course.ta_hours_assigned > 0 && course.ta_hours_assigned < course.ta_hours_total) {
        courseContainer.classList.add('ta_selection_process_in_process');
    } else if (course.ta_hours_assigned >= course.ta_hours_total) {
        courseContainer.classList.add('ta_selection_process_completed');
    }

    courseContainer.innerHTML = `
        <div class="course_title">
            <span class="value">${course.course_title}</span>
        </div>
        <div class="course_name_number">
            <span>${course.course_name} ${course.course_number}</span>
        </div>
    `;
    return courseContainer;
}

function setUpCourseButtonListeners() {
    const courseButtons = document.querySelectorAll('.course_container');
    courseButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const courseNumber = button.dataset.courseNumber;
            const courseName = button.dataset.courseName;

            courseButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            await fetchAndUpdateCourseDetails(courseNumber, courseName);
        });
    });
}

async function fetchAndUpdateCourseDetails( courseNumber, courseName) {
    try {
        const semester = await getActiveSemesterInCourses();
        const response = await fetch(`/CourseDetails?semester=${semester}&courseNumber=${courseNumber}&courseName=${courseName}`);
        if (response.ok) {
            const courseDetails = await response.json();
            updateCourseDetailsContainer(courseDetails);
        } else {
            console.error('Failed to fetch course details.');
        }
    } catch (error) {
        console.error('Error fetching course details:', error);
    }
}

function updateCourseDetailsContainer(courseDetails) {
    const courseDetailsContainer = document.querySelector('.course_details_container');

    courseDetailsContainer.innerHTML = `
        <div class="course_name_number_title">
            <span class="course_title">${courseDetails.course_title}</span>
            <span class="course_name">${courseDetails.course_name}</span>
            <span class="course_number">${courseDetails.course_number}</span>
        </div>
        <div class="course_section_details">
            <div class="sections_title">
                <span>Sections</span>
            </div>
            ${courseDetails.sections.map(section => `
                <div class="course_section_item">
                    <div class="crn"><span class="title">CRN </span><span class="value">${section.crn}</span></div>
                    <div class="enrollement"><span class="title">Enrollment</span><span class="value">${section.current_enrollement}/${section.total_enrollement}</span></div>
                    <div class="instructor"><span class="title">Instructor</span><span class="value">${section.professor}</span></div>
                </div>
            `).join('')}
        </div>
        <div class="course_tas">
            <div class="ta_details_title">
                <span>TA Details</span>
                <div class="course_ta_hours_assigned"><span class="title">TA Hours Assigned</span><span class="value">${courseDetails.ta_hours_assigned}</span></div>
            </div>
            <div class="ta_details">
                ${courseDetails.tas.map(ta => `
                    <div><span>${ta.name}</span><span>${ta.hours} Hours</span></div>
                `).join('')}
            </div>
        </div>
        <div class="course_manage_btns_container">
            <button class="delete_this_course_btn" data-course-number="${courseDetails.course_number}" data-course-name="${courseDetails.course_name}" data-course-semester="${courseDetails.semester}">
                    <span>Delete</span>
                </button>
        </div>
    `;
    setUpdeleteThisCourseBtn();
    courseDetailsContainer.style.display = 'flex';
}





function setUpdeleteThisCourseBtn() {
    const delete_this_course_btn = document.querySelectorAll('.delete_this_course_btn');
    delete_this_course_btn.forEach(button => {
        button.addEventListener('click', async function () {
            const courseName = button.getAttribute('data-course-name');
            const courseNumber = button.getAttribute('data-course-number');

            const overlay = document.createElement('div');
            overlay.classList.add('modalOverlayDeleteCourse');

            const messageContainer = document.createElement('div');
            messageContainer.classList.add('messageContainer');

            messageContainer.innerHTML = `
                <p>Are you sure you want to delete this course?</p>
                <div class="btn_container">
                    <button id="confirmDeleteBtn" class="btn">Confirm</button>
                    <button id="cancelDeleteBtn" class="btn">Cancel</button>
                </div>
            `;

            overlay.appendChild(messageContainer);
            document.body.appendChild(overlay);

            document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
                await deleteSingleCourse(courseNumber, courseName);
                document.body.querySelector('.course_details_container').style.display = 'none';
                document.body.removeChild(overlay);
            });

            document.getElementById('cancelDeleteBtn').addEventListener('click', function () {
                document.body.removeChild(overlay);
            });

        });
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
    const addSingleCourseBtn = document.getElementById('addSingleCourseBtn');

    addMultipleCoursesBtn.addEventListener('click', function () {
        const existingOverlay = document.querySelector('.multiplecoursesoverlay');
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.classList.add('multiplecoursesoverlay');

        // Set innerHTML for the overlay
        overlay.innerHTML = `
        <div class="message-container">
            <p>Please select the file:</p>
            <input type="file" id="csvFileInput" accept=".csv" />
            <div class="btn_container">
                <button class="btn" id="uploadBtn">Upload</button>
                <button class="btn" id="cancelBtn">Cancel</button>
            </div>
        </div>
    `;

        document.body.appendChild(overlay);

        document.getElementById('uploadBtn').addEventListener('click', async function () {
            await uploadCourseListFile();
            document.body.removeChild(overlay);
        });

        document.getElementById('cancelBtn').addEventListener('click', function () {
            document.body.removeChild(overlay);
        });
    });

    addSingleCourseBtn.addEventListener('click', function () {

        const existingOverlay = document.querySelector('.singlecourseoverlay');
        if (existingOverlay) {
            document.body.removeChild(existingOverlay);
        }

        const overlay = document.createElement('div');
        overlay.classList.add('singlecourseoverlay');

        overlay.innerHTML = `
        <div class="message-container">
        <p>Please Enter all the Course Details:</p>

        <!-- Input fields for course details -->
        <div class="form-group">
            <input type="text" id="courseTitle" name="courseTitle" class="form-control" placeholder="Enter course title" />
            <input type="text" id="courseName" name="courseName" class="form-control" placeholder="Enter course name" />
            <input type="text" id="courseNumber" name="courseNumber" class="form-control" placeholder="Enter course number" />
            <input type="number" id="sections" name="sections" class="form-control" placeholder="Enter number of sections" />
            <input type="number" id="taHoursTotal" name="taHoursTotal" class="form-control" placeholder="Enter total TA hours" />
        </div>

        <!-- Button container with Upload and Cancel buttons -->
        <div class="btn_container">
            <button class="btn" id="uploadSingleCourseBtn">Upload</button>
            <button class="btn" id="cancelSingleCourseUploadBtn">Cancel</button>
        </div>
    </div>
    `;
        
        document.body.appendChild(overlay);

        // Add event listeners for buttons
        document.getElementById('uploadSingleCourseBtn').addEventListener('click', async function () {
            await uploadSingleCourse();
            document.body.removeChild(overlay);
        });

        document.getElementById('cancelSingleCourseUploadBtn').addEventListener('click', function () {
            document.body.removeChild(overlay);
        });

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

    const fileInput = document.querySelector('.message-container #csvFileInput');
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






