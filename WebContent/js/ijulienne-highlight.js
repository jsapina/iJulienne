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

function fnSelect(ele, node, offS, offE) {
	fnDeSelect();
	if (node != null){
		var range = document.createRange();
		range.setStart(node,offS);
		range.setEnd(node, offE);
		window.getSelection().addRange(range);
		$("#"+ele.id).getHighlighter().doHighlight();
	}
	fnDeSelect();
}

function fnDeSelect() {
	if (document.selection) document.selection.empty(); 
	else if (window.getSelection)
		window.getSelection().removeAllRanges();
}

function getStringIndices(map,pos){
	var res = new Array();
	var aux = 0;
	
	for(var i = 0; i < map.length; i++){
		if (map[i][1].split(" , ")[0] == pos && map[i][0] != 0)
			res.push(new Array(aux, map[i][0]));
		aux += map[i][0];
	}
	return res;
}

function highlightCriteria(ele,map,criteria){
	if (criteria != null && criteria.length != 0 && criteria != "noPos"){
		var offsets = new Array();
		for(var i = 0; i < criteria.length; i++){
			var aux = offsets.concat(getStringIndices(map,criteria[i]));
			offsets = aux;
		}
		offsets = mergeOffsets(offsets.sort(function(a,b){return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;}));
		for(var i = 0; i < offsets.length; i++)
			if (offsets[i] != null && offsets[i].length > 1)
				doAutomaticSelection(ele, offsets[i][0],offsets[i][1]);
	}
}

function highlightCriteriaMeta(ele,criteria){
	if (criteria != null && criteria.length != 0 && criteria != "noPos"){
		var str = ele.text();
		var pos = 1;
		var res = new Array();
		var offsets = new Array();
		var off = 0;
		var len = 0;
	
		for (var i = 0; i < str.length; i++) {
			if(str.charAt(i)=='[' && str.charAt(i-1) != '`') {
				if (criteria.indexOf((res.length > 0? "Lambda . "+res.join(" . ") : "Lambda")) != -1) {
					offsets.push([off,len+1]);
				}
				off = i+1;
				len = -1;
				res.push(pos);
				pos = 1;
			}
			else if (str.charAt(i) == ']' && str.charAt(i-1) != '`') {
				if (criteria.indexOf((res.length > 0? "Lambda . "+res.join(" . ") : "Lambda")) != -1 && len > 0) {
					offsets.push([off,len]);
				}
				off = i+1;
				len = -1;
				pos = res.pop();
				if (criteria.indexOf((res.length > 0? "Lambda . "+res.join(" . ") : "Lambda")) != -1)
					offsets.push([off-1,1]);
			}
			else if (str.charAt(i) == ',' && str.charAt(i-1) != '`') {
				if (criteria.indexOf((res.length > 0? "Lambda . "+res.join(" . ") : "Lambda")) != -1 && len > 0) {
					offsets.push([off,len]);
				}
				off = i+1;
				len = -1;
				pos = res.pop();
				if (criteria.indexOf((res.length > 0? "Lambda . "+res.join(" . ") : "Lambda")) != -1)
					offsets.push([off-1,1]);
				pos++;			
				res.push(pos);
				pos = 1;
			}
			len++;
		}
		if (str.charAt(str.length-1) != "]")
			offsets.push([off,len]);
		offsets = mergeOffsets(offsets.sort(function(a,b){return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;}));
		for(var i = 0; i < offsets.length; i++)
            doAutomaticSelection(ele.get(0), offsets[i][0],offsets[i][1]);
	}
}

function doAutomaticSelection(ele, pos,len){
	if (ele == null) return;
	autoselect = true;
	var dataS = getRangeDataS(ele,pos); 		//nodeS,offS,i 
	var dataE = getRangeDataE(ele,(pos+len)); 	//nodeE,offE,j
	var children = [];
	
	for(var i = 0; i < ele.childNodes.length; i++)
		children.push(ele.childNodes[i]);
	
	if (dataS[0] != dataE[0]){
		if (dataS[0].className != "bullet")
			fnSelect(ele, dataS[0],dataS[1], (dataS[0].textContent.length));
		for (var i = dataS[2]+1; i < dataE[2]; i++)
			if (children[i].className != "bullet")
				fnSelect(ele, children[i],0,children[i].textContent.length);
		if (dataE[0].className != "bullet")
			fnSelect(ele, dataE[0],0, dataE[1]);
	}
	else
		if (dataS[0].className != "bullet")
			fnSelect(ele, dataS[0],dataS[1], dataE[1]);
	autoselect = false;
}

