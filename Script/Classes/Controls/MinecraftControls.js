function MinecraftControls(parent, scene, camera) {
	this.onRelease = undefined;
	this.onStart = undefined;
	if (!(scene instanceof THREE.Scene && camera instanceof THREE.Camera))
		throw "Parameter Error";

	this.parent = parent;
	this.generatePointerlock(scene);
	this.loadPlayerState();
	this.direction = new THREE.Vector3();
	this.speed = {};
	if (Settings) {
		Settings.player.speed.horizontal.attach(this.speed, "x");
		Settings.player.speed.vertical.attach(this.speed, "y");
		Settings.player.speed.horizontal.attach(this.speed, "z");
		let collisionSize = {};
		Settings.player.collision.size.x.attach(collisionSize, "x");
		Settings.player.collision.size.y.attach(collisionSize, "y");
		Settings.player.collision.size.z.attach(collisionSize, "z");
		this.collision = new CollisionController(this, scene, collisionSize);
	} else {
		this.speed = {x:0.085, y:0.105, z:0.085};
		let collisionSize = {x:0.75, y:1.625, z:0.75}
		this.collision = new CollisionController(this, scene, collisionSize);
	}
	this.velocity = new THREE.Vector3();

	this.moveForward = false;
	this.moveLeft = false;
	this.moveBackward = false;
	this.moveRight = false;
	this.moveUp = false;
	this.moveDown = false;
	this.vertical = 0;

	/*document.addEventListener('pointerlockchange', (event)=>this.onPointerlockChange(event), false)
	document.addEventListener('pointerlockerror', (event)=>this.onPointerlockError(event), false);
	document.addEventListener('keydown', (event)=>this.onKeyChange(event.code, 1, event.ctrlKey, event.shiftKey), false);
	document.addEventListener('keyup', (event)=>this.onKeyChange(event.code, 0, event.ctrlKey, event.shiftKey), false);*/
}
MinecraftControls.prototype = {
	constructor: MinecraftControls,
	generatePointerlock: function(scene) {
		// PointerLockControls is a class created by mrdoobs, here I adjust it to my needs.
		this.pointerlock = new THREE.PointerLockControls(camera);
		this.yaw = this.pointerlock.getObject();
		this.pitch = this.yaw.children[0];
		this.yaw.name = "Camera Yaw";
		this.pitch.name = "Camera Pitch";

		if (Settings && Settings.camera) {
			Settings.camera.adjustment.x.attach(this.pitch.position, "x");
			Settings.camera.adjustment.y.attach(this.pitch.position, "y");
			Settings.camera.adjustment.z.attach(this.pitch.position, "z");
		} else {
			this.pitch.position.set(0,0.625,0);
		}
		scene.add(this.yaw);
	},
	onPointerlockChange: function() {
		if (document.pointerLockElement == document.body && !this.pointerlock.enabled) {
			this.pointerlock.enabled = true;
			if (this.onStart)
				this.onStart();
		} else if (this.pointerlock.enabled) {
			this.savePlayerState();
			this.pointerlock.enabled = false;
			if (this.onRelease)
				this.onRelease();
		}
	},
	onPointerlockError: function() {
		this.releaseMouse();
	},
	update: function() {
		this.setupDirection();
		if (this.collision)
			this.collision.step(this.yaw.position, this.direction, this.speed);
		else
			this.velocity.set(this.direction.x * this.speed.x, this.direction.y * this.speed.y, this.direction.z * this.speed.z);
		this.yaw.position.add(this.velocity);
	},
	releaseMouse: function() {
		document.exitPointerLock();
	},
	requestMouse: function() {
		document.body.requestPointerLock();
	},
	setupDirection: function() {
		let value = this.moveForward + this.moveBackward * 2 + this.moveLeft * 4 + this.moveRight * 8;
		let x, z;
		if (value > 0 && value < 15 && value !== 12) {
			x = [0, 0, 0, -1, -0.70703125, -0.70703125, -1, 1, 0.70703125, 0.70703125, 1, 0, 0, 0][value - 1];
			z = [-1, 1, 0, 0, -0.70703125, 0.70703125, 0, 0, -0.70703125, 0.70703125, 0, 0, -1, 1][value - 1];
		} else {
			x = 0;
			z = 0;
		}
		this.direction.set(x, this.vertical, z);
		this.direction.applyQuaternion(this.yaw.quaternion);
	},
	loadPlayerState: function() {
		if (Settings) {
			this.yaw.position.set(Settings.player.position.x.value, Settings.player.position.y.value, Settings.player.position.z.value)
			this.pitch.rotation.x = Settings.player.rotation.pitch.value;
			this.yaw.rotation.y = Settings.player.rotation.yaw.value;
		} else if (typeof getCookie === "function") {
			var x = getCookie("rs_posX")
			  , y = getCookie("rs_posY")
			  , z = getCookie("rs_posZ")
			  , pitch = getCookie("rs_rotX")
			  , yaw = getCookie("rs_rotY");
			if (x&&y&&z&&(!isNaN(parseFloat(x)))&&(!isNaN(parseFloat(y)))&&(!isNaN(parseFloat(z)))) {
				this.yaw.position.set(parseFloat(x), parseFloat(y), parseFloat(z));
			} else {
				this.yaw.position.set(10,10,10);
			}
			if (pitch && yaw && (!isNaN(parseFloat(pitch))) && (!isNaN(parseFloat(yaw)))) {
				this.pitch.rotation.x = parseFloat(pitch);
				this.yaw.rotation.y = parseFloat(yaw);
			} else {
				this.pitch.rotation.x = -0.7;
				this.yaw.rotation.y = 0.7;
			}
		}
	},
	savePlayerState: function() {
		if (Settings)
			return;
		if (typeof setCookie === "function") {
			var d = options.cookiesLastingDays;
			setCookie("rs_posX", this.yaw.position.x, d);
			setCookie("rs_posY", this.yaw.position.y, d);
			setCookie("rs_posZ", this.yaw.position.z, d);
			setCookie("rs_rotX", this.pitch.rotation.x, d);
			setCookie("rs_rotY", this.yaw.rotation.y, d);
		}
	}
}
