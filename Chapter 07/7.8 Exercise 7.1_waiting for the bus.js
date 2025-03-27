///////////////////////////////////////////////////////////////////////////////
// Exercise 7.1
//
// If buses arrive at a bus stop every 20 minutes, and you arrive
// at the bus stop at a random time, your wait time until the bus arrives is
// uniformly distributed from 0 to 20 minutes.
//
// But in reality, there is variability in the time between buses. Suppose you are
// waiting for a bus, and you know the historical distribution of time between
// buses. Compute your distribution of wait times.
//
// Hint: Suppose that the time between buses is either 5 or 10 minutes with
// equal probability. What is the probability that you arrive during one of the
// 10 minute intervals?


class Ex7_1_BusWaitTime extends Suite
{
	prior = null;

	constructor(title, pmfIntervalDists, name="")
	{
		super(null, title, name);
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

	Likelihood(data=null, hypo)
	{
		var like = hypo;
		return like;
	}
}


(function () {

	// ------ Hint Simulate ------ //

	const title = "Exercise 7.1: Hint Simulate";

	const t1 = 5, t2 = 10;
	const total = t1 + t2;
	const N = 700*1000;

	var simPmf = new Pmf();

	simPmf.Set(0,0);

	function waitTimeXXX()
	{
		var t = Math.floor( total * Math.random() );
		if(t < t1) return t1 - t;
		return (total - t);
	}

	function waitTimeZZZ()
	{
		var p = Math.random();
		if(p < 1/3)
		{
			var t = Math.floor( t1 * Math.random() );
			return t1 - t;
		}
		var t = Math.floor( t2 * Math.random() );
		return t2 - t;
	}

	for(var i = 0; i < N; i++)
	{
		var t = waitTimeXXX();
		simPmf.Incr( t );
	}

	simPmf.Normalize();
	simPmf.SortMasses();

	// ------ Distributions ------ //

	var dist1 = new Pmf( Array.from({length: t1}, (_, i) => i+1) );
	dist1.Set(0,0);
	dist1.Normalize();

	var dist2 = new Pmf( Array.from({length: t2}, (_, i) => i+1) );
	dist2.Set(0, 0);
	dist2.Normalize();

	var metapmf = new Pmf();
	metapmf.Set(dist1, t1);
	metapmf.Set(dist2, t2);
	metapmf.Normalize();

	var mix = MakeMixture(metapmf);
	mix.Normalize();
	mix.SortMasses();

	// ------ prior updading ------ //

	var metapmf = new Pmf();
	metapmf.Set(dist1, 0.5);
	metapmf.Set(dist2, 0.5);
	metapmf.Normalize();

	var suite = new Ex7_1_BusWaitTime(title, metapmf);
	suite.Update(null);

	/// --- plotting --- ///

	var plotData = [];

	simPmf.name = `Simulation (N=${N})`;
	logSummary(title, simPmf, "Hint_Wait_Time_summary_", 'cyan');
	chargePlot(simPmf, plotData, "area" );

	mix.name = `Dists Mixture`;
	logSummary(title, mix, "Hint_Wait_Time_summary_", 'cyan');
	chargePlot(mix, plotData, "column" );

	mix.name = `Suite`;
	logSummary(title, mix, "Hint_Wait_Time_summary_", 'cyan');
	chargePlot(mix, plotData, "line" );

	renderPlot(title, plotData, "Hint_Wait_Time_chart_", {x:{title:"Minutes until bus"},y:{title:"Probability"}});

})();


(function () {

	var title = "Exercise 7.1: Gaussian buses";

	// Suppose: the intervals between two consecutive buses has Gaussean distribution

	const mu = 20;
	const sigma = 5;
	const num_sigmas = 4;
	const n = 2001;

	var gausPmf = MakeGaussianPmf(mu, sigma, num_sigmas, n);

	/// --- plotting --- ///

	var plotData = [];

	gausPmf.name = `Bus intervals (μ=${mu}, σ=${sigma})`;
	logSummary(title, gausPmf, "Exercise_7_1_buses_summary_", 'brown');
	chargePlot(gausPmf, plotData, "line" );
	renderPlot(title, plotData, "Exercise_7_1_buses_chart_", {x:{title:"Minutes between buses"},y:{title:"Probability"}});

	/// --- WaitTime --- ///

	var title = "Exercise 7.1: Wait Time";

	var metapmf = new Pmf();
    for(var t = 0; t < 2* mu; t++)
	{
        var pmf = MakeUniformPmf(0, t, t+1);
        var p = EvalGaussianPdf(t, mu, sigma);
        metapmf.Set(pmf, p);
    }
	metapmf.Normalize();

	var posterior = new Ex7_1_BusWaitTime(title, metapmf);
	var prior = posterior.prior;

	posterior.Update(null);

	/// --- plotting --- ///

	var plotData = [];

	prior.name = `Wait Time (prior)`;
	logSummary(title, prior, "Exercise_7_1_Wait_Time_summary_", 'brown');
	chargePlot(prior, plotData, "line" );

	posterior.name = `Wait Time (posterior)`;
	logSummary(title, posterior, "Exercise_7_1_Wait_Time_summary_", 'brown');
	chargePlot(posterior, plotData, "line" );

	renderPlot(title, plotData, "Exercise_7_1_Wait_Time_chart_", {x:{title:"Minutes until bus"},y:{title:"Probability"}});

})();
