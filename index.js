import express, { application } from "express";
import multer from "multer";
import bodyParser from "body-parser";
import pg from "pg";
import csv from 'csv-parser';
import fs from 'fs';
import xlsx from 'xlsx';
import session from 'express-session';
import nodemailer from 'nodemailer';

import path from 'path';
import { fileURLToPath } from 'url';

// Manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3100;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "TA Management System",
    password: "kmr2023",
    port: 5432
});

db.connect();







/**
 * Sends a basic email without attachments
 * @param {string} to - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} message - Email body content
 */
async function sendBasicEmail(to, subject, message) {
    // Configure the email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'madhushalinikotti@gmail.com', // Your email
            pass: 'gqaw emhi nzml lpss' // Your app password
        }
    });  

    // Set up email options
    const mailOptions = {
        from: 'madhushalini.kotti22@gmail.com',
        to,
        subject,
        text: message
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function sendNotifyEmail(to, subject, message) {
    // Configure the email transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'madhushalinikotti@gmail.com', // Your email
            pass: 'gqaw emhi nzml lpss' // Your app password
        }
    });

    // Set up email options
    const mailOptions = {
        from: 'madhushalinikotti@gmail.com',
        to,
        subject,
        text: message
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}


// Use session middleware
app.use(session({
    secret: 'your_secret_key', // You can replace this with a secure, random string
    resave: false, // Prevents resaving session data if nothing is modified
    saveUninitialized: true, // Forces a session to be saved even if it's uninitialized
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 30 * 60 * 1000 // 30 minutes in milliseconds
    }
}));

// Middleware to check if session contains netid
function checkSession(req, res, next) {
    if (req.session && req.session.netid) {
        return next();
    } else {
        return res.redirect('/?sessionExpired=true');
    } 
}

app.get('/check-session', (req, res) => {
    if (req.session && req.session.netid) {
        return res.json({ sessionActive: true });
    } else {
        res.redirect('/?sessionExpired=true');
    }
});









app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.get('/logout', (req, res) => {
    console.log("Session before destroy:", req.session);
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.redirect('/'); // Redirect to home or handle error appropriately
        }
        console.log("Session after destroy:", req.session);
        res.redirect('/'); // Redirect after successful logout
    });
});









app.get('/currentYear', (req, res) => {
    const currentYear = new Date().getFullYear();
    res.json({ currentYear });
});

async function fetchDepartmentList() {
    const result = await db.query("select * from department_list");

    let department_list = [];
    for (const dept of result.rows) {
        department_list.push({
            'department_name': dept.department_name.trim(),
            'department_abbre': dept.department_abbre.trim()
        });
    }
    return department_list;
}

async function fetchSemesterList() {
    const result = await db.query(`
        SELECT * FROM semesters_list
        ORDER BY 
            -- Extract and sort by the year portion, ascending
            CAST(SUBSTRING(semester FROM '[0-9]{4}') AS INTEGER) ASC,
            -- Sort by semester type: spring, summer, fall
            CASE 
                WHEN semester ILIKE 'spring%' THEN 1
                WHEN semester ILIKE 'summer%' THEN 2
                WHEN semester ILIKE 'fall%' THEN 3
                ELSE 4
            END ASC
    `);

    let semester_list = [];
    for (const semester of result.rows) {
        semester_list.push({
            'semester': semester.semester.trim(),
            'semester_status': semester.status.trim()
        });
    }

    return semester_list;
}

async function fetchAllCoursesStudent(netid) {

    const result = await db.query(
        "select DISTINCT dept_name, semester, course_number, course_name, course_title from courses ORDER BY course_name, course_number, course_title"
    );

    let courses_list = [];

    for (const course of result.rows) {

        const semesterStatusResult = await db.query("select status from semesters_list where semester like $1", [course.semester]);
        const semesterStatus = semesterStatusResult.rows[0].status;

        const appliedToCourseResult = await db.query("select * from applications where trim(dept_name) = trim($1) and trim(semester) = trim($2) and trim(course_name) = trim($3) and trim(course_number) = trim($4) and netid = $5", [course.dept_name, course.semester, course.course_name, course.course_number, netid]);
        const appliedToCourse = appliedToCourseResult.rows.length == 1;

        var courseStatus = "";

        if (semesterStatus == "active") {
            courseStatus = "active";
        } else if (semesterStatus == "not active") {
            courseStatus = "not opened";
        }

        courses_list.push({
            'dept_name': course.dept_name.trim(),
            'semester': course.semester.trim(),
            'course_name': course.course_name.trim(),
            'course_title': course.course_title.trim(),
            'course_number': course.course_number.trim(),
            'course_status': courseStatus.trim(),
            'applied' : appliedToCourse,
        });

    };

    return courses_list;

}

async function fetchApplicationsByStudentNetid(netid) {

    const result = await db.query("select * from applications where netid = $1 ORDER BY course_name, course_number, course_title", [netid]);

    let applications_list = [];

    for (const application of result.rows) {

        applications_list.push({
            'dept_name': application.dept_name.trim(),
            'semester': application.semester.trim(),
            'course_name': application.course_name.trim(),
            'course_title': application.course_title.trim(),
            'course_number': application.course_number,
            'a_grade': application.a_grade.trim(),
            'served_as_ta': application.served_as_ta.trim(),
            'professional_experience': application.professional_experience.trim(),
            'comments': application.comments.trim(),
            'id': application.application_id,
            'application_status': application.application_type,
            'notified_applicant': application.notified_applicant,
        });
    }

    return applications_list;
}

app.get('/departmentList', async (req, res) => {
    try {
        const departmentList = await fetchDepartmentList();  // Fetch the department list from the database
        res.json(departmentList);  // Send the department list as a JSON response
    } catch (error) {
        console.error('Error fetching department list:', error);
        res.status(500).json({ success: false, message: 'Error fetching department list' });  // Send error response in case of failure
    }
});

app.get('/semesterList', async (req, res) => {
    try {
        const semesterList = await fetchSemesterList();  // Fetch the semester list from the database
        res.json(semesterList);  // Send the semester list as a JSON response
    } catch (error) {
        console.error('Error fetching semester list:', error);
        res.status(500).json({ success: false, message: 'Error fetching semester list' });  // Send error response in case of failure
    }
});










app.post("/login", async (req, res) => {
    var netid = req.body.netid;
    var password = req.body.password;

    console.log(netid);

    if (netid === "staff2023") {
        req.session.netid = netid; // Store netid in session
        req.session.save(err => {
            if (err) {
                console.error("Session save error:", err);
                res.status(500).send("Error saving session.");
            } else {
                res.sendFile(path.join(__dirname, 'public', 'pages', 'staff.html'));
            }
        });

    } else {
        req.session.netid = netid; // Store netid in session
        req.session.save(err => {
            if (err) {
                console.error("Session save error:", err);
                res.status(500).send("Error saving session.");
            } else {
                // Example usage
                /*
                sendBasicEmail(
                    'mkotti2023@fau.edu',
                    'Hello!',
                    'This is a plain text email without attachments.'
                ); */
                res.sendFile(path.join(__dirname, 'public', 'pages', 'student.html'));
            }
        });
    }
});












app.get('/student',checkSession, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'student.html'));
});

