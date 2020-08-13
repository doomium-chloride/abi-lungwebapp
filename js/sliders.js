var showSliders = false;

let renderer;

function setSliderValue(value, slider, spanID){
    let span = document.getElementById(spanID);
    span.innerText = value + "";
    slider.value = value;
}

function saveViewPort(){
    currentViewPort = globalScene.getZincCameraControls().getCurrentViewport();
}

function initScene(){


    // if(!viewPortListenerAdded){
    //     document.addEventListener('mouseup', saveViewPort);
    //     viewPortListenerAdded = true;
    // }

    loadScene({
        vs: 'shaders/surface.vs',
        fs: 'shaders/surface.fs',
        view: 'models/surface_view.json',
        models: [
            'models/surface_1.json',
            'models/surface_2.json',
            'models/surface_3.json',
            'models/surface_4.json',
            'models/surface_5.json',
            'models/surface_6.json',
        ],
    }, surfaceUniforms);
}

function initSliders(){

    initScene();
    saveViewPort();

    let sliders = document.getElementById('slider-section');

    let sliderAge = document.getElementById('slider-age');
    sliderAge.addEventListener('input', (event) => sliderListener(event, dummyFormula, 0));
    sliderAge.addEventListener('input', (event) => showValue(event, 'show-age'));
    sliderSetValue(numbers[0], dummyFormula, 0, false)
    setSliderValue(numbers[0], sliderAge, 'show-age');

    let sliderGender = document.getElementById('slider-gender');
    sliderGender.addEventListener('input', (event) => showValue(event, 'show-gender'));
    setSliderValue(numbers[3], sliderGender, 'show-gender');

    let sliderFev1 = document.getElementById('slider-fev1');
    sliderFev1.addEventListener('input', (event) => sliderListener(event, dummyFormula, 1));
    sliderFev1.addEventListener('input', (event) => showValue(event, 'show-fev1'));
    sliderSetValue(numbers[1], dummyFormula, 1, false)
    setSliderValue(numbers[1], sliderFev1, 'show-fev1');

    let sliderTlc = document.getElementById('slider-tlc');
    sliderTlc.addEventListener('input', (event) => sliderListener(event, dummyFormula, 2));
    sliderTlc.addEventListener('input', (event) => showValue(event, 'show-tlc'));
    sliderSetValue(numbers[2], dummyFormula, 2, false)
    setSliderValue(numbers[2], sliderTlc, 'show-tlc');

    sliders.addEventListener('mousedown', saveViewPort);
}

function showValue(event, spanID){
    let value = event.target.value;
    let span = document.getElementById(spanID);
    span.innerText = value + "";
}

function sliderListener(event, formula, opt, keepViewPort = true){
    sliderSetValue(event.target.value, formula, opt, keepViewPort);
}

function sliderSetValue(value, formula, opt, keepViewPort = true){
    numbers[opt] = value;
    let vector3 = formula(numbers[0], numbers[1], numbers[2]);
    setLungScale(vector3);

    loadScene({
        vs: 'shaders/surface.vs',
        fs: 'shaders/surface.fs',
        view: 'models/surface_view.json',
        models: [
            'models/surface_1.json',
            'models/surface_2.json',
            'models/surface_3.json',
            'models/surface_4.json',
            'models/surface_5.json',
            'models/surface_6.json',
        ],
    }, surfaceUniforms, Math.random(), keepViewPort);

}

function setLungScale(vector3){
    lungScale.x = vector3[0];
    lungScale.y = vector3[1];
    lungScale.z = vector3[2];
}

function dumbScaling(vmin, vmax, value){
    //scales to a value 0 - 1
    let divisor = vmax - vmin;
    return value / divisor;
}

function dumbFormula(value){
    //temp formula
    //assume vmin=1, vmax=200
    return dumbScaling(1,200,value);
}

function dummyFormula(age, fev1, tlc){
    return [1 + dumbFormula(age), 1 + dumbFormula(fev1), 1 + dumbFormula(tlc)];
}