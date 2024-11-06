document.addEventListener("DOMContentLoaded", () => {
    setUpAccountMainBtn();
    setUpEditSaveProfileBtn();
});

async function setUpAccountMainBtn() {
    const accountBtn = document.getElementById("account_btn");
    accountBtn.addEventListener("click", () => {
        fetchStudentDetails();
    });
}

async function fetchDepartments() {
    const response = await fetch('/departmentList'); // Replace with your endpoint
    const data = await response.json();

    const departmentAbbreList = [];
    data.forEach(dept => {
        departmentAbbreList.push(dept.department_abbre); // Push only the abbreviation
    });

    return departmentAbbreList; // Return the list of department abbreviations
}

async function fetchCurrentYear() {
    const response = await fetch('/currentYear'); // Replace with your endpoint
    const data = await response.json();
    return data.currentYear; // Adjust based on your response structure
}

// Function to hide or show advisor fields based on graduate program
function toggleAdvisorFields(graduateProgram) {
    const advisorNameDiv = document.querySelector('.advisorname');
    const advisorEmailDiv = document.querySelector('.advisoremail');

    if (graduateProgram === 'PHD Thesis' || graduateProgram === 'MS Thesis') {
        advisorNameDiv.style.display = 'grid';
        advisorEmailDiv.style.display = 'grid';
    } else {
        advisorNameDiv.style.display = 'none';
        advisorEmailDiv.style.display = 'none';
    }
}

function setUpGraduateProgramDropdownChanges() {
    const graduateProgramDropdown = document.querySelector('.graduateprogram select');
    graduateProgramDropdown.addEventListener('change', function () {
        toggleAdvisorFields(graduateProgramDropdown.value);
    });
}

function setUpEditSaveProfileBtn() {
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.querySelector('.student_account_header button:nth-child(3)');

    editBtn.addEventListener('click', function () {
        editBtn.style.display = 'none';  // Hide the Edit button
        saveBtn.style.display = "inline-block";  // Show the Save button
        replaceTextWithInputs(); // Call to replace text with input fields
    });

    saveBtn.addEventListener('click', function () {
        editBtn.style.display = "inline-block"
        saveBtn.style.display = 'none';  // Hide the Save button
        saveProfileData(); // Call to save profile data
        fetchStudentDetails();
    });
}

// Function to create dropdown HTML structure
function createDropdown(name, options) {
    let dropdown = `<select name="${name}">`;
    options.forEach(option => {
        dropdown += `<option value="${option}">${option}</option>`;
    });
    dropdown += `</select>`;
    return dropdown;
}

// Replaces text content with an input field
function textToInput(selector, type = 'text') {
    const element = document.querySelector(selector + ' .value');
    if (!element) return;
    const currentValue = element.textContent.trim();
    element.innerHTML = `<input type="${type}" value="${currentValue}">`;
}

// Function to handle Program Start Date dropdowns
async function handleProgramStartDate(currentYear) {
    const programStartDateSemesterDiv = document.querySelector('.programstartdate_semester');
    const programStartDateYearDiv = document.querySelector('.programstartdate_year');

    const startOfProgramOptions = ['Fall', 'Spring', 'Summer'];
    const startYearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

    if (programStartDateSemesterDiv) {
        programStartDateSemesterDiv.innerHTML = createDropdown('programstartdate_semester', startOfProgramOptions);
    }
    if (programStartDateYearDiv) {
        programStartDateYearDiv.innerHTML = createDropdown('programstartdate_year', startYearOptions);
    }
}

// Function to handle Expected Graduation Date dropdowns
async function handleExpectedGraduationDate(currentYear) {
    const expectedGraduationDateMonthDiv = document.querySelector('.expectedgraduationdate_month');
    const expectedGraduationDateYearDiv = document.querySelector('.expectedgraduationdate_year');

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const futureYearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);

    if (expectedGraduationDateMonthDiv) {
        expectedGraduationDateMonthDiv.innerHTML = createDropdown('expectedgraduationdate_month', months);
    }
    if (expectedGraduationDateYearDiv) {
        expectedGraduationDateYearDiv.innerHTML = createDropdown('expectedgraduationdate_year', futureYearOptions);
    }
}

