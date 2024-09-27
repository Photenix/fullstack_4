import"./modulepreload-polyfill-B5Qt9EMX.js";import{S as d}from"./sweetalert2.esm.all-BccGxJ0c.js";import"./main-C5KVrVRe.js";/* empty css                   */const m=`<div class="mb-3 row" style="height:100px">
  <div class="col">
    <input type="number" name="" id="" class="form-control h-100" maxlength="1" max="9" min="0">
  </div>
  <div class="col">
    <input type="number" name="" id="" class="form-control h-100" maxlength="1" max="9" min="0">
  </div>
  <div class="col">
    <input type="number" name="" id="" class="form-control h-100" maxlength="1" max="9" min="0">
  </div>
  <div class="col">
    <input type="number" name="" id="" class="form-control h-100" size="1" max="9" min="0">
  </div>
  
</div>
<button type="submit" class="btn btn-primary w-100 py-8 fs-4 mb-4 rounded-2">Enviar</button>
<a href="../../../" class="btn btn-light w-100 py-8 fs-4 mb-4 rounded-2">Cancelar</a>`,c=document.getElementById("form-restore-one"),s=document.querySelector("#email"),u=document.getElementById("restore-view");let o=!1,r="";const p=t=>{t.preventDefault();const i=t.target.querySelectorAll("input");let n=!0;for(let e=0;e<i.length;e++)i[e].value==""&&(i[e].classList.add("is-invalid"),n=!1);if(!n)return null;window.location.href=`/src/html/change-password.html?id=${r}`},l=t=>{t.target.classList.remove("is-invalid")};s.addEventListener("keyup",l);c.addEventListener("submit",async t=>{t.preventDefault();const n=await(await fetch("http://localhost:80/api/pin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s.value}),credentials:"include"})).json();if(r=n.data.id,s.value=="")return s.classList.add("is-invalid");if(n.success===!1)return d.fire({title:"Email ingresado no existe en el sistema",text:"Porfavor verifique los datos",icon:"error",timer:1500}),s.classList.add("is-invalid");if(!o){o=!0;const e=document.createElement("form");e.id="form-restore-two",e.innerHTML=m,u.appendChild(e),document.getElementById("options-restore-one").innerHTML=`
            <button type="submit" class="btn btn-primary disable w-100 py-8 fs-4 rounded-2">Enviar</button>
            <span id="passwordHelpInline" class="form-text text-center w-100">
                Puedes volver a solicitar su PIN en x segundos.
            </span>
        `,document.getElementById("form-restore-two").addEventListener("submit",p),document.getElementById("form-restore-two").querySelectorAll("input").forEach(a=>a.addEventListener("keypress",l))}});
