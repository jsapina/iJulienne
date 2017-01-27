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

iJulienneState = function (trace, id, term, slice, rule, sub, subsli, cond, condsli, pos) {
    this.trace = trace;
	this.id = id;
    this.term = term;
	this.slice = slice;
	this.rule = rule;
	this.sub = sub;
	this.subsli = subsli;
	this.cond = cond;
	this.condsli = condsli;
	this.pos = pos;
	this.isSelected = false;
	this.criteria = [];
    this.origins = [];
	this.relevant = true;
};

iJulienneState.prototype.getTerm = function(sli){
	if (sli)
        return this.trace.isSource?this.slice.source:this.slice.meta;
    else
        return this.trace.isSource?this.term.source:this.term.meta;
};

iJulienneState.prototype.getHTML = function(sli,hide){
	if (sli) {
		if (hide) {
			var builtIn = (this.rule != null && this.rule.label == "builtIn"); 
			return this.trace.isSource?
	                hideIrrelevant(convertHTMLSymbols(this.slice.source),true,this.relevant,builtIn):
	                hideIrrelevant(colorSlicedStateMeta(this.slice.meta),false,this.relevant,builtIn);
		}
		else
			return this.trace.isSource?convertHTMLSymbols(this.slice.source):colorSlicedStateMeta(this.slice.meta);
	}
	else
		return this.trace.isSource?convertHTMLSymbols(this.term.source):this.term.meta;
};

iJulienneState.prototype.getSize = function(sli){
	if (sli) {
		if (!this.relevant) return 0;
		return revertHTMLSymbols(removeIrrelevant(convertHTMLSymbols(this.slice.source),true)).replace(/[ \s\t]/g,"").length;
	}
	else
		return this.term.source.replace(/[ \s\t]/g,"").length;
};

iJulienneState.prototype.getMap = function(sli){
	return sli?this.slice.map:this.term.map;
};

iJulienneState.prototype.getLabel = function () {
	return this.rule.label;
};

iJulienneState.prototype.getRule = function () {
	return this.trace.isSource?this.rule.source:this.rule.meta;
};

iJulienneState.prototype.getSubstitution = function (sliced) {
	var sb = sliced?this.subsli:this.sub;
	
	if (sb === undefined || sb.length == 0)
		return this.trace.isSource?"None":"(none).Substitution";
	
	if (this.trace.isSource){
		var res = sb[0].vr.source + " / " + sb[0].vl.source; 
		for(var i = 1; i < sb.length; i++)
			res+= "ELP-SUBSEP" + sb[i].vr.source + " / " + sb[i].vl.source;
		return res;
	}
	else {
		var res = sb[0].vr.meta + " <- " + sb[0].vl.meta; 
		for(var i = 1; i < sb.length; i++)
			res+= "ELP-SUBSEP" + sb[i].vr.meta + " <- " + sb[i].vl.meta;
		return res;
	}
};

iJulienneState.prototype.getPosition = function () {
	return this.pos;
};

iJulienneState.prototype.getRedex = function(){
	return convertHTMLSymbols(this.trace.isSource?this.term.source:this.term.meta);
};

iJulienneState.prototype.getMaudeTerm = function(sli) {
	if (sli)
        return this.trace.isSource?this.slice.source:this.slice.meta;
    else
        return this.trace.isSource?this.term.source:this.term.meta;
};

iJulienneState.prototype.getMaudeSub = function() {
	if (this.sub === undefined || this.sub.length == 0)
		return "none";
	var res = this.sub[0].vr.meta + " <- " + this.sub[0].vl.meta
	for (var i = 1 ; i < this.sub.length; i++)
		res += " ; " + this.sub[i].vr.meta + " <- " + this.sub[i].vl.meta;
	return res;
};

iJulienneState.prototype.clearCriteria = function() {
	this.criteria = [];
};

iJulienneState.prototype.addCriteria = function(pos) {
	this.criteria.push(pos);
};

iJulienneState.prototype.delCriteria = function(pos) {
	if (pos instanceof Array){
		for(var i = 0; i < pos.length; i++){
			var idx = this.criteria.indexOf(pos[i]);
			if (idx > -1)
				this.criteria.splice(idx,1);
		}
	}
	else {
		var idx = this.criteria.indexOf("pos");
		if (idx > -1)
			this.criteria.splice(idx,1);
	}
};

iJulienneState.prototype.clearOrigins = function() {
	this.origins = [];
};

iJulienneState.prototype.addOrigins = function(pos) {
	this.origins.push(pos);
};

iJulienneState.prototype.delOrigins = function(pos) {
	if (pos instanceof Array){
		for(var i = 0; i < pos.length; i++){
			var idx = this.origins.indexOf(pos[i]);
			if (idx > -1)
				this.origins.splice(idx,1);
		}
	}
	else {
		var idx = this.origins.indexOf("pos");
		if (idx > -1)
			this.origins.splice(idx,1);
	}
};

iJulienneState.prototype.getCondition = function(){
	return this.cond;
};

iJulienneState.prototype.getConditionAt = function (idx) {
	var cond = this.getCondition();
	return (cond == null || cond.length <= idx)?null:cond[idx];
};

iJulienneState.prototype.getConditionSlice = function(){
	return this.condsli;
};

iJulienneState.prototype.getConditionSliceAt = function (idx) {
	var cond = this.getConditionSlice();
	return (cond == null || cond.length <= idx)?null:cond[idx];
};
