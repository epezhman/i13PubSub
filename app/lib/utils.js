'use strict';

module.exports.JSONifySubscriberPredicates = JSONifySubscriberPredicates;
module.exports.JSONifyPublisherPredicates = JSONifyPublisherPredicates;

/**
 * @return {{}}
 */
function JSONifySubscriberPredicates(predicates) {
	let resultPredicates = {};
	predicates = predicates.replace(/ /g, '');
	let predicatesTokens = predicates.split(',');

	for (let i = 0; i < predicatesTokens.length; i++) {
		let validPred = false;
		let onePredicate = predicatesTokens[i].split('=');
		if (onePredicate.length === 2) {
			resultPredicates[onePredicate[0]] = {
				operator: '=',
				value: onePredicate[1]
			};
			validPred = true;
		}
		onePredicate = predicatesTokens[i].split('>');
		if (onePredicate.length === 2) {
			resultPredicates[onePredicate[0]] = {
				operator: '>',
				value: onePredicate[1]
			};
			validPred = true;
		}
		onePredicate = predicatesTokens[i].split('>=');
		if (onePredicate.length === 2) {
			resultPredicates[onePredicate[0]] = {
				operator: '>=',
				value: onePredicate[1]
			};
			validPred = true;
		}
		onePredicate = predicatesTokens[i].split('<');
		if (onePredicate.length === 2) {
			resultPredicates[onePredicate[0]] = {
				operator: '<',
				value: onePredicate[1]
			};
			validPred = true;
		}
		onePredicate = predicatesTokens[i].split('<=');
		if (onePredicate.length === 2) {
			resultPredicates[onePredicate[0]] = {
				operator: '<=',
				value: onePredicate[1]
			};
			validPred = true;
		}
		if (!validPred)
			return false;
	}

	return resultPredicates;

}

function JSONifyPublisherPredicates() {

}
