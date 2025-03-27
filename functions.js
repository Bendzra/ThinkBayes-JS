function Odds(p)
{
	// Computes odds for a given probability.
	// Example: p=0.75 means 75 for and 25 against, or 3:1 odds in favor.
	// Note: when p=1, the formula for odds divides by zero, which is
	// normally undefined.  But I think it is reasonable to define Odds(1)
	// to be infinity, so that's what this function does.
	// p: float 0-1
	// Returns: float odds

	if (p == 1) return Infinity;
	return p / (1 - p);
}

function Probability(o)
{
	// Computes the probability corresponding to given odds.
	// Example: o=2 means 2:1 odds in favor, or 2/3 probability
	// o: float odds, strictly positive
	// Returns: float probability

	return o / (o + 1);
}

function Probability2(yes, no)
{
	// Computes the probability corresponding to given odds.
	// Example: yes=2, no=1 means 2:1 odds in favor, or 2/3 probability.
	// yes, no: int or float odds in favor

	return yes / (yes + no);
}

/////////////////////////////////////////////////////////////////

function MakeCdfFromPmf(pmf, name="")
{
	// Makes a CDF from a Pmf object.
	// Args:
	//    pmf: Pmf.Pmf object
	//    name: string name for the data.
	// Returns:
	//     Cdf object

	var xs = getKeysSorted(pmf.GetDict(), true);

	// arraying accumulated values
	var runsum = 0;
	var cs = [];
	xs.forEach( (x) => { runsum += pmf.Get(x); cs.push(runsum); } );

	// normalizing
	var ps = [];
	var total = runsum;
	cs.forEach( (c) => ps.push(c / total) );

	var cdf = new Cdf(xs, ps, name);
	return cdf;
}

function MakeHistFromList(t, name="")
{
	// Makes a histogram from an unsorted sequence of values.

	// Args:
	//     t: sequence of numbers
	//     name: string name for this histogram

	// Returns: Hist object

	var hist = new Hist(null, name);
	t.forEach( (x) => hist.Incr(x) );

	return hist;
}

function MakeCdfFromHist(hist, name="")
{
	// Makes a CDF from a Hist object.

	// Args:
	//    hist: Pmf.Hist object
	//    name: string name for the data.

	// Returns: Cdf object

	return MakeCdfFromItems(hist.Items(), name);
}

function MakeCdfFromItems(items, name="")
{
	// Makes a cdf from an unsorted sequence of [value, frequency] pairs

	// Args:
	//     items: unsorted sequence of (value, frequency) pairs
	//     name: string name for this CDF

	// Returns: cdf: list of (value, fraction) pairs

	var runsum = 0;
	var xs = [];
	var cs = [];

	var sorted = [...items].toSorted( (a, b) => a[0] - b[0] );

	for(var i = 0; i < sorted.length; i++)
	{
		xs.push( sorted[i][0] );
		runsum += sorted[i][1];
		cs.push( runsum );
	}

	var total = runsum;
	var ps = [];
	for(var i = 0; i < cs.length; i++) ps.push(cs[i] / total);

	var cdf = new Cdf(xs, ps, name);
	return cdf;
}

function MakeCdfFromList(seq, name="")
{
	// Creates a CDF from an unsorted sequence.

	// Args:
	//     seq: unsorted sequence of sortable values
	//     name: string name for the cdf

	// Returns: Cdf object

	var hist = MakeHistFromList(seq)
	return MakeCdfFromHist(hist, name);
}

function MakePmfFromList(t, name="")
{
	// Makes a PMF from an unsorted sequence of values
	// Args:
	//     t: sequence of numbers
	//     name: string name for this PMF
	// Returns: Pmf object

	var hist = MakeHistFromList(t);
	var d = hist.GetDict();

	var pmf = new Pmf(null, name);
	for(var [x, f] of d) { pmf.Set(x, f); }
	pmf.Normalize();

	pmf.SortMasses(true);

	return pmf;
}

