function Mine(tr,td,mineNum){
	this.tr=tr;	
	this.td=td;	
	this.mineNum=mineNum;	

	this.squares=[];	
	this.tds=[];			
	this.allRight=false;
	this.surplusMine=mineNum;

	this.parent=document.querySelector('.gameBox');
}

Mine.prototype.randomNum=function(){
	var square=new Array(this.tr*this.td);	
	for(var i=0;i<square.length;i++){
		square[i]=i;
	}
	square.sort(function(){return 0.5-Math.random()});

	return square.slice(0,this.mineNum);
}
Mine.prototype.init=function(){
	//console.log(this.randomNum());
	var rn=this.randomNum();	
	var n=0;	
	for(var i=0;i<this.tr;i++){
		this.squares[i]=[];
		for(var j=0;j<this.td;j++){
			//this.squares[i][j]=;
			//n++;

			
			if(rn.indexOf(++n)!=-1){
				this.squares[i][j]={type:'mine',x:j,y:i};
			}else{
				this.squares[i][j]={type:'number',x:j,y:i,value:0};
			}
		}
		

		/* {
			type:'mine',
			x:0
			y:0,
		}
		
		{
			type:'number',
			x:0,
			y:0,
			value:2
		} */
	}

	//console.log(this.squares);
	this.updateNum();
	this.createDom();

	this.parent.oncontextmenu=function(){
		return false;
	}


	this.mineNumDom=document.querySelector('.mineNum');
	this.mineNumDom.innerHTML=this.surplusMine;
};

//创建表格
Mine.prototype.createDom=function(){
	var This=this;
	var table=document.createElement('table');

	for(var i=0;i<this.tr;i++){	//行
		var domTr=document.createElement('tr');
		this.tds[i]=[];

		for(var j=0;j<this.td;j++){	//列
			var domTd=document.createElement('td');
			//domTd.innerHTML=0;

			domTd.pos=[i,j];	
			domTd.onmousedown=function(){
				This.play(event,this);	
			};

			this.tds[i][j]=domTd;	 

			/* if(this.squares[i][j].type=='mine'){
				domTd.className='mine'
			}
			if(this.squares[i][j].type=='number'){
				domTd.innerHTML=this.squares[i][j].value;
			} */
			domTr.appendChild(domTd);
		}

		table.appendChild(domTr);
	}

	this.parent.innerHTML='';	
	this.parent.appendChild(table);
};


Mine.prototype.getAround=function(square){
	var x=square.x;
	var y=square.y;
	var result=[];	

	/* 
		x-1,y-1		x,y-1	x+1,y-1
		x-1,y		x,y		x+1,y
		x-1,y+1		x,y+1	x+1,y+1

	 */

	 
	for(var i=x-1;i<=x+1;i++){
		for(var j=y-1;j<=y+1;j++){
			if(
				i<0 ||	
				j<0	||	
				i>this.td-1 ||	
				j>this.tr-1	||	
				(i==x && j==y) ||	
				this.squares[j][i].type=='mine'	
			){
				continue;
			}

			result.push([j,i]);	
		}
	}

	return result;
};


Mine.prototype.updateNum=function(){
	for(var i=0;i<this.tr;i++){
		for(var j=0;j<this.td;j++){
		
			if(this.squares[i][j].type=='number'){
				continue;
			}

			var num=this.getAround(this.squares[i][j]);

			for(var k=0;k<num.length;k++){
				/* num[i]	==	[0, 1]
				num[i][0]	== 0
				num[i][1]	== 1 */

				this.squares[num[k][0]][num[k][1]].value+=1;
			}
		}
	}

	//console.log(this.squares);
}

Mine.prototype.play=function(ev,obj){
	var This=this;
	if(ev.which==1 && obj.className!='flag'){	
		//点击的是左键
		//console.log(obj);

		var curSquare=this.squares[obj.pos[0]][obj.pos[1]];
		var cl=['zero','one','two','three','four','five','six','seven','eigth'];

		if(curSquare.type=='number'){
			//用户点到的是数字
			//console.log('你点到数字了！')
			obj.innerHTML=curSquare.value;
			obj.className=cl[curSquare.value];

			if(curSquare.value==0){
				/* 
					用户点到了数字0
						1、显示自己
						2、找四周
							1、显示四周（如果四周的值不为0，那就显示到这里，不需要再找了）
							2、如果值为0
								1、显示自己
								2、找四周（如果四周的值不为0，那就显示到这里，不需要再找了）
									1、显示自己
									2、找四周（如果四周的值不为0，那就显示到这里，不需要再找了）
				 */

				obj.innerHTML='';	

				function getAllZero(square){
					var around=This.getAround(square);	

					for(var i=0;i<around.length;i++){
						//around[i]=[0,0]
						var x=around[i][0];	
						var y=around[i][1];	

						This.tds[x][y].className=cl[This.squares[x][y].value];

						if(This.squares[x][y].value==0){
							if(!This.tds[x][y].check){
								
								This.tds[x][y].check=true;
								getAllZero(This.squares[x][y]);
							}
						}else{
							
							This.tds[x][y].innerHTML=This.squares[x][y].value;
						}
					}
				}
				getAllZero(curSquare);
			}
		}else{
		
			this.gameOver(obj);
		}
	}

	
	if(ev.which==3){
		
		if(obj.className && obj.className!='flag'){
			return;
		}
		obj.className=obj.className=='flag'?'':'flag';	

		if(this.squares[obj.pos[0]][obj.pos[1]].type=='mine'){
			this.allRight=true;	
		}else{
			this.allRight=false;
		}


		if(obj.className=='flag'){
			this.mineNumDom.innerHTML=--this.surplusMine;
		}else{
			this.mineNumDom.innerHTML=++this.surplusMine;
		}

		if(this.surplusMine==0){
			
			if(this.allRight){
				
				alert('通关啦！');
			}else{
				alert('游戏失败');
				this.gameOver();
			}
		}
	}
	
};

//游戏失败函数
Mine.prototype.gameOver=function(clickTd){
	/* 
		1、显示所有的雷
		2、取消所有格子的点击事件
		3、给点中的那个雷标上一个红
	 */

	for(var i=0;i<this.tr;i++){
		for(var j=0;j<this.td;j++){
			if(this.squares[i][j].type=='mine'){
				this.tds[i][j].className='mine';
			}

			this.tds[i][j].onmousedown=null;
		}
	}

	if(clickTd){
		clickTd.style.backgroundColor='#f00';
	}
}



var btns=document.querySelectorAll('.level button');
var mine=null;
var ln=0;	
var arr=[[9,9,10],[16,16,40],[28,28,99]];	

for(let i=0;i<btns.length-1;i++){
	btns[i].onclick=function(){
		btns[ln].className='';
		this.className='active';

		mine=new Mine(...arr[i]);
		mine.init();

		ln=i;
	}
}
btns[0].onclick();	//初始化一下
btns[3].onclick=function(){
	mine.init();
}


/* var mine=new Mine(28,28,99);
mine.init(); */

//console.log(mine.getAround(mine.squares[0][0]));'