/*
	Suppose there are two bowls of cookies.
	Bowl 1 contains 30 vanilla cookies and 10 chocolate cookies.
	Bowl 2 contains 20 of each.

	Exercise 2.1.
	
	In Section 2.3 I said that the solution to the cookie problem 
	generalizes to the case where we draw multiple cookies with replacement.
	But in the more likely scenario where we eat the cookies we draw, the 
	likelihood of each draw depends on the previous draws.
	
	Modify the solution in this chapter to handle selection without replacement. 
	
	Hint: add instance variables to Cookie to represent the hypothetical state of 
	the bowls, and modify Likelihood accordingly. You might want to deﬁne a Bowl object.
*/

(function() {

	var bowls = {
		'Bowl 1': {'vanilla': 30, 'chocolate': 10},
		'Bowl 2': {'vanilla': 20,  'chocolate': 20},
	};

	class Cookie2 extends Suite
	{
		constructor(hypoes)
		{
			super(hypoes);
		};


		Bowls() {
			return JSON.stringify(bowls);
		};

		// tentatively:    takes the cookie from the most probable bowl.
		// proportionally: randomizes.
		updateCookies(data)
		{
			var bowl = bowls[ hypoes[0] ];
			var rand = Math.random() ;
			var prob1 = this.Prob( hypoes[0] );
			var prob2 = this.Prob( hypoes[1] );
			if (prob1 >= prob2)
			{
				bowl = (rand > prob1) ? bowls[ hypoes[1] ] : bowls[ hypoes[0] ];
			}
			else
			{
				bowl = (rand > prob2) ? bowls[ hypoes[0] ] : bowls[ hypoes[1] ];
			}
			bowl[data] = (bowl[data] > 0) ? bowl[data] - 1 : 0;
		};

		Likelihood = function(data, hypo)
		{
			/* 	The likelihood of the data (D) under the hypothesis (H) = p(D|H).
				data: string cookie type
				hypo: string bowl ID */

			var bowl = bowls[hypo];
			var total = 0; for (var x in bowl) { total += bowl[x]; }
			var like = bowl[data] / total;
			return like;
		};

	}

	var fReplace = false;

	var hypoes = ['Bowl 1', 'Bowl 2'];
	var suite = new Cookie2(hypoes);

	// console.log( suite.Bowls() );

	// var conditions = ['vanilla'];
	// var conditions = ['vanilla', 'chocolate', 'chocolate' ];
	var conditions = ['vanilla', 'chocolate', 'vanilla' ];
	// var conditions = ['vanilla', 'chocolate', 'vanilla', 'vanilla', 'vanilla'];

	for(var i = 0; i < conditions.length; i++)
	{
		suite.Update(conditions[i]);
		if ( !fReplace ) {
			suite.updateCookies(conditions[i]);
			console.log( conditions[i], suite.Bowls()  );
		}
	}

	suite.Print( "Exercise 2.1. The cookie problem (without replacement)", conditions );

})();