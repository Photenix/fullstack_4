import"./main-DtEDl7Xs.js";/* empty css                   */let r=[{id:1,fecha:"2024-09-13",estado:"Pagado",cliente:"Cliente 1",productos:[{nombre:"Vestido de seda",cantidad:1,precio:25e4},{nombre:"Bolso de cuero",cantidad:1,precio:18e4}],reciboFoto:null},{id:2,fecha:"2024-09-13",estado:"Pagado",cliente:"Cliente 2",productos:[{nombre:"Zapatos de tacón",cantidad:1,precio:2e5},{nombre:"Collar de perlas",cantidad:1,precio:15e4}],reciboFoto:null},{id:3,fecha:"2024-09-12",estado:"Pendiente",cliente:"Cliente 3",productos:[{nombre:"Blusa de algodón",cantidad:2,precio:8e4},{nombre:"Pantalón vaquero",cantidad:1,precio:12e4}],reciboFoto:null},{id:4,fecha:"2024-09-11",estado:"Pendiente",cliente:"Cliente 4",productos:[{nombre:"Chaqueta de cuero",cantidad:1,precio:35e4}],reciboFoto:null},{id:5,fecha:"2024-09-10",estado:"Cancelado",cliente:"Cliente 5",productos:[{nombre:"Falda plisada",cantidad:1,precio:1e5},{nombre:"Blusa de seda",cantidad:1,precio:13e4},{nombre:"Sandalias",cantidad:1,precio:9e4}],reciboFoto:null}];const m=[{nombre:"Vestido de seda",precio:25e4},{nombre:"Bolso de cuero",precio:18e4},{nombre:"Zapatos de tacón",precio:2e5},{nombre:"Collar de perlas",precio:15e4},{nombre:"Blusa de algodón",precio:8e4},{nombre:"Pantalón vaquero",precio:12e4},{nombre:"Chaqueta de cuero",precio:35e4},{nombre:"Falda plisada",precio:1e5},{nombre:"Blusa de seda",precio:13e4},{nombre:"Sandalias",precio:9e4}];document.addEventListener("DOMContentLoaded",function(){const b=document.querySelector("#pedidosTable tbody"),E=document.getElementById("viewModal"),u=document.getElementById("receiptModal"),s=document.getElementById("addOrderModal"),g=document.getElementById("searchInput"),v=document.getElementById("searchButton"),B=document.getElementById("addOrderButton"),C=document.getElementById("receiptForm"),f=document.getElementById("addOrderForm"),I=document.getElementById("addProductButton"),i=document.getElementById("productList");function p(e=r){b.innerHTML="",e.forEach(t=>{const o=document.createElement("tr");o.innerHTML=`
                <td>${t.id}</td>
                <td>${t.fecha}</td>
                <td>${t.estado}</td>
                <td>${t.cliente}</td>
                <td>
                    <button class="action-button" onclick="visualizarPedido(${t.id})">Visualizar</button>
                    <button class="action-button" onclick="generarRecibo(${t.id})">Recibo de pago</button>
                </td>
            `,b.appendChild(o)})}p(),window.visualizarPedido=function(e){const t=r.find(o=>o.id===e);if(t){const o=document.getElementById("orderDetails");o.innerHTML=`
                <h3>Pedido #${t.id}</h3>
                <p><strong>Cliente:</strong> ${t.cliente}</p>
                <p><strong>Fecha:</strong> ${t.fecha}</p>
                <p><strong>Estado:</strong> ${t.estado}</p>
                <h4>Productos:</h4>
                <div class="product-list">
                    ${t.productos.map(n=>`
                        <div class="product-item">
                            <img src="/placeholder.svg?height=100&width=100" alt="${n.nombre}">
                            <p>${n.nombre}</p>
                            <p>Cantidad: ${n.cantidad}</p>
                            <p>Precio: $${n.precio.toLocaleString("es-CO")} COP</p>
                        </div>
                    `).join("")}
                </div>
                <p><strong>Total:</strong> $${t.productos.reduce((n,d)=>n+d.precio*d.cantidad,0).toLocaleString("es-CO")} COP</p>
                ${t.reciboFoto?`<p><strong>Recibo de pago:</strong> <img src="${t.reciboFoto}" alt="Recibo de pago" style="max-width: 200px;"></p>`:""}
            `,E.style.display="block"}},window.generarRecibo=function(e){document.getElementById("receiptOrderId").value=e,u.style.display="block"},C.addEventListener("submit",function(e){e.preventDefault();const t=parseInt(document.getElementById("receiptOrderId").value),o=document.getElementById("receiptPhoto").files[0];if(o){const n=new FileReader;n.onload=function(d){const l=r.find(a=>a.id===t);l&&(l.reciboFoto=d.target.result,Swal.fire({title:"Recibo subido",text:"El recibo de pago ha sido subido exitosamente",icon:"success",confirmButtonText:"OK"}),c(u))},n.readAsDataURL(o)}}),B.addEventListener("click",function(){s.style.display="block"});function h(){const e=document.createElement("div");e.className="product-input",e.innerHTML=`
            <select required>
                <option value="">Seleccione un producto</option>
                ${m.map(n=>`<option value="${n.nombre}">${n.nombre}</option>`).join("")}
            </select>
            <input type="number" placeholder="Cantidad" min="1" required>
            <span class="product-price"></span>
            <button type="button" class="remove-product">Eliminar</button>
        `;const t=e.querySelector("select"),o=e.querySelector(".product-price");return t.addEventListener("change",function(){const n=m.find(d=>d.nombre===this.value);n?o.textContent=`$${n.precio.toLocaleString("es-CO")} COP`:o.textContent=""}),e}I.addEventListener("click",function(){i.appendChild(h())}),i.addEventListener("click",function(e){e.target.classList.contains("remove-product")&&e.target.closest(".product-input").remove()}),f.addEventListener("submit",function(e){e.preventDefault();const t={id:r.length+1,fecha:document.getElementById("newOrderDate").value,estado:document.getElementById("newOrderStatus").value,cliente:document.getElementById("newOrderClient").value,productos:[],reciboFoto:null};i.querySelectorAll(".product-input").forEach(n=>{const d=n.querySelector("select"),l=n.querySelector('input[type="number"]'),a=m.find(P=>P.nombre===d.value);a&&t.productos.push({nombre:a.nombre,cantidad:parseInt(l.value),precio:a.precio})}),r.push(t),p(),c(s),Swal.fire({title:"Pedido agregado",text:"El nuevo pedido ha sido agregado exitosamente",icon:"success",confirmButtonText:"OK"})});function c(e){e.style.display="none",e===s&&(f.reset(),i.innerHTML="")}const L=document.getElementsByClassName("close");Array.from(L).forEach(e=>{e.onclick=function(){c(this.closest(".modal"))}}),document.getElementById("cancelReceipt").onclick=function(){c(u)},document.getElementById("cancelAddOrder").onclick=function(){c(s)},window.onclick=function(e){e.target.classList.contains("modal")&&c(e.target)};function y(){const e=g.value.toLowerCase(),t=r.filter(o=>o.id.toString().includes(e)||o.fecha.toLowerCase().includes(e)||o.estado.toLowerCase().includes(e)||o.cliente.toLowerCase().includes(e));p(t)}v.addEventListener("click",y),g.addEventListener("keyup",function(e){e.key==="Enter"&&y()}),i.appendChild(h())});
