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
      new Special("Beg", true),
      new Special("Fireball", false)
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
  this.specials = options.specials;
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
  }
];

basicReward = function() {
  var money = numBetween(7, 13);
  this.setState({currentMessage: "You beat the " + this.props.extraProps.enemy.name + " and gained " + money + " moneys."});
  this.props.player.money += money;
};
