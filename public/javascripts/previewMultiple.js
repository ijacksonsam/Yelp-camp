
const previewMultiple = (e)=>{
    const ul=document.querySelector('.disp-img')
    ul.innerHTML=""
    const files = e.target.files
    for(let i=0;i<files.length;i++){
        console.log(URL.createObjectURL(files[i]),files[i])
        const img = document.createElement('img')
        img.src=URL.createObjectURL(files[i])
        img.classList.add('previewImage')
        const li=document.createElement('li')
        li.classList.add('mx-1')
        li.appendChild(img)
        ul.appendChild(li)
    }
}
let flag=false

document.querySelector(".custom-file-image #image").addEventListener('change',previewMultiple,false)
const cards=document.querySelectorAll("div.onclickprop")

for(let card of cards){
    card.addEventListener('click',(e)=>{
        const cb=e.target.querySelector("div.card-img-overlay div.form-check input[type='checkbox']")
        cb.checked=(!cb.checked)
    })
}