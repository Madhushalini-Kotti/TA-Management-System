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
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destruction error:', err);
            return res.redirect('/'); // Redirect to home or handle error appropriately
        }
        res.redirect('/'); // Redirect after successful logout
    });
});









app.get('/currentYear', (req, res) => {
    const currentYear = new Date().getFullYear();
    res.json({ currentYear });
});

app.get('/currentDate', (req, res) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const date = String(currentDate.getDate()).padStart(2, '0');
    res.json({ year, month, date });
});

async function fetchCoursePrograms(department_abbre) {
    const result = await db.query(
        `SELECT courseprogramabbre, courseprogramname 
         FROM courseprograms 
         WHERE dept_name = $1`,
        [department_abbre]
    );

    return result.rows.map(course => ({
        courseprogram_abbre: course.courseprogramabbre.trim(),
        courseprogram_name: course.courseprogramname.trim()
    }));
}

async function fetchDepartmentList() {
    const result = await db.query("select * from department_list");

    let department_list = [];
    for (const dept of result.rows) {
        const coursePrograms = await fetchCoursePrograms(dept.department_abbre.trim()); // Fetch programs for each department

        department_list.push({
            'department_name': dept.department_name.trim(),
            'department_abbre': dept.department_abbre.trim(),
            'course_programs': coursePrograms
        });
    }
    return department_list;
}

async function fetchCourseProgramList() {
    const result = await db.query("select * from courseprograms");

    let courseprograms_list = [];
    for (const courseprogram of result.rows) {

        courseprograms_list.push({
            'courseprogram_name': courseprogram.courseprogramname.trim(),
            'courseprogram_abbre': courseprogram.courseprogramabbre.trim()
        });
    }
    return courseprograms_list;
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
            'semester_status': semester.status.trim(),
            'semester_deadline': semester.end_date,
        });
    }

    return semester_list;
}

app.get('/departmentList',checkSession, async (req, res) => {
    try {
        const departmentList = await fetchDepartmentList();  // Fetch the department list along with programs
        res.json(departmentList);  // Send the department list as a JSON response
    } catch (error) {
        console.error('Error fetching department list:', error);
        res.status(500).json({ success: false, message: 'Error fetching department list' });
    }
});

app.get('/courseProgramList',checkSession, async (req, res) => {
    try {
        const courseProgramList = await fetchCourseProgramList();
        res.json(courseProgramList);
    } catch (error) {
        console.error('Error fetching course program list:', error);
        res.status(500).json({ success: false, message: 'Error fetching course program list' }); 
    }
});

app.get('/semesterList',checkSession, async (req, res) => {
    try {
        const semesterList = await fetchSemesterList();  // Fetch the semester list from the database
        res.json(semesterList);  // Send the semester list as a JSON response
    } catch (error) {
        console.error('Error fetching semester list:', error);
        res.status(500).json({ success: false, message: 'Error fetching semester list' });
    }
});

