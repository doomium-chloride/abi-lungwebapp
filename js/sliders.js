
var showSliders = false;

let renderer;

let optionalSliders = [];

let infoState = {
    pca: 1
}

let staticScale = {
    x: 1,
    y: 1,
    z: 1,
}

let dynamicScale = lungScale;

let saveData = {
    scale: [],
    materials: [],
    models: [],
    scene: null,
    weights: [],
    dynamic: 0
}

let infoArray = [];

let compareMode = true;

let sliderMenu = true;

function setSliderValue(value, slider, span, units = ""){
    span.innerText = round2(value)  + " " + units;
    slider.value = value;
}

function initScene(callBack = null){

    let models = [
        'models/cmgui_w0_1.json',

        'models/cmgui_w0_1.json',
    ]

    let uniforms = [
        
        dynamicUniforms,

        staticUniforms,

    ]

    saveData.weights = [

        lungWeights,

        staticWeights,

        
    ]

    saveData.dynamic = [

        true,

        false,
        
    ]

    loadMultiScene({
        vs: 'shaders/surface.vs',
        fs: 'shaders/surface.fs',
        view: 'models/lung_view.json',
        models: models,
    }, uniforms, saveData, callBack);
}

// function initScene(){
//     loadScene({
//         vs: 'shaders/surface.vs',
//         fs: 'shaders/surface.fs',
//         view: 'models/surface_view.json',
//         models: [
//             'models/surface_1.json',
//             'models/surface_2.json',
//             'models/surface_3.json',
//             'models/surface_4.json',
//             'models/surface_5.json',
//             'models/surface_6.json',
//         ]
//     }, surfaceUniforms)
// }

function initSliders(){

    optionalSliders = [];

    

    let sliders = document.getElementById('slider-section');

    //toggle lung menu
    let menuButton = document.getElementById('compare-menu-button');
    menuButton.addEventListener('click', () => toggleLungMenu(menuButton));

    //toggle lung
    let lungButton = document.getElementById('compare-mode-button');
    lungButton.addEventListener('click', () => toggleCompareMode(lungButton));

    initScene(() => {
        sliderSetValue(0, 'gender');// hot fix?
        document.getElementById('slider-gender').value = 0;
        toggleCompareMode(lungButton, false);
    });

    //opacity slicers

    initOpacitySliders();

    //colour input
    //initColourHandlers()

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

    //tlc
    initSliderCombo('tlc', "", true, true);

    updateLungModel(true);

}

function longInfoHanlder(baseStr, info, forward){
    let current = infoState[info];
    let newNum;
    
    if(forward){
        newNum = current + 1;
    } else{
        newNum = current - 1;
    }

    let beforeNum = newNum - 1;
    let afterNum = newNum + 1;

    let element = document.getElementById(baseStr + "-" + newNum);
    let beforeElement = document.getElementById(baseStr + "-" + beforeNum);
    let afterElement = document.getElementById(baseStr + "-" + afterNum)

    let pcaBack = document.getElementById('pca-back');
    let pcaForward = document.getElementById('pca-forward');

    if(element !== null){
        let oldE = document.getElementById(baseStr + "-" + current);

        const hidden = "hidden";
        const visible = "visible";

        oldE.classList.replace(visible, hidden);
        element.classList.replace(hidden, visible);

        infoState[info] = newNum;

        pcaBack.classList.replace('gray', 'clickable');
        pcaForward.classList.replace('gray', 'clickable');
    }
    if(beforeElement == null){
        pcaBack.classList.replace('clickable', 'gray');
    }
    if(afterElement == null){
        pcaForward.classList.replace('clickable', 'gray');
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

    infoArray.push(infoPCAtext)

}

function initGenderSlider(){//gender is an exception, and not optional
    const variable = "gender";

    const sliderID = 'slider-' + variable;
    const spanID = 'show-' + variable;

    const slider = document.getElementById(sliderID);
    const span = document.getElementById(spanID);

    function showGenderValue(value, span){
        const male = value;
        if(male == 1){
            span.innerText = "Male";
        } else {
            span.innerText = "Female";
        }
    }

    slider.addEventListener('click', (event) => {
        let newSex = sliderVariables.gender == 1 ? 0 : 1;
        slider.value = newSex;
        sliderSetValue(newSex, variable);
        showGenderValue(newSex, span);
    });
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

        infoArray.push(infoText);
    }
}

function showValue(event, span, units = ""){
    let value = event.target.value;
    span.innerText = value  + " " + units;
}

function sliderListener(event, variable, keepViewPort = true){
    sliderSetValue(event.target.value, variable, keepViewPort);
}

function updateArray(array, newData){
    const len = array.len;
    for(let i = 0; i < len; i++){
        array[i] = newData[i];
    }
}

function updateWeights(saveData, newData){
    const len = saveData.dynamic.length;
    for(let i = 0; i < len; i++){
        if(saveData.dynamic[i]){
            saveData.weights[i] = newData;
        }
    }
}

