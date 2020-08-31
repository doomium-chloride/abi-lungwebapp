
function translateX(value, units = "px"){
    return "translateX(" + value + units + ")";
}

function verticalHandler(value, span, slider){
    span.innerText = value;
    slider.style.transform = translateX(value * 300, "%");
}


function initStack(){
    let graphSlider = document.getElementById('graph-slider');
    let verticalSlider = document.getElementById('vertical-slider');
    let verticalSpan = document.getElementById('vertical-value');

    verticalSlider.addEventListener('input', (e) => verticalHandler(e.target.value, verticalSpan, graphSlider));

    let ctx = document.getElementById('stack-chart').getContext('2d');
    console.log(ctx)

    let chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45]
            }]
        },
    
        // Configuration options go here
        options: {}
    });

    

}