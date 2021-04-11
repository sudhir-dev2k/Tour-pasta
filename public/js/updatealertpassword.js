const axios=require("axios");
updated=(password,passwordnew,passwordconfirm)=>{
    try{
    const res=await axios({
        method:'POST',
        url:'/submit-user-password',
        data:{
            password,
            passwordnew,
            passwordconfirm
        },
        withCredentials:true
    })
    if(res.status===200){
        alert('Updated Successfully');
        window.setTimeout(()=>{
            location.assign('/me')
        },900 )
    }
}catch(err){
    alert(err.reponse.data.message);
}

}
document.querySelector('.form-user-settings').addEventListener('submit', (e) => {
    e.preventDefault();
 
    const password = document.getElementById('password').value;
  
    const passwordnew= document.getElementById('passwordnew').value;
    
    const passwordconfirm = document.getElementById('passwordconfirm').value;
    updated(password,passwordnew,passwordconfirm);
  });