async function fetchStudentDetails(netid) {
    let result = await db.query("select * from userprofile WHERE netid = $1", [netid]);

    // Return an object with empty strings for all fields
    if (result.rows.length === 0) {
        await db.query("insert into userprofile (netid) values($1) ", [netid]);
    }

    result = await db.query("select * from userprofile WHERE netid = $1", [netid]);
    // Process and return user details if rows are found
    const details = result.rows[0];

    return {
        'name': details.name,
        'netid': details.netid,
        'znumber': details.znumber,
        'email': details.email,
        'mobilenumber': details.mobilenumber,
        'graduateprogram': details.graduateprogram,
        'advisorname': details.advisorname,
        'advisoremail': details.advisoremail,
        'department': details.department,
        'enrollementstatus': details.enrollementstatus,
        'expectedgraduationdate': details.expectedgraduationdate,
        'programstartdate': details.programstartdate,
        'citizenshipstatus': details.citizenshipstatus,
        'creditscompletedatfau': details.creditscompletedatfau,
        'creditsplannedtoregisterforupcomingsemester': details.creditsplannedtoregisterforupcomingsemester,
        'gpa': details.currentgpa,
    };
}

app.get("/studentDetails", checkSession, async (req, res) => {

    var netid = req.session.netid;
    try {
        const studentDetails = await fetchStudentDetails(netid);
        res.json(studentDetails);
    } catch (error) {
        console.error("Error fetching student Details:", error); // Improved error logging
        res.status(500).json({ error: 'Failed to fetch student Details' });
    }
    
});

app.get("/studentNetid", checkSession, async (req, res) => {

    var netid = req.session.netid;
    try {
        res.json(netid);
    } catch (error) {
        console.error("Error fetching student Details:", error); // Improved error logging
        res.status(500).json({ error: 'Failed to fetch student Details' });
    }

});

app.use(express.urlencoded({ extended: true }));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'resume') {
            cb(null, "./public/resume");
        } else if (file.fieldname === 'transcripts') {
            cb(null, "./public/transcripts");
        } else if (file.fieldname === 'csvFile') {
            cb(null, "./public/uploads"); // Set this for CSV uploads
        } else {
            cb(null, "./public/uploads"); // Default upload directory for any other files
        }
    },
    filename: function (req, file, cb) {
        const extension = file.originalname.split('.').pop(); // Get file extension

        if (file.fieldname === 'resume' || file.fieldname === 'transcripts') {
            // For resumes and transcripts, use netid for naming
            const filename = `${req.body.netid}.${extension}`;
            cb(null, filename);
        } else if (file.fieldname === 'csvFile') {
            // For CSV file, use semester and department name for naming
            const semester = req.session.semester || "Fall 2024"; // Default if not provided
            const dept_name = req.session.dept_name || "eecs"; // Default if not provided
            const filename = `${semester}_${dept_name}.${extension}`; // Format: semester_dept.extension
            cb(null, filename);
        } else {
            // Fallback for other cases
            const filename = `${Date.now()}.${extension}`; // Use a timestamp for fallback
            cb(null, filename);
        }
    }
});

const upload = multer({ storage: storage });

app.post("/updateStudentDetails", checkSession, upload.fields([{ name: "resume" }, { name: "transcripts" }]), async (req, res) => {
    
    var netid = req.session.netid;

    const {
        name,
        znumber,
        email,
        mobilenumber,
        graduateprogram,
        advisorname,
        advisoremail,
        department,
        gpa,
        enrollementstatus,
        citizenshipstatus,
        creditscompleted,
        creditsplannedtoregister,
        semesterstartdate,
        expectedgraduationdate

    } = req.body;

    try {

        await db.query('UPDATE userprofile SET name = $1, znumber = $2, mobilenumber = $3, graduateprogram = $4, advisorname = $5, advisoremail = $6, department = $7, currentgpa = $8, enrollementstatus = $9,citizenshipstatus = $10,creditscompletedatfau = $11, creditsplannedtoregisterforupcomingsemester = $12, programstartdate = $13, expectedgraduationdate = $14, email = $15 WHERE netid = $16',
            [name, znumber, mobilenumber, graduateprogram, advisorname, advisoremail, department, gpa, enrollementstatus, citizenshipstatus, creditscompleted, creditsplannedtoregister, semesterstartdate, expectedgraduationdate,email, netid]);

        // Rename uploaded resume file
        if (req.files['resume']) {
            const resumeFile = req.files['resume'][0];
            const extension = path.extname(resumeFile.originalname);
            const newResumeName = `${netid}${extension}`;
            const oldPath = resumeFile.path;
            const newPath = path.join(path.dirname(oldPath), newResumeName);

            // Rename with a callback function to handle any errors
            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.error('Error renaming resume file:', err);
                }
            });
        }

        // Rename uploaded transcripts file
        if (req.files['transcripts']) {
            const transcriptFile = req.files['transcripts'][0];
            const extension = path.extname(transcriptFile.originalname);
            const newTranscriptName = `${netid}${extension}`;
            const oldPath = transcriptFile.path;
            const newPath = path.join(path.dirname(oldPath), newTranscriptName);

            // Rename with a callback function to handle any errors
            fs.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.error('Error renaming transcripts file:', err);
                }
            });
        }

        res.status(200).json({ message: 'Profile updated successfully'});

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }

});

