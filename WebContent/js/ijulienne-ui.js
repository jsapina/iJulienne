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

function initialize(){
	myProgram = CodeMirror.fromTextArea(document.getElementById("taProgram"),{lineNumbers: true, theme: "neat"});
	window.onunload = function(e) { window.opener = null; };
	bindKeys();
	bindUpload();
	initColorPickers();
	$(window).resize( function(e) { 
		centerSlider(true);
		resizeModalWindow($("#myStateWindow"),$("#stateWindowWrapper"),$("#stateWindowContent"));
		resizeModalWindow($("#myInfoWindow"),$("#infoWindowWrapper"),$("#infoWindowContent"));
		resizeModalWindow($("#myCondWindow"),$("#condWindowWrapper"),$("#condWindowContent"));
		resizeModalWindow($("#myTraceWindow"),$("#traceWindowWrapper"),$("#traceWindowContent"));
		resizeModalWindow($("#myQueryWindow"),$("#queryWindowWrapper"),$("#queryWindowContent"));
		resizeModalWindow($("#myProgramWindow"),$("#programWindowWrapper"),$("#programWindowContent"));
		resizeModalWindow($("#myParseWindow"),$("#parseWindowWrapper"),$("#parseWindowContent2"));
	});
	var clip = new ZeroClipboard($("#bExportTrace"));
	clip.on("dataRequested", function (client, args) { client.setText(exportTrace()); });
	clip.glue($("#bExportTrace"));
	$(".selectpicker").selectpicker();
	$("body").on("contextmenu", "div", function(e) {
		if (this.classList.contains("dropdown") || (this.classList.contains("stateData") && isWorking))
			return false;
		if (!this.classList.contains("stateData"))
			return true;
		try {
			slice = this.id.indexOf("sData") == 0?true:false;
			menunode = myTrace.getState(parseInt(this.id.substring(5,this.id.length)),slice);
			if (menunode.id == 0 || menunode.cond == null || menunode.cond.length == 0 || (slice &&  menunode.condsli == null) || (slice && menunode.condsli.length == 0))
				$("#menuInspectCondition").addClass("disabled");
            else
                $("#menuInspectCondition").removeClass("disabled");
			$("#contextMenu").css({
				display: "block",
				left: e.pageX,
				top: (e.pageY-50)
			});
			return false;
		}
		catch (err){
			return true;
		}
	});
	$("#contextMenu").on("mouseleave", function() { hideContextMenu(); });
	$("#queryInput").keypress(function(event) { if (event.keyCode == 13) { query(); }});
	if (window.opener != null && (window.opener.document.URL == IJULIENNE_WEBSITE || window.opener.document.URL == ANIMA_WEBSITE || window.opener.document.URL == ABETS_WEBSITE)){
		importData();
	}
}

function bindKeys(){
	$(document).keydown(function(e){
		if (e.keyCode == 107) { if (myTrace != null && !$("#queryInput").is(":focus")){ zoomIn(); return true; } }	//add
		else if (e.keyCode == 109) { if (myTrace != null && !$("#queryInput").is(":focus")){ zoomOut(); return true; } } //subtract
		else if (e.keyCode == 37) { if (myTrace != null && !$("#queryInput").is(":focus")){ goPrev(true); selectQueryStateById(myTrace.Selected.id); return true; } } //left
		else if (e.keyCode == 38) { if (myTrace != null && !$("#queryInput").is(":focus")){ goLast(true); return true; } } //up
		else if (e.keyCode == 39) { if (myTrace != null && !$("#queryInput").is(":focus")){ goNext(true); selectQueryStateById(myTrace.Selected.id); return true; } } //right
		else if (e.keyCode == 40) { if (myTrace != null && !$("#queryInput").is(":focus")){ goFirst(true); return true; } } //down
	});
}

function resizeModalWindow(container,wrapper,content) {
	if (container != null && wrapper != null && content != null){
		var maxH = container.height()-150-(container[0].id == "myTraceWindow"?50:0);
		content.css("max-height",maxH+"px");
		var top = Math.min(50,(maxH-content.height())/2);
		wrapper.css("top",top+"px");
        if (container[0].id == "myTraceWindow")
            $("#myTableButtons").css("margin-top",(Math.max(0,top)+10)+"px");
	}
}

function initColorPickers() {
	$("#colorDefault").ColorPicker({
		color: "#FFFFFF",
		onShow: function (colpkr) { $(colpkr).fadeIn(500); $("#myWorkspace").bind("click",function(){updateColors(); $(colpkr).fadeOut(500);}); return false; },
		onHide: function (colpkr) { $(colpkr).fadeOut(500); $(document).unbind("click"); updateColors(); return false; },
		onChange: function (hsb, hex, rgb) { $("#colorDefault").css("backgroundColor", "#" + hex); }
	});
	$("#colorInstrumented").ColorPicker({
		color: "#8CFFC5",
		onShow: function (colpkr) { $(colpkr).fadeIn(500); $("#myWorkspace").bind("click",function(){updateColors(); $(colpkr).fadeOut(500);}); return false; },
		onHide: function (colpkr) { $(colpkr).fadeOut(500); $(document).unbind("click"); updateColors(); return false; },
		onChange: function (hsb, hex, rgb) { $("#colorInstrumented").css("backgroundColor", "#" + hex); }
	});
	$("#colorSelected").ColorPicker({
		color: "#FBEC5D",
		onShow: function (colpkr) { $(colpkr).fadeIn(500); $("#myWorkspace").bind("click",function(){updateColors(); $(colpkr).fadeOut(500);}); return false; },
		onHide: function (colpkr) { $(colpkr).fadeOut(500); $(document).unbind("click"); updateColors(); return false; },
		onChange: function (hsb, hex, rgb) { $("#colorSelected").css("backgroundColor", "#" + hex); }
	});
}

