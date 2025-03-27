///////////////////////////////////////////////////////////////////////////////
// 3.5 Credible intervals
//
// A simple way to compute a credible interval is to add up the probabilities in the
// posterior distribution and record the values that correspond to probabilities
// 5% and 95%. In other words, the 5th and 95th percentiles.

(function () {

	class Train extends Suite
	{
		constructor(hypoes, title, alpha=1)
		{
			super(hypoes, title);

			// Re-Initializes the distribution (power law)
			for(var i = 0; i < hypoes.length; i++) {
				this.Set( hypoes[i], Math.pow( hypoes[i], -alpha ) );
			}
			this.Normalize();
		}

		Likelihood(data, hypo)
		{
			if (hypo < data) return 0;
			else return 1 / hypo;
		}

		Percentile(percentage) {
			var val = -1;
			var p = percentage / 100;
			var total = 0;
			for(var i = 0; i < hypoes.length; i++)
			{
				val = hypoes[i];
				total += this.Prob(val);
				if ( total >= p ) return val;
			}
			return val;
		}
	}

	// -------------------- test -------------------- //

	var title = "3.5 Credible intervals";
	console.log( title );

	var N = [500, 1000, 2000];

	for(var k = 0; k < N.length; k++)
	{
		var hypoes = new Array(N[k]); for (var i = 0; i < N[k]; i++) { hypoes[i] = i + 1; }
		var suite = new Train(hypoes, title);
		if (k == 0) suite.msgDiv.innerHTML += "</br><dt>" + title + ": </dt>" ;

		// var data = [60];
		var data = [60, 60, 30, 90];

		for (var i = 1; i < data.length; i++)
		{
			suite.Update(data[i])
		}

		var interval = [suite.Percentile(5), suite.Percentile(95)];

		console.log("", "Upper Bound = ", N[k], "; interval = ", JSON.stringify(interval) );
		suite.msgDiv.innerHTML += "<dd>" + "Upper Bound = " + N[k] + "; interval = " + JSON.stringify(interval) + "</dd>" ;
	}

})();
