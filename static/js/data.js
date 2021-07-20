


var canvas = document.getElementById("board");
console.log("Canvas width and height: ", canvas.width, canvas.height);

function Data() {

  var currentExperiment = false;

  // called when a covered agent is clicked
  this.logAgentClick = function (agentPos, agentIndex) { // more information needs to be added, such as the current state of the experiment and the time of the click
    console.log("new click: agent with index " + agentIndex + " and position (" + Math.floor(agentPos.x) + ", " + Math.floor(agentPos.y) + ")");
  };

  this.setCurrentExperiment = function (experiment) {
	currentExperiment = experiment;
  };

  // called when the simulator is paused
  this.logOnPause = function (simulator) { 
	console.log("simulator just paused")
	console.log("target agent has index " + simulator.getTargetAgentIndex())
    for (var i = 0; i < simulator.agents.length; i++) {
	  var agentPos = simulator.getAgentPosition(i);
	  console.log("agent with index " + i + " has position (" + Math.floor(agentPos.x) + ", " + Math.floor(agentPos.y) + ")");
	}
  }

}
