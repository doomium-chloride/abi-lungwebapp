const imageStackPath = "images/stack/";
const imgStackFormat = ".jpg";


function loadQtdFile(qtdFile){
    let req = new XMLHttpRequest();
    req.open('GET', "graphdata/" + qtdFile, false);
    req.send(null);
    return JSON.parse(req.responseText);
}

function translateX(value, units = "px"){
    return "translateX(" + value + units + ")";
}

function translateY(value, units = "px"){
    return "translateY(" + value + units + ")";
}

function scaleY(value){
    return "scaleY(" + value + ")";
}

function scaleX(value){
    return "scaleX(" + value + ")";
}


function adjustLine(value, offset, maxLen){
    return (value + offset) / (maxLen);
}

function updateSpan(span, text){
    span.innerText = text;
}

function rounds(value, dp = 0){
    const mult = Math.pow(10, dp);
    let numStr = Math.round(value * mult) / mult + "";
    if(dp <= 0){
        return numStr;
    }
    let afterDot = numStr.substr(numStr.indexOf('.'));
    if(afterDot.length <= dp){
        let zeros = dp - afterDot.length + 1
        numStr += "0".repeat(zeros);
    }
    return numStr;
}

function getAverage(data, start = null, end = null){

    if(start === null && end === null){
        let total = 0;
        let len = data.length;
        for(let i = 0; i < len; i++){
            total += data[i];
        }
        return total/len;
    }

    end = Math.min(end+1, data.length);//include end
    
    let dataSlice = data.slice(start, end);

    return getAverage(dataSlice);
}

function getAverageBetween(labels, data, lower, upper){
    let start = getNearestIndex(labels, lower);
    let end = getNearestIndex(labels, upper);

    if(start === end){
        return data[end];
    } else{
        return getAverage(data, start, end);
    }
}

function add(num1, num2){
    return parseFloat(num1) + parseFloat(num2);
}

function graphHandler(value, span, slider, container, chart, qtdSpan, lungPic, hLine, hLineScale, callBack){
    const maxValue = 80;
    const hRange = 60;//80 - 20

    const labels = chart.data.labels;
    const data = chart.data.datasets[0].data;

    let value2 = Math.min(add(value,hLineScale), maxValue);

    let qtdScore = getAverageBetween(labels, data, value, value2);

    if(value == value2){
        span.innerText = value;
    } else {
        span.innerText = value + "-" + value2;
    }
    // set slider span
    slider.style.height = container.offsetHeight + "px";
    value = parseInt(value);

    let left = chart.chartArea.left;
    let right = chart.chartArea.right;
    let innerWidth = right - left;

    let percent = adjustLine(value, -20, 60);// 80 - 20 = 60
    let xTransform = percent * innerWidth + left;

    let wScale = hLineScale/hRange * innerWidth
    wScale = Math.min(wScale, right - xTransform);
    wScale = Math.max(wScale, 0);

    // move graph line
    slider.style.transform = translateX(xTransform, "px");
    slider.style.width = wScale + "px";

    
    // display QtD score

    let qtdValue = rounds(qtdScore, 4);
    qtdSpan.innerText = qtdValue;

    // horizontal line
    let height = lungPic.offsetHeight;

    let hLineTranslation = (value)/100 * -height;

    let hScale = Math.min(hLineScale/100 * height, (maxValue - value)/100 * height);


    hScale = Math.max(hScale, 1);

    
    hLine.style.transform = translateY(hLineTranslation, "px");
    hLine.style.height = hScale + "px";

    // callBack
    callBack(value);
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

let stackChart = null;

function initStack(){
    let graphSlider = document.getElementById('graph-slider');
    let verticalSlider = document.getElementById('vertical-slider');
    let verticalSpan = document.getElementById('vertical-value');
    let graphContainer = document.getElementById('graph');

    
    const qtdFilename = 'COPD_qtd.json';

    qtdObj = loadQtdFile(qtdFilename);

    agingQtd = loadQtdFile('aging_qtd.json');

    ipfQtd = loadQtdFile('ipf_qtd.json');

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
                label: 'Sample',
                borderColor: 'blue',
                data: qtdObj.average.slice(lowest, highest)
            },{
                label: 'Healthy controls',
                borderColor: 'green',
                data: agingQtd.min.slice(lowest, highest),
                fill: '+1',
                backgroundColor: 'rgba(0,200,0,0.2)'
            }, {
                label: 'Normal upperbound',
                borderColor: 'green',
                data: agingQtd.max.slice(lowest, highest)
            }, {
                label: 'IPF cohort',
                borderColor: 'red',
                data: ipfQtd.min.slice(lowest, highest),
                fill: '+1',
                backgroundColor: 'rgba(200,0,0,0.2)'
            }, {
                label: 'IPF upperbound',
                borderColor: 'red',
                data: ipfQtd.max.slice(lowest, highest)
            }]
        },
    
        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        mirror: false,
                        fontColor: "white"
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "white"
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
            },
            legend: {
                labels: {
                    fontColor: "white",
                    filter: function(item, chart) {
                        // Logic to remove a particular legend item goes here
                        return !item.text.includes('upperbound');
                    }
                }
            }
        }
    });

    stackChart = chart;

    let qtdSpan = document.getElementById('qtd-value');

    let hLine = document.getElementById('h-line');
    let lungPic = document.getElementById('lung-pic');

    let rangeSlider = document.getElementById('range-slider');
    rangeSlider.value = 0;

    let stackImage = document.getElementById('stack-image');
    let stackBlock = document.getElementById('stack-block');

    function setSliceImages(value){
        let number = qtdObj.image[value];
        let stackImagePath = imageStackPath + "image" + number + imgStackFormat;
        let stackBlockPath = imageStackPath + "block" + number + imgStackFormat;

        stackImage.src = stackImagePath;
        stackBlock.src = stackBlockPath;
    }

    function preloadImages(){
        for(let num = 20; num <= 80; num++){
            setSliceImages(num);
        }
    }

    function gHandler(value){
        graphHandler(value, verticalSpan, graphSlider, graphContainer, chart, qtdSpan, lungPic, hLine, rangeSlider.value, setSliceImages);
    }

    function sHandler(value){
        graphHandler(verticalSlider.value, verticalSpan, graphSlider, graphContainer, chart, qtdSpan, lungPic, hLine, value, setSliceImages);
    }

    verticalSlider.addEventListener('input', (e) => gHandler(e.target.value));

    window.addEventListener('resize', () => gHandler(verticalSlider.value));

    rangeSlider.addEventListener('input', (e) => sHandler(e.target.value));

    preloadImages();

    gHandler(verticalSlider.value);

}