function updateColors() {
	myTrace.colorDefault = rgb2hex($("#colorDefault").css("background-color"));
	myTrace.colorInstrumented = rgb2hex($("#colorInstrumented").css("background-color"));
	myTrace.colorSelected = rgb2hex($("#colorSelected").css("background-color"));
	$(".ijulienneDefaultState").css("background-color",myTrace.colorDefault);
	$(".ijulienneInstrumentedState").css("background-color",myTrace.colorInstrumented);
	$(".ijulienneSelectedState").css("background-color",myTrace.colorSelected);
	
	$(".ijulienneDefaultState").css("color",idealTextColor(myTrace.colorDefault));
	$(".ijulienneInstrumentedState").css("color",idealTextColor(myTrace.colorInstrumented));
	$(".ijulienneSelectedState").css("color",idealTextColor(myTrace.colorSelected));
}

/****************************** TRANSITIONS ******************************/
function from0to1() {
	$("#step0").hide();
	$("#step1").show();
	myProgram.setSize(null,450);
	myProgram.refresh();
	myProgram.focus();
}

function from1to2() {
	var trace = $("#taTrace").val().trim();
	if (myProgram.getValue().trim().length < 1 || trace.length < 1)
		showErrorMessage1("");
	else {
		disableControls1();
		doInitialization(myProgram.getValue().trim(),trace);
	}
}

function from2to1() {
	hideErrorMessages2();
	hideErrorMessages1();
    $("#step2").hide();
	$("#step1").show();
	menuBackward();
	zoom = 100;
	myTrace = null;
	autoselect = false;
    autodelete = false;
	drawing = null;
	$("#moProgramSlice").addClass("disabled");
}

function from1to0() {
	hideErrorMessages1();
    $("#step1").hide();
	$("#step0").show();
	$("#selectExample").val("none");
	$("#selectExample").trigger("change");
	$("#selectType").val("source");
	$("#selectType").trigger("change");
}

/****************************** STEP 1 ******************************/
function disableProgram(flag){
	myProgram.setOption("readOnly",flag)
	$(".CodeMirror").css({"background-color":flag?"#EEEEEE":"white"});
}

function enableControls1(){
	$("#bUpload").removeClass("disabled");
	$(".bootstrap-select").find(".dropdown-toggle").removeClass("disabled");
	if ((document.getElementById("selectType").value == "reduce") || (document.getElementById("selectType").value == "rewrite"))
		$("#bGenerate").removeClass("disabled");
	else 
		$("#bNext1").removeClass("disabled");
	$("#bBack1").removeClass("disabled");
	$("#taReduce").removeAttr("readonly");
	$("#taRewriteEnd").removeAttr("readonly");
	$("#taRewriteStart").removeAttr("readonly");
	$("#taTrace").removeAttr("readonly");
	disableProgram(false);
	$("#loader1").hide();
	isWorking = false;
}

function disableControls1(){
	hideErrorMessages1();
    isWorking = true;
	$("#loader1").show();
	disableProgram(true);
	$("#taTrace").attr("readonly","readonly");
	$("#taRewriteStart").attr("readonly","readonly");
	$("#taRewriteEnd").attr("readonly","readonly");
	$("#taReduce").attr("readonly","readonly");
	$("#bNext1").addClass("disabled");
	$("#bBack1").addClass("disabled");
	$("#bGenerate").addClass("disabled");
	$(".bootstrap-select").find(".dropdown-toggle").addClass("disabled");
	$("#bUpload").addClass("disabled");
}

function showErrorMessage1(error){
	hideErrorMessages1();
    switch(error) {
    	case BAD_FILE:
			error = "Please provide a valid Maude <strong>program</strong> or <strong>zip file</strong>."; 
			break;
		case BAD_PROGRAM: 
			error = "Please provide a valid Maude <strong>program</strong>."; 
			break;
		case BAD_STATE: 
			error = "Please provide a valid <strong>initial state</strong> and try again. Notice that <strong>if your initial state contains any variables</strong>, you must specify them with the proper sort (e.g., for variable X of sort Nat write X:Nat), either when in source-level or meta-level representation.";
			break;
		case BAD_TRACE: 
			error = "Please provide a valid <strong>Maude term of sort Trace</strong> and try again.";
			break;
		case COMMANDS_DETECTED: 
			error = "<strong>Maude commands detected.</strong> Please refer to the help to provide a valid Maude program and try again.";
			break;
		case ORDER_NOT_FOUND: 
			error = "<strong>File <i>order.ijulienne</i> not found.</strong> Please refer to the help to provide a valid zip file and try again.";
			break;
		case FILE_NOT_FOUND: 
			error = "File listed in order.ijulienne <strong>not found or incorrect.</strong> Please refer to the help to provide a valid file and try again.";
			break;
		case NO_GENERATION_REW: 
			error = "No trace or empty trace generated. Please provide a valid <strong>initial and final states</strong> and be sure that at least <strong>one rule is applied</strong> in your desired trace. Notice that <strong>if your initial state contains any variables</strong>, you must specify them with the proper sort (e.g., for variable X of sort Nat write X:Nat), either when in source-level or meta-level representation.";
			break;
		case NO_GENERATION_RED: 
			error = "No trace or empty trace generated. Please provide a valid <strong>non-canonical</strong> state. Notice that <strong>if your state contains any variables</strong>, you must specify them with the proper sort (e.g., for variable X of sort Nat write X:Nat), either when in source-level or meta-level representation.";
			break;
        default:
            error = "Please provide a valid Maude <strong>program</strong> and <strong>trace</strong> and try again.";
    }
	$("#alertStep1Text").html(error);
	$("#alertStep1").show();
}

function hideErrorMessages1() {
	$("#alertStep1").hide();
	$("#alertStep1").stop(true, true);
}

