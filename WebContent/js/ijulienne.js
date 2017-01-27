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

function bindUpload() {
	$("#loader1").hide();
	$("#progressBarOuter").hide();
	$("#fileUpload").fileupload({
		type: "POST",
		url: "ws/upload",
		timeout: 250000,
		cache: false,
		contentType: false,
        processData: false,
        start: function(e) {
        	$("#alertStep1").hide();
			$("#progressBarOuter").show();
			disableControls1();
			$("#loader1").hide();
        },
        error: function(error) {
			showErrorMessage1(BAD_FILE);
			enableControls1();
		},
		success: function(response){
			$("#loader1").hide();
			myProgram.setValue("");
			$("#taTrace").val("");
			$("#taIState").val("");
			$("#taFState").val("");
			$("#taReduce").val("");
			if (response == "iJulienne error detected." || response == "COMMANDS_DETECTED" || response == "FILE_NOT_FOUND" || response == "ORDER_NOT_FOUND")
				showErrorMessage1(getFlag(response));
			else {
				if (response.indexOf("IJULIENNE-SPLIT-AJAX") == -1)
					myProgram.setValue(response);
				else {
					response = response.split("IJULIENNE-SPLIT-AJAX");
					myProgram.setValue(response[0]);
					$("#taTrace").val(response[1]);
				}
			}
			enableControls1();
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            if (progress >= 100) {
            	$("#progressBarOuter").hide();
            	$("#progressBarInner").css("width","0%");
            	$("#loader1").show();
            }
            else
            	$("#progressBarInner").css("width",progress + "%");
        }
    }).prop("disabled", !$.support.fileInput).parent().addClass($.support.fileInput ? undefined : "disabled");
}

function doRedGeneration(program,sta,automatic) {
	console.time("Red-generation");
	$.ajax( {
		type: "POST",
		url: "ws/parse-program",
		timeout: 250000,
		data: "program=" + encodeURIComponent(program),
		error: function(error) {
			console.timeEnd("Parse-program");
			showErrorMessage1(BAD_PROGRAM);
            enableControls1();
		},
		success: function(response){
			console.timeEnd("Parse-program");
			if (response == null) {
				showErrorMessage1(BAD_PROGRAM);
				enableControls1();
			}
			else {
				response = response.split("ELP-RESULT");
				if (response.length < 2){
					enableControls1();
                    try {
						var errors = response[0].replace(/(?:\r\n|\r|\n)/g,"ELP-NEWLINE");
						$("#parseWindowContent2").text(errors);
						$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/ELP-NEWLINE/g,"<br>"));
						$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/Warning:/g,"<span class=\"elpError\">Warning:</span>"));
						$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/&lt;---\*HERE\*/g,"<span class=\"elpError\">&lt;---*HERE*</span>"));
						$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/<br>Error: No parse for input./g,""));
						$("#myParseWindow").modal("show");
					}
					catch(ex){ showErrorMessage1(BAD_PROGRAM); };
				}
				else {
					isFullMaude = response[0] == "true";
					modName = response[1].trim();
					console.time("Parse-input");
					$.ajax({
						type: "POST",
						url: "ws/red-generation",
						timeout: 250000,
						data: "modname=" + encodeURIComponent(modName) + "&program=" + encodeURIComponent(program) + "&state=" + encodeURIComponent(sta) + "&fullmaude=" + encodeURIComponent(isFullMaude),
                        error: function(error) {
							console.timeEnd("Red-generation");
							showErrorMessage1(NO_GENERATION_RED);
                            enableControls1();
						},
						success: function(data){
							console.timeEnd("Red-generation");
							if (data == null || data.length == 0 || data.indexOf("iJulienne error detected.") != -1) {
								showErrorMessage1(NO_GENERATION_RED);
							}
							else {
								$("#selectType").selectpicker("val","trace");
								$("#taTrace").val(data.trim());
							}
                            enableControls1();
                            if(automatic)
                            	from1to2();
						}
					});
				}
			}
		}
	});
}

