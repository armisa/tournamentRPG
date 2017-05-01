var DropdownButton = ReactBootstrap.DropdownButton;
var SplitButton = ReactBootstrap.SplitButton;
var MenuItem = ReactBootstrap.MenuItem;
var Tooltip = ReactBootstrap.Tooltip;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;

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

  //force array type
  if(!Array.isArray(array)){
    array = [array];
  }
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
      availableClasses: {cheat: true, beggar: true}
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
  },
  setPlayerStats: function(stats) {
    this.setState({player: $.extend(this.state.player, stats)});
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
    if(evt.target.value.toUpperCase() === darkdeathName.toUpperCase()){
      var availableClasses = this.props.game.state.availableClasses;
      availableClasses.darkdeathLord = true;
      this.props.game.setState({availableClasses: availableClasses});
    }
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
    var exploringProps = {exploring: true};
    var fightProps = {exploring: false};
    var buttons = [];

      $.each(this.props.player.currentAreas.Town.available, function(idx, obj){
        var areaInfo = areaLookup[obj];
        buttons.push(<ScreenButton game={this.props.game} screen={areaInfo.screen} text={obj} key={idx} classes={areaInfo.classes} />);
      }.bind(this));

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
      message: "Welcome, my pretty!  I have potions of all sorts to make you stronger!",
      prices: {
        maxHealth: this.determinePrice("maxHealth"),
        maxAttack: this.determinePrice("maxAttack"),
        minAttack: this.determinePrice("minAttack"),
        defense: this.determinePrice("defense")
      }
    }
  },
  render: function() {
    var buttons = [
      <ActionButton action={this.buy.bind(this,"maxHealth")} text={"Max Health Potion! Cost: " + this.state.prices["maxHealth"]} key={1} classes="btn-info" />,
      <ActionButton action={this.buy.bind(this,"maxAttack")} text={"Max Attack Potion! Cost: " + this.state.prices["maxAttack"]} key={2} classes="btn-info" />,
      <ActionButton action={this.buy.bind(this,"minAttack")} text={"Min Attack Potion! Cost: " + this.state.prices["minAttack"]} key={3} classes="btn-info" />,
      <ActionButton action={this.buy.bind(this,"defense")} text={"Defense Potion! Cost: " + this.state.prices["defense"]} key={4} classes="btn-info" />,
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
    if(this.props.player.money >= this.state.prices[stat]){
      var newStats = {money: this.props.player.money - this.state.prices[stat]};
      newStats[stat] = this.props.player[stat] + 1;
      this.props.game.setPlayerStats(newStats);
      var newPrices = $.extend({}, this.state.prices);
      newPrices[stat] = this.determinePrice(stat);
      this.setState({
        message: "Thank you for your patronage.  I hope you don't mind if I snipped some of your hair.",
        prices: newPrices
      });
    } else {
      this.setState({message: "You don't quite have enough for that, my pretty.  Perhaps if you sold me some of your toes..."});
    }
  },
  determinePrice: function(stat) {
    return shopPrices[stat].base + this.props.player[stat] * shopPrices[stat].growth;
  }
});

