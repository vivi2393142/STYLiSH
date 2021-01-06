/* ================================================
  設置圖片切換效果、timer設置
=================================================== */
// Variables: 圖片輪播ID紀錄、timer設置
let currentImageId = 0;
let chosenImageId = 1;
let timer = null;

// set Function - model change: 設定下張圖片編號
const setNextPage = (dataLength) => {
  if (currentImageId + 1 === dataLength) {
    chosenImageId = 0;
  } else {
    chosenImageId = currentImageId + 1;
  }
};

// set Function - eventHandler set: timer事件callback 1.渲染選擇/下張圖片 2.重設下張圖片編號
const slideFeatureHandler = (dataLength) => {
  for (let i = 0; i < dataLength; i++) {
    document.querySelector(`#slideId${i}`).className = 'marketing-pic-now';
  }
  const currentPic = document.querySelector(`#slideId${currentImageId}`);
  currentPic.className = 'slideOutAnimation';
  if (currentImageId !== chosenImageId) {
    const chosenPic = document.querySelector(`#slideId${chosenImageId}`);
    const lastDotMenu = document.querySelector(`#dotMenuId${currentImageId}`);
    const chosenDotMenu = document.querySelector(`#dotMenuId${chosenImageId}`);
    currentImageId = chosenImageId;
    chosenPic.className = 'slideAnimation';
    lastDotMenu.className = 'homepage-main-pic-choose-inactive';
    chosenDotMenu.className = 'homepage-main-pic-choose-active';
  }
  setNextPage(dataLength);
};

// set Function - add controller: timer事件(10秒反覆執行) 1.渲染選擇/下張圖片 2.重設下張圖片編號
const timerController = (dataLength) => {
  timer = setInterval(() => {
    slideFeatureHandler(dataLength);
  }, 10000);
};

/* ================================================
  目錄點擊事件、懸停事件
=================================================== */
// set Function - add controller: 目錄點擊事件 1.更新chosenImageId 2.重設timer
const dotMenuController = (dataLength) => {
  for (let i = 0; i < dataLength; i++) {
    document
      .querySelector(`#dotMenuId${i}`)
      // eslint-disable-next-line no-loop-func
      .addEventListener('click', () => {
        // step1. model change - 更新chosenImageId
        chosenImageId = i;
        // step2. reset controller - 重設timer
        clearInterval(timer);
        slideFeatureHandler(dataLength);
        timerController(dataLength);
      });
  }
};

// set Function - add controller: 懸停/離開事件 1.清除timer 2.重設timer
const hoverImageController = (dataLength) => {
  // step1. 懸停事件 > 清除timer
  document
    .querySelector('.homepage-main-pic')
    .addEventListener('mouseover', () => {
      clearInterval(timer);
    });
  // step2. 離開事件 > 重設timer
  document
    .querySelector('.homepage-main-pic')
    .addEventListener('mouseout', () => {
      clearInterval(timer);
      timerController(dataLength);
    });
};

/* ================================================
  AJAX更新並印出Marketing資料，且執行所有eventListener
=================================================== */
// set Function - view update: 渲染marketing Info資料
const renderMarketingInfo = (data) => {
  const picChoose = document.createElement('ul');
  picChoose.className = 'homepage-main-pic-choose';

  for (let i = 0; i < data.length; i++) {
    const dotMenu = document.createElement('li');
    dotMenu.id = `dotMenuId${i}`;
    dotMenu.className = 'homepage-main-pic-choose-inactive';

    const slidesImages = document.createElement('a');
    slidesImages.id = `slideId${i}`;
    slidesImages.className = 'marketing-pic';
    slidesImages.href = `./product.html?id=${data[i].product_id}`;

    const homepageMainPicImg = document.createElement('img');
    homepageMainPicImg.className = 'homepage-main-pic-img';
    homepageMainPicImg.src = data[i].picture;
    homepageMainPicImg.alt = 'homepage-main-pic-img';

    const homepageMainPicText = document.createElement('div');
    homepageMainPicText.className = 'homepage-main-pic-text';
    homepageMainPicText.textContent = data[i].story;

    picChoose.appendChild(dotMenu);
    slidesImages.appendChild(homepageMainPicImg);
    slidesImages.appendChild(homepageMainPicText);
    document.querySelector('.homepage-main-pic').appendChild(slidesImages);
  }
  document.querySelector('.homepage-main-pic').appendChild(picChoose);

  document.querySelector('.homepage-main-pic-text').style.display = 'none';
  document.querySelector('#dotMenuId0').className = 'homepage-main-pic-choose-active';
  document.querySelector('#slideId0').className = 'marketing-pic-now';
};

// set Function - add controller: 監聽圖片讀取完成事件 > 顯示文字及選單
const imgLoadedController = () => {
  document.querySelector('#slideId0 img').addEventListener('load', () => {
    document.querySelector('.homepage-main-pic-text').style.display = 'flex';
    document.querySelector('.homepage-main-pic-choose').style.display = 'flex';
  });
};

// set Function - fetch: get marketing API 1.渲染頁面 2.新增timer 3.新增controller
const ajaxGetMarketingInfo = () => {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const marketingData = JSON.parse(xhr.responseText);
      const dataLength = marketingData.data.length;
      renderMarketingInfo(marketingData.data);
      imgLoadedController();
      timerController(dataLength);
      dotMenuController(dataLength);
      hoverImageController(dataLength);
    }
  };
  xhr.open('GET', 'https://api.appworks-school.tw/api/1.0/marketing/campaigns');
  xhr.send();
};

// run Function - fetch: get marketing API
ajaxGetMarketingInfo();