function loadProgram() {
	hideErrorMessages1();
	var example = document.getElementById("selectExample").value;
	var trace = document.getElementById("taTrace");
	var state = document.getElementById("taReduce");
	
	if (example != "none") {
		$("#bUpload").addClass("disabled");
		
		var loadProgram = function(xmlhttp){ myProgram.setValue(xmlhttp.responseText); };
		var loadTrace = function(xmlhttp){ trace.value = xmlhttp.responseText; };
		var loadState = function(xmlhttp){ state.value = xmlhttp.responseText; };
		
		loadXMLDoc("examples/" + example + ".program", loadProgram);
		
		if (example == "fibonacci"){
			$("#selectType").selectpicker("val","reduce");
			loadXMLDoc("examples/" + example + ".state", loadState);
			trace.value = "";
		}
		else {
			$("#selectType").selectpicker("val","trace");
			loadXMLDoc("examples/" + example + ".trace", loadTrace);
			state.value = "";
		}
	}
	else {
		$("#bUpload").removeClass("disabled");
		$("#bTraceType").removeClass("disabled");
		myProgram.setValue("");
		trace.value = "";
	}
}

function selectType(){
	$("#alertStep1").hide();
	var type = document.getElementById("selectType").value;
	
	switch(type){
		case "rewrite":
			$("#bGenerate").removeClass("disabled");
			$("#bNext1").addClass("disabled");
			$("#traceContainer").hide();
			$("#reduceContainer").hide();
			$("#rewriteContainer").show();
			$("#rewriteContainer").css("display","flex");
			break;
		case"reduce":
			$("#bGenerate").removeClass("disabled");
			$("#bNext1").addClass("disabled");
			$("#traceContainer").hide();
			$("#rewriteContainer").hide();
			$("#reduceContainer").show();
			break;
		default:
			$("#bGenerate").addClass("disabled");
        	$("#bNext1").removeClass("disabled");
        	$("#rewriteContainer").hide();
        	$("#reduceContainer").hide();
        	$("#traceContainer").show();
	}
}

/****************************** STEP 2 ******************************/
function enableControls2(){
	if (myTrace.getSelectedLHS().id <= myTrace.iState.id){
		$("#bFirst").addClass("disabled");
		$("#bPrev").addClass("disabled");	
	}
	else {
		$("#bFirst").removeClass("disabled");
		$("#bPrev").removeClass("disabled");
	}
	if (myTrace.getSelectedRHS().id >= myTrace.fState.id){
		$("#bNext").addClass("disabled");
		$("#bLast").addClass("disabled");
	}
	else{
		$("#bNext").removeClass("disabled");
		$("#bLast").removeClass("disabled");
	}
	$("#bSlice").removeClass("disabled");
	$("#loader2").hide();
	isWorking = false;
}

function disableControls2(){
	hideErrorMessages2();
    isWorking = true;
	$("#loader2").show();
	$("#bFirst").addClass("disabled");
	$("#bPrev").addClass("disabled");
	$("#bNext").addClass("disabled");
	$("#bLast").addClass("disabled");
	$("#bSlice").addClass("disabled");
}

function showErrorMessage2(error){
	hideErrorMessages2();
	switch(error){
		case NO_CRITERIA: 
			error = "No <strong>slicing criterion</strong> selected."; 
			break;
		case NO_BULLET: 
			error = "Only <strong>relevant</strong> information can be selected as a slicing criterion."; 
			break;
		case NO_SLICE: 
			error = "No <strong>slice</strong> possible."; 
			break;
		case QUERY_EMP: 
			error = "No <strong>valid</strong> querying pattern specified."; 
			break;
		case QUERY_NOR: 
			error = "<strong>No matches found</strong> for the specified querying pattern."; 
			break;
		case QUERY_ERR: 
			error = "There is an <strong>error in the provided pattern.</strong>"; 
			break;
		default :
			error = "Ops! something went wrong in iJulienne.";
	}
	$("#alertStep2").html(error);
	$("#alertStep2").css("width",""+ (($("#alertStep2").text().length + 1) * 7.5) +"px");
	$("#alertStep2").show();
	$("#alertStep2").fadeOut(10000);
}

function hideErrorMessages2() {
	$("#alertStep2").hide();
	$("#alertStep2").stop(true, true);
}

function toggleMenuOption(id){
	var flag = $(id).is(":visible");
	flag?$(id).css("display","none"):$(id).css("display","inline");
	return !flag;
}

function menuBackward(){
	if (!$("#mode1").hasClass("disabled")){
		if (!$("#opBScheck").is(":visible")){
			$("#opORcheck").css("display","none");
			$("#opFScheck").css("display","none");
			$("#opBScheck").css("display","inline");
		}
		if (myTrace != null){
			myTrace.mode = MODE_BACKWARD;
			goLast(true);
		}
	}
}

function menuForward(){
	if (!$("#mode2").hasClass("disabled")){
		if (!$("#opFScheck").is(":visible")){
			$("#opORcheck").css("display","none");
			$("#opBScheck").css("display","none");
			$("#opFScheck").css("display","inline");
		}
		if (myTrace != null){
			myTrace.mode = MODE_FORWARD;
			goFirst(true);
		}
	}
}

function menuOrigins(){
	if (!$("#mode3").hasClass("disabled")){
		if (!$("#opORcheck").is(":visible")){
			$("#opFScheck").css("display","none");
			$("#opBScheck").css("display","none");
			$("#opORcheck").css("display","inline");
		}
		if (myTrace != null){
			myTrace.mode = MODE_ORIGINS;
			goLast(true);
		}
	}
}

function menuMetaLevelView(){
	var flag = toggleMenuOption("#opVWcheck");
	parseAllCriteria();
	
	restore = null;
	myTrace.isSource = !flag;
	if (flag)
		$("#opVWcheck").css("display","inline");
	else
		$("#opVWcheck").css("display","none");
	drawTrace(true);
	goTo(myTrace.Selected.id,true);
	highlightQueryResults();
}

function menuStateLabels(){
	if (toggleMenuOption("#opSLcheck")){
		myTrace.showState = true;
		$(".stateID").show();
		$("#opSLcheck").css("display","inline");
	}
	else {
		myTrace.showState = false;
		$(".stateID").hide();
		$("#opSLcheck").css("display","none");
	}
}

function menuRuleLabels(){
	if (!$("#menuRule").hasClass("disabled")){
		if (toggleMenuOption("#opRLcheck")){
			myTrace.showRule = true;
			$(".stateRule").show();
			$("#opRLcheck").css("display","inline");
		}
		else {
			myTrace.showRule = false;
			$(".stateRule").hide();
			$("#opRLcheck").css("display","none");
		}
	}
}

