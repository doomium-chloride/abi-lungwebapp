let playing = false;
let sceneStartDate = new Date().getTime();
let scenePauseDate = new Date().getTime();
document.getElementById('play').addEventListener('click', function(e) {
	if (this.classList.contains('playing')) {
		scenePauseDate = new Date().getTime();
		playing = false;
	} else {
		let offset = new Date().getTime() - scenePauseDate;
		sceneStartDate += offset;
		playing = true;
	}
	this.classList.toggle('playing');
});

let currentUniforms = undefined;
function updateFrame(zincRenderer) {
	return function () {
		if (!currentUniforms) {
			return;
		}

        let light = zincRenderer.getCurrentScene().directionalLight;
        if(Array.isArray(currentUniforms)){
            let uniLen = currentUniforms.length;
            for(let i = 0; i < uniLen; i++){
                currentUniforms[i]['directionalLightDirection'].value.set(light.position.x, light.position.y, light.position.z);
            }
        } else {
            currentUniforms['directionalLightDirection'].value.set(light.position.x, light.position.y, light.position.z);
        }

		let sceneTime = 0.0;
		if (playing) {
			sceneTime = (new Date().getTime() - sceneStartDate) / 1000.0;
		} else {
			sceneTime = (scenePauseDate - sceneStartDate) / 1000.0;
		}
		sceneTime *= PLAY_SPEED;

		updateMarkers((sceneTime % 10.0) / 10.0);

		let t = (sceneTime % 5.0) / 2.5;
		if (t <= 1.0) {
			t = Math.sin(t*Math.PI/2.0)
		} else {
			t = 1.0-Math.sin((t-1.0)*Math.PI/2.0)
        }
        if(Array.isArray(currentUniforms)){
            let uniLen = currentUniforms.length;
            for(let i = 0; i < uniLen; i++){
                currentUniforms[i]['t'].value = t;
            }
        } else {
            currentUniforms['t'].value = t;
        }
		
	};
}

