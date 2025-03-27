///////////////////////////////////////////////////////////////////////////////
// 3.6 Cumulative distribution functions
//
// If we need to compute more than a few percentiles,
// it is more eficient to use a cumulative distribution function, or Cdf.

(function () {

	class Train extends Suite
	{
		constructor(hypoes, title, alpha=1)
		{
			super(hypoes, title);

			// Re-Initializes the distribution (power law)
			for(var i = 0; i < hypoes.length; i++)
			{
				this.Set( hypoes[i], Math.pow( hypoes[i], -alpha ) );
			}
			this.Normalize();
		};

		Likelihood = function(data, hypo)
		{
			if (hypo < data) return 0;
			else return 1 / hypo;
		};

	}

	// -------------------- Cdf -------------------- //

	function Cdf(xs, ps, name="")
	{
		function bisectLeft(arr, value, lo=0, hi=arr.length)
		{
			while (lo < hi)
			{
				var mid = (lo + hi) >> 1;
				if (arr[mid] < value) { lo = mid + 1; }
				else { hi = mid; }
			}
			return lo;
		}

		this.Value = function(p)
		{
	        /* ------------------
			Returns InverseCDF(p), the value that corresponds to probability p.

	        Args:
	            p: number in the range [0, 1]

	        Returns:
	            number value
			------------------  */


	        if (p < 0 || p > 1)
			{
	            throw new RangeError('Probability p must be in range [0, 1]');
			}

	        if (p == 0) return xs[0];
	        if (p == 1) return xs[xs.length - 1];
			var index = bisectLeft(ps, p);
	        if (p == ps[index + 1]) { return xs[index + 1]; }
	        else { return xs[index]; }
		}

	    this.Percentile = function(p)
		{
	        /* ------------------
			Returns the value that corresponds to percentile p.

	        Args:
	            p: number in the range [0, 100]

	        Returns:
	            number value
			------------------  */

	        return this.Value(p / 100);
		}
	}

	function MakeCdf(masses, name="")
	{
	    var xs = [];
		for(var [k, p] of masses) xs.push(k);

		var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
		xs.sort(collator.compare);

	    var runsum = 0;
	    var cs = [];
		for(var i = 0; i < xs.length; i++)
		{
			runsum += masses.get(xs[i]);
			cs.push(runsum);
		}

		var ps = [];
		var total = runsum;
		for(var i = 0; i < cs.length; i++)
		{
			ps.push(cs[i] / total);
		}

		// console.log(name, xs);

		var cdf = new Cdf(xs, ps, name);
	    return cdf;
	}

	// -------------------- test -------------------- //

	var title = "3.6 Cumulative distribution functions";
	console.log( title );

	var N = [500, 1000, 2000];

	for(var k = 0; k < N.length; k++)
	{
		var hypoes = new Array(N[k]); for (var i = 0; i < N[k]; i++) { hypoes[i] = i + 1; }
		var suite = new Train(hypoes, title);
		if (k == 0) suite.msgDiv.innerHTML += "<dt>" + title + ": </dt>" ;

		// var data = [60];
		var data = [60, 60, 30, 90];

		for(var i = 1; i < data.length; i++)
		{
			suite.Update(data[i])
		}

		var cdf = MakeCdf( suite.GetDict() );
		var interval = [cdf.Percentile(5), cdf.Percentile(95)];

		console.log("", "Upper Bound = ", N[k], "; interval = ", JSON.stringify(interval) );
		suite.msgDiv.innerHTML += "<dd>" + "Upper Bound = " + N[k] + "; interval = " + JSON.stringify(interval) + "</dd>" ;
	}

})();
