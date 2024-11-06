document.addEventListener('DOMContentLoaded', function () {
    setUpManageCoursesBtns();
    setUpCoursesMainBtns();
});

function setUpCoursesMainBtns() {
    const coursesBtn = document.getElementById("courses_btn");
    coursesBtn.addEventListener("click", function () {
        fetchCoursesList();
    });
}

function setUpdeleteThisCourseBtn() {
    const delete_this_course_btn = document.querySelectorAll('.delete_this_course_btn');
    delete_this_course_btn.forEach(button => {
        button.addEventListener('click', async function () {
            const courseName = button.getAttribute('data-course-name');
            const courseNumber = button.getAttribute('data-course-number');
            showConfirmDeleteSingleCourseModal(courseNumber,courseName);
        });
    });
}

async function deleteSingleCourse(courseNumber, courseName) {
    try {

        const response = await fetch('/staff/delete_single_course', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json' // Ensures the server recognizes the content as JSON
            },
            body: JSON.stringify({
                courseNumber: courseNumber,  // Make sure these are not undefined
                courseName: courseName,      // Make sure these are not undefined
            })
        });

        const result = await response.json(); // Parse the JSON response

        if (response.ok) {
            // Success: Handle the successful deletion case
            alert("Course deleted successfully!");
            fetchCoursesList(); // Refresh the courses list
        } else {
            // Failure: Show a failure message
            alert(`Failed to delete course: ${result.message || 'Unknown error'}`);
        }

    } catch (error) {
        // Network or other errors
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

    const deleteSingleCourseBtn = document.getElementById('deleteSingleCourseBtn');
    const singleCourseDeleteContainer = document.querySelector('.SingleCourseDeleteContainer');
    const deleteCourseBtn = document.getElementById('deleteCourseBtn');
    const cancelDeletelSingleCourseBtn = document.getElementById('cancelDeletelSingleCourseBtn');

    // Toggle the visibility of the CoursesFileUploadContainer
    addMultipleCoursesBtn.addEventListener('click', function () {
        if (coursesFileUploadContainer.style.display === 'none' || coursesFileUploadContainer.style.display === '') {
            coursesFileUploadContainer.style.display = 'flex'; // Show the container
            addMultipleCoursesBtn.classList.add('active'); // Add "active" class
        } else {
            coursesFileUploadContainer.style.display = 'none'; // Hide the container
            addMultipleCoursesBtn.classList.remove('active'); // Remove "active" class
        }
    });

    // Hide the CoursesFileUploadContainer when "Cancel" button is clicked
    cancleFileUploadBtn.addEventListener('click', function () {
        coursesFileUploadContainer.style.display = 'none'; // Hide the container
        addMultipleCoursesBtn.classList.remove('active'); // Remove "active" class
    });

    // Logic for uploading the CSV file 
    uploadCsvBtn.addEventListener('click',async function () {

        const fileInput = document.getElementById('csvFileInput');
        const file = fileInput.files[0];

        if (file) {
            showConfirmUploadFileModal(); // Show confirmation modal before upload
            addMultipleCoursesBtn.classList.remove('active'); // Remove "active" class
            coursesFileUploadContainer.style.display = 'none'; // Hide the container
        } else {
            alert('Please select a CSV file before uploading.');
        }
    });

    addSingleCourseBtn.addEventListener('click', function () {
        if (singleCourseUploadContainer.style.display === 'none' || singleCourseUploadContainer.style.display === '') {
            singleCourseUploadContainer.style.display = 'flex'; // Show the container
            addSingleCourseBtn.classList.add('active'); // Add "active" class
        } else {
            singleCourseUploadContainer.style.display = 'none'; // Hide the container
            addSingleCourseBtn.classList.remove('active'); // Remove "active" class
        }
    });

    // Hide the SingleCourseUploadContainer when "Cancel" button is clicked
    cancelSingleCourseUploadBtn.addEventListener('click', function () {
        singleCourseUploadContainer.style.display = 'none'; // Hide the container
        addSingleCourseBtn.classList.remove('active'); // Remove "active" class
    });

    // Logic for uploading single Course
    uploadSingleCourseBtn.addEventListener('click', function () {
        const courseTitle = document.getElementById('courseTitle').value.trim();
        const courseName = document.getElementById('courseName').value.trim();
        const courseNumber = document.getElementById('courseNumber').value.trim();

        // Check if all fields are filled
        if (!courseTitle || !courseName || !courseNumber) {
            alert("Please fill in all fields before uploading the course.");
            return;
        }

        showConfirmUploadSingleCourseModal();
        addSingleCourseBtn.classList.remove('active'); // Hide the container
        singleCourseUploadContainer.style.display = 'none'; // Remove "active" class
    });

    deleteSingleCourseBtn.addEventListener('click', function () {
        if (singleCourseDeleteContainer.style.display === 'none' || singleCourseDeleteContainer.style.display === '') {
            singleCourseDeleteContainer.style.display = 'flex'; // Show the container
            deleteSingleCourseBtn.classList.add('active'); // Add "active" class
        } else {
            singleCourseDeleteContainer.style.display = 'none'; // Hide the container
            deleteSingleCourseBtn.classList.remove('active'); // Remove "active" class
        }
    });

    // Hide the "SingleCourseDeleteContainer" when "Cancel" button is clicked
    cancelDeletelSingleCourseBtn.addEventListener('click', function () {
        singleCourseDeleteContainer.style.display = 'none'; // Hide the container
        deleteSingleCourseBtn.classList.remove('active'); // Remove "active" class
    });

    // Logic for deleting single Course
    deleteCourseBtn.addEventListener('click', function () {
        const courseNumber = document.getElementById('courseNumberDelete').value.trim();
        const courseName = document.getElementById('courseNameDelete').value.trim();

        // Check if all fields are filled
        if (!courseNumber || !courseName) {
            alert("Please enter Course Number and Course Name to delete the course.");
            return;
        }

        showConfirmDeleteSingleCourseModal(courseNumber, courseName);
        singleCourseDeleteContainer.style.display = 'none'; // Hide the container
        deleteSingleCourseBtn.classList.remove('active'); // Remove "active" class
    });

}

