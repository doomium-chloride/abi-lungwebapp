
function translateX(value, units = "px"){
    return "translateX(" + value + units + ")";
}

function graphHandler(value, span, slider){
    span.innerText = value;
    slider.style.transform = translateX(value * 300, "%");
}


function initStack(){
    let graphSlider = document.getElementById('graph-slider');
    let verticalSlider = document.getElementById('vertical-slider');
    let verticalSpan = document.getElementById('vertical-value');

    verticalSlider.addEventListener('input', (e) => graphHandler(e.target.value, verticalSpan, graphSlider));

    let ctx = document.getElementById('stack-chart').getContext('2d');
    console.log(ctx)

    let chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: [0, 1, 2, 3, 4, 5, 6],
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