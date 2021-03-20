// Hanoi towers
/* we want an object to model the state of the hanoi tower
 * it should initialize to a certin value, (init(N)), N is the nubmer of
 * return a set of legal moves from the current state, (legalMoves())
 * make a move it if is legal, (move(move)),
 * get the current state (getState()),
 * print the current state (printState()),
 * reset the tower (tower())
 * and know if it is in the end state (isEndState()).
 * the state can be represented by three stacks, one for each pole (0, 1, 2)
 * each move can be represented as an ordered pair of two poles (ringStart, ringEnd), where it is assumed that you take the top ring (because you have to)
*/
// randomWalk(towers): run the towers of hanoi randomly from legal moves and return how many moves it took to reach the end state
// getExpectedValue(tower, N): run randomWalk(N) times, returning the average value.
// then the frontend: receiving a number N, printing (in latex?) the expected count, and getExpecgtedValue
// bonus: being able to visually demonstrate all the data: which iteration number, how many steps have been taken, expected value so far, etc.
// bonus bonus: simulating a random walk really slowly and showing where on the tree you stand. also being able to draw out a tree.
const getExpectedValue = (rings, numTrials) => {
    console.log(`time to build hanoit tower with ${rings} rings.`);
    for (let i = 1; i <= numTrials; i++) {
        console.log(`trial ${i}!`);
    }
};
const run = () => {
    const rings = parseInt(prompt("how many rings you idiot"));
    console.log(rings);
    // init a 
    const numTrials = parseInt(prompt("how many trials (empty for 10000)")) || 0;
    console.log(numTrials);
};
run();
