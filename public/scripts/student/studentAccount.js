document.addEventListener("DOMContentLoaded", () => {
    setUpAccountMainBtn();
});

async function setUpAccountMainBtn() {
    const accountBtn = document.getElementById("account_btn");
    accountBtn.addEventListener("click", async () => {
        await fetchStudentNetid();
        await fetchStudentMainDetails();
        await fetchResumeAndTranscripts();
        await fetchStudentDetails();
        setUpEditSaveProfileBtn();
    });
}

async function fetchStudentNetid() {
    try {
        const response = await fetch('/studentNetid');
        if (response.ok) {
            const netid = await response.json();
            document.querySelector('.student_information_container .netid .value').textContent = netid;
        } else {
            window.location.href = "/?sessionExpired=true"; 
        }
    } catch (error) {
        window.location.href = "/?sessionExpired=true"; 
    }
}

async function fetchStudentMainDetails() {
    try {
        const response = await fetch('/studentMainDetails');
        if (response.ok) {
            const studentDetails = await response.json();
            await updateStudentMainDetailsContainer(studentDetails);
        } else {
            updateStudentMainDetailsContainer(null);
            alert("Error Retrieving Profile, Try Again Later");
        }
    } catch (error) {
        console.error('Network error:', error);
        updateStudentMainDetailsContainer(null);
        alert("Network error, please try again later.");
    }

}

async function updateStudentMainDetailsContainer(details) {
    const fields = {
        'name': '.student_information_container .name .value',
        'znumber': '.student_information_container .znumber .value',
        'email': '.student_information_container .emailid .value',
    };

    for (const key in fields) {
        const container = document.querySelector(fields[key]);
        if (container) {
            let value = details && details[key] ? details[key] : 'Not Available';
            container.textContent = value;
        }
    }

}






async function fetchResumeAndTranscripts() {

    const resumeContainer = document.querySelector('.resume .value');
    const resumeFileName = await fetchResumeFileName();

    resumeContainer.innerHTML = `
        <div id="new_resume_input">
            <input type="file" name="resume" accept="application/pdf">
            <button class="uploadResume btn btn-primary">Upload</button>
        </div>
    `;

    if (resumeFileName !== "not_available") {
        const croppedName = cropFileName(resumeFileName);
        resumeContainer.innerHTML += `
            <div>
                <span class="resume_name">${croppedName}</span>
                <a target="_blank" href="/resume/${resumeFileName}" id="resume-link"><span>View</span></a>
                <button class="deleteResumeBtn btn btn-secondary" data-filename="${resumeFileName}">Delete</button>
            </div>
        `;
    } else {
        resumeContainer.innerHTML += '<span>No resume found</span>';
    }

    const uploadResumeBtn = document.querySelector(".uploadResume");
    uploadResumeBtn.addEventListener("click", async () => {
        await uploadResume();
    });

    const deleteResumeBtn = document.querySelector('.deleteResumeBtn');
    if (deleteResumeBtn) {
        deleteResumeBtn.addEventListener('click', async (event) => {
            const filename = event.target.getAttribute('data-filename');
            showDeleteConfirmationOverlay('resume', filename);
        });
    }

    const transcriptsContainer = document.querySelector('.transcripts .value');
    const transcriptFiles = await fetchTranscripts();

    transcriptsContainer.innerHTML = `
        <div id="new_transcript_input">
            <input type="file" name="transcripts" accept="application/pdf">
            <button class="uploadTranscript btn btn-primary">Upload</button>
        </div>
    `;

    if (transcriptFiles.length === 0) {
        transcriptsContainer.innerHTML += `<span>No transcripts uploaded</span>`;
    } else {
        transcriptFiles.forEach(transcript => {
            const croppedName = cropFileName(transcript);
            const transcriptLink = document.createElement('div');
            transcriptLink.innerHTML += `
                <span class="transcript_name">${croppedName}</span>
                <a target="_blank" href="/transcripts/${transcript}" id="transcripts-link"><span>View</span></a>
                <button class="deleteTranscriptBtn btn btn-secondary" data-filename="${transcript}">Delete</button>
            `;
            transcriptsContainer.appendChild(transcriptLink);
        });
    }

    const uploadTranscriptBtn = document.querySelector(".uploadTranscript");
    uploadTranscriptBtn.addEventListener("click", async () => {
        await uploadTranscript();
    });

    const deleteTranscriptBtns = document.querySelectorAll('.deleteTranscriptBtn');
    deleteTranscriptBtns.forEach(btn => {
        btn.addEventListener('click', async (event) => {
            const filename = event.target.getAttribute('data-filename');
            showDeleteConfirmationOverlay('transcript', filename);
        });
    });

}

async function fetchResumeFileName() {
    const response = await fetch('/fetchResumeFileName');
    if (!response.ok) {
        throw new Error('Failed to fetch resume file name');
    }

    const data = await response.json();
    return data.resume || "not_available"; // Ensure the return value is "not_available" if there's no resume
}

async function fetchTranscripts() {
    const response = await fetch('/fetchTranscripts');
    const data = await response.json();
    return data.transcripts || []; // Ensure the response contains the transcript filenames
}

async function uploadResume() {
    const resumeInput = document.querySelector("input[name='resume']");
    if (!resumeInput || resumeInput.files.length === 0) return;

    const formData = new FormData();
    formData.append('resume', resumeInput.files[0]);

    try {
        const response = await fetch('/uploadResume', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert("Resume uploaded successfully");
            await fetchResumeAndTranscripts();
        } else {
            alert("Error uploading resume");
        }
    } catch (error) {
        console.error("Network error during resume upload:", error);
        alert("Network error, please try again later.");
    }
}

