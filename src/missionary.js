// Scenario

// There are 3 missionaries and 3 cannibals. 
// If the cannibals ever outnumber the missionaries even for a moment on a side of the river, they will realize this, overpower them and devaour them.
// They are all on the left side of a river with 1 boat that only holds 2 people at a time.
// They desire to all reach the right side of the river using that boat without anyone dying.
// The boat is not autonomous and must be piloted by at least one person when crossing the river.
// What is the least number of operations/moves to reach the other side safely?
// Stretch goal: solve the problem for increasing numbers of people.


// the syntax of a state is like so:
// "3c3mb|"
// this means that 3 cannibals and 3 missionaries and the boat are all on the left side of the river.
// The vertical bar represents the river.
// This is also the initial state.
// The desired end state is as follows:
// "|3c3mb"

// since each object only has 2 positions - left or right side of the river - they can be represented easily in binary
// a 0 represents the left side of the river
// a 1 represents the right side of the river
// the least significant bit represents the boat
// there must be equal counts of cannibals and missionaries to start the scenario
// therefore, including the boat the number of bits (digits) to represent a state will always be odd.
// For the base scenario of 3c and 3m + 1b each state can be represented by 7 bits.
// Therefore there are 128 states.

const cannibalCount = 3;
const missionaryCount = 3;
const boatCapacity = 2;
// let boatOnLeft = true;
const stateBits = cannibalCount + missionaryCount + 1; // one for the boat

let currentState = 0b0000000;
const initialState = 0b000000;
const finalState = 0b1111111;
const graphNodes = {};


function getNodes() {
	if (Object.keys(graphNodes).length === 0) {
		enumerateStates();
	}

	return graphNodes;
}

function deserializeBin(binState) {
	const objectForm = {};

	objectForm.binState = binState;

	objectForm.boatOnLeft = binState % 2 === 0;

	objectForm.boatLeftString = `${objectForm.boatOnLeft ? 'b' : ''}`;
	objectForm.boatRightString = `${objectForm.boatOnLeft ? '' : 'b'}`;


	objectForm.missionary0OnLeft = (binState >> 1) % 2 === 0;
	objectForm.missionary1OnLeft = (binState >> 2) % 2 === 0;
	objectForm.missionary2OnLeft = (binState >> 3) % 2 === 0;
	objectForm.missionariesOnLeft = [objectForm.missionary0OnLeft, objectForm.missionary1OnLeft, objectForm.missionary2OnLeft];

	objectForm.missionariesOnLeftCount = objectForm.missionariesOnLeft.reduce((total, currentEntry) => total + (currentEntry ? 1 : 0), 0);
	objectForm.missionariesOnRightCount = missionaryCount - objectForm.missionariesOnLeftCount;

	objectForm.missionariesLeftString = `${(objectForm.missionariesOnLeftCount > 0) ? objectForm.missionariesOnLeftCount + 'm' : ''}`;
	objectForm.missionariesRightString = `${(objectForm.missionariesOnRightCount > 0) ? objectForm.missionariesOnRightCount + 'm' : ''}`;


	objectForm.cannibal0OnLeft = (binState >> 4) % 2 === 0;
	objectForm.cannibal1OnLeft = (binState >> 5) % 2 === 0;
	objectForm.cannibal2OnLeft = (binState >> 6) % 2 === 0;
	objectForm.cannibalsOnLeft = [objectForm.cannibal0OnLeft, objectForm.cannibal1OnLeft, objectForm.cannibal2OnLeft];

	objectForm.cannibalsOnLeftCount = objectForm.cannibalsOnLeft.reduce((total, currentEntry) => total + (currentEntry ? 1 : 0), 0);
	objectForm.cannibalsOnRightCount = cannibalCount - objectForm.cannibalsOnLeftCount;

	objectForm.cannibalsLeftString = `${(objectForm.cannibalsOnLeftCount > 0) ? objectForm.cannibalsOnLeftCount + 'c' : ''}`;
	objectForm.cannibalsRightString = `${(objectForm.cannibalsOnRightCount > 0) ? objectForm.cannibalsOnRightCount + 'c' : ''}`;

	objectForm.resultString = `${objectForm.cannibalsLeftString}${objectForm.missionariesLeftString}${objectForm.boatLeftString}|${objectForm.cannibalsRightString}${objectForm.missionariesRightString}${objectForm.boatRightString}`;

	objectForm.isPossible = isPossible(objectForm);
	objectForm.isAlive = isAlive(objectForm);

	return objectForm;
}

function isPossible(objState) {

	const totalPeopleOnLeft = objState.cannibalsOnLeftCount + objState.missionariesOnLeftCount;
	const totalPeopleOnRight = objState.cannibalsOnRightCount + objState.missionariesOnRightCount;

	if (totalPeopleOnLeft === 6 && !objState.boatOnLeft)
		return false;
	if (totalPeopleOnRight === 6 && objState.boatOnLeft)
		return false

	return true;
}

function isAlive(objState) {

	if (objState.cannibalsOnLeftCount > objState.missionariesOnLeftCount && objState.missionariesOnLeftCount !== 0)
		return false;
	if (objState.cannibalsOnRightCount > objState.missionariesOnRightCount && objState.missionariesOnRightCount !== 0)
		return false;

	return true;
}

function convertObjToStringSyntax(stateObj) {
	const resultString = `${stateObj.cannibalsLeftString}${stateObj.missionariesLeftString}${stateObj.boatLeftString}|${stateObj.cannibalsRightString}${stateObj.missionariesRightString}${stateObj.boatRightString}`;
	return resultString;
}

function printState(objForm) {
	console.log('binary state:', '\'' + objForm.binState.toString(2) + '\'', 'decoded state:', '\'' + convertObjToStringSyntax(objForm) + '\'', `${objForm.isPossible ? '' : 'not possible'}`,
		`${objForm.isAlive ? '' : 'dead'}`);
}

function enumerateStates() {
	const stateCount = Math.pow(2, 7);
	console.log('Total states', stateCount);
	console.log('Initial state', currentState);
	let deadCount = 0;
	let impossibleCount = 0;

	for (let i = initialState; i <= finalState; i++) {
		const objForm = deserializeBin(i);
		graphNodes[i] = objForm;
		if (!objForm.isAlive)
			deadCount++;
		if (!objForm.isPossible)
			impossibleCount++;
		printState(objForm);
	}

	console.log('impossibleCount:', impossibleCount);
	console.log('deadCount:', deadCount);
}


function main() {
	const nodes = getNodes();
}



main();
