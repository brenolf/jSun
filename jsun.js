/*
*	Framework jSun - JavaScript Source
*	v. 1.35P
*
*	Copyright 2010, Breno Lima de Freitas
*
*	Date: Thu Feb 23 2012 17:38:14 GMT-0200
*
*/

window.jSun = function(args){
	
	var id = args[0];
	var ref = args[1];
	var from = args[2];
	var queue = [];

	var _ = this;
	_.o = ref?ref:null;
	
	var d = window.document;

	if((typeof id!='object' && typeof id!='string')||(from && !_.o))return null;
	
	if(typeof id=='object' && 'tagName' in id)queue = [id];
	else if(id instanceof jSun||typeof id=='object')return id;
	else{
		if(id.match(/\[\]/g))return null;
		
		var brc1 = id.match(/\[/g), brc2 = id.match(/\]/g);
		var brackets = (brc1 || brc2)?(brc1.length==brc2.length):true;

		if(!brackets)return null;
		
		id = id.trim().rp(/\s+/g, ' ').rp(/ ?(>|,) ?/g, '$1').split(' && ');

		for(var z in id){
			var e = id[z].split(' ');
			for(var i in e){
				if(e[i].match(/\[/g)){
					
					if(e[i].match(/\]/g))continue;
					
					var j = i.num()+1;
					
					while(e[j].match(/\]/g)){
						e[i]+=e[j];
						delete e[j++];
					}
					
					e[i]+=e[j];
					delete e[j];
				}
			}

			for(var i in e){
				var rs;
				
				if(rs = e[i].match(/(window|body|forms|top|images|document)/)){
					if(!_.o)_.o = [];
					
					var out = {
						'window': window,
						'body': document.body,
						'forms': document.forms,
						'top': top.document,
						'images': document.images,
						'document': document.documentElement
					};
					
					_.o[_.o.length] = out[rs[1]];
					
					continue;
				}
				
				
				if(rs = e[i].match(/#(.+)/)){
					if(!_.o)_.o = [];
					
					if(from){
						for(var j in _.o){
							if(_.o[j].id==rs[1]){
								_.o[_.o.length] = [_.o[j]];
								break;
							}
						}
					}else _.o[_.o.length] = document.getElementById(rs[1]);
					
					continue;
				}
				
				if(rs = e[i].match(/(checkbox|radio)?:(text(area)?|button|hidden|submit|password|file|check(box|ed)|radio|disabled)/)){
					
					if(!_.o){
						var ax = js('forms').ar[0];
						_.o = [];
						for(var j in ax){
							if(isNaN(j))continue;
							_.o[_.o.length] = ax[j];
						}
					}
					
					var w = rs[2], pref = rs[1],elm, el, cond;
					
					for(var j in _.o){
						if(isNaN(j))continue;
						
						if(from)elm = [_.o[j]];
						else elm = _.o[j].getElementsByTagName(w=='textarea'?w:'input');
						
						for(var l in elm){							
							if(isNaN(l))continue;
							
							cond = false;
							
							el = elm[l];
							
							if((w=='checked'&&el.checked)||(w=='disabled'&&el.disabled)||w=='textarea')cond = true;
							else if(el.type.low()==w)cond = true;
							
							if(pref && pref!=w)cond = cond && (el.type.low()==pref);
							
							if(cond)_.o[_.o.length] = el;
						}
						
						delete _.o[j];
					}
					
					continue;
				}
				
				if(rs = e[i].match(/(.+)>(.+)/)){
					var prt = js(rs[1], from?_.o:null).ar, ax = [];
					
					for(var j in prt){
						for(var l in prt[j].childNodes){
							if(isNaN(l))continue;
							if(prt[j].childNodes[l].nodeType==1)ax[ax.length] = prt[j].childNodes[l];
						}
					}
					
					_.o = js(rs[2], ax, true).ar;
					continue;
				}
				
				if(rs = e[i].match(/(.*)\[(.+)\]/)){
					if(from)_.o = js(rs[1], _.o, true).ar;
					
					if(!_.o){
						if(!rs[1]){
							var a = document.getElementsByTagName('*');
							_.o = [];
							for(var i=0;i<a.length;i++)_.o[i] = a[i];
						}else _.o = js(rs[1]).ar;
						from = true;
					}
					
					var ex = rs[2].trim().rp(/\s+/g, ' ').rp(/ , /g, ',').split(','), ax = [];
					
					for(var j in _.o){
						if(isNaN(j))continue;
						
						var r;
						if(from)r = [_.o[j]];
						else r = _.o[j].getElementsByTagName(rs[1]?rs[1]:'*');
						
						for(var ein in r){
							if(isNaN(ein))continue;
							var el = js(r[ein]), isIn = true;
							
							for(var l in ex){
								if(isNaN(l))continue;
								
								var opr = ex[l].match(/(.+)(.)="(.+)"/);
								
								if(opr){
									var w = opr[3];
									
									isIn = el.has(opr[1]) && isIn;
									
									var exps = {
										'^': '^'+w,
										'$': w+'$',
										'*': w,
										'~': '^(( '+w+')|('+w+' )|( '+w+' )|'+w+')$',
										'!': '^((?!('+w+')).*)$',
										'=': '^'+w+'$',
										'|': '^'+w+'(-.+)?'
									};
									
									isIn = RegExp(exps[opr[2]]).test(el.att(opr[1])) && isIn;
								}else isIn = el.has(ex[l]) && isIn;
							}// for every attribute wich must be verified
							
							if(isIn)ax[ax.length] = r[ein];
						}// for every childNode or self element left to be validated
						
					}// for every element in _.o
					
					_.o = ax;
					from = false;
					continue;
				}
				
				if(rs = e[i].match(/(.*)\.(.+)/)){
					
					if(from){
						for(var l in _.o){
							if(_.o[l].tagName.low()!=rs[1].low())delete _.o[l];
						}
					}
					
					if(!_.o){
						var a = document.getElementsByTagName(rs[1]?rs[1]:'*');
						_.o = [];
						for(var i=0;i<a.length;i++)_.o[i] = a[i];
						from = true;
					}
					
					var ax = [];
					
					for(var j in _.o){
						if(isNaN(j))continue;
						
						var r;
						if(from)r = [_.o[j]];
						else r = _.o[j].getElementsByTagName(rs[1]?rs[1]:'*'); 
						
						for(var l in r){
							if(isNaN(l))continue;
							if(r[l].className==rs[2])ax[ax.length] = r[l];
						}
					}
					
					_.o = ax;
					
					from = false;
					continue;
				}
				
				if(rs = e[i].match(/(.+)/)){
					if(!_.o){
						var a = document.getElementsByTagName(rs[1]);
						_.o = [];
						for(var i=0;i<a.length;i++)_.o[i] = a[i];
						continue;
					}
					
					for(var j in _.o){
						if(isNaN(j))continue;
						
						var r = _.o[j].getElementsByTagName(rs[1]);
						if(from)r = [(_.o[j].tagName.low()==rs[1].low()?_.o[j]:null)];
						
						for(var l in r){
							if(isNaN(l))continue;
							_.o[_.o.length] = r[l];
						}
						
						delete _.o[j];
					}
				}
				
			}//try the matches
			
			for(var i in _.o){
				if(isNaN(i))continue;
				queue[queue.length] = _.o[i];
			}
			
			_.o = null;
			
		}//every selector of the queue
		_.o = queue;
	}//is a string
	
	var r = [];
	for(var i in queue){
		if(!queue[i])continue;
		r[r.length] = queue[i];
		
		for(var j in queue){
			if(queue[j]==queue[i] && i!=j)delete queue[j];
		}
	}
	
	if(!r[0])return null;

	_.o = r[0];
	_.ar = r;

	return _;
};

