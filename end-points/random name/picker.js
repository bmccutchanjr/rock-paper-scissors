//	This module constructs a silly names by randomly selecting words from a list of adjectives and a list of nouns

const adjectiveList = require ("./adjectives.json");
const nounList = require ("./nouns.json");

function generateName ()
{
	return getRandomElement (adjectiveList) + " " + getRandomElement (nounList);
}

function getRandomElement (list)
{
	return list [Math.floor (Math.random () * list.length)];
}

module.exports = generateName;