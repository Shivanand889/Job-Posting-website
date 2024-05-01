const express = require("express");
const session = require("express-session");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const app = express();
const crypto = require("crypto");
const pg = require("pg");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    genid: (req) => {
      return uuidv4();
    },
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);
// req.session.jobs = NULL ;

function hashPassword(password) {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
}

module.exports = { hashPassword };
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Job",
  password: "7668", // add your password
  port: 5432,
});
db.connect();

// Start  ...
app.get("/", (req, res) => {
  res.render("landing.ejs");
});
app.get("/deleteaccount", async(req, res) => {
  const name = req.query.name ;
  const q = `delete from company where company_name = $1` ;
  const val = [name] ;

  try {
    
     await db.query(q, val);
   res.redirect("/");
  } catch (error) {
    // console.error("Error checking email:", error);
    
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});
//login Comapny
app.get("/Prefferdjobs", async(req,res)=>{
  const Id = req.query.id ;
  const q = `SELECT DISTINCT jp.* , jl.* FROM Job_post jp
            JOIN Skill_set ss ON jp.id = ss.job_post_id 
            join job_location as jl on jl.job_post_id = jp.id
            and ss.isCompany = 1
            WHERE ss.skill_name IN (
            SELECT skill_name FROM Skill_set
            WHERE user_account_id = $2 and isCompany = 0
            )
            
            AND jp.last_date >= $1
            `

  const currentDate = new Date();
  const val = [currentDate,Id] ;
  try {
    
    const result = await db.query(q, val);
   res.render("prefferedJobs.ejs",{jobs:result, id :Id});
  } catch (error) {
    // console.error("Error checking email:", error);
    
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }

});
app.get("/login_company", async (req, res) => {
  var a = 1;
  // console.log(req.session.refresh) ;
  if (req.session.refresh == 1) {
    a = req.session.login;
    // console.log(a) ;
    req.session.refresh = 0;
  }
  res.render("login_company.ejs", { login: a });
});
app.get("/NewJobPost",(req, res) => {
  res.render("NewJobPost.ejs");
});

app.get("/moreinfo", async(req, res) => {
  const id = req.query.userid;
  const query1 = `SELECT name FROM user_account 
   WHERE id = $1`;
  const value = [id];

  const query2 = `SELECT certificate_degree_name ,major,
  institute_university_name ,starting_date , completion_date , cgpa
   FROM education_detail
   WHERE user_account_id = $1`;

   const query3 = `SELECT start_date , end_date ,
   job_title , company_name , job_location_city , description
   FROM experience_detail 
   WHERE user_account_id = $1`;

   const query4 = `SELECT skill_name
    FROM skill_set
   WHERE user_account_id = $1`;


  try {
    const result1 = await db.query(query1, value);
    const result2 = await db.query(query2, value);
    const result3 = await db.query(query3, value);
    const result4 = await db.query(query4, value);


   console.log("succesfully more info");
   res.render("More_info.ejs",{name:result1,edu:result2 , exp : result3 , skill: result4});
  } catch (error) {
    // console.error("Error checking email:", error);
    
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }

});

app.get("/candidate", async(req, res) => {
  const id = req.query.jobid;
  const query = `SELECT name,id FROM user_account u
  join job_post_activity j on u.id = j.user_account_id 
   WHERE j.job_post_id = $1`;
  const value = [id];


  try {
    const result1 = await db.query(query, value);

   console.log("succesfully find name");
   res.render("candidates_applied.ejs",{jobs:result1});
  } catch (error) {
    // console.error("Error checking email:", error);
    
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }

});

app.post("/newjob", async (req, res) => {
  const title = req.body.title;
  const jobtype = req.body.jobtype;
  const lastdate = req.body.lastdate;
  const salary = req.body.salary;
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const country = req.body.country;
  const zip = req.body.zip;
  const input_skill = req.body.skill;
  const skills = input_skill.split(',');
  console.log(skills);
  const description = req.body.description;
  // Check if email already exists
  const currentDate = new Date();

  // Check if last_date is greater than current date
  if (new Date(lastdate) <= currentDate) {
    console.log("last_date should be greater than current date");
    return res.status(400).send("Last date should be after  current date");
  }
  if(salary<=0){
    console.log("Salary should be greater than 0");
    return res.status(400).send("Salary should be greater than 0");
  }
  const query = `SELECT company_name FROM company WHERE comapny_email = $1`;
  const namechaeck = [req.session.email];
  // console.log(req.session.email);
  try {
    const Company_name = await db.query(query, namechaeck);
    // console.log(Company_name);
    // Insert new user
    const insertQuery = `INSERT INTO job_post (company_name, title ,last_date , salary, job_type ,job_description) 
  VALUES ($1, $2, $3, $4, $5, $6)`;
    const insertValues = [
      Company_name.rows[0].company_name,
      title,
      lastdate,
      salary,
      jobtype,
      description,
    ];
    await db.query(insertQuery, insertValues);
    console.log("Successfully inserted");
    const query2 = `SELECT id FROM job_post order by id desc limit 1 `;
    const id = await db.query(query2);
    console.log(id);
    console.log()
    //Insert all skill in skill_set
    for (let i = 0; i < skills.length; i++) {
      const element = skills[i];
      const insertQuery3 = `INSERT INTO skill_set (job_post_id, skill_name, isCompany) 
     VALUES ($1, $2, $3)`;
    const insertValues3 = [id.rows[0].id, element, 1];
    await db.query(insertQuery3, insertValues3);
    console.log("Successfully skill_set inserted");
      
    }
    // Insert new location
    const insertQuery2 = `INSERT INTO job_location (job_post_id, street_address, city , state , country , zip) 
     VALUES ($1, $2, $3, $4, $5, $6)`;
    const insertValues2 = [id.rows[0].id, address, city, state, country, zip];
    await db.query(insertQuery2, insertValues2);
    console.log("Successfully inserted");
    return res.redirect("jobs");
  } catch (error) {
    console.error("Error company name", error);
    return res.status(500).send("Internal Server Error");
  }

  
 
});

app.post("/job_delete", async (req, res) => {
  const id = req.query.jobid;
  console.log(id);
  const query1 = `delete from job_post 
    where id = $1`;
    const value = [id];

  try {
    const result1 = await db.query(query1, value);
    
    // console.log(result);
    console.log(req.session.email);
   // console.log(resureq.session.emaillt);
   console.log("succesfully deleted");
    res.redirect("jobs");
  } catch (error) {
    // console.error("Error checking email:", error);
    
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/jobs", async (req, res) => {
  console.log(13);
  const query = `SELECT jp.id AS job_post_id,
  jp.title AS job_title,
  c.company_name as company_name , 
  jl.city AS job_city,
  jl.country AS job_country,
  jp.salary AS job_salary,
  jp.job_type AS job_type,
  jp.application_count
  FROM company as c 
 JOIN job_post jp ON jp.company_name = c.company_name 
 join job_location as jl on jp.id = jl.job_post_id
  where comapny_email = $1`;

const query2 = `select company_name from company
where comapny_email = $1`;
  const namechaeck = [req.session.email];



  try {
    const result = await db.query(query, namechaeck);
    console.log(result);
    console.log(req.session.email);
    const result2 = await db.query(query2,namechaeck);
   // console.log(resureq.session.emaillt);
    res.render("client_home.ejs", { jobs: result ,jobs2 : result2});
  } catch (error) {
    // console.error("Error checking email:", error);
    
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/login_c", async (req, res) => {
  const email = req.body.email;
  var password = req.body.password;
  // password = hashPassword(password);
  var q = `SELECT * FROM company WHERE comapny_email = $1`;
  var x = [email];

  await db
    .query(q, x)
    .then((result) => {
      req.session.refresh = 1;
      // console.log(result) ;
      if (result.rowCount != 0) {
        if (result.rows[0].password == password) {
          console.log("exists");
          req.session.login = 1;

          req.session.email = email;
          // console.log(email) ;
          // console.log(req.session.email) ;

          res.redirect("jobs");
        } else {
          req.session.login = 0;
          return res.redirect("back");
        }
      } else {
        req.session.login = 2;
        return res.redirect("back");
      }
    })
    .catch((err) => {
      console.log(err);
    });
  // res.redirect('back') ;
});
app.post("/sign_c", async (req, res) => {
  const email = req.body.email;
  
  const password =req.body.password;
  const stream = req.body.stream;
  const Comapny_name = req.body.Comapny_name;
 
  // Check if email already exists
  console.log(123)
  const emailCheckQuery = `SELECT * FROM company WHERE comapny_email = $1`;
  const emailCheckValues = [email];
  try {
    const emailCheckResult = await db.query(emailCheckQuery, emailCheckValues);
    if (emailCheckResult.rows.length > 0) {
      console.log("Email already exists");
      return res.redirect("back");
    }
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).send("Internal Server Error");
  }

  // Insert new user
  const insertQuery = `INSERT INTO company (company_name,stream ,comapny_email, password) 
                         VALUES ($1, $2, $3, $4)`;
  const insertValues = [
    Comapny_name,
    stream,
    email,
    password
  ];
  try {
    console.log(124) ;
    await db.query(insertQuery, insertValues);
    console.log("Successfully inserted");
    req.session.email = email ;
    return res.redirect("jobs");
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).send("Internal Server Error");
  }
});

//login student ...
app.get("/login_student", (req, res) => {
  var a = 1;
  // console.log(req.session.refresh) ;
  if (req.session.refresh == 1) {
    a = req.session.login;
    // console.log(a) ;
    req.session.refresh = 0;
  }
  res.render("login_student.ejs", { login: a });
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.get("/about", (req, res) => {
  res.render("aboutus.ejs");
});


app.get("/jobDescription", async (req, res) => {
  var Id = req.query.jobId;
  console.log(Id);
  const q = `SELECT c.company_name,
    jp.id AS job_post_id,
    jp.job_description,
    jp.salary,
    jp.application_count,
    jp.created_date ,
    jp.last_date ,
    jp.job_type,
    jp.title ,
    ARRAY_AGG(DISTINCT jl.city) AS city,
    ARRAY_AGG(DISTINCT CONCAT(jl.street_address, ', ', jl.city, ', ', jl.state, ', ', jl.country, ', ', jl.zip)) AS job_locations,
    ARRAY_AGG(DISTINCT ss.skill_name) AS job_skills
    FROM Company c
    JOIN Job_post jp ON c.company_name = jp.company_name
    LEFT JOIN Job_location jl ON jp.id = jl.job_post_id
    LEFT JOIN Skill_set ss ON jp.id = ss.job_post_id
    and ss.isCompany = 1 where  jp.id = ${Id}
    GROUP BY c.company_name, jp.id, jp.job_description, jp.salary `;
  const q1 = `select email from user_account 
                join job_post_activity on user_account.id= job_post_activity.user_account_id
                where  user_account.email= $1 and job_post_activity.job_post_id = $2`;
  try {
    console.log(req.session.email);
    const result = await db.query(q);
    const result1 = await db.query(q1, [req.session.email, Id]);
    // console.log(1) ;
    // console.log(result1) ;
    req.session.jobs = result;
    res.render("view_job.ejs", {
      jobs: result,
      count: result1.rowCount,
      id: Id,
    });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/viewAllJobs", async (req, res) => {
  const Id = req.query.id ;
  console.log(1232) ;
  console.log(Id) ;
  const query = `SELECT c.company_name,
                    jp.id AS job_post_id,
                    jp.job_description,
                    jp.salary,
                    jp.created_date ,
                    jp.last_date ,
                    jp.job_type,
                    jp.title ,
                    ARRAY_AGG(DISTINCT jl.city) AS city,
                    ARRAY_AGG(DISTINCT CONCAT(jl.street_address, ', ', jl.city, ', ', jl.state, ', ', jl.country, ', ', jl.zip)) AS job_locations,
                    ARRAY_AGG(DISTINCT ss.skill_name) AS job_skills
                    FROM Company c
                    JOIN Job_post jp ON c.company_name = jp.company_name
                    LEFT JOIN Job_location jl ON jp.id = jl.job_post_id
                    LEFT JOIN Skill_set ss ON jp.id = ss.job_post_id
                    and ss.isCompany = 1
                    GROUP BY c.company_name, jp.id, jp.job_description, jp.salary `;

  try {
    const result = await db.query(query);
    // console.log(result) ;
    req.session.jobs = result;
    res.render("viewall.ejs", { jobs: result, id :Id });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
  // res.render("viewall.ejs");
});
app.get("/addEducationForm", async (req, res) => {
  // console.log(10) ;
  var Id = req.query.id;
  console.log(Id);
  return res.render("editeducationdetail.ejs", { id: Id });
});

app.get("/addExperienceForm", async (req, res) => {
  // console.log(10) ;
  var Id = req.query.id;
  console.log(Id);
  return res.render("editworkexperience.ejs", { id: Id });
});

app.get("/addSkillForm", async (req, res) => {
  console.log(10);
  var Id = req.query.id;
  console.log(Id);
  return res.render("editskill.ejs", { id: Id });
});

app.get("/editDetailsForm", async (req, res) => {
  console.log(10);
  var Id = req.query.id;
  console.log(Id);
  // let name = "ab" ;
  const q = `select * from user_account where id = $1`;
  try {
    let val = [Id];
    const result = await db.query(q, val);
    // console.log(result.rows[0].date_of_birth)
    return res.render("editpersonaldetail.ejs", { id: Id, account: result });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/editEducationForm", async (req, res) => {
  console.log(10);
  var Id = req.query.id;
  var ed_id = req.query.ed_id;
  console.log(ed_id);
  // let name = "ab" ;
  const q = `select * from education_detail where id = $1`;
  try {
    let val = [ed_id];
    const result = await db.query(q, val);
    // console.log(result.rows[0].date_of_birth)
    return res.render("editeducation.ejs", { id: Id, educate: result });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});
app.get("/editExperienceForm", async (req, res) => {
  console.log(10);
  var Id = req.query.id;
  var Ex_id = req.query.ex_id;
  console.log(Ex_id);
  // let name = "ab" ;
  const q = `select * from experience_detail where id = $1`;
  try {
    let val = [Ex_id];
    const result = await db.query(q, val);
    // console.log(result.rows[0].date_of_birth)
    return res.render("editExperience.ejs", {
      id: Id,
      exp: result,
      ex_id: Ex_id,
    });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/editSkillForm", async (req, res) => {
  console.log(10);
  var Id = req.query.id;
  // let name = "ab" ;
  const q = `select * from skill_set where user_account_id = $1 and isCompany=$2 `;
  try {
    let val = [Id, 0];
    const result = await db.query(q, val);
    // console.log(result.rows[0].date_of_birth)
    let s = "";
    for (let i = 0; i < result.rowCount; i++) {
      s = s + result.rows[i].skill_name + " ";
    }
    s = s.slice(0, -1);
    console.log(s);
    return res.render("editSkillform.ejs", { id: Id, skill: s });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/JobSeekerDetails", async (req, res) => {
  var Id = req.query.id;
  // console.log(11) ;
  const query = `SELECT id, email, date_of_birth, gender, contact_number, name from user_account
  WHERE id= $1 `;
  const q1 = `select * from education_detail where  user_account_id= $1 order by id`;
  const q2 = `select * from experience_detail  WHERE user_account_id= $1 order by id`;
  const q3 = `select * from skill_set WHERE user_account_id= $1 and isCompany = 0 order by id`;
  try {
    var val = [Id];
    // console.log(Id) ;
    req.session.r1 = await db.query(query, val);
    // console.log(Id) ;
    req.session.r2 = await db.query(q1, val);
    // console.log(Id) ;
    req.session.r3 = await db.query(q2, val);
    // console.log(Id) ;
    req.session.r4 = await db.query(q3, val);
   
    res.render("completeprofile.ejs", {
      account: req.session.r1,
      educate: req.session.r2,
      exp: req.session.r3,
      skill: req.session.r4,
      id: Id,
    });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/jobSeekerfilters", async (req, res) => {
  const currentDate = new Date();
  const query = `SELECT c.company_name,
                    jp.id AS job_post_id,
                    jp.job_description,
                    jp.salary,
                    jp.created_date ,
                    jp.last_date ,
                    jp.job_type,
                    jp.title ,
                    ARRAY_AGG(DISTINCT jl.city) AS city,
                    ARRAY_AGG(DISTINCT CONCAT(jl.street_address, ', ', jl.city, ', ', jl.state, ', ', jl.country, ', ', jl.zip)) AS job_locations,
                    ARRAY_AGG(DISTINCT ss.skill_name) AS job_skills
                    FROM Company c
                    JOIN Job_post jp ON c.company_name = jp.company_name
                    LEFT JOIN Job_location jl ON jp.id = jl.job_post_id
                    LEFT JOIN Skill_set ss ON jp.id = ss.job_post_id
                    and ss.isCompany = 1
                    where last_date >$1
                    GROUP BY c.company_name, jp.id, jp.job_description, jp.salary
                    order by salary desc limit 6 `;
  
  const q1 = `select distinct company_name from company` ;
  const q2 = `select distinct city from job_location` ;
  const q3 = `select distinct skill_name from skill_set` ;

  try {
    const val1 = [currentDate] ;
    const result = await db.query(query,val1);
    // console.log(result) ;
    req.session.jobs = result;
    const q = "select id from user_account where email = $1";
    var val = [req.session.email];
    const result1 = await db.query(q, val);
    const r2 = await db.query(q1);
    const r3= await db.query(q2);
    const r4 = await db.query(q3);
    // console.log(1) ;
    // console.log(result1) ;
    res.render("Student_after_login.ejs", {
      jobs: result,
      id: result1.rows[0].id,
      company :r2.rows ,
      location : r3.rows,
      skill : r4.rows
    });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/appliedJobs", async (req, res) => {
  var Id = req.query.id;
  console.log(Id);
  const query = `SELECT c.company_name,
                    jp.id AS job_post_id,
                    jp.job_description,
                    jp.salary,
                    jp.created_date ,
                    jp.last_date ,
                    jp.job_type,
                    jp.title ,
                    ARRAY_AGG(DISTINCT jl.city) AS city,
                    ARRAY_AGG(DISTINCT CONCAT(jl.street_address, ', ', jl.city, ', ', jl.state, ', ', jl.country, ', ', jl.zip)) AS job_locations,
                    ARRAY_AGG(DISTINCT ss.skill_name) AS job_skills
                    FROM job_post_activity jpa
                    JOIN Job_post jp ON jpa.job_post_id = jp.id
                    JOIN company c ON c.company_name = jp.company_name
                    
                    LEFT JOIN Job_location jl ON jp.id = jl.job_post_id
                    LEFT JOIN Skill_set ss ON jp.id = ss.job_post_id
                    and ss.isCompany = 1
                    where jpa.user_account_id = $1 
                    GROUP BY c.company_name, jp.id, jp.job_description, jp.salary `;

  try {
    var val = [Id];
    const result = await db.query(query, val);
    // console.log(result) ;
    req.session.jobs = result;
    
    res.render("job.ejs", { jobs: result, id: Id });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
  // res.render("job.ejs") ;
});
app.get("/Recruiterfilters", async (req, res) => {
  console.log(req.session.email);
  const query = `SELECT c.company_name,
    jp.id AS job_post_id,
    jp.job_description,
    jp.salary,
    jp.job_type,
    ARRAY_AGG(DISTINCT CONCAT(jl.street_address, ', ', jl.city, ', ', jl.state, ', ', jl.country, ', ', jl.zip)) AS job_locations,
    ARRAY_AGG(DISTINCT ss.skill_name) AS job_skills
    FROM Company c
    JOIN Job_post jp ON c.company_name = jp.company_name
    LEFT JOIN Job_location jl ON jp.id = jl.job_post_id
    LEFT JOIN Skill_set ss ON jp.id = ss.job_post_id
    WHERE jp.posted_by_id = (select id from user_account where email = $1)
    and ss.isCompany = 1
    GROUP BY c.company_name, jp.id, jp.job_description, jp.salary;
                                                                `;
  var mail = [req.session.email];
  try {
    const result = await db.query(query, mail);
    // console.log(result) ;
    req.session.jobs = result;
    res.render("client_home.ejs", { jobs: result });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  var password = req.body.password;
  // password = hashPassword(password);
  var q = `select * from User_account where email = $1`;
  var x = [email];
  await db
    .query(q, x)
    .then((result) => {
      req.session.refresh = 1;
      // console.log(result) ;
      if (result.rowCount != 0) {
        if (result.rows[0].password == password) {
          console.log("exists");
          req.session.login = 1;

          req.session.email = email;
          // console.log(email) ;
          // console.log(req.session.email) ;

          res.redirect("jobSeekerfilters");
        } else {
          req.session.login = 0;
          return res.redirect("back");
        }
      } else {
        req.session.login = 2;
        return res.redirect("back");
      }
    })
    .catch((err) => {
      console.log(err);
    });
  // res.redirect('back') ;
});

app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password ;
  const dob = req.body.dob;
  const gender = req.body.gender;
  const number = req.body.contact;
  const name = req.body.name;
  // Check if email already exists
  const emailCheckQuery = `SELECT * FROM user_account WHERE email = $1`;
  const emailCheckValues = [email];
  try {
    const emailCheckResult = await db.query(emailCheckQuery, emailCheckValues);
    if (emailCheckResult.rows.length > 0) {
      console.log("Email already exists");
      return res.redirect("back");
    }
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).send("Internal Server Error");
  }

  // Insert new user
  const insertQuery = `INSERT INTO user_account (name,email, password, date_of_birth, gender, contact_number) 
                         VALUES ($1, $2, $3, $4, $5, $6)`;
  const insertValues = [name, email, password, dob, gender, number];
  try {
    await db.query(insertQuery, insertValues);
    console.log("Successfully inserted");
    req.session.email = email;
    return res.redirect("jobSeekerfilters");
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/addEducation", async (req, res) => {
  let Id = req.query.id;
  let degree = req.body.degree;
  let major = req.body.major;
  let institute = req.body.institute;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  let cgpa = req.body.cgpa;
  if (new Date(start_date) >= new Date(end_date)) {
    console.log("start_date should be before end_date");
    return res.status(400).json({ error: "start_date should be before end_date" });
  }
  if(cgpa<0 || cgpa>10){
    console.log("cgpa should be between 0 to 10");
    return res.status(400).send("cgpa should be between 0 to 10");
  }
  const query = `insert into education_detail (user_account_id,certificate_degree_name,major , institute_university_name,
                starting_date, completion_date,cgpa) values($1,$2,$3,$4,$5,$6,$7)`;

  try {
    let val = [Id, degree, major, institute, start_date, end_date, cgpa];
    await db.query(query, val);
    console.log("Successfully inserted");
    let v = "JobSeekerDetails?id=" + Id;
    return res.redirect(v);
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/addExperience", async (req, res) => {
  let Id = req.query.id;
  let company = req.body.company;
  let title = req.body.title;
  let description = req.body.description;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  let country = req.body.country;
  let city = req.body.city;

  if (new Date(start_date) >= new Date(end_date)) {
    console.log("start_date should be before end_date");
    return res.status(400).json({ error: "start_date should be before end_date" });
  }
  const query = `insert into experience_detail (user_account_id,start_date, end_date,
              job_title, company_name ,job_location_country, job_location_city, description) values($1,$2,$3,$4,$5,$6,$7,$8)`;

  try {
    let val = [
      Id,
      start_date,
      end_date,
      title,
      company,
      country,
      city,
      description,
    ];
    await db.query(query, val);
    console.log("Successfully inserted");
    let v = "JobSeekerDetails?id=" + Id;
    return res.redirect(v);
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/addSkill", async (req, res) => {
  console.log(12);

  let Id = req.query.id;
  let skill = req.body.skill;
  console.log(Id);
  const query = `insert into skill_set (skill_name,user_account_id, isCompany) values($1,$2,$3)`;

  try {
    let val = [skill, Id, 0];
    await db.query(query, val);
    console.log("Successfully inserted");
    let v = "JobSeekerDetails?id=" + Id;
    return res.redirect(v);
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/editDetails", async (req, res) => {
  console.log(12);

  let Id = req.query.id;
  const email = req.body.email;
  const dob = req.body.dob;
  const gender = req.body.gender;
  const number = req.body.number;
  const name = req.body.name;
  const query = `UPDATE user_account 
                  SET email = $1, date_of_birth = $2, gender = $3, contact_number = $4, name = $5 
                  WHERE id = $6`;

  try {
    let val = [email, dob, gender, number, name, Id];
    await db.query(query, val);
    console.log("Successfully inserted");
    let v = "JobSeekerDetails?id=" + Id;
    return res.redirect(v);
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/editEducation", async (req, res) => {
  // console.log(12) ;

  let Id = req.query.id;
  let ed_id = req.query.ed_id;
  let degree = req.body.degree;
  let major = req.body.major;
  let institute = req.body.institute;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  let cgpa = req.body.cgpa;
  if (new Date(start_date) >= new Date(end_date)) {
    console.log("start_date should be before end_date");
    return res.status(400).json({ error: "start_date should be before end_date" });
  }
  if(cgpa<0 || cgpa>10){
    console.log("cgpa should be between 0 to 10");
    return res.status(400).send("cgpa should be between 0 to 10");
  }
  const query = `UPDATE education_detail 
                  SET certificate_degree_name = $1, major = $2, institute_university_name = $3, starting_date = $4, 
                  completion_date = $5 , cgpa = $6
                  WHERE id = $7`;

  try {
    let val = [degree, major, institute, start_date, end_date, cgpa, ed_id];
    await db.query(query, val);
    console.log("Successfully inserted");
    let v = "JobSeekerDetails?id=" + Id;
    return res.redirect(v);
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/editExperience", async (req, res) => {
  // console.log(12) ;

  let Id = req.query.id;
  let ex_id = req.query.ex_id;
  let company = req.body.company;
  let title = req.body.title;
  let description = req.body.description;
  let start_date = req.body.start_date;
  let end_date = req.body.end_date;
  let country = req.body.country;
  let city = req.body.city;
  if (new Date(start_date) >= new Date(end_date)) {
    console.log("start_date should be before end_date");
    return res.status(400).json({ error: "start_date should be before end_date" });
  }
  const query = `UPDATE experience_detail 
                  SET company_name = $1, job_title = $2, description = $3, start_date = $4, 
                  end_date = $5 , job_location_country = $6, job_location_city = $7
                  WHERE id = $8`;

  try {
    let val = [
      company,
      title,
      description,
      start_date,
      end_date,
      country,
      city,
      ex_id,
    ];
    await db.query(query, val);
    console.log("Successfully inserted");
    let v = "JobSeekerDetails?id=" + Id;
    return res.redirect(v);
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).send("Internal Server Error");
  }
});
app.post("/filters", async (req, res) => {
  console.log(24) ;
  const skill = req.body.skills.split(",");
  const location = req.body.location.split(",");
  const company = req.body.company.split(",");
  const type = req.body.type.split(",");
  const salary = req.body.salary.split(",");

  let query = `
        SELECT c.company_name,
               jp.id AS job_post_id,
               jp.job_description,
               jp.salary,
               jp.created_date,
               jp.last_date,
               jp.job_type,
               jp.title,
               ARRAY_AGG(DISTINCT jl.city) AS city,
               ARRAY_AGG(DISTINCT CONCAT(jl.street_address, ', ', jl.city, ', ', jl.state, ', ', jl.country, ', ', jl.zip)) AS job_locations,
               ARRAY_AGG(DISTINCT ss.skill_name) AS job_skills
        FROM Company c
        JOIN Job_post jp ON c.company_name = jp.company_name
        LEFT JOIN Job_location jl ON jp.id = jl.job_post_id
        LEFT JOIN Skill_set ss ON jp.id = ss.job_post_id
                                  AND ss.isCompany = 1
        `;

  // Add filtering conditions
  let conditions = [];
  if (skill[0] !== "") {
    conditions.push(
      `ss.skill_name IN (${skill
        .map((s) => `'${s}'`)
        .join(", ")})`
    );
  }
  if (location[0] !== "") {
    conditions.push(
      `jl.city IN (${location
        .map((l) => `'${l}'`)
        .join(", ")})`
    );
  }
  if (company[0] !== "") {
    conditions.push(
      `c.company_name IN (${company
        .map((c) => `'${c}'`)
        .join(", ")})`
    );
  }
  if (type[0] !== "") {
    conditions.push(
      `LOWER(jp.job_type) IN (${type
        .map((t) => `'${t.toLowerCase()}'`)
        .join(", ")})`
    );
  }
  if (salary[0] !== "") {
    conditions.push(`jp.salary > ${Math.max(...salary)}`); // Assuming salary is a single value
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += `
        GROUP BY c.company_name, jp.id, jp.job_description, jp.salary
    `;

  try {
    const result = await db.query(query);
    const q = "select id from user_account where email = $1";
    var val = [req.session.email];
    const result1 = await db.query(q,val);
    console.log(result) ;
    res.send({ jobs: result.rows , id: result1.rows[0].id});
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send("Internal Server Error");
  }
});
app.post("/apply", async (req, res) => {
  id = req.query.jobId;
  const q = `insert into job_post_activity (user_account_id , job_post_id)
                values($1 , $2)`;
  const q1 = `select id from user_account where email =  $1`;
  try {
    // console.log(req.session.email)
    const result1 = await db.query(q1, [req.session.email]);
    await db.query(q, [result1.rows[0].id, id]);

    // console.log(1) ;
    // console.log(result1) ;
    // req.session.jobs = result ;
    res.redirect(`/jobDescription?jobId=${id}`);
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});
app.listen(3000, function () {
  console.log("Server start succesfully");
});