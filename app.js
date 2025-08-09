let tg;

const CURRENCY = "₽";
const fmt = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const money = (n) => `${fmt.format(n)} ${CURRENCY}`;

const products = [
  { id:"mavic4pro", name:"DJI Mavic 4 Pro (комбо)", price:209900,
    img:"img/mavic4pro.jpg" },
  { id:"mavic3pro", name:"DJI Mavic 3 Pro (комбо)", price:179900,
    img:"img/mavic3pro.jpg" },
  { id:"mini4pro",  name:"DJI Mini 4 Pro Fly More", price:122900,
    img:"img/mini4pro.jpg" }
];

const cart = new Map();
const $list = document.getElementById("products");

function render(){
  $list.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${p.name}"/>
      <div class="body">
        <div class="name">${p.name}</div>
        <div class="price">${money(p.price)}</div>
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
          tg.close(); // iOS: даём время отправить данные
        }, 700);
      }
    } else {
      alert("Order:\\n"+JSON.stringify(payload,null,2));
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
