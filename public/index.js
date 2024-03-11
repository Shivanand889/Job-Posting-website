function validateFormlog() {
    var x = document.forms["log"]["email"].value;
    var y = document.forms["log"]["password"].value;
    console.log("yes") ;
    if (x == "" || y=="") {
      alert("Invalid values or empty fields are not allowed");
      return false;
    }
}
function validateFormsign() {
    var x = document.forms["sign"]["email"].value;
    var y = document.forms["sign"]["password"].value;
    var c = document.forms["sign"]["gender"].value;
    var e = document.forms["sign"]["dob"].value;
    var d = document.forms["sign"]["contact"].value.toString();
    var e = document.forms["sign"]["Account_type"].value;
  
    
    if (x == "" || y=="" || !c || d.length !=10 || e=="") {
      alert("Invalid values or empty fields are not allowed");
      return false;
    }
}