function doRewGeneration(program,ista,fsta,automatic) {
	console.time("Rew-generation");
	$.ajax( {
		type: "POST",
		url: "ws/parse-program",
		timeout: 250000,
		data: "program=" + encodeURIComponent(program),
		error: function(error) {
			console.timeEnd("Parse-program");
			showErrorMessage1(BAD_PROGRAM);
            enableControls1();
		},
		success: function(response){
			console.timeEnd("Parse-program");
			if (response == null) { 
				showErrorMessage1(BAD_PROGRAM);
                enableControls1();
			}
			else {
				response = response.split("ELP-RESULT");
				if (response.length < 2){
					enableControls1();
					try {
						var errors = response[0].replace(/(?:\r\n|\r|\n)/g,"ELP-NEWLINE");
						$("#parseWindowContent2").text(errors);
						$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/ELP-NEWLINE/g,"<br>"));
						$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/Warning:/g,"<span class=\"elpError\">Warning:</span>"));
						$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/&lt;---\*HERE\*/g,"<span class=\"elpError\">&lt;---*HERE*</span>"));
						$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/<br>Error: No parse for input./g,""));
						$("#myParseWindow").modal("show");
					}
					catch(ex){ showErrorMessage1(BAD_PROGRAM); };
				}
				else {
					isFullMaude = response[0] == "true";
					modName = response[1].trim();
					console.time("Parse-input");
					$.ajax( {
						type: "POST",
						url: "ws/rew-generation",
						timeout: 250000,
						data: "modname=" + encodeURIComponent(modName) + "&program=" + encodeURIComponent(program) + "&istate=" + encodeURIComponent(ista) + "&fstate=" + encodeURIComponent(fsta) + "&fullmaude=" + encodeURIComponent(isFullMaude),
						error: function(error) {
							console.timeEnd("Rew-generation");
							showErrorMessage1(NO_GENERATION_REW);
                            enableControls1();
						},
                        success: function(data){
							console.timeEnd("Rew-generation");
							if (data == null || data.length == 0 || data.indexOf("iJulienne error detected.") != -1) {
								showErrorMessage1(NO_GENERATION_REW);
							}
							else {
								$("#selectType").selectpicker("val","trace");
								$("#taTrace").val(data.trim());
							}
                            enableControls1();
                            if(automatic)
                            	from1to2();
						}
					});
				}
			}
		}
	});
}

