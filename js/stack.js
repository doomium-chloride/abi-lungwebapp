
function translateX(value, units = "px"){
    return "translateX(" + value + units + ")";
}

function adjustLine(value, offset, maxLen){
    return (value + offset) / (maxLen);
}

function graphHandler(value, span, slider, container, chart){
    span.innerText = value;
    let width = container.offsetWidth;
    slider.style.height = container.offsetHeight + "px";
    value = parseInt(value);
    let percent = adjustLine(value, -100, 100);
    slider.style.transform = translateX(percent * width, "px");
    console.log(chart.options.scales.yAxes[0])
}


function initStack(){
    let graphSlider = document.getElementById('graph-slider');
    let verticalSlider = document.getElementById('vertical-slider');
    let verticalSpan = document.getElementById('vertical-value');
    let graphContainer = document.getElementById('graph');

    


    let ctx = document.getElementById('stack-chart').getContext('2d');
    console.log(ctx)

    let chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            datasets: [{
                label: 'Dummy dataset',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45, 30, 25, 8, 10, 40]
            }]
        },
    
        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        mirror: true
                    }
                }]
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });

    function gHandler(value){
        graphHandler(value, verticalSpan, graphSlider, graphContainer, chart)
    }

    verticalSlider.addEventListener('input', (e) => gHandler(e.target.value));

    window.addEventListener('resize', gHandler(verticalSlider.value));

    gHandler(verticalSlider.value);

}