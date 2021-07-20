function Simulator() {
  this.agents = []; // Agent[]
  this.obstacles = []; // Obstacle[]
  this.goals = []; // Vector2
  this.kdTree = new KdTree();

  this.timeStep = 0.25; // this ends up getting set to agentspeed

  this.intervalPeriod = 10; // minimum period is 10 ms
  this.stepsCompleted = 0;
  this.msElapsed = 0; // this may differ from real time on slow computers or if the experiment is paused
  this.msUntilPause = 10000;

  this.defaultAgent; // Agent
  this.time = 0.0;

  this.coveredAgentArray = []; // boolean[]

  this.isComplete = function () {
    return false;
  };

  this.getGlobalTime = function () {
    return this.time;
  };

  this.getNumAgents = function () {
    return this.agents.length;
  };

  this.getTimeStep = function () {
    return this.timeStep;
  };

  this.setAgentPrefVelocity = function (i, velocity) {
    this.agents[i].prefVelocity = velocity;
  };

  this.setTimeStep = function (timeStep) {
    //console.log("timestep: ", timeStep);
    this.timeStep = timeStep;
  };

  this.getAgentPosition = function (i) {
    return this.agents[i].position;
  };

  this.getAgentPrefVelocity = function (i) {
    return this.agents[i].prefVelocity;
  };

  this.getAgentVelocity = function (i) {
    return this.agents[i].velocity;
  };

  this.getAgentRadius = function (i) {
    return this.agents[i].radius;
  };

  this.getAgentOrcaLines = function (i) {
    return this.agents[i].orcaLines;
  };

  this.isPaused = false;
  this.pause = function () {
    this.isPaused = true;
  };
  this.unpause = function () {
    this.isPaused = false;
  };
  this.targetAgentIndex = 2;
  this.randomizeTargetAgent = function () {
    this.targetAgentIndex = randomInt(this.agents.length);
  };
  this.getTargetAgentIndex = function () {
    return this.targetAgentIndex;
  };

  this.addAgent = function (position) {
    if (!this.defaultAgent) {
      throw new Error("no default agent");
    }

    var agent = new Agent();

    agent.position = position;
    agent.maxNeighbors = this.defaultAgent.maxNeighbors;
    agent.maxSpeed = this.defaultAgent.maxSpeed;
    agent.neighborDist = this.defaultAgent.neighborDist;
    agent.radius = this.defaultAgent.radius;
    agent.timeHorizon = this.defaultAgent.timeHorizon;
    agent.timeHorizonObst = this.defaultAgent.timeHorizonObst;
    agent.velocity = this.defaultAgent.velocity;

    agent.id = this.agents.length;
    this.agents.push(agent);
    this.coveredAgentArray.push(false);

    return this.agents.length - 1;
  };

  //  /** float */ neighborDist, /** int */ maxNeighbors, /** float */ timeHorizon, /** float */ timeHorizonObst, /** float */ radius, /** float*/ maxSpeed, /** Vector2 */ velocity)
  this.setAgentDefaults = function (
    neighborDist,
    maxNeighbors,
    timeHorizon,
    timeHorizonObst,
    radius,
    maxSpeed,
    velocity
  ) {
    if (!this.defaultAgent) {
      this.defaultAgent = new Agent();
    }

    this.defaultAgent.maxNeighbors = maxNeighbors;
    this.defaultAgent.maxSpeed = maxSpeed;
    this.defaultAgent.neighborDist = neighborDist;
    this.defaultAgent.radius = radius;
    this.defaultAgent.timeHorizon = timeHorizon;
    this.defaultAgent.timeHorizonObst = timeHorizonObst;
    this.defaultAgent.velocity = velocity;
  };

  this.stepAgents = function () {
    this.kdTree.buildAgentTree();

    for (var i = 0; i < this.getNumAgents(); i++) {
      this.agents[i].computeNeighbors();
      this.agents[i].computeNewVelocity();
      this.agents[i].update();
    }

  };

  this.agentIsCovered = function (i) {
    return this.coveredAgentArray[i];
  };
  this.uncoverAgent = function (i) {
    this.coveredAgentArray[i] = false;
  };
  this.coverAllAgents = function () {
    for (var i = 0; i < this.coveredAgentArray.length; ++i) {
      this.coveredAgentArray[i] = true;
    }
  };
  this.uncoverAllAgents = function () {
    for (var i = 0; i < this.coveredAgentArray.length; ++i) {
      this.coveredAgentArray[i] = false;
    }
  };

  this.stepTime = function () {
    this.time += this.timeStep
  }

  this.agentReachedGoal = function (i) {
    return RVOMath.absSq(this.goals[i].minus(this.getAgentPosition(i))) < RVOMath.RVO_EPSILON;
  };

  this.reachedGoal = function () {
    // return true if each agent is at its goal
    for (var i = 0; i < this.getNumAgents(); ++i) {
      if (! this.agentReachedGoal(i)) {
        return false;
      }
    }
    return true;
  };

  this.shouldDrawGoals = function () {
    return false;
  };

  this.shouldDrawTextAndTarget = function () {
    //return true;
    return this.isPaused;
  };

  this.addGoals = function (goals) {
    this.goals = goals;
  };

  this.getGoal = function (goalNo) {
    return this.goals[goalNo];
  };

  this.getClickedAgentIndex = function (x, y) {
    var closestAgentIndex = -1;
    var closestAgentDistance = Infinity;
    for (var i = 0; i < this.agents.length; ++i) {
      agentPos = this.agents[i].position;
      agentDistance = RVOMath.distance(agentPos.x, agentPos.y, x, y);
      if (agentDistance < closestAgentDistance) {
        // TODO: if the agent has already been clicked, continue
        closestAgentIndex = i;
        closestAgentDistance = agentDistance;
      }
    }
    if (closestAgentDistance < 40) {
      //this.targetAgentIndex = closestAgentIndex; // temporary
      return closestAgentIndex;
    } else {
      return -1;
    }
  };

  this.isListeningForClicks = function () { 
    // TODO
    return true;
  };

  this.addObstacle = function (/** IList<Vector2> */ vertices) {
    if (vertices.length < 2) {
      return -1;
    }

    var obstacleNo = this.obstacles.length;

    for (var i = 0; i < vertices.length; ++i) {
      var obstacle = new Obstacle();
      obstacle.point = vertices[i];
      if (i != 0) {
        obstacle.prevObstacle = this.obstacles[this.obstacles.length - 1];
        obstacle.prevObstacle.nextObstacle = obstacle;
      }
      if (i == vertices.length - 1) {
        obstacle.nextObstacle = this.obstacles[obstacleNo];
        obstacle.nextObstacle.prevObstacle = obstacle;
      }
      obstacle.unitDir = RVOMath.normalize(
        vertices[i == vertices.length - 1 ? 0 : i + 1].minus(vertices[i])
      );

      if (vertices.length == 2) {
        obstacle.isConvex = true;
      } else {
        obstacle.isConvex =
          RVOMath.leftOf(
            vertices[i == 0 ? vertices.length - 1 : i - 1],
            vertices[i],
            vertices[i == vertices.length - 1 ? 0 : i + 1]
          ) >= 0;
      }

      obstacle.id = this.obstacles.length;

      this.obstacles.push(obstacle);
    }

    return obstacleNo;
  };

  this.processObstacles = function () {
    this.kdTree.buildObstacleTree();
  };

  var queryVisibility = function (
    /** Vector2 */ point1,
    /** Vector2 */ point2,
    /** float */ radius
  ) {
    return this.kdTree.queryVisibility(point1, point2, radius);
  };

  this.getObstacles = function () {
    return this.obstacles;
  };
}
