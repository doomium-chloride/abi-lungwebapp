
let images = [];

function hideAllImages(){
    let len = images.length;
    for(let i = 0; i < len; i++){
        let image = images[i];
        image.classList.remove('active');
        image.classList.add('hidden');
    }
}

function makeImageActive(image){
    hideAllImages();
    image.classList.add('active');
}


function initSlice(){
    let buttonTop = document.getElementById('button-top');
    let buttonMid = document.getElementById('button-mid');
    let buttonBot = document.getElementById('button-bot');

    let lungPicTop = document.getElementById('lung-pic-top');
    let lungPicMid = document.getElementById('lung-pic-mid');
    let lungPicBot = document.getElementById('lung-pic-bot');

    images = [lungPicTop, lungPicMid, lungPicBot];

    buttonTop.addEventListener('click', () => makeImageActive(lungPicTop));
    buttonMid.addEventListener('click', () => makeImageActive(lungPicMid));
    buttonBot.addEventListener('click', () => makeImageActive(lungPicBot));

}