function updateLungModel(keepViewPort = true){
    //let vector3 = dummyFormula(sliderVariables.age, sliderVariables.bmi, sliderVariables.fvc);//temporary
    let vector3 = formulaObj(sliderVariables);

    //setLungScale(vector3);
    updateWeights(saveData, vector3);
    //dynamicUniforms['opacity']['value'] = sliderVariables.dlco/200

    if(keepViewPort){
        reloadMultiModels(saveData);
    } else {
        initScene();
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

function weights1(age, fvc, dlco){
    const b = [1.3773, -0.0364, 0.3754, -0.0409];
    return b[0] + (b[1] * age) + (b[2] * fvc) + (b[3] * dlco);
}

function weights2(bmi, rvtlc){
    const b = [3.4902, -0.1642, 0.0167];
    return b[0] + (b[1] * bmi) + (b[2] * rvtlc);
}

function weights3(age, tlc, dlco){
    const b = [4.8953, -0.018, -0.4557, -0.0506];
    return b[0] + (b[1] * age) + (b[2] * tlc) + (b[3] * dlco)
}

function formulaEI(age, bmi, fvc, dlco, rvtlc, tlc){
    let m1 = weights1(age, fvc, dlco);
    let m2 = weights2(bmi, rvtlc);
    let m3 = weights3(age, tlc, dlco);
    return [m1, m2, m3];
}

function formulaObj(obj){
    return formulaEI(obj.age, obj.bmi, obj.fvc, obj.dlco, obj.rvtlc, obj.tlc);
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
        case 'tlc':
            sliderVariables[variable] = formulaTlc(sliderVariables.height, sliderVariables.bmi);
        default:
            console.log("Something wrong in autoFormula")
            //do nothing, send notice in console. This should not be reached.
    }
}

function formulaRvtlc(age, male){
    if(male == 1){
        return (age * 0.29125) + 14.7;
    } else{
        return (age * 0.3424) + 16.4;
    }
}

//(height = cm, weight = kg)
function formulaDlco(height, age, male){
    if(male == 1){
        return ((0.1217 * height) - (0.057 * age) - 8.05) * 2.986;
    } else{
        return ((0.0911 * height) - (0.043 * age) - 4.93) * 2.986;
    }
}

function formulaFvc(age, height, male){
    if(male == 1){
        return - 4.38775 - 0.01184 * age + 0.05547 * height;
    } else{
        return - 3.09063 + 0.003904 * age + 0.038694 * height;
    }
}

function formulaTlc(height, bmi){
    const meters = height / 100;//convert to meters
    const mass = bmi * meters * meters;// bmi x height ^ 2
    return -0.0282 + (0.0162 * height) + (-0.0013 * mass);
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

function hideAll(array, except = null){
    const hidden = "hidden";
    const visible = "visible";

    const len = array.length;

    for(let i = 0; i < len; i++){
        let element = array[i];
        if(except != element){
            element.classList.replace(visible, hidden);
        }
    }
}

function toggleInfo(info){
    const hidden = "hidden";
    const visible = "visible";
    
    let classList = info.classList;

    hideAll(infoArray, info)

    if(classList.contains(hidden)){
        classList.replace(hidden, visible);
    } else if(classList.contains(visible)) {
        classList.replace(visible, hidden);
    } else{
        console.log("problem in toggleInfo function");
        //should not reach here.
    }
}

function toggleCompareMode(button, setTo = 'auto'){
    if(setTo = 'auto'){
        compareMode = !compareMode;
    } else {
        compareMode = setTo;
    }

    let materials = saveData.materials;
    let dynamic = saveData.dynamic;
    let len = materials.length;
    
    if(compareMode){
        for(let i = 0; i < len; i++){
            if(!dynamic[i])
                materials[i].visible = true;
        }
        button.innerText = "ON";

    } else {
        for(let i = 0; i < len; i++){
            if(!dynamic[i])
                materials[i].visible = false;
        }
        dynamicUniforms['opacity']['value'] = 1;
        button.innerText = "OFF";
    }
}

function toggleLungMenu(button){
    sliderMenu = !sliderMenu;

    const hidden = "hidden";
    const visible = "visible";

    const mode = ['Sliders', 'Compare'];

    let lungSection = document.getElementById('lung-section');
    let compareSection = document.getElementById('compare-section');

    if(sliderMenu){
        lungSection.classList.replace(hidden, visible);
        compareSection.classList.replace(visible, hidden);
        button.innerText = mode[0];
    } else{
        lungSection.classList.replace(visible, hidden);
        compareSection.classList.replace(hidden, visible);

        button.innerText = mode[1];
    }
}

function initOpacitySliders(){
    const mult = 1/100;
    initOpacitySlider('average', staticUniforms, mult, 50);
    initOpacitySlider('custom', dynamicUniforms, mult, 100);
}

function opacityHandler(uniforms, value){
    uniforms['opacity']['value'] = value;
}

function initOpacitySlider(name, uniforms, mult, init){
    let sliderID = "slider-" + name + "-opacity";
    let spanID = name + "-opacity";

    let slider = document.getElementById(sliderID);
    let span = document.getElementById(spanID);

    let handler1 = (value) => {
        opacityHandler(uniforms, value * mult);
        span.innerText = value;
    }

    let handler = (e) => {
        let value = e.target.value
        handler1(value);
    }
    slider.addEventListener('input', handler);
    handler1(init);
}

function colourHandler(uniforms ,value){
    uniforms['diffuse']['value'] = new THREE.Color( value );
}

function initColourHandler(uniforms, name){
    let selectorID = "selector-" + name + "-colour";
    let spanID = name + "-colour";

    let selector = document.getElementById(selectorID);
    let span = document.getElementById(spanID);

    let handler1 = (value) => {
        colourHandler(uniforms, value);
        span.innerText = value;
    }

    let handler = (e) => {
        let value = e.target.value
        handler1(value);
    }
    selector.addEventListener('input', handler);
}

function initColourHandlers(){
    initColourHandler(staticUniforms, 'average');
    initColourHandler(dynamicUniforms, 'custom');
}