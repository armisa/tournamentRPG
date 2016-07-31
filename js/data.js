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
* Calculates final health after some amount of damage, useful for its Minimum
* value of zero to be returned
*
* @param {Number} health The current health
* @param {Number} damage The amount of damage for the health to sustain
* @return {Number} The halth, minus the damage.  Minimum value of zero.
**/
var takeDamage = function(health, damage){
  var currentHealth = health - damage;
  return Math.max(currentHealth, 0);
}


/** Characters **/

var nameArray = [
  "Aaron",
  "Barry",
  "Chris",
  "David",
  "Eric",
  "Frank",
  "Gary",
  "Henry",
  "Ian",
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

var Enemy = function(name, initialText, health, attack) {
  this.name = name;
  this.initialText = initialText;
  this.maxHealth = health;
  this.currentHealth = health;
  this.attack = attack;
};

var trainingEnemies = [
  new Enemy("Imp", "An angry Imp appears!", 10, 3),
  new Enemy("Pixie", "A small pixie is looking for a fight!", 7, 4),
  new Enemy("Sea Nymph", "A sea nymph stands before you, ready to battle!", 15, 2)
];
