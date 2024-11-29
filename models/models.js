import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js'; 

const Applicant = sequelize.define('Applicant', {
    dept_name: {
        type: DataTypes.STRING(150),
        allowNull: true,  
    },
    semester: {
        type: DataTypes.STRING(150),
        allowNull: true,  
    },
    netid: {
        type: DataTypes.STRING(150),
        allowNull: true, 
    },
    applicant_type: {
        type: DataTypes.STRING(150),
        allowNull: true,  
    },
    applicant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        allowNull: false,
    },
    notified_applicant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,  
    },
    course_assigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
    },
}, {
    tableName: 'applicants',  
    timestamps: false, 
});

const Application = sequelize.define('Application', {
    netid: {
        type: DataTypes.STRING(20),
        allowNull: true,  
    },
    dept_name: {
        type: DataTypes.STRING(50),
        allowNull: true, 
    },
    semester: {
        type: DataTypes.STRING(20),
        allowNull: true, 
    },
    a_grade: {
        type: DataTypes.STRING(50),
        allowNull: true, 
    },
    served_as_ta: {
        type: DataTypes.STRING(50),
        allowNull: true, 
    },
    professional_experience: {
        type: DataTypes.STRING(50),
        allowNull: true, 
    },
    comments: {
        type: DataTypes.STRING(500),
        allowNull: true, 
    },
    course_name: {
        type: DataTypes.STRING(50),
        allowNull: true,  
    },
    course_title: {
        type: DataTypes.STRING(100),
        allowNull: true,  
    },
    application_id: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        allowNull: false, 
    },
    course_number: {
        type: DataTypes.STRING(10),
        allowNull: true,  
    },
    notified_applicant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,  
    },
    application_type: {
        type: DataTypes.STRING(100),
        allowNull: true,  
    },
}, {
    tableName: 'applications',  
    timestamps: false,
});

const CourseAssignmentDetail = sequelize.define('CourseAssignmentDetail', {
    applicant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    applicant_netid: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    course_name: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    course_number: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    course_title: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    ta_hours: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    department: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    semester: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
}, {
    tableName: 'course_assignment_details',
    timestamps: false, // No timestamps in the table
    primaryKey: ['applicant_id', 'course_name', 'course_number'],
});

const CourseProgram = sequelize.define('CourseProgram', {
    dept_name: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    courseprogramabbre: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    courseprogramname: {
        type: DataTypes.STRING(150),
        allowNull: true,
    },
}, {
    tableName: 'courseprograms',
    timestamps: false,  // No timestamps in the table
});

const Course = sequelize.define('Course', {
    dept_name: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    semester: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    course_number: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    course_name: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    course_title: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    ta_hours_total: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ta_hours_assigned: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    no_of_ta_assigned: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sections: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'courses',
    timestamps: false,  // No timestamps in the table
    primaryKey: ['dept_name', 'semester', 'course_number', 'course_name'],  // Add composite primary key
    indexes: [
        {
            unique: true,
            fields: ['dept_name', 'semester', 'course_number', 'course_name'],
        },
    ],
});

const DepartmentList = sequelize.define('DepartmentList', {
    department_name: {
        type: DataTypes.STRING(50),
        allowNull: true,  // department_name is optional
    },
    department_abbre: {
        type: DataTypes.STRING(50),
        primaryKey: true,  // department_abbre is the primary key
        allowNull: false,  // department_abbre cannot be null
    },
}, {
    tableName: 'department_list',  // Specify the table name
    timestamps: false,  // No timestamps in the table
});

const SemestersList = sequelize.define('SemestersList', {
    semester: {
        type: DataTypes.STRING(40),
        primaryKey: true,  // semester is the primary key
        allowNull: false,  // semester cannot be null
    },
    status: {
        type: DataTypes.STRING(40),
        allowNull: true,  // status is optional
    },
    end_date: {
        type: DataTypes.DATEONLY,  // DATEONLY is used for date without time
        allowNull: true,  // end_date is optional
    },
}, {
    tableName: 'semesters_list',  // Specify the table name
    timestamps: false,  // No timestamps in the table
});

const UserProfile = sequelize.define('UserProfile', {
    name: {
        type: DataTypes.STRING(50),
        allowNull: true,  // Optional field
    },
    netid: {
        type: DataTypes.STRING(20),
        allowNull: true,  // Optional field
        primaryKey: true, 
    },
    znumber: {
        type: DataTypes.STRING(20),
        allowNull: true,  // Optional field
    },
    email: {
        type: DataTypes.STRING(50),
        allowNull: true,  // Optional field
    },
    mobilenumber: {
        type: DataTypes.STRING(15),
        allowNull: true,  // Optional field
    },
    graduateprogram: {
        type: DataTypes.STRING(50),
        allowNull: true,  // Optional field
    },
    department: {
        type: DataTypes.STRING(60),
        allowNull: true,  // Optional field
    },
    enrollementstatus: {
        type: DataTypes.STRING(30),
        allowNull: true,  // Optional field
    },
    citizenshipstatus: {
        type: DataTypes.STRING(30),
        allowNull: true,  // Optional field
    },
    creditscompletedatfau: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Optional field
    },
    creditsplannedtoregisterforupcomingsemester: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Optional field
    },
    currentgpa: {
        type: DataTypes.DOUBLE,
        allowNull: true,  // Optional field
    },
    advisorname: {
        type: DataTypes.STRING(50),
        allowNull: true,  // Optional field
    },
    advisoremail: {
        type: DataTypes.STRING(70),
        allowNull: true,  // Optional field
    },
    expectedgraduationdate: {
        type: DataTypes.STRING(100),
        allowNull: true,  // Optional field
    },
    programstartdate: {
        type: DataTypes.STRING(100),
        allowNull: true,  // Optional field
    },
    workedforfau: {
        type: DataTypes.BOOLEAN,
        allowNull: true,  // Optional field
    },
    courseprogram: {
        type: DataTypes.STRING(200),
        allowNull: true,  // Optional field
    },
    externalwork: {
        type: DataTypes.BOOLEAN,
        allowNull: true,  // Optional field
    },
    hoursofexternalwork: {
        type: DataTypes.DOUBLE,
        allowNull: true,  // Optional field
    },
}, {
    tableName: 'userprofile',  // Specify the table name
    timestamps: false,  // No timestamps in the table
});




export { Applicant, Application , CourseAssignmentDetail, CourseProgram, Course, DepartmentList, SemestersList, UserProfile};

