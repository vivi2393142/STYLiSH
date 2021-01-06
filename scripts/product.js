/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */
import {
  setLocalStorage,
  shoppingCartInfos,
  renderInCartNumber,
  getLocalStorage,
} from './cartFunction.js';

/* ================================================
  商品選項監聽事件：尺寸選擇
=================================================== */
// Variables: 商品資訊
const idParams = new URLSearchParams(window.location.search).get('id');
let colorChosenId = 0;
let sizeChosenId = 0;
let amountChosen = 1;
let amountLimit = 0;
const shoppingItem = {
  id: '',
  name: '',
  price: '',
  color: {
    name: '',
    code: '',
  },
  size: '',
  qty: '',
  main_image: '',
  stock: '',
};

// set Function - model change: (選擇顏色或尺寸後)更新amountLimit變數，重設amountChosen
const setAmountVariables = (data) => {
  const chosenArray = data.variants;
  amountLimit = chosenArray
    .filter((choose) => choose.size === data.sizes[sizeChosenId])
    .filter(
      (choose) => choose.color_code === data.colors[colorChosenId].code,
    )[0].stock;
  amountChosen = 1;
};

// set Function - add controller: 設置尺寸點擊事件 1.重設sizeChosenId、amountLimit、amountChosen 3.渲染選擇後尺寸、顏色、數量
const sizeClickController = (data) => {
  for (let i = 0; i < data.sizes.length; i++) {
    document.querySelector(`#sizeId${i}`).addEventListener('click', () => {
      // step1. model change - 重設sizeChosenId
      sizeChosenId = i;
      // step2. model change - 更新amountLimit、amountChosen
      setAmountVariables(data);
      // step3. view update - 渲染選擇後尺寸、顏色、數量
      document.querySelector('.number-value').innerHTML = amountChosen;
      for (let k = 0; k < data.sizes.length; k++) {
        document.querySelector(`#sizeId${k}`).className = 'size-choice';
      }
      document.querySelector(`#sizeId${i}`).className = 'size-choice-chosen';
    });
  }
};

/* ================================================
  商品選項監聽事件：顏色選擇
=================================================== */
// Variables: 設置顏色選取事件所需變數
let sizesIdArray = [];
let sizesInStockId = 0;

// set Function - eventHandler set - model: 設置顏色點擊事件callback
// - 重設colorChosenId、重設sizesIdArray、sizesInStockId、更新amountLimit、amountChosen
const colorClickModelHandler = (data, colorId) => {
  // step1. model change - 重設colorChosenId
  colorChosenId = colorId;
  // step2-1. model change - 篩選出選擇顏色後剩下的資料陣列
  const chosenArray = data.variants;
  const sizesInStock = chosenArray
    .filter((choose) => choose.stock > 0)
    .filter((choose) => choose.color_code === data.colors[colorChosenId].code)
    .map((choose) => choose.size);
  // step2-2. model change - 確認有庫存、沒庫存的尺寸id
  sizesIdArray = [...Array(data.sizes.length).keys()];
  sizesInStockId = sizesInStock.map((size) => data.sizes.indexOf(size));
  // step3. model change - 更新amountLimit、amountChosen
  setAmountVariables(data);
};

// set Function - eventHandler set - view: 設置顏色點擊事件callback - 渲染選擇後顏色、尺寸、數量
const colorClickViewHandler = (data) => {
  // step1. view change - 渲染選擇後顏色
  for (let i = 0; i < data.colors.length; i++) {
    document.querySelector(`#colorId${i}`).className = 'color-choice';
  }
  document.querySelector(`#colorId${colorChosenId}`).className = 'color-choice-chosen';
  // step2. view change - 渲染選擇後尺寸(修改尺寸選擇為in-stock第一個選項，並將out-of-stock者覆蓋div)
  sizeChosenId = sizesInStockId.includes(sizeChosenId)
    ? sizeChosenId
    : sizesInStockId[0];
  sizesIdArray.forEach((id) => {
    document.querySelector(`#sizeId${id}`).className = 'size-choice';
    document.querySelector(`#sizeCoverId${id}`).style.display = 'flex';
  });
  sizesInStockId.forEach((id) => {
    document.querySelector(`#sizeCoverId${id}`).style.display = 'none';
  });
  document.querySelector(`#sizeId${sizeChosenId}`).className = 'size-choice-chosen';
  // Step3. view change - 渲染選擇後數量
  document.querySelector('.number-value').innerHTML = amountChosen;
};

/// set Function - add controller: 設置顏色點擊事件 1.model change callback 2.view change callback
const colorClickController = (data) => {
  for (let i = 0; i < data.colors.length; i++) {
    document.querySelector(`#colorId${i}`).addEventListener('click', () => {
      colorClickModelHandler(data, i);
      colorClickViewHandler(data);
    });
  }
};

/* ================================================
  商品選項監聽事件：數量選擇
=================================================== */
// run Function - add controller: 數量減點擊事件 1.更新amountChosen 2.渲染amountChosen
document.querySelector('.calculator-minus').addEventListener('click', () => {
  amountChosen = amountChosen === 1 ? 1 : (amountChosen -= 1);
  document.querySelector('.number-value').innerHTML = amountChosen;
});

// run Function - add controller: 數量加點擊事件 1.更新amountChosen 2.渲染amountChosen
document.querySelector('.calculator-plus').addEventListener('click', () => {
  amountChosen = amountChosen === amountLimit ? amountChosen : (amountChosen += 1);
  document.querySelector('.number-value').innerHTML = amountChosen;
});