app.post("/submitNewApplication", checkSession, async (req, res) => {

    const netid = req.session.netid;

    const {
        dept_name,
        semester,
        a_grade,
        served_as_ta,
        professional_experience,
        comments,
        course_name,
        course_number,
        course_title
    } = req.body;

    try {
        // Check if the same student (netid) has already applied for the same course
        const duplicateCheck = await db.query(
            "SELECT * FROM applications WHERE netid = $1 AND course_number = $2 AND course_name = $3 AND course_title = $4",
            [netid, course_number, course_name, course_title]
        );

        if (duplicateCheck.rows.length > 0) {
            // If a duplicate exists, send an error response
            return res.status(400).send({
                message: "You have already applied for this course. Duplicate applications are not allowed."
            });
        }

        // If no duplicate, generate a unique application_id
        let application_id;
        const existingIds = await db.query("SELECT application_id FROM applications");
        const existingIdSet = new Set(existingIds.rows.map(row => row.application_id));

        do {
            application_id = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit number
        } while (existingIdSet.has(application_id));

        const applicationStatus = "new";

        const userProfile = await db.query(
            "SELECT * FROM userprofile WHERE netid = $1", [netid]
        );

        if (userProfile.rows.length <= 0) {
            // If netid is invalid
            return res.status(400).send({
                message: "Couldn't Submit Application, Try again later."
            });
        }

        const name = userProfile.rows[0].name;
        const znumber = userProfile.rows[0].znumber;
        const email = userProfile.rows[0].email;
        const mobileNumber = userProfile.rows[0].mobilenumber;
        const gpa = userProfile.rows[0].currentgpa || 0;
        const enrollementStatus = userProfile.rows[0].enrollementstatus;
        const citizenshipStatus = userProfile.rows[0].citizenshipstatus;
        const programType = userProfile.rows[0].graduateprogram;
        const expectedgraduationdate = userProfile.rows[0].expectedgraduationdate;
        const programstartdate = userProfile.rows[0].programstartdate;
        const creditscompletedatfau = userProfile.rows[0].creditscompletedatfau;
        const creditsplannedtoregister = userProfile.rows[0].creditsplannedtoregisterforupcomingsemester;

        // Insert the new application into the database
        await db.query(
            "INSERT INTO applications (application_id,application_type, netid, dept_name, semester, a_grade, served_as_ta, professional_experience, comments, course_name, course_number, course_title, name, znumber, email, mobile_number, gpa, enrollement_status, citizenship_status, program_type, expected_graduation_date, program_start_date, credits_completed_at_fau, credits_planned_to_register) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)", [
            application_id, applicationStatus,
            netid,
            dept_name, semester,
            a_grade, served_as_ta, professional_experience,
            comments,
            course_name, course_number, course_title,
            name, znumber, email, mobileNumber,
            gpa, enrollementStatus, citizenshipStatus, programType,
            expectedgraduationdate, programstartdate, creditscompletedatfau, creditsplannedtoregister
        ]
        );

        // Check if the combination of dept_name, semester, and netid exists in the applicants table
        const applicantCheck = await db.query(
            "SELECT * FROM applicants WHERE dept_name = $1 AND semester = $2 AND netid = $3",
            [dept_name, semester, netid]
        );

        if (applicantCheck.rows.length === 0) {
            // Generate a unique applicant_id
            let applicant_id;
            const existingApplicantIds = await db.query("SELECT applicant_id FROM applicants");
            const existingApplicantIdSet = new Set(existingApplicantIds.rows.map(row => row.applicant_id));

            do {
                applicant_id = Math.floor(100000 + Math.random() * 900000); // Generate random 6-digit number
            } while (existingApplicantIdSet.has(applicant_id));

            // Insert a new row in the applicants table with the generated applicant_id
            await db.query(
                "INSERT INTO applicants (applicant_id, dept_name, semester, netid, applicant_type, name, gpa, program_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [applicant_id, dept_name, semester, netid, "new", name, gpa, programType]
            );
        } else {
            // Update the GPA for the existing applicant
            await db.query(
                "UPDATE applicants SET gpa = $1 WHERE dept_name = $2 AND semester = $3 AND netid = $4",
                [gpa, dept_name, semester, netid]
            );
        }

        // Return success response
        res.status(201).send({ message: "Application Submitted Successfully" });

    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).send({ message: "Error submitting application" });
    }

});