// Confirmation modal function
function showConfirmDeleteSingleCourseModal(courseNumber, courseName) { 
    // Create the overlay
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

    // Append the modal and overlay to the body
    document.body.appendChild(overlay);
    document.body.appendChild(confirmModal);

    // Handle Yes (Confirm delete)
    document.getElementById('confirmDeleteBtn').addEventListener('click', async function () {
        deleteSingleCourse(courseNumber, courseName); // Call the upload function
        document.body.removeChild(confirmModal); // Close modal
        document.body.removeChild(overlay); // Remove overlay
    });

    // Handle No (Cancel Delete)
    document.getElementById('cancelDeleteBtn').addEventListener('click', function () {
        document.body.removeChild(confirmModal); // Close modal
        document.body.removeChild(overlay); // Remove overlay
    });

}

// Confirmation modal function
function showConfirmUploadFileModal() {
    // Create the overlay
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

    // Append the modal and overlay to the body
    document.body.appendChild(overlay);
    document.body.appendChild(confirmModal);

    // Handle Yes (Confirm Upload)
    document.getElementById('confirmUploadBtn').addEventListener('click', async function () {
        uploadCourseListFile(); // Call the upload function
        document.body.removeChild(confirmModal); // Close modal
        document.body.removeChild(overlay); // Remove overlay
    });

    // Handle No (Cancel Upload)
    document.getElementById('cancelUploadBtn').addEventListener('click', function () {
        document.body.removeChild(confirmModal); // Close modal
        document.body.removeChild(overlay); // Remove overlay
    });
}

function showConfirmUploadSingleCourseModal() {
    // Create the overlay
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

    // Append the modal and overlay to the body
    document.body.appendChild(overlay);
    document.body.appendChild(confirmModal);

    // Handle Yes (Confirm Upload)
    document.getElementById('confirmUploadBtn').addEventListener('click', async function () {
        uploadSingleCourse(); // Call the upload function
        document.body.removeChild(confirmModal); // Close modal
        document.body.removeChild(overlay); // Remove overlay
    });

    // Handle No (Cancel Upload)
    document.getElementById('cancelUploadBtn').addEventListener('click', function () {
        document.body.removeChild(confirmModal); // Close modal
        document.body.removeChild(overlay); // Remove overlay
    });
}

