///////////////////////////////////////////////////////////////////////////////
// Exercise 7.3
//
// Suppose that you are an ecologist sampling the insect population
// in a new environment. You deploy 100 traps in a test area and come back
// the next day to check on them. You find that 37 traps have been triggered,
// trapping an insect inside. Once a trap triggers, it cannot trap another insect
// until it has been reset.
//
// If you reset the traps and come back in two days, how many traps do you
// expect to find triggered? Compute a posterior predictive distribution for the
// number of traps.
//

// Model: предположим ловушка = "монетка". Каждую "монетку" подбрасываем 'n' раз.
// Каждый раз, вероятность 'θ' -> пойман, 'δ' (=1-θ) -> не пойман.
// Считаем каждый прилет насекомого независмым событием
//
// Data: Подбросили N=100 "монеток" 'n' раз.
//       K=37 ни разу не выпали орлом, 63 - выпали орлом хотя бы раз.
//
// Для каждой ловушки вероятность сработать k раз:
//     P(k|n) = θ^k * δ^(n-k) * n!/(k!*(n-k)!)
//     Q = P(0|n) = δ^n
//     P = P(k>0) = 1 - Q
//
// Из N=100 ловушек - K=37 не сработала. Likelihood этого
//     L(δ,n|N,K) = Q^K * P^(N-K) * N!/(K!*(N-K)!) =
//                = (δ^n)^K * (1 - δ^n)^(N-K) * N!/(K!*(N-K)!)
//

// Первый вариант (параметр: кол-во прилетов на одну ловушку в день):
//     Prior:     θ=δ=1/2; равновероятные n = [0.1,0.2,...,9.9,10]
//     Posterior: θ=δ=1/2; новое распределение вероятностей для 'n'
//
// Второй вариант (параметр: вероятность прилета на одну ловушку в день):
//     Prior:     n = 1; равновероятные θ = [0,0.01,...,0.99,1]
//     Posterior: n = 1; взвешенные θ = [0,0.01,...,0.99,1]
//
// TODO: для каждой гипотезы вычисляем распределение вероятностей кол-ва срабатываний [0...N],
//       смешиваем их и считаем распределение сработавших для 2*n = ответ к задаче