function doInitialization(program,trace) {
	console.time("Parse-program");
	$.ajax( {
		type: "POST",
		url: "ws/parse-program",
		timeout: 250000,
		data: "program=" + encodeURIComponent(program),
		error: function(error) {
			console.timeEnd("Parse-program");
			showErrorMessage1(BAD_PROGRAM);
			enableControls1();
		},
		success: function(response){
			console.timeEnd("Parse-program");
			if (response == null) {
				showErrorMessage1(BAD_PROGRAM);
				enableControls1();
			}
			else {
				response = response.split("ELP-RESULT");
				if (response.length < 2){
					enableControls1();
					try {
						if (response[0] == "COMMANDS_DETECTED")
                    		showErrorMessage1(getFlag(response[0]));
						else {
							var errors = response[0].replace(/(?:\r\n|\r|\n)/g,"ELP-NEWLINE");
							$("#parseWindowContent2").text(errors);
							$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/ELP-NEWLINE/g,"<br>"));
							$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/Warning:/g,"<span class=\"elpError\">Warning:</span>"));
							$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/&lt;---\*HERE\*/g,"<span class=\"elpError\">&lt;---*HERE*</span>"));
							$("#parseWindowContent2").html($("#parseWindowContent2").html().replace(/<br>Error: No parse for input./g,""));
							$("#myParseWindow").modal("show");
						}
					}
					catch(ex){ showErrorMessage1(BAD_PROGRAM); };
				}
				else {
					isFullMaude = response[0] == "true";
					modName = response[1].trim();
					console.time("Initialization");
					$.ajax( {
						type: "POST",
						url: "ws/init",
						timeout: 250000,
						data: "modname=" + encodeURIComponent(modName) + "&program=" + encodeURIComponent(program) + "&trace=" + encodeURIComponent(trace) + "&fullmaude=" + encodeURIComponent(isFullMaude),
						error: function(error) {
							console.timeEnd("Initialization");
							showErrorMessage1(BAD_TRACE);
                            enableControls1();
						},
						success: function(response){
							console.timeEnd("Initialization");
							try {
								response = response.trim().slice(1,-1).trim().replace(/DEV-BULLET/g,"•").replace(/ELP-DQ/g,"\"").replace(/ELP-EDQ/g,"\\\"");
								var data = JSON.parse(response);
								$("#step1").hide();
								$("#step2").show();
								zoom = 100;
								drawing = null;
								myTrace = new iJulienneTrace();
								myTrace.isSource = $("#opVWcheck").css("display") == "none";
								myTrace.showState = !($("#opSLcheck").css("display") == "none");
								myTrace.showRule = !($("#opRLcheck").css("display") == "none");
								myTrace.showRedex = !($("#opRXcheck").css("display") == "none");
								myTrace.kinds = parseKinds(data.kinds);
								data.term.map = parseMap(data.term.map)
								
								myTrace.add(false,0,data.term,null,null,null,null);
								for(var i = 0; i < data.trace.length; i++){
									data.trace[i].term.map = parseMap(data.trace[i].term.map)
									myTrace.add(false,i+1,data.trace[i].term,data.trace[i].rule,data.trace[i].sub,data.trace[i].cond,parsePosition(data.trace[i].pos));
								}
								if (myTrace.getLength() == 1){
									$("#opFScheck").css("display","none");
									$("#opBScheck").css("display","none");
									$("#opRLcheck").css("display","none");
									myTrace.showRule = false;
									$("#opRXcheck").css("display","none");
									myTrace.showRedex = false;
									myTrace.mode = MODE_NONE;
									$("#mode1").addClass("disabled"); 
									$("#mode2").addClass("disabled"); 
									$("#menuRule").addClass("disabled"); 
									$("#menuRedex").addClass("disabled"); 
									$("#menuTrace").addClass("disabled"); 
									$("#menuProgram").addClass("disabled"); 
									$("#menuRestore").addClass("disabled"); 
									$("#menuClear").addClass("disabled");
									$("#sliderControlWrapper").hide();
								}
								else {
									myTrace.iState = myTrace.getState(0);
                                    myTrace.fState = myTrace.getState(myTrace.getLength()-1);
									myTrace.Selected = myTrace.fState;
									myTrace.mode = MODE_BACKWARD;
									$("#opBScheck").css("display","inline");
									$("#opFScheck").css("display","none");
									myTrace.showRule = true;
									$("#opRXcheck").css("display","inline");
									myTrace.showRedex = true;
									$("#mode1").removeClass("disabled"); 
									$("#mode2").removeClass("disabled"); 
									$("#menuRule").removeClass("disabled"); 
									$("#menuRedex").removeClass("disabled"); 
									$("#menuTrace").removeClass("disabled"); 
									$("#menuProgram").removeClass("disabled"); 
									$("#menuRestore").removeClass("disabled"); 
									$("#menuClear").removeClass("disabled");
									$("#sliderControlWrapper").show();
								}
								drawTrace(false);
							    if (myTrace.mode == MODE_FORWARD)
							    	goFirst(true);
							    else
							    	goLast(true);
							    enableControls1();
								if (impData != null && impData.length > 4 && impData[4] != null) {
							    	disableControls2();
							    	//impdata = [program, type, mode, {trace || condition}, {trace-slice || condition-slice}]
							    	if (impData[1] == EXP_TRACE){ //Is a trace-slice (from Anima)
							    		myTrace.mode = MODE_FORWARD;
							    		$("#opFScheck").css("display","inline");
							    		$("#opBScheck").css("display","none");
										for(var i = 0; i < impData[4].length; i++){
							    			var state = myTrace.getState(i);
							    			state.slice = impData[4][i][0];
							    			state.condsli = impData[4][i][1];
							    		}
							    		myTrace.hasSlice = true;
							    		drawTrace(false);
									    if (myTrace.mode == MODE_FORWARD)
									    	goFirst(true);
									    else
									    	goLast(true);
									    enableControls2();
							    	}
							    	else { //Is a condition-slice (from either Anima or another instance of iJulienne)
							    		myTrace.hasSlice = true;
							    		if (impData[2]){ //Forward inspection
							    			myTrace.mode = MODE_FORWARD;
								    		$("#opFScheck").css("display","inline");
								    		$("#opBScheck").css("display","none");
											var state = myTrace.getState(0);
											if (impData[4].type == TYPE_EQ || impData[4].type == TYPE_RW)
												doForward(program,myTrace.getInstrumentedTrace(0,myTrace.fState.id), impData[4].lhsmeta, getOpsCommand(),0,myTrace.fState.id);
											else if (impData[4].type == TYPE_MA)
												doForward(program,myTrace.getInstrumentedTrace(0,myTrace.fState.id), impData[4].rhsmeta, getOpsCommand(),0,myTrace.fState.id);
							    		}
							    		else { //Backward inspection
							    			myTrace.mode = MODE_BACKWARD;
									    	$("#opBScheck").css("display","inline");
									    	$("#opFScheck").css("display","none");
							    			var state = myTrace.fState;
							    			doBackward(myTrace.getInstrumentedTrace(0,myTrace.fState.id), impData[4].slice.meta, getOpsCommand(),0,myTrace.fState.id);
							    		}
							    	}
							    	impData = null;
							    }
							}
							catch(e) {
								showErrorMessage1(BAD_TRACE);
								enableControls1();
							}
						}
					});
				}
			}
		}
	});	
}