app.get('/active-semesters', checkSession, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT semester FROM semesters_list WHERE status like 'active'`
        );
        const activeSemesters = result.rows.map(row => row.semester);
        res.json(activeSemesters);
    } catch (error) {
        console.error('Error fetching active semesters:', error);
        res.status(500).json({ error: 'Failed to fetch active semesters' });
    }
});

app.get('/semesterStatus', checkSession, async (req, res) => {
    const { semester } = req.query;
    try {
        const result = await db.query(
            `SELECT status FROM semesters_list WHERE semester like $1`, [semester]
        );
        if (result.rows.length > 0) {
            const status = result.rows[0].status.toLowerCase(); // Normalize case
            res.json({ status: status === 'active' ? 'active' : 'inactive' });
        } else {
            res.status(404).json({ error: 'Semester not found' });
        }
    } catch (error) {
        console.error('Error fetching Semester status:', error);
        res.status(500).json({ error: 'Failed to fetch semesters status' });
    }
});








app.post("/login", async (req, res) => {
    var netid = req.body.netid;

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
                res.sendFile(path.join(__dirname, 'public', 'pages', 'student.html'));
            }
        });
    }
});

app.get('/student', checkSession, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'student.html'));
});





async function fetchStudentDetails(netid) {
    let result = await db.query("select * from userprofile WHERE netid = $1", [netid]);

    // Return an object with empty strings for all fields
    if (result.rows.length === 0) {
        await db.query("insert into userprofile (netid) values($1) ", [netid]);
        result = await db.query("SELECT * FROM userprofile WHERE netid = $1", [netid]);
    }

    result = await db.query("select * from userprofile WHERE netid = $1", [netid]);
    const details = result.rows[0];

    return {
        'name': details.name || '',
        'netid': details.netid || '',
        'znumber': details.znumber || '',
        'email': details.email || '',
        'mobilenumber': details.mobilenumber || '',
        'graduateprogram': details.graduateprogram || '',
        'advisorname': details.advisorname || '',
        'advisoremail': details.advisoremail || '',
        'department': details.department || '',
        'courseprogram': details.courseprogram || '',
        'enrollementstatus': details.enrollementstatus || '',
        'expectedgraduationdate': details.expectedgraduationdate || '',
        'programstartdate': details.programstartdate || '',
        'citizenshipstatus': details.citizenshipstatus || '',
        'creditscompletedatfau': details.creditscompletedatfau || '',
        'creditsplannedtoregisterforupcomingsemester': details.creditsplannedtoregisterforupcomingsemester || '',
        'gpa': details.currentgpa || '',
        'workedforfau': details.workedforfau === true ? true : (details.workedforfau === false ? false : null),
        'externalwork': details.externalwork === true ? true : (details.externalwork === false ? false : null),
        'hoursofexternalwork': details.hoursofexternalwork || '',
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
        courseprogram,
        gpa,
        enrollementstatus,
        citizenshipstatus,
        creditscompleted,
        creditsplannedtoregister,
        semesterstartdate,
        expectedgraduationdate,
        workedforfau,
        externalwork,
        hoursofexternalwork

    } = req.body;

    try {

        await db.query('UPDATE userprofile SET name = $1, znumber = $2, mobilenumber = $3, graduateprogram = $4, advisorname = $5, advisoremail = $6, department = $7, courseprogram = $8, currentgpa = $9, enrollementstatus = $10,citizenshipstatus = $11,creditscompletedatfau = $12, creditsplannedtoregisterforupcomingsemester = $13, programstartdate = $14, expectedgraduationdate = $15, email = $16, workedforfau = $17, externalwork = $18, hoursofexternalwork = $19 WHERE netid = $20',
            [name, znumber, mobilenumber, graduateprogram, advisorname, advisoremail, department, courseprogram, gpa, enrollementstatus, citizenshipstatus, creditscompleted, creditsplannedtoregister, semesterstartdate, expectedgraduationdate,email, workedforfau, externalwork, hoursofexternalwork, netid]);

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

        const gpaResult = await db.query(
            "SELECT currentgpa FROM userprofile WHERE netid like $1",
            [netid]
        );

        const studentGpa = gpaResult.rows[0]?.currentgpa;

        // Check if the GPA exists and meets the minimum requirement
        if (studentGpa === null || parseFloat(studentGpa) < 3.4) {
            return res.status(400).send({
                message: "Application not submitted. GPA must be at least 3.4."
            });
        }

        // Check if the student has already reached the application limit for the department and semester
        const applicationCount = await db.query(
            "SELECT COUNT(*) FROM applications WHERE netid = $1 AND dept_name = $2 AND semester = $3",
            [netid, dept_name, semester]
        );

        if (parseInt(applicationCount.rows[0].count) >= 5) {
            return res.status(400).send({
                message: "Application limit reached. You cannot apply for more than 5 courses per department and semester."
            });
        }

        // Check if the same student (netid) has already applied for the same course
        const duplicateCheck = await db.query(
            "SELECT * FROM applications WHERE netid = $1 AND course_number = $2 AND course_name = $3 AND course_title = $4 AND dept_name = $5 AND semester = $6",
            [netid, course_number, course_name, course_title, dept_name, semester]
        );

        if (duplicateCheck.rows.length > 0) {
            // If a duplicate exists, send an error response
            return res.status(400).send({
                message: "You have already applied for this course. Duplicate applications are not allowed."
            });
        }

        // Generate a unique application_id
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
            return res.status(400).send({ // If netid is invalid
                message: "Couldn't Submit Application, Try again later."
            });
        }

        // Insert the new application into the database
        await db.query(
            "INSERT INTO applications (application_id, application_type, netid, dept_name, semester, a_grade, served_as_ta, professional_experience, comments, course_name, course_number, course_title) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)", [
            application_id, applicationStatus,
            netid,
            dept_name, semester,
            a_grade, served_as_ta, professional_experience,
            comments,
            course_name, course_number, course_title
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
                "INSERT INTO applicants (applicant_id, dept_name, semester, netid, applicant_type) VALUES ($1, $2, $3, $4, $5)",
                [applicant_id, dept_name, semester, netid, "new"]
            );
        }

        // Return success response
        res.status(201).send({ message: "Application Submitted Successfully" });

    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).send({ message: "Error submitting application" });
    }
});

async function fetchAllCoursesStudent(netid, semester) {

    const result = await db.query(
        "SELECT DISTINCT dept_name, semester, course_number, course_name, course_title FROM courses WHERE dept_name = $1 AND semester = $2 ORDER BY course_name, course_number, course_title",
        ["eecs", semester]
    );

    let courses_list = [];

    for (const course of result.rows) {

        const semesterStatusResult = await db.query("select status from semesters_list where semester like $1", [course.semester]);
        const semesterStatus = semesterStatusResult.rows[0].status;

        const appliedToCourseResult = await db.query("select * from applications where dept_name like $1 and semester like $2 and course_name = $3 and course_number = $4 and netid = $5", [course.dept_name, course.semester, course.course_name, course.course_number, netid]);
        const appliedToCourse = appliedToCourseResult.rows.length === 1;

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
            'applied': appliedToCourse,
        });

    };

    // Sort courses so that applied courses come first
    courses_list.sort((a, b) => {
        if (a.applied === b.applied) {
            return 0;
        }
        return a.applied ? -1 : 1; // Apply courses should come first
    });

    return courses_list;

}

app.get("/CoursesListBySemesterInStudent", checkSession, async (req, res) => {
    const netid = req.session.netid;
    const semester = req.query.semester;
    try {
        const courses = await fetchAllCoursesStudent(netid, semester);  
        res.json(courses);
    } catch (error) {
        console.error("Error fetching Courses:", error); 
        res.status(500).json({ error: 'Failed to fetch courses' });
    }
});







async function fetchApplicationsBySemesterInStudent(netid, semester) {

    const result = await db.query("select * from applications where netid = $1 AND semester = $2 ORDER BY course_name, course_number, course_title", [netid, semester]);

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

app.get('/ApplicationsListBySemesterInStudent', checkSession, async (req, res) => {
    
    const semester = req.query.semester;
    const netid = req.session.netid;

    try {
        const applications = await fetchApplicationsBySemesterInStudent(netid, semester);
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

async function fetchApplicationsForUser(netid, semester, deptName) {
    const result = await db.query(`
        SELECT * FROM applications 
        WHERE netid = $1 AND semester = $2 AND dept_name = $3
    `, [netid, semester, deptName]);

    return result.rows;
}

async function deleteApplicantIfNoApplications(netid, semester, deptName) {
    const applications = await fetchApplicationsForUser(netid, semester, deptName);

    if (applications.length === 0) {
        // If no applications are left for this netid, semester, and deptName, check applicant status
        const result = await db.query(`
            SELECT * FROM applicants 
            WHERE netid = $1 AND semester = $2 AND dept_name = $3
        `, [netid, semester, deptName]);

        const applicant = result.rows[0];

        if (applicant && applicant.status === 'new') {
            // Delete the applicant if the status is 'new'
            await db.query(`
                DELETE FROM applicants 
                WHERE netid = $1 AND semester = $2 AND dept_name = $3
            `, [netid, semester, deptName]);
        }
    }
}

app.delete('/deleteApplication/:id', checkSession, async (req, res) => {
    const applicationId = req.params.id;

    try {

        const applicationResult = await db.query(`
            SELECT * FROM applications 
            WHERE application_id = $1
        `, [applicationId]);

        if (applicationResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        const application = applicationResult.rows[0];
        const { netid, semester, dept_name } = application;

        await deleteApplication(applicationId);

        await deleteApplicantIfNoApplications(netid, semester, dept_name);

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
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

app.get('/staff', checkSession, async (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'staff.html'));
}); 






/* Courses Page */

async function fetchTAsForCourse(courseName, courseNumber, semester, department) {
    try {
        const result = await db.query(`
            SELECT 
                applicant_netid, 
                (SELECT name FROM userprofile WHERE netid = course_assignment_details.applicant_netid LIMIT 1) AS name,
                ta_hours
            FROM course_assignment_details 
            WHERE course_name = $1 
                AND course_number = $2 
                AND semester = $3 
                AND department = $4
        `, [courseName, courseNumber, semester, department]);

        return result.rows;
    } catch (error) {
        console.error("Error fetching TAs for course:", error);
        throw error;
    }
}

async function fetchCoursesBySemester(semester) {
    try {
        const coursesResult = await db.query(`
            SELECT course_name, course_number, course_title, dept_name, sections, ta_hours_total, ta_hours_assigned, no_of_ta_assigned
            FROM courses
            WHERE semester = $1
            ORDER BY course_name, course_number
        `, [semester]);

        const courses = coursesResult.rows;

        for (let course of courses) {
            const taList = await fetchTAsForCourse(course.course_name, course.course_number, semester, course.dept_name);
            course.tas = taList;
        }

        return courses;
    } catch (error) {
        console.error('Error fetching courses from database:', error);
        throw error;
    }
    
}

app.get('/CoursesListBySemester', checkSession, async (req, res) => {
    
    const semester = req.query.semester;
    try {
        const coursesWithTAs = await fetchCoursesBySemester(semester);
        res.json(coursesWithTAs);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

async function insertRowsIntoDatabase(rows, semester, deptName) {

    try {
        // Looping through each row from the CSV file
        for (const row of rows) {

            const courseNumber = row['course number'];
            const courseName = row['course name'];
            const courseTitle = row['course title'];

            let sections = parseInt(row['sections'], 10);
            let taHoursTotal = parseInt(row['ta hours total'], 10);

            if (isNaN(sections)) sections = 1; // Default to 1 section
            if (isNaN(taHoursTotal)) taHoursTotal = 0; // Default to 0 TA hours

            await db.query(`
                INSERT INTO courses (
                    dept_name, semester, course_name, course_number, 
                    course_title, sections, ta_hours_total, ta_hours_assigned, no_of_ta_assigned
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (dept_name, semester, course_number, course_name) DO UPDATE
                SET 
                    course_title = EXCLUDED.course_title,
                    sections = EXCLUDED.sections,
                    ta_hours_total = EXCLUDED.ta_hours_total;`,
                [deptName, semester, courseName, courseNumber, courseTitle, sections, taHoursTotal, 0, 0]
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

app.post('/add_multiple_courses',checkSession, upload.single('csvFile'), async (req, res) => {
    
    const filePath = req.file.path;
    const semester = req.body.semester;
    const dept_name = "eecs";

    try {
        const rows = await extractRowsFromCSV(filePath);
        await insertRowsIntoDatabase(rows, semester, dept_name);
        res.json({ success: true, message: 'Application shortlisted successfully' });

    } catch (error) {

        console.error('Error extracting rows from CSV or inserting into database:', error);
        res.status(500).json({ success: false, message: 'Internal server error. Could not process the CSV file.' });

    }

});

app.post('/add_single_course', checkSession, async (req, res) => {
    const { courseTitle, courseName, courseNumber, sections, taHoursTotal, semester } = req.body;
    const dept_name = "eecs";

    try {
        await db.query(`
            INSERT INTO courses (dept_name, semester, course_number, course_name, course_title, sections, ta_hours_total, ta_hours_assigned, no_of_ta_assigned)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (dept_name, semester, course_number, course_name) DO UPDATE
            SET 
                course_title = EXCLUDED.course_title,
                sections = EXCLUDED.sections,
                ta_hours_total = EXCLUDED.ta_hours_total;`,
            [dept_name, semester, courseNumber, courseName, courseTitle, sections, taHoursTotal, 0, 0]
        );

        res.json({ success: true, message: 'Course uploaded successfully' });
    } catch (error) {
        console.error('Error inserting course into the database:', error);
        res.status(500).json({ success: false, message: 'Error uploading the course' });
    }
});

app.post('/delete_single_course',checkSession, async (req, res) => {

    const courseNumber = req.body.courseNumber;
    const courseName = req.body.courseName;
    const dept_name = "eecs";
    const semester = req.body.semester; 

    try {
        // Deleting Course
        await db.query(`
            DELETE FROM courses where course_number like $1 and course_name like $2 and dept_name like $3 and semester like $4`, [courseNumber,courseName, dept_name, semester]);
        res.json({ success: true, message: 'Course deleted successfully' });
    } catch {
        console.error('Error deleting the course:', error);
        res.json({ success: false, message: 'Error deleting the course' });
    }
    
});

app.post('/updateCourse/:courseNumber', async (req, res) => {
    const { course_name, course_number, semester, ta_hours_total, sections} = req.body;
    const courseNumber = req.params.courseNumber;

    try {
        const courseResult = await db.query('SELECT * FROM courses WHERE course_number = $1 and course_name = $2 and semester = $3 and dept_name = $4', [courseNumber, course_name, semester, "eecs"]);

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const updateResult = await db.query(`
            UPDATE courses
            SET 
                sections = $1,
                ta_hours_total = $2
            WHERE 
                course_name = $3
                AND course_number = $4
                AND semester = $5
                AND dept_name = $6
            RETURNING *
        `, [sections, ta_hours_total, course_name, courseNumber, semester, "eecs"]);

        if (updateResult.rowCount > 0) {
            res.status(200).json({ success: true, message: 'Course updated successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to update course' });
        }

    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});




/* Applicants Page */

async function fetchCourseDetails(netid, semester) {
    try {
        const result = await db.query(`
            SELECT dept_name, semester, course_name, course_number, course_title, application_id, served_as_ta, a_grade, professional_experience, comments
            FROM applications
            WHERE netid = $1 AND dept_name = $2 AND semester = $3
            ORDER BY course_name, course_number, course_title
        `, [netid.trim(), "eecs", semester]);

        return result.rows;
    } catch (error) {
        console.error("Error fetching course details:", error);
        throw error;
    }
}

async function fetchAssignedCoursesDetails(applicantId, semester) {
    try {
        const result = await db.query(`
            SELECT semester, course_name, course_number, course_title, ta_hours
            FROM course_assignment_details
            WHERE applicant_id = $1 AND department = $2 AND semester = $3
            ORDER BY course_name, course_number, course_title
            `, [applicantId, "eecs", semester]);
        
        return result.rows;
    } catch (error) {
        console.error("Error fetching assigned course details:", error);
        throw error;
    }
}

async function fetchApplicantsWithCoursesAndAssignedCourses(applicant_types, semester) {
    try {
        const query = `
            SELECT netid, applicant_type, applicant_id, notified_applicant, course_assigned, semester, dept_name
            FROM applicants
            WHERE dept_name = $1 AND semester LIKE $2 AND applicant_type = ANY($3);
        `;

        const results = await db.query(query, ["eecs", semester, applicant_types]);
        const applicants = results.rows;

        for (let applicant of applicants) {
            const studentDetails = await fetchStudentDetails(applicant.netid);
            applicant.name = studentDetails.name;
            applicant.gpa = studentDetails.gpa;
            applicant.programtype = studentDetails.graduateprogram;
            applicant.courseAssigned = applicant.course_assigned;

            const courses = await fetchCourseDetails(applicant.netid, semester);
            applicant.courses = courses;

            const assignedcourses = await fetchAssignedCoursesDetails(applicant.applicant_id, semester);
            applicant.assignedcourses = assignedcourses;
        }

        applicants.sort((a, b) => parseFloat(b.gpa) - parseFloat(a.gpa));

        return applicants;

    } catch (error) {
        console.error('Error fetching applicants with courses:', error);
        throw error;
    }
}

app.get('/fetchApplicantsBySemester', checkSession, async (req, res) => {

    const semester = req.query.semester;

    try {
        const applicants = await fetchApplicantsWithCoursesAndAssignedCourses(["new", "shortlisted", "selected"], semester);
        res.json(applicants);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applicants', error: error.message });
    }
});

app.get('/fetchApplicantDetails', checkSession, async (req, res) => {
    const applicantNetid = req.query.ApplicantNetid;

    if (!applicantNetid) {
        return res.status(400).json({ success: false, message: 'Couldnt fetch details' });
    }
    try { 
        const result = await fetchStudentDetails(applicantNetid);
        res.json(result);
    } catch (error) {
        console.error('Error fetching applicant details:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applicant details', error: error.message });
    }

});

app.get('/shortlistApplicant', checkSession, async (req, res) => {
    const applicantId = req.query.applicantId;
    const semester = req.query.semester;

    if (!applicantId) {
        return res.status(400).json({
            error: 'Couldn\'t Shortlist Applicant'
        });
    }

    try {
        await db.query('Update applicants set applicant_type = $1 where applicant_id = $2 AND semester = $3 AND dept_name = $4', ["shortlisted", applicantId, semester, "eecs"]);
        res.json({ success: true, message: 'Applicant shortlisted successfully' });
    } catch (error) {
        console.error('Error shortlisting Applicant:', error);
        return res.status(500).json({ error: 'Couldn\'t shortlist Applicant, Try Again Later' });
    }

});

app.get('/selectApplicant', checkSession, async (req, res) => {
    const applicantId = req.query.applicantId;
    const semester = req.query.semester;

    if (!applicantId) {
        return res.status(400).json({
            error: 'Couldn\'t Select Applicant'
        });
    }

    try {
        await db.query('Update applicants set applicant_type = $1 where applicant_id = $2 and semester = $3 and dept_name = $4', ["selected", applicantId, semester, "eecs"]);
        res.json({ success: true, message: 'Applicant selected successfully' });
    } catch (error) {
        console.error('Error selecting Applicant:', error);
        return res.status(500).json({ error: 'Couldn\'t select Applicant, Try Again Later' });
    }

});

app.get('/unShortlistApplicant', checkSession, async (req, res) => {
    const applicantId = req.query.applicantId;
    const semester = req.query.semester;

    if (!applicantId) {
        return res.status(400).json({
            error: 'Couldn\'t Un  Shortlist Applicant'
        });
    }

    try {
        await db.query('Update applicants set applicant_type = $1 where applicant_id = $2 and semester = $3 and dept_name = $4', ["new", applicantId, semester, "eecs"]);
        res.json({ success: true, message: 'Applicant Un shortlisted successfully' });
    } catch (error) {
        console.error('Error Un shortlisting Applicant:', error);
        return res.status(500).json({ error: 'Couldn\'t Un shortlist Applicant, Try Again Later' });
    }

});

app.get('/unSelectApplicant', checkSession, async (req, res) => {
    const applicantId = req.query.applicantId;
    const semester = req.query.semester;

    if (!applicantId) {
        return res.status(400).json({
            error: 'Couldn\'t Un Select Applicant'
        });
    }

    try {
        await db.query('Update applicants set applicant_type = $1 where applicant_id = $2 and semester = $3 and dept_name = $4', ["new", applicantId, semester, "eecs"]);
        await db.query('update applicants set course_assigned = $1 where applicant_id = $2 and semester = $3 and dept_name = $4', [false, applicantId, semester, "eecs"]);
        await db.query('delete from course_assignment_details where applicant_id = $1 and semester = $2 and department = $3', [applicantId, semester, "eecs"]);
        res.json({ success: true, message: 'Applicant Un selected successfully' });
    } catch (error) {
        console.error('Error Un selecting Applicant:', error);
        return res.status(500).json({ error: 'Couldn\'t Un select Applicant, Try Again Later' });
    }

});






app.post("/exportApplicants", checkSession, async (req, res) => {
    let { fileName, selectedFields, selectedApplicationTypes } = req.body;
    fileName = fileName || 'applicant_data';
    try {

        if (typeof selectedFields === "object" && !Array.isArray(selectedFields)) {
            selectedFields = Object.keys(selectedFields).filter(key => selectedFields[key] === true);
        }

        if (typeof selectedApplicationTypes === "object" && !Array.isArray(selectedApplicationTypes)) {
            selectedApplicationTypes = Object.keys(selectedApplicationTypes).filter(key => selectedApplicationTypes[key] === true);
        }

        let applicantQuery = `SELECT DISTINCT netid FROM applicants`;
        let queryParams = [];

        if (selectedApplicationTypes.length > 0 && !selectedApplicationTypes.includes("allApplicants")) {
            const types = selectedApplicationTypes.map(type => {
                if (type === "shortlistedApplicants") return "shortlisted";
                if (type === "selectedApplicants") return "selected";
            });

            applicantQuery += ` WHERE applicant_type = ANY($1::text[])`;
            queryParams.push(types);
        }

        const applicantResults = await db.query(applicantQuery, queryParams);
        const netids = applicantResults.rows.map(row => row.netid);

        if (netids.length === 0) {
            return res.status(404).send("No applicants found.");
        }

        const userDetailsQuery = `
            SELECT name, netid, znumber, currentgpa, courseprogram, department,  email, mobilenumber, graduateprogram , programstartdate, expectedgraduationdate,
                enrollementstatus , citizenshipstatus, creditscompletedatfau, creditsplannedtoregisterforupcomingsemester, workedforfau, externalwork, hoursofexternalwork
            FROM userprofile
            WHERE netid = ANY($1::text[])
        `;

        const userDetailsResults = await db.query(userDetailsQuery, [netids]);

        const applicants = userDetailsResults.rows;

        const filteredData = applicants.map(applicant => {
            const filteredApplicant = {};
            selectedFields.forEach(field => {
                filteredApplicant[field] = applicant[field] || '-';
            });
            return filteredApplicant;
        });

        //Create Excel file with filtered data
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(filteredData);
        xlsx.utils.book_append_sheet(workbook, worksheet, "Applicants");

        const filePath = path.join(__dirname, `${fileName}.xlsx`);
        xlsx.writeFile(workbook, filePath);

        res.download(filePath, `${fileName}.xlsx`, (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).send("Error exporting applicant data.");
            }
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














/* Selected Applicants Page */

app.get('/fetchSelectedApplicantsBySemester', checkSession, async (req, res) => {

    const semester = req.query.semester;

    try {
        const applicants = await fetchApplicantsWithCoursesAndAssignedCourses(["selected"], semester);
        res.json(applicants);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch applicants,thu', error: error.message });
    }
});

app.post('/assignCourse', checkSession, async (req, res) => {
    const { applicantId, applicantNetid, courseHours, courseNumber, courseName, courseTitle, semester } = req.body;
    const department = "eecs";

    if (applicantId && courseHours && courseNumber && courseName && courseTitle) {
        try {

            const { rows } = await db.query(
                `SELECT * FROM course_assignment_details 
                 WHERE applicant_id = $1 AND course_number = $2 AND course_name = $3 AND semester = $4 AND department = $5`,
                [applicantId, courseNumber, courseName, semester, department]
            );

            if (rows.length > 0) {
                return res.status(400).json({ error: "Course already assigned to this applicant." });
            }

            await db.query(
                `INSERT INTO course_assignment_details 
                (applicant_id, applicant_netid, ta_hours, course_number, course_name, course_title, department, semester) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [applicantId, applicantNetid, courseHours, courseNumber, courseName, courseTitle, department, semester]
            );

            await db.query(
                `UPDATE applicants set course_assigned = $1 where applicant_id = $2`, [true, applicantId]
            );

            const courseResult = await db.query(
                `SELECT ta_hours_assigned, no_of_ta_assigned FROM courses 
                 WHERE course_number = $1 AND course_name = $2 AND semester = $3 AND dept_name = $4`,
                [courseNumber, courseName, semester, department]
            );

            if (courseResult.rows.length > 0) {

                const currentTaHoursAssigned = Number(courseResult.rows[0].ta_hours_assigned) || 0;
                const currentNoOfTaAssigned = Number(courseResult.rows[0].no_of_ta_assigned) || 0;

                await db.query(
                    `UPDATE courses SET ta_hours_assigned = $1, no_of_ta_assigned = $2 
                     WHERE course_number = $3 AND course_name = $4 AND semester = $5 AND dept_name = $6`,
                    [
                        currentTaHoursAssigned + courseHours, 
                        currentNoOfTaAssigned + 1, 
                        courseNumber, courseName, semester, department
                    ]
                );
            }

            res.json({ message: "Course assigned successfully!" });
        } catch (error) {
            console.error("Error inserting into course_assignment_details:", error);
            res.status(500).json({ error: "Failed to assign course. Please try again." });
        }
    } else {
        res.status(400).json({ error: "Invalid data provided." });
    }
});