window.js = function(id, main){
	return new jSun(arguments);
};

js.$ = function(){
	window.$ = window.js;
}

js.extend = function(){
	var t=this, i=0, f, k, v;
	if(arguments.length>1){
		i++;
		t=arguments[0];
	}
	for(var i; f=arguments[i];i++){
		for(var k in f){
			v=f[k];
			if(v&&v.splice)t[k]=t[k]&&t[k].splice?t[k].concat(v):[].concat(v);
			else if(v&&typeof v=='object')t[k]=js.extend(t[k]||{},v);
			else t[k]=v;
		}
	}
};

js.extend(jSun.prototype,{	
	it:function(){
		return (this.ar.length == 1)?this.o:this.ar;
	},
	
	head:function(){
		return this.o;
	},
	
	getSize:function(){
		return this.ar.length;
	},
	
	at:function(l){
		var _=this;
		l = (!l||l<0)?0:l;
		return js(_.ar[l]?_.ar[l]:_.ar[_.getSize()-1]);
	},
	
	data:function(o){
		if(o==undefined||o==null)return;
		
		if(!this.db)this.db = {};
		
		if(typeof o=='object'){
			for(var n in o){
				if(!this.db[n])this.db[n] = o[n];
				else{
					if(!this.db[n].splice)this.db[n] = [this.db[n]];
					this.db[n][this.db[n].length] = o[n];
				}
			}
		}else if(typeof o=='string'){
			o = o.rp(/\s+/g, '').split('->');
			var r = this.db;
			for(var n in o){
				if(isNaN(n))continue;
				
				r = r[o[n]];
				
				if(!r){
					r = null;
					break;
				}
			}
			return r;
		}
	},
	
	onready:function(fn){
		var _=this;
		if(!_.isready){
			var fg=function(){
				if(!document.all){
					document.removeEventListener('DOMContentLoaded',fg,false);
					document.removeEventListener('load',fg,false);
				}else{
					//document.dettachEvent('onreadystatechange',fg);
					//document.dettachEvent('onload',fg);
				}
				setTimeout(fn,33);
			};
			if(!document.all){
				document.addEventListener('DOMContentLoaded',fg,false);
				document.addEventListener('load',fg,false);
			}else{
				document.attachEvent('onreadystatechange',fg);
				document.attachEvent('onload',fg);
			}
			_.isready=1;
			return _;
		}
		fn();
		return _;
	},
	
	css:function(atvl){
		if(atvl == undefined || atvl == null)
			return this;
		
		var _=this;
		
		if(typeof atvl=='string'){
			if(document.all){
				var arr=atvl.match(/\-(.)/g);
				if(arr)atvl=atvl.rp(arr[0],arr[1].up());
				return _.o.currentStyle[atvl];
			}
			else{
				var arr=atvl.match(/[A-Z]/g);
				if(arr)atvl=atvl.rp(/([A-Z])/g, '-$1').low();
				return document.defaultView.getComputedStyle(_.o,null).getPropertyValue(atvl);
			}
		}

		for(var n in atvl){
			for(var i=0,e;e=_.ar[i++];){
				e.style[n] = atvl[n];
				if(n=='opacity')e.style.filter = 'alpha(opacity='+(atvl[n]*100)+');'
			}
		}
		return _;
	},
	
	hide:function(){
		this.db.css.display = this.css('display');
		return this.css({display: 'none'});
	},
	
	show:function(){
		this.db.css.display = this.db.css.display?this.db.css.display:'block';
		return this.css({display: this.db.css.display});
	},
	
	prt:function(l){
		var _=this;
		if(!l||l<0)l=1;
		var sbl=_.o;
		for(var i=0;i<l;i++){
			if(sbl.parentNode)sbl=sbl.parentNode;
			else break;
		}
		return new js(sbl);
	},
	
	insert:function(ref, parent, pos){
		var _=this;
		parent = parent?parent:_.o.parentNode;
		if(ref instanceof jSun)ref = ref.o;
		if(pos>0)parent.insertBefore(_.o, ref.nextSibling);
		else parent.insertBefore(_.o, ref);
		return _;
	},
	
	next:function(){
		var _=this;
		return new js(_.o.nextSibling?_.o.nextSibling:_.o);
	},
	
	prv:function(){
		var _=this;
		return new js(_.o.previousSibling?_.o.previousSibling:_.o);
	},
	
	node:function(l){
		var _=this;
		if(l==null)return _;
		if(l<0)l=1;
		var sbl=_.o;
		
		var r=[];
		for(var i=0,e;e=sbl.childNodes[i++];)if(e.nodeType==1)r[r.length]=e;
		
		return new js(r[l]?r[l]:r[r.length-1]);
	},
	
	nodes:function(nodesType){
		var _ = this;
		
		var r = [];
		
		nodesType = nodesType?nodesType:1;
		
		for(var j in _.ar){
			if(isNaN(j))continue;
			
			var el = _.ar[j];
			
			for(var i=0,e;e=el.childNodes[i++];)
				if(e.nodeType==nodesType)r[r.length] = e;
		}
		
		return r;
	},
	
	append:function(o){
		var _=this;
		if(!o.splice)_.o.appendChild((o.o?o.o:o));
		else for(var i=0, e;e=o[i++];)_.o.appendChild((e.o?e.o:e));
		return _;
	},
	
	appendTo:function(o){
		var _=this;
		for(var i=0,e;e=_.ar[i++];)js(o).append(e);
		return _;
	},
	
	last:function(){
		var _=this;
		var r=[];
		for(var i=0,e;e=_.o[0].childNodes[i++];)if(e.nodeType==1)r[r.length]=e;
		return js(r[r.length-1]);
	},
	
	rem:function(n){
		if(n==null)return _;
		var _=this;
		if(typeof n=='number')n = _.node(n);

		if(n instanceof jSun)n = n.ar;
		n = n.splice?n:[n];
		
		for(var i=n.length-1, e;e=n[i--];)e.parentNode.removeChild(e);

		return _;
	},
	
	del:function(){
		js(this.o).prt().o.removeChild(this.o);
	},
	
	empty:function(){
		var _=this;
		var i = 0;
		for(var i=0,e;e=_.ar[i++];){
			for(var j=e.childNodes.length-1;j>=0;j--)e.removeChild(e.childNodes[j]);
		}
		return _;
	},
	
	link: function(name, fn){
		var _ = this, ax = name.match(/^(on)?(.+)/);
		
		if(ax)name = ax[2];
		
		_.each(function(){
			if('attachEvent' in this)this.attachEvent('on'+name, fn);
			else if('addEventListener' in this)this.addEventListener(name, fn, false);
			else this['on'+name] = fn;
		});
		
		return _;
	},
	
	unlink: function(name, fn){
		var _ = this, ax = name.match(/^(on)?(.+)/);
		
		if(ax)name = ax[2];
		
		_.each(function(){
			if('dettachEvent' in this)this.dettachEvent('on'+name, fn);
			else if('removeEventListener' in this)this.removeEventListener(name, fn, false);
			else this['on'+name] = null;
		});
		
		return _;
	},
	
	scroll:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onscroll = f;
		return this;
	},
	
	mouseover:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onmouseover = f;
		return this;
	},
	
	mouseout:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onmouseout = f;
		return this;
	},
	
	mousedown:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onmouseout = f;
		return this;
	},
	
	mouseup:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onmouseup = f;
		return this;
	},
	
	mousemove:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onmousemove = f;
		return this;
	},
	
	keydown:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onkeydown = f;
		return this;
	},
	
	keyup:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onkeyup = f;
		return this;
	},
	
	keypress:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onkeypress = f;
		return this;
	},
	
	blur:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onblur = f;
		return this;
	},
	
	focus:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onfocus = f;
		return this;
	},
	
	click:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onclick = f;
		return this;
	},
	
	change:function(f){
		for(var i=0,e;e=this.ar[i++];)e.onchange = f;
		return this;
	},
	
	dblclick:function(f){
		for(var i=0,e;e=this.ar[i++];)e.ondblclick = f;
		return this;
	},

	each:function(fn, args){
		return new js.each(this.ar, fn, args);
	},
	
	att:function(n){
		var _=this;
		if(typeof n=='string')return _.o[n];
		for(var i=0,e;e=_.ar[i++];){
			for(var k in n)e.setAttribute(k, n[k]);
		}
		return _;
	},
	
	has:function(n){
		if(!n||typeof n!='string')return this;
		return document.all?_.o.attributes[n].specified:_.o.hasAttribute(n);
	},
	
	html:function(v){
		var _ = this;
		if(v==undefined || v==null)return _.o.innerHTML;
		_.o.innerHTML = v;
		return _;
	},
	
	text:function(v){
		var _ = this;
		var t = (_.o.innerText?_.o.innerText:_.o.textContent);
		if(v==undefined || v==null)return t;
		t = v;
		return _;
	},
	
	val:function(v){
		var _=this;
		if(v==undefined)return _.o.value;
		_.o.value=v;
		return _;
	},
	
	cl:function(n){
		var _=this;
		if(n==undefined)return _.o.className;
		for(var i=0,e;e=_.ar[i++];)e.className=n;
		return _;
	},
	
	id:function(){
		var _=this;
		return _.o.id;
	},
	
	tag:function(){
		var _=this;
		return (_.o.tagName?_.o.tagName:_.o.nodeName).low();
	},
	
	ow:function(){
		return this.o.offsetWidth;
	},
	
	oh:function(){
		return this.o.offsetHeight;
	},
	
	ol:function(){
		return this.o.offsetLeft;
	},
	
	ot:function(){
		return this.o.offsetTop;
	},
	
	motion:function(prop, time, then){
		return new js.motion(this, prop, time, then);
	},
	
	ajax:function(url){
		return new js.ajax(url);
	}
});