function MakePmfFromCdf(cdf, name="")
{
	// Makes a normalized Pmf from a Cdf object
	// Args:
	//     cdf: Cdf object
	//     name: string name for the new Pmf

	if (!name) name = cdf.name;
	var pmf = new Pmf(null, name);
	var prev = 0;
	var items = cdf.Items(); // = array of pairs [val, prob]

	items.forEach( ([val, prob]) => { pmf.Incr(val, prob - prev); prev = prob; } );

	return pmf;
}

/////////////////////////////////////////////////////////////////

function RandomSum(dists)
{
	// Chooses a random value from each dist and returns the sum
	//     dists: sequence of Pmf or Cdf objects
	//     returns: numerical sum

	var total = 0;
	dists.forEach( (dist) => total += dist.Random() );

	return total;
}

function SampleSum(dists, n)
{
	// Draws a sample of sums from a list of distributions
	//     dists: sequence of Pmf or Cdf objects
	//     n: sample size
	// returns: new Pmf of sums

	var arr = [];
	for(var i = 0; i < n; i++)
	{
		arr.push( RandomSum(dists) );
	}

	var pmf = MakePmfFromList(arr);
	return pmf;
}

function MakeMixture(metapmf, name="")
{
	// Make a mixture distribution.

	// Args:
	//   metapmf: Pmf that maps from Pmfs to probs.
	//   name: string name for the new Pmf.

	// Returns: Pmf object.

	var mix = new Pmf(null, name);

	for( const [pmf, p1] of metapmf.Items() )
	{
		for( const [x, p2] of pmf.Items() )
		{
			mix.Incr(x, p1 * p2);
		}
	}
	return mix;
}

function MakeUniformPmf(low, high, n, decimals=8)
{
	// Make a uniform Pmf

	//   low:  lowest value (inclusive)
	//   high: highest value (inclusize)
	//   n:    number of values

	var xs = spreadDots(null, n, low, high, decimals);
	var pmf = new Pmf(xs);
	pmf.Normalize();
	return pmf;
}

/////////////////////////////////////////////////////////////////

function EvalGaussianPdf(x, mu, sigma)
{
	// Computes the unnormalized PDF of the normal distribution.

	// x: value
	// mu: mean
	// sigma: standard deviation

	// returns: float probability density

	var v2 = 2 * sigma * sigma;
	return Math.exp( (x - mu)*(mu - x) /v2) / Math.sqrt(Math.PI * v2);
}

function MakeGaussianPmf(mu, sigma, num_sigmas, n=201)
{
	// Makes a PMF discrete approx to a Gaussian distribution
	//
	//    mu: float mean
	//    sigma: float standard deviation
	//    num_sigmas: how many sigmas to extend in each direction
	//    n: number of values in the Pmf
	//
	//    returns: normalized Pmf

	var pmf = new Pmf();
	var low = mu - num_sigmas * sigma;
	var high = mu + num_sigmas * sigma;

	var xs = spreadDots(null, n, low, high);
	xs.forEach( (x) => {
		var p = EvalGaussianPdf(x, mu, sigma);
		pmf.Set(x, p);
	});
	pmf.Normalize();
	return pmf;
}

const __factorial_memoiza = [];

function factorial (n)
{
	if(n < 0) return false;
	if (n === 0 || n === 1) return 1;
	if (__factorial_memoiza[n] > 0) return __factorial_memoiza[n];
	return __factorial_memoiza[n] = factorial(n-1) * n;
}

function EvalPoissonPmf(k, lambda)
{
	// Computes the Poisson PMF.
	//     k: number of events
	//     lambda: parameter lambda in events per unit time
	//     returns: float probability (for lambda=0 it should be 0.0)

	return lambda ** k * Math.exp(-lambda) / factorial(k);
}