function getRangeDataS(ele,pos){
	for (var i = 0 ; i < ele.childNodes.length; i++){
		// Greater or equal
		if (pos >= ele.childNodes[i].textContent.length)
			pos -= ele.childNodes[i].textContent.length;
		else
			return [ele.childNodes[i],pos,i];
	}
}

function getRangeDataE(ele,pos){
	for (var i = 0 ; i < ele.childNodes.length; i++){
		// Only greater
		if (pos > ele.childNodes[i].textContent.length)
			pos -= ele.childNodes[i].textContent.length;
		else
			return [ele.childNodes[i],pos,i];
	}
}

function metaBulletSelected(range){
	if (range != null && range.commonAncestorContainer != null){
		if (range.commonAncestorContainer.parentElement != null && range.commonAncestorContainer.parentElement.className == "bullet")
			return true;
		if (range.commonAncestorContainer.children != null){
			for(var i = 0; i < range.commonAncestorContainer.children.length; i++){
				if (range.commonAncestorContainer.children[i].className == "bullet")
					return true;
			}
		}
	}
	return false;
}

function clearHighlighting() {
	if (myTrace != null && myTrace.getLength() != 0){
		autodelete = true;
		for(var i = myTrace.iState.id; i <= myTrace.fState.id; i++){
			if ($("#tData"+myTrace.getState(i).id) != null && $("#tData"+myTrace.getState(i).id).length > 0)
				$("#tData"+myTrace.getState(i).id).getHighlighter().removeHighlights();
			if (myTrace.hasSlice && $("#sData"+myTrace.getState(i).id) != null && $("#sData"+myTrace.getState(i).id).length > 0)
				$("#sData"+myTrace.getState(i).id).getHighlighter().removeHighlights();
		}
		autodelete = false;
	}
}

function getDeletedPosition(nodeid,div,slice) {
    var SPAN_HIGHLIGHTED = "<span class=\"highlighted hyphenate\">";
    var SPAN_NO_HIGHLIGHTED = "<span class=\"delhighlighted\">";
    var SPAN_BULLET = "<span class=\"bullet\">";
    var CLOSE_SPAN = "</span>";
    
	var map = myTrace.getState(nodeid).getMap(slice);
	var html = revertHTMLSymbols((div=="taInfo" || div == "taQuery")?$("#"+div).html():$((slice?"#sData":"#tData")+nodeid).html()).replace(/\<sub\>/g,"").replace(/[0-9]+\<\/sub\>/g,"");
	if (html.indexOf(SPAN_NO_HIGHLIGHTED) == -1)
		return "noPos";
	var inside = false;
	var mask = "";
	var criteria = new Array();
	var record = false;
	
	for (var i = 0; i < html.length; i++){
		if (i+SPAN_HIGHLIGHTED.length < html.length && html.substring(i,i+SPAN_HIGHLIGHTED.length) == SPAN_HIGHLIGHTED) {
			inside = true;
			i+=(SPAN_HIGHLIGHTED.length-1);
		}
		else if (i+SPAN_NO_HIGHLIGHTED.length < html.length && html.substring(i,i+SPAN_NO_HIGHLIGHTED.length) == SPAN_NO_HIGHLIGHTED) {
			inside = true;
			record = true;
			i+=(SPAN_NO_HIGHLIGHTED.length-1);
		}
		else if (inside && !record && i+CLOSE_SPAN.length < html.length && html.substring(i,i+CLOSE_SPAN.length) == CLOSE_SPAN) {
			inside = false;
			i+=(CLOSE_SPAN.length-1);
		}
		else if (inside && record && i+CLOSE_SPAN.length < html.length && html.substring(i,i+CLOSE_SPAN.length) == CLOSE_SPAN) {
			inside = false;
			record = false;
			i+=(CLOSE_SPAN.length-1);
		}
		else if (i+SPAN_BULLET.length < html.length && html.substring(i,i+SPAN_BULLET.length) == SPAN_BULLET)
			i+=(SPAN_BULLET.length-1);
		else if (i+CLOSE_SPAN.length < html.length && html.substring(i,i+CLOSE_SPAN.length) == CLOSE_SPAN)
			i+=(CLOSE_SPAN.length-1);
		else if (inside && record)
			mask += "S";
		else
			mask += "n";
	}
	
	var pos = 0;
	for(var i = 0; i < map.length; i++){
		if(pos+map[i][0] < mask.length && (mask.substring(pos, pos+map[i][0])).indexOf("S") != -1){
			if (map[i][1].indexOf(",") != -1){
				criteria.push(map[i][1].split(",")[0].trim());
				criteria.push(map[i][1].split(",")[1].trim());
			}
			else
				criteria.push(map[i][1]);
		}
		pos+=map[i][0];
	}
	return criteria.unique();
}

