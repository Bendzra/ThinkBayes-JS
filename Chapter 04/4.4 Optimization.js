///////////////////////////////////////////////////////////////////////////////
// 4.4 Optimization
//
//  1. We can save some time by doing all of the updates before normalizing.
//  2. Instead of the long dataset we use a tuple of two integers:
//     the number of heads and tails
//

(function () {

	class Euro extends Suite
	{
		constructor(hypoes, title)
		{
			super(hypoes, title);
		};

		Likelihood(data, hypo)
		{
			var x = parseInt( hypo, 10 ) / 100 ;
			if (data == 'H') return x ;
			else return 1 - x ;
		};
	}

	class Euro3 extends Suite
	{
		constructor(hypoes, title)
		{
			super(hypoes, title);
		};

		Likelihood(data, hypo)
		{
			var x = parseInt( hypo, 10 ) / 100;
			var heads = data[0];
			var tails = data[1];
			var like = Math.pow(x, heads) * Math.pow((1-x), tails);
			return like;
		};
	}

	// -------------------- test -------------------- //

	var title = "4.4 Optimization";
	var heads = 140;
	var tails = 110;

	function printOut(suite)
	{
		/// print out:
		console.log( " ---- " + title + " ---- ");
		var maximumLikelihood = suite.MaximumLikelihood();
		var mean = suite.Mean();
		var cdf = suite.MakeCdf();
		var median = cdf.Percentile(50);
		var credibleInterval = JSON.stringify( cdf.CredibleInterval(90) );

		console.log( "Maximum Likelihood = ", maximumLikelihood );
		console.log( "Mean = ", mean );
		console.log( "Median = ", median );
		console.log( "Credible Interval = ", credibleInterval );

		suite.msgDiv.innerHTML += "<dt>" + title + ":</dt>"
								+ "<dd>" + "Maximum Likelihood = " + maximumLikelihood + ";</dd>"
								+ "<dd>" + "Mean = " + mean + ";</dd>"
								+ "<dd>" + "Median = " + median + ";</dd>"
								+ "<dd>" + "Credible Interval = " + credibleInterval + ";</dd>";
	};

	function initDataset(hypoes)
	{
		for(var i = 0; i < 101; i++) hypoes[i] = i;
		var dataset = [];
		for(var i = 0; i < heads; i++) dataset[i]= 'H';
		for(var i = 0; i < tails; i++) dataset.push('T');
		return dataset;
	};

	(function () {

		var startDate = new Date();

		var hypoes  = new Array(101);
		var dataset = initDataset(hypoes);
		var suite   = new Euro(hypoes, title);

		for(var i = 0; i < dataset.length; i ++)
		{
			var data = dataset[i];
			suite.Update(data);
		}

		var endDate   = new Date();
		var milliseconds = endDate.getTime() - startDate.getTime();

		printOut(suite);
		console.log("\t", "milliseconds (no optimization) = ", milliseconds);
		suite.msgDiv.innerHTML += "<dd>" + "milliseconds (no optimization) = " + milliseconds + ";</dd>";

	})();

	(function () {

		var startDate = new Date();

		var hypoes  = new Array(101);
		var dataset = initDataset(hypoes);
		var suite   = new Euro(hypoes, title);

		suite.UpdateSet(dataset);

		var endDate   = new Date();
		var milliseconds = endDate.getTime() - startDate.getTime();

		printOut(suite);
		console.log("\t", "milliseconds (UpdateSet optimization) = ", milliseconds);
		suite.msgDiv.innerHTML += "<dd>" + "milliseconds (UpdateSet optimization) = " + milliseconds + ";</dd>";
	})();

	(function () {

		var startDate = new Date();

		var hypoes = new Array(101); for(var i = 0; i < 101; i++) hypoes[i] = i;
		var suite  = new Euro3(hypoes, title);
		var data   = [heads, tails];

		suite.Update(data);

		var endDate   = new Date();
		var milliseconds = endDate.getTime() - startDate.getTime();

		printOut(suite);
		console.log("\t", "milliseconds (Update Likelihood optimization) = ", milliseconds);
		suite.msgDiv.innerHTML += "<dd>" + "milliseconds (Update Likelihood optimization) = " + milliseconds + ";</dd>";
		
	})();

})();
