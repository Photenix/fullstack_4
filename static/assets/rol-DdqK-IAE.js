import"./main-D_gjJzFE.js";import{S as d}from"./sweetalert2.esm.all-BccGxJ0c.js";const i=(t,e,o)=>`<input type="checkbox" class="btn-check" id="${"pp-"+t+"-"+e}" autocomplete="off" ${o?"checked":""}>
    <label class="btn btn-outline-primary" for="${"pp-"+t+"-"+e}">${e}</label><br>`,p=(t,e,o)=>{const n=document.getElementById("permissions+privileges"),c=e;n.innerHTML+=`<tr>
      <th scope="row">${c}</th>
      <td>${i(t,"Crear",o.read)}</td>
      <td>${i(t,"Editar",o.create)}</td>
      <td>${i(t,"Actualizar",o.update)}</td>
      <td>${i(t,"Eliminar",o.delete)}</td>
      <td>${i(t,"Des",o.download)}</td>
    </tr>`};document.addEventListener("DOMContentLoaded",async()=>{const e=await(await fetch("http://localhost:80/api/auth/rol",{credentials:"include"})).json();E(e),console.log(e)});let m="";const h=async t=>{t==="Administrador"&&(t="Admin"),t==="Empleado"&&(t="Worker");const e=await fetch("http://localhost:80/api/auth/rol/"+t,{credentials:"include"}),{permissions:o}=await e.json(),n={rol:"Rol",user:"Usuario",access:"Acceso",shopping:"Compra",supplier:"Proveedores",product:"Productos",client:"Cliente",productOrder:"Orden de producto",sale:"Venta"};l.innerHTML="",Object.entries(o).forEach(([c,s],r)=>{p(r,n[c],s)})},b=t=>{const e=l.querySelectorAll("tr"),o={};e.forEach(c=>{let s=c.querySelector("th").innerText;o[s]=[],c.querySelectorAll("input").forEach(a=>{o[s].push(a.checked)})});const n=roles.findIndex(c=>c.name==m);roles[n].permissions={...o},d.fire({position:"top-end",title:"¡Cambios exitosos!",icon:"success",showConfirmButton:!1,timer:1e3})},f=document.querySelector("tbody");document.querySelector("#search-rol");const k=document.getElementById("rol-update");let l=document.getElementById("permissions+privileges");k.addEventListener("click",t=>b());const y=(t,e,o)=>{const n=document.createElement("tr"),c=`rol-id-${t}`;n.setAttribute("id",t),n.innerHTML=`<td>${e}</td>
        <td>
        <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="${c}" ${o?"checked":""}>
        </div>
        </td>
        <td>
            <button id="update-rol-id-${t}" class="btn btn-outline-warning" role="button" aria-pressed="true" data-bs-toggle="modal" data-bs-target="#exampleModal"><i class="ti ti-writing-sign"></i></button>
            <button type="button" class="btn btn-outline-danger"><i class="ti ti-trash"></i></button>
        </td>
    `;const s=n.querySelector(`#${c}`);s.addEventListener("change",a=>{d.fire({title:"¿Está seguro de cambiar estado a "+(s.checked?"activo":"inactivo")+"?",text:"El usuario sera notificado de su nuevo estado",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Sí, cambiar!"}).then(u=>{u.isConfirmed?d.fire({title:"Cambiado!",text:"El estado del usuario ha sido cambiado correctamente.",icon:"success",timer:1500}):s.checked=!s.checked})}),n.querySelector(`#update-rol-id-${t}`).addEventListener("click",a=>h(e)),f.appendChild(n)},E=t=>{for(const e of t)e.name==="Admin"&&(e.name="Administrador"),e.name==="Worker"&&(e.name="Empleado"),y(e._id,e.name,e.state)};