js.Graph = function(n){
	
	var _ = this;
	
	_.G = new Array(n);
	_.I = new Array(n);
	_.visits = new Array(n);
	_.Ivisits = new Array(n);

	_.r = 0;
	
	for(var i=0;i<n;i++){
		_.G[i] = [];
		_.I[i] = [];
	};
	
	_.arc = function(v, w){
		this.G[v].push(w);
		this.I[w].push(v);
	};
	
	_.edge = function(v, w){		
		this.arc(v, w);
		this.arc(w, v);
	};	
	
	_.dfs = function(){
		_.clearAll();
		
		for(var i=0;i<this.G.length;i++){
			if(this.visits[i] < 0)
				dfsFunc(i, _.G, _.visits);
		}
	};
	
	dfsFunc = function(v, g, vis){
		vis[v] = _.r++;
		
		for(var i=0, w=0;i<g[v].length;i++){
			w = g[v][i];
			
			if(vis[w] < 0)
				dfsFunc(w, g, vis);
		}
	};
	
	_.bfs = function(v){
		_.clearAll();
		
		var q = [];
		q.push(v);

		while(q.length){
			var x = q.shift();
			
			_.visits[x] = _.r++;
			
			for(var i=0, w=0;i<_.G[x].length;i++){
				w = _.G[x][i];
				
				if(_.visits[w] < 0)
					q.push(w);
			}
		}
	};
	
	_.isBigraph = function(){
		_.clearAll();
		
		var r = [];
		
		for(var i=0;i<this.G.length;i++)
			if(this.visits[i] < 0)
				r.push(bigraphFunc(i, 0));
		
		if(r.length == 1)return r[0];
		return r;
	};
	
	bigraphFunc = function(v, c){
		_.visits[v] = 1 - c;

		for(var i=0, w=0;i<_.G[v].length;i++){
			w = _.G[v][i];
			
			if(_.visits[w] < 0){
				if(!bigraphFunc(w, 1 - c))return false;
			}else if(_.visits[w] == 1 - c)return false;
		}
		
		return true;
	};
	
	_.kosaraju = function(){
		var r = [], _ = this;
		_.clearAll();
		
		for(var i=0, c=0;i<_.G.length;i++){
			if(_.visits[i] < 0){
	
				dfsFunc(i, _.G, _.visits);
				c = _.r;
				
				_.r = 0;
				
				dfsFunc(i, _.I, _.Ivisits);
				
				r.push(c == _.r);
			}
		}
		
		if(r.length == 1)return r[0];
		return r;		
	};
	
	_.show = function(){
		var r = '', g = this.G, o = [];
		
		for(var i=0;i<g.length;i++){
			r += i+'    |    ';
			o = [];
			
			for(var j=0;j<g[i].length;j++)
				o[o.length] = g[i][j];
			
			o.sort();
			
			for(var j=0;j<o.length;j++)
				r += o[j] + '    ';
			
			r += '\n';
		}
		
		return r;
	};
	
	_.clearAll = function(){
		clearVisits(-1);
		_.r = 0;
	};
	
	clearVisits = function(n){
		for(var i=0;i<_.visits.length;i++){
			_.visits[i] = n;
			_.Ivisits[i] = n;
		}
	};
	
	clearVisits(-1);
}

