// Hanoi towers
// const _ = require('lodash')
// const math = require('mathjs')
/* we want an object to model the state of the hanoi tower
 * it should initialize to a certin value, (init(N)), N is the nubmer of
 * return a set of legal moves from the current state, (legalMoves())
 * make a move it if is legal, (move(move)),
 * get the current state (getState()),
 * reset the tower (resetState())
 * and know if it is in the end state (isEndState()).
 * the state can be represented by three stacks, one for each pole (0, 1, 2)
 * each move can be represented as an ordered pair of two poles (ringStart, ringEnd), where it is assumed that you take the top ring (because you have to)
*/
const validNumRings = (nRings) => {
    return nRings && nRings <= 8 && nRings >= 2;
};
const validNumTrials = (ntTrials) => {
    return ntTrials && ntTrials <= 1000000 && ntTrials > 20;
};
// helper functions
const sampleFromList = (A) => {
    return A[Math.random() * A.length >> 0];
};
const sampleVariance = (A) => {
    const sampleMean = average(A);
    const n = A.length;
    let sum = 0;
    for (let i = 0; i < n; i++) {
        sum += Math.pow((A[i] - sampleMean), 2);
    }
    return sum / (n - 1.0);
};
const peek = (A) => {
    return A[A.length - 1];
};
const average = (A) => {
    return A.length ? A.reduce((acc, next) => acc + next) / A.length : 0;
};
class Hanoi {
    constructor(N) {
        this.NUM_POLES = 3;
        this.nRings = N;
        this.initState();
    }
    initState() {
        this.state = [];
        for (let i = 0; i < this.NUM_POLES; i++) {
            this.state.push([]);
        }
        for (let ring = this.nRings - 1; ring >= 0; ring--) {
            this.state[0].push(ring);
        }
    }
    legalMoves() {
        const legalMoves = [];
        for (let startPole = 0; startPole < this.NUM_POLES; startPole++) {
            for (let endPole = 0; endPole < this.NUM_POLES; endPole++) {
                if (startPole === endPole)
                    continue; // not from i -> i
                const startRing = peek(this.state[startPole]);
                if (startRing === undefined)
                    continue; // pole must have an object
                const endRing = peek(this.state[endPole]);
                if (endRing !== undefined && endRing < startRing)
                    continue; // ring must stack onto something larger
                legalMoves.push([startPole, endPole]);
            }
        }
        return legalMoves;
    }
    makeMove(startPoleIndex, endPoleIndex) {
        // console.log('making move between', startPoleIndex, endPoleIndex)
        const startPole = this.state[startPoleIndex];
        const endPole = this.state[endPoleIndex];
        endPole.push(startPole.pop());
    }
    // this end state is if we require all rings to end on any pole that's not the first.
    isEndState() {
        // console.log('checking end state', this.state)
        for (let i = 1; i <= this.NUM_POLES - 1; i++) {
            // console.log('state ', i, this.state[i], this.state[i].length, this.nRings, this.state[i].length == this.nRings)
            if (this.state[i].length === this.nRings)
                return true;
        }
        return false;
    }
    // this end state is if we require all rings to end on the last pole.
    // by symmetry, this should increase the expected value by a factor of NUM_POLES - 1
    // isEndState () {
    //   return this.state[this.NUM_POLES - 1].length === this.nRings
    // }
    getState() {
        return this.state;
    }
    getNumRings() {
        return this.nRings;
    }
    resetState() {
        this.initState();
    }
}
// randomWalk(towers): run the towers of hanoi randomly from legal moves and return how many moves it took to reach the end state
const randomWalk = (hanoi) => {
    hanoi.resetState();
    let nMoves = 0;
    while (!hanoi.isEndState()) {
        const legalMoves = hanoi.legalMoves();
        const move = sampleFromList(legalMoves);
        hanoi.makeMove(move[0], move[1]);
        // console.log('state after move', hanoi.getState()[0], hanoi.getState()[1], hanoi.getState()[2])
        nMoves++;
    }
    return nMoves;
};
// getSamples(tower, N): run randomWalk(N) times, returning the samples. average value.
const getSamples = (hanoi, numTrials) => {
    console.log(`time to build hanoi tower with ${hanoi.getNumRings()} rings.`);
    const nMovesList = [];
    for (let i = 1; i <= numTrials; i++) {
        if (i % 100 === 0)
            console.log(`trial ${i}!`);
        const nMoves = randomWalk(hanoi);
        nMovesList.push(nMoves);
    }
    return nMovesList;
};
// if we require all rings to end on any pole that's not the first,
const trueExpectedValue = (hanoi) => {
    // from Berger and Alekseyve (2014)
    const N = hanoi.getNumRings();
    return (Math.pow(3, N) - 1) * (Math.pow(5, N) - Math.pow(3, N)) / (4 * Math.pow(3, (N - 1)));
};
// global variable (bad)
let samples;
// set up hanoi tower, run trials, and update the text box.
function getHanoiSamples(numRings, numTrials) {
    const hanoi = new Hanoi(numRings);
    console.log(numTrials);
    samples = getSamples(hanoi, numTrials);
    // samples collected!
    console.log('Expected value estimated', average(samples));
    document.getElementById('sample-status').innerHTML = `Success! After ${numTrials.toString()} random games of 
  the Tower of Hanoi, the estimated expected number of moves you make is ${average(samples).toFixed(2).toString()}. This should be pretty similar to the closed-form solution:`;
    katex.render(`E(N) = \\frac{(3^N - 1)(5^N - 3^N)}{4 \\cdot 3^{N - 1}} \\approx ${trueExpectedValue(hanoi).toFixed(2).toString()}`, document.getElementById('true-value'));
    document.getElementById('credit').style.display = 'block';
    // console.log('True EV', trueExpectedValue(hanoi))
}
// bootstrap function
function bootstrapVariance(nBootstraps, bootSampleSize) {
    if (!(samples === null || samples === void 0 ? void 0 : samples.length)) {
        document.getElementById('bootstrap-status').innerHTML = 'Seems like you haven\'t collected your samples yet!';
        return;
    }
    const resampledVars = [];
    for (let i = 0; i < nBootstraps; i++) {
        const newSample = [];
        for (let j = 0; j < bootSampleSize; j++) {
            newSample.push(sampleFromList(samples));
        }
        resampledVars.push(sampleVariance(newSample));
    }
    console.log('Bootstrapped variances', resampledVars);
    document.getElementById('bootstrap-status').innerHTML = `Nice! Looks like we expect the variance 
    to be ${average(resampledVars).toFixed(0).toString()}, plus or minus ${Math.sqrt(sampleVariance(resampledVars)).toFixed(0).toString()}.
    Here's a histogram:`;
    drawHistogram(resampledVars);
}
// bonus: being able to visually demonstrate all the data: which iteration number, how many steps have been taken, expected value so far, etc.
// bonus bonus: simulating a random walk really slowly and showing where on the tree you stand. also being able to draw out a tree.
