document.addEventListener("DOMContentLoaded", () => {
    setUpAccountMainBtn();
});



async function setUpAccountMainBtn() {
    const accountBtn = document.getElementById("account_btn");
    accountBtn.addEventListener("click", async () => {
        await fetchStudentDetails();
        setUpEditSaveProfileBtn();
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

async function fetchCoursePrograms() {
    const response = await fetch('/courseProgramList');
    const data = await response.json();

    const courseProgramList = [];
    data.forEach(program => {
        courseProgramList.push({
            abbreviation: program.courseprogram_abbre,
            name: program.courseprogram_name
        });
    });

    return courseProgramList;
}

async function fetchCurrentYear() {
    const response = await fetch('/currentYear'); // Replace with your endpoint
    const data = await response.json();
    return data.currentYear; // Adjust based on your response structure
}



async function fetchStudentDetails() {
    try {
        const response = await fetch('/studentDetails');
        if (response.ok) {
            const studentDetails = await response.json();
            updateStudentDetailsContainer(studentDetails);
            toggleAdvisorFields(studentDetails.graduateprogram);
        } else {
            updateStudentDetailsContainer(null);
            alert("Error Retrieving Profile, Try Again Later");
        }
    } catch (error) {
        console.error('Network error:', error);
        updateStudentDetailsContainer(null);
        alert("Network error, please try again later.");
    }
}

async function updateStudentDetailsContainer(details) {

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
        'courseprogram': '.student_information_container .courseprogram .value',
        'gpa': '.student_information_container .gpa .value',
        'enrollementstatus': '.student_information_container .enrollementstatus .value',
        'citizenshipstatus': '.student_information_container .citizenship .value',
        'creditscompletedatfau': '.student_information_container .creditscompleted .value',
        'creditsplannedtoregisterforupcomingsemester': '.student_information_container .creditsplannedtoregister .value',
        'workedforfau': '.student_information_container .workedforfau .value',
        'externalwork': '.student_information_container .externalwork .value',
        'hoursofexternalwork': '.student_information_container .hoursofexternalwork .value',
    };

    for (const key in fields) {
        const container = document.querySelector(fields[key]);
        if (container) {
            let value = details && details[key] ? details[key] : 'Not Available';

            if (key === 'workedforfau') {
                value = details[key] ? 'Yes' : 'No';
            }

            if (key === 'externalwork') {
                value = details[key] ? 'Yes' : 'No';
            }

            container.textContent = value;
        }
    }

    const isExternalWork = details['externalwork'];
    toggleNumberOfExternalWorkHours(isExternalWork);

    document.querySelector('.student_information_container .netid .value').textContent = details['netid'];

    const coursePrograms = await fetchCoursePrograms();
    const courseProgramContainer = document.querySelector('.student_information_container .courseprogram .value');

    if (details['courseprogram'] && courseProgramContainer) {
        const selectedProgram = coursePrograms.find(
            program => program.abbreviation === details['courseprogram']
        );

        if (selectedProgram) {
            courseProgramContainer.textContent = `${selectedProgram.abbreviation} - ${selectedProgram.name}`;
        } else {
            courseProgramContainer.textContent = 'Not Available';
        }
    }

    const programstartdate_semester = document.querySelector('.programstartdate_semester');
    const programstartdate_year = document.querySelector('.programstartdate_year');
    const expectedgraduationdate_month = document.querySelector('.expectedgraduationdate_month');
    const expectedgraduationdate_year = document.querySelector('.expectedgraduationdate_year');

    if (details['programstartdate'] === '') {
        programstartdate_semester.textContent = "Not available";
        programstartdate_year.textContent = '';
    } else {
        programstartdate_semester.textContent = details['programstartdate'].split(" ")[0];
        programstartdate_year.textContent = details['programstartdate'].split(" ")[1];
    }

    if (details['expectedgraduationdate'] === '') {
        expectedgraduationdate_month.textContent = "Not available";
        expectedgraduationdate_year.textContent = '';
    } else {
        expectedgraduationdate_month.textContent = details['expectedgraduationdate'].split(" ")[0];
        expectedgraduationdate_year.textContent = details['expectedgraduationdate'].split(" ")[1];
    }

    document.querySelector('.student_information_container .netid .value').textContent = details['netid'];

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

function toggleNumberOfExternalWorkHours(isExternalWork) {
    const hoursofexternalwork = document.querySelector('.student_information_container .hoursofexternalwork');
    if (!hoursofexternalwork) return;
    hoursofexternalwork.style.display = isExternalWork ? 'grid' : 'none';
}






function setUpEditSaveProfileBtn() {
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.querySelector('.student_account_header button:nth-child(3)');

    editBtn.addEventListener('click', function () {
        editBtn.style.display = 'none';
        saveBtn.style.display = "inline-block";
        replaceTextWithInputs();
    });

    saveBtn.addEventListener('click', function () {
        editBtn.style.display = "inline-block"
        saveBtn.style.display = 'none';
        saveProfileData();
    });
}

async function replaceTextWithInputs() {

    textToInput('.name');
    textToInput('.znumber');
    textToInput('.emailid');
    textToInput('.mobilenumber');
    textToInput('.advisorname');
    textToInput('.advisoremail');
    textToInput('.gpa', 'number');  // GPA as number input
    textToInput('.creditscompleted', 'number');
    textToInput('.creditsplannedtoregister', 'number');
    textToInput('.hoursofexternalwork', 'number');

    textToRatio('.workedforfau');

    await textToRatio('.externalwork');
    setUpExternalWorkRadioChanges();

    const currentYear = await fetchCurrentYear();

    await handleProgramStartDate(currentYear);
    await handleExpectedGraduationDate(currentYear);

    const departments = await fetchDepartments();
    document.querySelector('.dept .value').innerHTML = createDropdown('dept', departments);

    const coursePrograms = await fetchCoursePrograms();
    document.querySelector('.courseprogram .value').innerHTML = createCourseProgramDropdown('courseprogram', coursePrograms);

    const graduateProgramOptions = ['PHD Thesis', 'PHD Thesis ( Advisor Unknown )', 'MS Thesis', 'MS Thesis ( Advisor Unknown )', 'MS Non Thesis', 'Combined BS/MS', 'Undergraduate (UG)'];
    document.querySelector('.graduateprogram .value').innerHTML = createDropdown('graduateprogram', graduateProgramOptions);

    const enrollementStatusOptions = ['Continuing student', 'New Student'];
    document.querySelector('.enrollementstatus .value').innerHTML = createDropdown('enrollementstatus', enrollementStatusOptions);

    const citizenshipOptions = ['International', 'Citizen'];
    document.querySelector('.citizenship .value').innerHTML = createDropdown('citizenship', citizenshipOptions);

    const resumeContainer = document.querySelector('.resume .value');
    resumeContainer.innerHTML = `<input type="file" name="resume" accept="application/pdf">`;

    const transcriptsContainer = document.querySelector('.transcripts .value');
    transcriptsContainer.innerHTML = `<input type="file" name="transcripts" accept="application/pdf">`;

    const graduateProgramSelect = document.querySelector('.graduateprogram select');
    toggleAdvisorFields(graduateProgramSelect.value);
    setUpGraduateProgramDropdownChanges();

}

function textToInput(selector, type = 'text') {
    const element = document.querySelector(selector + ' .value');
    if (!element) return;
    const currentValue = element.textContent.trim();
    element.innerHTML = `<input type="${type}" value="${currentValue}">`;
}

async function textToRatio(selector) {
    const element = document.querySelector(selector + ' .value');
    if (!element) return;
    const currentValue = element.textContent.trim().toLowerCase() === 'yes';
    element.innerHTML = `
        <label>
            <input type="radio" name="${selector}" value="true" ${currentValue ? 'checked' : ''}> Yes
        </label>
        <label>
            <input type="radio" name="${selector}" value="false" ${!currentValue ? 'checked' : ''}> No
        </label>
    `;
}

function createDropdown(name, options) {
    let dropdown = `<select name="${name}">`;
    options.forEach(option => {
        dropdown += `<option value="${option}">${option}</option>`;
    });
    dropdown += `</select>`;
    return dropdown;
}

function createCourseProgramDropdown(name, options) {
    let dropdown = `<select name="${name}">`;
    options.forEach(option => {
        dropdown += `<option value="${option.abbreviation}">${option.abbreviation} - ${option.name}</option>`;
    });
    dropdown += `</select>`;
    return dropdown;
}

function setUpExternalWorkRadioChanges() {
    const externalWorkRadios = document.querySelectorAll('input[name=".externalwork"]');
    externalWorkRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            const isExternalWork = document.querySelector('input[name=".externalwork"]:checked').value === 'true';
            toggleNumberOfExternalWorkHours(isExternalWork);
        });
    });
}

