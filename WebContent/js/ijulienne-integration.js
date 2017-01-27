/*
Copyright 2013 Extensions of Logic Programming - Universitat Politècnica de València

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to use, 
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the 
Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function exportDataAnima() {
	return [ myProgram.getValue().trim(),astate ];
}

function exportDataiJulienne() {
	var res = new Array();
	res.push( myProgram.getValue().trim());
	if (icond != null){
		res.push(EXP_CONDITION);
		res.push(true);
		res.push(icond);
		res.push(icsli);
		icond = null;
		icsli = null;
	}
	return res;
}

function importData() {
	from0to1();
	impData = window.opener.exportDataiJulienne();
	if (impData != null && impData.length > 3){
		myProgram.setValue(impData[0]);
		if (impData[1] == EXP_TRACE){
			$("#taTrace").val(impData[3]);
			from1to2();	
		}
		else { // Is a condition
			if (impData[3].type == TYPE_EQ){
				$("#taReduce").val(impData[3].lhsmeta.trim());
				document.getElementById("selectType").value = "reduce";
				$("#selectType").selectpicker("render");
				selectType();
				generate(true);
			}
			else if (impData[3].type == TYPE_MA){
				$("#taReduce").val(impData[3].rhsmeta.trim());
				document.getElementById("selectType").value = "reduce";
				$("#selectType").selectpicker("render");
				selectType();
				generate(true);
			}
			else if (impData[3].type == TYPE_RW){
				$("#taRewriteStart").val(impData[3].lhsmeta.trim());
				$("#taRewriteEnd").val(impData[3].rhsmeta.trim());
				document.getElementById("selectType").value = "rewrite";
				$("#selectType").selectpicker("render");
				selectType();
				generate(true);
			}
		}
	}
	window.opener = null;
}
