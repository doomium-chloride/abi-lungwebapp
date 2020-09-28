let saveNifti = {
    main: null,
    mask: null
}
let userData = {
    raw: [],
    rawLabel: [],
    labels: [],
    qtd: []
}

//let nifti = require("nifti-js");
function readNIFTI(name, data, mask = false) {
    var canvas = document.getElementById('myCanvas');
    //var slider = document.getElementById('myRange');
    var niftiHeader, niftiImage;

    // parse nifti
    if (nifti.isCompressed(data)) {
        data = nifti.decompress(data);
    }

    if (nifti.isNIFTI(data)) {
        niftiHeader = nifti.readHeader(data);
        niftiImage = nifti.readImage(niftiHeader, data);
    } else{
        console.log("not nifti")
        return;
    }

    // set up slider
    var slices = niftiHeader.dims[3];
    //slider.max = slices - 1;
    //slider.value = Math.round(slices / 2);
    //slider.oninput = function() {
        //drawCanvas(canvas, slider.value, niftiHeader, niftiImage);
    //};
    let qtdObj = {qtd: new Array(slices), qtdValue: new Array(slices)};
    for(let i = 0; i < slices; i++){
        let slice = drawSlice(i, niftiHeader, niftiImage, mask);
        qtdObj.qtd[i] = slice;
    }
    console.log(qtdObj);
    return qtdObj;
    // draw slice
    //drawCanvas(canvas, slider.value, niftiHeader, niftiImage);
}
//value = to255(value, -32768, 32767)
function to255(num, lower, upper){
    let ratio = (num - lower) / (upper - lower);
    return ratio * 255;
}

function mask3d(array, mask){
    let len1 = array.length;
    let len2 = array[0].length;
    let len3 = array[0][0].length;
    console.log(`${len1}-${len2}-${len3}`);
    let output = new Array(len1);
    for(let i = 0; i < len1; i++){
        let rows = new Array(len2);
        for(let j = 0; j < len2; j++){
            let cols = new Array(len3);
            for(let k = 0; k < len3; k++){
                if(mask[i][j][k] > 0){
                    cols[k] = array[i][j][k];
                } else {
                    cols[k] = 0;
                }
            }
            rows[j] = cols;
        }
        output[i] = rows;
    }
    return output;
}

function compare(num1, num2, greater = true){
    if(num1 == null){
        return num2;
    }
    if(num2 == null){
        return num1;
    }
    if(greater){
        return num1 > num2;
    }
    return num1 < num2;
}

function arrMax(array, nonZero = false){
    let len = array.length;
    if(len <= 0){
        return;
    }
    let biggest = array[0];
    for(let i = 0; i < len; i++){
        let num = array[i];
        if(nonZero){
            if(num == 0){
                continue;
            }
        }
        if(num > biggest){
            biggest = num;
        }
    }
    return biggest
}

function arrMin(array, nonZero = false){
    let len = array.length;
    if(len <= 0){
        return;
    }
    let smallest = array[0];
    for(let i = 0; i < len; i++){
        let num = array[i];
        if(nonZero){
            if(num == 0){
                continue;
            }
        }
        if(num < smallest){
            smallest = num;
        }
    }
    return smallest
}

function getMinMax2d(array, max, nonZero){
    let theNumber;
    if(max){
        theNumber = Number.NEGATIVE_INFINITY;
    } else{
        theNumber = Number.POSITIVE_INFINITY;
    }
    let len1 = array.length;
    let len2 = array[0].length;

    let most = []
    for(let i = 0; i < len1; i++){
        if(max){
            let temp = arrMax(array[i], nonZero);
            most.push(temp);
        } else{
            let temp = arrMin(array[i], nonZero);
            most.push(temp);
        }
    }
    if(max){
        return arrMax(most, nonZero);
    } else {
        return arrMin(most, nonZero);
    }
}

function qtCond(region){
    let size = region.length; //rows
    let minimum = getMinMax2d(region, false, true);
    let maximum = getMinMax2d(region, true, true);
    if(size < 6 && maximum > 1000){
        return false;
    }
    if(maximum - minimum  > 100){
        return true;
    }
    return false;
}

