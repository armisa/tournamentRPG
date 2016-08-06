/** Functions **/

/**
 * Returns a number between the first and second parameter.
 *
 * @param {Number} num1 The lower bound
 * @param {Number} num2 The upper bound
 * @return {Number} A number between the first two values, plus the base
 **/
var numBetween = function(num1, num2) {
  //0 is falsy, so whether it's undefined or 0, it'll come out as 0
  if (!base) {
    base = 0;
  }

  var difference = 1 + Math.abs(num1 - num2);
  var base = Math.min(num1, num2);

  return Math.floor(Math.random() * difference) + base;
};

/**
 * returns a random value from an array of any size
 *
 * @param {Array} array The array from which a random element is to be chosen
 * @return {Object} The random value selected from the array
 **/
var arrayRandom = function(array) {
  return array[Math.floor(Math.random() * array.length)];
};

/**
* Calculates the final damage given some damage and defense.
* Useful for its minimum value of 1 and defaulted defense value
*
* @param {Number} damage The amount of damage potentially taken
* @param {Number} defense The amount of defense to be subtracted
* @return {Number} A minimum of 1, value of damage - defense
**/
var calculateDamage = function(damage, defense){
  if (!defense){
    defense = 0;
  }
  return Math.max(damage - defense, 1);
};

/**
* Finds only the valid items in a map and returns those in an array
*
* @param {Object} itemMap A map comtaining some valid/invalid items
*   @param {Boolean} available Whether the item should be in the return array
* @return {Array} An array of values from only the available items
**/
var validItems = function(itemMap){
  if(!itemMap){
    return [];
  }

  return $.map(itemMap, function(value, key){
    if(value.available){
      return value;
    } else {
      return null;
    }
  });
};


/** Characters **/

var nameArray = [
  "Aaron",
  "Barry",
  "Chris",
  "David",
  "Edward",
  "Frank",
  "Gary",
  "Henry",
  "Ivan",
  "James"
];

var specials = {
  Beg: {
    performSpecial: function(player, enemy) {
      var mon = Math.floor(Math.random() * 4) + 2;
      player.money += mon;
      return "You beg, and the " + enemy.name + " gives you " + mon + " moneys.";
    },
    description: "Begs the enemey for some spare change"
  },
  Fireball: {
    performSpecial: function(player, enemy) {
      var damage = 7
      damage <= this.state.currentEnemy.currentHealth ? this.state.currentEnemy.currentHealth -= damage : this.state.currentEnemy.currentHealth = 0;
      return "You throw a fireball, dealing " + damage + " damage!";
    },
    description: "Deals a flat " + 7 + " damage"
  },
  "Coin Toss": {
    performSpecial: function(player, enemy) {
      var damage = Math.floor(Math.random()*2)*20;
      damage <= this.state.currentEnemy.currentHealth ? this.state.currentEnemy.currentHealth -= damage : this.state.currentEnemy.currentHealth = 0;
      //if we hit
      if(damage){
        return "You flipped heads and decided to attack for " + damage + " damage!";
      } else {
        return "You flipped tails and decided to just stand there and get beat up."
      }
    },
    description: "Deals either " + 20 + " damage, or none."
  },
  Osmose: {
    performSpecial: function(player, enemy) {
      //determine damage and healing
      var damage = Math.floor(Math.random()*3) + 2;
      var healing = Math.floor(Math.random()*2) + 1;

      //apply values
      damage <= enemy.currentHealth ? enemy.currentHealth -= damage : enemy.currentHealth = 0;
      player.currentHealth + healing > player.maxHealth ? player.currentHealth = player.maxHealth : player.currentHealth += healing;

      return "You sucked away " + damage + " life from the enemy " + enemy.name + ", and gained " + healing + " health!";
    },
    description: "Deals a small amount of damage and heals a small amount of health"
  }
};

var Special = function(name, available){
  this.name = name;
  this.performSpecial = specials[name].performSpecial;
  this.description = specials[name].description;
  this.available = available || false;
};

