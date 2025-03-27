///////////////////////////////////////////////////////////////////////////////
// 4.2 Summarizing the posterior
//
// There are several ways to summarize the posterior distribution:
//           MaximumLikelihood
//           Mean
//           Median
//           CredibleInterval

(function () {

	class Euro extends Suite
	{
		constructor(hypoes, title)
		{
			super(hypoes, title);
		};

		Likelihood(data, hypo)
		{
			var x = parseInt( hypo, 10 ) ;
			if (data == 'H') return x / 100;
			else return 1 - x / 100;
		}
	}

	// -------------------- test -------------------- //

	var title = "4.2 Summarizing the posterior";
	var hypoes = new Array(101); for(var i = 0; i < 101; i++) hypoes[i] = i;
	
	var suite = new Euro(hypoes, title);
	
	var dataset = [];
	for(var i = 0; i < 140; i++) dataset[i]= 'H';
	for(var i = 0; i < 110; i++) dataset.push('T');
	
	for(var i = 0; i < dataset.length; i ++)
	{
		var data = dataset[i];
		suite.Update(data);
	}

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
	

})();
