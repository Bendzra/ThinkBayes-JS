////////////////////////////////////////
// 2.5 Encapsulating the framework

class Monty2 extends Suite
{
	constructor(hypoes)
	{
		super(hypoes);
	};
	
	Likelihood(data, hypo)
	{
		if (hypo == data) return 0;
		else if (hypo == 'A' ) return 0.5;
		else return 1;
	};
}

var hypoes = ['A', 'B', 'C'];
var suite = new Monty2( hypoes );

var data = "B";
suite.Update(data);
suite.Print("2.5 Encapsulating the framework", data)