/*js.extend(Array.prototype,{
	I: function(s){
		if(!this.length)return this;
		
		s = s.rp(/\s+/g, '');
		s = s.match(/^(\d+)?:(\d+)?$/);
		
		var x = 0, y = 0, r = [], T = this;
		
		x = s[1];
		y = s[2];
		
		if(x == undefined)
			x = 0;
		if(y == undefined)
			y = T.length;
		
		for(var i=x;i<y;i++)
			r.push(T[i]);
			
		return r;
	}
});*/

js.extend(String.prototype,{
	ce:function(inner){
		var d = js(document.createElement(this));
		d.html(inner);
		return d;
	},
	toNode:function(){
		return js(document.createTextNode(this));
	},
	str:function(){
		return this.replace(/\d/g,'');
	},
	num:function(){
		var r=parseFloat(this.rp(/[^\,\.\-\d]/g,'').rp(/,/g,'.'));
		return isNaN(r)?0:r;
	},
	rp:function(re,rp){
		return this.replace(re, rp);
	},
	io:function(str){
		return this.indexOf(str);
	},
	lio:function(str){
		return this.lastIndexOf(str);
	},
	ioAt:function(str, pos){
		if(pos<=0)pos = 1;
		var r = 0;
		for(var i=0;i<this.length;i++){
			if(this.charAt(i)==str)r++;
			if(r==pos)return i;
		}return -1;
	},
	ca:function(n){
		if(n>=0)return this.charAt(n);
		return this.charAt(this.length+n);
	},
	up:function(){
		return this.toUpperCase();
	},
	low:function(){
		return this.toLowerCase();
	},
	int:function(){
		return parseInt(this);
	},
	float:function(){
		return parseFloat(this);
	},
	trim:function(){
		return this.replace(/(\s*)(.+)(\s*)/g,'$2');
	},
	count:function(str){
		for(var r=i=0;i<this.length;i++)if(this.charAt(i)==str)r++;
		return r;
	},
	mirror:function(){
		return this.split('').reverse().join('');
	},
	img:function(){
		return /\.(jpe?g|bmp|png|gif)$/.test(this.toLowerCase())?true:false;
	},
	email:function(){
		return /^[-_a-z0-9]+(\.[-_a-z0-9]+)*@([-a-z0-9]+\.)*([a-z]{2,4})$/.test(this.toLowerCase())?true:false;
	},
	sbs:function(start,end){
		if(start==null)return this;
		if(end==null)return this.substr(start);
		return this.substring(start,end<0?this.length+end:end);
	},
	l:function(){
		return this.length;
	}
});

