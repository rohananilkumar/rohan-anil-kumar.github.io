const Snake = (function(){
    const blockDimension = 10;

    //food coordinates
    const food = {
        x: null,
        y: null
    }

    //Boundary coordinates
    const fieldBountaries = {
        x: [],
        y: []
    };

    const BodyBlock = function(x, y, id, blockAhead){
        //Class for all blocks of the body
        this.x= x;
        this.y= y;
        this.id= id;
        this.blockAhead = blockAhead;
    }

    function resetCanvas(){
        //resets the canvas
        ctx.clearRect(0,0, doms.field.width, doms.field.height);
    }

    function getFreeSpace(){
        //Gets the space where snake doesnt occupy its body
        //Done by trial error method for efficiency.

        let success = false
        let randX, randY;
        do{
            randX = Math.floor((Math.random()*fieldBountaries.x[1])/10)*10;
            randY = Math.floor((Math.random()*fieldBountaries.y[1])/10)*10;

            if(snakeBody.bodyBlocks.find(block=> block.x === randX && block.y === randY)){  //checks if snake body occupies the newly calculated position
                success = false;
            }
            else{
                success = true;
            }

        }while(!success)
        

        return {x: randX, y: randY};
    }

    function setFood(){
        //Calculates a random position for setting food
        const Coordinates = getFreeSpace();
        food.x = Coordinates.x;
        food.y = Coordinates.y;
        createBlock(Coordinates.x, Coordinates.y);
    }

    function createBlock(x,y){
        //adds block to cavnas
        ctx.fillRect(x,y, blockDimension, blockDimension);
    }

    function removeBlock(x,y){
        //removes block from canvas
        ctx.clearRect(x-1,y-1, blockDimension+1, blockDimension+1);
    }
    
    
    const snakeBody = {
        headHeading : 'x+',
        bodyBlocks: [],
        previousTail: null,
        getEnds(){
            //gets the head and tail
            if(this.bodyBlocks.length !== 0){
                const ids = this.bodyBlocks.map((block)=> block.id);
                const headId = Math.min(...ids);
                const tailId = Math.max(...ids);
                return{
                    head: this.bodyBlocks.find((block)=>block.id===headId),
                    tail: this.bodyBlocks.find((block)=>block.id===tailId),
                }
            }
            else{
                return null;
            }
        },

        getPreviousBlock(thisBlock){
            //Gets the Previous block
            return this.bodyBlocks.find((block)=> block.id === thisBlock.id-1);
        },
        incrementLength(x,y){
            //Increments the length of snake. id adds one more block to snake
            const previousHead = this.getEnds().head
            this.bodyBlocks.forEach(block => block.id ++);  //increments id of all blocks
            const newHead = new BodyBlock(x,y,previousHead.id - 1, null)    //creates new head for snake
            this.bodyBlocks.unshift(newHead);   //Adds new head to snake
            previousHead.blockAhead = Object.assign({}, newHead);   //setting new head as block ahead for previous head
        }
        
    }

    function setHeading(heading){
        //sets the head heading of snake
        snakeBody.headHeading = heading;
    }

    function getHeading(){
        //gets the head heading of snake
        return snakeBody.headHeading;
    }

    const doms = {
        field : document.querySelector('#field'),
    };

    const ctx = doms.field.getContext('2d');
    ctx.fillStyle = 'white';

    function move(){

        //Recalculaltes coordinates and blockAhead of snakeBody.bodyBlocks
        snakeBody.previousTail = Object.assign({},snakeBody.getEnds().tail);
        const head = snakeBody.getEnds().head;

        //Calculate where head should be in the next frame
        switch (snakeBody.headHeading){
            case ('x+'):
                head.x = head.x + blockDimension;  
                break;
            case('x-'):
                head.x = head.x - blockDimension; 
                break;
            case('y+'):
                head.y = head.y + blockDimension;
                break;
            case('y-'):
                head.y = head.y - blockDimension; 
                break;
        }

        //Calculates where the body blocks should be in the next frame
        snakeBody.bodyBlocks.forEach(block=>{
            if(block !== head){
                block.x = block.blockAhead.x;
                block.y = block.blockAhead.y;
            }
           
        })

        //Setting blockAhead
        snakeBody.bodyBlocks.forEach(block=>{
            if(block !== head){
                block.blockAhead = Object.assign({},snakeBody.getPreviousBlock(block));
            }

            
        })
    }

    function initializeSnake(length){

        //Reset everything related to snake
        fieldBountaries.x = [];
        fieldBountaries.y =[];
        snakeBody.bodyBlocks = [];

        fieldBountaries.x.push(0);
        fieldBountaries.x.push(doms.field.width);
        fieldBountaries.y.push(0);
        fieldBountaries.y.push(doms.field.height);

        snakeBody.headHeading = 'x+';

        //Setting a new snake
        for(let i = 0; i < length; i++){
            if(snakeBody.bodyBlocks.length === 0){
                //Setting snake head
                snakeBody.bodyBlocks.push(new BodyBlock(200, 200, i, null));
            }
            else{
                //Setting snake body
                previousBlock = snakeBody.getEnds().tail;
                snakeBody.bodyBlocks.push(new BodyBlock(previousBlock.x - blockDimension, previousBlock.y, i, Object.assign({},previousBlock)));
            }
        }
    }

    function drawSnake(){
        //Draws snake according to snakeBody.bodyBlocks

        //Removes tail from prevoius frame
        if(snakeBody.previousTail){
            const tail = snakeBody.previousTail;
            //console.log(tail);
            removeBlock(tail.x,tail.y);
        }
        
        //Draws snake body
        snakeBody.bodyBlocks.forEach((block)=>{
            createBlock(block.x, block.y);
        })

         
    }
    return{
        initializeSnake,
        drawSnake,
        snakeBody,
        move,
        ctx,
        doms,
        setHeading,
        getHeading,
        fieldBountaries,
        getFreeSpace,
        setFood,
        food,
        resetCanvas
    }


}());


