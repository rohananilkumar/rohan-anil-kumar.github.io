var arrCards=[]                 //container,row,col,img(holder)
var mapCardIcon=[]              //card{container,row,col,img}, icon: source of image, isOpened, isTempDisabled, isDisabled, pos, toggleCard(), enableCard(), disableCard()
var openedCards=[]              //pos,cardMap
var finishedCards=0;
var cardCloseDelay=1000;

function getRandom(lim){
    //generate random number b/w 0 and lim(not included)
    return Math.floor(Math.random()*(lim));
}

function GetRandomCard(cards){
    //Chooses a random card from cards
    var lim=cards.length;
    var random=getRandom(lim);
    return [cards[random],random];
}

function openAllCards(){
    mapCardIcon.forEach((element)=>{
        element.openCard();
    })
}

function checkTwoCardsOpened(){
    //Check if two cards are opened at the same time
    if(openedCards.length==2){
        toggleCards(false);
        setTimeout(()=>{toggleCards(true)},cardCloseDelay);
        console.log('check');
    }
   
}

function createMapCardIcon(_card,icon){
    //Generate cardMap object
    return {
        card:_card,
        icon:icon,
        isOpened:false,
        isDisabled:false,
        isTempDisabled:false,
        pos:String(_card.row)+String(_card.col),
        getIndex: function(array){
            //Gets the index if 'this' card from array
            var pos=String(this.card.row)+String(this.card.col);
            var ind=array.findIndex((obj)=>{
                return obj.pos===pos;
            })
            return ind;
        },

        toggleCard: function(){
            //Closes card if opened. Opens card if closed
            if(this.isOpened){
                this.card.img.src='';
                this.isOpened=false;
                this.card.container.classList.add('card-closed');
                this.card.container.classList.remove('card-open');
                this.card.container.classList.add('card-hoverable');
                openedCards.splice(this.getIndex(openedCards),1);
            }
            else{
                this.card.img.src=this.icon;
                this.isOpened=true;
                this.card.container.classList.remove('card-closed');
                this.card.container.classList.add('card-open');
                this.card.container.classList.remove('card-hoverable');
                openedCards.push({
                    cardMap: this,
                    pos:String(this.card.row)+String(this.card.col)
                })
                

            } 
        },

        enableCard: function(){
            //enables card : hoverable + closed
            if(!this.isDisabled){
                //console.log('enabling'+this.pos);
                this.card.container.classList.remove('card-open');
                this.card.container.classList.add('card-closed');
                this.card.container.classList.add('card-hoverable');
                this.card.container.classList.remove('card-disabled');
                this.isTempDisabled=false;
            }
            
            
        },
        disbleCard: function(permamentRemove){
            //disables card

            this.card.container.classList.remove('card-open');           
            this.card.container.classList.remove('card-hoverable');
            
            if(permamentRemove){
                //Removes: open, hoverable, closed; Adds: disabled
                console.log("Permanent Remove");
                this.isDisabled=true;
                this.card.container.classList.remove('card-closed');
                this.card.container.classList.add('card-disabled');
                //console.log('setting disabled true',this.pos);
                this.isOpened=false;
            }
            else{
                //Removes: open, hoverable; Adds: closed
                console.log("Temp remove"+String(this.card.row)+String(this.card.col));
                this.card.img.src='';
                this.isTempDisabled=true;
                this.card.container.classList.add('card-closed');
            }
            
            
        }

        
    }
}

function toggleCards(on){
    //Toggles cards on or off
    if(on){
        //Enables Card: markes card hoverable and closed
        mapCardIcon.forEach((cardMap)=>{
            //console.log('Enable '+cardMap.isDisabled , cardMap.isOpened,"==",(cardMap.isDisabled || cardMap.isOpened),String(cardMap.card.row)+String(cardMap.card.col));
            if(!(cardMap.isDisabled || cardMap.isOpened)){
                
                //console.log("Changing"+String(cardMap.card.row)+String(cardMap.card.col));
                cardMap.enableCard();
            }
            else if(cardMap.isOpened){
                cardMap.toggleCard();
            }
        })
    }
    else{
        //Disables card: makes card closed but not open and hoverable
        mapCardIcon.forEach((cardMap)=>{
            //console.log('Disable '+cardMap.isDisabled,String(cardMap.card.row)+String(cardMap.card.col));
            if(!(cardMap.isDisabled || cardMap.isOpened)){
                cardMap.disbleCard();
                
                
            }
        })
    }
}

function checkCorrectCard(){
    //Check if two cards opened are same
    if(openedCards.length===2 && openedCards[0].cardMap.icon===openedCards[1].cardMap.icon){
        openedCards[0].cardMap.disbleCard(true);
        openedCards[1].cardMap.disbleCard(true);
        openedCards=[];
        finishedCards++;
    }
    if(finishedCards===mapCardIcon.length/2){
        gameOver();
    }
}

