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
}


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

var characters = {
  peasant: {
    name: arrayRandom(nameArray),
    maxHealth: 25,
    currentHealth: 25,
    minAttack: 5,
    maxAttack: 7,
    defense: 0,
    money: 10
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
  this.currentBoss = 0;
};

var Enemy = function(options) {
  this.name = options.name;
  this.initialText = options.initialText;
  this.maxHealth = options.health;
  this.currentHealth = options.health;
  this.attack = options.attack;
};

var shopPrices = {
  maxHealth: 25,
  maxAttack: 30,
  minAttack: 30,
  defense: 50
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

var bosses = [
  {
    name: "Glass Joseph",
    initialText: "Bonjour!  I am Glass Joseph!  Please be gentle.",
    health: 20,
    attack: 5
  },
  {
    name: "Brass Tack",
    initialText: "Let's get down to it.",
    health: 35,
    attack: 7
  }
]