function doBackward(program, itrace, criteria, ops, ini, fin){
	console.time("Backward-slice");
	$.ajax( {
		type: "POST",
		url: "ws/backward",
		timeout: 250000,
		data: "modname=" + encodeURIComponent(modName) + "&program=" + encodeURIComponent(program) + "&itrace=" + encodeURIComponent(itrace) + "&criteria=" + encodeURIComponent(criteria) + "&ops=" + encodeURIComponent(ops) + "&fullmaude=" + encodeURIComponent(isFullMaude),
		error: function(error) {
			console.timeEnd("Backward-slice");
			showErrorMessage2(NO_SLICE);
            enableControls2();
		},
		success: function(response){
			console.timeEnd("Backward-slice");
			try {
				response = response.trim().slice(1,-1).trim().replace(/DEV-BULLET/g,"•").replace(/ELP-DQ/g,"\"").replace(/ELP-EDQ/g,"\\\"");
				var data = JSON.parse(response);
				
				myTrace.hasSlice = true;
				myTrace.compatibility = data.comp;
				myTrace.program = data.program;
				
				var sta = myTrace.getState(ini);
				sta.slice = data.slice;
				sta.slice.map = parseMap(sta.slice.map);
				sta.subsli = [];
				sta.condsli = [];
				
				for(var i = 1; i < data.trace.length+1; i++){
					sta = myTrace.getState(ini+i);
					sta.slice = data.trace[i-1].slice;
					sta.slice.map = parseMap(sta.slice.map);
					sta.subsli = data.trace[i-1].sub;
					sta.condsli = data.trace[i-1].cond;
					sta.relevant = data.trace[i-1].relev;
				}
				myTrace.fState = myTrace.getState(fin);
				drawTrace(false);
			    goLast(true);
			    $("#moProgramSlice").removeClass("disabled");
				enableControls2();
			}
			catch(e) {
				showErrorMessage2(NO_SLICE);
				enableControls2();
			}
		}
	});
}

function doForward(program,itrace, criteria, ops, ini, fin){
	console.time("Forward-slice");
	$.ajax( {
		type: "POST",
		url: "ws/forward",
		timeout: 250000,
		data: "modname=" + encodeURIComponent(modName) + "&program=" + encodeURIComponent(program) + "&itrace=" + encodeURIComponent(itrace) + "&criteria=" + encodeURIComponent(criteria) + "&ops=" + encodeURIComponent(ops) + "&fullmaude=" + encodeURIComponent(isFullMaude),
		error: function(error) {
			console.timeEnd("Forward-slice");
			showErrorMessage2(NO_SLICE);
            enableControls2();
		},
		success: function(response){
			console.timeEnd("Forward-slice");
			try {
				response = response.trim().slice(1,-1).trim().replace(/DEV-BULLET/g,"•").replace(/ELP-DQ/g,"\"").replace(/ELP-EDQ/g,"\\\"");
				var data = JSON.parse(response);
				
				myTrace.hasSlice = true;
				myTrace.compatibility = data.comp;
				myTrace.program = data.program;
				
				var sta = myTrace.getState(ini);
				sta.slice = data.slice;
				sta.slice.map = parseMap(sta.slice.map);
				sta.subsli = [];
				sta.condsli = [];

				for(var i = 1; i < data.trace.length+1; i++){
					sta = myTrace.getState(ini+i);
					sta.slice = data.trace[i-1].slice;
					sta.slice.map = parseMap(sta.slice.map);
					sta.subsli = data.trace[i-1].sub;
					sta.condsli = data.trace[i-1].cond;
					sta.relevant = data.trace[i-1].relev;
				}
				myTrace.iState = myTrace.getState(ini);
				drawTrace(false);
				goFirst(true);
			    $("#moProgramSlice").removeClass("disabled");
				enableControls2();
			}
			catch(e) {
				showErrorMessage2(NO_SLICE);
				enableControls2();
			}
		}
	});
}

