

function setPreferredVelocities(simulator) {
  var stopped = 0;
  for (var i = 0; i < simulator.getNumAgents(); ++i) {
    if (
      RVOMath.absSq(simulator.getGoal(i).minus(simulator.getAgentPosition(i))) <
      RVOMath.RVO_EPSILON
    ) {
      // Agent is within one radius of its goal, set preferred velocity to zero
      simulator.setAgentPrefVelocity(i, new Vector2(0.0, 0.0));
      stopped++;
    } else {
      // Agent is far away from its goal, set preferred velocity as unit vector towards agent's goal.
      simulator.setAgentPrefVelocity(
        i,
        RVOMath.normalize(
          simulator.getGoal(i).minus(simulator.getAgentPosition(i))
        )
      );
    }
  }
  return stopped;
}

let availableGoals = []
// generate all positions on the goal lattice
xpos = -350;
ypos = -150; // start at y -150 to leave room for text
while (ypos <= 250) {
  availableGoals.push(new Vector2(xpos, ypos));
  xpos += 100;
  if (xpos > 350) {
    xpos = -350;
    ypos += 100;
  }
}
availableGoals = shuffle(availableGoals);
// this implementation is weird, but I guess it's fine
// basically, availableGoals and simulator.goals have intersection equal to the null set and union equal to all possible goals
// when an agent needs a new goal, it takes a goal from availableGoals
function updateGoalForAgent(simulator, i) {
  newGoalIndex = randomInt(availableGoals.length);
  newGoal = availableGoals[newGoalIndex];
  availableGoals[newGoalIndex] = simulator.goals[i];
  simulator.goals[i] = newGoal;
}


function generateInitialGoals(n) {
  // This implementation can only handle n <= 35
  if (n > 35) {
    throw 'generateNewGoalPositions currently cannot handle more than 35 goals!';
  }
  // take the first n goals from availableGoals
  goals = availableGoals.slice(0, n);
  availableGoals = availableGoals.slice(n)
  return goals;
}



function setScene(simulator) {
  //console.log("agentspeed: ", agentspeed, simulator);
  // Specify global time step of the simulation.

  simulator.setTimeStep(agentspeed);
  var velocity = new Vector2(1, 1);
  var radius = new Number(agentradius);
  simulator.setAgentDefaults(
    400, // neighbor distance
    30, // max neighbors
    600, // time horizon
    600, // time horizon obstacles
    radius,
    10.0, // max speed
    velocity
  );
  for (var i = 0; i < numagents; i++) {
    var angle = (i * (2 * Math.PI)) / numagents;
    var x = Math.cos(angle) * 200;
    var y = Math.sin(angle) * 200;
    simulator.addAgent(new Vector2(x, y));
  }
  simulator.addGoals(generateInitialGoals(simulator.getNumAgents()));
  // Add (polygonal) obstacle(s), specifying vertices in counterclockwise order.
  var vertices = [];

  if ($("obstacles").checked) {
    for (var i = 0; i < 3; i++) {
      var angle = (i * (2 * Math.PI)) / 3;
      var x = Math.cos(angle) * 50;
      var y = Math.sin(angle) * 50;
      vertices.push(new Vector2(x, y));
    }
  }

  simulator.addObstacle(vertices);

  // Process obstacles so that they are accounted for in the simulation.
  simulator.processObstacles();

}


