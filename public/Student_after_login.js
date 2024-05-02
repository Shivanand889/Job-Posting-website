
async function handleCheckboxChange() {
  // Get all the checkbox elements
  const checkboxes = document.querySelectorAll('#skill .lists .items input[type="checkbox"]');
  const checkLocation = document.querySelectorAll('#location .lists .items input[type="checkbox"]');
  const checkCompany = document.querySelectorAll('#company .items input[type="checkbox"]');
  const checkType = document.querySelectorAll('#type .lists .items input[type="checkbox"]');
  const checksalary = document.querySelectorAll('#salary .lists .items input[type="checkbox"]');
 //alert(checkboxes.length)
  let checkedValues = [];
  let checkedLocation = [];
  let checkedCompany = [];
  let checkedType = [];
  let checkedsalary = [];
  checkboxes.forEach((checkbox) => {
    
    if (checkbox.checked) {
      
      
      checkedValues.push(checkbox.getAttribute('data-value'));
    }
  });
  checkLocation.forEach((checkbox) => {
    
    if (checkbox.checked) {
      
      console.log(checkbox.getAttribute('data-value')) ;
      checkedLocation.push(checkbox.getAttribute('data-value'));
    }
  });
  checkCompany.forEach((checkbox) => {
    
    if (checkbox.checked) {
      
      
      checkedCompany.push(checkbox.getAttribute('data-value'));
    }
  });
  checkType.forEach((checkbox) => {
    
    if (checkbox.checked) {
      
      
      checkedType.push(checkbox.getAttribute('data-value'));
    }
  });
  checksalary.forEach((checkbox) => {
    
    if (checkbox.checked) {
      
      
      checkedsalary.push(checkbox.getAttribute('data-value'));
    }
  });
  filters(checkedValues ,checkedLocation ,checkedCompany , checkedType , checkedsalary) ;
    
}
function time(datestr) { 
  var currentDate = new Date();
  var date = new Date(datestr);
  var dateMilliseconds = date.getTime();
  var currentMilliseconds = currentDate.getTime();
  var timeDifference = currentMilliseconds - dateMilliseconds;
  var differenceInDays = Math.floor(timeDifference / (1000 * 3600 * 24));
  var differenceInMonths = Math.floor(differenceInDays / 30);
  if (differenceInDays < 1) {
      return "today"; 
  } 
  else if (differenceInDays < 30) {
      return differenceInDays + " days ago";
  } 
  else if (differenceInMonths < 12) {
    return differenceInMonths + " month ago";
  } 
  else { 
      return date.toDateString();
  }
}
async function filters(checkedValues , checkedLocation ,checkedCompany , checkedType,checkedsalary){
  try {
    const formData = new URLSearchParams();
    formData.append('skills', checkedValues.join(','));
    formData.append('company', checkedCompany.join(','));
    formData.append('location', checkedLocation.join(','));
    formData.append('type', checkedType.join(','));
    formData.append('salary', checkedsalary.join(','));
    // formData.append('id', postId);
    const response = await fetch('/filters', {
      method: 'POST',
      
      headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,

    });

    if (!response.ok) {
      throw new Error('Failed to delete the post');
    }
    const responseData = await response.json();
    let jobs = responseData.jobs ;
    let id = responseData.id ;
   // alert(jobs[0].company_name) ;
    let jobHtml = `<h1 class="heading">Latest Jobs</h1>`;
    //jobHtml = ""
    //try 
    for (let i = 0; i < jobs.length; i = i + 3) {
      jobHtml += `
        <div class="box-container" id="jobContainer">
      `;
      for (let j = i; j < Math.min(i + 3, jobs.length); j++) {
        let v = '/jobDescription?jobId=' + jobs[j].job_post_id + '&id=' + id ;
        jobHtml += `
          <div class="box">
            <div class="company">
              <img src="https://t4.ftcdn.net/jpg/05/13/72/29/360_F_513722905_SgxiGdjQZsdvP4ODmERsQGgW2bUwj1lT.jpg" alt="">
              <div>
                <h3>${jobs[j].company_name}</h3>
                <p>${time(jobs[j].created_date)}</p>
              </div>
            </div>
            <h3 class="job-title">${jobs[j].title}</h3>
            <p class="location"><i class="fa-solid fa-location-dot"></i><span>${jobs[j].city.join(', ')}</span></p>
            <div class="tags">
              <p><i class="fa-solid fa-indian-rupee-sign"></i><span>${jobs[j].salary}</span></p>
              <p><i class="fa-solid fa-briefcase"></i><span>${jobs[j].job_type}</span></p>
            </div>
            <div class="flex_btn">
              <a href= ${v} class="btn">view details</a>
              <button type="submit" class="far fa-heart"></button>
            </div>
          </div>
        `;
        
      }
      jobHtml += '</div>';
    }
    let str1 = "/viewAllJobs?id=" + id ;
    console.log(str1) ;
    jobHtml += `<div style="text-align: center; margin-top: 2rem;">

            <a href=${str1} class="btn">View All</a>
         </div>` ;

    
    const jobContainer = document.getElementById('jobContainer');
    
    //jobContainer = '' ;
   // alert(jobHtml) ;
    jobContainer.innerHTML = jobHtml ;
    
  } catch (error) {
    console.error(error);
  }
}