var innerContainer;
function gameOver(){
    //End of the game
    clearInterval(interval);

    startBtn.style.display='none';
    resetBtn.style.display='block';
    stopBtn.style.display='none'; 

    clockImg.width=70;
    clockImg.height=70;
    clockImg.style.left=95;
    clockImg.style.top=11;

    innerContainer.style.display='none';
    timerContainer.classList.add('timer-at-middle');
    timerContainer.classList.remove('timer-at-top');

    gameOverPanel.style.display='block';


    //timerContainer.style.display='none';

}

function assignIcons(){
    mapCardIcon=[];
    var availableCards=arrCards;

    //Generate Available cards
    var availableIcons=[];
    for(var i=1;i<=21;i++){
        availableIcons.push('icons\\'+i+'.png')
    }

    //Create mapCardIcon by randomly assigning card to icon
    for(var i =0; i<=(availableIcons.length-1);i++){
        var random=GetRandomCard(availableCards);
        availableCards.splice(random[1],1);
        mapCardIcon.push(createMapCardIcon(random[0],availableIcons[i]))

        random=GetRandomCard(availableCards);
        availableCards.splice(random[1],1);
        mapCardIcon.push(createMapCardIcon(random[0],availableIcons[i]))     
    }

}

function loadArrCards(){
    arrCards=[]
    for(var r = 0; r <= 6; r++){
        for(var c = 0; c <= 5; c++){
            //Create card
            card={
                container: document.getElementById('card-' + String(r) + String(c)),
                img: document.getElementById('img-'+String(r) + String(c)),
                row: r,
                col: c,
                
            }

            //Initialize cards with no extra class
            card.container.classList.add('card-closed');
            card.container.classList.remove('card-disabled');
            card.container.classList.remove('card-open')
            card.container.classList.remove('card-hoverable');

            //Push card to arrCard array
            arrCards.push(card);
        }
    }
}


//CARD EVENT LISTENERS
function cardClicked(cardMap){
    //Event listener for click event of each card
    if(!cardMap.isDisabled && !cardMap.isTempDisabled && openedCards.findIndex((obj)=>{return obj.pos===cardMap.pos})){ //if card is not disabled, not temp disabled but is not opened
        cardMap.toggleCard();
        checkCorrectCard();
        //checkMoreThanTwo();
        checkTwoCardsOpened();
    }
}

function setupEventListeners(){
    //sets up event listeners of each card
    mapCardIcon.forEach((ele)=>{
        ele.card.container.addEventListener('click',()=>{cardClicked(ele)})
    })

}



//TIMER
var mins=0;
var secs=0;
var interval;
var timerPanel;
var timerContainer;
var clockImg;
var gameOverPanel;

function updateTimer(){
    if(secs==59){
        mins++;
        secs=0;
    }
    else{
        secs++;
    }
    var minsStr=(mins<10?"0":'')+String(mins);
    var secsStr=(secs<10?"0":'')+String(secs);
    timerPanel.textContent=minsStr+":"+secsStr;

}
function startTimer(){
    interval=setInterval(updateTimer,1000)
}

//BUTTONS CONFIG
var startBtn;
var stopBtn;
var ResetBtn;

function setupStartStop(){
    startBtn=document.getElementById('start-btn');
    stopBtn=document.getElementById('stop-btn');
    resetBtn=document.getElementById('reset-btn');

    timerPanel=document.getElementById('timer-panel');
    timerContainer=document.getElementById('timer-container');
    timerPanel.textContent='00:00';
    timerContainer.style.display='block';
    timerContainer.classList.add('timer-at-top');
    timerContainer.classList.remove('timer-at-middle');

    clockImg=document.getElementById('clock-png');
    clockImg.width=50;
    clockImg.height=50;
    clockImg.style.left=116;
    clockImg.style.top=2;

    gameOverPanel=document.getElementById('game-over-panel');
    gameOverPanel.style.display='none';

    innerContainer=document.getElementById('inner-container');
    innerContainer.style.display='block';

    startBtn.addEventListener('click',startClick);
    stopBtn.addEventListener('click',stopClick);
    resetBtn.addEventListener('click',resetClick);

    stopBtn.style.display='none';
    resetBtn.style.display='none';
    startBtn.style.display='block';
}

//BUTTON CLICK EVENT LISTENERS
function stopClick(){
    clearInterval(interval);
    toggleCards(false);
    startBtn.style.display='none';
    resetBtn.style.display='block';
    stopBtn.style.display='none'; 
}
function resetClick(){
    initializeGame();
}
function startClick(){
    resetBtn.style.display='none';
    startBtn.style.display='none';
    stopBtn.style.display='block'; 
    
    play();
}

//PLAY
function play(){
    startTimer();
    toggleCards(true);  
}

//GAME INITIALIZATION: sets up arrCards,mapCardIcon
function initializeGame(){
    finishedCards=0;
    mins=0;
    secs=0;
    setupStartStop();
    loadArrCards();
    assignIcons();
    setupEventListeners();
    toggleCards(false);
}


//START point of game
window.onload= initializeGame;