async function uploadTranscript() {
    const transcriptInput = document.querySelector("input[name='transcripts']");
    if (!transcriptInput || transcriptInput.files.length === 0) return;

    const formData = new FormData();
    formData.append('transcripts', transcriptInput.files[0]);

    try {
        const response = await fetch('/uploadTranscript', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert("Transcript uploaded successfully");
            await fetchResumeAndTranscripts();
        } else {
            alert("Error uploading transcript");
        }
    } catch (error) {
        console.error("Network error during transcript upload:", error);
        alert("Network error, please try again later.");
    }
}

function cropFileName(filename) {
    if (!filename) {
        return ''; 
    }

    const parts = filename.split("_");
    return parts.length > 1 ? parts.slice(1).join("_") : filename;
}

function showDeleteConfirmationOverlay(type, filename) {
    const overlay = document.createElement('div');
    overlay.classList.add('delete_file_confirmation_overlay');
    overlay.innerHTML = `
        <div class="message">
            <p>Are you sure you want to delete this ${type}?</p>
            <button class="confirmDeleteBtn btn btn-danger">Confirm</button>
            <button class="cancelDeleteBtn btn btn-secondary">Cancel</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Handle Confirm Button
    overlay.querySelector('.confirmDeleteBtn').addEventListener('click', async () => {
        const result = type === 'resume' ? await deleteResume(filename) : await deleteTranscript(filename);
        if (result.success) {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
            overlay.remove(); // Close overlay
            await fetchResumeAndTranscripts(); // Refresh content
        } else {
            alert(`Error deleting ${type}`);
        }
    });

    // Handle Cancel Button
    overlay.querySelector('.cancelDeleteBtn').addEventListener('click', () => {
        overlay.remove(); // Close overlay
    });
}

async function deleteResume(filename) {

    const response = await fetch('/deleteResume', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
        return { success: false };
    }

    return { success: true };
}

async function deleteTranscript(filename) {

    const response = await fetch('/deleteTranscript', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
    });

    if (!response.ok) {
        return { success: false };
    }

    return { success: true };
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
    const saveBtn = document.getElementById('saveProfileBtn');

    // Remove any existing event listeners
    editBtn.replaceWith(editBtn.cloneNode(true));
    saveBtn.replaceWith(saveBtn.cloneNode(true));

    // Re-select the buttons after replacing
    const newEditBtn = document.getElementById('editProfileBtn');
    const newSaveBtn = document.getElementById('saveProfileBtn');

    newEditBtn.addEventListener('click', function () {
        newEditBtn.style.display = 'none';
        newSaveBtn.style.display = "inline-block";
        replaceTextWithInputs();
    });

    newSaveBtn.addEventListener('click', function () {
        newEditBtn.style.display = "inline-block";
        newSaveBtn.style.display = 'none';
        saveProfileData();
    });
}

async function replaceTextWithInputs() {

    textToInput('.mobilenumber');

    const graduateProgramOptions = ['PHD Thesis', 'PHD Thesis ( Advisor Unknown )', 'MS Thesis', 'MS Thesis ( Advisor Unknown )', 'MS Non Thesis', 'Combined BS/MS', 'Undergraduate (UG)'];
    document.querySelector('.graduateprogram .value').innerHTML = createDropdown('graduateprogram', graduateProgramOptions);
    const graduateProgramSelect = document.querySelector('.graduateprogram select');
    toggleAdvisorFields(graduateProgramSelect.value);
    setUpGraduateProgramDropdownChanges();

    textToInput('.advisorname');
    textToInput('.advisoremail');

    const departments = await fetchDepartments();
    document.querySelector('.dept .value').innerHTML = createDropdown('dept', departments);

    const coursePrograms = await fetchCoursePrograms();
    document.querySelector('.courseprogram .value').innerHTML = createCourseProgramDropdown('courseprogram', coursePrograms);

    textToInput('.gpa', 'number'); 

    const enrollementStatusOptions = ['Continuing student', 'New Student'];
    document.querySelector('.enrollementstatus .value').innerHTML = createDropdown('enrollementstatus', enrollementStatusOptions);

    const citizenshipOptions = ['International', 'Citizen'];
    document.querySelector('.citizenship .value').innerHTML = createDropdown('citizenship', citizenshipOptions);


    const currentYear = await fetchCurrentYear();
    await handleProgramStartDate(currentYear);
    await handleExpectedGraduationDate(currentYear);

    textToInput('.creditscompleted', 'number');
    textToInput('.creditsplannedtoregister', 'number');

    textToRadio('.workedforfau');
    await textToRadio('.externalwork');

    textToInput('.hoursofexternalwork', 'number');
    setUpExternalWorkRadioChanges();

}

function textToInput(selector, type = 'text') {
    const element = document.querySelector(selector + ' .value');
    if (!element) return;
    const currentValue = element.textContent.trim();
    element.innerHTML = `<input type="${type}" value="${currentValue}">`;
}

async function textToRadio(selector) {
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

    try {
        const response = await fetch('/updateStudentDetails', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert("Profile updated successfully");
            await fetchStudentDetails();
        } else {
            const errorText = await response.text(); // Fetch error details
            console.error('Error updating profile:', response.status, response.statusText, errorText);
            alert("Error updating profile, Try Again Later");
        }
    } catch (error) {
        console.error('Network error:', error);
        alert("Network error, please try again later.");
    }

}