function MakePoissonPmf(lambda, high=10, step=1)
{
	// Makes a PMF discrete approx to a Poisson distribution
	//     lambda: parameter lambda in events per unit time
	//     high: upper bound of the Pmf
	//     returns: normalized Pmf

	var pmf = new Pmf();
	for(var k = 0; k < high + 1; k+=step)
	{
		var p = EvalPoissonPmf(k, lambda);
		pmf.Set(k, p);
	}
	pmf.Normalize();

	return pmf;
}

function EvalExponentialPdf(x, lambda)
{
	// Computes the exponential PDF
	//     x: value
	//     lambda: parameter lambda in events per unit time
	//     returns: float probability density

	return lambda * Math.exp(-lambda * x);
}

function MakeExponentialPmf(lambda, high, n=200)
{
	// Makes a PMF discrete approx to an exponential distribution

	//     lambda:  parameter lambda in events per unit time
	//     high:    upper bound
	//     n:       number of values in the Pmf
	//     returns: normalized Pmf

	var pmf = new Pmf();
	var xs = spreadDots(null, n, 0, high);
	xs.forEach( (x) => {
		var p = EvalExponentialPdf(x, lambda);
		pmf.Set(x, p);
	});
	pmf.Normalize();

	return pmf;
}

/////////////////////////////////////////////////////////////////

function PmfProbLess(pmf1, pmf2)
{
	// Probability that a value from pmf1 is less than a value from pmf2.

	// Args:
	//     pmf1: Pmf object
	//     pmf2: Pmf object

	// Returns:
	//     float probability

	var total = 0;
	for( const [v1, p1] of pmf1.Items() )
	{
		for( const [v2, p2] of pmf2.Items() )
		{
			if (v1 < v2) total += p1 * p2;
		}
	}
	return total;
}


/////////////////////////////////////////////////////////////////

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

function bisectRight(arr, value, lo=0, hi=arr.length)
{
	while (lo < hi)
	{
		var mid = (lo + hi) >> 1;
		if (arr[mid] > value) { hi = mid; }
		else { lo = mid + 1; }
	}
	return hi ;
}

function getKeysSorted(aMap, isNumeric=true)
{
	var xs = [ ...aMap.keys() ];
	
	if(isNumeric)
	{
		xs.sort( function(a, b) { return (a - b);} );
	}
	else
	{
		var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
		xs.sort(collator.compare);
	}

	return xs;
}

function sortMapByKey(aMap, isNumeric=true)
{
	var ordered = new Map();
	var xs = getKeysSorted(aMap, isNumeric);
	xs.forEach( (x) => ordered.set(x, aMap.get(x)) );

	return ordered;
}

function isEmpty(obj) {
	for (const prop in obj) {
		if (Object.hasOwn(obj, prop)) return false;
	}
	return true;
}

function isIterable(obj)
{
	if (!obj) return false;
	return typeof obj[Symbol.iterator] === 'function';
}


function fixFloat(x, decimals=8)
{
	return parseFloat( x.toFixed(decimals) );
}

function spreadDots(dataset, nDots, low=false, high=false, decimals=8)
{
	// создаем array(nDots) равномерно расположенных точек в отрезке [low, high],
	// или вдоль заданного dataset'а (с небольшим перехлестом)

	var mi = 0, ma = 0;

	if( nDots < 1 ) throw new RangeError(`invalid arguments (nDots = ${nDots})`);

	if(!isIterable(dataset))
	{
		if(  typeof low !== 'number' ) throw new RangeError(`invalid arguments (low = ${typeof low})`);
		if( typeof high !== 'number' ) throw new RangeError(`invalid arguments (high = ${typeof high})`);
	}
	else
	{
		mi = Math.min( ...dataset );
		ma = Math.max( ...dataset );
	}
	var overflow = (ma - mi) / 3;

	if(typeof low  !== 'number') low  = mi - overflow;
	if(typeof high !== 'number') high = ma + overflow;

	var xs = [];
	var step = (nDots == 1) ? 1 : (high - low) / (nDots - 1);

	for (var i = 0, prev = low; i < nDots; i++, prev += step)
	{
		xs.push( fixFloat(prev, decimals) );
	}
	return xs;
}