js.extend(Number.prototype,{
	abs:	function(){return Math.abs(this);},
	ceil:	function(){return Math.ceil(this);},
	floor:	function(){return Math.floor(this);},
	round:	function(){return Math.round(this);},
	pow:	function(n){return Math.pow(this,n);},
	exp:	function(n){return Math.exp(this);},
	log:	function(n){return Math.log(this);},
	acos:	function(){return Math.acos(this);},
	asin:	function(){return Math.asin(this);},
	atan:	function(){return Math.atan(this);},
	max:	function(n){return Math.max(this,n);},
	min:	function(n){return Math.min(this,n);},
	pow:	function(n){return Math.pow(this,n);},
	sin:	function(){return Math.sin(this);},
	sqrt:	function(){return Math.sqrt(this);},
	tan:	function(){return Math.tan(this);}
});

js.each = function(v, f, args, ref){
	if(!v||!f)return false;
	if(!v.splice)v = [v];
	
	for(var i=0, e;e=v[i];i++)
		f.call(ref?ref:e, i, args);
};

js.ajax = function(url){
	var _ = this;
	
	_.url = url;
	
	_.con = (new XMLHttpRequest())||(new ActiveXObject('Microsoft.XMLHTTP'));
	
	_.setHeader = function(o){
		var _ = this;
		
		for(var n in o)
			_.con.setRequestHeader(n, o[n]);
		
		return _;
	}
	
	_.async = function(){
		this.isAsync = true;
		return this;
	}
	
	_.getStt = function(){
		return this.con.status;
	}
	
	_.response = function(){
		return (this.con.responseXML||this.con.responseText)?true:false;
	}
	
	_.post = function(args, fn, headers){
		transferData(this, args, fn, headers, true);
	}
	
	_.get = function(args, fn, headers){
		transferData(this, args, fn, headers, false);
	}
	
	_.getText = function(){
		return this.con.responseText;
	}
	
	_.getXML = function(){
		return getDOM(this.con.responseXML);
	}
	
	getDOM = function(doc){
		var r = {};
		
		if(!doc || !'getElementsByTagName' in doc)return r;
		
		var all = js(doc.getElementsByTagName('*')[0]).nodes();
		
		if(!all.length){
			if(doc.firstChild)r[doc.firstChild] = doc.firstChild.nodeValue;
			return r;
		}
		
		var hierarchy = function(el, ref){
			var tags = js(el).nodes(), txt = js(el).nodes(3), rtxt = [], r = ref;
			
			for(var n in txt){
				var actT = txt[n].nodeValue.rp(/[\r\n\t]/g, '');
				if(actT)rtxt[rtxt.length] = actT;
			}
			var elL = 0;
			
			if(r[el.nodeName]){
				if(!r[el.nodeName].splice)r[el.nodeName] = [r[el.nodeName]];
				elL = r[el.nodeName].length;
			
				r[el.nodeName][elL] = {value:function(){return rtxt.length>1?rtxt:rtxt[0];}};
			}else r[el.nodeName] = {value:function(){return rtxt.length>1?rtxt:rtxt[0];}};
			
			if(tags.length){
				js.each(tags, function(i){
					var eli = this;
					
					if(elL>0)r[el.nodeName][elL] = hierarchy(eli, r[el.nodeName][elL]);
					else r[el.nodeName] = hierarchy(eli, r[el.nodeName]);
				});
			}
			
			return r;
		}
		
		js.each(all, function(i){
			r = hierarchy(this, r);
		});
		
		return r;
	}
	
	transferData = function(_, args, fn, headers, isPost){
				
		var c = _.con;
		
		_.call = fn;
		
		var str = '';
		
		if(args&&typeof args=='object')str = encode(args);
		else if(typeof args=='function')_.call = args;
		
		str = (!isPost&&str?'?'+str:str);

		c.open(isPost?'POST':'GET', _.url+(isPost?'':str), _.isAsync?false:true);
		
		_.setHeader({	'Content-type': 'application/x-www-form-urlencoded', 
						'X-Requested-With': 'XMLHttpRequest'
					});
		
		_.setHeader(headers);
		
		c.onreadystatechange = function(){
			if(_.con.readyState==4){
				if(_.con.status==200 && _.call)_.call();
				else if(_.getStt()==404)alert();
			}
		}
		
		c.send((isPost?str:null));
	}
	
	encode = function(o){
		str = '';

		for(var n in o){
			str+=n+'='+o[n]+'&';
		}
		
		if(str)str = str.sbs(0, -1);
		
		return str;
	}
	
	return _;
};

