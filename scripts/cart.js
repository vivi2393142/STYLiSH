/* eslint-disable prefer-const */
/* eslint-disable no-useless-escape */
/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
import {
  shoppingCartInfos,
  setLocalStorage,
  renderInCartNumber,
  setSubtotal,
} from './cartFunction.js';

import { token } from './login.js';

/* ================================================
  渲染頁面：渲染購物車資料、渲染總金額
=================================================== */
// set Function - view update: 渲染總金額
const renderTotalAmount = () => {
  document.querySelector('.sum-total-value').textContent = shoppingCartInfos.subtotal;
  document.querySelector('.sum-freight').textContent = shoppingCartInfos.freight;
  document.querySelector('.sum-up').textContent = shoppingCartInfos.total;
};

// set Function - view update: 創造單項商品資料HTML
const renderSingleProduct = (localStorageList, index) => {
  const cartItemsRow = document.createElement('div');
  cartItemsRow.className = 'cart-items-row content-row';
  cartItemsRow.id = `cart-items-row-${index}`;

  const colInfo = document.createElement('div');
  colInfo.className = 'col-info';

  const colInfoPic = document.createElement('img');
  colInfoPic.className = 'col-info-pic';
  colInfoPic.src = localStorageList[index].main_image;

  const colInfoInfo = document.createElement('div');
  colInfoInfo.className = 'col-info-info';
  colInfoInfo.innerHTML = `${localStorageList[index].name}
  <br />
  ${localStorageList[index].id}
  <br /><br />
  顏色：${localStorageList[index].color.name}
  <br />
  尺寸：${localStorageList[index].size}`;

  const colQty = document.createElement('div');
  colQty.className = 'col-qty';

  const optionList = document.createElement('select');
  optionList.id = `cart-item-qty-pulldown-${index}`;
  optionList.className = 'cart-item-qty-pulldown';
  optionList.name = 'cart-item-qty-pulldown';

  for (let i = 1; i <= localStorageList[index].stock; i++) {
    const qtyOption = document.createElement('option');
    qtyOption.value = i;
    qtyOption.textContent = i;
    // eslint-disable-next-line radix
    if (i === parseInt(localStorageList[index].qty)) {
      qtyOption.selected = true;
      optionList.appendChild(qtyOption);
    } else {
      optionList.appendChild(qtyOption);
    }
  }

  const colPrice = document.createElement('div');
  colPrice.className = 'col-price';
  colPrice.textContent = `NT. ${localStorageList[index].price}`;

  const cloSubtotal = document.createElement('div');
  cloSubtotal.id = `col-subtotal-${index}`;
  cloSubtotal.className = 'col-subtotal';
  cloSubtotal.textContent = `NT. ${
    localStorageList[index].price * localStorageList[index].qty
  }`;

  const colRemove = document.createElement('div');
  colRemove.className = 'col-remove';

  const removeImg = document.createElement('img');
  removeImg.id = `remove-${index}`;
  removeImg.className = 'col-remove-src';
  removeImg.src = 'img/cart-remove.png';

  colInfo.appendChild(colInfoPic);
  colInfo.appendChild(colInfoInfo);
  colQty.appendChild(optionList);
  colRemove.appendChild(removeImg);

  cartItemsRow.appendChild(colInfo);
  cartItemsRow.appendChild(colQty);
  cartItemsRow.appendChild(colPrice);
  cartItemsRow.appendChild(cloSubtotal);
  cartItemsRow.appendChild(colRemove);

  document.querySelector('.table-content').appendChild(cartItemsRow);
};

// set Function - view update: 渲染購物車商品
const renderCartList = () => {
  const tableContents = document.querySelector('.table-content');
  // step1. 預先清空商品view
  tableContents.innerHTML = '';
  // step2. 確認購物車內是否有商品
  if (shoppingCartInfos.list.length === 0) {
    tableContents.innerHTML = '<div class="no-item-remind">目前購物車中沒有商品唷！</div>';
    document
      .querySelector('.payment-button')
      .classList.add('payment-button-disabled');
  } else {
    // step3. 若有，迴圈渲染所有商品資料
    for (let i = 0; i < shoppingCartInfos.list.length; i++) {
      const hrLine = document.createElement('hr');
      hrLine.id = `table-hr-${i}`;
      if (i !== shoppingCartInfos.list.length - 1) {
        hrLine.className = 'table-hr';
      } else {
        hrLine.className = 'table-hr-null';
      }
      renderSingleProduct(shoppingCartInfos.list, i);
      document.querySelector(`#cart-items-row-${i}`).appendChild(hrLine);
    }
  }
};

