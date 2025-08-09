let tg;

// ₽ формат
const CURRENCY = "₽";
const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const money = n => `${fmt.format(n)} ${CURRENCY}`;

/**
 * ТОВАРЫ — цены примерные, пути к фото точные из твоего репо.
 * Для проблемных картинок добавил ?v=4 — это ломает кеш Telegram WebView.
 */
const products = [
  {
    id: "mavic4pro",
    name: "DJI Mavic 4 Pro (дрон)",
    price: 209900,
    images: [
      "mavic4pro-1.jpg?v=4","mavic4pro-2.jpg?v=4","mavic4pro-3.jpg?v=4",
      "mavic4pro-4.jpg?v=4","mavic4pro-5.jpg?v=4","mavic4pro-6.jpg?v=4",
      "mavic4pro-7.jpg?v=4"
    ]
  },
  {
    id: "mavic4pro_creator",
    name: "DJI Mavic 4 Pro 512GB Creator Combo (RC Pro 2)",
    price: 239900,
    images: [
      "mavic4pro-512gb-creator-combo-1.jpg?v=4",
      "mavic4pro-512gb-creator-combo-2.jpg?v=4",
      "mavic4pro-512gb-creator-combo-3.jpg?v=4",
      "mavic4pro-512gb-creator-combo-4.jpg?v=4",
      "mavic4pro-512gb-creator-combo-5.jpg?v=4",
      "mavic4pro-512gb-creator-combo-6.jpg?v=4",
      "mavic4pro-512gb-creator-combo-7.jpg?v=4"
    ]
  },
  {
    id: "mavic4pro_flymore",
    name: "DJI Mavic 4 Pro Fly More Combo",
    price: 199900,
    images: [
      "mavic4proflymorecombo-1.jpg?v=4",
      "mavic4proflymorecombo-2.jpg?v=4",
      "mavic4proflymorecombo-3jpg.webp?v=4", // в репо именно так назван файл (без точки)
      "mavic4proflymorecombo-4.jpg?v=4",
      "mavic4proflymorecombo-5.jpg?v=4",
      "mavic4proflymorecombo-6.jpg?v=4",
      "mavic4proflymorecombo-7.jpg?v=4"
    ]
  },
  {
    id: "neo_flymore",
    name: "DJI Neo Fly More Combo",
    price: 59900,
    images: [
      "neo-fly-more-combo-1.jpg?v=4","neo-fly-more-combo-2.jpg?v=4",
      "neo-fly-more-combo-3.jpg?v=4","neo-fly-more-combo-4.jpg?v=4",
      "neo-fly-more-combo-5.jpg?v=4","neo-fly-more-combo-6.jpg?v=4"
    ]
  },
  {
    id: "neo_motion_flymore",
    name: "DJI Neo Motion Fly More Combo",
    price: 69900,
    images: [
      "neo-motion-fly-more-combo-1.jpg?v=4","neo-motion-fly-more-combo-2.jpg?v=4",
      "neo-motion-fly-more-combo-3.jpg?v=4","neo-motion-fly-more-combo-4.jpg?v=4",
      "neo-motion-fly-more-combo-5.jpg?v=4","neo-motion-fly-more-combo-6.jpg?v=4",
      "neo-motion-fly-more-combo-7.jpg?v=4"
    ]
  },
  {
    id: "osmo360_popular",
    name: "DJI Osmo 360 Popular Combo",
    price: 47900,
    images: [
      "osmo360PopularCombo-1.jpg?v=4","osmo360PopularCombo-2.jpg?v=4",
      "osmo360PopularCombo-3.jpg?v=4","osmo360PopularCombo-4.jpg?v=4",
      "osmo360PopularCombo-5.jpg?v=4","osmo360PopularCombo-6.jpg?v=4",
      "osmo360PopularCombo-7.jpg?v=4","osmo360PopularCombo-8.jpg?v=4",
      "osmo360PopularCombo-9.jpg?v=4","osmo360PopularCombo-10.jpg?v=4"
    ]
  },
  {
    id: "micmini",
    name: "DJI Mic Mini (2TX+1RX+Case)",
    price: 19990,
    images: [
      "MicMini-2TX+1RX+ChargingCase-1.jpg?v=4",
      "MicMini-2TX+1RX+ChargingCase-2.jpg?v=4",
      "MicMini-2TX+1RX+ChargingCase-3.jpg?v=4",
      "MicMini-2TX+1RX+ChargingCase-4.jpg?v=4",
      "MicMini-2TX+1RX+ChargingCase-5.jpg?v=4",
      "MicMini-2TX+1RX+ChargingCase-6.jpg?v=4",
      "MicMini-2TX+1RX+ChargingCase-7.jpg?v=4",
      "MicMini-2TX+1RX+ChargingCase-8.jpg?v=4"
    ]
  }
];

