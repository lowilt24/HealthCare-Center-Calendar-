const btn = document.querySelectorAll(".fa-eye.icono").forEach(icon =>{
    icon.addEventListener('click',()=>{
        const inputid = icon.dataset.target;
        const input = document.getElementById(inputid);

        if(input.type === "password"){
            input.type = "text";
            icon.classList.replace("fa-eye","fa-eye-slash");
        }
        else if(input.type ==="text"){
            input.type="password";
            icon.classList.replace("fa-eye-slash","fa-eye");
        }

    })
})

document.getElementById("form").addEventListener("submit",function(event){
    const pass1 = document.getElementById("pass1").value;
    const pass2 = document.getElementById("pass2").value;

    if(pass1 != pass2){
        alert("the passwords does not match");
        event.preventDefault();
    }
    else{
        this.reset();
    }
})