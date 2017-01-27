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

var GENERIC_ERROR = 0;
var BAD_FILE = 1;
var BAD_PROGRAM = 2;
var BAD_STATE = 3;
var BAD_TRACE = 4;
var NO_CRITERIA = 5;
var NO_BULLET = 6;
var NO_SLICE = 7;
var QUERY_EMP = 8;
var QUERY_NOR = 9;
var QUERY_ERR = 10;
var NO_CHECK = 11;
var OK_CHECK = 12;
var KO_CHECK = 13;
var BOUND_ERR = 14;
var COMMANDS_DETECTED = 15; 
var ORDER_NOT_FOUND = 16;
var FILE_NOT_FOUND = 17;
var NO_GENERATION_REW = 18;
var NO_GENERATION_RED = 19; 
		
var MODE_NONE = 0;
var MODE_BACKWARD = 1;
var MODE_FORWARD = 2;
var MODE_ORIGINS = 3;

var TRACE_LARGE = 0;
var TRACE_MEDIUM = 1;
var TRACE_SMALL = 2;

var EXP_STATE = 0;
var EXP_TRACE = 1;
var EXP_CONDITION = 2;

var TYPE_MB = "membership";
var TYPE_EQ = "equational";
var TYPE_MA = "matching";
var TYPE_RW = "rewrite";

var myProgram;
var myTrace = null;
var autoselect = false;
var autodelete = false;
var zoom = 100;
var drawing = null;
var isWorking = false;

var istate = -1;	//initial state
var fstate = -1;	//final state
var astate = null;	//Anima export state
var icond = null;	//iJulienne export condition
var icsli = null;	//iJulienne export sliced condition

var impData = null;	//Imported Data

var modName= null;
var isFullMaude = null;