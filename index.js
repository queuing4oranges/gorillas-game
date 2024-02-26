let state = {}; // Obj that describes many aspects of the game

// Accessing the canvas element
const canvas = document.getElementById("game");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");  // Drawing context, buildin API with methods

newGame();

function newGame () { // Generates metadata for the game
    // Reset game state
    state = {
        phase: "aiming", // aiming || in flight || celebrating
        currentPlayer: 1, 
        bomb: {
            x: undefined,
            y: undefined, 
            rotation: 0,
            velocity: { x: 0, y: 0}
        },
        // Buildings
        backgroundBuildings: [],
        buildings: [],
        blastHoles: [],
    };
    
    for (let i = 0; i < 11; i++) {
        generateBackgroundBuilding(i);
    }
	
	for(let i = 0; i < 8; i++) {
		generateBackgroundBuilding(i)
	}
    
    draw();
}

function generateBackgroundBuilding(index) { // Generating a background buildings array
	const previousBuilding = state.backgroundBuildings(index - 1)
	
	const x = previousBuilding
	? previousBuilding.x + previousBuilding.width + 4 // 4 is the gap
	: -30; // If there is no previous building it starts off the side
	
	const minWidth = 60;
	const maxWidth = 110;
	const width = minWidth + Math.random() * (maxWidth - minWidth);
	
	const minHeight = 80;
	const maxHeight = 350;
	const height = minHeight + Math.random() * (maxHeight - minHeight);
	
	state.backgroundBuildings.push({ x, width, height });
}

function generateBuilding(index) { // // Generating a buildings array
	const previousBuilding = state.buildings(index - 1)
	
	const x = previousBuilding
	? previousBuilding.x + previousBuilding.width + 4 // 4 is the gap
	: 0;
	
	const minWidth = 80;
	const maxWidth = 130;
	const width = minWidth + Math.random() * (maxWidth - minWidth);
	
	const platformWithGorilla = index === 1 || index === 6 // Buildings inbetween need to be shorter for throwing
	
	
	const minHeight = 40;
	const maxHeight = 300;
	const minHeightGorilla = 30;
	const maxHeightGorilla = 150;

	const height = platformWithGorilla
	? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
	: minHeight + Math.random() * (maxHeight - minHeight);
	
	// Create Array for window-lights
	const lightsOn = [];
	for (let i = 0; i < 50; i++) {
		const light = Math.random() <= 0.33 ? true : false; // So 1/3 of lights will be one
		lightsOn.push(light);
	}
	
	state.buildings.push({ x, width, height, lightsOn });
}

function initializeBombPosition() {
	//
}


function draw() {
	ctx.save();

	// Flip buildings upside down
	ctx.translate(0, window.innerHeight);
	ctx.scale(1,-1)

	// Draw the scene
	drawBackground();
	drawBackgroundBuildings();
	drawBuildings();
	drawGorilla(1);
	drawGorilla(2);
	// drawBomb();

	ctx.restore();
}

function drawBackground() {
	const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
	gradient.addColorStop(1, "#F8BA85");
	gradient.addColorStop(0, "#FFC28E");

	// Sky
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

	// Moon
	ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
	ctx.beginPath();
	ctx.arc(300, 350, 60, 0, 2*Math.PI);
	ctx.fill();
}

function drawBackgroundBuildings() { // Looping over the background buildings array
	state.backgroundBuildings.forEach((building) => {
	ctx.fillStyle = "#947285";
	ctx.fillRect(building.x, 0, building.width, building.height)
	});
}


function drawBuildings() { // Looping over the buildings array
	state.backgroundBuildings.forEach((building) => {
		// Buildings
		ctx.fillStyle = "#4A3C68";
		ctx.fillRect(building.x, 0, building.width, building.height)
		
		// Windows
		const windowWidth = 10;
		const windowHeight = 12;
		const gap = 15;
		
		const numberOfFloors = Math.ceil( // Calculate the amount of floors - round up (overflow below screen)
			(building.height - gap) / (windowHeight + gap)
		)
		
		const numberOfRoomsPerFloor = Math.floor( // Calculate rooms per floor - round down (no overflow)
			(building.width - gap) / (windowWidth + gap)
		)
		
		for(let floor = 0; floor < numberOfFloors; floor++) {
			for (let room = 0; room < numberOfRoomsPerFloor; room++) {
				if(building.lightsOn[floor * numberOfRoomsPerFloor + room]) {
					ctx.save();
					
					ctx.translate(building.x + gap, building.height - gap); // Flip windows to top left
					ctx.scale(1, -1)
					
					const x = room * (windowWidth + gap);
					const y = floor * (windowHeight + gap);
					
					ctx.fillStyle = "#EBB6A2";
					ctx.fillRect(x, y, windowWidth, windowHeight);
					
					ctx.restore();
				}
			}
		}
	});
}