// run Function - view change: 渲染購物車商品、渲染總金額
renderCartList();
setSubtotal();
setLocalStorage();
renderTotalAmount();

/* ================================================
  移除、修改數量
=================================================== */
// set Function - add controller: 修改數量事件 1.移除localStorage中list資料 2.移除html 3.更新總金額
const amountChooseController = () => {
  document
    .querySelectorAll('.cart-item-qty-pulldown')
    .forEach((item, index) => {
      item.addEventListener('change', () => {
        // step1. model change - 找出最新修改的值
        const newQty = item.value;
        // step2. model change - 更新shoppingCartInfos
        shoppingCartInfos.list[index].qty = newQty;
        setSubtotal();
        // step3. view update - 重新渲染小計、總金額
        document.querySelector(`#col-subtotal-${index}`).textContent = `NT. ${
          shoppingCartInfos.list[index].price * newQty
        }`;
        renderTotalAmount();
        // step4. model change - 重設localStorage
        setLocalStorage();
      });
    });
};

// set Function - add controller: 垃圾桶點擊事件，點擊後 1.移除資料 2.重印畫面 3.更新localStorage 4.顯示alert
const removeButtonController = () => {
  for (let i = 0; i < shoppingCartInfos.list.length; i++) {
    document.querySelector(`#remove-${i}`).addEventListener('click', () => {
      // step1. model change - 更新shoppingCartInfos資料、重新計算subtotal
      shoppingCartInfos.list.splice(i, 1);
      setSubtotal();
      // step2. view update - 重渲染商品資料、總金額
      renderCartList();
      renderTotalAmount();
      renderInCartNumber();
      // step3. controller added - 重新新增eventListener
      removeButtonController();
      amountChooseController();
      // step4. model change - 將shoppingCartInfos更新至localStorage
      setLocalStorage();
      // step5. view update - 顯示alert
      alert('已從購物車中移除');
    });
  }
};

// run Function - add controller: 修改數量事件、垃圾桶點擊事件
amountChooseController();
removeButtonController();

/* ================================================
  串接金流 - TapPay
=================================================== */
// Variables: checkoutAPI使用變數
const checkoutAPIData = {
  prime: '',
  order: {},
};

// Variables: checkoutAPI導向訂單編號變數
let orderNumber = '';

// TapPay1. SetupSDK
TPDirect.setupSDK(
  12348,
  'app_pa1pQcKoY22IlnSXq5m5WP5jFKzoRG58VEXpT7wU62ud7mMbDOGzCYIlzzLF',
  'sandbox',
);

// TapPay2. TPDirect.card.setup - styles setting
const fields = {
  number: {
    // css selector
    element: '#card-number',
    placeholder: '**** **** **** ****',
  },
  expirationDate: {
    // DOM object
    element: document.getElementById('card-expiration-date'),
    placeholder: 'MM / YY',
  },
  ccv: {
    element: '#card-ccv',
    placeholder: 'ccv',
  },
};
TPDirect.card.setup({
  // Display ccv field
  fields,
  styles: {
    // Style all elements
    input: {
      color: 'gray',
    },
  },
});

