// Variables: 購物車資訊
let shoppingCartInfos = {
  shipping: '',
  payment: '',
  subtotal: 0,
  freight: 60,
  total: 0,
  recipient: {
    name: '',
    phone: '',
    email: '',
    address: '',
    time: '',
  },
  list: [],
};

// set Function - model change: 重新計算subtotal後更新shoppingCartInfos
const setSubtotal = () => {
  const subtotal = shoppingCartInfos.list.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );
  shoppingCartInfos.subtotal = subtotal;
  shoppingCartInfos.total = shoppingCartInfos.subtotal + shoppingCartInfos.freight;
};

// set Function - model change: 載入localStorage至shoppingCartInfos變數中
const getLocalStorage = () => {
  if (localStorage.getItem('cart')) {
    shoppingCartInfos = JSON.parse(localStorage.getItem('cart'));
  }
};

// set Function - model change: 將shoppingCartInfos重設至localStorage
const setLocalStorage = () => {
  localStorage.setItem('cart', JSON.stringify(shoppingCartInfos));
};

// set Function - view update: 印出購物車數量
const renderInCartNumber = () => {
  if (shoppingCartInfos.list.length !== 0) {
    document.querySelector('.shopping-cart-number').textContent = shoppingCartInfos.list.length;
    document.querySelector('.shopping-cart-web-number').textContent = shoppingCartInfos.list.length;
  }
  document.querySelector('.shopping-cart-number').style.display = 'block';
  document.querySelector('.shopping-cart-web-number').style.display = 'block';
};

// run Function - view change: 各頁面通用 - 載入shoppingCartInfos
getLocalStorage();
// run Function - model change: 各頁面通用 - 重印購物車數量
renderInCartNumber();

export {
  shoppingCartInfos,
  setLocalStorage,
  getLocalStorage,
  renderInCartNumber,
  setSubtotal,
};
