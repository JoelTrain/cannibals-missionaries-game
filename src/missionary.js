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
const graphEdges = {};

function getNodes() {
	if (Object.keys(graphNodes).length === 0) {
		enumerateStates();
	}

	return graphNodes;
}

function lookupNode(stringState) {
	return getNodes()[stringState];
}

function getEdges() {
	if (Object.keys(graphEdges).length === 0) {
		enumerateLinks();
	}
	return graphEdges;
}

function cannibalsLeftString(objForm) {
	return `${(objForm.cannibalsOnLeftCount > 0) ? objForm.cannibalsOnLeftCount + 'c' : ''}`;
}

function cannibalsRightString(objForm) {
	return `${(objForm.cannibalsOnRightCount > 0) ? objForm.cannibalsOnRightCount + 'c' : ''}`;
}

function missionariesLeftString(objForm) {
	return `${(objForm.missionariesOnLeftCount > 0) ? objForm.missionariesOnLeftCount + 'm' : ''}`;
}

function missionariesRightString(objForm) {
	return `${(objForm.missionariesOnRightCount > 0) ? objForm.missionariesOnRightCount + 'm' : ''}`;
}

function boatLeftString(objForm) {
	return `${objForm.boatOnLeft ? 'b' : ''}`;
}

function boatRightString(objForm) {
	return `${objForm.boatOnLeft ? '' : 'b'}`;
}

function convertStringToBin(stringState) {
	const objectForm = lookupNode(stringState);

	return objectForm.binState;
}

function deserializeBin(binState) {
	const objectForm = {};

	objectForm.binState = binState;

	objectForm.boatOnLeft = binState % 2 === 0;

	objectForm.boatLeftString = boatLeftString(objectForm);
	objectForm.boatRightString = boatRightString(objectForm);

	objectForm.missionary0OnLeft = (binState >> 1) % 2 === 0;
	objectForm.missionary1OnLeft = (binState >> 2) % 2 === 0;
	objectForm.missionary2OnLeft = (binState >> 3) % 2 === 0;
	objectForm.missionariesOnLeft = [objectForm.missionary0OnLeft, objectForm.missionary1OnLeft, objectForm.missionary2OnLeft];

	objectForm.missionariesOnLeftCount = objectForm.missionariesOnLeft.reduce((total, currentEntry) => total + (currentEntry ? 1 : 0), 0);
	objectForm.missionariesOnRightCount = missionaryCount - objectForm.missionariesOnLeftCount;

	objectForm.missionariesLeftString = missionariesLeftString(objectForm);
	objectForm.missionariesRightString = missionariesRightString(objectForm);

	objectForm.cannibal0OnLeft = (binState >> 4) % 2 === 0;
	objectForm.cannibal1OnLeft = (binState >> 5) % 2 === 0;
	objectForm.cannibal2OnLeft = (binState >> 6) % 2 === 0;
	objectForm.cannibalsOnLeft = [objectForm.cannibal0OnLeft, objectForm.cannibal1OnLeft, objectForm.cannibal2OnLeft];

	objectForm.cannibalsOnLeftCount = objectForm.cannibalsOnLeft.reduce((total, currentEntry) => total + (currentEntry ? 1 : 0), 0);
	objectForm.cannibalsOnRightCount = cannibalCount - objectForm.cannibalsOnLeftCount;

	objectForm.cannibalsLeftString = cannibalsLeftString(objectForm);
	objectForm.cannibalsRightString = cannibalsRightString(objectForm);

	objectForm.stringForm = serialize(objectForm);

	objectForm.isPossible = isPossible(objectForm);
	objectForm.isAlive = isAlive(objectForm);

	return objectForm;
}

function deserialize(stringState) {
	const binState = convertStringToBin(stringState);
	return deserializeBin(binState);
}

