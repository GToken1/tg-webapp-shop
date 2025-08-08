const tg = window.Telegram?.WebApp;
const products = [
  { id:"p1", name:"DJI Mini 4 Pro", price:979.00, img:"https://via.placeholder.com/800?text=DJI+Mini+4+Pro" },
  { id:"p2", name:"DJI Air 3 Fly More", price:1499.00, img:"https://via.placeholder.com/800?text=DJI+Air+3" },
  { id:"p3", name:"Action 4 Camera", price:399.00, img:"https://via.placeholder.com/800?text=Action+4" },
  { id:"p4", name:"FPV Combo", price:1299.00, img:"https://via.placeholder.com/800?text=FPV+Combo" },
  { id:"p5", name:"Tiramisu Classic (0.33L)", price:6.90, img:"https://via.placeholder.com/800?text=Tiramisu+0.33L" },
  { id:"p6", name:"Tiramisu Raspberry (0.33L)", price:7.50, img:"https://via.placeholder.com/800?text=Tiramisu+Raspberry" }
];

const cart = new Map();
const $list = document.getElementById("products");

function render(){
  $list.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${p.name}"/>
      <div class="body">
        <div class="name">${p.name}</div>
        <div class="price">€${p.price.toFixed(2)}</div>
        <button class="add" data-id="${p.id}">ADD</button>
      </div>
    </div>`).join("");
  $list.querySelectorAll(".add").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.id;
    cart.set(id, (cart.get(id)||0)+1);
    updateMainButton();
  }));
}

function updateMainButton(){
  const qty = [...cart.values()].reduce((a,b)=>a+b,0);
  const sum = [...cart.entries()].reduce((s,[id,q])=>{
    const p = products.find(x=>x.id===id); return s + p.price*q;
  },0);
  if(!qty){
    if(tg){ tg.MainButton.hide(); tg.MainButton.setParams({text:""}); }
    return;
  }
  const label = `Checkout • ${qty} • €${sum.toFixed(2)}`;
  if(tg){ tg.MainButton.setParams({text:label,is_visible:true}); tg.MainButton.show(); }
  else  { showFooter(label); }
}

function showFooter(text){
  if(document.querySelector(".footer")){
    document.querySelector(".footer .btn").textContent = text; return;
  }
  const f = document.createElement("div");
  f.className = "footer";
  f.innerHTML = `<div class="counter">${[...cart.values()].reduce((a,b)=>a+b,0)} items</div>
                 <button class="btn">${text}</button>`;
  f.querySelector(".btn").addEventListener("click", submitOrder);
  document.body.appendChild(f);
}

function submitOrder(){
  const order = [...cart.entries()].map(([id,q])=>{
    const p = products.find(x=>x.id===id);
    return { id, name:p.name, price:p.price, qty:q };
  });
  const payload = { order, ts:Date.now(), total: order.reduce((s,i)=>s+i.price*i.qty,0) };
  if(tg){ tg.sendData(JSON.stringify(payload)); tg.close(); }
  else { alert("Order:\\n"+JSON.stringify(payload,null,2)); }
}

if(tg){ tg.ready(); tg.MainButton.onClick(submitOrder); }
render();