function menuRedexes(){
	if (!$("#menuRedex").hasClass("disabled")){
		if (toggleMenuOption("#opRXcheck")){
			myTrace.showRedex = true;
			$("span.redex").css("visibility","visible");
			$("#opRXcheck").css("display","inline");
		}
		else {
			myTrace.showRedex = false;
			$("span.redex").css("visibility","hidden");
			$("#opRXcheck").css("display","none");
		}
	}
}

function menuTraceInformation() {
	if (!$("#menuTrace").hasClass("disabled"))
		generateTraceTable();
}

function menuProgramSlice() {
	if (!$("#menuProgram").hasClass("disabled"))
		generateProgramSlice();
}

function menuRestoreTrace(){
	if (!$("#menuRestore").hasClass("disabled")){
		myTrace.iState = myTrace.getState(0);
		myTrace.fState = myTrace.getState(myTrace.getLength()-1);
		myTrace.hasSlice = false;
		drawTrace(false);
		(myTrace.mode == MODE_BACKWARD || myTrace.mode == MODE_ORIGINS)?goLast(true):goFirst(true);
		$("#moProgramSlice").addClass("disabled");
	}
}

function menuClearCriteria(){
	if (!$("#menuProgram").hasClass("disabled")){
		myTrace.clearCriteria();
		drawTrace(false);
		goTo(myTrace.Selected.id,false);
	}
}

function helpProvide(){
	window.open("help-provide.html","iJulienne Help","width=950,height=800");
}

function helpAnalyzer(){
	window.open("help-analyzer.html","iJulienne Help","width=950,height=800");
}

function zoomIn() {
	zoom = Math.max(0,zoom+10);
	applyZoom();
	$("#zoomValue").html(zoom);
}

function zoomOut() {
	zoom = Math.max(0,zoom-10);
	applyZoom();
	$("#zoomValue").html(zoom);
}

function restoreZoom() {
	hideContextMenu();
	zoom = 100;
	applyZoom();
    $("#zoomValue").html(zoom);
    centerSlider(true);
}

function applyZoom() {
	hideContextMenu();
	$("#mySlider").css("-ms-transform","scale("+(zoom/100)+","+(zoom/100)+")");
	$("#mySlider").css("-webkit-transform","scale("+(zoom/100)+","+(zoom/100)+")");
	$("#mySlider").css("-moz-transform","scale("+(zoom/100)+","+(zoom/100)+")");
	centerSlider(true);
}

function centerSlider(animation) {
	if (myTrace != null){
		var scale = (zoom/100) - 1;
		
		var workW = $("#myWorkspace").width()+4;
		var workH = $("#myWorkspace").height()+4;
	
		var wrapW = $("#mySlider").width();
		var wrapH = $("#mySlider").height();
		var offset;
		
		if (myTrace.getLength() > 1){
			var selectedRHS = myTrace.getSelectedRHS().id;
			if (selectedRHS > myTrace.fState)
				selectedRHS = 1;
		
			offset = document.getElementById("tTrans"+selectedRHS).offsetLeft+20;
		}
		else 
			offset = (wrapW/2);

		var diffW = (offset - (wrapW/2)) * scale;
		
		if (animation)
			$("#mySlider").animate({top: ((workH-wrapH)/2) +"px", left: ((workW/2) - offset - diffW) +"px"});
		else {
			$("#mySlider").css("top",((workH-wrapH)/2));
			$("#mySlider").css("left",((workW/2) - offset));
		}
	}
}

function updateTrace(animation){
	if (myTrace != null){
		if (myTrace.getLength() == 1){
			$("span.redex").css("visibility","hidden");
			$("#tState0").addClass("ijulienneSelectedState");
			if (myTrace.hasSlice)
				$("#sState0").addClass("ijulienneSelectedState");
			centerSlider(animation);
			$("#itotalStates").text(1);
			$("#ftotalStates").text(1);
			$("#totalStates").text(1);
		}
		else {
			$("span.redex").css("visibility","hidden");
			$(".ijulienneState").each(function() {$("#"+this.id).removeClass("ijulienneSelectedState");});
			if (myTrace.mode == MODE_BACKWARD || myTrace.mode == MODE_ORIGINS) {
				$("#tState"+myTrace.getSelectedRHS().id).addClass("ijulienneSelectedState");
				if (myTrace.hasSlice)
					$("#sState"+myTrace.getSelectedRHS().id).addClass("ijulienneSelectedState");
			}
			else {
				$("#tState"+myTrace.getSelectedLHS().id).addClass("ijulienneSelectedState");
				if (myTrace.hasSlice)
					$("#sState"+myTrace.getSelectedLHS().id).addClass("ijulienneSelectedState");
			}
			centerSlider(animation);
			highlightRedex();
			$("#itotalStates").text(myTrace.getSelectedLHS().id+1);
			$("#ftotalStates").text(myTrace.getSelectedRHS().id+1);
			if ((myTrace.fState.id+1) == myTrace.getLength())
				$("#totalStates").text(myTrace.getLength());
			else
				$("#totalStates").text((myTrace.iState.id+1)+"-"+(myTrace.fState.id+1)+" ("+myTrace.getLength()+")");
			enableControls2();
		}
	}
}

function goFirst(animation) {
	myTrace.selectFirst();
	updateTrace(animation);
}

function goPrev(animation) {
	myTrace.selectPrev();
	updateTrace(animation);
}

function goNext(animation) {
	myTrace.selectNext();
	updateTrace(animation);
}

function goLast(animation) {
	myTrace.selectLast();
	updateTrace(animation);
}

function goTo(state,animation){
	myTrace.setSelected(state);
	updateTrace(animation);
}