function getDeletedPositionMeta(nodeid,div,slice) {
    var SPAN_HIGHLIGHTED = "<span class=\"highlighted hyphenate\">";
    var SPAN_NO_HIGHLIGHTED = "<span class=\"delhighlighted\">";
    var SPAN_BULLET = "<span class=\"bullet\">";
    var CLOSE_SPAN = "</span>";
    
	var html = revertHTMLSymbols((div=="taInfo" || div == "taQuery")?$("#"+div).html():$((slice?"#sData":"#tData")+nodeid).html());
	if (html.indexOf(SPAN_NO_HIGHLIGHTED) == -1)
		return "noPos";
	
	var inside = false;
	var bullet = false;
	var record = false;
	var pos = 1;
	var res = new Array();
	var criteria = new Array();
	
	for (var i = 0; i < html.length-1; i++) {
		if (i+SPAN_HIGHLIGHTED.length < html.length && html.substring(i,i+SPAN_HIGHLIGHTED.length) == SPAN_HIGHLIGHTED){
			inside = true;
			i+=(SPAN_HIGHLIGHTED.length-1);
		}
		if (i+SPAN_NO_HIGHLIGHTED.length < html.length && html.substring(i,i+SPAN_NO_HIGHLIGHTED.length) == SPAN_NO_HIGHLIGHTED){
			inside = true;
			record = true;
			i+=(SPAN_NO_HIGHLIGHTED.length-1);
		}
		else if (i+SPAN_BULLET.length < html.length && html.substring(i,i+SPAN_BULLET.length) == SPAN_BULLET){
			bullet = true;
			i+=(SPAN_BULLET.length-1);
		}
		else if (bullet && i+CLOSE_SPAN.length < html.length && html.substring(i,i+CLOSE_SPAN.length) == CLOSE_SPAN){
			bullet = false;
			i+=(CLOSE_SPAN.length-1);
		}
		else if (inside && !record && i+CLOSE_SPAN.length < html.length && html.substring(i,i+CLOSE_SPAN.length) == CLOSE_SPAN){
			inside = false;
			i+=(CLOSE_SPAN.length-1);
		}
		else if (inside && record && i+CLOSE_SPAN.length < html.length && html.substring(i,i+CLOSE_SPAN.length) == CLOSE_SPAN){
			inside = false;
			record = false;
			i+=(CLOSE_SPAN.length-1);
		}
		else if(html.charAt(i)=='[' && !((html.charAt(i-1) == '`') || (i > SPAN_HIGHLIGHTED.length && html.substring(i-SPAN_HIGHLIGHTED.length,i-1) == SPAN_HIGHLIGHTED && html.charAt(i-SPAN_HIGHLIGHTED.length+1) == '`') || (i > SPAN_BULLET.length && html.substring(i-SPAN_BULLET.length,i-1) == SPAN_BULLET && html.charAt(i-SPAN_BULLET.length+1) == '`'))) {
			if (inside && record)
				criteria.push(res.length > 0? "Lambda . "+res.join(" . ") : "Lambda");
			res.push(pos);
			pos = 1;
		}
		else if (html.charAt(i) == ']' && !((html.charAt(i-1) == '`') || (i > SPAN_HIGHLIGHTED.length && html.substring(i-SPAN_HIGHLIGHTED.length,i-1) == SPAN_HIGHLIGHTED && html.charAt(i-SPAN_HIGHLIGHTED.length+1) == '`') || (i > SPAN_BULLET.length && html.substring(i-SPAN_BULLET.length,i-1) == SPAN_BULLET && html.charAt(i-SPAN_BULLET.length+1) == '`'))) {
			pos = res.pop();
			if (inside && record)
				criteria.push(res.length > 0? "Lambda . "+res.join(" . ") : "Lambda");
		}
		else if (html.charAt(i) == ',' && !((html.charAt(i-1) == '`') || (i > SPAN_HIGHLIGHTED.length && html.substring(i-SPAN_HIGHLIGHTED.length,i-1) == SPAN_HIGHLIGHTED && html.charAt(i-SPAN_HIGHLIGHTED.length+1) == '`') || (i > SPAN_BULLET.length && html.substring(i-SPAN_BULLET.length,i-1) == SPAN_BULLET && html.charAt(i-SPAN_BULLET.length+1) == '`'))) {
			pos = res.pop();
			pos++;
			if (inside && record)
				criteria.push(res.length > 0? "Lambda . "+res.join(" . ") : "Lambda");
			res.push(pos);
			pos = 1;
		}
		else if (inside && record)
			criteria.push(res.length > 0? "Lambda . "+res.join(" . ") : "Lambda");
	}
	return criteria.unique();
}

