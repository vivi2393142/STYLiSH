// run Function - view change: 渲染訂單編號
const orderNumber = new URLSearchParams(window.location.search).get('number');
document.querySelector('.order-number').textContent = orderNumber;
