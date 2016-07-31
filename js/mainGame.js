// Highest level class
var Game = React.createClass({
  getInitialState: function() {
    return {
      player: {},
      currentScreen: IntroScreen //the starting screen
    };
  },
  //only rendering another screen, passing self and any extra properties
  render: function() {
    var props = {
      game: this,
      player: this.state.player,
      extraProps: this.state.extraProps
    };
    return (
      React.createElement(this.state.currentScreen, props)
    );
  },
  //sets the current screen.  Props is optional, if additional properties are needed
  setScreen: function(screen, props) {
    if(props){
      this.setState({extraProps: props});
    } else {
      this.setState({extraProps: null});
    }
    this.setState({currentScreen: screen});
  },
  newPlayer: function(options){
    this.setState({player: new Player(options)});
  }
});

// First screen displayed
var IntroScreen = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Welcome!</h1>
        <br />
        <p>The tournament is about to begin!</p>
        <ScreenButton game={this.props.game} screen={HubScreen} text="Continue" />
      </div>
    );
  },
  componentWillMount: function() {
    this.props.game.newPlayer(characters["peasant"]);
  }
});

// Main hub area
var HubScreen = React.createClass({
  render: function() {
    var trainingProps = {training: true};
    var fightProps = {training: false};
    return (
      <div>
        <h1>Hub World:</h1>
        <ScreenButton game={this.props.game} screen={UpgradeScreen} text="Upgrade" />
        <ScreenButton game={this.props.game} screen={FightScreen} extraProps={trainingProps} text="Train" />
        <ScreenButton game={this.props.game} screen={FightScreen} extraProps={fightProps} text="Fight" />
        <ScreenButton game={this.props.game} screen={InnScreen} text="Inn" />
      </div>
    );
  }
});

//screen where upgrades are purchased
var UpgradeScreen = React.createClass({
  render: function() {
    return (
      <div>
      <h1>Upgrade!</h1>
      <ScreenButton game={this.props.game} screen={HubScreen} text="Back" />
      </div>
    );
  }
});

//screen where all the fights happen
var FightScreen = React.createClass({
  getInitialState: function() {
    var enemy;
    //if we're just training
    if(this.props.extraProps.training){
      enemy = new Enemy(arrayRandom(trainingEnemies));
    } else { //if we're trying to progress the story
      enemy = new Enemy(bosses[this.props.player.currentBoss]);
    }
    return {
      training: this.props.extraProps.training,
      currentEnemy: enemy,
      statusText: enemy.initialText,
      status: "fighting"
    };
  },
  render: function() {
    var title = this.state.training ? "Train" : "Fight";

    var buttons = [];
    var key = 0;

    if(this.state.status === "fighting"){
      buttons.push(<ActionButton action={this.attack} text="Attack" key={key++} />);
      buttons.push(<ScreenButton game={this.props.game} screen={HubScreen} text="Run" key={key++} />);
    } else if(this.state.status === "won") {
      buttons.push(<ScreenButton game={this.props.game} screen={WinScreen} text="Collect your winnings" extraProps={{boss: !this.props.extraProps.training}} key={key++} />);
    }

    return (
      <div>
      <h1>{title}!</h1>
      <HealthBar current={this.props.player.currentHealth} max={this.props.player.maxHealth} name={this.props.player.name} style={{width: "30%", display: "inline-block"}} />
      <HealthBar current={this.state.currentEnemy.currentHealth} max={this.state.currentEnemy.maxHealth} name={this.state.currentEnemy.name} style={{width: "30%", float: "right"}} />
      <p>{this.state.statusText}</p>
      {buttons}
      </div>
    );
  },
  attack: function() {
    var damage = numBetween(this.props.player.minAttack, this.props.player.maxAttack);

    this.setState({
      statusText: this.props.player.name + " attacks for " + damage + " damage! \n" +
        this.state.currentEnemy.name + " hits back for " + this.state.currentEnemy.attack + " damage!"
    });

    this.props.player.currentHealth = takeDamage(this.props.player.currentHealth, this.state.currentEnemy.attack);
    this.state.currentEnemy.currentHealth = takeDamage(this.state.currentEnemy.currentHealth, damage);

    //check for player lose
    if(this.props.player.currentHealth <= 0) {
      this.props.game.setScreen(LoseScreen);
    } else if(this.state.currentEnemy.currentHealth <= 0) { //check for player win
        this.setState({
          statusText: "The enemy " + this.state.currentEnemy.name + " is dead!",
          status: "won"
        });
    }
  }
});