js.conv={
	toHex:function(rgb){
		var c=[parseInt(rgb[0]),parseInt(rgb[1]),parseInt(rgb[2])];
		var ret='';
		var aux=[0,0];
		var h='0123456789abcdef';
		for(var i=0;i<c.length;i++){
			do{	aux[0]=c[i]%16;
				aux[1]=(c[i]/16).floor();
				c[i]=(c[i]/16).floor();
			}while((c[i]/16)>=16)
			ret+=(h.charAt(aux[1])+h.charAt(aux[0]));
		}
		return ret;
	},
	fromHex:function(h){
		if(h.charAt(0)=='#')h=h.substr(1);
		var hex='0123456789abcdef';
		var ret=[0,0,0];
		for(var ct=i=r=0,g=[];i<h.length;i+=2){
			for(var j=0;j<hex.length;j++){
				if(h.charAt(i)==hex.charAt(j))g[0]=j;
				if(h.charAt(i+1)==hex.charAt(j))g[1]=j;
			}
			r=(g[0]*((16).pow(1)))+(g[1]*((16).pow(0)));
			ret[ct++]=r;
		}
		return ret;
	}
};

js.navigator = {
	userAgent : function(){
		if(document.all)return 'ie';
		
		var u=(navigator.userAgent).low();
		var nvs=['firefox', 'chrome', 'opera', 'safari'], cif=['ff', 'ch', 'op', 'sf'];
		for(var i=0;nvsn=nvs[i];i++)
			if(u.io(nvsn)!=-1)return cif[i];
	},
	
	version : function(){
		var a = navigator.appVersion;

		if(document.all)return (a.sbs(a.ioAt(';',1)+7,a.ioAt(';',2))).num();
		
		var nv = js.navigator.userAgent();
		
		switch(nv){
			case 'ch': return a.match(/ Chrome\/(\d+\.\d+).+ /)[1].num();
			default: return (a.sbs(0,a.io('(')-1)).num();
		}
	},
	
	lang : function(){
		return (navigator.userLanguage?navigator.userLanguage:navigator.language).sbs(0,2);
	},
	
	scrollTop : function(){
		return window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop;
	},
	
	width : function(){
		return document.documentElement.clientWidth;
	},
	
	height : function(){
		return document.documentElement.clientHeight;
	}
};

js.date=function(f, a, m, d){
	if(!f&&!a)return false;
	if(!(f=='f'||f=='l'||f=='s'||f=='t'||f=='p'||f=='bsx')&&(f.replace(/^[YyMmDdAaHhsuiqw<>?!\(\)\{\}\[\]\/,\.:;%\s]+$/g,'')!=''))return false;
	if(f!='l'&&f!='s'){
		if(f=='t')f='h:m';
		f = f.replace(/([yYMDdhHisuAapmqw])+/g, '$1');
	}
	var d = (a&&m&&d)?new Date(a,m-1,d):new Date();
	var c = [d.getDay(),d.getDate(),d.getMonth(),d.getFullYear(),d.getHours(),d.getMinutes(),d.getSeconds(),d.getMilliseconds()];
	var dias = ['Domingo','Segunda-Feira','Terça-Feira','Quarta-Feira','Quinta-Feira','Sexta-Feira','Sábado'];
	var meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
	
	if(f=='w')return c[0];
	
	var bsx=c[3]%100==0&&c[3]%400!=0?false:c[3]%4==0&&c[3]%100!=0?true:c[3]%400==0?true:false;
	if(f=='bsx')return bsx;
	
	var tot_dias=(c[2]==1?(bsx?29:28):(c[2]<=6?(c[2]%2!=0?30:31):(c[2]%2==0?30:31)));
    if(f=='q')return tot_dias;
	
	var p='';
	if(c[4]<12)p='m';
	else if(c[4]>=12&&c[4]<18)p='t';
	else p='n';
	var r=[(dias[c[0]]+', '+c[1]+' de '+meses[c[2]]+' de '+c[3]),(c[1]+' de '+meses[c[2]]+' de '+c[3])];
	if(f=='f')return r[0];
	else if(f=='l')return r[1];
	else if(f=='s')return c[1]+'/'+(c[2]+1<10?'0'+(c[2]+1):(c[2]+1))+'/'+c[3];
	c[2]++;
	c[3]+='';
	var cmp='';
	if(f.count('A')>0)cmp=c[4]>12?'PM':'AM';
	else if(f.count('a')>0&&cmp=='')cmp=c[4]>12?'pm':'am';
	f=f.replace(/(d)/g,c[1]<10?'0'+c[1]:c[1]);
	f=f.replace(/(M)/g,c[2]<10?'0'+c[2]:c[2]);
	f=f.replace(/(y)/g,c[3]);
	f=f.replace(/(Y)/g,c[3].substr(2));
	f=f.replace(/(h)/g,c[4]<10?'0'+c[4]:c[4]);
	f=f.replace(/[HAa]/g,c[4]<12?c[4]:c[4]-12);
	f=f.replace(/(i)/g,c[5]<10?'0'+c[5]:c[5]);
	f=f.replace(/(s)/g,c[6]<10?'0'+c[6]:c[6]);
	f=f.replace(/(u)/g,c[7]);
	f=f.replace(/(p)/g,p);
	f=f.replace(/(D)/g,dias[c[0]]);
	f=f.replace(/(m)/g,meses[(c[2]-1)]);
	
	if(cmp!='')f+=(' '+cmp);
	return f;
};

