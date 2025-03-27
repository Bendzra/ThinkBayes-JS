////////////////////////////////////////
// 2.4 The Monty Hall problem

function Monty(hypoes)
{
	Pmf.call(this);
	function init(self, hypoes)
	{
		for(var i = 0; i < hypoes.length; i++) { self.Set(hypoes[i], 1); }
		self.Normalize();
	}

	init(this, hypoes);

	this.Likelihood = function(data, hypo)
	{
		/* 	The likelihood of the data (D) under the hypothesis (H) = p(D|H).
			data: Monty chooses Door 'D' and there is no car there
			hypo: the car */

		if (hypo == data) return 0;
		else if (hypo == 'A' ) return 0.5;
		else return 1;
	}

	this.Update = function(data)
	{
		/* Updates each hypothesis based on the data.
		data: any representation of the data
		returns: the normalizing constant */

		for( var [hypo, prob] of this.GetDict() )
		{
			var like = this.Likelihood(data, hypo);
			this.Mult(hypo, like);
		}
		return this.Normalize();
	}
}

// You pick a door, which we will call Door A.
// We'll call the other doors B and C.
// A, B, and C represent the hypothesis that
// the car is behind Door A, Door B, or Door C.
var hypoes = ['A', 'B', 'C'];
var pmf = new Monty(hypoes);

// In this case D consists of two parts:
// Monty chooses Door B and there is no car there.
var data = "B";
pmf.Update(data);

console.log("2.4 The Monty Hall problem", pmf.GetDict() );
messageDiv.innerHTML += "<dt>2.4 The Monty Hall problem: </dt>";
messageDiv.innerHTML += "<dd>P(<b>A|" + data + "</b>) = " + pmf.Prob('A') + ";</dd>"
					  + "<dd>P(<b>B|" + data + "</b>) = " + pmf.Prob('B') + ";</dd>"
					  + "<dd>P(<b>C|" + data + "</b>) = " + pmf.Prob('C') + "</dd><br/>" ;
