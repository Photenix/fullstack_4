import"./modulepreload-polyfill-B5Qt9EMX.js";/* empty css                   */import"./main-C5KVrVRe.js";const i=[{id:1,fecha:"2024-09-13",estado:"Pagado",productos:[{nombre:"Vestido de seda",cantidad:1,precio:25e4},{nombre:"Bolso de cuero",cantidad:1,precio:18e4}],reciboFoto:null},{id:2,fecha:"2024-09-15",estado:"Pendiente",productos:[{nombre:"Zapatos de tacón",cantidad:1,precio:2e5},{nombre:"Collar de perlas",cantidad:1,precio:15e4}],reciboFoto:null},{id:3,fecha:"2024-09-18",estado:"Cancelado",productos:[{nombre:"Blusa de algodón",cantidad:2,precio:8e4},{nombre:"Pantalón vaquero",cantidad:1,precio:12e4}],reciboFoto:null}];document.addEventListener("DOMContentLoaded",function(){const s=document.getElementById("orderList");function n(){s.innerHTML="",i.forEach(e=>{const o=document.createElement("div");o.className="order-card";const a=e.productos.reduce((t,d)=>t+d.cantidad*d.precio,0);o.innerHTML=`
                <div class="order-header">
                    <span class="order-id">Pedido #${e.id}</span>
                    <span class="order-status status-${e.estado.toLowerCase()}">${e.estado}</span>
                </div>
                <div class="order-details">
                    <p><strong>Fecha:</strong> ${e.fecha}</p>
                </div>
                <div class="product-list">
                    ${e.productos.map(t=>`
                        <div class="product-item">
                            <span class="product-name">${t.nombre}</span>
                            <span class="product-quantity">x${t.cantidad}</span>
                            <span class="product-price">$${t.precio.toLocaleString("es-CO")}</span>
                        </div>
                    `).join("")}
                </div>
                <div class="order-total">
                    Total: $${a.toLocaleString("es-CO")}
                </div>
                <button class="action-button" onclick="viewOrderDetails(${e.id})">Ver Detalles</button>
            `,s.appendChild(o)})}n(),window.viewOrderDetails=function(e){const o=i.find(a=>a.id===e);if(o){const a=o.productos.reduce((t,d)=>t+d.cantidad*d.precio,0);Swal.fire({title:`Detalles del Pedido #${o.id}`,html:`
                    <div class="order-details">
                        <p><strong>Fecha:</strong> ${o.fecha}</p>
                        <p><strong>Estado:</strong> ${o.estado}</p>
                    </div>
                    <h4>Productos:</h4>
                    <div class="product-list">
                        ${o.productos.map(t=>`
                            <div class="product-item">
                                <span class="product-name">${t.nombre}</span>
                                <span class="product-quantity">x${t.cantidad}</span>
                                <span class="product-price">$${t.precio.toLocaleString("es-CO")}</span>
                            </div>
                        `).join("")}
                    </div>
                    <div class="order-total">
                        <strong>Total:</strong> $${a.toLocaleString("es-CO")}
                    </div>
                    ${o.reciboFoto?`
                        <div class="receipt-photo">
                            <h4>Recibo de Pago:</h4>
                            <img src="${o.reciboFoto}" alt="Recibo de pago" style="max-width: 100%; height: auto;">
                        </div>
                    `:""}
                `,width:600,confirmButtonText:"Cerrar",showCloseButton:!0})}}});