(function () {

	function BinomialCoef(n, k)
	{
		// Compute the binomial coefficient "n choose k".
		//    n: number of trials
		//    k: number of successes
		//    Returns: float

		return ( factorial(n) / factorial(n-k) ) / factorial(k);
	}

	function EvalBinomialPmf(k, n, p)
	{
		// Evaluates the binomial pmf.
		// Returns the probabily of k successes in n trials with probability p.

		if(n < k || n < 0 || k < 0 || p < 0 || p > 1) return 0;
		return BinomialCoef(n, k) * Math.pow(1-p, n-k) * Math.pow(p, k)
	}

	const title = "Exercise 7.3: Traps";

	const N = 100;
	const K = 37;
	const days = 2;

	(function () {

		// Первый вариант ("crooked"):

		const title = "Exercise 7.3: Traps" + ": arrivals";

		class Trap1 extends Suite
		{
			constructor(hypoes, title, name="")
			{
				super(hypoes, title, name);
			};

			Likelihood(data, hypo)
			{
				const [N, K] = data;
				const n = hypo;
				const Q = Math.pow(q, n);
				const like = EvalBinomialPmf(K, N, Q);
				return like;
			};
		}

		const p = 0.5;
		const q = 1 - p;
		const M = 3;

		const onTrapArrivals = spreadDots(null, 301, low=0, high=M);

		const trap1 = new Trap1(onTrapArrivals);

		/// --- plotting --- ///

		var plotData = [];

		trap1.name = `arrivals prior (p=${p})`;
		logSummary(title, trap1, "suite_summary_", 'aqua');
		chargePlot(trap1, plotData, "line");

		trap1.Update([N, K]);

		trap1.name = `arrivals posterior (N=${N}, K=${K}, p=${p})`;
		logSummary(title, trap1, "suite_summary_", 'aqua');
		chargePlot(trap1, plotData, "line");

		renderPlot(title, plotData, "suite_chart_", {x:{title:"Insects (on a trap) per day"},y:{title:"Probability"}});

		/// Результат:

		const metapmf1 = new Pmf();
		const metapmf2 = new Pmf();

		var hypoes = Array.from({length: N+1}, (_, k) => k);

		for(const [arrivals, prob] of trap1.Items())
		{
			var pmf1 = new Pmf();
			var ph = 1 - Math.pow(1-p, arrivals*1);
			hypoes.forEach( (k) => pmf1.Set(k, EvalBinomialPmf(k, N, ph)) );
			metapmf1.Set(pmf1, prob);

			var pmf2 = new Pmf();
			var ph = 1 - Math.pow(1-p, arrivals*days);
			hypoes.forEach( (k) => pmf2.Set(k, EvalBinomialPmf(k, N, ph)) );
			metapmf2.Set(pmf2, prob);
		}

		metapmf1.Normalize();
		var mix1 = MakeMixture(metapmf1);
		mix1.Normalize();

		metapmf2.Normalize();
		var mix2 = MakeMixture(metapmf2);
		mix2.Normalize();

		// По распределению в первый день пытаемся построить распределение во второй

		function insectsUnited(k1, k2, N)
		{
			// В первй день поймано k1 насекомых,
			// во второй день на те же ловушки прилетело k2 (не все будут пойманы, k1 ловушек уже занято)
			// вычисляем пересечения и распределение пойманных за два дня

			var dist = new Pmf();
			hypoes.forEach( (meet) => {
				var p = 0;
				var union = k1 + k2 - meet;

				if (union > N || union < 0) return;

				var u1 = k1 - meet;
				var u2 = k2 - meet;
				var u3 = N - union;

				if( !(u1 < 0 || u2 < 0) )
				{
					p = (((factorial (N) / factorial (meet)) / factorial (u1))/factorial(u2))/factorial(u3);
				}
				dist.Set(union, p);
			} );
			dist.SortMasses();
			dist.Normalize();
			return dist;
		}

		function mixInsects(pmf1, pmf2)
		{
			// pmf1, pmf2 - independent distributions

			var metapmf = new Pmf();
			for(const [k1, p1] of pmf1.Items())
			{
				for(const [k2, p2] of pmf2.Items())
				{
					var p = p1 * p2;
					metapmf.Set(insectsUnited(k1, k2, N), p);
				}
			}
			return MakeMixture(metapmf);
		}

		var daysPmf = mix1.Copy();
		for(var i = 1; i < days; i++)
		{
			daysPmf = mixInsects(daysPmf, mix1) ;
			daysPmf.Normalize();
		}


		// Testing: Binomial

		var binPmf = new Pmf();
		var pBin = 1 - EvalBinomialPmf( 0, days+1, p );
		hypoes.forEach( (k) => binPmf.Set(k, EvalBinomialPmf(k, N, pBin)) );
		binPmf.Normalize();


		// Testing: Poisson distribution

		var poissonPmf1 = new Pmf();
		var lambda = mix1.Mean();
		for(var k = 0; k < N+1; k++)
		{
			poissonPmf1.Set( k, EvalPoissonPmf(k, lambda) ) ;
		}
		poissonPmf1.Normalize();


		/// --- plotting --- ///

		var plotData = [];

		mix1.name = `mix1 (days = ${1}, p=${p})`;
		logSummary(title, mix1, "hist_summary_", 'aqua');
		chargePlot(mix1, plotData, "line");

		mix2.name = `mix2 (days = ${days}, p=${p})`;
		logSummary(title, mix2, "hist_summary_", 'aqua');
		chargePlot(mix2, plotData, "line");

		daysPmf.name = `union mix (days = ${days})`;
		logSummary(title, daysPmf, "hist_summary_", 'aqua');
		chargePlot(daysPmf, plotData, "line");

		binPmf.name = `binomial (p = ${pBin}, days = ${'?'})`;
		logSummary(title, binPmf, "hist_summary_", 'aqua');
		chargePlot(binPmf, plotData, "line");

		poissonPmf1.name = `poisson (lambda = ${lambda.toFixed(3)}, days = ${1})`;
		logSummary(title, poissonPmf1, "hist_summary_", 'aqua');
		chargePlot(poissonPmf1, plotData, "line");

		renderPlot(title, plotData, "hist_chart_", {x:{title:"traps triggered"},y:{title:"Probability"}});
	})();


	(function () {

		// Второй вариант

		const title = "Exercise 7.3: Traps" + ": probabolities";

		class Trap2 extends Suite
		{
			constructor(hypoes, title, name="")
			{
				super(hypoes, title, name);
			};

			Likelihood(data, hypo)
			{
				const [N, K] = data;
				const P = hypo;
				const Q = 1 - P;
				const like = EvalBinomialPmf(K, N, Q);
				return like;
			};
		}

		const probabilities = spreadDots(null, 101, low=0, high=1);

		const trap2 = new Trap2(probabilities);

		/// --- plotting --- ///

		var plotData = [];

		trap2.name = `probabilities prior (uniform)`;
		logSummary(title, trap2, "suite2_summary_", 'navy');
		chargePlot(trap2, plotData, "line");

		trap2.Update([N, K]);

		trap2.name = `probabilities posterior (N=${N}, K=${K})`;
		logSummary(title, trap2, "suite2_summary_", 'navy');
		chargePlot(trap2, plotData, "line");

		renderPlot(title, plotData, "suite2_chart_", {x:{title:"Probability of an insects (in a trap) per day"},y:{title:"Probability"}});

		/// Результат:

		const metapmf1 = new Pmf();
		const metapmf2 = new Pmf();

		const traps = Array.from({length: N+1}, (_, k) => k);

		for(const [prob, probProb] of trap2.Items())
		{
			var pmf1 = new Pmf();
			var ph = 1 - EvalBinomialPmf( 0, 1, prob );
			traps.forEach( (k) => pmf1.Set(k, EvalBinomialPmf(k, N, ph)) );
			metapmf1.Set(pmf1, probProb);

			var pmf2 = new Pmf();
			var ph = 1 - EvalBinomialPmf( 0, days, prob );
			traps.forEach( (k) => pmf2.Set(k, EvalBinomialPmf(k, N, ph)) );
			metapmf2.Set(pmf2, probProb);
		}

		metapmf1.Normalize();
		var mix1 = MakeMixture(metapmf1);
		mix1.Normalize();

		metapmf2.Normalize();
		var mix2 = MakeMixture(metapmf2);
		mix2.Normalize();

		/// --- plotting --- ///

		var plotData = [];

		mix1.name = `mix1 triggered (days = ${1})`;
		logSummary(title, mix1, "hist2_summary_", 'navy');
		chargePlot(mix1, plotData, "line");

		mix2.name = `mix2 triggered (days = ${days})`;
		logSummary(title, mix2, "hist2_summary_", 'navy');
		chargePlot(mix2, plotData, "line");

		renderPlot(title, plotData, "hist2_chart_", {x:{title:"traps triggered"},y:{title:"Probability"}});

	})();

})();