async function uploadSingleCourse() {

    const courseTitle = document.getElementById('courseTitle').value.trim();
    const courseName = document.getElementById('courseName').value.trim();
    const courseNumber = document.getElementById('courseNumber').value.trim();

    // Check if all fields are filled before proceeding
    if (!courseTitle || !courseName || !courseNumber) {
        alert("Please fill in all fields before uploading the course.");
        return;
    }

    try { 

        const response = await fetch('/staff/add_single_course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseTitle: courseTitle,
                courseName: courseName,
                courseNumber: courseNumber
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Handle success
            alert("Course uploaded successfully!");
            fetchCoursesList(); 
        } else {
            // Handle failure, perhaps display an error message
            alert(`Failed to upload course: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error uploading course:', error);
        alert('An error occurred while uploading the course. Please try again later.');
    }

}

async function uploadCourseListFile() {

    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0]; // Get the file from input

    if (!file) {
        alert('Please select a CSV file before uploading.');
        return;
    }

    // Create FormData object to send the file
    const formData = new FormData();
    formData.append('csvFile', file); // Append the file to the FormData

    try {
        const response = await fetch('/staff/add_multiple_courses', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert("File uploaded successfully!");
            fetchCoursesList();
        } else {
            alert("Error uploading file.");
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert("An error occurred while uploading the file.");
    }
    
}

async function fetchCoursesList() {

    try {

        const response = await fetch(`/coursesListDeptSemesterStaff`);

        if (response.redirected) {
            window.location.href = '/?sessionExpired=true'; 
            return; 
        }

        if (response.ok) {
            const courses = await response.json();
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

// Function to update the DOM with fetched courses
function updateCoursesList(courses) {
    const coursesListContainer = document.querySelector('.courses_list_container');
    coursesListContainer.innerHTML = ''; // Clear the current list

    if (courses.length > 0) {
        courses.forEach(course => {
            const courseContainer = document.createElement('div');
            courseContainer.classList.add('course_container');
            courseContainer.dataset.semester = course.semester;

            courseContainer.innerHTML = `
                <div class="course_title">
                    <span>${course.course_title}</span>
                </div>
                <div class="course_name">
                    <span class="value">${course.course_name}</span>
                </div>
                <div class="course_number">
                    <span class="value">${course.course_number}</span>
                </div>
                <div class="course_total_applications" style="display:none">
                    <button class="count_of_applications_btn btn-link" type="button" data-course-title="${course.course_title}" data-total-applications="${course.total_applications}" data-shortlisted-applications="${course.shortlisted_applications}" data-selected-applications="${course.selected_applications}" data-notified-applications="${course.notified_applications}"><span class="value">Total Applications: ${course.total_applications}</span></button>
                </div>
                <button class="delete_this_course_btn btn btn-secondary" data-course-number="${course.course_number}" data-course-name="${course.course_name}">
                    <span>Delete</span>
                </button>
            `;
            coursesListContainer.appendChild(courseContainer);
        });
        setUpdeleteThisCourseBtn();
        setUpCountOfApplicationsBtn();
    } else {
        showNoCoursesMessage();
    }
}

function setUpCountOfApplicationsBtn() {
    const count_of_applications_btns = document.querySelectorAll('.count_of_applications_btn');
    count_of_applications_btns.forEach(button => {
        button.addEventListener('click', function () {
            const courseTitle = button.getAttribute('data-course-title');
            const totalApplications = button.getAttribute('data-total-applications');
            const shortlistedApplications = button.getAttribute('data-shortlisted-applications');
            const selectedApplications = button.getAttribute('data-selected-applications');
            const notifiedApplications = button.getAttribute('data-notified-applications');

            // Call the modal function with course title and application counts
            showNoOfApplicationsForCourseModal(courseTitle, totalApplications, shortlistedApplications, selectedApplications, notifiedApplications);
        });
    });
}


function showNoOfApplicationsForCourseModal(courseTitle, totalApplications, shortlistedApplications, selectedApplications, notifiedApplications) {
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    // Create the modal container
    const applicationsModal = document.createElement('div');
    applicationsModal.classList.add('applications-modal');
    applicationsModal.innerHTML = `
        <div class="modal-content">
            <h3 style="white-space: nowrap;">${courseTitle}</h3>
            <div class="application-details">
                <p>Total Applications Received: ${totalApplications}</p>
                <p>Shortlisted Applications: ${shortlistedApplications}</p>
                <p>Selected Applications: ${selectedApplications}</p>
                <p>Notified Applications: ${notifiedApplications}</p>
            </div>
            <button id="closeModalBtn" class="btn btn-danger" style="float: right; padding-right: 10px;">Close</button>
        </div>
    `;

    // Append the modal and overlay to the body
    document.body.appendChild(overlay);
    document.body.appendChild(applicationsModal);

    // Handle Close button click
    document.getElementById('closeModalBtn').addEventListener('click', function () {
        document.body.removeChild(applicationsModal); // Close modal
        document.body.removeChild(overlay); // Remove overlay
    });

    // Handle overlay click to close the modal
    overlay.addEventListener('click', function () {
        document.body.removeChild(applicationsModal); // Close modal
        document.body.removeChild(overlay); // Remove overlay
    });
}




// Function to show 'No courses available' message
function showNoCoursesMessage() {
    const coursesListContainer = document.querySelector('.courses_list_container');
    coursesListContainer.innerHTML = '<p>No courses available. Please upload csv File to Upload the courses List</p>';
}