const Controller = (function(snake){
    let interval;

    function checkHit(){
        //Checks if snake hit body/boundaries

        const head = snake.snakeBody.getEnds().head;

        //Checking hit boundaries
        let hit = snake.fieldBountaries.x[0]>head.x;
        hit = hit || snake.fieldBountaries.x[1]<head.x;
        hit = hit || snake.fieldBountaries.y[0]>head.y;
        hit = hit || snake.fieldBountaries.y[1]<head.y;

        // Checking hit body
        hit = hit || (snake.snakeBody.bodyBlocks.find((block)=> {   
            if(block.id !==0){
                return block.x === head.x && block.y === head.y
            }
        }))

        return hit;
    }

    function checkEatFood(){
        const head = snake.snakeBody.getEnds().head;
        if(snake.food.x === head.x && snake.food.y === head.y){ //if food coordinates === snake head coordinates
            return true;
        }
        else{
            return false;
        }
    }

    let secs = 100

    function setGame(){
        //get's the snake ready

        snake.resetCanvas();
        snake.initializeSnake(20);
        snake.setFood();
        snake.drawSnake();
        score.textContent = 0;
        secs = 100;
    }
    
    function init(){
        //Starting point of the whole game
        setGame();
        setEventListeners();
        btnContainer.removeChild(stopBtn);
        detailsContainer.removeChild(gameOver);        
    }

    function frameNext(){
        //Function that runs every frame

        snake.move();
        eventReady = true;  //Making sure that the game listens for keyboard events

        if(checkHit()){
            //Check if snake hit boundry/ body
            clearInterval(interval);
            detailsContainer.replaceChild(gameOver, keyContainer);
            btnContainer.replaceChild(startBtn,stopBtn);
            console.log('gameover');
        }
        else{
            if(checkEatFood()){
                //Check if snake got food
                snake.snakeBody.incrementLength(snake.food.x,snake.food.y);
                snake.setFood();

                //Increase speed of snake movement
                clearInterval(interval);
                secs-=5;
                interval = setInterval(frameNext,secs);

                //Increment score
                score.textContent = Number(score.textContent)+1;
            }
            snake.drawSnake();
        }
        
    }

    let eventReady = true;

    let arrowDown = document.getElementById('arrow-down');
    let arrowLeft = document.getElementById('arrow-left');
    let arrowRight = document.getElementById('arrow-right');
    let arrowUp = document.getElementById('arrow-up');

    function disableKey(...keys){
        //Disable keys in UI
        const allKeys = [arrowDown, arrowLeft, arrowRight, arrowUp]
        allKeys.forEach((keyIter)=>{
            if(keys.includes(keyIter)){
                keyIter.classList.add('key-disabled');
            }
            else{
                keyIter.classList.remove('key-disabled');
            }
        })
    };

    function startBtnClick(){
        //Start gameplay

        setGame();
        interval = setInterval(frameNext,secs);
        disableKey();
        btnContainer.replaceChild(stopBtn,startBtn);
        if(detailsContainer.contains(gameOver)){
            detailsContainer.replaceChild(keyContainer,gameOver);
        }
    }


    function setHeading(event){
        //Sets new head heading for snake if arrow keys are pressed and game is ready to listen to events

        if(!eventReady) return  //skip function if game is not ready to listen to event handlers 

        else if (['ArrowUp','ArrowDown','ArrowRight','ArrowLeft'].includes(event.key)) eventReady = false   //game not ready for listening to events

        //Handling keyboard arrow key events
        switch(event.key){
            case('ArrowUp'):
            snake.getHeading()!=='y+'? snake.setHeading('y-'):null;
            disableKey(arrowUp);
            break;

            case('ArrowDown'):
            snake.getHeading()!=='y-'?snake.setHeading('y+'): null;
            disableKey(arrowDown);
            break;

            case('ArrowRight'):
            snake.getHeading()!=='x-'?snake.setHeading('x+'):null;
            disableKey(arrowRight);
            break;
            
            case('ArrowLeft'):
            snake.getHeading()!=='x+'?snake.setHeading('x-'):null;
            disableKey(arrowLeft);
            break;
        }
    }
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const btnContainer = document.getElementById('btn-container');
    const gameOver = document.getElementById('game-over');
    const detailsContainer = document.getElementById('details-container');
    const keyContainer = document.getElementById('keys-container');
    const score = document.getElementById('score');

    function setEventListeners(){ 
        //Set up event listeners

        //Stop button event listener
        stopBtn.addEventListener('click',()=>{
            clearInterval(interval);
            setGame();
            btnContainer.replaceChild(startBtn,stopBtn);
        })

        //keydown event listener for arrow keys
        document.addEventListener('keydown', setHeading);

        //keydown event listener for start stop buttons
        document.addEventListener('keydown',(event)=>{
            if(event.key === 'Enter' && btnContainer.contains(startBtn)){
                startBtnClick();
            }
        })

        //Start button event listener
        startBtn.addEventListener('click',()=>{
            startBtnClick();
        });

        //keys container event listener
        keyContainer.addEventListener('click',(event)=>{
            switch(event.target.id){
                case('arrow-up'):
                setHeading({key:'ArrowUp'});
                break;
                case('arrow-left'):
                setHeading({key:'ArrowLeft'});
                break;
                case('arrow-right'):
                setHeading({key:'ArrowRight'});
                break;
                case('arrow-down'):
                setHeading({key:'ArrowDown'});
                break;
            };
        })

    }

    return{
        init
    }
})(Snake)

Controller.init();  //Initialization

