async function addEducation(obj) {
    console.log(1) ;
    try {
        const id = obj.getAttribute('val');
        await fetch('/addEducationForm?id=' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let newPageURL = '/addEducationForm?id=' + id;
        window.location.href = newPageURL;
    } catch (error) {
        console.error(error);
    }
    // window.location.href = '/editeducationdetail'; 
}

async function addExperience(obj) {
    console.log(1) ;
    try {
        const id = obj.getAttribute('val');
        await fetch('/addExperienceForm?id=' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let newPageURL = '/addExperienceForm?id=' + id;
        window.location.href = newPageURL;
    } catch (error) {
        console.error(error);
    }
    // window.location.href = '/editeducationdetail'; 
}

async function addSkill(obj) {
    
    try {
        const id = obj.getAttribute('val');
        console.log(id) ;
        await fetch('/addSkillForm?id=' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let newPageURL = '/addSkillForm?id=' + id;
        window.location.href = newPageURL;
    } catch (error) {
        console.error(error);
    }
    // window.location.href = '/editeducationdetail'; 
}

async function editDetails(obj) {
    
    try {
        const id = obj.getAttribute('val');
        console.log(id) ;
        await fetch('/editDetailsForm?id=' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let newPageURL = '/editDetailsForm?id=' + id;
        window.location.href = newPageURL;
    } catch (error) {
        console.error(error);
    }
    // window.location.href = '/editeducationdetail'; 
}
editEducation

async function editEducation(obj) {
    
    try {
        const id = obj.getAttribute('val');
        const ed_id = obj.getAttribute('val1');
        console.log(id) ;
        await fetch('/editEducationForm?id=' + id + '&ed_id=' + ed_id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let newPageURL = '/editEducationForm?id=' + id + '&ed_id=' + ed_id ;
        window.location.href = newPageURL;
    } catch (error) {
        console.error(error);
    }
    // window.location.href = '/editeducationdetail'; 
}

async function editExperience(obj) {
    
    try {
        const id = obj.getAttribute('val');
        const ex_id = obj.getAttribute('val1');
        console.log(id) ;
        await fetch('/editExperienceForm?id=' + id + '&ex_id=' + ex_id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let newPageURL = '/editExperienceForm?id=' + id + '&ex_id=' + ex_id ;
        window.location.href = newPageURL;
    } catch (error) {
        console.error(error);
    }
    // window.location.href = '/editeducationdetail'; 
}

async function delExperience(obj) {
    
    try {
        const id = obj.getAttribute('val');
        const ex_id = obj.getAttribute('val1');
        console.log(id) ;
        await fetch('/delExperience?id=' + id + '&ex_id=' + ex_id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let newPageURL = '/JobSeekerDetails?id=' + id  ;
        window.location.href = newPageURL;
    } catch (error) {
        console.error(error);
    }
    // window.location.href = '/editeducationdetail'; 
}

async function delEducation(obj) {
    
    try {
        const id = obj.getAttribute('val');
        const ed_id = obj.getAttribute('val1');
        console.log(id) ;
        await fetch('/delEducation?id=' + id + '&ed_id=' + ed_id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let newPageURL = '/JobSeekerDetails?id=' + id  ;
        window.location.href = newPageURL;
    } catch (error) {
        console.error(error);
    }
    // window.location.href = '/editeducationdetail'; 
}

async function delSkill(obj) {
    
    try {
        const id = obj.getAttribute('val');
        const sk_id = obj.getAttribute('val1');
        console.log(id) ;
        await fetch('/delSkill?id=' + id + '&sk_id=' + sk_id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        let newPageURL = '/delSkill?id=' + id + '&sk_id=' + sk_id ;
        window.location.href = newPageURL;
    } catch (error) {
        console.error(error);
    }
    // window.location.href = '/editeducationdetail'; 
}