
var showSliders = false;

let renderer;

let optionalSliders = [];

let infoState = {
    pca: 1
}

function setSliderValue(value, slider, span, units = ""){
    span.innerText = round2(value)  + " " + units;
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

    //info button
    initPCAinfo();

    //toggle button
    let toggleButton = document.getElementById('auto-fill-toggle');
    toggleButton.addEventListener('click', () => toggleAutoButton(toggleButton));
    toggleAutoButton(toggleButton, true);

    //age
    initSliderCombo('age', " years");

    //height
    initSliderCombo('height', "cm");

    //bmi
    initSliderCombo('bmi', "kg/m2");

    //sex gender
    initGenderSlider();

    //fvc
    initSliderCombo('fvc', "", true, true);

    //rv/tlc
    initSliderCombo('rvtlc', "", true, true);

    //dlco
    initSliderCombo('dlco', "", true, true);

    updateLungModel(false)
}

function longInfoHanlder(baseStr, info, forward){
    let current = infoState[info];
    let newNum;
    if(forward){
        newNum = current + 1;
    } else{
        newNum = current - 1;
    }
    let element = document.getElementById(baseStr + "-" + newNum);
    if(element !== null){
        let oldE = document.getElementById(baseStr + "-" + current);

        const hidden = "hidden";
        const visible = "visible";

        oldE.classList.replace(visible, hidden);
        element.classList.replace(hidden, visible);

        infoState[info] = newNum;
    }
}

function initPCAinfo(){
    let infoPCAtext = document.getElementById('info-text-pca');
    let infoButton = document.getElementById('info-pca');
    infoButton.addEventListener('click', () => toggleInfo(infoPCAtext));

    let baseStr = "info-text-pca";
    let info = 'pca';

    let pcaBack = document.getElementById('pca-back');
    pcaBack.addEventListener('click', () => longInfoHanlder(baseStr, info, false));

    let pcaForward = document.getElementById('pca-forward');
    pcaForward.addEventListener('click', () => longInfoHanlder(baseStr, info, true));
    
}

function initGenderSlider(){//gender is an exception, and not optional
    const variable = "gender";

    const sliderID = 'slider-' + variable;
    const spanID = 'show-' + variable;

    const slider = document.getElementById(sliderID);
    const span = document.getElementById(spanID);

    function showGenderValue(value, span){
        const male = value;
        if(male){
            span.innerText = "Male";
        } else {
            span.innerText = "Female";
        }
    }

    slider.addEventListener('input', (event) => sliderListener(event, variable));
    slider.addEventListener('input', (event) => showGenderValue(event.target.value, span));
    sliderSetValue(sliderVariables[variable], variable, false)
    showGenderValue(sliderVariables[variable], span);
}

function initSliderCombo(variable, units = "", optional = false, info = false){
    let sliderID = 'slider-' + variable;
    let spanID = 'show-' + variable;
    initSliderPart(sliderID, spanID, variable, units, optional, info);
}

function initSliderPart(sliderID, spanID, variable, units, optional = false, info = false){
    let slider = document.getElementById(sliderID);
    let span = document.getElementById(spanID);
    slider.addEventListener('input', (event) => sliderListener(event, variable));
    slider.addEventListener('input', (event) => showValue(event, span, units));
    sliderSetValue(sliderVariables[variable], variable, false)
    setSliderValue(sliderVariables[variable], slider, span, units);
    if(optional){
        optionalSliders.push({slider: slider, variable: variable, span: span});
    }
    if(info){
        let infoButton = document.getElementById('info-' + variable);
        let infoText = document.getElementById('info-text-' + variable);

        infoButton.addEventListener('click', () => toggleInfo(infoText));
    }
}

function showValue(event, span, units = ""){
    let value = event.target.value;
    span.innerText = value  + " " + units;
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
    sliderVariables[variable] = parseFloat(value);
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
    const locked = "locked";
    let len = optionalSliders.length;
    for(let i = 0; i < len; i++){
        optionalSliders[i].slider.disabled = disabled;
        if(disabled){
            optionalSliders[i].slider.classList.add(locked);
        } else{
            optionalSliders[i].slider.classList.remove(locked);
        }
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


function toggleInfo(info){
    const hidden = "hidden";
    const visible = "visible";
    let classList = info.classList;

    if(classList.contains(hidden)){
        classList.replace(hidden, visible);
    } else if(classList.contains(visible)) {
        classList.replace(visible, hidden);
    } else{
        console.log("problem in toggleInfo function");
        //should not reach here.
    }
}