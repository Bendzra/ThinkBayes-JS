///////////////////////////////////////////////////////////////////////////////
// Exercise 4.2 Reddit ......... when a redditor casts a vote, the
// estimated quality of the link is updated in accordance with the reliability of the
// redditor, and the estimated reliability of the redditor is updated in accordance
// with the quality of the link.

// # Here's one possible model:
// #    Each article has a quality Q, which is the probability of 
// #    eliciting an upvote from a completely reliable redditor. 
// #    Each user has a reliability R, which is the probability of
// #    giving an upvote to an item with Q=1.
// #    The probability that a redditor with reliability R gives an
// #    upvote to an item with quality Q is `R*Q + (1-R) * (1-Q)`
// # Now when a redditor votes on a item, we simultaneously update our
// # belief about the redditor and the item.

(function () {

	class Redditor extends Suite
	{
		// Represents hypotheses about the trustworthiness of a redditor

		constructor(hypoes, title)
		{
			super(hypoes, title);
		};

		Likelihood(data, hypo)
		{
			// Computes the likelihood of the data under the hypothesis
			//
			// hypo: integer value of r, the prob of a correct vote (0-100)
			// data: (vote, q) pair, where vote is 'up' or 'down' and
			//       q is the mean quality of the link

			var r    = hypo / 100 ;
			var vote = data[0];
			var q    = data[1];

			if (vote == 'up') return r * q + (1-r) * (1-q);
			else if (vote == 'down') return r * (1-q) + (1-r) * q;
			return 0;
		};
	}

	class Item extends Suite
	{
	    // Represents hypotheses about the quality of an item

		constructor(hypoes, title)
		{
			super(hypoes, title);
		};

		Likelihood(data, hypo)
		{
	        // Computes the likelihood of the data under the hypothesis
			//
	        // hypo: integer value of x, the prob of garnering an upvote
	        // data: (vote, t) pair, where vote is 'up' or 'down' and
	        //       t is the mean trustworthiness of the redditor

	        var q    = hypo / 100;
	        var vote = data[0];
			var r    = data[1];

	        if ( vote == 'up' ) return q * r + (1-q) * (1-r);
	        else if ( vote == 'down' ) return q * (1-r) + (1-q) * r;
	        return 0;
		};
	}

// -------------------- test -------------------- //

	var title = "Exercise 4.2 Reddit";


	function printOut(suite, label="", divPrefix="")
	{
		/// print out:

		const bold = "font-weight: bold; color: red;";
		const normal = "font-weight: normal; color: black;";
		console.log( "< %c%s%c >", bold, title, normal);
		
		if(label) console.log( "\t", label);

		var maximumLikelihood = suite.MaximumLikelihood();
		var mean = suite.Mean().toFixed(2);
		var cdf = suite.MakeCdf();
		var median = cdf.Percentile(50);
		var credibleInterval = JSON.stringify( cdf.CredibleInterval(90) );

		console.log( "Maximum Likelihood = ", maximumLikelihood );
		console.log( "Mean = ", mean );
		console.log( "Median = ", median );
		console.log( "Credible Interval = ", credibleInterval );

		var infoDiv = (divPrefix) ? createDiv(divPrefix, suite.titleSlug) : suite.msgDiv;
		infoDiv.innerHTML += "<dt>" + title + ":</dt>"
							+ "<dd>" + "Maximum Likelihood = " + maximumLikelihood + ";</dd>"
							+ "<dd>" + "Mean = " + mean + ";</dd>"
							+ "<dd>" + "Median = " + median + ";</dd>"
							+ "<dd>" + "Credible Interval = " + credibleInterval + ";</dd>";
	};
	
	function plot(suite, legendText, divPrefix)
	{
		/// --- chart --- ///

		var chartDiv = createDiv(divPrefix, suite.titleSlug);
		chartDiv.style.cssText = "height: 370px; max-width: 920px; margin: 0px;";
		
		var xy = [];
		var masses = suite.GetDict();
		for(const [x, y] of masses) xy.push({"x": x, "y": y});

		var chart = new CanvasJS.Chart(chartDiv.id, {
			animationEnabled: false,
			zoomEnabled: true,
			title: {
				text: title
			},
			legend: {
				horizontalAlign: "right",
				verticalAlign: "top",
				dockInsidePlotArea: true 
			},
			axisX: {
				title: "x",
				suffix: "%"
			},
			axisY: {
				title: "Probability",
				suffix: ""
			},
			data: [{
				type: "line",
				showInLegend: true,
				legendText: legendText,
				dataPoints: xy
			}]
		});
		chart.render();
	}
	
	/// Suppose we start with a redditor who has demonstrated some reliability ///

	var hypoes = [];

	var redditor = new Redditor(hypoes, title);
	var beta = new Beta(2, 1);
	var masses = beta.MakePmf().GetDict();

	for (const [hypo, mass] of masses)
	{
		hypoes.push(hypo);
		redditor.Set(hypo, mass);
	}

	mean_r = redditor.Mean() / 100.0;
	
	printOut(redditor, "redditor beta(2,1) prior", "redditor_prior_msg_");
	plot(redditor, "redditor beta(2,1) prior", "redditor_prior_chart_");
	
	/// --- And a completely unknown item --- ///

	var item = new Item(hypoes, title);
	mean_q = item.Mean() / 100;
	
	printOut(item, "item uniform prior", "new_item_prior_msg_");
	plot(item, "item uniform prior", "item_prior_chart_");
	
	/// We update the priors simultaneously, each using the mean value of the other ///

	// Note: this is a shortcut that should give us an approximate solution; later
	// we will come back and do this right with a joint distribution of q and r.

	redditor.Update( ['up', mean_q] );
	item.Update( ['up', mean_r] );
	redditor.Update( ['up', mean_q] );
	item.Update( ['up', mean_r] );

	printOut(redditor, "redditor posterior", "redditor_posterior_msg_");
	plot(redditor, "redditor posterior", "redditor_posterior_chart_");
	
	// But since we think the redditor is reliable, the vote provides 
	// some information about the item:

	printOut(item, "item posterior", "item_posterior_msg_");
	plot(item, "item posterior", "item_posterior_chart_");

})();