//Screen where the player chooses where to explore next
var ExploreScreen = React.createClass({
  render: function() {
    var key = 0; //react key

    var buttons = []; //button array

    $.each(this.props.player.currentAreas.Explore.available, function(idx, obj) {
      buttons.push(<ScreenButton game={this.props.game} screen={FightScreen} text={obj} extraProps={{exploring: true, area: obj}} classes={"btn-info"} key={key++} />);
    }.bind(this));

    buttons.push(<ScreenButton game={this.props.game} screen={HubScreen} text="Return to the hub" key={key++} />); //back buttons

    return (
      <div>
        <h1>
          Where would you like to explore?
        </h1>
        <ButtonMenu buttons={buttons} />
      </div>
    );
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
    var exploring = this.props.extraProps && this.props.extraProps.exploring;

    //if we're just exploring
    if(exploring){
      var enemyArray = exploringEnemies[this.props.extraProps.area] || exploringEnemies["Field"]; //default to field if area can't be found
      enemy = new Enemy(arrayRandom(enemyArray));
    } else { //if we're trying to progress the story
      enemy = new Enemy(bosses[this.props.player.currentBoss]);
    }

    var initialText = this.props.player.class === "darkdeathLord" && enemy.name === "Lord Dark Death" ? ["This is my challenger?  ...Pretty good looking..."] : [enemy.initialText];

    return {
      exploring: exploring,
      currentEnemy: enemy,
      statusText: initialText,
      status: "fighting"
    };
  },
  render: function() {
    var title = this.state.exploring ? "Explore" : "Fight";

    var buttons = [];
    var key = 0;

    //determine buttons available
    if(this.state.status === "fighting"){ //if the player is still fighting
      buttons.push(<ActionButton action={this.playerAction.bind(this, this.attack)} text="Attack" key={key++} />);
      //add specials
      var self = this;
      validItems(this.props.player.specials).forEach(function(special){
        buttons.push(<ActionButton action={self.playerAction.bind(self, special.performSpecial.bind(self))} text={special.name} tooltip={special.description} classes="btn-info" key={key++} />);
      });
      buttons.push(<ActionButton action={this.playerAction.bind(this, this.run)} text="Run" classes="btn-danger" key={key++} />);
    } else if(this.state.status === "won") { //if the player wins, make the WinScreen available
      var area = this.props.extraProps && this.props.extraProps.area ? this.props.extraProps.area : null;
      buttons.push(<ScreenButton game={this.props.game} screen={WinScreen} text="Collect your winnings"
        extraProps={{reward: this.state.currentEnemy.reward, enemy: this.state.currentEnemy, area: area}} key={key++} />);
    } else if(this.state.status === "lost") { //if the player loses, take them to the game over screen
      buttons.push(<ScreenButton game={this.props.game} screen={LoseScreen} text="Be dead X_X" key={key++} />);
    }

    var text = arrToDOM(this.state.statusText, "h3", {style: {textAlign: "center"}});

    if(this.state.exploring) {
      var areas = this.props.player.currentAreas[this.props.extraProps.area];
      if(areas && areas.order && areas.order[0]){
        var exploreProgress = (
          <HealthBar current={areas.progress} max={areas.order[0].search} name={"Exploration Progress:" + areas.progress + "/" + areas.order[0].search}
          striped={true} style={{width: "50%", position:"absolute", bottom:"16px", left:"0px", right:"0px", margin:"auto"}} />
        );
      }
    }

    return (
      <div>
        <div style={{margin: "auto"}} >
          <h1>{title}!</h1>
          <HealthBar current={this.props.player.currentHealth} max={this.props.player.maxHealth} name={this.props.player.name} style={{width: "30%", display: "inline-block"}} />
          <HealthBar current={this.state.currentEnemy.currentHealth} max={this.state.currentEnemy.maxHealth} name={this.state.currentEnemy.name} style={{width: "30%", float: "right"}} />
          <div style={{height: "150px"}}>
            {text}
          </div>
          <ButtonMenu buttons={buttons} />
        </div>
        {exploreProgress}
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
  enemyAction: function(playerResult) {
    if(typeof playerResult === "string"){
      playerResult = { text: [playerResult] };
    }

    if (playerResult.enemyAction && typeof playerResult.enemyAction === "function") {
      playerResult.enemyAction.call(this);
      return;
    }

    //calculate enemy damage
    var damage = numBetween(Math.ceil(this.state.currentEnemy.attack * .6), Math.ceil(this.state.currentEnemy.attack * 1.4)); //give some variety in potential damage
    var incomingDamage = calculateDamage(damage, this.props.player.defense);

    //add on to the current text to inform the user
    playerResult.text.push("\n " + this.state.currentEnemy.name + " hits back for " + incomingDamage + " damage!");

    //calculate and apply damage
    incomingDamage <= this.props.player.currentHealth ? this.props.player.currentHealth -= incomingDamage : this.props.player.currentHealth = 0;

    //checkstate to see if anyone has died
    this.checkState(playerResult.text);
  },

  /**
  * see if the battle is over
  *
  * @param {Array} text The default text if neither combatant has died
  */
  checkState: function(text) {
    if(typeof text === "string") {
      text = [text];
    }
    //check for player lose
    if(this.props.player.currentHealth <= 0) {
      text.push("You died!");
      this.setState({
        statusText: text,
        status: "lost"
      });
    } else if(this.state.currentEnemy.currentHealth <= 0) { //check for player win
        text.push("The enemy " + this.state.currentEnemy.name + " is dead!")
        this.setState({
          statusText: text,
          status: "won"
        });
    } else { //if nobody died
      this.setState({
        statusText: text
      })
    }
  },

  //runs if successful (uses chance to calculate chance of running)
  run: function(player, enemy) {
    var chance = player.runChance || 75;
    var attempt = numBetween(0, 100);

    //if attempt was successful
    if(attempt < chance) {
      return {
        text: ["You got away!"],
        enemyAction: function() {
          this.props.game.setScreen.call(this.props.game, HubScreen);
        }
      };
    } else {
      return "You couldn't get away!";
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
    var subMessage = arrToDOM(this.state.subMessage, "h3");
    return (
      <div style={{textAlign: "center"}}>
        <h3>{this.state.currentMessage}</h3>
        {subMessage ? subMessage : <br />}
        {this.props.extraProps.area !== null &&
          <div>
            <br />
            <ScreenButton game={this.props.game} screen={ExploreScreen} text="Explore somewhere else?" />
            <br />
            <h3 style={{ textAlign: "center" }}>Or...</h3>
          </div>
        }
        <ScreenButton game={this.props.game} screen={HubScreen} text="Return to the hub!" />
        {this.props.extraProps.area !== null &&
          <div>
            <h3 style={{ textAlign: "center" }}>OR...</h3>
            <ScreenButton game={this.props.game} screen={FightScreen} text={"Explore the " + this.props.extraProps.area + " some more!"}
            extraProps={{exploring: true, area: this.props.extraProps.area}} classes={"btn-success"} />
          </div>
        }
      </div>
    );
  },
  componentDidMount: function() {
    //grant player reward
    var reward = this.props.extraProps.reward || basicReward;
    reward.call(this, this.props.extraProps.area);
    //end game check
    if(this.props.player.currentBoss === bosses.length){
      this.props.game.setScreen(GameEndScreen)
    }
  }
});

var GameEndScreen = React.createClass({
  render: function() {
    var key = 0;

    var message = ["You beat the entire game!  You're a champion!", <br key={key++} />, <br key={key++} />, "Credits:", <br key={key++} />, "Literally everything: Aaron Isaacman"];
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
      cost: Math.ceil(this.props.player.maxHealth * .75),
      oneNight: 3
    };
  },
  render: function() {
    //apostrophes break the syntax highlighting
    var message = [];
    var buttons = [];
    var key = 0;

    //if you need to heal
    if(this.props.player.currentHealth !== this.props.player.maxHealth){
      //prompt the user
      message.push("It'll run ya " + this.state.cost + " gold for enough nights to heal up those wounds.");
      message.push(<br key={key++} />);
      message.push("'Course, you can always spend 1 night for " + this.state.oneNight + " gold...'");

      //if you can afford it
      if(this.props.player.money >= this.state.cost){
        //button with cost is visible
        buttons.push(<ActionButton action={this.pay.bind(this, this.state.cost, this.props.player.maxHealth)} text={"Pay " + this.state.cost + " for full health"} key={key++}/>);
      }
      if(this.props.player.money >= this.state.oneNight){
        buttons.push(<ActionButton action={this.pay.bind(this, this.state.oneNight, 1)} text={"Pay " + this.state.oneNight + " for one night"} key={key++} />);
      } else {
        //if you can't afford it, inform user
        message.push(<br key={key++} />);
        message.push("It doesn't look like you can afford ta stay here.");
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
  pay: function(cost, heal) {
    //subtract cost, heal player, and update Inn screen
    var newHealth = this.props.player.currentHealth + heal;
    newHealth = newHealth > this.props.player.maxHealth ? this.props.player.maxHealth : newHealth;
    var newStats = {
      money: this.props.player.money - cost,
      currentHealth: newHealth
    };
    this.props.game.setPlayerStats(newStats);
  }
});

var StatusScreen = React.createClass({
  render: function() {

    var stats = [
      "Health: " + this.props.player.currentHealth + "/" + this.props.player.maxHealth,
      "Min Attack: " + this.props.player.minAttack,
      "Max Attack: " + this.props.player.maxAttack,
      "Defense: " + this.props.player.defense,
      "Specials:"
    ];

    var statsDOM = arrToDOM(stats, "h3");
    var specialsDOM = [];
    validItems(this.props.player.specials).forEach(function(special){
      specialsDOM.push(
        <ActionButton classes="btn-success" tooltip={special.description} text={special.name} action={function(){}} />
      );
      specialsDOM.push(<br />);
      specialsDOM.push(<br />);
    });

    return (
      <div style={{textAlign: "center"}}>
        {statsDOM}
        {specialsDOM}
        <br />
        <ScreenButton game={this.props.game} screen={HubScreen} text="Go Back" key={0} />
      </div>
    );
  }
});

var MermaidScreen = React.createClass({
  render: function() {
    return (
      <div>
        <h3>
          You enter the grotto to find a mermaid!
        </h3>
        <h3>
          She slowly swims up to your feet, rests her arms over the rock, and looks at you with a wry smile before speaking these words:
        </h3>
        <h3>
          "I don't do anything in this version of the game," she says. Speak once more, o beautious angel!
        </h3>
        <h3>
          "Come back when I've been implemented, I'll be a secret class."
        </h3>
        <h3>
          And with a wink and a splash, she swims off.
        </h3>
        <ScreenButton game={this.props.game} screen={HubScreen} text="Go Back" />
      </div>
    );
  }
})


/** COMPONENTS **/

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
    if(this.props.tooltip){
      const tooltip = (
        <Tooltip>{this.props.tooltip}</Tooltip>
      );
      return (
        <OverlayTrigger placement="right" overlay={tooltip}>
          <button className={classes} onClick={this.props.action} >{this.props.text}</button>
        </OverlayTrigger>
      );
    } else {
      return (
          <button className={classes} onClick={this.props.action} >{this.props.text}</button>
      );
    }
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
    if(this.props.striped){
      barColor += " progress-bar-striped";
    }

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

var areaLookup = {
  "Status": {
    screen: StatusScreen,
    classes: "btn-info"
  },
  "Explore": {
    screen: ExploreScreen,
    classes: "btn-primary"
  },
  "Tournament Fight": {
    screen: FightScreen,
    classes: "btn-danger"
  },
  "Upgrade Hut": {
    screen: UpgradeScreen,
    classes: "btn-success"
  },
  "Inn": {
    screen: InnScreen,
    classes: "btn-success"
  },
  "Mermaid's Grotto": {
    screen: MermaidScreen,
    classes: "btn-info"
  }
};
