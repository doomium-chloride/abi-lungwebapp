
function hideAllImages(images){
    let len = images.length;
    for(let i = 0; i < len; i++){
        let image = images[i];
        image.classList.remove('active');
        image.classList.add('hidden');
    }
}

function makeImageActive(image, images){
    hideAllImages(images);
    image.classList.add('active');
}


function initSlice(){
    let buttonTop = document.getElementById('button-top');
    let buttonMid = document.getElementById('button-mid');
    let buttonBot = document.getElementById('button-bot');

    let lungPicTop = document.getElementById('lung-pic-top');
    let lungPicMid = document.getElementById('lung-pic-mid');
    let lungPicBot = document.getElementById('lung-pic-bot');

    let lungPics = [lungPicTop, lungPicMid, lungPicBot];

    let slicePicTop = document.getElementById('lung-slice-top');
    let slicePicMid = document.getElementById('lung-slice-mid');
    let slicePicBot = document.getElementById('lung-slice-bot');

    let slicePics = [slicePicTop, slicePicMid, slicePicBot];

    buttonTop.addEventListener('click', () => makeImageActive(lungPicTop, lungPics));
    buttonMid.addEventListener('click', () => makeImageActive(lungPicMid, lungPics));
    buttonBot.addEventListener('click', () => makeImageActive(lungPicBot, lungPics));

    buttonTop.addEventListener('click', () => makeImageActive(slicePicTop, slicePics));
    buttonMid.addEventListener('click', () => makeImageActive(slicePicMid, slicePics));
    buttonBot.addEventListener('click', () => makeImageActive(slicePicBot, slicePics));

}