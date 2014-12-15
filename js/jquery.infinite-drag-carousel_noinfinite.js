/**
 * @author Stéphane Roucheray, Pol Cámara
 * @extends jquery
 */

jQuery.fn.carousel = function(containerH, drag, options){
	var sliderList = jQuery(this).children()[0];
	
	if (sliderList) {

		var top = 0;
		var sum = 0;		
		var increment = jQuery(sliderList).children().outerHeight(true);
		var elmnts = jQuery(sliderList).children();
		var numElmts = elmnts.length;
		var sizeFirstElmnt = increment;
		var shownInViewport = Math.round(jQuery(this).height() / sizeFirstElmnt);
		var firstElementOnViewPort = 1;
		var probableElementOnViewPort = 0;
		var isAnimating = false;
		var totalHeight = increment * numElmts;
		var mouseY;
		var startMouseY;
		var endMouseY;
		if (isNaN(parseInt(jQuery(sliderList).css("top")))) {//.replace("px","")
			jQuery(sliderList).css("top","0");
		}
		var startYUP;
		var startYDOWN;		
		$(document).mousemove(function(e){
			mouseY = e.pageY;
	    }); 
		jQuery(sliderList).css("top",0);
		if (!(typeof drag == "boolean" &&  drag == false)) {
			jQuery(this)
			.drag("start",function(){
				top = parseInt(jQuery(sliderList).css("top"));//.replace("px","")
				//added by EE. This variable is created on first page of index and set here to true
				isDragging = true;
				startMouseY = mouseY;
			})
			.drag("dragend", function() {
				top = parseInt(jQuery(sliderList).css("top"));//.replace("px","")
				probableElementOnViewPort = Math.abs(top/increment);
				firstElementOnViewPort = parseInt(probableElementOnViewPort);
				probableElementOnViewPort -= firstElementOnViewPort;
				if (probableElementOnViewPort > .5) {
					firstElementOnViewPort++;
				}
				//added by EE. This variable is created on first page of index and set here to false after 30 miliseconds				
				setTimeout(function(){isDragging = false},30);
				endMouseY = mouseY;
				//console.log(startMouseY);
				//console.log(endMouseY);
				if(Math.abs(endMouseY-startMouseY)<60){//this is not a drag but a click
					isDragging = false
				}
				
				var sliderH = (((numElmts+shownInViewport)*increment + increment)/containerH)*100;
				var sliderT = ((firstElementOnViewPort*increment)/containerH)*100;
				
				//Calculate the first viewable element when the slider is at top
				var amountShownAtOneTime = Math.floor(containerH/increment);
				var firstElementWhenSliderIsAtTop = numElmts - amountShownAtOneTime;
				
				var theCapIncrement = (sliderH - (((firstElementWhenSliderIsAtTop*increment)/containerH)*100)) / 2;

				//alert(sliderT);
				var bottomCap = (theCapIncrement*2)-sliderH;
								
				if(parseInt(jQuery(sliderList).css('top')) > 0){
					jQuery(sliderList).animate({top: "0"});
				}else if(-(sliderT) < bottomCap ){					
					//((sliderH-sliderT)/2)=93.75; cap
					jQuery(sliderList).animate({top: bottomCap+'%'});
					
				}else{	
					jQuery(sliderList).animate({top: "-"+((firstElementOnViewPort*increment)/containerH)*100+'%'});
				}
				startYUP = undefined;
				startYDOWN = undefined;
				
			})
			.drag(function( ev, dd ){
				if (!isAnimating) {
					//console.log(dd.deltaY);
					if (sum >= 0) {
						//top -= totalHeight
					} else if (sum <= -totalHeight) {
						//top += totalHeight;
					}
					var sliderH = (((numElmts+shownInViewport)*increment + increment)/containerH)*100;
					var sliderT = ((firstElementOnViewPort*increment)/containerH)*100;
					
					var amountShownAtOneTime = Math.floor(containerH/increment);
					var firstElementWhenSliderIsAtTop = numElmts - amountShownAtOneTime;				
					var theCapIncrement = (sliderH - (((firstElementWhenSliderIsAtTop*increment)/containerH)*100)) / 2;
				
					var bottomCap = (theCapIncrement*2)-sliderH;
					var decreaseRate = 0;
					var distancePast = 0;
					if(parseInt(jQuery(sliderList).css('top')) > 0){
						if(startYUP == undefined) {
							startYUP = dd.deltaY;
						}
						var change = - ( startYUP - dd.deltaY ) / dd.deltaY ;
						decreaseRate = - ( startYUP - dd.deltaY ) * ( change * .75 );
						
						sum = top + ( dd.deltaY - decreaseRate );		
					} else if ( ( sum/containerH ) * 100 < bottomCap ){
						if( startYDOWN == undefined) {
							startYDOWN = dd.deltaY;
						}
						decreaseRate = ( startYDOWN - dd.deltaY ) * .75;
						sum = top + ( dd.deltaY + decreaseRate );							
					}else{
						sum = top + dd.deltaY;	
					}
					
					//console.log(sum);
					var toPercent = ( ( sum / containerH ) * 100 ) + '%';
					//console.log(toPercent);
					jQuery(sliderList).css({
						top: toPercent
					});
					
					/*
					if(parseInt(jQuery(sliderList).css('top')) > 0){
						if(startYUP == undefined) {
							startYUP = mouseY;
						}
						var change = -(startYUP - mouseY)/dd.deltaY;
						decreaseRate = -(startYUP - mouseY)*(change*.75);
						
						//console.log(Math.log(dd.deltaY)/2);
						//sum = top + (Math.log(dd.deltaY)/2);
						sum = top + (dd.deltaY-decreaseRate);		
					}else if((sum/containerH)*100 < bottomCap ){
						if(startYDOWN == undefined) {
							startYDOWN = mouseY;
						}
						decreaseRate = (startYDOWN - mouseY)*.75;
						sum = top + (dd.deltaY+decreaseRate);							
					}else{
						sum = top + dd.deltaY;	
					}
					
					//console.log(sum);
					var toPercent = ((sum/containerH)*100)+'%';
					//console.log(toPercent);
					jQuery(sliderList).css({
						top: toPercent
					});
					//console.log(jQuery(sliderList).css('top'));
					*/
				}
			});
		}
		
		for (i = 0; i < shownInViewport; i++) {
			jQuery(sliderList).css('height',(((numElmts+shownInViewport)*increment + increment)/containerH)*100 + "%");
			//jQuery(sliderList).append(jQuery(elmnts[i]).clone());
		}
	}
};
