///////////////////////////////////////////////////////////////////////////////
// 8.7 Decision analysis

function UnbiasPmf(pmf, name="")
{
	// """Returns the Pmf with oversampling proportional to 1/value.
	//   pmf: Pmf object.
	//   name: string name for the new Pmf.
	//  Returns: Pmf object

	var newPmf = pmf.Copy(name);
	for ( const [x, p] of pmf.Items() )
	{
		newPmf.Set(x, p / x);
	}
	newPmf.Normalize();
	return newPmf;
}

(function() {

	const title = "8.7 Decision analysis";

	// drawing a sample, and then adding in delays
	// of 30, 40, and 50 minutes (expressed in seconds):

	const n = 220;

	var cdf_z  = MakeCdfFromList(observed_gap_times);
	var sample_z = cdf_z.Sample(n);
	var pmf_z  = MakePmfFromList(sample_z);
	var pmf_zb = BiasPmf(pmf_z)
	var cdf_zb = pmf_zb.MakeCdf();
	var sample_zb = cdf_zb.Sample(n).concat( [1800, 2400, 3000] );

	/// --- plotting --- ///
	{
		var plotData = [];

		pmf_z.name = "random (z)";
		logSummary(title, pmf_z, "pmf_summary_", 'blue');
		chargePlot(pmf_z, plotData, "line" );

		pmf_zb.name = "biased (zb)";
		logSummary(title, pmf_zb, "pmf_summary_", 'blue');
		chargePlot(pmf_zb, plotData, "line" );

		renderPlot(title, plotData, "pmf_chart_", {x:{title:"Gaps between trains (seconds)"},y:{title:"Probability (PMF)"}});

		var plotData = [];

		cdf_z.name = "random (z)";
		chargePlot(cdf_z, plotData, "line" );

		cdf_zb.name = "biased (zb)";
		chargePlot(cdf_zb, plotData, "line" );

		renderPlot(title, plotData, "cdf_chart_", {x:{title:"Gaps between trains (seconds)"},y:{title:"Probability (CDF)"}});
	}

	// Next, using KDE to restore pmf_z:

	var pdf_zb = new EstimatedPdf(sample_zb);
	var xs = spreadDots(sample_zb, 2*n, 60, 3300);
	var pmf_zb = pdf_zb.MakePmf(xs);
	var pmf_z = UnbiasPmf(pmf_zb)

	/// --- plotting --- ///
	{
		var plotData = [];

		pmf_z.name = "unbiased (z)";
		logSummary(title, pmf_z, "pmf2_summary_", 'blue');
		chargePlot(pmf_z, plotData, "line" );

		pmf_zb.name = "zb";
		logSummary(title, pmf_zb, "pmf2_summary_", 'blue');
		chargePlot(pmf_zb, plotData, "line" );

		renderPlot(title, plotData, "pmf2_chart_", {x:{title:"Gaps between trains (seconds)"},y:{title:"Probability (PMF)"}});

		var plotData = [];

		chargePlot(pmf_z.MakeCdf("unbiased (z)"), plotData, "line" );
		chargePlot(pmf_zb.MakeCdf("zb"), plotData, "line" );

		renderPlot(title, plotData, "cdf2_chart_", {x:{title:"Gaps between trains (seconds)"},y:{title:"Probability (CDF)"}});
	}

	var wtc      = new WaitTimeCalculator(pmf_z);
	var probsPmf = new Pmf();
	var nums     = [0, 5, 10, 15, 20, 25, 30, 35];
	var lambda   = 2 / 60;

	// compute the posterior prob of waiting more than 15 minutes
	var minutes  = 15;

	nums.forEach( (num_passengers) => {
		var ete = new ElapsedTimeEstimator(wtc, lambda, num_passengers);

		var cdf_y = ete.pmf_y.MakeCdf();
		var prob = 1 - cdf_y.Prob(minutes * 60);
		probsPmf.Set(num_passengers, prob);
	});

	/// --- plotting --- ///
	{
		var plotData = [];

		probsPmf.name = "";
		logSummary(title, probsPmf, "probs_summary_", 'blue');
		chargePlot(probsPmf, plotData, "line" );
		renderPlot(title, plotData, "probs_chart_", {x:{title:"Num passengers"},y:{title:`P(y > ${minutes} min)`}});
	}

})();