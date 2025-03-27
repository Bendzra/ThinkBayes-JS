///////////////////////////////////////////////////////////////////////////////
// 8.4 Predicting wait times
//

class ElapsedTimeEstimator
{
	prior_x = null;
	post_x  = null;
	pmf_y   = null;

	constructor(wtc, lambda, num_passengers)
	{
		this.prior_x = new Elapsed(wtc.pmf_x);
		this.post_x  = this.prior_x.Copy();
		this.post_x.Update( [lambda, num_passengers] );
		this.pmf_y = PredictWaitTime(wtc.pmf_zb, this.post_x);
	};
}


class Elapsed extends Suite
{
	constructor(hypoes=null, title=null, name="")
	{
		super(hypoes, title, name);
	};

	Likelihood(data, hypo)
	{
		const x = hypo;
		const [lambda, k] = data;
		const like = EvalPoissonPmf(k, lambda * x);
		return like;
	};
}

function PredictWaitTime(pmf_zb, pmf_x)
{
	var pmf_y = pmf_zb.SubtractPmf(pmf_x);
	RemoveNegatives(pmf_y);
	pmf_y.SortMasses();
	return pmf_y;
}

function RemoveNegatives(pmf)
{
	for( const [val, p] of pmf.GetDict() )
	{
		if (val < 0) pmf.Remove(val);
	}
	pmf.Normalize()
}

(function() {

	const title = "8.4 Predicting wait times";

	var wtc = new WaitTimeCalculator(pmf_z);
	var ete = new ElapsedTimeEstimator(wtc, lambda=2, num_passengers=15);

	/// --- plotting --- ///

	var plotData = [];

	ete.prior_x.name = "prior x";
	logSummary(title, ete.prior_x, "summary_", 'darkslategrey');
	chargePlot(ete.prior_x, plotData, "line" );

	ete.post_x.name = "posterior x";
	logSummary(title, ete.post_x, "summary_", 'darkslategrey');
	chargePlot(ete.post_x, plotData, "line" );

	ete.pmf_y.name = "pred y";
	logSummary(title, ete.pmf_y, "summary_", 'darkslategrey');
	chargePlot(ete.pmf_y, plotData, "line" );

	renderPlot(title, plotData, "chart_", {x:{title:"Time (min)"},y:{title:"Probability (PMF)"}});

	var plotData = [];

	chargePlot(ete.prior_x.MakeCdf("prior x"), plotData, "line" );
	chargePlot(ete.post_x.MakeCdf("posterior x"), plotData, "line" );
	chargePlot(ete.pmf_y.MakeCdf("pred y"), plotData, "line" );

	renderPlot(title, plotData, "cdf_chart_", {x:{title:"Time (min)"},y:{title:"Probability (CDF)"}});

})();