var characters = {
  beggar: {
    name: arrayRandom(nameArray),
    maxHealth: 25,
    currentHealth: 25,
    minAttack: 5,
    maxAttack: 7,
    defense: 0,
    money: 10,
    specials: [
      "Beg",
      "Fireball",
      "Coin Toss",
      "Osmose",
    ]
  },
  ghost: {
    name: arrayRandom(nameArray),
    maxHealth: 15,
    currentHealth: 15,
    minAttack: 3,
    maxAttack: 5,
    defense: 2,
    money: 0,
    specials: [
      "Beg",
      "Fireball",
      "Coin Toss",
      "Osmose",
    ]
  }
};

var Player = function(options) {
  this.name = options.name;
  this.maxHealth = options.maxHealth;
  this.currentHealth = options.currentHealth;
  this.minAttack = options.minAttack;
  this.maxAttack = options.maxAttack;
  this.defense = options.defense;
  this.money = options.money;
  this.specials = $.map(options.specials, function(special, idx){
    return new Special(special, idx===0);
  });
  this.class = options.class || "unknown";
  this.currentBoss = 0;
};

var Enemy = function(options) {
  this.name = options.name;
  this.initialText = options.initialText;
  this.maxHealth = options.health;
  this.currentHealth = options.health;
  this.attack = options.attack;
  this.reward = options.reward;
};

var shopPrices = {
  maxHealth: 15,
  maxAttack: 30,
  minAttack: 30,
  defense: 75
};

var trainingEnemies = [
  {
    name: "Imp",
    initialText: "An angry Imp appears!",
    health: 10,
    attack: 3
  },
  {
    name: "Pixie",
    initialText: "A small pixie is looking for a fight!",
    health: 7,
    attack: 4
  },
  {
    name: "Sea Nymph",
    initialText: "A sea nymph stands before you, ready to battle!",
    health: 15,
    attack: 2
  }
];

/**
* Increments player's boss state, gives a certain amount of money and unlocks specials!
* Special is unlocked by setting the boss index's special to be available
*
* @param {Number} money Reward money
* @param {String} message Victory screen message
**/
var bossCallback = function(money, message) {
  this.props.player.currentBoss++;

  //check if this was the final boss
  if(this.props.player.currentBoss == bosses.length){
    return;
  }
  this.props.player.money += money;

  var special = this.props.player.specials[this.props.player.currentBoss];
  //unlock new ability
  if(this.props.player.currentBoss < this.props.player.specials.length){
    special.available = true;
  }
  this.setState({currentMessage: message, subMessage: "New special: " + special.name + " unlocked! " + special.description });
};

var bosses = [
  {
    name: "Glass Joseph",
    initialText: "Bonjour!  I am Glass Joseph!  Please be gentle.",
    health: 20,
    attack: 5,
    reward: function() {
      bossCallback.call(this, 50, "Noooooon! How could je lose?");
    }
  },
  {
    name: "Brass Tack",
    initialText: "Let's get down to it.",
    health: 35,
    attack: 7,
    reward: function() {
      bossCallback.call(this, 150, "Gaaah!  You're a sharp one.");
    }
  },
  {
    name: "Knuckle Sandwich",
    initialText: "Oh goodness, you look famished.  Let me make you something!",
    health: 55,
    attack: 10,
    reward: function() {
      bossCallback.call(this, 300, "Don't worry, a lot of people don't like my sandwiches either.")
    }
  }
];

basicReward = function() {
  var money = numBetween(7, 13);
  this.setState({currentMessage: "You beat the " + this.props.extraProps.enemy.name + " and gained " + money + " moneys."});
  this.props.player.money += money;

  //special ghost rewards
  if(this.props.player.class === "ghost"){
    var healed = Math.floor(Math.random()*3) + 1;
    var bonusCoins = Math.floor(Math.random()*4) + 2;
    this.props.player.currentHealth = Math.min(this.props.player.maxHealth, this.props.player.currentHealth + healed);
    this.props.player.money += bonusCoins;
    this.setState({subMessage: "As a ghost, you have absorbed the soul of  " + this.props.extraProps.enemy.name +
     " and healed by " + healed + " and got " + bonusCoins + " bonus coins!"});
  }
};

var waiverText1 = "and consious mind and sound body, do hereby release the creators, staff, and all related parties of the tournament from any liabilities from blah blah blah... " +
"promise not to violate any aformentioned rules of the tournament yadda yadda yadda... " +
"offer my firstborn child, the entirety of my inheritance, ";
var waiverText2 = " to the tournament and its staff to use as they see fit, yikkity yakkity please sign below:";
