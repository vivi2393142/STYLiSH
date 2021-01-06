const APIHostName = 'https://api.appworks-school.tw';
const APIVersion = '1.0';

/* =================================
  API匯入商品資訊
==================================== */
// set Function - model change: 渲染商品清單
const renderProductList = (data) => {
  if (data.length === 0) {
    document.getElementById('productList').textContent = '沒有搜尋到任何產品哦';
  } else {
    for (let i = 0; i < data.length; i++) {
      const sellItem = document.createElement('div');
      sellItem.className = 'sell-item';

      const productLink = document.createElement('a');
      productLink.href = `product.html?id=${data[i].id}`;

      const productImg = document.createElement('img');
      productImg.className = 'sell-item-pic';
      productImg.src = data[i].main_image;
      productImg.alt = 'productImage';

      const colorList = document.createElement('div');
      colorList.className = 'sell-item-color-list';
      colorList.id = `color-list-${data[i].id}`;

      const sellItemName = document.createElement('div');
      sellItemName.className = 'sell-item-name';
      sellItemName.textContent = data[i].title;

      const sellItemPrice = document.createElement('div');
      sellItemPrice.textContent = `TWD.${data[i].price}`;

      productLink.appendChild(productImg);
      productLink.appendChild(colorList);
      productLink.appendChild(sellItemName);
      productLink.appendChild(sellItemPrice);
      sellItem.appendChild(productLink);
      document.getElementById('productList').appendChild(sellItem);

      for (let k = 0; k < data[i].colors.length; k++) {
        const newDiv = document.createElement('div');
        newDiv.className = 'sell-item-color';
        newDiv.style.backgroundColor = `#${data[i].colors[k].code}`;
        document.getElementById(`color-list-${data[i].id}`).appendChild(newDiv);
      }
    }
  }
};

/* =================================
  AJAX載入商品資料
==================================== */
// Variables: 計算更新次數, 確認是否有下一頁, 確認此刻頁籤
let countRenewTimes = 0;
let nextPageNo = null;

// Variables: 宣告各個category點選按鍵方便使用
const tabList = ['women', 'men', 'accessories'];
const womenTab = document.getElementById('womenTab');
const menTab = document.getElementById('menTab');
const accessoriesTab = document.getElementById('accessoriesTab');

// set Function - view update: 渲染種類選擇按鈕(確認當前種類，並修改文字顏色)
const renderActiveTab = (tab) => {
  womenTab.className = 'homepage-tabs';
  menTab.className = 'homepage-tabs';
  accessoriesTab.className = 'homepage-tabs';
  if (tabList.includes(tab)) {
    document.getElementById(`${tab}Tab`).classList.add('active-tab');
  }
};

// set Function - fetch: get products/search API 1.判斷來源 2.判斷是否有下頁 3.get API 4.渲染頁面
const ajaxGetProductList = (page) => {
  // step1. model change - 判斷來源為首頁or頁籤or搜尋
  // step2. model change - 判斷是否有下頁
  const pageParams = page ? `?paging=${page}` : '';
  const pageParamsSearch = page ? `&paging=${page}` : '';
  const tagParams = new URLSearchParams(window.location.search).get('tag');
  let APILink = `${APIHostName}/api/${APIVersion}/products/`;
  if (tabList.includes(tagParams)) {
    APILink += `${tagParams}${pageParams}`;
  } else if (tagParams) {
    APILink += `search?keyword=${tagParams}${pageParamsSearch}`;
  } else {
    APILink += `all${pageParams}`;
  }
  // step3. model change - get API
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const productList = JSON.parse(xhr.responseText);
      // step4. view update - 渲染商品頁面
      window.addEventListener(
        'DOMContentLoaded',
        renderProductList(productList.data),
      );
      nextPageNo = productList.next_paging;
      renderActiveTab(tagParams);
    }
  };
  xhr.open('GET', APILink);
  xhr.send();
  countRenewTimes += 1;
};

// run Function - fetch: 預先載入頁面
ajaxGetProductList();

/* =================================================
  切換商品種類事件、滾動下滑事件、搜尋事件、放大鏡點擊事件
==================================================== */
// run Function - add controller: 切換商品種類事件 1.重設頁面 2.重新渲染種類按鈕、商品頁面、更新URL
tabList.forEach((tab) => {
  document.getElementById(`${tab}Tab`).addEventListener('click', () => {
    // step1-1. model change - 重設countRenewTimes
    countRenewTimes = 0;
    // step1-2. view update - 清空商品頁面
    document.getElementById('productList').innerHTML = '';
    // step2. view update - 重新渲染種類按鈕、商品頁面、更新URL
    window.history.replaceState({ tag: tab }, '', `?tag=${tab}`);
    ajaxGetProductList();
  });
});

// run Function - add controller: 滾動下滑事件 > 重新渲染頁面
document.addEventListener('scroll', () => {
  const { scrollHeight } = document.documentElement;
  const { scrollTop } = document.documentElement;
  const { clientHeight } = document.documentElement;
  if (scrollHeight - scrollTop - clientHeight < 70) {
    if (countRenewTimes === nextPageNo) {
      ajaxGetProductList(countRenewTimes);
    }
  }
});

// run Function - add controller: 搜尋事件(小搜尋列) > 重新渲染頁面
document.getElementById('searchbar-form').addEventListener('submit', () => {
  countRenewTimes = 0;
  document.getElementById('productList').innerHTML = '';
});

// run Function - add controller: 搜尋事件(大搜尋列) > 重新渲染頁面
document
  .getElementById('searchbar-form-wider')
  .addEventListener('submit', () => {
    countRenewTimes = 0;
    document.getElementById('productList').innerHTML = '';
  });

// run Function - add controller: 點擊/離開放大鏡事件 > 重新渲染搜尋欄
const combineSearchbar = document.querySelector('.combine-searchbar');
const searchbarIcon = document.querySelector('.searchbar-icon');
const searchbarForm = document.querySelector('#searchbar-form');

document.querySelector('.searchbar-icon').addEventListener('click', () => {
  searchbarForm.style.display = 'block';
  combineSearchbar.classList.add('combine-searchbar-focus');
  searchbarIcon.classList.add('searchbar-icon-focus');
  document.querySelector('.searchbar-input').focus();
});

document.querySelector('.searchbar-input').addEventListener('blur', () => {
  searchbarForm.style.display = 'none';
  combineSearchbar.classList.remove('combine-searchbar-focus');
  searchbarIcon.classList.remove('searchbar-icon-focus');
});
