--user_account--
create table User_account(
    id SERIAL primary key,
    email varchar(255),
    password varchar(100),
    date_of_birth date,
    gender varchar(50),
    contact_number numeric(10),
    account_type int
);

-- Company Profile --

--business_stream--
create table Business_stream(
    id SERIAL primary key,
    business_stream_name varchar(255)
);

--company--
create table Company(
    id SERIAL primary key,
    company_name varchar(255),
    profile_description varchar(1000),
    business_stream_id int,
    company_website_ varchar(500),
    foreign key (business_stream_id) references Business_stream(id)
);

--Seeker Profile Builder --

--seeker_profile--
create table Seeker_profile(
    user_account_id int primary key,
    first_name varchar(50),
    last_name varchar(50),
    current_salary numeric,
    currency varchar(50),
    foreign key (user_account_id) references User_account(id)
);

--education_detail--
create table Education_detail(
    user_account_id int,
    certificate_degree_name varchar(50),
    major varchar(50),
    institute_university_name varchar(50),
    starting_date date,
    completion_date date,
    percentage numeric,
    cgpa numeric,
    foreign key (user_account_id) references Seeker_profile(user_account_id)
);

--experience_detail--
create table Experience_detail(
    user_account_id int,
    is_current_job int,
    start_date date,
    end_date date,
    job_title varchar(50),
    company_name varchar(100),
    job_location_city varchar(100),
    job_location_state varchar(50),
    job_location_country varchar(50),
    description varchar(4000),
    foreign key (user_account_id) references Seeker_profile(user_account_id)
);

--skill_set--
create table Skill_set(
    skill_name varchar(50),
    user_account_id int, 
    isCompany int,
    CONSTRAINT skill_id PRIMARY KEY (skill_name, user_account_id), 
    foreign key (user_account_id) references Seeker_profile(user_account_id)
);


-- Job Post Management --

--job_post--
create table Job_post(
    id SERIAL primary key,
    company_id int,
    created_date date,
    last_date date,
    job_description varchar(4000),
    job_url varchar(500),
    posted_by_id int,
    foreign key (company_id) references Company(id),
    foreign key (posted_by_id) references User_account(id)
);

--job_post_activity--
create table Job_post_activity(
    user_account_id int,
    job_post_id int,
    apply_date date,
    CONSTRAINT Job PRIMARY KEY (user_account_id, job_post_id),
    foreign key (job_post_id) references Job_post(id),
    foreign key (user_account_id) references User_account(id)
);

--job_location--
create table Job_location(
    job_post_id int,
    street_address varchar(100),
    city varchar(500),
    state varchar(500),
    country varchar(500),
    zip varchar(500),
    foreign key (job_post_id) references Job_post(id)
);