var Board = function (imageSrc) {
  var canvas = document.getElementById("board");
  var ctx = canvas.getContext("2d");

  var w = canvas.width;
  var h = canvas.height;
  function  getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect(),
        scaleX = canvas.width / rect.width,
        scaleY = canvas.height / rect.height;
    return {
      x: Math.floor((event.clientX - rect.left) * scaleX - w / 2),
      y: Math.floor((event.clientY - rect.top) * scaleY - h / 2)
    }
  }

  function drawAgents(simulator) {
    var numAgents = simulator.getNumAgents();

    for (var i = 0; i < numAgents; i++) {
      var pos = simulator.getAgentPosition(i);
      var radius = simulator.getAgentRadius(i);
      var agentIsCovered = simulator.coveredAgentArray[i];

      if (! agentIsCovered) { // if the agent is not being covered by a circle, draw the agent's image
        const image = new Image();
        image.src = imageSrc[i];
        ctx.drawImage(image, pos.x + w / 2 - 25, pos.y + h / 2 - 25, 50, 50);
      } else { // if the agent is currently being covered by a circle, draw the circle instead
        var radius = simulator.getAgentRadius(i);
        ctx.fillStyle = "rgb(100,0,0)";
        ctx.beginPath();
        ctx.arc(
          pos.x + w / 2 - 2,
          pos.y + h / 2 - 2,
          radius + 20,
          0,
          Math.PI * 2,
          true
        );
        ctx.fill();
        ctx.fillStyle = "rgb(200,100,100)";
        ctx.beginPath();
        ctx.arc(
          pos.x + w / 2 - 2,
          pos.y + h / 2 - 2,
          radius + 10,
          0,
          Math.PI * 2,
          true
        );
        ctx.fill();
      } 
    }
  };

  function drawObstacles(simulator) {
    var obstacles = simulator.getObstacles();

    if (obstacles.length) {
      ctx.fillStyle = "rgb(100,200,200)";
      ctx.beginPath();
      ctx.moveTo(obstacles[0].point.x + w / 2, obstacles[0].point.y + h / 2);
      for (var i = 1; i < obstacles.length; i++) {
        ctx.lineTo(obstacles[i].point.x + w / 2, obstacles[i].point.y + h / 2);
      }
      ctx.closePath();
      ctx.fill();
    }
  };

  function drawGoals(simulator) {
    // don't draw goals if goals should be hidden:
    // if (! simulator.shouldDrawGoals()) {
    //   return;
    // }
    var numAgents = simulator.getNumAgents();
    for (var i = 0; i < numAgents; i++) {
      var pos = simulator.getGoal(i);
      //console.log("pos: ", pos, i);
      var radius = simulator.getAgentRadius(i) / 2;
      ctx.fillStyle = "rgb(100,0,0)";
      ctx.beginPath();
      // ctx.arc(
      //   pos.x + w / 2 - 2,
      //   pos.y + h / 2 - 2,
      //   radius + 20,
      //   0,
      //   Math.PI * 2,
      //   true
      // );
      ctx.fill();
      ctx.fillStyle = "rgb(200,100,100)";
      ctx.beginPath();
      ctx.arc(
        pos.x + w / 2 - 2,
        pos.y + h / 2 - 2,
        radius ,//+ 10,
        0,
        Math.PI * 2,
        true
      );
      ctx.fill();
    }
  };

  function drawTextAndTarget(simulator) {

    if (! simulator.shouldDrawTextAndTarget()) {
      return;
    }

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = "48px Arial";
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillText("Find:", 0 + w / 2 - 2, -250 + h / 2 - 2);

    targetAgentIndex = simulator.getTargetAgentIndex();
    const image = new Image();
    image.src = imageSrc[targetAgentIndex];
    ctx.drawImage(image, 100 + w / 2 - 25, -250 + h / 2 - 25, 50, 50);

  };

  function draw(simulator) {
    reset();
    drawAgents(simulator);
    //drawGoals(simulator);
    drawTextAndTarget(simulator);
  };

  function reset() {
    ctx.clearRect(0, 0, w, h);
  };

  canvas.addEventListener("mousedown",
  function (event) {
    if (! simulator.isListeningForClicks()) { // ignore the click if it's not time for clicks
      return;
    }
    pos = getMousePos(canvas, event);
    var clickedAgentIndex = simulator.getClickedAgentIndex(pos.x, pos.y);
    if (clickedAgentIndex == -1) { // ignore the click if it wasn't on an agent
      return;
    }
    if (! simulator.agentIsCovered(clickedAgentIndex)) { // ignore the click if the agent is already uncovered
      return;
    }
    // A covered agent has been clicked, so
    // uncover the agent
    simulator.uncoverAgent(clickedAgentIndex);
    // log the click
    data.logAgentClick(simulator.getAgentPosition(clickedAgentIndex), clickedAgentIndex);
    // if it was the target agent,
    if (clickedAgentIndex == simulator.getTargetAgentIndex()) {
      // reveal all agents
      simulator.uncoverAllAgents();
      // choose new target
      simulator.randomizeTargetAgent();
      // unpause simulation (TODO: add feedback and delay)
      simulator.unpause();
      simulator.msUntilPause = newMsUntilNextPause();
    }

    // redraw the canvas
    draw(simulator);
  }, false);

  this.run = async function (nTrials) {

    simulator = Simulator.instance = new Simulator();
    clearInterval(interval);
    reset();
    setScene(simulator);
    //promise = new Promise();
    //intervalPeriod = 10; // minimum period is 10 ms
    //var stepsCompleted = 0;
    //var msElapsed = 0; // this may differ from real time on slow computers or if the experiment is paused
    var trialsRemaining = nTrials;
    //var msUntilPause = 10000;
    var step = function () {

      if ((! simulator.isPaused) && (simulator.msUntilPause < 0)) { // if it's not yet paused and it's time to pause
        simulator.pause();
        simulator.coverAllAgents();
        data.logOnPause(simulator);
      }
      
      if (! simulator.isPaused) {
        setPreferredVelocities(simulator);
        simulator.stepAgents();
        simulator.stepTime();
      }
      draw(simulator);

      // change goals if necessary
      // // TODO: rather than wait until all agents have reached their goal, give each agent a new goal once it reaches its current goal
      // if (simulator.reachedGoal()) {
      //   var g = simulator.goals;
      //   g = shuffle(g);
      //   simulator.goals = g;
      //   simulator.addGoals(generateInitialGoals(simulator.getNumAgents()));
      // }
      for (var i = 0; i < simulator.getNumAgents(); ++i) {
        if (simulator.agentReachedGoal(i)) {
          updateGoalForAgent(simulator, i);
        }
      }

      // clear interval if the simulator is complete
      if (simulator.isComplete()) {
        clearInterval(interval);
        return;
      }

      simulator.stepsCompleted++;
      simulator.msElapsed += simulator.intervalPeriod;
      simulator.msUntilPause -= simulator.intervalPeriod;

    };

    interval = setInterval(step, simulator.intervalPeriod);

    // TODO: use promises (I think) to make this nicer

  };

};




