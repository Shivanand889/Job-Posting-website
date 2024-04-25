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
  database: "dbms_project",
  password: "Shiva#$098", // add your password
  port: 4000,
});
db.connect();

app.get("/", (req, res) => {
  var a = 1;
  // console.log(req.session.refresh) ;
  if (req.session.refresh == 1) {
    a = req.session.login;
    // console.log(a) ;
    req.session.refresh = 0;
  }
  res.render("login.ejs", { login: a });
});
app.get("/jobDescription", async (req, res) => {
  var id = req.query.jobId;
  console.log(id);
  const q = `SELECT c.company_name,
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
    and ss.isCompany = 1 where  jp.id = ${id}
    GROUP BY c.company_name, jp.id, jp.job_description, jp.salary `;
  const q1 = `select email from user_account 
                join job_post_activity on user_account.id= job_post_activity.user_account_id
                where  user_account.email= $1 and job_post_activity.job_post_id = $2`;
  try {
    console.log(req.session.email);
    const result = await db.query(q);
    const result1 = await db.query(q1, [req.session.email, id]);
    // console.log(1) ;
    // console.log(result1) ;
    req.session.jobs = result;
    res.render("view_job.ejs", { jobs: result, count: result1.rowCount });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});
app.get("/jobSeekerfilters", async (req, res) => {
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
    res.render("Student_after_login.ejs", { jobs: result });
  } catch (error) {
    // console.error("Error checking email:", error);
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
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
    var mail =[ req.session.email];
  try {
    const result = await db.query(query,mail);
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
  password = hashPassword(password);
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
          return res.redirect("/");
        }
      } else {
        req.session.login = 2;
        return res.redirect("/");
      }
    })
    .catch((err) => {
      console.log(err);
    });
  // res.redirect('back') ;
});
app.post("/signup", async (req, res) => {
  const email = req.body.email;
  const password = hashPassword(req.body.password);
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
    
      return res.redirect("jobSeekerfilters");
   
  } catch (error) {
    console.error("Error inserting user:", error);
    return res.status(500).send("Internal Server Error");
  }
});
app.post("/filters", async (req, res) => {
  //console.log(1) ;
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
      `LOWER(ss.skill_name) IN (${skill
        .map((s) => `'${s.toLowerCase()}'`)
        .join(", ")})`
    );
  }
  if (location[0] !== "") {
    conditions.push(
      `LOWER(jl.city) IN (${location
        .map((l) => `'${l.toLowerCase()}'`)
        .join(", ")})`
    );
  }
  if (company[0] !== "") {
    conditions.push(
      `LOWER(c.company_name) IN (${company
        .map((c) => `'${c.toLowerCase()}'`)
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
    res.send({ jobs: result.rows });
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