// For fetching all the courses for every department and every semester
app.get("/allCoursesStudent", checkSession, async (req, res) => {
    const netid = req.session.netid;
    try {
        const courses = await fetchAllCoursesStudent(netid);  // Fetch courses from the database
        res.json(courses);
    } catch (error) {
        console.error("Error fetching Courses:", error); // Improved error logging
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});

async function fetchNotifiedMessageByNetid(netid) {
    try {
        const query = `
            SELECT message_title, message_content 
            FROM ta_notified_messages 
            WHERE netid = $1
        `;
        const result = await db.query(query, [netid]);

        // If no message is found, return an empty array
        if (result.rows.length === 0) {
            return [];
        }

        // Return the message details if found
        return result.rows.map(row => ({
            title: row.title,
            content: row.content
        }));
    } catch (error) {
        console.error("Error fetching notified messages:", error);
        throw error;
    }
}

app.get('/fetchNotifiedMessageOfStudent', checkSession, async (req, res) => {
    const netid = req.session.netid;

    try {
        // Replace this with the actual function or query to fetch the notification message
        const notifiedMessage = await fetchNotifiedMessageByNetid(netid);

        if (notifiedMessage) {
            // Return message title and content if found
            res.json([{ title: notifiedMessage.title, content: notifiedMessage.content }]);
        } else {
            // Return an empty array if no notification message is found
            res.json([]);
        }
    } catch (error) {
        console.error("Error fetching notified message:", error);
        res.status(500).json({ error: 'Failed to fetch notified message' });
    }
});

app.get('/applicationsByStudentNetid', checkSession, async (req, res) => {
    const netid = req.session.netid;
    try {
        const applications = await fetchApplicationsByStudentNetid(netid);
        res.json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

async function updateApplication(id, updateData) {
    const { a_grade, served_as_ta, professional_experience, comments } = updateData;
    await db.query(`
        UPDATE applications 
        SET a_grade = $1, served_as_ta = $2, professional_experience = $3, comments = $4 
        WHERE application_id = $5
    `, [a_grade, served_as_ta, professional_experience, comments, id]);
}

app.post('/updateApplication/:id', checkSession, async (req, res) => {
    const applicationId = req.params.id;
    const { a_grade, served_as_ta, professional_experience, comments } = req.body;

    try {
        await updateApplication(applicationId, { a_grade, served_as_ta, professional_experience, comments });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
});

async function deleteApplication(id) {
    await db.query(`
        DELETE FROM applications 
        WHERE application_id = $1
    `, [id]);
}

app.delete('/deleteApplication/:id', checkSession, async (req, res) => {
    const applicationId = req.params.id;

    try {
        await deleteApplication(applicationId); // Implement this function to delete from the database
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
});

async function fetchTANotifiedMessage(applicationId) {
    // Query the database and return the required message
    const result = await db.query(
        `SELECT message_title, message_content FROM ta_notified_messages WHERE application_id = $1`,
        [applicationId]
    );

    // If a message is found, return the title and content, otherwise return an empty object
    if (result.rows.length > 0) {
        const { message_title, message_content } = result.rows[0];
        return { messageTitle: message_title, messageContent: message_content };
    } else {
        return {};  // Return empty object if no message found
    }
}

app.post('/taNotifiedMessage', checkSession, async (req, res) => {
    const applicationId = req.body.applicationId;
    try {
        const message = await fetchTANotifiedMessage(applicationId);
        res.json(message);
    } catch (error) {
        console.error("Error fetching Message", error);
        res.status(500).json({ error: 'Failed to fetch message' });
    }
});



























async function fetch_user_profile_from_application(applicationId) {

    var result = await db.query("select * from applications where application_id = $1", [applicationId]);

    const applicant_netid = result.rows[0].netid.toLowerCase().trim();

    result = await db.query("select * from userprofile where netid = $1", [applicant_netid]);

    let userProfile = [];

    userProfile.push({

        'name': result.rows[0].name === "" || result.rows[0].name === " " ? "Not Available" : result.rows[0].name,
        'netid': result.rows[0].netid === "" || result.rows[0].netid === " " ? "Not Available" : result.rows[0].netid,
        'znumber': result.rows[0].znumber === "" || result.rows[0].znumber === " " ? "Not Available" : result.rows[0].znumber,
        'gpa': result.rows[0].currentgpa === "" || result.rows[0].currentgpa === " " ? "Not Available" : result.rows[0].currentgpa,
        'mobile_number': result.rows[0].mobilenumber === "" || result.rows[0].mobilenumber === " " ? "Not Available" : result.rows[0].mobilenumber,
        'email': result.rows[0].email === "" || result.rows[0].email === " " ? "Not Available" : result.rows[0].email,
        'programType': result.rows[0].graduateprogram === "" || result.rows[0].graduateprogram === " " ? "Not Available" : result.rows[0].graduateprogram,
        'enrollementstatus': result.rows[0].enrollementstatus === "" || result.rows[0].enrollementstatus === " " ? "Not Available" : result.rows[0].enrollementstatus,
        'expectedgraduationdate': result.rows[0].expectedgraduationdate === "" || result.rows[0].expectedgraduationdate === " " ? "Not Available" : result.rows[0].expectedgraduationdate,
        'programstartDate': result.rows[0].programstartdate === "" || result.rows[0].programstartdate === " " ? "Not Available" : result.rows[0].programstartdate,
        'citizenshipstatus': result.rows[0].citizenshipstatus === "" || result.rows[0].citizenshipstatus === " " ? "Not Available" : result.rows[0].citizenshipstatus,
        'creditscompletedatfau': result.rows[0].creditscompletedatfau === "" || result.rows[0].creditscompletedatfau === " " ? "Not Available" : result.rows[0].creditscompletedatfau,
        'creditsplannedtoregisterforupcomingsemester': result.rows[0].creditsplannedtoregisterforupcomingsemester === "" || result.rows[0].creditsplannedtoregisterforupcomingsemester === " " ? "Not Available" : result.rows[0].creditsplannedtoregisterforupcomingsemester,
        'advisorname': result.rows[0].advisorname === "" || result.rows[0].advisorname === " " ? "Not Available" : result.rows[0].advisorname,
        'advisoremail': result.rows[0].advisoremail === "" || result.rows[0].advisoremail === " " ? "Not Available" : result.rows[0].advisoremail,


    });

    return userProfile;

}

app.post("/staff/login", async (req, res) => {
    var netid = req.body.netid || "staff2023"; // Default value if empty
    const departmentAbbreviation = req.body.department || "EECS"; // Default abbreviation
    var semester = req.body.semester || "spring 2024"; // Default value if empty

    try {
        // Query to get the department name based on the abbreviation
        const result = await db.query("SELECT department_name FROM department_list WHERE department_abbre = $1", [departmentAbbreviation]);

        // Check if a department name was found; if not, set a default
        const departmentName = result.rows.length > 0 ? result.rows[0].department_name.trim() : "Unknown Department";
        const department = `${departmentAbbreviation} - ${departmentName}`;

        // Store values in the session
        req.session.netid = netid;
        //req.session.department = department;
        //req.session.semester = semester;

        req.session.save(err => {
            if (err) {
                console.error("Session save error:", err);
                res.status(500).send("Error saving session.");
            } else {
                res.sendFile(path.join(__dirname, 'public', 'pages', 'staff.html'));
            }
        });
    } catch (error) {
        console.error("Error fetching department information:", error);
        res.status(500).send("Error processing department information.");
        return res.redirect('/?error=true');
    }

});

app.get("/checkDeptSemester",checkSession, (req, res) => {
    const hasSemester = !!req.session.semester;
    const hasDepartment = !!req.session.department;

    res.json({
        hasSemester,
        hasDepartment,
        allSet: hasSemester && hasDepartment // Returns true if both exist
    });
});

app.post("/updateSession", checkSession, async (req, res) => {
    const { semester, departmentAbbreviation } = req.body;

    try {
        // Query to get the department name based on the abbreviation
        const result = await db.query("SELECT department_name FROM department_list WHERE department_abbre = $1", [departmentAbbreviation]);

        // Check if a department name was found; if not, set a default
        const departmentName = result.rows.length > 0 ? result.rows[0].department_name.trim() : "Unknown Department";
        const department = `${departmentAbbreviation} - ${departmentName}`;

        req.session.department = department;
        req.session.semester = semester;

        req.session.save(err => {
            if (err) {
                console.error("Session save error:", err);
                res.status(500).send("Error saving session.");
            } else {
                res.json({ success: true, message: "Session updated successfully." });
            }
        });
    } catch (error) {
        console.error("Error fetching department information:", error);
        res.status(500).send("Error processing department information.");
        return res.redirect('/?error=true');
    }

});


app.get('/staff', checkSession, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'staff.html'));
});

// Endpoint to get semester data from the session
app.get('/semester',checkSession, (req, res) => {
    if (req.session.semester) {
        res.json(req.session.semester);
    } else {
        res.status(404).json({ error: 'Semester data not found' });
    }
});

// Endpoint to get department data from the session
app.get('/department',checkSession, (req, res) => {
    if (req.session.department) {
        res.json(req.session.department);
    } else {
        res.status(404).json({ error: 'Department data not found' });
    }
});

async function insertRowsIntoDatabase(rows, semester, deptName) {

    try {
        // Loop through each row from the CSV file
        for (const row of rows) {
            const courseParts = row.Course.split(' ');
            const courseNumber = courseParts.pop(); // Extract last part as course_number
            const courseName = courseParts.join(' '); // Join remaining parts as course_name
            const courseTitle = row['Course Title'];
            const courseStatus = "Not Started";

            // Insert or update the row if a duplicate is found based on the unique combination
            await db.query(`
                INSERT INTO courses (dept_name, semester, course_number, course_name, course_title, course_status)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (dept_name, semester, course_number, course_name) DO UPDATE
                SET course_title = EXCLUDED.course_title;`,
                [deptName, semester, courseNumber, courseName, courseTitle, courseStatus]
            );

        }

    } catch (error) {
        console.error('Error inserting rows into the database:', error);
        throw new Error('Failed to insert rows into the database');
    }

}

function extractRowsFromCSV(filePath) {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', () => {
                resolve(rows);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

app.post('/staff/add_multiple_courses',checkSession, upload.single('csvFile'), async (req, res) => {
    
    const filePath = req.file.path; // Multer gives the path of the uploaded file
    const dept_name = req.session.department.split(" ")[0].toLowerCase(); 
    const semester = req.session.semester; // Fetch semester (can be from req.session or other logic)

    try {
        const rows = await extractRowsFromCSV(filePath);
        await insertRowsIntoDatabase(rows, semester, dept_name); // Insert into database
        res.json({ success: true, message: 'Application shortlisted successfully' });

    } catch (error) {

        console.error('Error extracting rows from CSV or inserting into database:', error);
        res.status(500).json({ success: false, message: 'Internal server error. Could not process the CSV file.' });  // Send failure response as JSON

    }

});

app.post('/staff/add_single_course', checkSession, async (req, res) => {
    const { courseTitle, courseName, courseNumber} = req.body;
    const dept_name = req.session.department.split(" ")[0].toLowerCase(); 
    const semester = req.session.semester; 

    try {
        // Insert or update the single course based on the unique combination
        await db.query(`
            INSERT INTO courses (dept_name, semester, course_number, course_name, course_title, course_status)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (dept_name, semester, course_number, course_name) DO UPDATE
            SET course_title = EXCLUDED.course_title;`,
            [dept_name, semester, courseNumber, courseName, courseTitle, "Not Started"]
        );

        res.json({ success: true, message: 'Course uploaded successfully' });

    } catch (error) {
        console.error('Error inserting course into the database:', error);
        res.status(500).json({ success: false, message: 'Error Uploading the course' });
    }
});

app.post('/staff/delete_single_course',checkSession, async (req, res) => {

    const courseNumber = req.body.courseNumber;
    const courseName = req.body.courseName;
    const dept_name = req.session.department.split(" ")[0].toLowerCase();
    const semester = req.session.semester; 

    try {
        // Deleting Course
        await db.query(`
            DELETE FROM courses where course_number like $1 and course_name like $2 and dept_name like $3 and semester like $4`, [courseNumber,courseName, dept_name, semester]);
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch {
        console.error('Error deleting the course:', error);
        res.status(500).json({ success: false, message: 'Error deleting the course' });
    }
    
});

async function fetchCoursesByDeptAndSemester(department, semester) {

    try {
        const courses = await db.query(
            `SELECT 
                c.course_title, 
                c.course_name, 
                c.course_number,
                COUNT(a.application_id) AS total_applications,
                COUNT(CASE WHEN a.application_type = 'shortlisted' THEN 1 END) AS shortlisted_applications,
                COUNT(CASE WHEN a.application_type = 'selected' THEN 1 END) AS selected_applications,
                COUNT(CASE WHEN a.notified_applicant = true THEN 1 END) AS notified_applications
            FROM courses c
            LEFT JOIN applications a 
                ON c.course_title like a.course_title
                AND c.course_name like a.course_name
                AND c.course_number like a.course_number
                AND c.dept_name like a.dept_name 
                AND c.semester like a.semester
            WHERE c.semester LIKE $1 
            AND c.dept_name LIKE $2
            GROUP BY c.course_title, c.course_name, c.course_number
            ORDER BY c.course_name, c.course_number, c.course_title`,
            [semester, department]
        );
        return courses.rows;
    } catch (error) {
        console.error('Error fetching courses from database:', error);
        throw error;
    }
}

app.get('/coursesListDeptSemesterStaff', checkSession, async (req, res) => {
    const semester = req.session.semester;
    const department_abbre = req.session.department.split(" ")[0].toLowerCase() || "eecs";

    try {
        const courses = await fetchCoursesByDeptAndSemester(department_abbre, semester);
        res.json(courses); 
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

async function fetch_all_applications_by_courseNameNumberSemesterDepartment(courseName, courseNumber, semester, department) {
    const result = await db.query("select * from applications where course_number like $1 and course_name like $2 and semester like $3 and dept_name like $4", [courseNumber, courseName, semester, department]);

    let applications_list = [];

    for (const application of result.rows) {

        const userResult = await db.query("SELECT currentgpa,name,creditscompletedatfau,email,mobilenumber,znumber,graduateprogram,department,enrollementstatus,citizenshipstatus,creditsplannedtoregisterforupcomingsemester,expectedgraduationdate,programstartdate FROM userprofile WHERE netid = $1", [application.netid.trim()]);

        applications_list.push({
            'netid': application.netid.trim(),
            'name': userResult.rows[0].name,
            'znumber': userResult.rows[0].znumber,
            'email': userResult.rows[0].email,
            'gpa': userResult.rows[0].currentgpa,
            'mobilenumber': userResult.rows[0].mobilenumber,
            'programType': userResult.rows[0].graduateprogram,
            'department': userResult.rows[0].department,
            'enrollementstatus': userResult.rows[0].enrollementstatus,
            'expectedgraduationdate': userResult.rows[0].expectedgraduationdate,
            'programstartDate': userResult.rows[0].programstartdate,
            'citizenshipstatus': userResult.rows[0].citizenshipstatus,
            'creditscompletedatfau': userResult.rows[0].creditscompletedatfau,
            'creditsplannedtoregisterforupcomingsemester': userResult.rows[0].creditsplannedtoregisterforupcomingsemester,
            'advisorname': userResult.rows[0].advisorname,
            'advisoremail': userResult.rows[0].advisoremail,

            'dept_name': application.dept_name.trim(),
            'semester': application.semester.trim(),
            'course_name': application.course_name.trim(),
            'course_title': application.course_title.trim(),
            'course_number': application.course_number,
            'a_grade': application.a_grade.trim(),
            'served_as_ta': application.served_as_ta.trim(),
            'professional_experience': application.professional_experience.trim(),
            'comments': application.comments.trim(),
            'applicationType': application.application_type,
            'applicationId': application.application_id,
            'notifiedApplicant': application.notified_applicant,
        });
    }
    return applications_list;
}

app.get('/staff/getAllApplications', checkSession, async (req, res) => {
    const courseNumber = req.query.courseNumber // Get the course number from queryparameter
    const courseName = req.query.courseName // Get the course name from query parameter

    if (!courseNumber) {
        return res.status(400).json({ error: 'Course number is required' });
    }

    try {
        const semester = req.session.semester;
        const department = req.session.department.split(" ")[0].toLowerCase();
        const applications = await fetch_all_applications_by_courseNameNumberSemesterDepartment(courseName, courseNumber, semester, department);
        return res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

app.get('/staff/getUserProfile', checkSession, async (req, res) => {
    const application_id = req.query.applicationId;

    if (!application_id) {
        return res.status(400).json({ error: 'Couldnt fetch complete profile of Applicant' });
    }

    try {
        // Call the function to fetch applications by course number
        const userProfile = await fetch_user_profile_from_application(application_id);
        return res.json(userProfile[0]); // Send applications data as JSON
    } catch (error) {
        console.error('Error fetching applications:', error);
        return res.status(500).json({ error: 'Failed to fetch Complete Profile of Applicant' });
    }


});

app.get('/shortlistApplicant', checkSession, async (req, res) => {
    const applicantId = req.query.applicantId; 

    if (!applicantId) {
        return res.status(400).json({
            error: 'Couldn\'t Shortlist Applicant'
        });
    }

    try {
        await db.query('Update applicants set applicant_type = $1 where applicant_id = $2', ["shortlisted", applicantId]);
        res.json({ success: true, message: 'Applicant shortlisted successfully' });
    } catch (error) {
        console.error('Error shortlisting Applicant:', error);
        return res.status(500).json({ error: 'Couldn\'t shortlist Applicant, Try Again Later' });
    }

});

app.get('/shortlistApplicant', checkSession, async (req, res) => {
    const applicantId = req.query.applicantId;

    if (!applicantId) {
        return res.status(400).json({
            error: 'Couldn\'t Shortlist Applicant'
        });
    }

    try {
        await db.query('Update applicants set applicant_type = $1 where applicant_id = $2', ["shortlisted", applicantId]);
        res.json({ success: true, message: 'Applicant shortlisted successfully' });
    } catch (error) {
        console.error('Error shortlisting Applicant:', error);
        return res.status(500).json({ error: 'Couldn\'t shortlist Applicant, Try Again Later' });
    }

});

app.get('/selectApplicant', checkSession, async (req, res) => {
    const applicantId = req.query.applicantId;

    if (!applicantId) {
        return res.status(400).json({
            error: 'Couldn\'t Select Applicant'
        });
    }

    try {
        await db.query('Update applicants set applicant_type = $1 where applicant_id = $2', ["selected", applicantId]);
        res.json({ success: true, message: 'Applicant selected successfully' });
    } catch (error) {
        console.error('Error selecting Applicant:', error);
        return res.status(500).json({ error: 'Couldn\'t select Applicant, Try Again Later' });
    }

});

app.get('/unShortlistApplicant', checkSession, async (req, res) => {
    const applicantId = req.query.applicantId;

    if (!applicantId) {
        return res.status(400).json({
            error: 'Couldn\'t Un  Shortlist Applicant'
        });
    }

    try {
        await db.query('Update applicants set applicant_type = $1 where applicant_id = $2', ["new", applicantId]);
        res.json({ success: true, message: 'Applicant Un shortlisted successfully' });
    } catch (error) {
        console.error('Error Un shortlisting Applicant:', error);
        return res.status(500).json({ error: 'Couldn\'t Un shortlist Applicant, Try Again Later' });
    }

});

app.get('/unSelectApplicant', checkSession, async (req, res) => {
    const applicantId = req.query.applicantId;

    if (!applicantId) {
        return res.status(400).json({
            error: 'Couldn\'t Un Select Applicant'
        });
    }

    try {
        await db.query('Update applicants set applicant_type = $1 where applicant_id = $2', ["shortlisted", applicantId]);
        res.json({ success: true, message: 'Applicant Un selected successfully' });
    } catch (error) {
        console.error('Error Un selecting Applicant:', error);
        return res.status(500).json({ error: 'Couldn\'t Un select Applicant, Try Again Later' });
    }

});

async function fetch_shortlisted_applications_by_courseNameNumberSemesterDepartment(courseName, courseNumber, semester, department) {
    const result = await db.query("select * from applications where course_number like $1 and course_name like $2 and application_type = $3 and semester like $4 and dept_name like $5", [courseNumber, courseName, "shortlisted", semester, department]);

    let applications_list = [];

    for (const application of result.rows) {

        const userResult = await db.query("SELECT currentgpa,name,creditscompletedatfau,email,mobilenumber,znumber,graduateprogram,department,enrollementstatus,citizenshipstatus,creditsplannedtoregisterforupcomingsemester,expectedgraduationdate FROM userprofile WHERE netid = $1", [application.netid.trim()]);

        applications_list.push({
            'netid': application.netid.trim(),
            'name': userResult.rows[0].name,
            'znumber': userResult.rows[0].znumber,
            'email': userResult.rows[0].email,
            'gpa': userResult.rows[0].currentgpa,
            'mobilenumber': userResult.rows[0].mobilenumber,
            'programType': userResult.rows[0].graduateprogram,
            'department': userResult.rows[0].department,
            'enrollementstatus': userResult.rows[0].enrollementstatus,
            'expectedgraduationdate': userResult.rows[0].expectedgraduationdate,
            'programstartDate': userResult.rows[0].programstartdate,
            'citizenshipstatus': userResult.rows[0].citizenshipstatus,
            'creditscompletedatfau': userResult.rows[0].creditscompletedatfau,
            'creditsplannedtoregisterforupcomingsemester': userResult.rows[0].creditsplannedtoregisterforupcomingsemester,
            'advisorname': userResult.rows[0].advisorname,
            'advisoremail': userResult.rows[0].advisoremail,

            'dept_name': application.dept_name.trim(),
            'semester': application.semester.trim(),
            'course_name': application.course_name.trim(),
            'course_title': application.course_title.trim(),
            'course_number': application.course_number,
            'a_grade': application.a_grade.trim(),
            'served_as_ta': application.served_as_ta.trim(),
            'professional_experience': application.professional_experience.trim(),
            'comments': application.comments.trim(),
            'applicationType': application.application_type,
            'applicationId': application.application_id,
            'notifiedApplicant': application.notified_applicant
        });
    }
    return applications_list;
}

// Function to fetch courses and their associated applications
async function fetch_courses_and_shortlistedApplications(semester, department) {
    try {
        // Use fetchCoursesByDeptAndSemester to fetch the courses
        const courses = await fetchCoursesByDeptAndSemester(department, semester);

        let coursesWithApplications = [];

        // Iterate over each course and fetch corresponding applications
        for (const course of courses) {
            const applications = await fetch_shortlisted_applications_by_courseNameNumberSemesterDepartment(
                course.course_name,
                course.course_number,
                semester,
                department
            );

            // Ensure applications are of the correct type (array) and merge them with the course data
            coursesWithApplications.push({
                ...course,
                applications: Array.isArray(applications) ? applications : [] // Attach the applications array
            });
        }

        return coursesWithApplications; // Return the array of courses with attached applications
    } catch (error) {
        console.error('Error fetching courses and applications:', error);
        throw error; // Handle errors appropriately
    }
}

app.get('/staff/getShortlistedApplications', checkSession, async (req, res) => {
    try {
        const semester = req.session.semester;
        const department = req.session.department;
        const department_abbre = department.split(" ")[0].toLowerCase();
        const data = await fetch_courses_and_shortlistedApplications(semester, department_abbre);
        res.json(data); // Send back the combined data as JSON
    } catch (error) {
        console.error('Error fetching courses and applications:', error);
        res.status(500).send('Server error');
    }
});

async function fetch_selected_applications_by_courseNameNumberSemesterDepartment(courseName, courseNumber, semester, department) {
    const result = await db.query("select * from applications where course_number like $1 and course_name like $2 and application_type = $3 and semester like $4 and dept_name like $5", [courseNumber, courseName, "selected", semester, department]);

    let applications_list = [];

    for (const application of result.rows) {

        const userResult = await db.query("SELECT currentgpa,name,creditscompletedatfau,email,mobilenumber,znumber,graduateprogram,department,enrollementstatus,citizenshipstatus,creditsplannedtoregisterforupcomingsemester,expectedgraduationdate,programstartdate FROM userprofile WHERE netid = $1", [application.netid.trim()]);

        applications_list.push({
            'netid': application.netid.trim(),
            'name': userResult.rows[0].name,
            'znumber': userResult.rows[0].znumber,
            'email': userResult.rows[0].email,
            'gpa': userResult.rows[0].currentgpa,
            'mobilenumber': userResult.rows[0].mobilenumber,
            'programType': userResult.rows[0].graduateprogram,
            'department': userResult.rows[0].department,
            'enrollementstatus': userResult.rows[0].enrollementstatus,
            'expectedgraduationdate': userResult.rows[0].expectedgraduationdate,
            'programstartDate': userResult.rows[0].programstartdate,
            'citizenshipstatus': userResult.rows[0].citizenshipstatus,
            'creditscompletedatfau': userResult.rows[0].creditscompletedatfau,
            'creditsplannedtoregisterforupcomingsemester': userResult.rows[0].creditsplannedtoregisterforupcomingsemester,
            'advisorname': userResult.rows[0].advisorname,
            'advisoremail': userResult.rows[0].advisoremail,

            'dept_name': application.dept_name.trim(),
            'semester': application.semester.trim(),
            'course_name': application.course_name.trim(),
            'course_title': application.course_title.trim(),
            'course_number': application.course_number,
            'a_grade': application.a_grade.trim(),
            'served_as_ta': application.served_as_ta.trim(),
            'professional_experience': application.professional_experience.trim(),
            'comments': application.comments.trim(),
            'applicationType': application.application_type,
            'applicationId': application.application_id,
            'notifiedApplicant' : application.notified_applicant,
        });
    }
    return applications_list;
}

// Function to fetch courses and their associated applications
async function fetch_courses_and_selectedApplications(semester, department) {
    try {

        const courses = await fetchCoursesByDeptAndSemester(department, semester);
        let coursesWithApplications = [];

        for (const course of courses) {
            // Fetch applications for each course

            const applications = await fetch_selected_applications_by_courseNameNumberSemesterDepartment(course.course_name, course.course_number, semester, department);
            coursesWithApplications.push({
                ...course,
                applications: applications // Attach the applications to the course
            });
        }

        return coursesWithApplications; // Return the combined data
    } catch (error) {
        console.error('Error fetching courses and applications:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

app.get('/staff/getSelectedApplications', checkSession, async (req, res) => {
    try {
        const semester = req.session.semester;
        const department = req.session.department;
        const department_abbre = department.split(" ")[0].toLowerCase();
        const data = await fetch_courses_and_selectedApplications(semester, department_abbre);
        res.json(data); // Send back the combined data as JSON
    } catch (error) {
        console.error('Error fetching courses and applications:', error);
        res.status(500).send('Server error');
    }
});

// Function to fetch applicants details
async function fetchApplicantDetails(deptName, semester, applicant_type) {
    try {
        const query = `
            SELECT netid, name, gpa, program_type AS programType, applicant_type, applicant_id, notified_applicant
            FROM applicants
            WHERE dept_name like $1 AND semester like $2 AND applicant_type = ANY($3)
            ORDER BY gpa desc;
        `;
        const results = await db.query(query, [deptName, semester, applicant_type]);
        return results.rows; // Return the rows from the result
    } catch (error) {
        console.error("Error fetching applicant details:", error);
        throw error; // Throw the error to handle it in calling function
    }
}

// Function to fetch course details
async function fetchCourseDetails(netid, deptName, semester) {
    try {
        const result = await db.query(`
            SELECT dept_name, semester, course_name, course_number, course_title, application_id, served_as_ta, a_grade, professional_experience,comments
            FROM applications 
            WHERE netid like $1 AND dept_name like $2 AND semester like $3
            ORDER BY course_name, course_number, course_title
        `, [netid.trim(), deptName, semester]);

        return result.rows; // Return the rows from the result
    } catch (error) {
        console.error("Error fetching course details:", error);
        throw error; // Throw the error to handle it in calling function
    }
}

// Fetch applicants with their courses
async function fetchApplicantsWithCourses(deptName, semester, applicant_type) {
    try {
        // Fetch applicant details first
        const applicants = await fetchApplicantDetails(deptName, semester, applicant_type);

        // Loop through each applicant and fetch their courses
        for (let applicant of applicants) {
            const courses = await fetchCourseDetails(applicant.netid, deptName, semester);
            applicant.courses = courses; // Attach the courses to the applicant object
        }
        return applicants; // Return the full data including courses for each applicant
    } catch (error) {
        console.error('Error fetching applicants with courses:', error);
        throw error;
    }
}

app.get('/fetchApplicants', checkSession, async (req, res) => {
    const semester = req.session.semester;
    const department = req.session.department;
    const department_abbre = department.split(" ")[0].toLowerCase();

    try {
        const applicants = await fetchApplicantsWithCourses(department_abbre, semester, ["new", "shortlisted", "selected"]);
        res.json(applicants);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applicants,thu', error: error.message });
    }
});

app.get('/fetchSelectedApplicants', checkSession, async (req, res) => {
    const semester = req.session.semester;
    const department = req.session.department;
    const department_abbre = department.split(" ")[0].toLowerCase();

    try {
        const applicants = await fetchApplicantsWithCourses(department_abbre, semester, ["selected"]);
        res.json(applicants);
    } catch (error) {
        console.error('Error fetching selected applicants:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch selected applicants', error: error.message });
    }
});

app.get('/fetchOnlySelectedApplicants', checkSession, async (req, res) => {
    const semester = req.session.semester;
    const department = req.session.department;
    const department_abbre = department.split(" ")[0].toLowerCase();

    try {
        const applicants = await fetchApplicantDetails(department_abbre, semester, ["selected"]);
        console.log(applicants);
        res.json(applicants);
    } catch (error) {
        console.error('Error fetching selected applicants:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch selected applicants', error: error.message });
    }
});



app.get('/fetchApplicantDetails', checkSession, async (req, res) => {
    const applicantNetid = req.query.ApplicantNetid;

    try {
        // Call the function to fetch applications by course number
        const userProfile = await fetchStudentDetails(applicantNetid);
        return res.json(userProfile); // Send applications data as JSON
    } catch (error) {
        console.error('Error fetching applicant Details:', error);
        return res.status(500).json({ error: 'Failed to fetch Complete Profile of Applicant' });
    }
});

app.post("/exportApplicants", async (req, res) => {
    let { selectedFields, selectedApplicationTypes } = req.body;
    try {

        if (typeof selectedFields === "object" && !Array.isArray(selectedFields)) {
            selectedFields = Object.keys(selectedFields).filter(key => selectedFields[key] === true);
        }

        if (typeof selectedApplicationTypes === "object" && !Array.isArray(selectedApplicationTypes)) {
            selectedApplicationTypes = Object.keys(selectedApplicationTypes).filter(key => selectedApplicationTypes[key] === true);
        }

        // Determine application types to filter by
        let applicantQuery = `SELECT DISTINCT netid FROM applicants`;
        let queryParams = [];

        if (selectedApplicationTypes.length > 0 && !selectedApplicationTypes.includes("allApplicants")) {
            // Only filter by specific types if "allApplicants" is not selected
            const types = selectedApplicationTypes.map(type => {
                if (type === "shortlistedApplicants") return "shortlisted";
                if (type === "selectedApplicants") return "selected";
            });

            applicantQuery += ` WHERE applicant_type = ANY($1::text[])`;
            queryParams.push(types);
        }

        const applicantResults = await db.query(applicantQuery, queryParams);
        const netids = applicantResults.rows.map(row => row.netid);

        // Step 2: Fetch user details based on netid
        if (netids.length === 0) {
            return res.status(404).send("No applicants found.");
        }

        const userDetailsQuery = `
            SELECT name, netid, znumber, currentgpa, email, mobilenumber, graduateprogram , programstartdate, expectedgraduationdate, 
                enrollementstatus , citizenshipstatus, creditscompletedatfau, creditsplannedtoregisterforupcomingsemester
            FROM userprofile
            WHERE netid = ANY($1::text[])
        `;

        const userDetailsResults = await db.query(userDetailsQuery, [netids]);

        const applicants = userDetailsResults.rows;

        // Filter the data based on selected fields
        const filteredData = applicants.map(applicant => {
            const filteredApplicant = {};
            selectedFields.forEach(field => {
                console.log(field, filteredApplicant[field], applicant[field]);
                if (applicant[field]) filteredApplicant[field] = applicant[field];
            });
            return filteredApplicant;
        });

        // Step 4: Create Excel file with filtered data
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(filteredData);
        xlsx.utils.book_append_sheet(workbook, worksheet, "Applicants");

        // Save the workbook to a temporary file
        const filePath = path.join(__dirname, "applicant_data.xlsx");
        xlsx.writeFile(workbook, filePath);

        // Send the file as a download
        res.download(filePath, "applicant_data.xlsx", (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).send("Error exporting applicant data.");
            }
            // Clean up the file after sending
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error("Error exporting applicant data:", error);
        res.status(500).send("Error exporting applicant data.");
    }
});

async function notify_applicant(applicantId, messageTitle, messageContent, netid) {
    try {
        await db.query('UPDATE applicants SET notified_applicant = $1 WHERE applicant_id = $2', [true, applicantId]);
    } catch (error) {
        console.error('Error updating applicants table:', error);
        throw new Error('Failed to update applicant notification status.');
    }

    try {
        // Check if a notification message already exists for this applicant
        const result = await db.query(
            'SELECT * FROM ta_notified_messages WHERE applicant_id = $1',
            [applicantId]
        );

        if (result.rows.length > 0) {
            // If a record exists, update the existing message
            await db.query(
                'UPDATE ta_notified_messages SET message_title = $1, message_content = $2, netid = $3 WHERE applicant_id = $4',
                [messageTitle, messageContent, netid, applicantId]
            );
        } else {
            // If no record exists, insert a new notification message
            await db.query(
                'INSERT INTO ta_notified_messages (applicant_id, message_title, message_content, netid) VALUES($1, $2, $3, $4)',
                [applicantId, messageTitle, messageContent, netid]
            );
        }
    } catch (error) {
        console.error('Error handling notification message:', error);
        throw new Error('Failed to insert or update notification message.');
    }

    // Send the notification email
    const toEmail = `${netid}@fau.edu`;
    const notifyApplicantSubject = `Notification for ${messageTitle}`;
    const notifyApplicantMessage = `Dear applicant,\n\n${messageContent}\n\nBest regards,\nAdmissions Team`;

    try {
        await sendNotifyEmail(toEmail, notifyApplicantSubject, notifyApplicantMessage);
        console.log('Notification email sent successfully.');
    } catch (error) {
        console.error('Error sending notification email:', error);
    }
}

app.post('/notifyApplicant', checkSession, async (req, res) => {
    const { applicantId, netid, messageTitle, messageContent } = req.body;

    if (!applicantId || !netid || !messageTitle || !messageContent) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        await notify_applicant(applicantId, messageTitle, messageContent, netid);
        res.status(200).json({ message: "Applicant notified successfully." });
    } catch (error) {
        console.error("Error occurred while notifying the applicant:", error);
        res.status(500).json({ message: "Error occurred while notifying the applicant.", error: error.message });
    }
});



































app.post("/committee/login", async (req, res) => {

    var netid = req.body.netid || "committee2023"; // Default value if empty
    var department = req.body.department || "EECS - Electrical Engineering and Computer Science"; // Default value if empty
    var semester = req.body.semester || "spring 2024"; // Default value if empty

    req.session.netid = netid; // Store netid in session
    req.session.department = department; // store dept in session
    req.session.semester = semester; // store semester in session

    req.session.save(err => {
        if (err) {
            console.error("Session save error:", err);
            res.status(500).send("Error saving session.");
        } else {
            res.sendFile(path.join(__dirname, 'public', 'pages', 'committee.html'));
        }
    });
});

app.get('/committee', checkSession, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'committee.html'));
});


























app.post("/admin/login", async (req, res) => {
    var netid = req.body.netid || "admin2023"; // Default value if empty

    req.session.netid = netid; // Store netid in session

    req.session.save(err => {
        if (err) {
            console.error("Session save error:", err);
            res.status(500).send("Error saving session.");
        } else {
            res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
        }
    });
});

app.get('/admin', checkSession, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

app.post('/newDepartment',checkSession, async (req, res) => {
    const { department_abbre, department_name } = req.body;

    const departmentAbbrLower = department_abbre.toLowerCase();
    const departmentNameLower = department_name.toLowerCase();

    try {
        // Check if a department with the same abbreviation already exists
        const checkDuplicate = await db.query(
            "SELECT * FROM department_list WHERE department_abbre = $1",
            [departmentAbbrLower.trim()]
        );

        if (checkDuplicate.rows.length > 0) {
            return res.json({
                success: false,
                message: "Department already exists with the same abbreviation.",
            });
        }

        // Insert new department
        await db.query(
            "INSERT INTO department_list (department_name, department_abbre) VALUES ($1, $2)",
            [departmentNameLower.trim(), departmentAbbrLower.trim()]
        );

        res.json({
            success: true,
            message: "Department created successfully.",
        });
    } catch (error) {
        console.error("Error inserting department:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred. Please try again.",
        });
    }
});

app.delete('/deleteDepartment/:departmentAbbre', checkSession, async (req, res) => {
    const departmentAbbre = req.params.departmentAbbre;

    try {
        const result = await db.query("DELETE FROM department_list WHERE department_abbre = $1 RETURNING *", [departmentAbbre]);

        if (result.rowCount > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Department not found." });
        }
    } catch (error) {
        console.error("Error deleting department:", error);
        res.status(500).json({ success: false, message: "An error occurred while deleting the department." });
    }
});

app.post('/newSemester', checkSession, async (req, res) => {
    const { semester, semesterStatus } = req.body;

    try {
        // Convert semester name to lowercase for consistency
        const semesterLower = semester.trim().toLowerCase();

        // Check if the semester already exists
        const checkDuplicate = await db.query(
            "SELECT * FROM semesters_list WHERE LOWER(semester) = $1",
            [semesterLower]
        );

        if (checkDuplicate.rows.length > 0) {
            return res.json({
                success: false,
                message: "Semester already exists.",
            });
        }

        // Insert the new semester with lowercase semester name
        await db.query(
            "INSERT INTO semesters_list (semester, status) VALUES ($1, $2)",
            [semesterLower, semesterStatus.trim().toLowerCase()]
        );

        res.json({
            success: true,
            message: "Semester created successfully.",
        });
    } catch (error) {
        console.error("Error inserting semester:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred. Please try again.",
        });
    }
});

app.delete('/deleteSemester/:semesterName',checkSession, async (req, res) => {
    const semesterName = req.params.semesterName.trim().toLowerCase();
    try {
        // Use ILIKE for case-insensitive matching
        const result = await db.query("DELETE FROM semesters_list WHERE LOWER(semester) = $1 RETURNING *", [semesterName]);

        if (result.rowCount > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Semester not found." });
        }
    } catch (error) {
        console.error("Error deleting semester:", error);
        res.status(500).json({ success: false, message: "An error occurred while deleting the semester." });
    }
});

app.post('/updateSemesterStatus', checkSession, async (req, res) => {
    const { semester, status } = req.body;

    // Validate the input
    if (!semester || !status) {
        return res.status(400).json({ success: false, message: 'Semester and status are required.' });
    }

    try {
        const semesterLower = semester.trim().toLowerCase();

        // Update the semester status in the database using lowercase
        const result = await db.query(
            `UPDATE semesters_list 
             SET status = $1 
             WHERE LOWER(semester) = $2`,
            [status.toLowerCase(), semesterLower]
        );

        if (result.rowCount > 0) {
            return res.status(200).json({ success: true, message: 'Semester status updated successfully.' });
        } else {
            return res.status(404).json({ success: false, message: 'Semester not found.' });
        }
    } catch (error) {
        console.error('Error updating semester status:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});













app.listen(port, () => {
    console.log(`Server running on port ${port} `);
});