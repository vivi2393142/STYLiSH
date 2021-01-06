// Variables: FB access token
let token = '';

/* ====================================
  點選member button，跳轉或觸發login
======================================= */
// set Function - eventHandler set: 設置會員點擊事件callback 1.若以登入FB則跳轉 2.若無，則彈出登入視窗，後跳轉
const memberClickHandler = () => {
    FB.getLoginStatus((res) => {
        if (res.status === 'connected') {
            document.location.href = './profile.html';
        } else {
            FB.login(
                (response) => {
                    if (response.status === 'connected') {
                        document.location.href = './profile.html';
                    }
                },
                { scope: 'public_profile,email' }
            );
        }
    });
};

// run Function - add controller: 設置會員點擊事件
document.querySelector('.member-button').addEventListener('click', memberClickHandler);

/* =================================
  Facebook Login Function
==================================== */
// set Function - view update: 渲染profile page頁面
const renderMemberProfile = (data) => {
    if (document.querySelector('.user-profile')) {
        document.querySelector('.log-out-button').style.display = 'block';
        document.querySelector('.photo').src = data.picture.data.url;
        document.querySelector('.name').textContent = data.name;
        document.querySelector('.email').textContent = data.email;
        document.querySelector('.log-out-button').addEventListener('click', () => {
            FB.logout();
            document.location.href = './';
        });
        document.querySelector('.photo').addEventListener('load', () => {
            document.querySelector('.loader-cover').style.display = 'none';
            document.querySelector('.loader').style.display = 'none';
        });
    }
};

// set Function - model change: get user profile from FB
const getFbProfile = () => {
    FB.api('/me', 'GET', { fields: 'name, email, picture.width(720).height(720)' }, (user) =>
        renderMemberProfile(user)
    );
};

// set Function - fetch: post sign in API
const postSignInAPI = () => {
    const uri = 'https://api.appworks-school.tw/api/1.0/user/signin';
    fetch(uri, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            provider: 'facebook',
            access_token: token,
        }),
    });
};

// set Function - eventHandler set: 載入頁面時初始化fb登入狀態
const initFBLoginHandler = () => {
    // step1. 判斷是否登入fb
    FB.getLoginStatus((res) => {
        if (res.status === 'connected') {
            token = res.authResponse.accessToken;
            // step2-1. model change - post login API、get profile API
            // step2-2. view update - render profile page
            postSignInAPI();
            if (document.querySelector('.user-profile') || document.querySelector('.delivery-payment')) {
                getFbProfile();
            }
        } else if (document.querySelector('.user-profile')) {
            // step3-1. view update - 如果未登入，且通過URL直接到達profile page > 顯示重新登入按鈕
            document.querySelector('.re-sign-in').addEventListener('click', memberClickHandler);
            document.querySelector('.re-sign-in').style.display = 'block';
            document.querySelector('.loader-cover').style.display = 'none';
            document.querySelector('.loader').style.display = 'none';
        }
    });
};

/* ====================================
  執行每個頁面載入時，於背景確認FB登入狀態
======================================= */
// run Function - add controller: 載入各頁面事件 1.Facebook sdk setup 2.執行initFBLogin callback
window.fbAsyncInit = function () {
    FB.init({
        appId: '1696532820524465',
        cookie: true,
        xfbml: true,
        version: 'v8.0',
    });
    // setting完成後才執行，避免非同步而出錯
    if (typeof initFBLoginHandler === 'function') {
        initFBLoginHandler();
    }
    FB.AppEvents.logPageView();
};
(function (d, s, id) {
    let js;
    const fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    // eslint-disable-next-line prefer-const
    js = d.createElement(s);
    js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'facebook-jssdk');

/* ====================================
  渲染各頁面版本號
======================================= */
// run Function - view change: 渲染版本號
// document.querySelector('.version').textContent = 'v3.4.2';

export { token };
