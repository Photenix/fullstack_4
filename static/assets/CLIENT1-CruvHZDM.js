import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css             */let r=[],f=8,i=1,c=[];fetch("/src/js/Cliente/productos.json").then(t=>t.json()).then(t=>{r=t,c=r,d(),b()});const h=document.querySelector("#contenedor-productos"),y=document.querySelectorAll(".boton-categoria"),L=document.querySelector("#titulo-principal"),p=document.querySelector("#paginacion"),q=document.querySelector("#numerito"),S=document.querySelector("#search-input"),k=document.querySelector("#search-button");y.forEach(t=>{t.addEventListener("click",e=>{y.forEach(o=>o.classList.remove("active")),e.currentTarget.classList.add("active"),e.currentTarget.id!="todos"?(c=r.filter(o=>o.categoria.id===e.currentTarget.id),L.innerText=c[0].categoria.nombre):(c=r,L.innerText="Todos los productos"),i=1,d(),b()})});k.addEventListener("click",E);S.addEventListener("keypress",t=>{t.key==="Enter"&&E()});function E(){const t=S.value.toLowerCase().trim();c=r.filter(e=>e.titulo.toLowerCase().includes(t)||e.categoria.nombre.toLowerCase().includes(t)),i=1,d(),b(),L.innerText=`Resultados para: "${t}"`}function d(){h.innerHTML="";const t=(i-1)*f,e=t+f;c.slice(t,e).forEach(a=>{const n=document.createElement("div");n.classList.add("producto"),n.innerHTML=`
            <img class="producto-imagen" src="${a.imagen}" alt="${a.titulo}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${a.titulo}</h3>
                <p class="producto-precio">$${a.precio}</p>
                <button class="producto-ver-detalles" data-id="${a.id}">Ver detalles</button>
            </div>
        `,h.append(n)}),P()}function b(){p.innerHTML="";const t=Math.ceil(c.length/f),e=document.createElement("li");e.innerHTML='<a href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>',e.classList.add("page-item"),i===1&&e.classList.add("disabled"),e.addEventListener("click",a=>{a.preventDefault(),i>1&&(i--,d(),v())}),p.appendChild(e);for(let a=1;a<=t;a++){const n=document.createElement("li");n.classList.add("page-item"),a===i&&n.classList.add("active"),n.innerHTML=`<a href="#" class="page-link">${a}</a>`,n.addEventListener("click",s=>{s.preventDefault(),i=a,d(),v(),window.scrollTo(0,0)}),p.appendChild(n)}const o=document.createElement("li");o.innerHTML='<a href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>',o.classList.add("page-item"),i===t&&o.classList.add("disabled"),o.addEventListener("click",a=>{a.preventDefault(),i<t&&(i++,d(),v())}),p.appendChild(o)}function v(){const t=p.querySelectorAll("li");t.forEach((e,o)=>{o===0?i===1?e.classList.add("disabled"):e.classList.remove("disabled"):o===t.length-1?i===t.length-2?e.classList.add("disabled"):e.classList.remove("disabled"):o===i?e.classList.add("active"):e.classList.remove("active")})}function P(){document.querySelectorAll(".producto-ver-detalles").forEach(e=>{e.addEventListener("click",A)})}let m=JSON.parse(localStorage.getItem("productos-en-carrito"))||[];function $(t){const e=t.currentTarget.id,o=r.find(u=>u.id===e),a=document.querySelector("#color").value,n=document.querySelector("#talla").value,s=a.charAt(0).toUpperCase()+a.slice(1).toLowerCase(),g=n.charAt(0).toUpperCase()+n.slice(1).toLowerCase(),l=m.findIndex(u=>u.id===e&&u.color===s&&u.talla===g);l!==-1?m[l].cantidad++:(o.cantidad=1,o.color=s,o.talla=g,m.push(o)),T(),localStorage.setItem("productos-en-carrito",JSON.stringify(m)),Toastify({text:"Producto agregado",duration:3e3,close:!0,gravity:"top",position:"right",stopOnFocus:!0,style:{background:"linear-gradient(to right, #4b33a8, #785ce9)",borderRadius:"2rem",textTransform:"uppercase",fontSize:".75rem"},offset:{x:"1.5rem",y:"1.5rem"},onClick:function(){}}).showToast()}function T(){let t=m.reduce((e,o)=>e+o.cantidad,0);q.innerText=t}function A(t){const e=t.currentTarget.dataset.id,o=r.find(l=>l.id===e),a=document.getElementById("modal-producto"),n=a.querySelector(".modal-contenido");n.innerHTML=`
        <span class="cerrar">&times;</span>
        <div class="modal-producto">
            <div class="modal-imagen-container">
                <img src="${o.imagen}" alt="${o.titulo}" class="modal-imagen">
            </div>
            <div class="modal-info">
                <h2 class="modal-titulo">${o.titulo}</h2>
                <p class="modal-categoria">Categoría: ${o.categoria.nombre}</p>
                <p class="modal-precio">$${o.precio}</p>
                <div class="modal-opciones">
                    <div class="modal-color">
                        <label for="color">Color:</label>
                        <select id="color">
                            <option value="negro">Negro</option>
                            <option value="blanco">Blanco</option>
                            <option value="azul">Azul</option>
                        </select>
                    </div>
                    <div class="modal-talla">
                        <label for="talla">Talla:</label>
                        <select id="talla">
                            <option value="s">S</option>
                            <option value="m">M</option>
                            <option value="l">L</option>
                            <option value="xl">XL</option>
                        </select>
                    </div>
                </div>
                <button class="producto-agregar" id="${o.id}">Agregar al carrito</button>
            </div>
        </div>
    `,a.style.display="block";const s=a.querySelector(".cerrar");s.onclick=function(){a.style.display="none"},window.onclick=function(l){l.target==a&&(a.style.display="none")},n.querySelector(".producto-agregar").addEventListener("click",$)}T();const M=document.querySelector("#open-menu"),w=document.querySelector("#close-menu"),C=document.querySelector("aside");M.addEventListener("click",()=>{C.classList.add("aside-visible")});w.addEventListener("click",()=>{C.classList.remove("aside-visible")});
