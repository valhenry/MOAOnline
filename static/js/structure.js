
function Experiment(nTrials, itemSet, isPractice) {

  data.setCurrentExperiment(this);

  this.nTrials = nTrials;
  this.itemSet = itemSet;
  this.isPractice = isPractice;
  
  this.trialsComplete = 0;
  this.board = new Board(imageSrcs[this.itemSet]);

  this.run = function () {
	  this.board.run();
  }


}







function run() {

  var experiment = new Experiment(5, 1, false);
  experiment.run();

  if (false) { // this method of running multiple experiments currently doesn't work because experiment.run() returns immediately; the end of the experiment is not awaited
  // introduction screen (practice)

  // 10 practice trials

  var experiment = new Experiment(10, 0, true);
  experiment.run();

  // introduction screen (experimental)

  // 23 trials with each of the three image sets (animals, tools, food)

  for (var i = 0; i < 3; ++i) {
	experiment = new Experiment(23, i, false);
	experiment.run();
  }
  }

}

window.onload = run();

