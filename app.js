let tg; // будет присвоен после загрузки страницы

const products = [
  {
    id: "mavic4pro",
    name: "DJI Mavic 4 Pro (комбо)",
    price: 209900,
    img: "https://www1.djicdn.com/cms/uploads/d275d97e1a2bbcf062c59b65d8a2e0d3@3840*2160.png"
  },
  {
    id: "mavic3pro",
    name: "DJI Mavic 3 Pro (комбо)",
    price: 179900,
    img: "https://www1.djicdn.com/cms/uploads/5c464c7a88a9a2f34f11342e893f8cfc@3840*2160.png"
  },
  {
    id: "mini4pro",
    name: "DJI Mini 4 Pro Fly More",
    price: 122900,
    img: "https://www1.djicdn.com/cms/uploads/f3e13d40c7f307f2de8e2e4e69c5d45b@3840*2160.png"
  }
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
    const f = document.querySelector(".footer"); if (f) f.remove();
    return;
  }
  const label = `Checkout • ${qty} • €${sum.toFixed(2)}`;
  if(tg){
    tg.MainButton.setParams({text:label,is_visible:true});
    tg.MainButton.show();
  } else {
    showFooter(label);
  }
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
  else { alert("Order:\n"+JSON.stringify(payload,null,2)); }
}

// Ждём, пока Telegram подставит объект в webview, и только потом стартуем
document.addEventListener("DOMContentLoaded", () => {
  tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
  render();
  if(tg){
    tg.ready();
    tg.expand();
    tg.MainButton.onClick(submitOrder);
  }
});
