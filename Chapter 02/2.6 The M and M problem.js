////////////////////////////////////////
// 2.6 The M&M problem

var mix94 = { "brown": 30, "yellow": 20,    "red": 20,  "green": 10, "orange": 10,   "tan": 10 };
var mix96 = {  "blue": 24,  "green": 20, "orange": 16, "yellow": 14,    "red": 13, "brown": 13 };

// hypoA represents the hypothesis that Bag 1 is from 1994 and Bag 2 from 1996.
// hypoB is the other way around.
var hypoA = { "bag1": mix94, "bag2": mix96};
var hypoB = { "bag1": mix96, "bag2": mix94};

var hypotheses = { "A": hypoA, "B": hypoB};

class M_and_M extends Suite
{
	constructor(hypoes)
	{
		super(hypoes);
	};

	Likelihood(data, hypo)
	{
		var bag   = data[0];
		var color = data[1];
		var mix   = hypotheses[hypo][bag];
		var like  = mix[color];
		return like;
	};
}

var hypoes = ["A", "B"];
var suite = new M_and_M( hypoes );

var data = ['bag1', 'yellow']; var s = data;
suite.Update( data );
data = ['bag2', 'green']; s += " &amp; " + data;
suite.Update( data );

suite.Print( "2.6 The M&M problem", s );