const cart = new Map();
const $list = document.getElementById("products");

function render(){
  $list.innerHTML = products.map(p => `
    <div class="card" data-open="${p.id}">
      <img src="${p.images[0]}" alt="${p.name}"/>
      <div class="body">
        <div class="name">${p.name}</div>
        <div class="price">${money(p.price)}</div>
        <button class="add" data-id="${p.id}">ADD</button>
      </div>
    </div>`).join("");

  // Добавление в корзину
  $list.querySelectorAll(".add").forEach(btn => btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const id = btn.dataset.id;
    cart.set(id, (cart.get(id)||0)+1);
    updateMainButton();
  }));

  // Открытие галереи
  $list.querySelectorAll("[data-open]").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-open");
      const p = products.find(x=>x.id===id);
      openGallery(p);
    });
  });
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
  const label = `Checkout • ${qty} • ${money(sum)}`;
  if(tg){
    tg.MainButton.setParams({text:label,is_visible:true});
    tg.MainButton.enable();
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

function openGallery(p){
  let idx = 0;
  const overlay = document.createElement("div");
  overlay.className = "modal";
  overlay.innerHTML = `
    <div class="form" style="gap:8px;max-width:420px;">
      <h3 class="h3" style="margin:0">${p.name}</h3>
      <img id="big" src="${p.images[0]}" style="width:100%;border-radius:12px;object-fit:contain;max-height:60vh"/>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
        ${p.images.map((src,i)=>`<img data-i="${i}" src="${src}" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #eee;cursor:pointer">`).join("")}
      </div>
      <div class="row" style="justify-content:space-between">
        <button class="btn gray" id="prev">◀</button>
        <div style="font-weight:700">${money(p.price)}</div>
        <button class="btn blue" id="add">ADD</button>
      </div>
      <button class="btn gray" id="close" style="align-self:flex-end">Закрыть</button>
    </div>`;
  document.body.appendChild(overlay);

  const big = overlay.querySelector("#big");
  const thumbs = overlay.querySelectorAll("[data-i]");
  function show(i){ idx = (i+p.images.length)%p.images.length; big.src = p.images[idx]; }
  thumbs.forEach(t => t.addEventListener("click", ()=> show(+t.dataset.i)));
  overlay.querySelector("#prev").onclick = ()=> show(idx-1);
  overlay.querySelector("#add").onclick = ()=> { cart.set(p.id,(cart.get(p.id)||0)+1); updateMainButton(); };
  overlay.querySelector("#close").onclick = ()=> overlay.remove();
  overlay.addEventListener("click", (e)=> { if(e.target===overlay) overlay.remove(); });
}

function showOrderForm(onSubmit) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <form class="form">
      <h3 class="h3">Оформить заказ</h3>
      <input required name="name" class="inp" placeholder="Имя">
      <input required name="phone" class="inp" type="tel" pattern="\\+?\\d{10,15}" placeholder="Телефон (например, +79271234567)">
      <textarea name="comment" class="ta" rows="2" placeholder="Комментарий (необязательно)"></textarea>
      <div class="row">
        <button type="button" class="btn gray" id="cancelBtn">Отмена</button>
        <button type="submit" class="btn blue">Подтвердить</button>
      </div>
    </form>
  `;
  document.body.appendChild(modal);
  modal.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    onSubmit({
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      comment: form.comment.value.trim()
    });
    modal.remove();
  };
  modal.querySelector("#cancelBtn").onclick = () => modal.remove();
}

function submitOrder(){
  showOrderForm((user) => {
    const order = [...cart.entries()].map(([id,q])=>{
      const p = products.find(x=>x.id===id);
      return { id, name:p.name, price:p.price, qty:q };
    });
    const payload = { order, ts:Date.now(), total: order.reduce((s,i)=>s+i.price*i.qty,0), user };

    if (tg) {
      tg.MainButton.showProgress(true);
      try {
        tg.sendData(JSON.stringify(payload));
      } finally {
        setTimeout(() => {
          tg.MainButton.hideProgress();
          tg.close(); // даём iOS время отправить данные
        }, 700);
      }
    } else {
      alert("Order:\n"+JSON.stringify(payload,null,2));
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  tg = window.Telegram?.WebApp ?? null;
  render();
  if(tg){
    tg.ready();
    tg.expand();
    tg.MainButton.onClick(submitOrder);
    tg.onEvent("mainButtonClicked", submitOrder); // iOS safety
  }
});