async function replaceTextWithInputs() {

    // Text fields to input
    textToInput('.name');
    textToInput('.znumber');
    textToInput('.emailid');
    textToInput('.mobilenumber');
    textToInput('.advisorname');
    textToInput('.advisoremail');
    textToInput('.gpa', 'number');  // GPA as number input
    textToInput('.creditscompleted', 'number');
    textToInput('.creditsplannedtoregister', 'number');

    // Other logic for different fields like name, email, etc.
    const currentYear = await fetchCurrentYear();

    // Call the functions separately for program start and graduation date
    await handleProgramStartDate(currentYear);
    await handleExpectedGraduationDate(currentYear);

    // Other dropdown handling like department, graduate program, etc.
    const departments = await fetchDepartments();
    document.querySelector('.dept .value').innerHTML = createDropdown('dept', departments);

    const graduateProgramOptions = ['PHD Thesis', 'PHD Thesis ( Advisor Unknown )', 'MS Thesis', 'MS Thesis ( Advisor Unknown )', 'MS Non Thesis', 'Combined BS/MS', 'Undergraduate (UG)'];
    document.querySelector('.graduateprogram .value').innerHTML = createDropdown('graduateprogram', graduateProgramOptions);

    const enrollementStatusOptions = ['Continuing student', 'New Student'];
    document.querySelector('.enrollementstatus .value').innerHTML = createDropdown('enrollementstatus', enrollementStatusOptions);

    const citizenshipOptions = ['International', 'Citizen'];
    document.querySelector('.citizenship .value').innerHTML = createDropdown('citizenship', citizenshipOptions);

    // Handle file inputs for resume and transcripts
    const resumeContainer = document.querySelector('.resume .value');
    resumeContainer.innerHTML = `<input type="file" name="resume" accept="application/pdf">`;

    const transcriptsContainer = document.querySelector('.transcripts .value');
    transcriptsContainer.innerHTML = `<input type="file" name="transcripts" accept="application/pdf">`;

    // Initial check after replacing text with dropdown
    const graduateProgramSelect = document.querySelector('.graduateprogram select');
    toggleAdvisorFields(graduateProgramSelect.value);  // Check and toggle the advisor fields
    setUpGraduateProgramDropdownChanges();  // Handle future changes

}

// Utility function to create dropdown HTML
function createDropdown(name, options) {
    let dropdown = `<select name="${name}">`;
    options.forEach(option => {
        dropdown += `<option value="${option}">${option}</option>`;
    });
    dropdown += `</select>`;
    return dropdown;
}

async function saveProfileData() {

    // Function to handle saving profile data
    // Gather data from inputs and send it to the backend (e.g., using Fetch API)

    // Function to gather values from input fields or select dropdowns
    const gatherInputValue = (selector) => {
        const inputElement = document.querySelector(selector + ' input');
        return inputElement ? inputElement.value.trim() : null;  // Return null if element not found
    };

    const gatherSelectValue = (selector) => {
        const selectElement = document.querySelector(selector + ' select');
        return selectElement ? selectElement.value : null;  // Return null if element not found
    };

    // Construct the profileData object with gathered values
    const profileData = {
        name: gatherInputValue('.name'),
        znumber: gatherInputValue('.znumber'),
        email: gatherInputValue('.emailid'),
        mobilenumber: gatherInputValue('.mobilenumber'),
        graduateprogram: gatherSelectValue('.graduateprogram'),
        advisorname: gatherInputValue('.advisorname'),
        advisoremail: gatherInputValue('.advisoremail'),
        department: gatherSelectValue('.dept'),
        gpa: gatherInputValue('.gpa'),
        enrollementstatus: gatherSelectValue('.enrollementstatus'),
        citizenshipstatus: gatherSelectValue('.citizenship'),
        creditscompleted: gatherInputValue('.creditscompleted'),
        creditsplannedtoregister: gatherInputValue('.creditsplannedtoregister'),
        semesterstartdate: `${gatherSelectValue('.programstartdate_semester')} ${gatherSelectValue('.programstartdate_year')}`,
        expectedgraduationdate: `${gatherSelectValue('.expectedgraduationdate_month')} ${gatherSelectValue('.expectedgraduationdate_year')}`,
    };

    // Filter out any null values from profileData
    const filteredProfileData = {};
    for (const key in profileData) {
        if (profileData[key] !== null && profileData[key] !== '') {
            filteredProfileData[key] = profileData[key];
        }
    }

    // Create FormData object
    const formData = new FormData();

    // Append profileData fields to the FormData object
    for (const key in filteredProfileData) {
        if (filteredProfileData.hasOwnProperty(key)) {
            formData.append(key, filteredProfileData[key]);
        }
    }

    // Append the file inputs if available
    const resumeInput = document.querySelector("input[name='resume']");
    const transcriptsInput = document.querySelector("input[name='transcripts']");

    if (resumeInput && resumeInput.files.length > 0) {
        formData.append('resume', resumeInput.files[0]);
    }

    if (transcriptsInput && transcriptsInput.files.length > 0) {
        formData.append('transcripts', transcriptsInput.files[0]);
    }


    try {
        const response = await fetch('/updateStudentDetails', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert("Profile updated successfully");
            fetchStudentDetails();
        } else {
                alert("Error updating profile, Try Again Later");
                console.error('Error updating profile:', response.statusText);
        }
    } catch (error) {
        console.error('Network error:', error);
        alert("Network error, please try again later.");
    }
    
}

