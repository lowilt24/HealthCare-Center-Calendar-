const btn = document.querySelector(".fa-eye");
const password = document.querySelector(".pass");

btn.addEventListener("click",()=>{
    if(password.type === "password"){
        password.type = "text";
        btn.classList.replace("fa-eye","fa-eye-slash");
    }
    else if(password.type ==="text"){
        password.type="password";
        btn.classList.replace("fa-eye-slash","fa-eye");
    }
})
//script to toggle the icon to hode or reveal the password