function extendArray(arr1, arr2){
    let len = arr2.length;
    for(let i = 0; i < len; i++){
        arr1.push(arr2[i]);
    }
}

function countNonZero2d(img){
    let count = 0;
    let len1 = img.length;
    let len2 = img[0].length;
    for(let i = 0; i < len1; i++){
        for(let j = 0; j < len2; j++){
            if(img[i][j] != 0){
                count++;
            }
        }
    }
    return count;
}

function quadTree(img, f, x=0, y=0){
    let size = img.length;//rows
    try {
        if(size == 1 || !f(img)){
            return [{size: size, x: x, y: y}];
        }
    } catch (error) {
        return [{size: size, x: x, y: y}];
    }

    let mid = Math.floor(size/2);
    let ret = [];
    extendArray(ret, quadTree(img.slice(0,mid).slice(0,mid), f, x, y));
    extendArray(ret, quadTree(img.slice(mid).slice(0,mid), f, x + mid, y));
    extendArray(ret, quadTree(img.slice(0,mid).slice(mid), f, x, y + mid));
    extendArray(ret, quadTree(img.slice(mid).slice(mid), f, x + mid, y + mid));
    return ret;
}

function drawSlice(slice, niftiHeader, niftiImage, mask = false) {
    // get nifti dimensions
    var cols = niftiHeader.dims[1];
    var rows = niftiHeader.dims[2];


    // convert raw data to typed array based on nifti datatype
    var typedData;

    if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
        typedData = new Uint8Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
        typedData = new Int16Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
        typedData = new Int32Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
        typedData = new Float32Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
        typedData = new Float64Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
        typedData = new Int8Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
        typedData = new Uint16Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
        typedData = new Uint32Array(niftiImage);
    } else {
        return;
    }

    // offset to specified slice
    var sliceSize = cols * rows;
    var sliceOffset = sliceSize * slice;

    let dataSlice = typedData.slice(sliceOffset, sliceOffset + rows*cols);

    if(mask && false){
        let morph = new Morph(rows, cols, dataSlice);
        let erosion = new StructuringElement(5);
        //morph.erodeWithElement(erosion);
        morph.erodeWithElement();
        console.log(morph);
        dataSlice = morph.data;
    }
    
    let output = new Array(rows);
    // draw pixels
    let count = 0
    for (var row = 0; row < rows; row++) {
        var rowOffset = row * cols;
        let colArray = new Array(cols);
        for (var col = 0; col < cols; col++) {
            //var offset = sliceOffset + rowOffset + col;
            let offset = rowOffset + col;
            var value = dataSlice[offset];
            count++;
            /* 
                Assumes data is 8-bit, otherwise you would need to first convert 
                to 0-255 range based on datatype range, data range (iterate through
                data to find), or display range (cal_min/max).
                
                Other things to take into consideration:
                    - data scale: scl_slope and scl_inter, apply to raw value before 
                    applying display range
                    - orientation: displays in raw orientation, see nifti orientation 
                    info for how to orient data
                    - assumes voxel shape (pixDims) is isometric, if not, you'll need 
                    to apply transform to the canvas
                    - byte order: see littleEndian flag
            */
            colArray[col] = value;
            value = to255(value, -32768, 32767)

        }
        output[row] = colArray;
    }
    return output;
}

function calcQtD(slice){
    let qtd = quadTree(slice, qtCond);
    console.log(qtd.length);
    let n = countNonZero2d(slice);
    console.log(qtd[0])
    if(n == 0){
        return 0;
    }
    return qtd.length/n;
}

function computeQtD(array3d){
    let len = array3d.length;
    let qtd = new Array(len);
    for(let i = 0; i < len; i++){
        qtd[i] = calcQtD(array3d[i]);
    }
    return qtd;
}

