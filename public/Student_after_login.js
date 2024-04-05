const item = document.querySelectorAll(".items")

item.forEach(item => {
    item.addEventListener("click",()=>{
        item.classList.toggle("checked");
    })
})