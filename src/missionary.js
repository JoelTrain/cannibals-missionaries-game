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

const cannibalCount = 5;
const missionaryCount = 7;
const boatCapacity = 2;
// let boatOnLeft = true;
// const stateBits = cannibalCount + missionaryCount + 1; // one for the boat

// const initialState = 0b000000;
const initialState = `${cannibalCount}c${missionaryCount}mb|`;
// const finalState = 0b1111111;
const finalState = `|${cannibalCount}c${missionaryCount}mb`;
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

function boatLeftString(objectForm) {
	return `${objectForm.boatOnLeft ? 'b' : ''}`;
}

function boatRightString(objectForm) {
	return `${objectForm.boatOnLeft ? '' : 'b'}`;
}

function convertStringToBin(stringState) {
	const objectForm = lookupNode(stringState);

	return objectForm.binState;
}

function deserialize(stringState) {
  const objectForm = {};

  const riverIndex = stringState.indexOf('|');
	objectForm.boatOnLeft = stringState.charAt(riverIndex - 1) === 'b';

	objectForm.boatLeftString = () => `${objectForm.boatOnLeft ? 'b' : ''}`;
	objectForm.boatRightString = () => `${objectForm.boatOnLeft ? '' : 'b'}`;

  const leftSideString = stringState.slice(0, riverIndex);

  const cIndex = leftSideString.indexOf('c');
  {
    let canLeftCount = 0;

    if(cIndex > 0)
      canLeftCount = parseInt(leftSideString.slice(0, cIndex));

    objectForm._cannibalsOnLeftCount = canLeftCount;
    objectForm.cannibalsOnLeftCount = () => objectForm._cannibalsOnLeftCount;
    objectForm.cannibalsOnRightCount = () => cannibalCount - objectForm.cannibalsOnLeftCount();
    objectForm.setCannibalsOnLeftCount = (newVal) => objectForm._cannibalsOnLeftCount = newVal;
    objectForm.setCannibalsOnRightCount = (newVal) => objectForm._cannibalsOnLeftCount = cannibalCount - newVal;
  }
  {
    let missLeftCount = 0;

    const mIndex = leftSideString.indexOf('m');
    if(mIndex > 0)
      missLeftCount = parseInt(leftSideString.slice(cIndex + 1, mIndex));

    objectForm._missionariesOnLeftCount = missLeftCount;
    objectForm.missionariesOnLeftCount = () => objectForm._missionariesOnLeftCount;
    objectForm.missionariesOnRightCount = () => missionaryCount - objectForm.missionariesOnLeftCount();
    objectForm.setMissionariesOnLeftCount = (newVal) => objectForm._missionariesOnLeftCount = newVal;
    objectForm.setMissionariesOnRightCount = (newVal) => objectForm._missionariesOnLeftCount = missionaryCount - newVal;
  }

	objectForm.cannibalsLeftString = () => `${(objectForm.cannibalsOnLeftCount() > 0) ? objectForm.cannibalsOnLeftCount() + 'c' : ''}`;
	objectForm.cannibalsRightString = () => `${(objectForm.cannibalsOnRightCount() > 0) ? objectForm.cannibalsOnRightCount() + 'c' : ''}`;
	objectForm.missionariesLeftString = () => `${(objectForm.missionariesOnLeftCount() > 0) ? objectForm.missionariesOnLeftCount() + 'm' : ''}`;
	objectForm.missionariesRightString = () => `${(objectForm.missionariesOnRightCount() > 0) ? objectForm.missionariesOnRightCount() + 'm' : ''}`;

	objectForm.targets = [];

	objectForm.stringForm = serialize(objectForm);

	objectForm.isPossible = isPossible(objectForm);
	objectForm.isAlive = isAlive(objectForm);

  return objectForm;
}

function serialize(objectForm) {
	const stringForm = `${objectForm.cannibalsLeftString()}${objectForm.missionariesLeftString()}${objectForm.boatLeftString()}|${objectForm.cannibalsRightString()}${objectForm.missionariesRightString()}${objectForm.boatRightString()}`;
	return stringForm;
}

