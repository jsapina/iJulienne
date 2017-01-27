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

function getTopSorts(){
	var res = new Array("\n","\n");
	var topSortCount = 0;
	
	for(var i = 0; i < myTrace.kinds.length; i++){
		if (myTrace.kinds[i].indexOf(",") != -1){
			 tmp = myTrace.kinds[i].split(",");
			 res[0] += "sort ELPTOP"+topSortCount+" .\n";
			 res[0] += "subsorts " + (myTrace.kinds[i].split(",")).join(" ") + " < ELPTOP"+topSortCount+" .\n";
			 res[1] += "  op ELPIDENTIFY : -> ELPTOP"+topSortCount+" .\n  op ELPDISCARD : -> ELPTOP"+topSortCount+" .\n";
			 topSortCount++;
		}
		else
			res[1] += "  op ELPIDENTIFY : -> "+myTrace.kinds[i]+" .\n  op ELPDISCARD : -> "+myTrace.kinds[i]+" .\n";
	}
	return res;
}

function highlightQueryResults(){
	clearHighlighting();
	var criteria = myTrace.getCriteria();
	if (criteria != null && criteria.length > 0) {
		for(var i = 0; i < criteria.length; i++){
			if (myTrace.isSource){
				highlightCriteria(document.getElementById("tData"+criteria[i][0]),myTrace.getState(criteria[i][0]).getMap(false),criteria[i][1]);
				if (myTrace.hasSlice)
					highlightCriteria(document.getElementById("sData"+criteria[i][0]),myTrace.getState(criteria[i][0]).getMap(true),criteria[i][1]);
			}
			else {
				highlightCriteriaMeta($("#tData"+criteria[i][0]),criteria[i][1]);
				if (myTrace.hasSlice)
					highlightCriteriaMeta($("#sData"+criteria[i][0]),criteria[i][1]);
			}
		}
	}
	else if ($("#taInfo").is(":visible")) {
		$("#taInfo").html($("#tData"+myTrace.Selected.id).html());
	}
	$(".highlighted").on("mouseup", function() {
		$("#tData"+myTrace.iState.id).getHighlighter().removeHighlights(this);
		highlightQueryResults();
	});
}

function mergeOffsets(offsets){
	if (offsets == null || offsets.length == 1)
		return offsets;
	var res = new Array(offsets[0]);
	for(var i = 1; i < offsets.length; i++){
		var aux = res.pop();
		if ((aux[0] + aux[1]) >= offsets[i][0]){
			aux[1] = (offsets[i][0] - aux[0]) + offsets[i][1];
			res.push(aux);
		}
		else{
			res.push(aux);
			res.push(offsets[i]);
		}
	}
	return res;
}

function getListOfStates() {
	var res = "";
	if (myTrace != null){
		for(var i = myTrace.iState.id; i <= myTrace.fState.id; i++){
			if (myTrace.getState(i) != null && myTrace.getState(i).id >= 0){
				res+= "{" + myTrace.getState(i).id + " , (" + myTrace.getState(i).term.meta + ")} "; 
			}
		}
	}
	return res.trim();
}

function getMatchingStatesHTML(){
	var COLS = 20;
	html = "<table class=\"tMatchingStates\">";
	var mouse = " onclick=\"selectQueryState(this)\" onMouseOver=\"mouseOverQueryState(this,true)\" onMouseOut=\"mouseOverQueryState(this,false)\" ";
	for(var i = myTrace.iState.id; i <= myTrace.fState.id; i++){
		if(i % COLS == myTrace.iState.id)
			html+= "<tr>";
		html+="<th id=\"qs" + i + "\"" + mouse + "class=\""+(myTrace.getState(i).criteria.length==0?"QueryStateNotFound":"QueryStateFound")+"\">"+(i+1)+"</th>";
		if(i % COLS == (myTrace.iState.id-1))
			html+= "</tr>";
	}
	html += "</table>";
	return html;
}

function mouseOverQueryState(ele, aux){
	ele.style.cursor="pointer";
	if (aux)
		$(ele).addClass("QueryStateMouseOver");
	else
		$(ele).removeClass("QueryStateMouseOver");
}

function selectQueryState(ele){
	for(var i = myTrace.iState.id; i <= myTrace.fState.id; i++)
		$("#qs"+i).removeClass("QueryStateSelected");
	$(ele).addClass("QueryStateSelected");
	var sta = parseInt(ele.id.slice(2)); 
	goTo(sta,true);
	$("#taQuery").html($("#tData"+myTrace.Selected.id).html());
}

function selectQueryStateById(id){
	if ($("#queryWindowWrapper").is(":visible")){
		for(var i = myTrace.iState.id; i <= myTrace.fState.id; i++)
			$("#qs"+i).removeClass("QueryStateSelected");
		$("#qs"+id).addClass("QueryStateSelected");
	}
}