var numagents = 16;
// var locations = 12; // unused
var simulator = new Simulator();
var agentspeed = 0.3 * 1;
var agentradius = 12;
var interval;

var data = new Data();

var animals = []; // set #0
var food = []; // set #1
var tools = []; // set #2

for (var i = 1; i < 17; i++) {
  var suffix = String(i) + ".png";
  animals.push("assets/animals/Animal_" + suffix);
  food.push("assets/food/Food_" + suffix);
  tools.push("assets/tools/Tool_" + suffix);
}
imageSrcs = [animals, food, tools];

function shuffle(array) {
  //Fisher-Yates shuffle
  var m = array.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function newMsUntilNextPause() {
  return 7000 + randomInt(13000); // currently, returns a random integer in the range [7000, 20000)
}