function drawTrace(animation) {
	if (myTrace.getLength() == 1){
		var thtml = [];
		var shtml = [];
		var i = 0;
		thtml.push("<div id=\"tState" + i + "\" class=\"ijulienneState ijulienneDefaultState\">");
		thtml.push("<div id=\"tID"+i+"\" class=\"stateID\"><span class=\"stateIDs\">s</span><span class=\"stateIDn\">"+ (i+1) +"</span></div>");
		thtml.push("<div id=\"tRedex"+i+"\" class=\"stateRedex hyphenate\">"+ myTrace.getState(i).getHTML(false,true) +"</div>");
		thtml.push("<div id=\"tData"+i+"\" class=\"stateData hyphenate\" onScroll=\"onScroll("+i+",false)\">"+ myTrace.getState(i).getHTML(false,true) +"</div></div>");
		$("#myTrace").html(thtml.join(""));
		$("#tData0").textHighlighter();
		if (myTrace.hasSlice) {
			shtml.push("<div id=\"sState" + i + "\" class=\"ijulienneState ijulienneDefaultState\">");
			shtml.push("<div id=\"sID"+i+"\" class=\"stateID\"><span class=\"stateIDs\">s</span><span class=\"stateIDb\">•</span><span class=\"stateIDbn\">"+ (i+1) +"</span></div>");
			shtml.push("<div id=\"sRedex"+i+"\" class=\"stateRedex hyphenate\">"+ myTrace.getState(i).getHTML(true,true) +"</div>");
			shtml.push("<div id=\"sData"+i+"\" class=\"stateData hyphenate\" onScroll=\"onScroll("+i+",true)\">"+ myTrace.getState(i).getHTML(true,true) +"</div></div>");
			$("#mySlice").html(shtml.join(""));
			$("#sData0").textHighlighter();
		}
	}
	else {
		if (myTrace.iState.id < myTrace.fState.id){
			var thtml = [];
			var shtml = [];
			for(var i = myTrace.iState.id; i < myTrace.fState.id; i++){
				if (myTrace.getState(i).term.normal)
					thtml.push("<div id=\"tState" + i + "\" class=\"ijulienneState ijulienneDefaultState\">");
				else
					thtml.push("<div id=\"tState" + i + "\" class=\"ijulienneState ijulienneInstrumentedState\">");
				thtml.push("<div id=\"tID"+i+"\" class=\"stateID\"><span class=\"stateIDs\">s</span><span class=\"stateIDn\">"+ (i+1) +"</span></div>");
				thtml.push("<div id=\"tRule"+i+"\" onclick=\"showRuleInfoWindow(" + (i + 1) + ",false)\" class=\"stateRule");
				var rule = myTrace.getState(i+1).rule;
				var isCond = rule.source[0] == "c";
				if (rule.label == "flattening")
					thtml.push(" stateRuleInst\">toBnf</div>");
				else if (rule.label == "unflattening")
					thtml.push(" stateRuleInst\">fromBnf</div>");
				else if (rule.label == "builtIn")
					thtml.push(" stateRuleInst\">builtIn</div>");
				else if (rule == null || rule.length == 0)
					thtml.push("\"></div>");
				else if (rule.type == "equation" || rule.type == "builtIn")
					isCond?thtml.push("\">ceq: "+rule.label+"</div>"):thtml.push("\">eq: "+rule.label+"</div>");
				else
					isCond?thtml.push("\">crl: "+rule.label+"</div>"):thtml.push("\">rl: "+rule.label+"</div>");
				thtml.push("<div id=\"tRedex"+i+"\" class=\"stateRedex hyphenate\">"+ myTrace.getState(i).getHTML(false,true) +"</div>");
				thtml.push("<div id=\"tData"+i+"\" class=\"stateData hyphenate\" onScroll=\"onScroll("+i+",false)\">"+ myTrace.getState(i).getHTML(false,true) +"</div></div>");
				thtml.push("<div id=\"tTrans" + (i+1) + "\" class=\"ijulienneTransition\" onclick=\"showRuleInfoWindow("+(i+1)+",false)\"><div class=\"arrow\"></div></div>");
				if (myTrace.hasSlice) {
					if (myTrace.getState(i).term.normal)
						shtml.push("<div id=\"sState" + i + "\" class=\"ijulienneState ijulienneDefaultState\">");
					else
						shtml.push("<div id=\"sState" + i + "\" class=\"ijulienneState ijulienneInstrumentedState\">");
					shtml.push("<div id=\"sID"+i+"\" class=\"stateID\"><span class=\"stateIDs\">s</span><span class=\"stateIDb\">•</span><span class=\"stateIDbn\">"+ (i+1) +"</span></div>");
					shtml.push("<div id=\"sRedex"+i+"\" class=\"stateRedex hyphenate\">"+ myTrace.getState(i).getHTML(true,true) +"</div>");
					if (i > myTrace.iState.id && myTrace.getState(i).slice.meta == myTrace.getState(i-1).slice.meta)
						shtml.push("<div id=\"sData"+i+"\" class=\"stateData hyphenate\" onScroll=\"onScroll("+i+",true)\"><span class=\"bullet\">"+ myTrace.getState(i).getHTML(true,true) +"</span></div></div>");
					else
						shtml.push("<div id=\"sData"+i+"\" class=\"stateData hyphenate\" onScroll=\"onScroll("+i+",true)\">"+ myTrace.getState(i).getHTML(true,true) +"</div></div>");
					if (myTrace.getState(i).slice.meta == myTrace.getState(i+1).slice.meta)
						shtml.push("<div id=\"sTrans" + (i+1) + "\" class=\"ijulienneTransition\"><div class=\"equal\"></div></div>");
					else
						shtml.push("<div id=\"sTrans" + (i+1) + "\" class=\"ijulienneTransition\" onclick=\"showRuleInfoWindow("+(i+1)+",true)\"><div class=\"sliarrow\"></div></div>");
				}
			}
			if (myTrace.fState.term.normal)
				thtml.push("<div id=\"tState" + myTrace.fState.id + "\" class=\"ijulienneState ijulienneDefaultState\">");
			else
				thtml.push("<div id=\"tState" + myTrace.fState.id + "\" class=\"ijulienneState ijulienneInstrumentedState\">");
			thtml.push("<div id=\"tID"+ myTrace.fState.id +"\" class=\"stateID\"><span class=\"stateIDs\">s</span><span class=\"stateIDn\">"+ (myTrace.fState.id+1) +"</span></div>");
			thtml.push("<div id=\"tRedex"+ myTrace.fState.id +"\" class=\"stateRedex hyphenate\">"+ myTrace.fState.getHTML(false,true) +"</div>");
			thtml.push("<div id=\"tData"+ myTrace.fState.id +"\" class=\"stateData hyphenate\" onScroll=\"onScroll("+ myTrace.fState.id +",false)\">"+ myTrace.fState.getHTML(false,true) +"</div></div>");
			$("#myTrace").html(thtml.join(""));
			if (myTrace.hasSlice) {
				if (myTrace.fState.term.normal)
					shtml.push("<div id=\"sState" + myTrace.fState.id + "\" class=\"ijulienneState ijulienneDefaultState\">");
				else
					shtml.push("<div id=\"sState" + myTrace.fState.id + "\" class=\"ijulienneState ijulienneInstrumentedState\">");
				shtml.push("<div id=\"sID"+ myTrace.fState.id +"\" class=\"stateID\"><span class=\"stateIDs\">s</span><span class=\"stateIDb\">•</span><span class=\"stateIDbn\">"+ (myTrace.fState.id+1) +"</span></div>");
				shtml.push("<div id=\"sRedex"+ myTrace.fState.id +"\" class=\"stateRedex hyphenate\">"+ myTrace.fState.getHTML(true,true) +"</div>");
				if (myTrace.fState.slice.meta == myTrace.getState(myTrace.fState.id-1).slice.meta)
					shtml.push("<div id=\"sData"+ myTrace.fState.id +"\" class=\"stateData hyphenate\" onScroll=\"onScroll("+ myTrace.fState.id +",true)\"><span class=\"bullet\">"+ myTrace.fState.getHTML(true,true) +"</span></div></div>");
				else
					shtml.push("<div id=\"sData"+ myTrace.fState.id +"\" class=\"stateData hyphenate\" onScroll=\"onScroll("+ myTrace.fState.id +",true)\">"+ myTrace.fState.getHTML(true,true) +"</div></div>");
				$("#mySlice").html(shtml.join(""));
			}
			else
				$("#mySlice").html("");
			for(var i = myTrace.iState.id; i <= myTrace.fState.id; i++){
				$("#tData"+i).textHighlighter();
				if (myTrace.hasSlice)
					$("#sData"+i).textHighlighter();
			}
			centerSlider(animation);
		}
		if (!myTrace.showState)
			$(".stateID").hide();
		if (!myTrace.showRule)
			$(".stateRule").hide();
		if (!myTrace.showRedex)
			$("span.redex").css("visibility","hidden");
	}
}

