'use strict';

import AppLoader from './AppLoader.js';
import Configuration from "./data/Configuration.js";
import LocalStorageService from "./services/LocalStorageService.js";
import ScreenService from "./screens/ScreenService.js";
import ControlSelectorScreen from "./screens/ControlSelectorScreen.js";

import * as THREE from './libs/three.module.js';
import TextureService from './graphics/TextureService.js';

export default class App {
	constructor(canvas, gl, assets, loader) {
		this.canvas = canvas;
		this.gl = gl;
		this.assets = assets;

		this.loader = loader ? loader : (new AppLoader(this));

		this.world = undefined;
		this.graphics = undefined;

		this.update = this.update.bind(this);
		this.draw = this.draw.bind(this);
		this.overflow = this.overflow.bind(this);

		window.cameraId = parseInt(window.localStorage.getItem("camera-id") || "1");
	}
	debounce(func, delay) {
		let inDebounce
		return function(...args) {
			const context = this;
			(inDebounce !== undefined) && clearTimeout(inDebounce);
			inDebounce = setTimeout(() => func.apply(context, args), delay);
		}
	}
	attachEvents() {
		window.addEventListener("resize", this.debounce(this.resize.bind(this), 200));
		//window.addEventListener("mousemove", this.debounce(this.mousemove.bind(this), 1));
		window.addEventListener("mousemove", this.mousemove.bind(this));
		window.addEventListener("mousedown", this.debounce(this.mousedown.bind(this), 100));
		window.addEventListener("keydown", this.keydown.bind(this));
	}
	updateCamera(id, frame) {
		if (this.lastCameraId === id && id >= 2 && id <= 4) {
			return;
		}

		if (id === 1 || id === 2) {
			var angle = 2*Math.PI*(id === 1 ? this.frame/250 : this.frame/1000)
			var scale = window.scale || 0.35;
			this.graphics.camera.position.x = 0.41+Math.cos(angle)*10*scale;
			this.graphics.camera.position.z = 0.41+Math.sin(angle)*10*scale;
			this.graphics.camera.position.y = 2;
			this.graphics.camera.lookAt(0, 0, 0);
		} else if (id === 3 || id === 4 || id === 5) {
			var angle
			if (id === 3) {
				angle = 2*Math.PI*0.1;
			} else if (id === 4) {
				angle = 2*Math.PI*0.2;
			} else if (id === 5) {
				angle = 2*Math.PI*0.3;
			}
			var scale = window.scale || 0.35;
			this.graphics.camera.position.x = 0.41+Math.cos(angle)*10*scale;
			this.graphics.camera.position.z = 0.41+Math.sin(angle)*10*scale;
			this.graphics.camera.position.y = 2;
			this.graphics.camera.lookAt(0, 0, 0);
		}
		document.title = id;
	}
	update() {
		(this.screen) && (this.screen.update) && (this.screen.update());
		// Update camera around the object
		if (this.frame < 1000) {
			this.frame++;
		} else {
			this.frame = 0;
		}
		if (this.frame%20 === 19) {
			const element = document.querySelector(".footer");
			if (!element.classList.contains("closed")) {
				element.querySelector(".footer-text").innerHTML = "Render Calls:"+this.graphics.renderer.info.render.calls+"<br>Blocks: "+this.world.blockList.length+"<br>Faces:"+(this.world.blockList.length*6);
			}
		}
		if (this.graphics.camera) {
			const cameraId = window.cameraId || 1;
			this.updateCamera(cameraId, this.frame);
		}
	}
	draw() {
		this.graphics.draw();
	}
	overflow() {
		// Called when 333ms has been elapsed since last update
		console.log("overflow");
	}
	async loadGraphics() {
		return await this.loader.loadGraphics();
	}
	mockWorld() {
		const size = 8;
		//this.world.set(0, 1, 0, 1);
		for (var i = 0; i < size; i++) {
			for (var j = 0; j < size; j++) {
				//this.world.set(i-size/2, (i%3==0||j%3==0)?0:2+j%3-i%3, j-size/2, (i%3==0||j%3==0)?2:3);
			}
		}
		this.addTests();
	}
	keydown(event) {
		if (event.code === "Digit1") {
			window.cameraId = 1;
			this.frame = 0;
			window.localStorage.setItem("camera-id", window.cameraId);
		} else if (event.code === "Digit2") {
			window.cameraId = 2;
			this.frame = 0.5;
			window.localStorage.setItem("camera-id", window.cameraId);
		} else if (event.code === "Digit3") {
			window.cameraId = 3;
			window.localStorage.setItem("camera-id", window.cameraId);
		} else if (event.code === "Digit4") {
			window.cameraId = 4;
			window.localStorage.setItem("camera-id", window.cameraId);
		} else if (event.code === "Digit5") {
			window.cameraId = 5;
			window.localStorage.setItem("camera-id", window.cameraId);
		} else if (event.code === "Digit6") {
			window.cameraId = 6;
			window.localStorage.setItem("camera-id", window.cameraId);
		}
	}
	async addTests() {
		const scene = this.world.scene;
		//const material = TextureService.getMaterial();
		window.scene = scene;
		//window.material = material;
		window.THREE = THREE;
		

		var geometry = new THREE.PlaneBufferGeometry(1, 1);

		const instanced = new THREE.InstancedBufferGeometry();
		instanced.attributes.position = geometry.attributes.position;
		instanced.attributes.uv = geometry.attributes.uv;
		instanced.index = geometry.index;

		const positionAttribute = new THREE.InstancedBufferAttribute( new Float32Array([-1.0, -1.0, -0.5, 1.0, 1.0, 0, -1.0, -1.0, 0, 1.0, -1.0, 0]), 3);
		instanced.addAttribute("instancePosition", positionAttribute);
		const tileAttribute = new THREE.InstancedBufferAttribute( new Float32Array([0, 0, 0, 1, 3, 1, 1, 1]), 2);
		instanced.addAttribute("instanceTile", tileAttribute);
		const rotationAttribute = new THREE.InstancedBufferAttribute( new Float32Array([0, 0, 0, 0, 0, 0, 1, -1, 0, 0, 0, 0]), 3);
		instanced.addAttribute("instanceRotation", rotationAttribute);

		const material2 = new THREE.ShaderMaterial({
			uniforms: {
				texture1: { value: TextureService.texture },
				time: {value: 0}
			},
			vertexShader: `
				precision lowp float;

				uniform float time;

				attribute vec3 instancePosition;
				attribute vec2 instanceTile;
				attribute vec3 instanceRotation;

				varying vec2 vUv;

				#define PI_HALF 1.5707963267949
				#define IMAGE_SIZE_PIXELS 128.0
				#define IMAGE_TILE_SIZE 8.0

				mat4 translateXYZ(vec3 v) {
					return mat4(
						1.0, 0.0, 0.0, 0.0,
						0.0, 1.0, 0.0, 0.0,
						0.0, 0.0, 1.0, 0.0,
						v.x, v.y, v.z, 1.0
					);
				}

				mat4 rotateXYZ(vec3 v) {
					return mat4(
						1.0,		0,			0,			0,
						0, 			cos(v.x),	-sin(v.x),	0,
						0, 			sin(v.x),	cos(v.x),	0,
						0,			0,			0, 			1
					) * mat4(
						cos(v.z),	-sin(v.z),	0,			0,
						sin(v.z),	cos(v.z),	0,			0,
						0,			0,			1,			0,
						0,			0,			0,			1
					) * mat4(
						cos(v.y),	0,			sin(v.y),	0,
						0,			1.0,		0,			0,
						-sin(v.y),	0,			cos(v.y),	0,
						0, 			0,			0,			1
					);
				}

				void main() {
					vec2 topLeftOrigin = (1.0/IMAGE_TILE_SIZE) * uv + vec2(0.0, (IMAGE_TILE_SIZE-1.)/IMAGE_TILE_SIZE);
					vUv = topLeftOrigin + vec2(1.0, -1.0) * (1.0/IMAGE_SIZE_PIXELS * (1.0+instanceTile*2.0) + vec2(1.0 / IMAGE_TILE_SIZE) * instanceTile);

					vec3 pos = position + instancePosition;

					mat4 toCenter = translateXYZ(-instancePosition);
					mat4 fromCenter = translateXYZ(instancePosition);
					mat4 transformation = fromCenter * rotateXYZ(PI_HALF*instanceRotation) * toCenter;


					vec4 resultPos = transformation * vec4(pos, 1.0);
					gl_Position = projectionMatrix * modelViewMatrix * resultPos;
				}
			`,
			fragmentShader: `
				precision lowp float;
				
				uniform sampler2D texture1;

				varying vec2 vUv;

				void main() {
					vec4 color = texture2D(texture1, vUv);
					if (color.a != 1.0) {
						discard;
					}
					gl_FragColor = vec4(color.xyz, 1.0);
				}
			`,
			transparent: true
		});
		material2.side = THREE.FrontSide;

		const mesh = new THREE.Mesh(instanced, material2);
		mesh.position.set(0, 1, 0);
		scene.add(mesh);
		scene.add(new THREE.AxesHelper(0.2));
	}
	async loadWorld() {
		await this.loader.loadWorld();
		this.mockWorld();
	}
	async loadScreens() {
		await this.loader.loadScreens();
	}
	onInputTypeSelected(selection) {
		ScreenService.setScreen(this, undefined);
		LocalStorageService.save("inputType", selection);
		this.setupInputType(selection);
	}
	setupInputType(name) {
		Configuration.inputType.value = name;
	}
	async loadLoop() {
		this.loader.loadLoop(this.draw, this.update, this.overflow, this.performancer);
	}
	loadInputType() {
		const inputType = LocalStorageService.load("inputType");
		if (!inputType || inputType === "unknown") {
			return "unknown"
		} else {
			return inputType;
		}
	}
	start() {
		ScreenService.clearScreen();

		const inputType = this.loadInputType();
		
		if (inputType === "unknown") {
			ScreenService.setScreen(this, ControlSelectorScreen);
			ControlSelectorScreen.once("select", this.onInputTypeSelected.bind(this));
		} else {
			this.setupInputType(inputType);
		}
	}
	mousemove(evt) {
		const nx = (evt.clientX/window.innerWidth);
		const ny = (evt.clientY/window.innerHeight);
		window.lastMouseX = nx;
		window.lastMouseY = ny;
		const element = document.querySelector(".footer");
		if (nx > 0.75 && ny > 0.8 && element.classList.contains("closed")) {
			element.classList.remove("closed");
		} else if ((nx <= 0.75 || ny <= 0.8) && !element.classList.contains("closed")) {
			element.classList.add("closed");
		}
	}
	mousedown(evt) {
		if (evt.button !== 0) return;
		console.log("Mouse Down");
	}
	resize() {
		this.width = this.canvas.width = window.innerWidth;
		this.height = this.canvas.height = window.innerHeight;
		this.graphics && this.graphics.resize(this.width, this.height);
		this.screen && this.screen.resize && this.screen.resize(this.width, this.height);
	}
}