async function fetchStudentDetails() {
    try {
        const response = await fetch('/studentDetails');
        if (response.ok) {
            const studentDetails = await response.json();
            updateStudentDetailsContainer(studentDetails);

            // Toggle advisor fields based on graduate program
            toggleAdvisorFields(studentDetails.graduateprogram);
        } else {
            updateStudentDetailsContainer(null);  // In case of error, pass null
            alert("Error Retrieving Profile, Try Again Later");
        }
    } catch (error) {
        console.error('Network error:', error);
        const response = await fetch('/studentNetid');
        const studentDetails = await response.json();
        updateStudentDetailsContainer(studentDetails);  // In case of error, pass null
        alert("Network error, please try again later.");
    }
}

function updateStudentDetailsContainer(details) {

    const fields = {
        'name': '.student_information_container .name .value',
        'netid': '.student_information_container .netid .value',
        'znumber': '.student_information_container .znumber .value',
        'email': '.student_information_container .emailid .value',
        'mobilenumber': '.student_information_container .mobilenumber .value',
        'graduateprogram': '.student_information_container .graduateprogram .value',
        'advisorname': '.student_information_container .advisorname .value',
        'advisoremail': '.student_information_container .advisoremail .value',
        'department': '.student_information_container .dept .value',
        'gpa': '.student_information_container .gpa .value',
        'enrollementstatus': '.student_information_container .enrollementstatus .value',
        'citizenshipstatus': '.student_information_container .citizenship .value',
        'creditscompletedatfau': '.student_information_container .creditscompleted .value',
        'creditsplannedtoregisterforupcomingsemester': '.student_information_container .creditsplannedtoregister .value',
    };

    // Loop through each field and update the content
    for (const key in fields) {
        const container = document.querySelector(fields[key]);
        if (container) {
            const value = details && details[key] ? details[key] : 'Not Available';
            container.textContent = value;
        }
    }

    document.querySelector('.student_information_container .netid .value').textContent = details['netid'];

    const programstartdate_semester = document.querySelector('.programstartdate_semester');
    const programstartdate_year = document.querySelector('.programstartdate_year');
    const expectedgraduationdate_month = document.querySelector('.expectedgraduationdate_month');
    const expectedgraduationdate_year = document.querySelector('.expectedgraduationdate_year');

    programstartdate_semester.textContent = details['programstartdate'].split(" ")[0];
    programstartdate_year.textContent = details['programstartdate'].split(" ")[1];
    expectedgraduationdate_month.textContent = details['expectedgraduationdate'].split(" ")[0];
    expectedgraduationdate_year.textContent = details['expectedgraduationdate'].split(" ")[1];

    document.querySelector('.student_information_container .netid .value').textContent = details['netid'];

    // Handle dynamic creation of resume and transcripts links
    const resumeLinkContainer = document.querySelector('.resume .value');
    const transcriptsLinkContainer = document.querySelector('.transcripts .value');

    if (details && details['netid']) {
        const netid = details['netid'];
        resumeLinkContainer.innerHTML = `<a target="_blank" href="/resume/${netid}.pdf" id="resume-link"><span>View Resume</span></a>`;
        transcriptsLinkContainer.innerHTML = `<a target="_blank" href="/transcripts/${netid}.pdf" id="transcripts-link"><span>View Transcripts</span></a>`;
    } else {
        resumeLinkContainer.innerHTML = '<span>Not Available</span>';
        transcriptsLinkContainer.innerHTML = '<span>Not Available</span>';
    }

}