function serialize(objectForm) {
	const stringForm = `${cannibalsLeftString(objectForm)}${missionariesLeftString(objectForm)}${boatLeftString(objectForm)}|${cannibalsRightString(objectForm)}${missionariesRightString(objectForm)}${boatRightString(objectForm)}`;
	return stringForm;
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

function printState(objForm) {
	console.log('binary state:', '\'' + objForm.binState.toString(2) + '\'', 'decoded state:', '\'' + serialize(objForm) + '\'', `${objForm.isPossible ? '' : 'not possible'}`,
		`${objForm.isAlive ? '' : 'dead'}`);
}

function enumerateStates() {
	const stateCount = Math.pow(2, 7);
	// console.log('Total states', stateCount);
	let deadCount = 0;
	let impossibleCount = 0;

	for (let i = initialState; i <= finalState; i++) {
		const objForm = deserializeBin(i);
		const decodedString = serialize(objForm);
		graphNodes[decodedString] = objForm;
	}
	console.log('Total Unique States', Object.keys(graphNodes).length);
	for (const uniqueState of Object.values(graphNodes)) {
		if (!uniqueState.isAlive)
			deadCount++;
		if (!uniqueState.isPossible)
			impossibleCount++;
		// printState(uniqueState);
	}

	console.log('impossibleCount:', impossibleCount);
	console.log('deadCount:', deadCount);
	console.log('Initial state', deserializeBin(currentState).stringForm);
}

function leftToRightTransitions(objState) {
	const moves = [];

	if (!objState.boatOnLeft)
		return moves;

	for (let totalSent = 1; totalSent <= boatCapacity; totalSent++) {
		for (let cannibalsSent = 0; cannibalsSent <= objState.cannibalsOnLeftCount && cannibalsSent <= totalSent; cannibalsSent++) {
			const missionariesSent = totalSent - cannibalsSent;

			if (missionariesSent <= objState.missionariesOnLeftCount) {
				{
					let resultantState = deserialize(objState.stringForm);
					resultantState.cannibalsOnLeftCount -= cannibalsSent;
					resultantState.cannibalsOnRightCount += cannibalsSent;
					resultantState.missionariesOnLeftCount -= missionariesSent;
					resultantState.missionariesOnRightCount += missionariesSent;
					resultantState.boatOnLeft = !resultantState.boatOnLeft;
					// this is a funky way of doing a deep copy
					resultantState = deserialize(serialize(resultantState));
					resultantState.stringForm = serialize(resultantState);
					const lastIndex = objState.targets.push(resultantState);

					// console.log(`modified ${objState.stringForm} by ${cannibalsSent}c${missionariesSent}m and got ${serialize(resultantState)}`);
					moves.push(` ${cannibalsSent}c${missionariesSent}m -> ${objState.targets[lastIndex - 1].stringForm}`);
				}
			}
		}
	}

	return moves;
}

function rightToLeftTransitions(objState) {
	const moves = [];

	if (objState.boatOnLeft)
		return moves;

	for (let totalSent = 1; totalSent <= boatCapacity; totalSent++) {
		for (let cannibalsSent = 0; cannibalsSent <= objState.cannibalsOnRightCount && cannibalsSent <= totalSent; cannibalsSent++) {
			const missionariesSent = totalSent - cannibalsSent;

			if (missionariesSent <= objState.missionariesOnRightCount) {
				let resultantState = deserialize(objState.stringForm);
				resultantState.cannibalsOnRightCount -= cannibalsSent;
				resultantState.cannibalsOnLeftCount += cannibalsSent;
				resultantState.missionariesOnRightCount -= missionariesSent;
				resultantState.missionariesOnLeftCount += missionariesSent;
				resultantState.boatOnLeft = !resultantState.boatOnLeft;
				// this is a funky way of doing a deep copy
				resultantState = deserialize(serialize(resultantState));
				resultantState.stringForm = serialize(resultantState);
				const lastIndex = objState.targets.push(resultantState);

				// console.log(`modified ${objState.stringForm} by ${cannibalsSent}c${missionariesSent}m and got ${serialize(resultantState)}`);
				moves.push(` ${cannibalsSent}c${missionariesSent}m -> ${objState.targets[lastIndex - 1].stringForm}`);
			}
		}
	}

	return moves;
}

function possibleTransitions(objState) {
	const moves = [];

	// first we need to find which side the boat is on, since all transitions will be to the opposite side.

	// in a very simplistic sense, you can either send 1 person or 2 people or ... or 'boatCapacity' people to the other side
	// in general the options are to send 0 to 'boatCapacity' of cannibals to the other side
	// where the number of missionaries sent are "totalSent - cannibalsSent"

	objState.targets = [];

	moves.push(...leftToRightTransitions(objState));
	moves.push(...rightToLeftTransitions(objState));

	objState.transitions = moves;

	// need to evaluate each move from a node and see what the target nodes would be

	return moves;
}

function enumerateLinks() {
	// from each position there are only certain possible moves
	// the boat must always transit to the other side
	// therefore the least significant bit will always flip (the boat side)
	// and at least one person and no more than 'boatCapacity' may transit with the boat

	for (let nodeId of Object.keys(getNodes())) {
		const node = lookupNode(nodeId);
		const trans = possibleTransitions(node);
		console.log(`${node.stringForm}   \t${trans.length === 0 ? 'impossible' : (trans.length === 1 ? 'useless ' : '') + `moves${trans}`}`);
	}
}


function main() {
	const nodes = getNodes();
	const edges = getEdges();
}



main();