function hideContextMenu() {
	$("#contextMenu").hide();
	$(".elpContextMenuOption").each(function() {
    	$("#"+this.id).removeClass("disabled");
	});
}

function menuShowState() {
	if (!$("#menuShowState").hasClass("disabled")) {
		if (myTrace.Selected.id != menunode.id)
			goTo(myTrace.mode == (myTrace.mode == MODE_BACKWARD || myTrace.mode == MODE_ORIGINS)?menunode.id:menunode.id-1,true);
		showStateInfoWindow(menunode.id,slice);
	}
}

function menuShowTransition() {
	if (!$("#menuShowTransition").hasClass("disabled"))
		showRuleInfoWindow(menunode.id,false);
}

function menuInspectCondition() {
	if (!$("#menuInspectCondition").hasClass("disabled"))
		showCondInfoWindow(menunode.id,slice);
}

function menuExportState() {
	astate = menunode.term.meta;
	window.open(ANIMA_WEBSITE);
}

function menuDrawTerm() {
	hideContextMenu();
	drawing = slice?menunode.slice.meta:menunode.term.meta;
	window.open("draw.html");
}

function inspectCondition(nodeid,idx) {
	var node = myTrace.getState(nodeid); 
	icond = node.getConditionAt(idx);
	icsli = null;
	window.open(IJULIENNE_WEBSITE);
}

function inspectConditionSlice(nodeid,idx) {
	var node = myTrace.getState(nodeid); 
	icond = node.getConditionAt(idx);
	icsli = node.getConditionSliceAt(idx);
	window.open(IJULIENNE_WEBSITE);
}

function showRuleInfoWindow(id,sliced) {
	hideContextMenu();
	if (myTrace.getSelectedRHS().id != id)
		goTo((myTrace.mode == MODE_BACKWARD || myTrace.mode == MODE_ORIGINS)?id:id-1,true);

	$("#myInfoWindow").modal("show");
	$("#spanInfoWindowTitle").text("Transition information from state sIJULIENNE-ID1 to sIJULIENNE-ID2");
	$("#spanInfoWindowTitle").html($("#spanInfoWindowTitle").html().replace("sIJULIENNE-ID1","s<sub style=\"font-family: monospace;\">"+(myTrace.getSelectedLHS().id+1)+"</sub>"));
	$("#spanInfoWindowTitle").html($("#spanInfoWindowTitle").html().replace("sIJULIENNE-ID2","s<sub style=\"font-family: monospace;\">"+(myTrace.getSelectedRHS().id+1)+"</sub>"));
	$("#dInfoRule").html(convertHTMLSymbols(myTrace.getSelectedRHS().getRule()));
    (isEquation($("#dInfoRule").html()))? $("#dInfoRuleTitle").text("Normalized Equation") : $("#dInfoRuleTitle").text("Normalized Rule");
    $("#dInfoSubstitution").html(convertHTMLSymbols(myTrace.getSelectedRHS().getSubstitution(sliced)));
	$("#dInfoSubstitution").html($("#dInfoSubstitution").html().replace(/ELP-SUBSEP/g,"<br>"));
	$("#dInfoPosition").html(convertHTMLSymbols(myTrace.getSelectedRHS().getPosition()));
	$("#dInfoPosition").html($("#dInfoPosition").html().replace("Lambda&nbsp;.&nbsp;",""));
	resizeModalWindow($("#myInfoWindow"),$("#infoWindowWrapper"),$("#infoWindowContent"));
}