js.motion = function(o, prop, time, then){
	var _ = this;
	_.o = js(o);
	_.then = then?(typeof then=='function'?then:function(){}):null;
	_.prop = [];
	_.queue = 0;
	
	_.c = time==null?'normal':time;
	
	if(typeof _.c=='string'){
		switch(_.c){
			case 'fast':			_.time = {n: 2,v: 2, t: 33, e: .1};	break;
			default: case 'normal':	_.time = {n: 1,v: 4, t: 33, e: .1};	break;
			case 'slow': 			_.time = {n: 0,v: 10, t: 40, e: .1};
		}
	}else _.time = time;
	
	for(var n in prop){
		if(_.o.css(n)==undefined)continue;
		
		var f = 0;
		
		var nm = n;
		if(n.match(/^[A-Z]$/))nm = n.low();
		var sig = null, sigon = false;
		if(sig = (prop[n]+'').match(/(.)= ?(\d+)(p[xt]|\%)?/)){
			prop[n] = sig[2]+(sig[3]?sig[3]:'');
			sigon = true;
		}
		
		switch(nm){
			case 'width': 	f = _.o.ow();			break;
			case 'height': 	f = _.o.oh();			break;
			case 'top': 	f = _.o.ot();			break;
			case 'left': 	f = _.o.ol();			break;
			default: 		f = _.o.css(nm).num();
		}
		
		if(_.o.css('position')!='absolute'&&(nm=='left'||nm=='top'))_.o.css({top: _.o.ot()+'px', left: _.o.ol()+'px', position: 'absolute'});
		
		var t = (prop[n]+'').num();
		var u = '';
		if(typeof prop[n]!='number')u = (prop[n]+'').rp(/[\d\-]/g, '').low();
		u = nm=='opacity'||/color/i.test(nm)?'':(u?u:'px');
		
		if(/color/i.test(nm)){
			var aux = [_.o.css(nm), prop[n]];
			
			for(var i=0;i<2;i++){
				var mtc = aux[i].match(/^rgb\((\d+), ?(\d+), ?(\d+)\)$/);
				if(mtc)aux[i] = js.conv.toHex([mtc[1], mtc[2], mtc[3]]);

				if(!/^[0-9a-f]{6}$/.test(aux[i])){
					if(aux[i].charAt(0)=='#')aux[i] = aux[i].sbs(1).low();
			
					mtc = aux[i].match(/^([0-9a-f])([0-9a-f])([0-9a-f])$/);
					if(mtc)aux[i] = mtc[1]+mtc[1]+mtc[2]+mtc[2]+mtc[3]+mtc[3];
					else if(aux[i].length>6)aux[i] = t.sbs(0, 6);
					if(!/^[0-9a-f]{6}$/.test(aux[i]))aux[i] = 'ffffff';
				}
			};
			f = aux[0];
			t = aux[1];
		}else if(nm=='backgroundPosition'){
			var mtc = _.o.css(nm).match(/(-?\d+)(\%|px) (-?\d+)(\%|px)/);			
			f = [mtc[1].num(), mtc[3].num()];
			u = mtc[4];
			
			if(mtc = prop[n].match(/(-?\d+)(\%|px) (-?\d+)(\%|px)/)){
				t = [mtc[1].num(), mtc[3].num()];
				u = mtc[4];
			}else t = f;
		};
		
		if(sigon&&sig){
			if(sig[1]=='-'||sig[1]=='+'){
				var p = u!='%'?t:((t*f)/100);
				t = (f + (sig[1]=='+'?p:-p));
				t = (f + (sig[1]=='+'?p:-p));
			}
		};
		
		_.prop[_.prop.length] = {n: nm, from: f, to: t, un: u, v: 0};
		_.queue++;
	};
	
	_.t = null;
	
	_.apply = function(){
		var _ = this;
		
		for(var n in _.prop){
			var v = _.prop[n];
			
			hash = /color/i.test(v.n)?'#':'';
			
			if(v.n=='opacity'){
				_.o.o.style[v.n] = v.from;
				_.o.o.style['-moz-opacity'] = v.from;
				_.o.o.style['-webkit-opacity'] = v.from;
				_.o.o.style['-o-opacity'] = v.from;
				if(document.all)_.o.o.style['filter'] = 'alpha(opacity='+(v.from*100)+')';
			}else if(v.n=='backgroundPosition'){
				_.o.o.style[v.n] = (v.from[0]+v.un+' '+v.from[1]+v.un);
			}else _.o.o.style[v.n] = hash+v.from+v.un;
			
			var pass = (v.n=='backgroundPosition')?(v.from[0]==v.to[0]&&v.from[1]==v.to[1]):(v.from==v.to);
			
			if(pass){
				if(_.prop[n].v==0){
					_.prop[n].v = 1;
					_.queue--;
				};
				if(_.queue<=0){
					_.stop();
					if(_.then)setTimeout(function(){_.then(_.o);}, 1);
					return true;
				}
			};
		};
		_.t = setTimeout(function(){_.stop().go();}, _.time.t);
	};
	
	_.stop = function(){
		var _ = this;
		if(_.t){
			clearTimeout(_.t);
			_.t = null;
		};
		return _;
	};
	
	_.go = function(){	
		var _ = this;
		if(_.t)return _;
		
		for(var n in _.prop){
			var v = _.prop[n];
			if(!v.v){
				var aux = [];
				
				if(v.n=='opacity'){
					switch(_.time.n){
						case 2: aux = [4.4, 0.1];	break;
						case 1: aux = [8.5, 0.001];	break;
						case 0: aux = [20, 0.001];
					}
				}else aux = [_.time.v, _.time.e];
				
				if(/color/i.test(v.n)){		
					var col = js.conv.fromHex(v.from);
					var esp = js.conv.fromHex(v.to);

					for(var i=0;i<3;i++){
						if(((col[i]-esp[i])/(aux[0]*3)).abs()<=1.17)col[i] = esp[i];
						col[i] += ((esp[i]-col[i])/(aux[0]*3));
					};
					_.prop[n].from = js.conv.toHex(col);
				}else if(v.n=='backgroundPosition'){					
					for(var i=0;i<2;i++){
						if(((v.from[i]-v.to[i])/aux[0]).abs()<=aux[1])v.from[i] = v.to[i];
						else _.prop[n].from[i] += ((v.to[i]-v.from[i])/aux[0]);
					};
				}else{
					if(((v.from-v.to)/aux[0]).abs()<=aux[1])v.from = v.to;
					else _.prop[n].from += ((v.to-v.from)/aux[0]);
				};
			}else continue;
		};
		_.apply();
	};
	
	return _;
};

