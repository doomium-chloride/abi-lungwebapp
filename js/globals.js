let PLAY_SPEED = 1.0;

const GRAPH_WIDTH = 250;
const GRAPH_HEIGHT = 250;
const GRAPH_PADDING = 5;
const GRAPH_TEXT_HEIGHT = 20;
const GRAPH_SMOOTHING = 0.2;
const MARKER_RADIUS = 16;

const THREE = Zinc.THREE;
const surfaceUniforms = THREE.UniformsUtils.merge([{
	'ambient'  : { type: 'c', value: new THREE.Color( 0xffffff ) },
	'emissive' : { type: 'c', value: new THREE.Color( 0x000000 ) },
	'specular' : { type: 'c', value: new THREE.Color( 0x111111 ) },
	'shininess': { type: 'f', value: 30 },
	'diffuse': { type: 'c', value: new THREE.Color( 0xeecaa2 ) },
	'ambientLightColor': { type: 'c', value: new THREE.Color( 0x444444 ) },
	'directionalLightColor': { type: 'c', value: new THREE.Color( 0x888888 ) },
	'directionalLightDirection': { type: 'v3', value: new THREE.Vector3()  },
	't': { type: 'f', value: 0.0 },
	'tidalVolumeRatio': { type: 'f', value: 0.4 },
	'severity': { type: 'f', value: 0.0 },
    'opacity': { type: 'f', value: 1.0 },
}]);

const staticUniforms = THREE.UniformsUtils.merge([{
	'ambient'  : { type: 'c', value: new THREE.Color( 0xffffff ) },
	'emissive' : { type: 'c', value: new THREE.Color( 0x000000 ) },
	'specular' : { type: 'c', value: new THREE.Color( 0x111111 ) },
	'shininess': { type: 'f', value: 30 },
	'diffuse': { type: 'c', value: new THREE.Color( 0xeecaa2 ) },
	'ambientLightColor': { type: 'c', value: new THREE.Color( 0x444444 ) },
	'directionalLightColor': { type: 'c', value: new THREE.Color( 0x888888 ) },
	'directionalLightDirection': { type: 'v3', value: new THREE.Vector3()  },
	't': { type: 'f', value: 0.0 },
	'tidalVolumeRatio': { type: 'f', value: 0.4 },
	'severity': { type: 'f', value: -10.0 },
    'opacity': { type: 'f', value: 1.0 },
}]);

const dynamicUniforms = THREE.UniformsUtils.merge([{
	'ambient'  : { type: 'c', value: new THREE.Color( 0xffffff ) },
	'emissive' : { type: 'c', value: new THREE.Color( 0x000000 ) },
	'specular' : { type: 'c', value: new THREE.Color( 0x111111 ) },
	'shininess': { type: 'f', value: 30 },
	'diffuse': { type: 'c', value: new THREE.Color( 0xeecaa2 ) },
	'ambientLightColor': { type: 'c', value: new THREE.Color( 0x444444 ) },
	'directionalLightColor': { type: 'c', value: new THREE.Color( 0x888888 ) },
	'directionalLightDirection': { type: 'v3', value: new THREE.Vector3()  },
	't': { type: 'f', value: 0.0 },
	'tidalVolumeRatio': { type: 'f', value: 0.4 },
	'severity': { type: 'f', value: 0.0 },
    'opacity': { type: 'f', value: 0.5 },
}]);

const airwaysUniforms = THREE.UniformsUtils.merge([{
  'ambient'  : { type: 'c', value: new THREE.Color( 0xffffff ) },
  'emissive' : { type: 'c', value: new THREE.Color( 0x000000 ) },
  'specular' : { type: 'c', value: new THREE.Color( 0x111111 ) },
  'shininess': { type: 'f', value: 30 },
  'ambientLightColor': { type: 'c', value: new THREE.Color( 0x444444 ) },
  'directionalLightColor': { type: 'c', value: new THREE.Color( 0x888888 ) },
  'directionalLightDirection': { type: 'v3', value: new THREE.Vector3()  },
  't': { type: 'f', value: 0.0 },
  'tidalVolumeRatio': { type: 'f', value: 0.2 },
  'asthmaSeverity': { type: 'f', value: 0.0 },
  'smokingSeverity': { type: 'f', value: 0.0 },
}]);

function resetUniforms() {
  surfaceUniforms['severity']['value'] = 0.0
  airwaysUniforms['asthmaSeverity']['value'] = 0.0
  airwaysUniforms['smokingSeverity']['value'] = 0.0
}

document.getElementById('information').addEventListener('click', function(e) {
  if (this.innerHTML == 'Less information') {
    this.innerHTML = 'More information';
  } else {
    this.innerHTML = 'Less information';
  }
	let articles = document.querySelectorAll('article');
	for (let i = 0; i < articles.length; i++) {
		articles[i].classList.toggle('hidden');
	}
});

var lungScale = {
    x : 1,//width
    y : 1,//depth
    z : 1//height
}

const staticWeights = [0,0,0];

var lungWeights = [0,0,0];

var numbers = [1,1,1,0];

var sliderVariables = {
    age: 30,
    gender: 0,
    height: 140,
    bmi: 20,
    fvc: 2,
    dlco: 10,
    rvtlc: 10,
    tlc: 2
};

var globalScene = null;

var currentViewPort = null;

var viewPortListenerAdded = false;

var globalAutoFill = false;

var globalModels = null;

var globalMaterial = null;

const noScale = {x:1,y:1,z:1};