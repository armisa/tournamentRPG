// Highest level class
var Game = React.createClass({
  getInitialState: function() {
    return {
      player: {},
      currentScreen: IntroScreen, //the starting screen
      displayHUD: false
    };
  },
  //only rendering another screen, passing self and any extra properties
  render: function() {
    var props = {
      game: this,
      player: this.state.player,
      extraProps: this.state.extraProps
    };
    var hud = [];
    var key = 0;
    if(this.state.displayHUD){
      hud.push(<h4 style={{float: "left", margin: "25px"}} key={key++}>{this.state.player.name}: {this.state.player.currentHealth}/{this.state.player.maxHealth}</h4>);
      hud.push(<h4 style={{float: "right", margin: "25px"}} key={key++}>Money: {this.state.player.money}</h4>);
      hud.push(<br key={key++} />);
      hud.push(<br key={key++} />);
    }
    return (
      <div>
      {hud}
      <div style={{margin: '40px'}}>
        <MainPanel currentScreen={this.state.currentScreen} props={props} />
      </div>
      </div>
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

var MainPanel = React.createClass({
  render: function() {
    return (
      React.createElement(this.props.currentScreen, this.props.props)
    )
  }
})

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
    this.props.game.setState({displayHUD: false});
    this.props.game.newPlayer(characters["beggar"]);
  },
  componentWillUnmount: function() {
    this.props.game.setState({displayHUD: true});
  }
});

// Main hub area
var HubScreen = React.createClass({
  render: function() {
    var trainingProps = {training: true};
    var fightProps = {training: false};
    var buttons = [
      <ScreenButton game={this.props.game} screen={UpgradeScreen} text="Upgrade" key={1} classes="btn-success" />,
      <ScreenButton game={this.props.game} screen={FightScreen} extraProps={trainingProps} text="Train" key={2} />,
      <ScreenButton game={this.props.game} screen={FightScreen} extraProps={fightProps} text="Boss" key={3} classes="btn-danger" />,
      <ScreenButton game={this.props.game} screen={InnScreen} text="Inn" key={4} classes="btn-info" />
    ];
    return (
      <div>
        <h1>Hub World:</h1>
        <ButtonMenu buttons={buttons} />
      </div>
    );
  }
});

//screen where upgrades are purchased
var UpgradeScreen = React.createClass({
  getInitialState: function() {
    return {
      message: "Welcome, my pretty!  I have potions of all sorts to make you stronger!"
    }
  },
  render: function() {
    var buttons = [
      <ActionButton action={this.buy.bind(this,"maxHealth")} text={"Max Health Potion! Cost: " + shopPrices["maxHealth"]} key={1} classes="btn-info" />,
      <ActionButton action={this.buy.bind(this,"maxAttack")} text={"Max Attack Potion! Cost: " + shopPrices["maxAttack"]} key={2} classes="btn-info" />,
      <ActionButton action={this.buy.bind(this,"minAttack")} text={"Min Attack Potion! Cost: " + shopPrices["minAttack"]} key={3} classes="btn-info" />,
      <ActionButton action={this.buy.bind(this,"defense")} text={"Defense Potion! Cost: " + shopPrices["defense"]} key={4} classes="btn-info" />,
      <ScreenButton game={this.props.game} screen={HubScreen} text="Back" key={5} />
    ];
    return (
      <div>
      <h1>Upgrade!</h1>
      <h3>{this.state.message}</h3>
      <br />
        <ButtonMenu buttons={buttons} />
      </div>
    );
  },
  buy: function(stat) {
    if(this.props.player.money >= shopPrices[stat]){
      this.setState({message: "Thank you for your patronage.  I hope you don't mind if I snipped some of your hair."});
      this.props.player[stat]++;
      this.props.player.money -= shopPrices[stat];
      this.props.game.forceUpdate();
    } else {
      this.setState({message: "You don't quite have enough for that, my pretty.  Perhaps if you sold me some of your toes..."});
    }
  }
});

//screen where all the fights happen
var FightScreen = React.createClass({
  componentWillMount: function() {
    this.props.game.setState({displayHUD: false});
  },
  componentWillUnmount: function() {
    this.props.game.setState({displayHUD: true});
  },
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
      buttons.push(<ActionButton action={this.playerAction.bind(this, this.attack)} text="Attack" key={key++} />);
      //add specials
      var self = this;
      validSpecials(this.props.player).forEach(function(special){
        buttons.push(<ActionButton action={self.playerAction.bind(self, special.performSpecial.bind(self))} text={special.name} classes="btn-info" key={key++} />);
      });
      buttons.push(<ScreenButton game={this.props.game} screen={HubScreen} text="Run" classes="btn-danger" key={key++} />);
    } else if(this.state.status === "won") {
      buttons.push(<ScreenButton game={this.props.game} screen={WinScreen} text="Collect your winnings" extraProps={{boss: !this.props.extraProps.training}} key={key++} />);
    } else if(this.state.status === "lost") {
      buttons.push(<ScreenButton game={this.props.game} screen={LoseScreen} text="Be dead X_X" key={key++} />);
    }

    return (
      <div>
      <h1>{title}!</h1>
      <HealthBar current={this.props.player.currentHealth} max={this.props.player.maxHealth} name={this.props.player.name} style={{width: "30%", display: "inline-block"}} />
      <HealthBar current={this.state.currentEnemy.currentHealth} max={this.state.currentEnemy.maxHealth} name={this.state.currentEnemy.name} style={{width: "30%", float: "right"}} />
      <h3 style={{textAlign: "center"}}>{this.state.statusText}</h3>
      <ButtonMenu buttons={buttons} />
      </div>
    );
  },

  attack: function(player, enemy) {
    //determine damage
    var damage = numBetween(player.minAttack, player.maxAttack);

    //calculate enemy damage and apply
    damage <= this.state.currentEnemy.currentHealth ? this.state.currentEnemy.currentHealth -= damage : this.state.currentEnemy.currentHealth = 0;

    //return text describing situation
    return this.props.player.name + " attacks for " + damage + " damage! \n";
  },
  //player phase
  playerAction: function(action){
    this.enemyAction(action(this.props.player, this.state.currentEnemy));
  },
  //enemy phase
  enemyAction: function(text) {
    //calculate enemy damage
    var incomingDamage = calculateDamage(this.state.currentEnemy.attack, this.props.player.defense);

    //add on to the current text to inform the user
    text += "\n " + this.state.currentEnemy.name + " hits back for " + incomingDamage + " damage!";

    //calculate and apply damage
    incomingDamage <= this.props.player.currentHealth ? this.props.player.currentHealth -= incomingDamage : this.props.player.currentHealth = 0;

    //checkstate to see if anyone has died
    this.checkState(text);
  },
  //see if the battle is over
  checkState: function(text) {
    //check for player lose
    if(this.props.player.currentHealth <= 0) {
      this.setState({
        statusText: "You died!",
        status: "lost"
      });
    } else if(this.state.currentEnemy.currentHealth <= 0) { //check for player win
        this.setState({
          statusText: "The enemy " + this.state.currentEnemy.name + " is dead!",
          status: "won"
        });
    } else { //if nobody died
      this.setState({
        statusText: text
      })
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
    var message = "You won and got 10 moneys!";
    return (
      <div>
        <h1>{this.state.currentMessage}</h1>
        <h3>{message}</h3>
        <ScreenButton game={this.props.game} screen={HubScreen} text="Return to the hub!" />
      </div>
    );
  },
  componentWillMount: function() {
    this.props.player.money += 10;
    if(this.props.extraProps.boss){
      this.props.player.currentBoss++;
      if(this.props.player.currentBoss === bosses.length){
        this.props.game.setScreen(GameEndScreen)
      }
    }
  }
});

