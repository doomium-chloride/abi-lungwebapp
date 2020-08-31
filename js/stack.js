
function translateX(value, units = "px"){
    return "translateX(" + value + units + ")";
}

function verticalHandler(value, span, slider){
    span.innerText = value;
    slider.style.transform = translateX(value);
}


function initStack(){
    let graphSlider = document.getElementById('graph-slider');
    let verticalSlider = document.getElementById('vertical-slider');
    let verticalSpan = document.getElementById('vertical-value');

    verticalSlider.addEventListener('input', (e) => verticalHandler(e.target.value, verticalSpan, graphSlider));

}