function drawGorilla(player) {
	ctx.save(); // Save current coordinate system (save at beginning, restore at end)
	
	const building = 
		player === 1
		? state.building.at(1) // 2nd building
		: state.building.at(-2); // 6th building (2nd last)
	
	ctx.translate(building.x + building.width / 2, building.height);
	
	drawGorillaBody();
	drawGorillaLeftArm(player);
	drawGorillaRightArm(player);
	// drawnGorillaFace(player)
	
	ctx.restore(); // Restore current coordinate system
}

function drawGorillaBody() {
	ctx.fillStyle = "black"
	
	ctx.beginPath(); // Draw body as path
	ctx.moveTo(0,15);
	ctx.lineTo(-7, 0);
	ctx.lineTo(-20, 0);
	ctx.lineTo(-17, 18);
	ctx.lineTo(-20, 44);
	
	ctx.lineTo(-11, 77);
	ctx.lineTo(0, 84);
	ctx.lineTo(11,77);
	
	ctx.lineTo(20,44);
	ctx.lineTo(17,18);
	ctx.lineTo(20,0);
	ctx.lineTo(7,0);
	ctx.fill();
}

function drawGorillaLeftArm() {
	ctx.fillStyle = "black";
	ctx.lineWidth = 18;
	
	ctx.beginPath();
	ctx.moveTo(-14, 50);
	
	if(state.phase === "aiming" && state.currentPlayer === 1 && player === 1) {
		ctx.quadraticCurveTo(-44, 45, -28, 12);
	} else if (state.phase === "celebrating" && state.currentPlayer === player){
		ctx.quadraticCurveTo(-44, 45, -28, 12);
	}
	
	ctx.stroke();	
}

function drawGorillaRightArm() {
	ctx.fillStyle = "black";
	ctx.lineWidth = 18;
	
	ctx.beginPath();
	ctx.moveTo(-14, 50);
	
	if(state.phase === "aiming" && state.currentPlayer === 2 && player === 2) {
		ctx.quadraticCurveTo(44, 63, 28, 107);
	} else if (state.phase === "celebrating" && state.currentPlayer === player){
		ctx.quadraticCurveTo(44, 45, 28, 12);
	}
	
	ctx.stroke();	
}

function drawnGorillaFace(player) {
	//Face - one big circle, two small
	ctx.fillStyle = "pink";
	ctx.beginPath();
	ctx.arc(0, 63, 9, 0, 2 * Math.PI); // Draw face as arc
	ctx.moveTo(-3.5, 70); // Draw 2 more circles
	ctx.arc(-3.5, 70, 4, 0, 2 * Math.PI);
	ctx.moveTo(+3.5, 70);
	ctx.arc(+3.5, 70, 4, 0, 2 * Math.PI);
	ctx.fill();

	// Eyes - two smaller circles
	ctx.fillStyle = "black";
	ctx.beginPath();
	ctx.arc(-3.5, 70, 1.4, 0, 2 * Math.PI);
	ctx.moveTo(+3.5, 70);
	ctx.arc(+3.5, 70, 1.4, 0, 2 * Math.PI);
	ctx.fill();

	// Nose - two lines
	ctx.strokeStyle = "black";
	ctx.lineWidth = 1.4;

	ctx.beginPath();
	ctx.moveTo(-3.5, 66.5);
	ctx.lineTo(-1.5, 65);
	ctx.moveTo(3.5, 66.5);
	ctx.lineTo(1.5, 65);
	ctx.stroke();

	// Mouth - two types
	ctx.beginPath();
	if(state.phase === "celebrating" && state.currentPlayer === player) {
		ctx.moveTo(-5, 60); // Celebrating
		ctx.quadraticCurveTo(0, 56, 5, 60);
	} else {
		ctx.moveTo(-5, 56); // Grumpy
		ctx.quadraticCurveTo(0, 60, 5, 56);
	}
	ctx.stroke();
}

function drawBomb() {
	//
}

function throwBomb() {
	//
}

function animate(timestamp) {
	//
}
