///////////////////////////////////////////////////////////////////////////////
// Exercise 7.2
//
// Suppose that passengers arriving at the bus stop are well-
// modeled by a Poisson process with parameter λ. If you arrive at the stop
// and find 3 people waiting, what is your posterior distribution for the time
// since the last bus arrived.


class Ex7_2_ElapsedTime extends Suite
{
	prior  = null;
    lambda = 2;

	constructor(title, pmfIntervalDists, lambda, name="")
	{
		super(null, title, name);
		this.lambda = lambda;
		this.SetHypoes(pmfIntervalDists);
	}

	MixPrior(pmfIntervalDists)
	{
		this.prior = MakeMixture(pmfIntervalDists);
		this.prior.Normalize();
		this.prior.SortMasses();
	}

	SetHypoes(pmfIntervalDists)
	{
		this.MixPrior(pmfIntervalDists);
		for(const [h, p] of this.prior.Items()) this.Set(h, p);
	}

	Likelihood(data, hypo)
	{
		var k    = data;
        var x    = hypo  // x minutes past
        var like = EvalPoissonPmf(k, x * this.lambda);
        return like;
	}
}

function Ex7_2_accumulatePmfs(mu, sigma, stepFactor=4)
{
	var metapmf = new Pmf();
    for(var t = 0; t < 2* mu; t += 1/stepFactor)
	{
        var pmf = MakeUniformPmf(0, t, stepFactor*t + 1);
        var p = EvalGaussianPdf(t, mu, sigma);
        metapmf.Set(pmf, p);
    }
	metapmf.Normalize();
	return metapmf;
}

(function () {

	const title = "Exercise 7.2: Elapsed Time";

	// Suppose: the intervals between two consecutive buses has Gaussean distribution

	const mu = 20;
	const sigma = 5;

	// --- ElapsedTime, given the number of people waiting --- //

	const lambda = 1; // passenger arrival rate is given, λ people/minute
	const people = 3; // passengers found

	const metapmf = Ex7_2_accumulatePmfs(mu, sigma);

	const posterior = new Ex7_2_ElapsedTime(title, metapmf, lambda);
	const prior = posterior.prior;

	posterior.Update(people);

	/// --- plotting --- ///

	const plotData = [];

	prior.name = `Past Time (prior, μ=${mu}, σ=${sigma})`;
	logSummary(title, prior, "Exercise_7_2_Past_Time_summary_", 'aqua');
	chargePlot(prior, plotData, "column");

	posterior.name = `Past Time (posterior, λ = ${lambda}, people = ${people})`;
	logSummary(title, posterior, "Exercise_7_2_Past_Time_summary_", 'aqua');
	chargePlot(posterior, plotData, "line");

	renderPlot(title, plotData, "Exercise_7_2_Past_Time_chart_", {x:{title:"Minutes past bus"},y:{title:"Probability"}});

})();