function isPossible(objState) {

	const totalPeopleOnLeft = objState.cannibalsOnLeftCount() + objState.missionariesOnLeftCount();
	const totalPeopleOnRight = objState.cannibalsOnRightCount() + objState.missionariesOnRightCount();

	if (totalPeopleOnLeft === (cannibalCount + missionaryCount) && !objState.boatOnLeft)
		return false;
	if (totalPeopleOnRight === (cannibalCount + missionaryCount) && objState.boatOnLeft)
		return false

	return true;
}

function isAlive(objState) {

	if (objState.cannibalsOnLeftCount() > objState.missionariesOnLeftCount() && objState.missionariesOnLeftCount() !== 0)
		return false;
	if (objState.cannibalsOnRightCount() > objState.missionariesOnRightCount() && objState.missionariesOnRightCount() !== 0)
		return false;

	return true;
}

function printState(objectForm) {
	console.log('state:', '\'' + serialize(objectForm) + '\'', `${objectForm.isPossible ? '' : 'not possible'}`,
		`${objectForm.isAlive ? '' : 'dead'}`);
}

function insertNode(stringState) {
  const objectForm = deserialize(stringState);

  graphNodes[stringState] = objectForm;
  // console.log(objectForm.stringForm);
}

function enumerateStates() {
	let deadCount = 0;
	let impossibleCount = 0;


  for(let cannibals = cannibalCount; cannibals >= 0; cannibals--) {
    for(let missionaries = missionaryCount; missionaries >= 0; missionaries--) {
      let stringStateLeft = '';
      const cannibalsLeft = cannibals;
      const missionariesLeft = missionaries;
      {
        if(cannibalsLeft > 0)
          stringStateLeft = stringStateLeft.concat(cannibalsLeft, 'c');
        if(missionariesLeft > 0)
          stringStateLeft = stringStateLeft.concat(missionariesLeft, 'm');
      }
      let stringStateRight = '';
      {
        const cannibalsRight = cannibalCount - cannibalsLeft;
        const missionariesRight = missionaryCount - missionariesLeft;
        if(cannibalsRight > 0)
          stringStateRight =stringStateRight.concat(cannibalsRight, 'c');
        if(missionariesRight > 0)
          stringStateRight = stringStateRight.concat(missionariesRight, 'm');
      }
      // one for boat on left
      const boatLeftString = `${stringStateLeft}b|${stringStateRight}`;
      // one for boat on right
      const boatRightString = `${stringStateLeft}|${stringStateRight}b`;

      insertNode(boatLeftString);
      insertNode(boatRightString);
    }
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
	console.log('Initial state', initialState);
}

function leftToRightTransitions(objState) {
	const moves = [];

	if (!objState.boatOnLeft)
		return moves;

	for (let totalSent = 1; totalSent <= boatCapacity; totalSent++) {
		for (let cannibalsSent = 0; cannibalsSent <= objState.cannibalsOnLeftCount() && cannibalsSent <= totalSent; cannibalsSent++) {
			const missionariesSent = totalSent - cannibalsSent;

			if (missionariesSent <= objState.missionariesOnLeftCount()) {
				{
					let resultantState = deserialize(objState.stringForm);
					resultantState.setCannibalsOnLeftCount(resultantState.cannibalsOnLeftCount() - cannibalsSent);
					resultantState.setMissionariesOnLeftCount(resultantState.missionariesOnLeftCount() - missionariesSent);
					resultantState.boatOnLeft = !resultantState.boatOnLeft;
					resultantState = lookupNode(serialize(resultantState));
          const lastIndex = objState.targets.push({targetNode: resultantState, move: `${cannibalsSent},${missionariesSent}`});

					// console.log(`modified ${objState.stringForm} by ${cannibalsSent}c${missionariesSent}m and got ${serialize(resultantState)}`);
					moves.push(` ${cannibalsSent}c${missionariesSent}m -> ${objState.targets[lastIndex - 1].targetNode.stringForm}`);
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
		for (let cannibalsSent = 0; cannibalsSent <= objState.cannibalsOnRightCount() && cannibalsSent <= totalSent; cannibalsSent++) {
			const missionariesSent = totalSent - cannibalsSent;

			if (missionariesSent <= objState.missionariesOnRightCount()) {
				let resultantState = deserialize(objState.stringForm);
				resultantState.setCannibalsOnLeftCount(resultantState.cannibalsOnLeftCount() + cannibalsSent);
				resultantState.setMissionariesOnLeftCount(resultantState.missionariesOnLeftCount() + missionariesSent);
				resultantState.boatOnLeft = !resultantState.boatOnLeft;
        resultantState = lookupNode(serialize(resultantState));
        const lastIndex = objState.targets.push({targetNode: resultantState, move: `${cannibalsSent},${missionariesSent}`});

				// console.log(`modified ${objState.stringForm} by ${cannibalsSent}c${missionariesSent}m and got ${serialize(resultantState)}`);
				moves.push(` ${cannibalsSent}c${missionariesSent}m -> ${objState.targets[lastIndex - 1].targetNode.stringForm}`);
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
		// console.log(`${node.stringForm}   \t${trans.length === 0 ? 'impossible' : (trans.length === 1 ? 'useless ' : '') + `moves${trans}`}`);
	}
}

function printList(nodeArray) {
	let resultString = '';
	for (const node of nodeArray) {
		resultString += node.stringForm + '  '
	}
	console.log(resultString);
	return resultString;
}

function initializeColors(nodes) {
	for (const node of Object.values(nodes)) {
		node.color = 'unseen'; // white
    node.shortestMovePathToMe = [];
    node.shortestStatePathToMe = [];
    // console.log(node.stringForm, 'marked unseen');
    // if(node.stringForm === deserializeBin(finalState).stringForm)
    //   console.log(node.stringForm, node.shortestStatePathToMe);
	}

  // console.log('all nodes marked unseen');
}

function discoverNode(node, queue) {
  if(node.isAlive)
    queue.push(node);
  node.color = 'seen';
  // console.log(node.stringForm, 'has been seen for the first time');
}

function visitNode(node) {
  node.color = 'complete';
  // console.log(node.stringForm, 'has been completed. All neighbors have been examined.')
}

function examineNeighbors(node, queue) {
  for(const { targetNode, move } of node.targets) {
    if(targetNode.color === 'unseen') {
      targetNode.shortestStatePathToMe = [...node.shortestStatePathToMe, targetNode];
      targetNode.shortestMovePathToMe = [...node.shortestMovePathToMe, move];
      discoverNode(targetNode, queue);
      // printList(targetNode.shortestStatePathToMe);
    }
  }
}

function breadthFirstSearch(nodes, start, end) {
	initializeColors(nodes);

  // a queue, use push to add to the end
  // and use shift to pop off the front
	const discoverQueue = [];

  start.shortestStatePathToMe = [start];
  discoverNode(start, discoverQueue);

  while (discoverQueue.length !== 0) {
    const currentNode = discoverQueue.shift();
    examineNeighbors(currentNode, discoverQueue);
    visitNode(currentNode);

    if (currentNode.stringForm === end.stringForm) {

      break;
    }
  }

  return end.shortestStatePathToMe;
}

function main() {
	const nodes = getNodes();
	const edges = getEdges();

	const start = lookupNode(initialState);
	const end = lookupNode(finalState);

	const shortestPath = breadthFirstSearch(nodes, start, end);

  if(end.shortestMovePathToMe.length === 0) {
    console.log("No solution.");
    return;
  }

  console.log(`The shortest path to the end is ${end.shortestMovePathToMe.length} moves.`);
  // console.log(shortestPath);
  console.log(end.shortestMovePathToMe);
	printList(shortestPath);
}

main();