function setUpGraduateProgramDropdownChanges() {
    const graduateProgramDropdown = document.querySelector('.graduateprogram select');
    graduateProgramDropdown.addEventListener('change', function () {
        toggleAdvisorFields(graduateProgramDropdown.value);
    });
}

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




async function saveProfileData() {

    const gatherInputValue = (selector) => {
        const inputElement = document.querySelector(selector + ' input');
        return inputElement ? inputElement.value.trim() : null;  // Return null if element not found
    };

    const gatherSelectValue = (selector) => {
        const selectElement = document.querySelector(selector + ' select');
        return selectElement ? selectElement.value : null;  // Return null if element not found
    };

    const gatherRadioValue = (selector) => {
        const radioElements = document.querySelectorAll(selector + ' input[type="radio"]');
        for (const radio of radioElements) {
            if (radio.checked) {
                return radio.value === 'true'; // Convert to boolean
            }
        }
        return null; // Return null if no selection
    };

    const profileData = {
        name: gatherInputValue('.name'),
        znumber: gatherInputValue('.znumber'),
        email: gatherInputValue('.emailid'),
        mobilenumber: gatherInputValue('.mobilenumber'),
        graduateprogram: gatherSelectValue('.graduateprogram'),
        advisorname: gatherInputValue('.advisorname'),
        advisoremail: gatherInputValue('.advisoremail'),
        department: gatherSelectValue('.dept'),
        courseprogram: gatherSelectValue('.courseprogram'),
        gpa: gatherInputValue('.gpa'),
        enrollementstatus: gatherSelectValue('.enrollementstatus'),
        citizenshipstatus: gatherSelectValue('.citizenship'),
        creditscompleted: gatherInputValue('.creditscompleted'),
        creditsplannedtoregister: gatherInputValue('.creditsplannedtoregister'),
        semesterstartdate: `${gatherSelectValue('.programstartdate_semester')} ${gatherSelectValue('.programstartdate_year')}`,
        expectedgraduationdate: `${gatherSelectValue('.expectedgraduationdate_month')} ${gatherSelectValue('.expectedgraduationdate_year')}`,
        workedforfau: gatherRadioValue('.workedforfau'),
        externalwork: gatherRadioValue('.externalwork'),
        hoursofexternalwork: gatherInputValue('.hoursofexternalwork'),
    };

    const filteredProfileData = {};
    for (const key in profileData) {
        if (profileData[key] !== null && profileData[key] !== '') {
            filteredProfileData[key] = profileData[key];
        }
    }

    const formData = new FormData();

    for (const key in filteredProfileData) {
        if (filteredProfileData.hasOwnProperty(key)) {
            formData.append(key, filteredProfileData[key]);
        }
    }

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
            await fetchStudentDetails();
        } else {
            alert("Error updating profile, Try Again Later");
            console.error('Error updating profile:', response.statusText);
        }
    } catch (error) {
        console.error('Network error:', error);
        alert("Network error, please try again later.");
    }

}
