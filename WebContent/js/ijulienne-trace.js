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

iJulienneTrace = function () {
	this.isSource = true;
	this.showState = true;
	this.showRule = true;
	this.showRedex = true;
	
	this.colorDefault = "#FFFFFF";
	this.colorInstrumented = "#8CFFC5";
	this.colorSelected = "#FBEC5D";
	
	this.dbNodes = [];
	
	this.kinds = null;
	this.program = null;
	this.Selected = null;
	this.iState = null;
	this.fState = null;
	this.hasSlice = false;
	
	this.mode = MODE_BACKWARD;
	this.cond = null;
	this.condmeta = null;
	
	this.trusted = true;
};

iJulienneTrace.prototype.getLength = function(){
	return this.dbNodes == null?0:this.dbNodes.length;
};

iJulienneTrace.prototype.getState = function(id){
	if (this.dbNodes == null || this.dbNodes.length == 0 || id >= this.dbNodes.length)
		return null;
	return this.dbNodes[id];
};

iJulienneTrace.prototype.add = function(slice,id,term,rule,sub,cond,pos){
	sub = (sub == null || sub.length == 0)?[]:sub;
    cond = (cond == null || cond.length == 0)?[]:cond;
    this.dbNodes.push(new iJulienneState(this,id,term,undefined,rule,sub,[],cond,[],pos));
};

iJulienneTrace.prototype.addsli = function(slice,id,term,slice,rule,sub,subsli,cond,condsli,pos,rel){
	sub = (sub == null || sub.length == 0)?[]:sub;
    subsli = (subsli == null || subsli.length == 0)?[]:subsli;
	cond = (cond == null || cond.length == 0)?[]:cond;
    condsli = (condsli == null || condsli.length == 0)?[]:condsli;
	this.dbNodes.push(new iJulienneState(this,id,term,slice,rule,sub,subsli,cond,condsli,pos));
	this.dbNodes[this.dbNodes.length-1].relevant = rel;
};

iJulienneTrace.prototype.getSelectedLHS = function(){
	return (this.mode == MODE_BACKWARD || this.mode == MODE_ORIGINS)?this.dbNodes[this.Selected.id-1]:this.Selected;
};

iJulienneTrace.prototype.getSelectedRHS = function(){
	return (this.mode == MODE_BACKWARD || this.mode == MODE_ORIGINS)?this.Selected:this.dbNodes[this.Selected.id+1];
};

iJulienneTrace.prototype.setSelected = function(idx) {
	if (this.mode == MODE_BACKWARD || this.mode == MODE_ORIGINS){
		if (idx == null || isNaN(idx)) 
			idx = this.fState.id;
		else {
			idx = Math.min(idx,this.fState.id);
			idx = Math.max(this.iState.id+1,idx);
		}
	}
	else {
		if (idx == null || isNaN(idx))
			idx = 0;
		else {
			idx = Math.min(idx,this.fState.id-1);
			idx = Math.max(this.iState.id,idx);
		}
	}
	this.Selected = this.dbNodes[idx];
};

iJulienneTrace.prototype.selectFirst = function(){
	this.setSelected((this.mode == MODE_BACKWARD || this.mode == MODE_ORIGINS)?this.iState.id+1:this.iState.id);
};

iJulienneTrace.prototype.selectPrev = function(){
	this.setSelected(this.Selected.id-1);
};

iJulienneTrace.prototype.selectNext = function(){
	this.setSelected(this.Selected.id+1);
};

iJulienneTrace.prototype.selectLast = function(){
	this.setSelected((this.mode == MODE_BACKWARD || this.mode == MODE_ORIGINS)?this.fState.id:this.fState.id-1);
};

iJulienneTrace.prototype.getInstrumentedTrace = function(ini,fin) {
	res = [];
	if (ini >= fin) return null;
	for(var i = ini; i < fin; i++)
		res.push("(("+this.dbNodes[i].term.meta+") ->^{"+this.dbNodes[i+1].rule.meta+","+this.dbNodes[i+1].getMaudeSub()+","+this.dbNodes[i+1].pos+"} ("+this.dbNodes[i+1].term.meta+"))\n");
	return res.join("");
};

iJulienneTrace.prototype.getCriteria = function(){
	var criteria = [];
	for(var i = this.iState.id; i <= this.fState.id; i++)
		criteria.push([i,this.dbNodes[i].criteria.length > 0?this.dbNodes[i].criteria:"noPos"]);
	return criteria;
};

iJulienneTrace.prototype.clearCriteria = function() {
	for(var i = 0 ; i < this.dbNodes.length; i++)
		this.dbNodes[i].clearCriteria();
};