function doOrigins(program, itrace, criteria, ops, ini, fin){
	console.time("Origins-tracker");
	$.ajax( {
		type: "POST",
		url: "ws/origins",
		timeout: 250000,
		data: "modname=" + encodeURIComponent(modName) + "&program=" + encodeURIComponent(program) + "&itrace=" + encodeURIComponent(itrace) + "&criteria=" + encodeURIComponent(criteria) + "&ops=" + encodeURIComponent(ops) + "&fullmaude=" + encodeURIComponent(isFullMaude),
		error: function(error) {
			console.timeEnd("Origins-tracker");
			showErrorMessage2(NO_SLICE);
            enableControls2();
		},
		success: function(response){
			console.timeEnd("Origins-tracker");
			try {
				response = response.trim().slice(1,-1).trim().replace(/DEV-BULLET/g,"•").replace(/ELP-DQ/g,"\"").replace(/ELP-EDQ/g,"\\\"");
				var data = JSON.parse(response);
				
				myTrace.hasSlice = true;
				myTrace.compatibility = data.comp;
				myTrace.program = data.program;
				
				var sta = myTrace.getState(ini);
				sta.slice = data.slice;
				sta.slice.map = parseMap(sta.slice.map);
				sta.subsli = [];
				sta.condsli = [];
				
				for(var i = 1; i < data.trace.length+1; i++){
					sta = myTrace.getState(ini+i);
					sta.slice = data.trace[i-1].slice;
					sta.slice.map = parseMap(sta.slice.map);
					sta.subsli = data.trace[i-1].sub;
					sta.condsli = data.trace[i-1].cond;
					sta.relevant = data.trace[i-1].relev;
				}
				myTrace.fState = myTrace.getState(fin);
				drawTrace(false);
			    goLast(true);
			    $("#moProgramSlice").removeClass("disabled");
				enableControls2();
			}
			catch(e) {
				showErrorMessage2(NO_SLICE);
				enableControls2();
			}
		}
	});
}

function doQuery(program,states,pattern,topSorts) {
	console.time("Query");
	$.ajax( {
		type: "POST",
		url: "ws/query",
		timeout: 250000,
		data: "modname=" + encodeURIComponent(modName) + "&program=" + encodeURIComponent(program) + "&states=" + encodeURIComponent("(" + states +")") + "&pattern=" + encodeURIComponent(pattern) + "&topSorts=" + encodeURIComponent(topSorts[0]) + "&topOps=" + encodeURIComponent(topSorts[1]) + "&fullmaude=" + encodeURIComponent(isFullMaude),
		error: function(error) {
			console.timeEnd("Query");
			showErrorMessage2(QUERY_ERR);
            enableControls2();
		},
		success: function(response){
			console.timeEnd("Query");
			try {
				response = response.trim().slice(1,-1).trim().replace(/DEV-BULLET/g,"•").replace(/ELP-DQ/g,"\"").replace(/ELP-EDQ/g,"\\\"");
				var data = JSON.parse(response);
				if (data != null && !(data.query === undefined) && data.query.length > 0){
					myTrace.clearCriteria();
					for (var i = 0; i < data.query.length ; i++){
						if (data.query[i].pos != "")
							myTrace.getState(data.query[i].state).criteria = parsePosition(data.query[i].pos).split(",");
						else 
							myTrace.getState(data.query[i].state).criteria = [];
					}
					highlightQueryResults();
					$("#dInfoQuery").html(getMatchingStatesHTML());
					$("#myQueryWindow").modal("show");
					$("#spanQuery").text(pattern.replace(/ELPDISCARD/g,"_").replace(/ELPIDENTIFY/g,"?"));
					$("#taQuery").html($("#tData"+myTrace.Selected.id).html());
					$("#taQuery").textHighlighter();
					$(document.getElementById("qs"+(myTrace.Selected.id))).addClass("QueryStateSelected");
					resizeModalWindow($("#myQueryWindow"),$("#queryWindowWrapper"),$("#queryWindowContent"));
				}
				else 
					showErrorMessage2(QUERY_EMP);
	            enableControls2();
			}
			catch(e) {
				showErrorMessage2(QUERY_ERR);
	            enableControls2();
			}
		}
	});
}