// set Function - fetch: post checkout API 後轉到 thankyou page
const ajaxPostCheckoutAPI = () => {
  const uri = 'https://api.appworks-school.tw/api/1.0/order/checkout';
  let headers = {};
  if (token === '') {
    headers = {
      'Content-type': 'application/json',
    };
  } else {
    headers = {
      'Content-type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }
  fetch(uri, {
    method: 'POST',
    headers,
    body: JSON.stringify(checkoutAPIData),
  })
    .then((res) => res.json())
    .then((result) => {
      orderNumber = result.data.number;
      document.location.href = `./thankyou.html?number=${orderNumber}`;
    });
};

// set Function - view update: 確認信用卡資料是否正確，否則警告，正確即送出(並清除購物車資料)
// TapPay3. onUpdate - check card-input status > getTappayFieldsStatus > Get Prime then setting
const setPrime = () => {
  // 取得 TapPay Fields 的 status
  const tappayStatus = TPDirect.card.getTappayFieldsStatus();
  // 確認是否可以 getPrime
  if (tappayStatus.canGetPrime === false) {
    document.querySelector('.payment-note').style.display = 'inline-block';
    alert('信用卡資料不正確');
    return;
  }
  // Get prime
  TPDirect.card.getPrime((result) => {
    if (result.status !== 0) {
      document.querySelector('.payment-note').style.display = 'inline-block';
      alert('信用卡資料不正確');
      return;
    }
    checkoutAPIData.prime = result.card.prime;
    localStorage.clear();
    document.querySelector('.loader').style.display = 'block';
    document.querySelector('.loader-cover').style.display = 'block';
    document.querySelector('.payment-note').style.display = 'none';
    ajaxPostCheckoutAPI();
  });
};

/* ================================================
  Regular expression
=================================================== */
// Variables: 所有input項目的規則及是否合規
let isValidList = [
  { item: 'name', rule: /^[\s\S]*.*[^\s][\s\S]*$/, isValid: false },
  { item: 'email', rule: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, isValid: false },
  { item: 'phone', rule: /^09[0-9]{8}$/, isValid: false },
  { item: 'address', rule: /^[\s\S]*.*[^\s][\s\S]*$/, isValid: false },
];

// set Function - eventHandler: 渲染驗證input結果，若不符合將顯示提示文字
const inputRegexHandler = (inputItem, index) => {
  const inputNote = document.querySelectorAll('.recipient-input-note')[index];
  const isInputValid = isValidList[index].rule.test(inputItem.value);
  isValidList[index].isValid = isInputValid;
  if (!isInputValid) {
    inputItem.style.borderColor = 'red';
    inputNote.style.display = 'block';
  } else {
    inputItem.style.borderColor = '#979797';
    inputNote.style.display = 'none';
  }
};

// run Function - add controller: input輸入後事件 > 執行驗證
document.querySelectorAll('.recipient-input').forEach((input, index) => {
  input.addEventListener('blur', () => inputRegexHandler(input, index));
});

/* ================================================
  資料未填警告、準備資料、送出資料
=================================================== */
// Variables: input欄位使用變數
const cartInputData = [
  {
    title: 'name',
    titleCHT: '收件人姓名',
    className: '.recipient-input-name',
    value: '',
  },
  {
    title: 'email',
    titleCHT: 'Email',
    className: '.recipient-input-email',
    value: '',
  },
  {
    title: 'phone',
    titleCHT: '手機號碼',
    className: '.recipient-input-phone',
    value: '',
  },
  {
    title: 'address',
    titleCHT: '收件地址',
    className: '.recipient-input-address',
    value: '',
  },
  {
    title: 'time',
    titleCHT: '配送時間',
    className: '.delivery-time-input',
    value: '',
  },
];

// set Function - model change: 準備checkoutAPIData
const setCheckoutAPIData = () => {
  cartInputData.forEach((item) => {
    // step1. 重設部分資料入shoppingCartInfos
    if (
      item.title === 'time'
      && document.querySelector('[name=delivery-time]:checked')
    ) {
      item.value = document.querySelector('[name=delivery-time]:checked').value;
    } else if (item.title === 'time') {
      item.value = '';
    } else {
      item.value = document.querySelector(item.className).value;
    }
  });
  for (let i = 0; i < 5; i++) {
    const key = Object.keys(shoppingCartInfos.recipient)[i];
    shoppingCartInfos.recipient[key] = cartInputData.filter(
      (itemInCart) => itemInCart.title === key,
    )[0].value;
  }
  shoppingCartInfos.shipping = 'delivery';
  shoppingCartInfos.payment = 'credit_card';
  // step2. 建立checkoutAPIData
  checkoutAPIData.order = shoppingCartInfos;
  checkoutAPIData.order.list.forEach((item) => {
    delete item.stock;
    delete item.main_image;
  });
};

// run Function - add controller: 送出付款事件 1.確認購物車使否有項目 2.重設data 3.判斷資料是否填寫正確 4.判斷信用卡後 5.送出
document.querySelector('.payment-button').addEventListener('click', () => {
  // step1. 確認購物車是否有項目，否則不可點擊
  const inCartQty = shoppingCartInfos.list.filter((item) => item !== null)
    .length;
  if (inCartQty === 0) {
    return;
  }
  // step2. model change - 重設checkoutAPI data
  setCheckoutAPIData();
  // step3. view update - 判斷資料是否填寫正確，否則返回，並給予警告
  const allInput = document.querySelectorAll('.recipient-input');
  const allInputNote = document.querySelectorAll('.recipient-input-note');
  allInput.forEach((input, index) => {
    inputRegexHandler(input, index);
  });
  const allValidStatus = isValidList.map((item) => item.isValid);
  if (allValidStatus.includes(false)) {
    alert(allInputNote[allValidStatus.indexOf(false)].innerText);
  } else {
    // step4. view update - 判斷信用卡資料是否正確，否則返回
    setPrime();
  }
});