app.post('/removeAssignedCourse', checkSession, async (req, res) => {
    const { applicantId, courseName, courseNumber, semester} = req.body;

    if (applicantId && courseNumber && courseName && semester) {
        try {

            const result = await db.query(
                `SELECT ta_hours FROM course_assignment_details 
                 WHERE applicant_id = $1 AND course_number = $2 AND course_name = $3 AND semester = $4 AND department = $5`,
                [applicantId, courseNumber, courseName, semester, "eecs"]
            );

            if (result.rows.length === 0) {
                return res.status(400).json({ error: "Course assignment not found for this applicant." });
            }

            const taHours = result.rows[0].ta_hours;

            await db.query(
                `DELETE FROM course_assignment_details 
                 WHERE applicant_id = $1 AND course_number = $2 AND course_name = $3 AND semester = $4 AND department = $5`,
                [applicantId, courseNumber, courseName, semester, "eecs"]
            );

            const courseResult = await db.query(
                `SELECT ta_hours_assigned, no_of_ta_assigned 
                 FROM courses WHERE course_number = $1 AND course_name = $2 AND semester = $3 AND dept_name = $4`,
                [courseNumber, courseName, semester, "eecs"]
            );

            if (courseResult.rows.length > 0) {
                const currentTaHoursAssigned = courseResult.rows[0].ta_hours_assigned || 0;
                const currentNoOfTaAssigned = courseResult.rows[0].no_of_ta_assigned || 0;

                const newTaHoursAssigned = Math.max(currentTaHoursAssigned - taHours, 0);
                const newNoOfTaAssigned = Math.max(currentNoOfTaAssigned - 1, 0);

                // Update the courses table: decrement ta_hours_assigned and no_of_ta_assigned
                await db.query(
                    `UPDATE courses SET 
                     ta_hours_assigned = $1, 
                     no_of_ta_assigned = $2 
                     WHERE course_number = $3 AND course_name = $4 AND semester = $5 AND dept_name = $6`,
                    [
                        newTaHoursAssigned,
                        newNoOfTaAssigned, 
                        courseNumber, courseName, semester, "eecs"
                    ]
                );
            }

            const { rows } = await db.query(
                `SELECT COUNT(*) FROM course_assignment_details 
                 WHERE applicant_id = $1 AND semester = $2 and department = $3`,
                [applicantId, semester, "eecs"]
            );

            if (parseInt(rows[0].count) === 0) {
                // If no courses are assigned, update the applicant's status
                await db.query(
                    `UPDATE applicants 
                     SET course_assigned = $1 
                     WHERE applicant_id = $2 AND semester = $3 AND dept_name = $4`,
                    [false, applicantId, semester, "eecs"]
                );
            }

            res.json({ message: "Assigned course removed successfully!" });

        } catch (error) {
            console.error("Error removing assigned course:", error);
            res.status(500).json({ error: "Failed to remove assigned course. Please try again." });
        }
    }

});

