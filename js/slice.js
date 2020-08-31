
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


function verticalHandler(key, map, lungMap, sliceMap, span){
    let lungPics = Object.values(lungMap);
    let slicePics = Object.values(sliceMap);

    let value = map[key];

    span.innerText = value;
    makeImageActive(lungMap[value], lungPics);
    makeImageActive(sliceMap[value], slicePics);
}


function initSlice(){

    let verticalSlider = document.getElementById('vertical-slider');
    let verticalValueSpan = document.getElementById('vertical-value');

    let map = {
        '0': 25,
        '1': 50,
        '2': 75
    }

    let lungPicTop = document.getElementById('lung-pic-top');
    let lungPicMid = document.getElementById('lung-pic-mid');
    let lungPicBot = document.getElementById('lung-pic-bot');

    let lungPics = [lungPicTop, lungPicMid, lungPicBot];
    let lungPicMap = {
        '75': lungPicTop,
        '50': lungPicMid,
        '25': lungPicBot
    }

    let slicePicTop = document.getElementById('lung-slice-top');
    let slicePicMid = document.getElementById('lung-slice-mid');
    let slicePicBot = document.getElementById('lung-slice-bot');

    let slicePics = [slicePicTop, slicePicMid, slicePicBot];
    let slicePicMap = {
        '75': slicePicTop,
        '50': slicePicMid,
        '25': slicePicBot
    }

    // buttonTop.addEventListener('click', () => makeImageActive(lungPicTop, lungPics));
    // buttonMid.addEventListener('click', () => makeImageActive(lungPicMid, lungPics));
    // buttonBot.addEventListener('click', () => makeImageActive(lungPicBot, lungPics));

    // buttonTop.addEventListener('click', () => makeImageActive(slicePicTop, slicePics));
    // buttonMid.addEventListener('click', () => makeImageActive(slicePicMid, slicePics));
    // buttonBot.addEventListener('click', () => makeImageActive(slicePicBot, slicePics));

    function vHandler(key){
        verticalHandler(key, map, lungPicMap, slicePicMap, verticalValueSpan);
    }

    verticalSlider.addEventListener('input', (event) => vHandler(event.target.value));

    //init slider
    vHandler(verticalSlider.value);

}