function showCondInfoWindow(id,slice) {
	hideContextMenu();
	if (myTrace.getSelectedRHS() != id)
		goTo((myTrace.mode == MODE_BACKWARD || myTrace.mode == MODE_ORIGINS)?id:id-1,true);
	var node = myTrace.getSelectedRHS();
	
	$("#myCondWindow").modal("show");
	if (slice){
		$("#spanCondWindowTitle").text("Condition information from transition sIJULIENNE-BULLETIJULIENNE-ID1 to sIJULIENNE-BULLETIJULIENNE-ID2");
		$("#spanCondWindowTitle").html($("#spanCondWindowTitle").html().replace("IJULIENNE-ID1","<sub style=\"font-family: monospace; margin-left: -7px;\">"+(myTrace.getSelectedLHS().id+1)+"</sub>"));
		$("#spanCondWindowTitle").html($("#spanCondWindowTitle").html().replace("IJULIENNE-ID2","<sub style=\"font-family: monospace; margin-left: -7px;\">"+(myTrace.getSelectedRHS().id+1)+"</sub>"));
		$("#spanCondWindowTitle").html($("#spanCondWindowTitle").html().replace(/IJULIENNE-BULLET/g,"<sup style=\"font-family: monospace;\">•</sup>"));
	}
	else {
		$("#spanCondWindowTitle").text("Condition information from transition sIJULIENNE-ID1 to sIJULIENNE-ID2");
		$("#spanCondWindowTitle").html($("#spanCondWindowTitle").html().replace("IJULIENNE-ID1","<sub style=\"font-family: monospace;\">"+(myTrace.getSelectedLHS().id)+"</sub>"));
		$("#spanCondWindowTitle").html($("#spanCondWindowTitle").html().replace("IJULIENNE-ID2","<sub style=\"font-family: monospace;\">"+(myTrace.getSelectedRHS().id)+"</sub>"));
	}
	
	var cond = slice?node.condsli:node.cond;
	var html = "";
	for(var i = 0; i < cond.length; i++){
    	var lhs = "" + (myTrace.isSource?cond[i].lhs:cond[i].lhsmeta);
    	var rhs = "" + (myTrace.isSource?cond[i].rhs:cond[i].rhsmeta);
    	var conector = (cond[i].type == TYPE_MB)?" : ":((cond[i].type == TYPE_EQ)?" = ":(cond[i].type == TYPE_MA)?" := ":" => ");
    	html += "<div class=\"condListItemH\">Condition "+(i+1)+" <button type=\"button\" class=\"btn btn-primary pull-right condButton\" onclick=\"inspectCondition("+node.id+","+i+")\">Inspect</button></div>";
    	html += "<div class=\"condListItem\">" + convertHTMLSymbols(lhs + conector + rhs)+"</div><br>";
    }
    $("#dCondList").html(html);
    resizeModalWindow($("#myCondWindow"),$("#condWindowWrapper"),$("#condWindowContent"));
}

function onScroll(sta,sli){
	if(sli)
		document.getElementById("sRedex"+sta).scrollTop = document.getElementById("sData"+sta).scrollTop;
	else
		document.getElementById("tRedex"+sta).scrollTop = document.getElementById("tData"+sta).scrollTop;
}

function showStateInfoWindow(nodeid,slice) {
	hideContextMenu();
	var node = myTrace.getState(nodeid,slice);
	
	$("#myStateWindow").modal("show");
	$("#spanStateWindowTitle").text("Detailed information of state sIJULIENNE-ID1");
	if ($("#"+(slice?"sData":"tData")+nodeid).text().indexOf("•") != -1)
		$("#spanStateWindowTitle").html($("#spanStateWindowTitle").html().replace("sIJULIENNE-ID1","s<sup>•</sup><sub style=\"font-family: monospace; margin-left: -4px;\">"+(node.id+1)+"</sub>"));
	else
		$("#spanStateWindowTitle").html($("#spanStateWindowTitle").html().replace("sIJULIENNE-ID1","s<sub style=\"font-family: monospace;\">"+(node.id+1)+"</sub>"));
	$("#taInfo").html($("#"+(slice?"sData":"tData")+nodeid).html());
	$("#taInfo").textHighlighter();
	resizeModalWindow($("#myStateWindow"),$("#stateWindowWrapper"),$("#stateWindowContent"));
}

function trustedMode() {
	myTrace.trusted = !myTrace.trusted;
	reloadTrace();		
}

function generateTraceTable(){
	hideContextMenu();
	myTrace.trusted?$("#bTrustedMode").text("Untrusted mode"):$("#bTrustedMode").text("Trusted mode");
	var mode = document.getElementById("selectTraceMode").value;
	$("#traceWindowContent").html(myTrace.getTraceHTML((mode == "trace-medium")?TRACE_MEDIUM:((mode == "trace-small")?TRACE_SMALL:TRACE_LARGE)));
	$("#myTraceWindow").modal("show");
	resizeModalWindow($("#myTraceWindow"),$("#traceWindowWrapper"),$("#traceWindowContent"));
	$("#spanTraceWindowTitle").text("Trace information" + (myTrace.trusted?" (trusted mode)":""));
}

function reloadTrace() {
	myTrace.trusted?$("#bTrustedMode").text("Untrusted mode"):$("#bTrustedMode").text("Trusted mode");
	var mode = document.getElementById("selectTraceMode").value;
	$("#traceWindowContent").html(myTrace.getTraceHTML((mode == "trace-medium")?TRACE_MEDIUM:((mode == "trace-small")?TRACE_SMALL:TRACE_LARGE)));
	$("#spanTraceWindowTitle").text("Trace information" + (myTrace.trusted?" (trusted mode)":""));
}

