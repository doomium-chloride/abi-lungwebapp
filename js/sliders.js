var showSliders = false;

var rendererComponent;

function initSliders(){
    let sliderAge = document.getElementById('slider-age');
    sliderAge.addEventListener('input', (event) => sliderListener(event, dummyFormula, 0));
    let sliderFev1 = document.getElementById('slider-fev1');
    sliderFev1.addEventListener('input', (event) => sliderListener(event, dummyFormula, 1));
    let sliderTlc = document.getElementById('slider-tlc');
    sliderTlc.addEventListener('input', (event) => sliderListener(event, dummyFormula, 2));

    rendererComponent = document.getElementById('renderer');
}

function sliderListener(event, formula, opt){
    numbers[opt] = event.target.value;
    let vector3 = formula(numbers[0], numbers[1], numbers[2]);
    setLungScale(vector3);
    console.log(lungScale);

    let currentScene = zincRenderer.getCurrentScene();

    console.log(currentScene);


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