/* ================================================
  商品新增至購物車
=================================================== */
// set Function - model change: 更新shoppingItem，取得即時商品資訊
const setShoppingItem = (data) => {
  shoppingItem.id = data.id;
  shoppingItem.name = data.title;
  shoppingItem.price = data.price;
  shoppingItem.color.name = data.colors[colorChosenId].name;
  shoppingItem.color.code = data.colors[colorChosenId].code;
  shoppingItem.size = data.sizes[sizeChosenId];
  shoppingItem.qty = amountChosen;
  shoppingItem.main_image = data.main_image;
  shoppingItem.stock = data.variants.filter(
    (item) => item.color_code === data.colors[colorChosenId].code
      && item.size === data.sizes[sizeChosenId],
  )[0].stock;
};

// set Function - add controller: 點擊加入購物車事件 1.顯示alert 2.更新shoppingItem、更新shoppingCartInfos、重設localStorage 3.渲染購物車數量
const addToCartController = (data) => {
  document
    .querySelector('.add-to-shopping-cart')
    .addEventListener('click', () => {
      getLocalStorage();
      // step1. view update - 顯示alert
      alert('已加入購物車');
      // step2. model change - 取得當前商品資料
      setShoppingItem(data);
      // step3-1. model change - 確認當前商品資料是否已存在
      const sameItemArray = shoppingCartInfos.list.map((item) => {
        if (
          item.id === shoppingItem.id
          && item.color.code === shoppingItem.color.code
          && item.size === shoppingItem.size
        ) {
          return 1;
        }
        return 0;
      });
      const isExisting = sameItemArray.reduce((sum, num) => sum + num, 0);
      // step3-2. model change - 判別是否已存在相同item，更新local storage資料，且數量不得高於limit
      if (isExisting === 0) {
        shoppingCartInfos.list.push(shoppingItem);
      } else {
        const newQty = shoppingCartInfos.list[sameItemArray.indexOf(1)].qty
          + shoppingItem.qty;
        shoppingCartInfos.list[sameItemArray.indexOf(1)].qty = newQty > amountLimit ? amountLimit : newQty;
      }
      // step4. model change - 重設localStorage
      setLocalStorage();
      // step6. view update - 重新渲染購物車數量
      renderInCartNumber();
    });
};

/* ================================================
  AJAX串接API，並印出商品資料
=================================================== */
// set Function - view update: 渲染顏色選項
const renderColorsChoices = (data) => {
  let insertHTML = '';
  for (let i = 0; i < data.colors.length; i++) {
    insertHTML += `<div id="colorId${i}" class="color-choice"></div>`;
  }
  document.querySelector('.colors-choices').innerHTML = insertHTML;
  for (let i = 0; i < data.colors.length; i++) {
    document.querySelector(
      `#colorId${i}`,
    ).style.backgroundColor = `#${data.colors[i].code}`;
  }
  document.querySelector('#colorId0').className = 'color-choice-chosen';
};

// set Function - view update: 渲染尺寸選項
const renderSizesChoices = (data) => {
  let insertHTML = '';
  for (let i = 0; i < data.sizes.length; i++) {
    insertHTML += `<div class="size-outer">
      <div id="sizeId${i}" class="size-choice">
        ${data.sizes[i]}
      </div>
      <div id="sizeCoverId${i}" class="size-choice-cover">
      </div>
    </div>`;
  }
  document
    .querySelector('.sizes-choices')
    .insertAdjacentHTML('afterbegin', insertHTML);
};

// set Function - view update: 渲染小商品圖
const renderSubImg = (data) => {
  let insertHTML = '';
  for (let i = 0; i < 2; i++) {
    insertHTML += `<img
      class="product-sub-pic"
      src="${data.images[i]}"
      alt="ProductSubPic"
    />`;
  }
  document
    .querySelector('.product-sub-info')
    .insertAdjacentHTML('beforeend', insertHTML);
};

// set Function - view update: 渲染全頁面
const renderProductDetails = (data) => {
  const productDescriptionWrap = data.description.replace(/\s+/g, '<br />');
  const productDescription = `${data.note}<br /><br />${productDescriptionWrap}<br />${data.texture}<br /><br />清洗：${data.wash}<br />產地：${data.place}`;
  document.querySelector('.product-main-pic-src').src = data.main_image;
  document.querySelector('.product-main-pic-src').alt = 'product-main-picture';
  document.querySelector('.product-title').textContent = data.title;
  document.querySelector('.product-id').textContent = data.id;
  document.querySelector('.product-price').textContent = `TWD.${data.price}`;
  document.querySelector('.product-intro').textContent = data.story;
  document.querySelector('.notice').innerHTML = productDescription;
  document.querySelector('.number-value').innerHTML = 1;
  document.querySelector(`#${data.category}Tab`).classList.add('active-tab');
  renderColorsChoices(data);
  renderSizesChoices(data);
  renderSubImg(data);
};

// set Function - XML: get product detail API，更新並印出商品資料
const ajaxGetProductDetails = () => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const productData = JSON.parse(xhr.responseText);
      window.addEventListener(
        'DOMContentLoaded',
        renderProductDetails(productData.data),
      );
      getLocalStorage();
      renderInCartNumber();
      colorClickController(productData.data);
      sizeClickController(productData.data);
      colorClickModelHandler(productData.data, 0);
      colorClickViewHandler(productData.data);
      addToCartController(productData.data);
    }
  };
  xhr.open(
    'GET',
    `https://api.appworks-school.tw/api/1.0/products/details?id=${idParams}`,
  );
  xhr.send();
};

// run Function - XML: get product detail API，更新並印出商品資料
ajaxGetProductDetails();
