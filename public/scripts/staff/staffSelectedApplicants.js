
document.addEventListener('DOMContentLoaded', function () {
    setUpSelectedApplicantsMainBtn();
    setUpSortSelectedApplicantsByDropdown();
});

function setUpSelectedApplicantsMainBtn() {
    const selectedApplicantsBtn = document.getElementById("selectedApplicants_btn");

    selectedApplicantsBtn.addEventListener('click', async function () {
        await fetchSelectedApplicants();
    });
}

function setUpSortSelectedApplicantsByDropdown() {

}

async function fetchSelectedApplicants() {
    try {
        const response = await fetch("/fetchOnlySelectedApplicants", {
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
            throw new Error("Failed to fetch Selected Applicants");
        }

        const applicants = await response.json();
        displaySelectedApplicants(applicants);

        return applicants;

    } catch (error) {
        console.error("Error:", error);
        alert("Failed to fetch Selected Applicants. Please try again.");
        return []; // Return an empty array on error to prevent further issues
    }
    
}

async function displaySelectedApplicants(applicants) {
    const selectedApplicantsContainer = document.querySelector(".selected_applicants_container");
    selectedApplicantsContainer.innerHTML = '';
    applicants.forEach(applicant => {
        const selectedApplicantItem = document.createElement("div");
        selectedApplicantItem.className = "selected_applicant_item";
        selectedApplicantItem.setAttribute('data-gpa', applicant.gpa);
        selectedApplicantItem.setAttribute('data-name', applicant.name);
        selectedApplicantItem.setAttribute('data-program-type', applicant.programtype);
        selectedApplicantItem.setAttribute('data-applicant-type', applicant.applicant_type);

        let buttonHTML = '';

        if (applicant.notified_applicant) {
            // If applicant has already been notified, show a "Notified" button
            buttonHTML = `
        <div>
            <button type="button" class="notified_applicant_btn" 
                data-applicant-id="${applicant.applicant_id}" 
                data-applicant-netid="${applicant.netid}"
                data-applicant-name="${applicant.name}" disabled>
                Notified
            </button>
        </div>

        <div>
            <button type="button" class="release_offer_letter"
                data-applicant-id="${applicant.applicant_id}" 
                data-applicant-netid="${applicant.netid}"
                data-applicant-name="${applicant.name}" disabled style="display:none">
                Release Offer
            </button>
        </div>
    `;
        } else {
            // If applicant has not been notified, show the "Notify Applicant" button
            buttonHTML = `
        <div>
            <button type="button" class="notify_applicant_btn"
                data-applicant-id="${applicant.applicant_id}" 
                data-applicant-netid="${applicant.netid}"
                data-applicant-name="${applicant.name}">
                Notify Applicant
            </button>
        </div>
    `;
        }

        selectedApplicantItem.innerHTML = `
            <div>
                <button type="button" class="view_profile_btn_selected_applicants" 
                    data-applicant-netid="${applicant.netid}" 
                    data-applicant-type="${applicant.applicant_type}" 
                    data-netid="${applicant.netid}">${applicant.name}</button>
            </div>

            <div><span>${applicant.netid}</span></div>

            <div><button type="button" class="remove_selected_btn_selected_applicants"
                    data-applicant-id="${applicant.applicant_id}" 
                    data-name="${applicant.name}">Un Select</button>
            </div>

            ${buttonHTML}
        `;

        selectedApplicantsContainer.appendChild(selectedApplicantItem);

    });

    setUpViewSelectedProfileEventListener(); 
    setUpRemoveSelectBtn();
    setUpNotifyApplicantBtn();
}

function setUpViewSelectedProfileEventListener() {
    const viewProfileBtns = document.querySelectorAll('.view_profile_btn_selected_applicants');

    // Add event listeners for dynamically created "View Profile" buttons
    viewProfileBtns.forEach(button => {
        button.addEventListener('click', async function () {
            console.log(this.getAttribute('data-applicant-netid'));
            const applicantNetId = this.getAttribute('data-applicant-netid');
            viewProfile(applicantNetId);
        });
    });
}

function setUpRemoveSelectBtn() {
    const removeSelectedBtns = document.querySelectorAll('.remove_selected_btn_selected_applicants');
    removeSelectedBtns.forEach(button => {
        button.addEventListener('click', async function () {
            const applicantId = this.getAttribute('data-applicant-id');
            const applicantName = this.getAttribute('data-applicant-name');
            await unSelectApplicant(applicantId, applicantName);
            await fetchSelectedApplicants();
        });
    });
}

function setUpNotifyApplicantBtn() {
    const notifyApplicantBtn = document.querySelectorAll('.notify_applicant_btn');
    notifyApplicantBtn.forEach(button => {
        button.addEventListener('click', async function () {
            const applicantId = this.getAttribute('data-applicant-id');
            const applicantNetid = this.getAttribute('data-applicant-netid');
            const applicantName = this.getAttribute('data-applicant-name');
            await notifyApplicant(applicantId, applicantNetid, applicantName);
        });
    });
}

async function notifyApplicant(applicantId, applicantNetid, applicantName) {

    const existingMessageContainer = document.getElementById('notifyMessageContainer');
    const existingOverlay = document.getElementById('overlay');

    if (existingMessageContainer) existingMessageContainer.remove();
    if (existingOverlay) existingOverlay.remove();

    const messageContainer = document.createElement('div');
    messageContainer.id = 'notifyMessageContainer';
    messageContainer.classList.add('notifyMessageModal'); 

    const overlay = document.createElement('div');
    overlay.id = 'NotifyMessageOverlay';

    messageContainer.innerHTML = `
        <h3>Enter Message for ${name}</h3>
            <input type="text" id="messageTitle" placeholder="Message Title" />
            <textarea id="messageContent" placeholder="Enter your message here..."></textarea>
            <button id="notifyBtn">Notify</button>
            <button id="cancleNotifyBtn">Cancel</button>
    `;

    document.body.appendChild(messageContainer);
    document.body.appendChild(overlay);

    setUpNotifyCancelEventListeners(applicantId, applicantNetid);
}

function setUpNotifyCancelEventListeners(applicantId, netid) {
    const notifyBtn = document.getElementById('notifyBtn');
    const cancleNotifyBtn = document.getElementById('cancleNotifyBtn');

    notifyBtn.addEventListener('click', () => {

        const messageTitle = document.getElementById('messageTitle').value;
        const messageContent = document.getElementById('messageContent').value;

        if (messageTitle && messageContent) {
            notifyApplicantSubmit(applicantId, messageTitle, messageContent, netid);
            closeMessageContainer();
        } else {
            alert('Please fill in both the title and content.');
        }
    });

    cancleNotifyBtn.addEventListener('click', () => {
        closeMessageContainer(); 
    });
}

function closeMessageContainer() {
    const messageContainer = document.getElementById('notifyMessageContainer');
    const overlay = document.getElementById('NotifyMessageOverlay');

    if (messageContainer) {
        messageContainer.remove();
    }
    if (overlay) {
        overlay.remove();
    }
}

async function notifyApplicantSubmit(applicantId, messageTitle, messageContent, netid) {
    try {
        // Send a POST request with applicationId, messageTitle, and messageContent
        const response = await fetch(`/notifyApplicant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                applicantId,
                netid,
                messageTitle,
                messageContent,
            }),
        });

        if (response.ok) {
            const result = await response.json();
            alert(result.message); // Success message
            await fetchSelectedApplicants();
            closeMessageContainer();
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Failed to Notify Applicant.");
        }
    } catch (error) {
        console.log('Error occurred while notifying the applicant:', error);
        alert("An error occurred. Please try again later.");
    }
}