var GameEndScreen = React.createClass({
  render: function() {
    var key = 0;

    var message = ["You beat the entire game!  You're a champion!", <br key={key++} />, <br key={key++} />, "Credits:", <br key={key++} />, "Everything: Aaron Isaacman"];
    return (
      <div>
      <h1>{message}</h1>
      <ScreenButton game={this.props.game} screen={IntroScreen} text="Why not play again?" />
      </div>
    );
  }
});

var LoseScreen = React.createClass({
  render: function() {
    var message = "Sorry you died, brah.  Why not try again?"; //for syntax recognition purposes
    return (
      <div>
        <h1>{message}</h1>
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
    var message = [];
    var buttons = [];
    var key = 0;

    //if you need to heal
    if(this.state.cost !== 0){
      //prompt the user
      message.push("It'll run ya " + this.state.cost + " gold for enough nights to heal up those wounds.");

      //if you can afford it
      if(this.props.player.money >= this.state.cost){
        //button with cost is visible
        buttons.push(<ActionButton action={this.pay} text={"Pay " + this.state.cost} key={key++}/>);
      } else {
        //if you can't afford it, inform user
        message.push(<br key={key++} />);
        message.push("It doesn't look like you can afford it.");
      }
    } else {
        //user is healthy
        message.push("You're looking mighty healthy.  Now, scram!");
    }

    buttons.push(<ScreenButton game={this.props.game} screen={HubScreen} text="Return to the hub" key={key++} />);

    return (
      <div>
        <h3>{message}</h3>
        <ButtonMenu buttons={buttons} />
      </div>
    );
  },
  pay: function() {
    //subtract cost, heal player, and update Inn screen
    this.props.player.money -= this.state.cost;
    this.props.player.currentHealth = this.props.player.maxHealth;
    this.setState({cost: 0});
    this.props.game.forceUpdate();
  }
});

var ButtonMenu = React.createClass({
  render: function() {
    return (
      <div style={{textAlign: "center"}}>
        <div className="btn-group-vertical">
          {this.props.buttons}
        </div>
      </div>
    );
  }
});

var ActionButton = React.createClass({
  render: function() {
    var classes = "btn ";
    classes += this.props.classes || "btn-primary";
    return (
        <button className={classes} onClick={this.props.action}>{this.props.text}</button>
    );
  }
});

var ScreenButton = React.createClass({
  render: function() {
    var classes = "btn ";
    classes += this.props.classes || "btn-primary";
    return (
      <button className={classes} onClick={this.props.game.setScreen.bind(this.props.game, this.props.screen, this.props.extraProps)}>{this.props.text}</button>
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