app.post('/updateAssignedCourse', checkSession, async (req, res) => {
    const { applicantId, courseName, courseNumber, updatedHours, semester } = req.body;
    const department = "eecs";

    if (applicantId && courseName && courseNumber && updatedHours && semester) {
        try {

            const { rows } = await db.query(
                `SELECT * FROM course_assignment_details 
                 WHERE applicant_id = $1 AND course_number = $2 AND course_name = $3 AND semester = $4 AND department = $5`,
                [applicantId, courseNumber, courseName, semester, department]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: "Course assignment not found." });
            }

            await db.query(
                `UPDATE course_assignment_details 
                 SET ta_hours = $1 
                 WHERE applicant_id = $2 AND course_number = $3 AND course_name = $4 AND semester = $5 AND department = $6`,
                [updatedHours, applicantId, courseNumber, courseName, semester, department]
            );

            const courseResult = await db.query(
                `SELECT ta_hours_assigned FROM courses 
                 WHERE course_number = $1 AND course_name = $2 AND semester = $3 AND dept_name = $4`,
                [courseNumber, courseName, semester, department]
            );

            if (courseResult.rows.length > 0) {
                const currentTaHoursAssigned = Number(courseResult.rows[0].ta_hours_assigned) || 0;
                const previousHours = Number(rows[0].ta_hours) || 0;
                const newUpdatedHours = Number(updatedHours) || 0;

                const totalUpdatedHours = currentTaHoursAssigned - previousHours + newUpdatedHours;

                await db.query(
                    `UPDATE courses 
                     SET ta_hours_assigned = $1 
                     WHERE course_number = $2 AND course_name = $3 AND semester = $4 AND dept_name = $5`,
                    [totalUpdatedHours, courseNumber, courseName, semester, department]
                );
            }

            res.json({ message: "Course assignment updated successfully!" });

        } catch (error) {
            console.error("Error updating course assignment details:", error);
            res.status(500).json({ error: "Failed to update course assignment. Please try again." });
        }
    }

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
            await db.query("DELETE FROM courseprograms WHERE dept_name = $1", [departmentAbbre]);
            res.json({ success: true });
        } else {
            res.json({ success: false, message: "Department not found." });
        }
    } catch (error) {
        console.error("Error deleting department:", error);
        res.status(500).json({ success: false, message: "An error occurred while deleting the department." });
    }
});