String.prototype.hashCode = function() {
	var hash = 0, i, chr;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

const loader = document.getElementById('loader');
const loaderMessage = loader.getElementsByTagName('p')[0];
const startLoading = function() {
	loader.classList.add('loading');
};
const stopLoading = function() {
	loader.classList.remove('loading');
};
const setLoadingText = function(text) {
	loaderMessage.innerHTML = text;
};

let zincRenderer = undefined;
if (!WEBGL.isWebGLAvailable()) {
	console.error(WEBGL.getWebGLErrorMessage());
	showError('WebGL is required to display the interactive 3D models.');
} else {
	zincRenderer = new Zinc.Renderer(document.getElementById('renderer'), window);
	zincRenderer.initialiseVisualisation({antialias: false});
	zincRenderer.getThreeJSRenderer().setClearColor(0x000000, 1);
  //if (window.innerWidth > 2000 || window.innerHeight > 2000) {
  //  zincRenderer.getThreeJSRenderer().setPixelRatio(0.5);
  //} else {
	  zincRenderer.getThreeJSRenderer().setPixelRatio(1.0);
  //}
	zincRenderer.addPreRenderCallbackFunction(updateFrame(zincRenderer));
	zincRenderer.animate();
}

const scenes = {};
const materials = {};
const setScene = function (name, scene, material) {
    zincRenderer.setCurrentScene(scene);
    if(Array.isArray(material)){
        currentUniforms = [];
        let matLen = material.length;
        for(let i = 0; i< matLen; i++){
            currentUniforms.push(material[i].uniforms);
        }
    } else {
        currentUniforms = material.uniforms;
    }
	
};

// data = {vs: 'shaders/surface.vs',
	// fs: 'shaders/surface.fs',
	// view: 'models/surface_view.json',
	// models: [
	// 	'models/surface_1.json',
	// 	'models/surface_2.json',
	// 	'models/surface_3.json',
	// 	'models/surface_4.json',
	// 	'models/surface_5.json',
	// 	'models/surface_6.json',
	// ]}

// vs and fs are shader files

const loadMultiScene = function(data, uniforms, saveData) {
	if (!zincRenderer) {
		console.error('zinc not loaded');
		return;
	}

    let name = (JSON.stringify(data) + JSON.stringify(saveData)).hashCode();

	if (name in scenes) {
		setScene(name, scenes[name], materials[name]);
		return;
    }
    
    function makeMaterials(shaderText, uniforms, len){

        let materials = [];

        for(let i = 0; i < len; i++){
            let material = new THREE.ShaderMaterial({
                vertexShader: shaderText[0],
                fragmentShader: shaderText[1],
                uniforms: uniforms[i],
                onBeforeCompile: function(){},
                side: THREE.DoubleSide,
                transparent: true,
            });
            materials.push(material);
        }

        return materials;

    }

	startLoading();
    const scene = zincRenderer.createScene(name);
    saveData.scene = scene;
	Zinc.loadExternalFiles([data.vs, data.fs], function (shaderText) {
        
        
        scene.loadViewURL(data.view);
            
		let materials = makeMaterials(shaderText, uniforms, data.models.length);

        loadMultiModels(name, scene, data, materials, saveData);
    });
};

const loadScene = function(data, uniforms, rng = null) {
	if (!zincRenderer) {
		console.error('zinc not loaded');
		return;
	}

    let name = (JSON.stringify(data) + rng + "").hashCode();

	if (name in scenes) {
		setScene(name, scenes[name], materials[name]);
		return;
	}

	startLoading();
    const scene = zincRenderer.createScene(name);
    globalScene = scene;
	Zinc.loadExternalFiles([data.vs, data.fs], function (shaderText) {
        
        
        scene.loadViewURL(data.view);
            
		const material = new THREE.ShaderMaterial({
			vertexShader: shaderText[0],
			fragmentShader: shaderText[1],
			uniforms: uniforms,
            onBeforeCompile: function(){}, // fix bug in ThreeJS
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false,
            depthTest: false
		});

    loadModels(name, scene, data, material);
    });
};

const loadMultiModels = function (name, scene, data, material, saveData) {
    let loadedSizes = [];
    let totalSize = 0;
    for (let i = 0; i < data.models.length; i++) {
        loadedSizes.push(0);
        
        let gzreq = new XMLHttpRequest();
        gzreq.open('HEAD', data.models[i] + '.gz', false);
        gzreq.send();
        if (gzreq.status === 200) {
            data.models[i] += '.gz';
            totalSize += parseInt(gzreq.getResponseHeader('content-length'));
        } else {
            let req = new XMLHttpRequest();
            req.open('HEAD', data.models[i], false);
            req.send();
            if (req.status !== 200) {
                return;
            }
            totalSize += parseInt(req.getResponseHeader('content-length'));
        }
    }

    const updateLoader = function(i, loaded) {
        loadedSizes[i] = loaded;

        let loadedSize = 0;
        for (let i = 0; i < data.models.length; i++) {
            loadedSize += loadedSizes[i];
        }
        setLoadingText((loadedSize / totalSize * 100).toFixed(0) + '%');
    };

    let tempModels = new Array(data.models.length);
    saveData.materials = material;
    let matLen = material.length;

    let n = 0;
    for (let i = 0; i < data.models.length; i++) {
        n++;if(i >= matLen){alert("oh no" + i)}
        let useCompressed = data.models[i].endsWith('.gz');
        let loader = new THREE.FileLoader();
        if (useCompressed) {
            loader.setResponseType('arraybuffer');
        }
        loader.load(data.models[i],
            function (text) {
                if (useCompressed) {
                    let gzbuf = new Uint8Array(text);
                    let buf = pako.ungzip(gzbuf);
                    text = (new TextDecoder('utf-8')).decode(buf);
                }
                
                let json = JSON.parse(text);
                let object = (new THREE.JSONLoader()).parse(json, 'path');
                object.geometry.morphColors = json.morphColors;
                tempModels[i] = object;
                let bufferGeometry = toBufferGeometry(object.geometry, saveData.scale[i]);
                scene.addZincGeometry(bufferGeometry, 10001, undefined, undefined, false, false, true, undefined, material[i]);
                n--;
                if (n == 0) {
                    scenes[name] = scene;
                    materials[name] = material;
                    setScene(name, scene, material);
                    stopLoading();
                    saveData.models = tempModels;
                }
            }, function (xhr) {
                updateLoader(i, xhr.loaded);
            },
            function (err) {
                console.error('Could not load model: ', err);
                showError('Could not load model files.');
                stopLoading();
            }
        );
    }
    
};

const loadModels = function (name, scene, data, material) {
    let loadedSizes = [];
    let totalSize = 0;
    for (let i = 0; i < data.models.length; i++) {
        loadedSizes.push(0);
        
        let gzreq = new XMLHttpRequest();
        gzreq.open('HEAD', data.models[i] + '.gz', false);
        gzreq.send();
        if (gzreq.status === 200) {
            data.models[i] += '.gz';
            totalSize += parseInt(gzreq.getResponseHeader('content-length'));
        } else {
            let req = new XMLHttpRequest();
            req.open('HEAD', data.models[i], false);
            req.send();
            if (req.status !== 200) {
                return;
            }
            totalSize += parseInt(req.getResponseHeader('content-length'));
        }
    }

    const updateLoader = function(i, loaded) {
        loadedSizes[i] = loaded;

        let loadedSize = 0;
        for (let i = 0; i < data.models.length; i++) {
            loadedSize += loadedSizes[i];
        }
        setLoadingText((loadedSize / totalSize * 100).toFixed(0) + '%');
    };

    globalModels = [];
    globalScene = scene;
    globalMaterial = material;

    let n = 0;
    for (let i = 0; i < data.models.length; i++) {
        n++;
        let useCompressed = data.models[i].endsWith('.gz');
        let loader = new THREE.FileLoader();
        if (useCompressed) {
            loader.setResponseType('arraybuffer');
        }
        loader.load(data.models[i],
            function (text) {
                if (useCompressed) {
                    let gzbuf = new Uint8Array(text);
                    let buf = pako.ungzip(gzbuf);
                    text = (new TextDecoder('utf-8')).decode(buf);
                }
                
                let json = JSON.parse(text);
                let object = (new THREE.JSONLoader()).parse(json, 'path');
                object.geometry.morphColors = json.morphColors;
                globalModels.push(object);
                let bufferGeometry = toBufferGeometry(object.geometry, saveData.scale[i]);
                scene.addZincGeometry(bufferGeometry, 10001, undefined, undefined, false, false, true, undefined, material[i]);
                n--;
                if (n == 0) {
                    scenes[name] = scene;
                    materials[name] = material[i];
                    setScene(name, scene, material[i]);
                    stopLoading();
                }
            }, function (xhr) {
                updateLoader(i, xhr.loaded);
            },
            function (err) {
                console.error('Could not load model: ', err);
                showError('Could not load model files.');
                stopLoading();
            }
        );
    }
};

function toBufferGeometry(geometry, scale = noScale) {
	let arrayLength = geometry.faces.length * 3 * 3;
	let positions = new Float32Array(arrayLength);
	let normals = new Float32Array(arrayLength);

	let colors0 = new Float32Array(arrayLength);
	let colors1 = new Float32Array(arrayLength);
	let colors2 = new Float32Array(arrayLength);

	let hasColors = !!geometry.morphColors;

	geometry.faces.forEach(function (face, index) {

        //size scale
        let xmult = scale.x;//width
        let ymult = scale.y;//depth
        let zmult = scale.z;//height

        positions[index*9 + 0] = geometry.vertices[face.a].x * xmult;
        positions[index*9 + 3] = geometry.vertices[face.b].x * xmult;
        positions[index*9 + 6] = geometry.vertices[face.c].x * xmult;

        positions[index*9 + 1] = geometry.vertices[face.a].y * ymult;
        positions[index*9 + 4] = geometry.vertices[face.b].y * ymult;
        positions[index*9 + 7] = geometry.vertices[face.c].y * ymult;

		positions[index*9 + 2] = geometry.vertices[face.a].z * zmult;
		positions[index*9 + 5] = geometry.vertices[face.b].z * zmult;
		positions[index*9 + 8] = geometry.vertices[face.c].z * zmult;

		// normals[index*9 + 0] = face.vertexNormals[0].x * xmult;
		// normals[index*9 + 1] = face.vertexNormals[0].y * ymult;
		// normals[index*9 + 2] = face.vertexNormals[0].z * zmult;
		// normals[index*9 + 3] = face.vertexNormals[1].x * xmult;
		// normals[index*9 + 4] = face.vertexNormals[1].y * ymult;
		// normals[index*9 + 5] = face.vertexNormals[1].z * zmult;
		// normals[index*9 + 6] = face.vertexNormals[2].x * xmult;
		// normals[index*9 + 7] = face.vertexNormals[2].y * ymult;
        // normals[index*9 + 8] = face.vertexNormals[2].z * zmult;
        
        normals[index*9 + 0] = face.vertexNormals[0].x;
		normals[index*9 + 1] = face.vertexNormals[0].y;
		normals[index*9 + 2] = face.vertexNormals[0].z;
		normals[index*9 + 3] = face.vertexNormals[1].x;
		normals[index*9 + 4] = face.vertexNormals[1].y;
		normals[index*9 + 5] = face.vertexNormals[1].z;
		normals[index*9 + 6] = face.vertexNormals[2].x;
		normals[index*9 + 7] = face.vertexNormals[2].y;
		normals[index*9 + 8] = face.vertexNormals[2].z;

		if (hasColors) {
			let cis = [face.a, face.b, face.c];
			for (let i = 0; i < 3; i++) {
				let ci = cis[i];
				let color0 = new THREE.Color(geometry.morphColors[0].colors[ci]);
				let color1 = new THREE.Color(geometry.morphColors[1].colors[ci]);
				let color2 = new THREE.Color(geometry.morphColors[2].colors[ci]);

				colors0[index*9 + i*3 + 0] = color0.r;
				colors0[index*9 + i*3 + 1] = color0.g;
				colors0[index*9 + i*3 + 2] = color0.b;
				colors1[index*9 + i*3 + 0] = color1.r;
				colors1[index*9 + i*3 + 1] = color1.g;
				colors1[index*9 + i*3 + 2] = color1.b;
				colors2[index*9 + i*3 + 0] = color2.r;
				colors2[index*9 + i*3 + 1] = color2.g;
				colors2[index*9 + i*3 + 2] = color2.b;
			}
		}
	});

	let bufferGeometry = new THREE.BufferGeometry();
	bufferGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	bufferGeometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
	if (hasColors) {
		bufferGeometry.addAttribute('color0', new THREE.BufferAttribute(colors0, 3));
		bufferGeometry.addAttribute('color1', new THREE.BufferAttribute(colors1, 3));
		bufferGeometry.addAttribute('color2', new THREE.BufferAttribute(colors2, 3));
	}
	return bufferGeometry;
}

function reloadModels(){
    //fetch global variables
    let scene = globalScene;
    let material = globalMaterial;

    scene.clearAll();

    let n = 0;
    for (let i = 0; i < globalModels.length; i++){
        n++;
        let object = globalModels;
        let bufferGeometry = toBufferGeometry(object.geometry, lungScale);
        scene.addZincGeometry(bufferGeometry, 10001, undefined, undefined, false, false, true, undefined, material);
        n--;
    }
}

function reloadMultiModels(saveData){
    
    let models = saveData.models;
    let materials = saveData.materials;
    let scene = saveData.scene;
    let scale = saveData.scale;

    scene.clearAll();

    for (let i = 0; i < models.length; i++){
        let object = models[i];
        let bufferGeometry = toBufferGeometry(object.geometry, scale[i]);
        scene.addZincGeometry(bufferGeometry, 10001, undefined, undefined, false, false, true, undefined, materials[i]);
    }
    setScene(null, scene, materials);
}