function loadQtdFile(qtdFile){
    let req = new XMLHttpRequest();
    req.open('GET', "graphdata/" + qtdFile, false);
    req.send(null);
    return JSON.parse(req.responseText);
}

function translateX(value, units = "px"){
    return "translateX(" + value + units + ")";
}

function adjustLine(value, offset, maxLen){
    return (value + offset) / (maxLen);
}

function graphHandler(value, span, slider, container, chart){
    span.innerText = value;

    slider.style.height = container.offsetHeight + "px";
    value = parseInt(value);

    let left = chart.chartArea.left;
    let right = chart.chartArea.right;
    let innerWidth = right - left;

    let percent = adjustLine(value, -20, 60);// 80 - 20 = 60
    
    slider.style.transform = translateX(percent * innerWidth + left, "px");
}

function getNearestIndex(array, value){
    let smallest = 0;
    for(let i = 0; i < array.length; i++){
        let test = Math.abs(value - array[i]);
        let current = Math.abs(value - array[smallest]);
        if (test < current){
            smallest = i;
        }
    }
    return smallest;
}


function initStack(){
    let graphSlider = document.getElementById('graph-slider');
    let verticalSlider = document.getElementById('vertical-slider');
    let verticalSpan = document.getElementById('vertical-value');
    let graphContainer = document.getElementById('graph');

    
    const qtdFilename = 'average_qtd.json';

    qtdObj = loadQtdFile(qtdFilename);

    let lowest = getNearestIndex(qtdObj.labels, 20);
    let highest = getNearestIndex(qtdObj.labels, 80) + 1;

    // label and qtd

    let ctx = document.getElementById('stack-chart').getContext('2d');


    let chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: qtdObj.labels.slice(lowest, highest),
            datasets: [{
                label: 'Population average',
                borderColor: 'rgb(255, 99, 132)',
                data: qtdObj.qtd.slice(lowest, highest)
            }]
        },
    
        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        mirror: false
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

    window.addEventListener('resize', () => gHandler(verticalSlider.value));

    gHandler(verticalSlider.value);

}