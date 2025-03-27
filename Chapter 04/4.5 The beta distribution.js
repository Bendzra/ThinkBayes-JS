///////////////////////////////////////////////////////////////////////////////
// 4.5 The beta distribution
//
// (see http://en.wikipedia.org/wiki/Beta_distribution)


// -------------------- test -------------------- //

(function () {

	var title = "4.5 The beta distribution";
	
	var heads = 140;
	var tails = 110;

	var beta = new Beta();
	beta.Update( [heads, tails] );
	
	var pmf = beta.MakePmf();
	
	beta.titleSlug = slugify(title);
	beta.msgDiv = createDiv("msg_", beta.titleSlug);

	/// --- print out --- ///

	console.log( " ---- " + title + " ---- ");
	
	var maximumLikelihood = pmf.MaximumLikelihood() ;
	var mean = beta.Mean() ;
	
	var cdf = pmf.MakeCdf();
	var median = cdf.Percentile(50);
	var credibleInterval = JSON.stringify( cdf.CredibleInterval(90) );

	console.log( "Maximum Likelihood = ", maximumLikelihood );
	console.log( "Mean = ", mean );
	console.log( "Median = ", median );
	console.log( "Credible Interval = ", credibleInterval );

	beta.msgDiv.innerHTML += "<dt>" + title + ":</dt>"
							+ "<dd>" + "Maximum Likelihood = " + maximumLikelihood + ";</dd>"
							+ "<dd>" + "Mean = " + mean + ";</dd>"
							+ "<dd>" + "Median = " + median + ";</dd>"
							+ "<dd>" + "Credible Interval = " + credibleInterval + ";</dd>";

	/// --- chart --- ///

	var plotData = [];

	pmf.name = "pmf";
	chargePlot(pmf, plotData, "line");
	renderPlot(title, plotData, divPrefix="chart_pdf_")

	cdf.name = "cdf";
	chargePlot(cdf, plotData, "line");
	renderPlot(title, plotData, divPrefix="chart_cdf_")

})();