var WinScreen = React.createClass({
  getInitialState: function() {
    return {
      currentMessage: ""
    }
  },
  render: function() {
    return (
      <div>
        <h1>{this.state.currentMessage}</h1>
        <h3>Current money: {this.props.player.money}</h3>
        <ScreenButton game={this.props.game} screen={HubScreen} text="Return to the hub!" />
      </div>
    );
  },
  componentWillMount: function() {
    this.props.player.money += 10;
    if(this.props.extraProps.boss){
      this.props.player.currentBoss++;
      if(this.props.player.currentBoss === bosses.length){
        this.setState({currentMessage: "YOU BEAT THE WHOLE GAME!  'grats, brah."});
      }
    }
  }
});

var LoseScreen = React.createClass({
  render: function() {
    return (
      <div>
        <h1>YOU LOSE!</h1>
        <ScreenButton game={this.props.game} screen={IntroScreen} text="Play Again" />
      </div>
    );
  }
});

var InnScreen = React.createClass({
  getInitialState: function() {
    return {
      cost: this.props.player.maxHealth - this.props.player.currentHealth
    };
  },
  render: function() {
    //apostrophes break the syntax highlighting
    var message;
    var buttons = [];

    //if you need to heal
    if(this.state.cost !== 0){
      //prompt the user
      message = "It'll run ya " + this.state.cost + " gold for enough nights to heal up those wounds.";

      //if you can afford it
      if(this.props.player.money >= this.state.cost){
        //button with cost is visible
        buttons.push(<ActionButton action={this.pay} text={"Pay " + this.state.cost} />);
      } else {
        //if you can't afford it, inform user
        message += "\nIt doesn't look like you can affort it.";
      }
    } else {
        //user is healthy
        message = "You're looking mighty healthy.  Now, scram!";
    }

    buttons.push(<ScreenButton game={this.props.game} screen={HubScreen} text="Return to the hub" />);

    return (
      <div>
        <h3>{message}</h3>
        {buttons}
      </div>
    );
  },
  pay: function() {
    //subtract cost, heal player, and update Inn screen
    this.props.player.money -= this.state.cost;
    this.props.player.currentHealth = this.props.player.maxHealth;
    this.setState({cost: 0});
  }
})

var ActionButton = React.createClass({
  render: function() {
    return (
      <div style={{textAlign: "center"}}>
        <button className="btn btn-primary" onClick={this.props.action}>{this.props.text}</button>
      </div>
    );
  }
});

var ScreenButton = React.createClass({
  render: function() {
    return (
      <div style={{textAlign: "center"}}>
      <button className="btn btn-primary" onClick={this.props.game.setScreen.bind(this.props.game, this.props.screen, this.props.extraProps)}>{this.props.text}</button>
      <br />
      </div>
    );
  }
});

var HealthBar = React.createClass({
  render: function() {
    var healthPercentage = this.props.current * 100 / this.props.max;
    var barColor = "";

    if(healthPercentage < 0) {
      healthPercentage = 0;
    }

    if(healthPercentage > 80) {
      barColor = "progress-bar-success";
    } else if(healthPercentage > 40) {
      barColor = "progress-bar-info";
    } else if(healthPercentage > 15){
      barColor = "progress-bar-warning";
    } else {
      barColor = "progress-bar-danger";
    }

    barColor += " progress-bar";

    return (
      <div style={this.props.style}>
        <div className="progress">
          <div className={barColor} style={{ width: healthPercentage + "%" }}>
          {this.props.current}
          </div>
        </div>
        <h3 style={{ textAlign: "center" }}>{this.props.name}</h3>
      </div>
    );
  }
});

ReactDOM.render(
  <Game />,
  document.getElementById('content')
);