function generateProgramSlice() {
	if (!myTrace.hasSlice) return
	
	var ele = document.getElementById("taProgramSlice");
	var spec = myProgram.getValue().trim().replace(/[ ][ ]/g," ").replace(/\r\n/g,"\n").replace(/\n/g,"ELPNEWLINE").replace(/`/g,"");
	$("#taProgramSlice").text(spec);
	ele.innerHTML = ele.innerHTML.replace(/ELPNEWLINE/g,"<br class=\"sliced\">");
	doProgramSlice();
    $("#myProgramWindow").modal("show");
	resizeModalWindow($("#myProgramWindow"),$("#programWindowWrapper"),$("#programWindowContent"));
}

function getOpsCommand(){
	var modnames = myProgram.getValue().trim().match(/mod (.*?) is/g);
	if (modnames == null || modnames.length == 0)
		return "none";
	var str1 = isFullMaude?"getOps(upModule(":"getOps(upModule('";
	var str2 = isFullMaude?"))":",false))";
	for(var i = 0; i < modnames.length; i++)
		modnames[i] = str1 + modnames[i].slice(3,-2).trim() + str2;
	return modnames.join(" ");
}

function generate(automatic) {
	if (!isWorking){
		disableControls1();
		hideErrorMessages1();
		if (document.getElementById("selectType").value == "reduce")
			doRedGeneration(myProgram.getValue().trim(),$("#taReduce").val(),automatic);
		else
			doRewGeneration(myProgram.getValue().trim(),$("#taRewriteStart").val().trim(),$("#taRewriteEnd").val().trim(),automatic);
	}
}

function sliceState(){
	if (!isWorking && myTrace != null){
		disableControls2();
		hideErrorMessages2();
		var selected = myTrace.Selected.id;
		var criteria = myTrace.isSource?parseCriteria(selected,false):parseCriteriaMeta(selected,false);
		if (criteria == null || criteria.length == 0 || criteria == "noPos"){
			showErrorMessage2(NO_CRITERIA);
			enableControls2();
		}
		else {
			if (myTrace.mode == MODE_BACKWARD)
				doBackward(myProgram.getValue().trim(),myTrace.getInstrumentedTrace(myTrace.iState.id,selected), criteria, getOpsCommand(),myTrace.iState.id,selected);
			else if (myTrace.mode == MODE_FORWARD)
				doForward(myProgram.getValue().trim(),myTrace.getInstrumentedTrace(selected,myTrace.fState.id), criteria, getOpsCommand(),selected,myTrace.fState.id);
			else
				doOrigins(myProgram.getValue().trim(),myTrace.getInstrumentedTrace(myTrace.iState.id,selected), criteria, getOpsCommand(),myTrace.iState.id,selected);
		}
	}
}

function query() {
	if (!isWorking && myTrace != null){
		disableControls2();
		hideErrorMessages2();
		var pattern = $("#queryInput").val().trim();
		if (pattern == null || pattern.length == 0) {
			showErrorMessage2(QUERY_EMP);
			enableControls2();
            return false;
		}
		var i = 0;
		while(pattern.indexOf("_") != -1){
			pattern = pattern.replace("_","ELPDISCARD");
			i++;
		}
		while(pattern.indexOf("?") != -1){
			pattern = pattern.replace("?","ELPIDENTIFY");
			i++;
		}
		doQuery(myProgram.getValue().trim(),getListOfStates(),pattern,getTopSorts());
	}
}

function colorSlicedStateMeta(str){
	str = str.replace(/'#\![0-9]+:[a-zA-z][^`{0}\],]+/g,"ELPSINMRK$&ELPSOUMRK");
	while(str.indexOf("`[") != -1)
		str = str.replace("`[","ELPPAIMRK");
	while(str.indexOf("`]") != -1)
		str = str.replace("`]","ELPPAOMRK");
	while(str.indexOf("`,") != -1)
		str = str.replace("`,","ELPCOMMRK");
	while(str.indexOf("`\'") != -1)
		str = str.replace("`\'","ELPAPOMRK");
	
	var bullets = str.match(/ELPSINMRK.*?ELPSOUMRK/g);
	if (bullets != null)
		for(var i = 0; i < bullets.length; i++)
			str = str.replace(/ELPSINMRK.*?ELPSOUMRK/, "ELPBULLET"+i);
	str = str.replace(/'[^\[\]']+\[(ELPBULLET[0-9]+)+(,ELPBULLET[0-9]+)*]/g,"ELPSINMRK$&ELPSOUMRK");
	if (bullets != null)
		for(var i = bullets.length-1; i >= 0; i--)
			str = str.replace("ELPBULLET"+i,bullets[i]);
	
	while(str.indexOf("ELPPAIMRK") != -1)
		str = str.replace("ELPPAIMRK","`[");
	while(str.indexOf("ELPPAOMRK") != -1)
		str = str.replace("ELPPAOMRK","`]");
	while(str.indexOf("ELPCOMMRK") != -1)
		str = str.replace("ELPCOMMRK","`,");
	while(str.indexOf("ELPAPOMRK") != -1)
		str = str.replace("ELPAPOMRK","`\'");
	while(str.indexOf("ELPSINMRK") != -1)
		str = str.replace("ELPSINMRK","<span class=\"bullet\">");
	while(str.indexOf("ELPSOUMRK") != -1)
		str = str.replace("ELPSOUMRK","</span>");
	return str;
}

function exportTrace(){
	var lhs = myTrace.getState(myTrace.iState.id);
	var rhs = null;
	var type = null;
	var rule = null;
	var res = "";
	
	for(var i = myTrace.iState.id; i < myTrace.fState.id; i++){
		rhs = myTrace.getState(i + 1);
		
		if (rhs.rule != null && rhs.rule.type == "rule")
			rule = rhs.rule.meta;
		if (lhs.term.normal){
			state = lhs.term.meta;
			type = lhs.term.type;
		}
		if (rule != null && state != null){
			res += ("{ "+state+",'"+type+","+rule+"}\n");
			rule = null;
			state = null;
			type = null;
		}
		lhs = rhs;
	}
	return res.trim();
}