function doProgramSlice(){
	var ele = document.getElementById("taProgramSlice");
	ele.innerHTML = ele.innerHTML.replace(/([ \t]*(c{0,1}rl|c{0,1}eq|c{0,1}mb)[ \t]+\[.*?\].*?[ \t]{1,}\..*?)\<br class="sliced"\>/g,"<span class=\"sliced\">$1</span><br class=\"sliced\">");
	ele.innerHTML = ele.innerHTML.replace(/("sliced"\>)([ \t]*(op|ops)[ \t]+.*?[ \t]+:[ \t]+.*?-&gt;[ \t]+.*?[ \t]{1,}\..*?)\<br class=/g,"$1<span class=\"sliced\">$2</span><br class=");
	ele.innerHTML = ele.innerHTML.replace(/("sliced"\>)([ \t]*(class)[ \t]+.*?[ \t]{1,}\..*?)\<br class=/g,"$1<span class=\"sliced\">$2</span><br class=");
    ele.innerHTML = ele.innerHTML.replace(/("sliced"\>)([ \t]*(subclass|subclasses)[ \t]+.*?[ \t]+&lt;[ \t]+.*?[ \t]{1,}\..*?)\<br class=/g,"$1<span class=\"sliced\">$2</span><br class=");
	ele.innerHTML = ele.innerHTML.replace(/("sliced"\>)([ \t]*(var|vars)[ \t]+.*?[ \t]+:[ \t]+.*?[ \t]{1,}\..*?)\<br class=/g,"$1<span class=\"sliced\">$2</span><br class=");
	ele.innerHTML = ele.innerHTML.replace(/\<br class="sliced"\>\<\/span\>/g,"</span>");
	
	/* PROGRAM SLICING: RULES AND EQS */
	var rules = myTrace.getRelevantRules();
	for(var i = 0; i < rules.length; i++){
		if (rules[i] != null && rules[i].length > 0){
			var pattern = "\\<span class=\"sliced\"\\>[ \\t]*c{0,1}(rl|eq)[ \\t]*\\["+rules[i]+"\\]";
			var reg = new RegExp(pattern,"g");
			var match = ele.innerHTML.match(reg);
			if (match != null)
				ele.innerHTML = ele.innerHTML.replace(match[0],match[0].replace("class=\"sliced\"","class=\"relevant\""));
		}
	}
	/* PROGRAM SLICING: OPS */
	var ops = myTrace.getRelevantOps();
	var codigo = ele.innerHTML.split("<br class=\"sliced\">"); 
	for(var j = 0; j < ops.length; j++){
		var op = ops[j][0];
		var cop = op.replace(/`/g,""); //clean op to cover both escaped and non-escaped ops (e.g., <_`,_> and <_,_>)
		unsliceOp(op,ops,j,codigo);
		if (op != cop)
			unsliceOp(cop,ops,j,codigo);
	}
	ele.innerHTML = codigo.join("<br class=\"sliced\">");
	ele.innerHTML = ele.innerHTML.replace(/ELPRELEVANTMARKOPEN/g,"<span class=\"relevant\">");
	ele.innerHTML = ele.innerHTML.replace(/ELPRELEVANTMARKCLOSE/g,"</span>");
	
	/* OO-PROGRAM SLICING: CLASSES AND SUBCLASSES */
	var classes = myTrace.getRelevantClasses();
	for(var i = 0; i < classes.length; i++){
		if (classes[i] != null && classes[i].length > 0){
			var pattern = "\\<span class=\"sliced\"\\>[ \\t]*(class)[ \\t]+"+classes[i]+"[ \\t]+.*?[ \\t]+\.\<\/span\\>";
			var match = ele.innerHTML.match(new RegExp(pattern,"g"));
			if (match != null)
				ele.innerHTML = ele.innerHTML.replace(match[0],match[0].replace("class=\"sliced\"","class=\"relevant\""));
		}
	}
	codigo = ele.innerHTML.split("<br class=\"sliced\">");
	for(var i = 0; i < classes.length; i++){
		unsliceClass(classes[i],codigo);
	}
	ele.innerHTML = codigo.join("<br class=\"sliced\">");
	ele.innerHTML = ele.innerHTML.replace(/ELPRELEVANTMARKOPEN/g,"<span class=\"relevant\">");
	ele.innerHTML = ele.innerHTML.replace(/ELPRELEVANTMARKCLOSE/g,"</span>");
}

