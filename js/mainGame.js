var DropdownButton = ReactBootstrap.DropdownButton;
var SplitButton = ReactBootstrap.SplitButton;
var MenuItem = ReactBootstrap.MenuItem;

/**
* Turns an array into domelements.  Null value for line break
*
* @param {Array} array A list of strings or null values representing words to display
* @param {String} tagType The type of tag to be rendered
* @param {Object} props Properties to be applied to each element of the array
* @return {Array} Array of dom elements ready to be displayed
**/
var arrToDOM = function(array, tagType, props){
  var domArray = [];
  $.each(array, function(idx, val){
    if(val){
      var currentProps = $.extend({key: idx}, props);
      domArray.push(React.createElement(tagType, currentProps, val));
    } else {
      domArray.push(<br key={idx} />);
    }
  });

  return domArray;
};

// Highest level class
var Game = React.createClass({
  getInitialState: function() {
    return {
      player: {},
      currentScreen: IntroScreen, //the starting screen
      displayHUD: false,
      availableClasses: {beggar: true}
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
  newPlayer: function(options, name){
    if(name){
      options.name = name;
    }
    this.setState({player: new Player(options)});
  }
});

var MainPanel = React.createClass({
  render: function() {
    return (
      React.createElement(this.props.currentScreen, this.props.props)
    )
  }
});

// First screen displayed
var IntroScreen = React.createClass({
  getInitialState: function(){
    return {
      name: "",
      class: "",
      ghost: "none"
    }
  },
  render: function() {
    //text for syntax highlighting purposes
    var text1 = "I, ";
    var text2= ", of class ";
    //available class dropdown
    var dropdown = [];
    $.each(Object.keys(this.props.game.state.availableClasses), function(idx, val){
      dropdown.push(<MenuItem eventKey={val} key={idx} onSelect={this.classChange}>{val.charAt(0).toUpperCase() + val.slice(1)}</MenuItem>)
    }.bind(this));
    var classDisplay = this.state.class ? this.state.class.charAt(0).toUpperCase() + this.state.class.slice(1) : "Select a Class";
    //common style to use for some DOM elements here
    var fl = {float: "left"};
    //must have a valid name and class to begin
    var validated = this.state.name.length && this.state.class.length ? "inline-block" : "none";
    return (
      <div>
        <h1>Tournament Waiver:</h1>
        <br />
        <h3><span style={fl}>{text1}</span><span className="col-sm-1"><input onInput={this.updateName} className="form-control" /></span>
        <span style={$.extend({marginRight: "15px"},fl)}>{text2}</span>
        <DropdownButton bsStyle="warning" title={classDisplay}>
          {dropdown}
        </DropdownButton>
        <br /><br />{waiverText1}<span style={{"text-decoration": this.state.ghost}} onClick={this.soulClick}>and my soul upon death</span>
        {waiverText2}</h3><em style={{'font-size':'3em'}}>{this.state.name}</em> <br/> <br/>
        <div style={{display: validated}}>
        <ActionButton action={this.confirm} text="Proceed" />
        </div>
      </div>
    );
  },
  soulClick: function() {
    this.setState({ghost: "line-through"});
    //if ghost hasn't been unlocked yet, set flag to unlock on next death
    if(!this.props.game.state.availableClasses.ghost){
      this.props.game.setState({ghost: true});
    }
  },
  classChange: function(evt) {
    this.setState({class: evt});
  },
  confirm: function() {
    this.props.game.newPlayer($.extend(true, {class: this.state.class}, characters[this.state.class]), this.state.name);
    this.props.game.setScreen.call(this.props.game, HubScreen);
  },
  updateName: function(evt){
    this.setState({name: evt.target.value});
  },
  componentWillMount: function() {
    this.props.game.setState({displayHUD: false});
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
      <ScreenButton game={this.props.game} screen={FightScreen} extraProps={trainingProps} text="Explore" key={2} />,
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
      validItems(this.props.player.specials).forEach(function(special){
        buttons.push(<ActionButton action={self.playerAction.bind(self, special.performSpecial.bind(self))} text={special.name} classes="btn-info" key={key++} />);
      });
      buttons.push(<ScreenButton game={this.props.game} screen={HubScreen} text="Run" classes="btn-danger" key={key++} />);
    } else if(this.state.status === "won") {
      buttons.push(<ScreenButton game={this.props.game} screen={WinScreen} text="Collect your winnings"
        extraProps={{reward: this.state.currentEnemy.reward, enemy: this.state.currentEnemy}} key={key++} />);
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
    //player performs action() which enemyAction uses
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
      currentMessage: "You win!"
    }
  },
  render: function() {
    return (
      <div style={{textAlign: "center"}}>
        <h3>{this.state.currentMessage}</h3>
        <h3>{this.state.subMessage}</h3>
        <ScreenButton game={this.props.game} screen={HubScreen} text="Return to the hub!" />
      </div>
    );
  },
  componentDidMount: function() {
    //grant player reward
    var reward = this.props.extraProps.reward || basicReward;
    reward.call(this);
    //end game check
    if(this.props.player.currentBoss === bosses.length){
      this.props.game.setScreen(GameEndScreen)
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
  getInitialState: function(){
    var message;
    if (this.props.game.state.ghost) {
      message = "New class: GHOST unlocked!  Now go scare some bad guys!";
      var availableClasses = this.props.game.state.availableClasses;
      availableClasses.ghost = true;
      this.props.game.setState({ghost: false, availableClasses: availableClasses});
    } else {
      message = "Sorry you died, brah.  Why not try again?";
    }
    return { message: message };
  },
  render: function() {
    return (
      <div>
        <h1>{this.state.message}</h1>
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