js.fixImg=function(){
	var s;
	var a = ['id','alt','onmouseover','onmouseout','onmouseup','onmousemove','onmousedown','onclick','ondblclick','onkeypress','onkeyup','onkeydown','title','class','onload'];
	for(var i=0,img;img=document.images[i]; i++){
		s=document.createElement('span');
		for(var j=0,v; v=a[j]; j++){
			s[v]=img[v];
		}
		s.style.cssText=img.style.cssText;
		s.style.width=img.width;
		s.style.height=img.height;
		s.style.display='inline-block';
		s.style.filter='progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+img.src+'", sizingMethod="scale")';
		img.parentNode.replaceChild(s,img);
	}
};

js.move=function(opt){
	if(!opt)opt={dc:1,lock:0,v:1,h:1,n:1,s:1,e:1,w:1};
	if(opt.dc==null)opt.dc=1;
	if(opt.lock==null)opt.lock=0;
	
	if(!opt.v&&!opt.h&&!opt.n&&!opt.s&&!opt.w&&!opt.e){
		opt.s=opt.n=opt.v=1;
		opt.e=opt.w=opt.h=1;
	}else{
		opt.h=opt.h?opt.h:0;
		opt.v=opt.v?opt.v:0;
		
		if(!opt.v){
			opt.s=opt.s?opt.s:0;
			opt.n=opt.n?opt.n:0;
		}else opt.n=opt.s=opt.v;
		
		if(!opt.v){
			opt.e=opt.e?opt.e:0;
			opt.w=opt.w?opt.w:0;
		}else opt.e=opt.w=opt.h;
	}
	
	var _=this;
	_.opt=opt;
	_.obp={x:0,y:0,ol:0,ot:0};
	_.ea=null;
	_.mm=_.od=_.ou=function(){};
	
	document.onmouseup=function(){
		_.ou();
		_.ea=null;
		document.onmousemove=function(){};
	};
	
	var nl=function(event){
		event=event||window.event;
		_.od(event);
		if(_.ea){
			_.el.d(event);
			if(_.ea.style.position!='absolute')_.ea.style.position='absolute';
			document.onmousemove=function(event){_.el.m(event);_.mm();};
		}
	};
	
	document.onmousedown=nl;
	if(_.opt.dc)document.ondblclick=nl;
	
	this.el={
		d:function(event){
			if(event.which==1||event.button==1){
				event=event||window.event;
				_.obp.x=event.clientX;
				_.obp.y=event.clientY;
				_.obp.ol=_.ea.offsetLeft;
				_.obp.ot=_.ea.offsetTop;
			}
		},
		m:function(event){
			event=event||window.event;
			if(event.which==1||event.button==1){
				var prt=js(_.ea).prt();
				
				var p=[event.clientX,event.clientY];
				var z=[_.obp.ol-_.obp.x,_.obp.ot-_.obp.y];
				var r=[_.obp.ol+(p[0]-_.obp.x),_.obp.ot+(p[1]-_.obp.y)];
				var c=[prt.ow()-_.ea.offsetWidth,prt.oh()-_.ea.offsetHeight];

				if(_.opt.lock){
					if((_.opt.n&&z[1]<r[1])||(_.opt.s&&z[1]>r[1])){
						if(r[1]>c[1])_.ea.style.top=c[1]+'px';
						else if(r[1]>0)_.ea.style.top=r[1]+'px';
						else _.ea.style.top='0px';
					}
					
					if((_.opt.e&&z[0]<r[0])||(_.opt.w&&z[0]>r[0])){
						if(r[0]>c[0])_.ea.style.left=c[0]+'px';
						else if(r[0]>0)_.ea.style.left=r[0]+'px';
						else _.ea.style.left='0px';
					}
					
				}else{
					if((_.opt.n&&z[1]<r[1])||(_.opt.s&&z[1]>r[1]))_.ea.style.top=r[1]+'px';
					if((_.opt.e&&z[0]<r[0])||(_.opt.w&&z[0]>r[0]))_.ea.style.left=r[0]+'px';
				}
				
			}
		}
	};
	return this;
};