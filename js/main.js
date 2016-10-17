
function updateUniformsWithDetails() {
	var age = Math.floor(subjectDetails.age + 0.5);
	start_age = subjectDetails.ageStartedSmoking * 0.01;
	if (start_age < 0.0)
		start_age = 0.0;
	cellUniforms["starting_time"].value = start_age;
	cellUniforms["severity"].value = subjectDetails.packsPerDay * 1.0;
	flowUniforms["starting_time"].value = start_age;
	flowUniforms["severity"].value = subjectDetails.packsPerDay * 1.0;
}

function person(age, height, gender) {
	this.age = age;
	this.height = height // cm
	this.gender = gender;
	this.asthmaSeverity = "none";
	this.ageStartedSmoking = 18;
	this.packsPerDay = 1.0;
	this.FEV = 4500;
}

/*
var userData = {
	'Current Age': 25,
	'Gender' : "Male",
	'Asthma Severity' : "None",
	'Age started smoking': 18,
	'Packs Per Day': 1.0,
	'Height (cm)' : 180,
	'3D Models' : "Lungs (Tar)",
	'Play Speed' : 500,
	'FEV': 4500,
};
*/

function endLoading() {
	loadingPage.endLoading();
	//myLoadingPage.style.display = 'initial';
	//myLoadingPage.style.opacity = 0;
}

function beginLoading() {
	loadingPage.beginLoading();
	//myLoadingPage.style.display = 'initial';
	//myLoadingPage.style.opacity = 0.9;
}

function updateUniforms(zincRenderer, cellUniforms, flowUniforms) {
	return function () {
		var directionalLight = zincRenderer.getCurrentScene().directionalLight;
		cellUniforms["directionalLightDirection"].value.set(directionalLight.position.x,
			directionalLight.position.y,
			directionalLight.position.z);
		flowUniforms["directionalLightDirection"].value.set(directionalLight.position.x,
			directionalLight.position.y,
			directionalLight.position.z);
		cellUniforms["time"].value = zincRenderer.getCurrentTime()/3000.0;
		flowUniforms["time"].value = zincRenderer.getCurrentTime()/3000.0;
		var zinc_rendered_age = parseInt(cellUniforms["time"].value *100.0);
		if (zinc_rendered_age != rendered_age) {
			console.log('Set rendered age ' + rendered_age);
			setRenderedAge(lung_age_display, zinc_rendered_age);
			rendered_age = zinc_rendered_age;
		}
		// if (age != renderer_Age) {
		// 	renderer_Age = age;
		// 	var element = document.getElementById("renderer_Age");
		// 	if (element)
		// 		element.innerHTML =  "Simulated Age: " + renderer_Age;
		// }
		// if (zincRenderer.playAnimation == true)
		// {
		// 	var sliderElement = document.getElementById("age_slider");
		// 	sliderElement.value = renderer_Age;
		// }
	};
}

function isSceneInitialised(scene_name) {
	var result = false;
	if (scene_name == "Surface") {
		result = surfaceStatus["initialised"];
	} else if (scene_name == "Airways") {
		result = airwaysStatus["initialised"];
	}
	
	return result;
}

var updateModelDownloadProgress = function(model_name, scene, model_ready) {
	var error = false;
	if (scene) {
		var element = document.getElementById("loadingOverlay");
		if (model_ready) {
			element.innerHTML =  "<p>Loading " + model_name + " ... Completed.</p>"
		} else {
			var progress = scene.getDownloadProgress();
			if (progress[2] == false) {
				var totalString = "";
				if (progress.totalSize > 0)
					totalString = parseInt(progress[0]/1024).toString() + " KB";
				if (element)
					element.innerHTML =  "<p>Loading " + model_name + " ... (" + parseInt(progress[1]/1024).toString() + " KB" + (totalString ? "/" + totalString : "") + ").</p>";
			} else {
				error = true;
				if (element)
					element.innerHTML =  "<p>Loading " + model_name + " ... Failed to load models. Please try again later.</p>";
			}
		}
	}
	if (model_ready) {
		setTimeout(endLoading, 1000);
	}
	else if (error == false) {
		setTimeout(updateModelDownloadProgress, 500, model_name, scene, isSceneInitialised(model_name));
	}
}

function meshReady(sceneName, shaderText, uniforms) {
	return function(mygeometry) {
		var material = new THREE.ShaderMaterial( {
			vertexShader: shaderText[0],
			fragmentShader: shaderText[1],
			uniforms: uniforms
		} );
		material.side = THREE.DoubleSide;
		mygeometry.setMaterial(material)
		if (sceneName == "Surface") {
			surfaceStatus.initialised = true;
			surfaceStatus.scene.viewAll();
		} else if (sceneName == "Airways") {
			airwaysStatus.initialised = true;
			airwaysStatus.scene.viewAll();
		}
		updateUniformsWithDetails();
	}
}
		
function initSurface(scene) {
	loadExternalFiles(['shaders/clean_cell.vs', 'shaders/clean_cell.fs'], function (shaderText) {
		scene.loadFromViewURL('surface/surface', meshReady(scene.sceneName, shaderText, cellUniforms));
	}, function (url) {
	    alert('Failed to download "' + url + '"');
	});
}

