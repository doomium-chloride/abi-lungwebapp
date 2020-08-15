
var showSliders = false;

let renderer;

let optionalSliders = [];

function setSliderValue(value, slider, span){
    span.innerText = round2(value) + "";
    slider.value = value;
}

function initScene(){


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

    optionalSliders = [];

    initScene();

    let sliders = document.getElementById('slider-section');

    //toggle button
    let toggleButton = document.getElementById('auto-fill-toggle');
    toggleButton.addEventListener('click', () => toggleAutoButton(toggleButton));
    toggleAutoButton(toggleButton, true);

    //age
    initSliderCombo('age');

    //height
    initSliderCombo('height');

    //bmi
    initSliderCombo('bmi');

    //sex gender
    initSliderCombo('gender');

    //fvc
    initSliderCombo('fvc', true);

    //rv/tlc
    initSliderCombo('rvtlc', true);

    //dlco
    initSliderCombo('dlco', true);

    updateLungModel(false)
}

function initSliderCombo(variable, optional = false){
    let sliderID = 'slider-' + variable;
    let spanID = 'show-' + variable;
    initSliderPart(sliderID, spanID, variable, optional);
}

function initSliderPart(sliderID, spanID, variable, optional = false){
    let slider = document.getElementById(sliderID);
    let span = document.getElementById(spanID);
    slider.addEventListener('input', (event) => sliderListener(event, variable));
    slider.addEventListener('input', (event) => showValue(event, span));
    sliderSetValue(sliderVariables[variable], variable, false)
    setSliderValue(sliderVariables[variable], slider, span);
    if(optional){
        optionalSliders.push({slider: slider, variable: variable, span: span});
    }
}

function showValue(event, span){
    let value = event.target.value;
    span.innerText = value + "";
}

function sliderListener(event, variable, keepViewPort = true){
    sliderSetValue(event.target.value, variable, keepViewPort);
}

function updateLungModel(keepViewPort = true){
    let vector3 = dummyFormula(sliderVariables.age, sliderVariables.bmi, sliderVariables.fvc);//temporary
    setLungScale(vector3);

    if(keepViewPort){
        reloadModels();
    } else{
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
        }, surfaceUniforms, Math.random());
    }
    
}

function sliderSetValue(value, variable, keepViewPort = true){
    sliderVariables[variable] = value;
    if(globalAutoFill){
        autoSetVariables();
    }
    //let vector3 = testFormulaEI(sliderVariables.age, sliderVariables.bmi, sliderVariables.fvc, sliderVariables.dlco, sliderVariables.rvtlc);
    updateLungModel(keepViewPort);

}

function autoSetVariables(){
    let len = optionalSliders.length;
    for(let i = 0; i < len; i++){
        let slider = optionalSliders[i].slider;
        let variable = optionalSliders[i].variable;
        let span = optionalSliders[i].span;
        autoFormula(variable);
        setSliderValue(sliderVariables[variable], slider, span);
    }
    updateLungModel();
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

function testFormulaEI(age, bmi, fvc, dlco, rvtlc){
    let m1 = 1.38 + (-0.04 * age) + (0.38 * fvc) + (-0.04 * dlco);
    let m2 = 3.49 + (-0.16 * bmi) + 0.02 * rvtlc;
    let m3 = 4.90 + (-0.02 * age) + (-0.45 * rvtlc);//this line is wrong!!!
    return [m1, m2, m3];
}

function testFormulaEE(){
    
}


function autoFormula(variable){
    switch(variable){
        case 'fvc':
            sliderVariables[variable] = formulaFvc(sliderVariables.age, sliderVariables.height, sliderVariables.gender);
            break;
        case 'rvtlc':
            sliderVariables[variable] = formulaRvtlc(sliderVariables.age, sliderVariables.gender);
            break;
        case 'dlco':
            sliderVariables[variable] = formulaDlco(sliderVariables.height, sliderVariables.age, sliderVariables.gender);
            break;
        default:
            console.log("Something wrong in autoFormula")
            //do nothing, send notice in console. This should not be reached.
    }
}

function formulaRvtlc(age, male){
    if(male){
        return (age * 0.29125) + 14.7;
    } else{
        return (age * 0.3424) + 16.4;
    }
}

//(height = cm, weight = kg)
function formulaDlco(height, age, male){
    if(male){
        return ((0.1217 * height) - (0.057 * age) - 8.05) * 2.986;
    } else{
        return ((0.0911 * height) - (0.043 * age) - 4.93) * 2.986;
    }
}

function formulaFvc(age, height, male){
    if(male){
        return - 4.38775 - 0.01184 * age + 0.05547 * height;
    } else{
        return - 3.09063 + 0.003904 * age + 0.038694 * height;
    }
}

function autoSet(value, slider){
    let event = new Event('input', {
        target: {value: value}
    });
    slider.value = value;
    slider.dispatchEvent(event);
}

function toggleSliders(disabled){
    let len = optionalSliders.length;
    for(let i = 0; i < len; i++){
        optionalSliders[i].slider.disabled = disabled;
    }
}

function toggleAutoButton(button, init = false){
    let toggled;//true = auto & disabled. false = manual & enabled
    if(init){
        toggled = globalAutoFill;
    } else{
        toggled = !globalAutoFill;//flip state
    }
    
    globalAutoFill = toggled;

    toggleSliders(toggled);

    if(toggled){
        button.innerText = "ON";
        autoSetVariables();
    } else{
        button.innerText = "OFF";
    }
}

function round2(number){
    return Math.round(number * 100) / 100
}