function unsliceOp(op,ops,i,codigo) {
	op = convertHTMLSymbols(op);
	op = replaceRegExpMetaChars(op);
	var regop = "(\"sliced\">)([ \\t]*)(op)([ \\t]+.*?)("+op+")([ \\t]+.*?:[ \\t]+";
	var regops = "(\"sliced\">|\"relevant\">)([ \\t]*[ELPRELEVANTMARKOPEN]*)(ops)([ELPRELEVANTMARKCLOSE]*[ \\t]+.*?)("+op+")([ \\t]+.*?)(:[ \\t]+";
	for(var j = 1; j < ops[i].length-1; j++){
		regop+=ops[i][j].replace(/`/g,"")+"[ \\t]+";
		regops+=ops[i][j].replace(/`/g,"")+"[ \\t]+";
	}
	regop+="-&gt;[ \\t]+"+ops[i][ops[i].length-1].replace(/`/g,"").replace("\"","")+"[ \\t]+.*)";
	regops+="-&gt;[ \\t]+"+ops[i][ops[i].length-1].replace(/`/g,"").replace("\"","")+"[ \\t]+.*)";
	for(var k = 0; k < codigo.length; k++){
		var regExpOP = new RegExp(regop,"g");
		var regExpOPS = new RegExp(regops,"g");
		if (codigo[k].match(regExpOPS) != null)
			codigo[k] = codigo[k].replace(regExpOPS,"\"sliced\">$2ELPRELEVANTMARKOPEN$3ELPRELEVANTMARKCLOSE$4ELPRELEVANTMARKOPEN$5ELPRELEVANTMARKCLOSE$6ELPRELEVANTMARKOPEN$7ELPRELEVANTMARKCLOSE");
		else if (codigo[k].match(regExpOP) != null)
			codigo[k] = codigo[k].replace(regExpOP,"\"relevant\">$2$3$4$5$6");
	}
}

function unsliceClass(clss,codigo){
	var regcls = "(\"sliced\">)([ \\t]*)(subclass)(.*?)([ \\t]+"+clss+"[ \\t]+)(.*?)(&lt;[ \\t]+.*?[ \\t]+\\.)";
	var regclss = "(\"sliced\">|\"relevant\">)([ \\t]*[ELPRELEVANTMARKOPEN]*)(subclasses|subclass)([ELPRELEVANTMARKCLOSE]*.*?)([ \\t]+)("+clss+")([ \\t]+)(.*?)(&lt;[ \\t]+.*?[ \\t]+\\.)";
	for(var k = 0; k < codigo.length; k++){
		var regExpCLS = new RegExp(regcls,"g");
		var regExpCLSS = new RegExp(regclss,"g");
		if (codigo[k].match(regExpCLSS) != null)
			codigo[k] = codigo[k].replace(regExpCLSS,"\"sliced\">$2ELPRELEVANTMARKOPEN$3ELPRELEVANTMARKCLOSE$4$5ELPRELEVANTMARKOPEN$6ELPRELEVANTMARKCLOSE$7$8ELPRELEVANTMARKOPEN$9ELPRELEVANTMARKCLOSE");
		else if (codigo[k].match(regExpCLS) != null)
			codigo[k] = codigo[k].replace(regcls,"\"relevant\">$2$3$4$5$6$7");
	}
}