function drawCanvas(canvas, slice, niftiHeader, niftiImage) {
    // get nifti dimensions
    var cols = niftiHeader.dims[1];
    var rows = niftiHeader.dims[2];

    // set canvas dimensions to nifti slice dimensions
    canvas.width = cols;
    canvas.height = rows;

    // make canvas image data
    var ctx = canvas.getContext("2d");
    var canvasImageData = ctx.createImageData(canvas.width, canvas.height);

    // convert raw data to typed array based on nifti datatype
    var typedData;

    if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT8) {
        typedData = new Uint8Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT16) {
        typedData = new Int16Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT32) {
        typedData = new Int32Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT32) {
        typedData = new Float32Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_FLOAT64) {
        typedData = new Float64Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_INT8) {
        typedData = new Int8Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT16) {
        typedData = new Uint16Array(niftiImage);
    } else if (niftiHeader.datatypeCode === nifti.NIFTI1.TYPE_UINT32) {
        typedData = new Uint32Array(niftiImage);
    } else {
        return;
    }

    // offset to specified slice
    var sliceSize = cols * rows;
    var sliceOffset = sliceSize * slice;
    let display = [];

    
    let output = new Array(rows);
    // draw pixels
    for (var row = 0; row < rows; row++) {
        var rowOffset = row * cols;
        let colArray = new Array(cols);
        for (var col = 0; col < cols; col++) {
            var offset = sliceOffset + rowOffset + col;
            var value = typedData[offset];

            /* 
                Assumes data is 8-bit, otherwise you would need to first convert 
                to 0-255 range based on datatype range, data range (iterate through
                data to find), or display range (cal_min/max).
                
                Other things to take into consideration:
                    - data scale: scl_slope and scl_inter, apply to raw value before 
                    applying display range
                    - orientation: displays in raw orientation, see nifti orientation 
                    info for how to orient data
                    - assumes voxel shape (pixDims) is isometric, if not, you'll need 
                    to apply transform to the canvas
                    - byte order: see littleEndian flag
            */
            colArray[col] = value;
            value = to255(value, -32768, 32767)
            display.push(value & 0xFF)
            
            canvasImageData.data[(rowOffset + col) * 4] = value & 0xFF;
            canvasImageData.data[(rowOffset + col) * 4 + 1] = value & 0xFF;
            canvasImageData.data[(rowOffset + col) * 4 + 2] = value & 0xFF;
            canvasImageData.data[(rowOffset + col) * 4 + 3] = 0xFF;
        }
        output[row] = colArray;
    }
    console.log(display)
    console.log(output);
    ctx.putImageData(canvasImageData, 0, 0);
}

function makeSlice(file, start, length) {
    var fileType = (typeof File);

    if (fileType === 'undefined') {
        return function () {};
    }

    if (File.prototype.slice) {
        return file.slice(start, start + length);
    }

    if (File.prototype.mozSlice) {
        return file.mozSlice(start, length);
    }

    if (File.prototype.webkitSlice) {
        return file.webkitSlice(start, length);
    }

    return null;
}

function readFile(file, target) {
    var blob = makeSlice(file, 0, file.size);

    var reader = new FileReader();

    reader.onloadend = function (evt) {
        if (evt.target.readyState === FileReader.DONE) {
            let data = readNIFTI(file.name, evt.target.result, target == 'mask');
            if(target){
                saveNifti[target] = data;
            }
        }
    };

    reader.readAsArrayBuffer(blob);
}

function handleFileSelect(evt, target = null) {
    var files = evt.target.files;
    readFile(files[0], target);
}

function getWithinC(num){
    if(num <= 0){
        return 0;
    }
    if(num >= 100){
        return 100;
    }
    return Math.round(num);
}

function makeQtdBins(qtd){
    let data = {}
    let size = qtd.length;
    for(let i = 0; i < size; i++){
        let num = getWithinC(i * 100 / (size+1));
        let key = num + "";
        if(!(key in data)){
            data[key] = [];
        }
        data[key].push(qtd[i]);
    }
    return data;
}

const median = arr => {
    const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

function processQtdBins(bins){
    let data = {};
    for(const bin in bins){
        let array = bins[bin];
        let qtd = median(array);
        data[bin] = qtd;
    }
    return data;
}

function processNifti(qtd){
    let bins = makeQtdBins(qtd);
    let data = processQtdBins(bins);
    return data;
}