async function addProgramToDepartment(dept_abbre, program_abbre, program_name) {
    try {
        const checkDuplicate = await db.query(
            "SELECT * FROM courseprograms WHERE courseprogramabbre = $1 AND dept_name = $2",
            [program_abbre, dept_abbre]
        );

        if (checkDuplicate.rows.length > 0) {
            return { success: false, message: "Program already exists for this department." };
        }

        await db.query(
            "INSERT INTO courseprograms (courseprogramabbre, courseprogramname, dept_name) VALUES ($1, $2, $3)",
            [program_abbre, program_name, dept_abbre]
        );

        return { success: true, message: "Program added successfully." };
    } catch (error) {
        console.error("Error adding program to department:", error);
        return { success: false, message: "An error occurred while adding the program." };
    }
}

app.post('/addNewProgram', async (req, res) => {
    const { dept_abbre, courseprogram_abbre, courseprogram_name } = req.body;

    const courseProgramAbbreLower = courseprogram_abbre.toLowerCase();
    const courseProgramNameLower = courseprogram_name.toLowerCase();

    try {
        const success = await addProgramToDepartment(dept_abbre, courseProgramAbbreLower, courseProgramNameLower);
        if (success) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Failed to add program.' });
        }
    } catch (error) {
        console.error('Error adding program:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.delete('/deleteProgram', async (req, res) => {

    const { dept_name, programAbbre } = req.query;

    if (!dept_name || !programAbbre) {
        return res.json({ success: false, message: 'Missing required parameters.' });
    }

    try {
        const result = await db.query("DELETE FROM courseprograms WHERE dept_name = $1 AND courseprogramabbre = $2 RETURNING *", [dept_name, programAbbre]);

        if (result.rowCount > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Program not found or could not be deleted.' });
        }
    } catch (error) {
        console.error("Error deleting program:", error);
        res.json({ success: false, message: 'An error occurred. Please try again.' });
    }

});

import cron from 'node-cron';
cron.schedule('0 0 * * *', async () => {
    console.log("Running daily semester status check...");

    try {
        const todayDate = new Date().toISOString().split('T')[0]; // today's date in YYYY-MM-DD format

        // Updating the status of semesters where the end_date is today or earlier
        const result = await db.query(
            "UPDATE semesters_list SET status = 'inactive' WHERE date <= $1 AND status != 'inactive'",
            [todayDate]
        );

        console.log(`Semester status update complete. Rows affected: ${result.rowCount}`);
    } catch (error) {
        console.error("Error updating semester status:", error);
    }
});

app.post('/newSemester', checkSession, async (req, res) => {
    const { semester, semesterStatus, semesterEndDate } = req.body;

    try {

        const semesterLower = semester.trim().toLowerCase();

        // Checking if the semester already exists
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

        await db.query(
            "INSERT INTO semesters_list (semester, status, end_date) VALUES ($1, $2, $3)",
            [semesterLower, semesterStatus.trim().toLowerCase(), semesterEndDate]
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

app.post('/updateSemester', checkSession, async (req, res) => {
    const { semester, status, deadline } = req.body;

    if (!semester) {
        return res.status(400).json({ success: false, message: 'Semester is required.' });
    }
    if (!status && !deadline) {
        return res.status(400).json({ success: false, message: 'At least one of status or deadline is required.' });
    }

    try {

        const semesterLower = semester.trim().toLowerCase();

        const currentSemesterData = await db.query(
            `SELECT semester, status, end_date FROM semesters_list WHERE LOWER(semester) = $1`,
            [semesterLower]
        );

        if (currentSemesterData.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Semester not found.' });
        }

        const currentData = currentSemesterData.rows[0];
        let updatedFields = [];

        if (status && status.toLowerCase() !== currentData.status) {
            updatedFields.push('status');
        }

        let updatedDeadline = null;
        if (deadline && deadline !== currentData.end_date) {
            updatedDeadline = new Date(deadline).toISOString().split('T')[0];
            updatedFields.push('end_date');
        }

        if (updatedFields.length === 0) {
            return res.status(200).json({ success: true, message: 'No changes detected for this semester.' });
        }

        const updateFields = [];
        const updateValues = [];

        if (updatedFields.includes('status')) {
            updateFields.push('status');
            updateValues.push(status.toLowerCase());
        }
        if (updatedFields.includes('end_date')) {
            updateFields.push('end_date');
            updateValues.push(updatedDeadline);
        }

        const updateQuery = `
            UPDATE semesters_list
            SET ${updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ')}
            WHERE LOWER(semester) = $${updateFields.length + 1}
        `;
        updateValues.push(semesterLower);

        const result = await db.query(updateQuery, updateValues);

        if (result.rowCount > 0) {
            return res.status(200).json({ success: true, message: 'Semester updated successfully.' });
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