function highlightRedex(){
	if (myTrace != null && myTrace.getLength() > 1){
		var lhs = myTrace.getSelectedLHS();
		var rhs = myTrace.getSelectedRHS();
		var position = rhs.getPosition();
	
		if (myTrace.isSource) {
			highlightRedexSource(lhs.id,lhs.getMap(false),position,lhs.getTerm(false),false);
			highlightRedexSource(rhs.id,rhs.getMap(false),position,rhs.getTerm(false),false);
			if (myTrace.hasSlice){
				highlightRedexSource(lhs.id,lhs.getMap(true),position,lhs.getTerm(true),true);
				highlightRedexSource(rhs.id,rhs.getMap(true),position,rhs.getTerm(true),true);
			}
		}
		else {
			highlightRedexMeta(lhs.id,position,lhs.getTerm(false),false);
			highlightRedexMeta(rhs.id,position,rhs.getTerm(false),false);
			if (myTrace.hasSlice){
				highlightRedexMeta(lhs.id,position,lhs.getTerm(true),true);
				highlightRedexMeta(rhs.id,position,rhs.getTerm(true),true);
			}
		}
		if (!myTrace.showRedex)
			$("span.redex").css("visibility","hidden");
	}
}

function highlightRedexSource(id,map,pos,txt,sli){
	var typ = sli?"s":"t";
	var str = "";
	var count = 0;
	for(var i = 0; i < map.length; i++){
		if (map[i][1].indexOf(pos) == -1)
			str+=txt.slice(count,(count+map[i][0]));
		else
			str+="ELPOPENSPAN"+txt.slice(count,(count+map[i][0]))+"ELPCLOSESPAN";
		count += map[i][0];
	}
	str = str.replace(/ELPCLOSESPANELPOPENSPAN/g,"");
	$("#"+typ+"Redex"+id).text(str);
	$("#"+typ+"Redex"+id).html($("#"+typ+"Redex"+id).html().replace(/ /g,"&nbsp;"));
	$("#"+typ+"Redex"+id).html($("#"+typ+"Redex"+id).html().replace(/ELPOPENSPAN/g,"<span class=\"redex\">"));
	$("#"+typ+"Redex"+id).html($("#"+typ+"Redex"+id).html().replace(/ELPCLOSESPAN/g,"</span>"));
}

function highlightRedexMeta(id,pos,txt,sli){
	var typ = sli?"s":"t";
	var str = pos=="Lambda"?"ELPOPENSPAN":"";
	var open = pos=="Lambda"?true:false;
	var aux;
	var res = new Array("Lambda");
	
	for (var i = 0; i < txt.length; i++) {
		if(txt.charAt(i)=='[' && !(txt.charAt(i-1) == '`')) {
			str+= txt.charAt(i);
			if (open){
				str+="ELPCLOSESPAN";
				open = false;
			}
			res.push("1");
			if (res.join(" . ").indexOf(pos) != -1){
				str+="ELPOPENSPAN";
				open = true;
			}
		}
		else if (txt.charAt(i) == ']' && !(txt.charAt(i-1) == '`')) {
			if (open){
				str+="ELPCLOSESPAN";
				open = false;
			}
			res.pop();
			if (res.join(" . ").indexOf(pos) != -1)
				str+="ELPOPENSPAN"+txt.charAt(i)+"ELPCLOSESPAN";
			else
				str+= txt.charAt(i);
		}
		else if (txt.charAt(i) == ',' && !(txt.charAt(i-1) == '`')) {
			if (open){
				str+="ELPCLOSESPAN";
				open = false;
			}
			aux = 1+parseInt(res.pop());
			if (res.join(" . ").indexOf(pos) != -1)
				str+="ELPOPENSPAN"+txt.charAt(i)+"ELPCLOSESPAN";
			else
				str+= txt.charAt(i);
			res.push(aux);
			if (res.join(" . ").indexOf(pos) != -1){
				str+="ELPOPENSPAN";
				open = true;
			}
		}
		else 
			str+= txt.charAt(i);
	}
	str = str.replace(/ELPCLOSESPANELPOPENSPAN/g,"");
	$("#"+typ+"Redex"+id).text(str);
	$("#"+typ+"Redex"+id).html($("#"+typ+"Redex"+id).html().replace(/ELPOPENSPAN/g,"<span class=\"redex\">"));
	$("#"+typ+"Redex"+id).html($("#"+typ+"Redex"+id).html().replace(/ELPCLOSESPAN/g,"</span>"));
}