function initAirways(scene) {
	loadExternalFiles(['shaders/dynamic_flow.vs', 'shaders/dynamic_flow.fs'], function (shaderText) {
		scene.loadFromViewURL('airways/smoker_flow', meshReady(scene.sceneName, shaderText, cellUniforms));
	}, function (url) {
	    alert('Failed to download "' + url + '"');
	});
}

function initScene(scene_name) {
	beginLoading();
	scene = zincRenderer.createScene(scene_name);
	if (scene_name == "Surface") {
		initSurface(scene);
	} else if (scene_name == "Airways") {
		initAirways(scene);
	}else {
		console.log("Trying to initialise an undefined scene!!!")
	}
	updateModelDownloadProgress(scene_name, scene, isSceneInitialised(scene_name));
	
	return scene;
}

function setScene(scene_name) {
	var currentScene = undefined;
	if (scene_name == "Surface") {
		if (!surfaceStatus["initialised"]) {
			surfaceStatus["scene"] = initScene(scene_name);
		}
		currentScene = surfaceStatus["scene"];
	} else if (scene_name == "Airways") {
		if (!airwaysStatus["initialised"]) {
			airwaysStatus["scene"] = initScene(scene_name);
		}
		currentScene = airwaysStatus["scene"];
	} else {
		console.log("Trying to set undefined scene!!!!")
	}
	zincRenderer.setCurrentScene(currentScene);
}

function modelButtonClicked(model_name) {
	setScene(model_name);
}

function initZinc() {
	var errorString = undefined;
	if ( ! Detector.webgl )
		errorString = Detector.getWebGLErrorMessage();
	if (errorString == undefined) {
		zincRenderer = new Zinc.Renderer(container, window);
		zincRenderer.initialiseVisualisation();
		zincRenderer.addPreRenderCallbackFunction(updateUniforms(zincRenderer, cellUniforms, flowUniforms));
		zincRenderer.setPlayRate(500);
		zincRenderer.playAnimation = false;
		zincRenderer.animate();
	} else {
		errorString = "WebGL is required to display the interactive 3D models.<br>" + errorString + "<br>";
		var element = undefined;
		element = document.getElementById("loadingOverlay");
		if (element) {
			element.innerHTML = errorString;
			element.onclick = endLoading;
		}
	}
}

function resetSubjectDetails() {
	subjectDetails = new person(11, 152, "Male");
}

function setInputsToSubjectDetailsValues() {
	var age_input = document.getElementById("age_input");
	var height_input = document.getElementById("height_input");
	var gender_input = document.getElementById("gender_input");
	var fev_input = document.getElementById("fev_input");
		
	var value_display = age_input.getElementsByClassName('ValueDisplay')[0];

	value_display.innerHTML = subjectDetails.age;
	value_display = height_input.getElementsByClassName('ValueDisplay')[0];
	value_display.innerHTML = subjectDetails.height;
	value_display = gender_input.getElementsByClassName('ValueDisplay')[0];
	value_display.innerHTML = (subjectDetails.gender == "Male") ? 'M' : 'F';
	value_display = fev_input.getElementsByClassName('ValueWideDisplay')[0];
	value_display.innerHTML = subjectDetails.FEV;
	
	console.log('Set rendered age');
	setRenderedAge(lung_age_display, subjectDetails.age);
}

function setPage(pageIndex) {
	var pages = document.getElementsByClassName("toggleByPageNumber");
	var pages_length = pages.length;
	for (var i = 0; i < pages_length; i++) {
		var e = pages[i];
		if (e.classList.contains("page_" + pageIndex)) {
			e.style.display = "block";
		} else {
			e.style.display = "none";
		}
	}
}

function setSubjectDetailsValue(identifier, value) {
	if (identifier == "height_input") {
		subjectDetails.height = value;
	} else if (identifier == "age_input") {
		subjectDetails.age = value;
	} else if (identifier == "gender_input") {
		subjectDetails.gender = value;
	} else if (identifier == "fev_input") {
		subjectDetails.FEV = value;
	} else {
		console.log("Uh Oh unknown identifier " + identifier + " with value: " + value);
	}
}

function startAgain() {
	resetSubjectDetails();
	setPage(0);
	setInputsToSubjectDetailsValues();
	modelButtonClicked("Surface");
}

function resetViewButtonClicked() {
	zincRenderer.viewAll();
}

function updateSlider(slideAmount) {
	this.zincRenderer.setMorphsTime(slideAmount * 30);
}

$( "#navcontent_page_0" ).load("page_0.html");
$( "#navcontent_page_1" ).load("page_1.html");
$( "#navcontent_page_2" ).load("page_2.html");
$( "#navcontent_page_3" ).load("page_3.html");
$( "#navcontent_page_4" ).load("page_4.html");

require(["dojo/domReady!"], function(){
	updateDiv();
	setRepeatOnButtons();
	initZinc();
	startAgain();
});