iJulienneTrace.prototype.getOrigins = function(){
	var origins = [];
	for(var i = this.iState.id; i <= this.fState.id; i++)
		origins.push([i,this.dbNodes[i].origins.length > 0?this.dbNodes[i].origins:"noPos"]);
	return origins;
};

iJulienneTrace.prototype.clearOrigins = function() {
	for(var i = 0 ; i < this.dbNodes.length; i++)
		this.dbNodes[i].clearOrigins();
};

iJulienneTrace.prototype.getRelevantRules = function() {
	var res = [];
	
	for(var i = 0; i < this.program.rls.length; i++)
		res.push(this.program.rls[i].val);
	for(var i = 0; i < this.program.eqs.length; i++)
		res.push(this.program.eqs[i].val);
	return res.unique();
};

iJulienneTrace.prototype.getRelevantOps = function() {
	var res = [];
	for(var i = 0; i < this.program.ops.length; i++)
		res.push(this.program.ops[i].op.split(" "));
	return res;
};

iJulienneTrace.prototype.getRelevantClasses = function() {
	var res = [];
	for(var i = 0; i < this.program.clss.length; i++)
		res.push(this.program.clss[i].val);
	return res.unique();
};

iJulienneTrace.prototype.getTraceHTML = function(mode) {
	var res = "";
	var html = [];	
	var steps = 1;
	var sizen = 0;
	var sizes = 0;
	var state;
	if (myTrace.hasSlice){
		for(var i = myTrace.iState.id; i <= myTrace.fState.id; i++){
			state = myTrace.getState(i);
			if (mode == TRACE_LARGE || state.rule == null || (mode == TRACE_MEDIUM && (state.rule.label!="flattening" && state.rule.label!="unflattening")) || (mode == TRACE_SMALL && (state.rule.label!="flattening" && state.rule.label!="unflattening" && state.rule.label!="builtIn")))
				html.push("<tr id=\"tabres" + i + "\"><td>" + (i+1) + "</td><td>"+(state.id==0?"'Start":(state.rule.label=="flattening"?"toBnf":(state.rule.label=="unflattening"?"fromBnf":state.rule.label)))+"</td><td>"+state.getHTML(false,true)+"</td><th class=\"slicedTraceStep\">"+state.getHTML(true,true)+"</th></tr>");
			sizen += state.getSize(false);
			if ((state.relevant && !myTrace.trusted) || (state.relevant && myTrace.trusted && state.rule != null && state.rule.label != "builtIn"))
				sizes += state.getSize(true);
			steps++;
		}
		res = "<table id=resultsTable class=\"gridtable hyphenate\" style=\"width: 100%;\"><tr><th style=\"width: 45px; text-align: center;\">State</th><th style=\"width: 100px; text-align: center;\">Label</th><th style=\"text-align: center;\">Original trace</th><th style=\"text-align: center;\">Sliced trace</th></tr>" + html.join(""); 
		if (!myTrace.isSource)
			res += "<tr><td colspan=2 style=\"text-align: right;\"><b>Compatibility<br>condition: </b></td><td colspan=2>" + myTrace.condmeta + "</td></tr>";
		res += "<tr><td class=\"total\" colspan=2><b>Total size: </b></td><td class=\"total\">"+sizen+"&nbsp;bytes</td><td class=\"total\">"+sizes+"&nbsp;bytes</td></tr><tr><td class=reduction colspan=4><b>Reduction Rate: </b>"+Math.ceil((1-(sizes/sizen))*100)+"%</td></tr></table>";
	}
	else {
		for(var i = myTrace.iState.id; i <= myTrace.fState.id; i++){
			state = myTrace.getState(i);
			html.push("<tr id=\"tabres" + i + "\"><td style=\"text-align: center;\">" + (i+1) + "</td><td>"+(state.id==0?"'Start":(state.rule.label=="flattening"?"toBnf":(state.rule.label=="unflattening"?"fromBnf":state.rule.label)))+"</td><td>"+state.getHTML(false,true)+"</td></tr>");
			sizen += state.getSize(false);
			steps++;
		}
		res = "<table id=resultsTable class=\"gridtable hyphenate\" style=\"width: 100%;\"><tr><th style=\"width: 45px; text-align: center;\">State</th><th style=\"width: 100px; text-align: center;\">Label</th><th style=\"text-align: center;\">Trace</th></tr>" + html.join("") + "<tr><td class=\"total\" colspan=2 style=\"background-color: #FFA6A6; text-align: right;\"><b>Size: </b></td><td class=\"total\" style=\"background-color: #FFA6A6;\">"+sizen+"&nbsp;bytes</td></tr></table>";
	}
	return res;
};
