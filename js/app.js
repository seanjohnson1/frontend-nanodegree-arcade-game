//Watch Polyfill 
/*
 * object.watch polyfill
 *
 * 2012-04-03
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

// object.watch
Object.prototype.watch||Object.defineProperty(Object.prototype,"watch",{enumerable:!1,configurable:!0,writable:!1,value:function(e,t){var r=this[e],n=r,c=function(){return n},i=function(c){return r=n,n=t.call(this,e,r,c)};delete this[e]&&Object.defineProperty(this,e,{get:c,set:i,enumerable:!0,configurable:!0})}});


//Generic for all board objects
/*
 * All board objects require the following signature
 * Properties 
 *  xPosition : number that represents board col position 
 *  yPosition : number that represents board row position
 *  x : integer that represents the pixel x position of the object (bound to xPosition)
 *  y : integer that represents the pixel y position of the object (bound to yPosition)
 *  sprite : string that represents the url to the image for the object
 *  game : game object (complex object with methods specified below)
 * 
 * Constructor
 *   function(game)
 *   Parameters
 *      game (required) : game object
 * 
 * Methods
 *   render : no parameters
 *      This function renders the board object on the board.
 *      Dependencies
 *          ctx.drawImage : HTML canvas API standard
 *          Resources.get : Udacity helper function : return signature Image() object  
 **/ 

var BoardObj = function(game){
    var currentBoardObj = this;
    currentBoardObj.xPosition = null;
    currentBoardObj.yPosition = null;
    currentBoardObj.x = null;
    currentBoardObj.y = null;
    currentBoardObj.sprite = null;
    currentBoardObj.game = game;
}

BoardObj.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

BoardObj.prototype.update = function(){

}


// Enemies our player must avoid
/*
 * Inherits and implements BoardObj
 * 
 * Constructor
 *   function(game)
 *   game (required) : game object
 * 
 * Static Method
 *   xPositionWatchFn: function : return signature number (represents xPosition value after validation)
 * 
 **/

var Enemy = function(game) {
    
    // instance reference for ease of code reading
    var enemy = this;
    
    // Setup enemy 
    BoardObj.apply(enemy, arguments);
    
    // Register internal bound values
    enemy.watch('xPosition', Enemy.xPositionWatchFn);

    //Initial state
    enemy.xPosition = -1;
    enemy.yPosition = enemy.game.getEnemyStartingRow();
    enemy.y = enemy.game.convertRowsToScaledPosition(enemy.yPosition);
    enemy.speed = enemy.game.getEnemySpeed();
    enemy.sprite = 'images/enemy-bug.png';
};

// Ensure Enemy properly inherit from BoardObj class
Enemy.prototype = Object.create( BoardObj.prototype );  
Enemy.prototype.constructor = Enemy;


/* 
 * Implements update function
 * Would be better to refactor engine to reduce coupling but outside of scope of this project
 * Parameters
 *   dt : number : represents the delta from last frame redraw (used as a scaling factor)
 * Return : null : only a side effect function
 * 
 * Side effects
 *   Changes the xPosition of the current enemy object
 **/

Enemy.prototype.update = function(dt) {
    this.xPosition = this.xPosition + (dt * this.speed);
};

//Inherited from BoardObj
/*
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
*/

/*
 * Static function that is proxy to each instance by the watch on xPosition
 * Parameters
 *   prop : string : the name of the property 
 *   currentPosition : number : represents the current value of the xPosition
 *   futurePosition : number : represents the future value of the xPosition
 * Return: number presents the new xPosition of the enemy object
 * 
 * Side effects
 *  Change the current enemy's x value to the pixel represents of xPosition (if in bounds)
 *  Change the current enemy's speed and resets the enemies position to off the board on the left (if out of bounds)
 **/
Enemy.xPositionWatchFn = function(prop, currentPosition, futurePosition){
    if(this.game.isValidCol(Math.abs(futurePosition))){
        this.x = this.game.convertColsToScaledPosition(futurePosition);
        return futurePosition;
    } else {
        this.speed = this.game.getEnemySpeed();
        return -1;
    }
};



/*
 * Inherits and implements BoardObj
 * 
 * Constructor
 *   function(game)
 *   game (required) : game object
 * 
 * Static Method
 *   xPositionWatchFn: function : return signature number (represents xPosition value after validation)
 *   yPositionWatchFn: function : return signature number (represents yPosition value after validation)
 * 
 **/

var Player = function(game){
    // instance reference for ease of code reading
    var player = this;
    // Initial Properties
    
    BoardObj.apply(player, arguments);
    
    //Add watching function for binding and validating changes
    player.watch('xPosition', Player.xPositionWatchFn);
    player.watch('yPosition', Player.yPositionWatchFn);
    player.xPosition = player.game.getInitialPlayerPosition().x;
    player.yPosition = player.game.getInitialPlayerPosition().y;
    player.sprite = 'images/char-boy.png';
    
}

// Ensure Player properly inherit from BoardObj class
Player.prototype = Object.create( BoardObj.prototype );  
Player.prototype.constructor = Player;


/* 
 * Implements update function
 * Would be better to refactor engine to reduce coupling but outside of scope of this project
 * Parameters
 *   NONE -- No scale factor for movement (unlike enemies)
 * Return : null : only a side effect function
 * 
 * Side effects
 *   if game is either in winner or loser state
 *   Changes the xPosition and yPosition of player to the starting position (resets the player to initial state)
 **/

Player.prototype.update = function(){
    //Player always runs
    if(this.game.isLoser(this) || this.game.isWinner(this)){
        this.xPosition = this.game.getInitialPlayerPosition().x;
        this.yPosition = this.game.getInitialPlayerPosition().y;
    }
}

//Inherited from BoardObj
/*
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y)
}
*/

/*
 * Implements the require handleInput method
 * Might be better if was on the instance (could have multiple players for example)
 * Parameters
 *   direction : string enum [left, up, right, down]: represents the direction of the player action
 * Return : null only a side effect function
 * 
 * Side effects
 *   Increment or decrement the xPosition or yPosition of the player object
 **/ 
Player.prototype.handleInput = function(direction){
    if(direction === 'left') {
        this.xPosition--;
    }
    if(direction === 'up') {
        this.yPosition--;
    }
    if(direction === 'right') {
        this.xPosition++;
    }
    if(direction === 'down') {
        this.yPosition++;
    }
}

/*
 * Static function that is proxy to each instance by the watch on xPosition
 * Parameters
 *   prop : string : the name of the property 
 *   currentPosition : number : represents the current value of the xPosition
 *   futurePosition : number : represents the future value of the xPosition
 * Return: number presents the new xPosition of the player object
 * 
 * Side effects
 *  Change the current player's x value to the pixel represents of xPosition (if in bounds)
 **/
Player.xPositionWatchFn = function(prop, currentPosition, futurePosition){
    if(this.game.isValidCol(futurePosition)){
        this.x = this.game.convertColsToScaledPosition(futurePosition);
        return futurePosition;
    } else {
        return currentPosition;
    }
};


/*
 * Static function that is proxy to each instance by the watch on yPosition
 * Parameters
 *   prop : string : the name of the property 
 *   currentPosition : number : represents the current value of the yPosition
 *   futurePosition : number : represents the future value of the yPosition
 * Return: number presents the new yPosition of the player object
 * 
 * Side effects
 *  Change the current player's y value to the pixel represents of yPosition (if in bounds)
 **/
Player.yPositionWatchFn = function(prop, currentPosition, futurePosition){
    if(this.game.isValidRow(futurePosition)){
        this.y = this.game.convertRowsToScaledPosition(futurePosition);
        return futurePosition;
    } else {
        return currentPosition;
    }
};

/*
 * This singleton object represents the game and its state. 
 * This would be better if refactor into a observer pattern, but this would require modifying the other library code
 * 
 * Constructor
 *  PlayerClass : Player function object that implements all the required boardObj interface
 *  EnemyClass : Enemy function object that implements all the required boardObj interface
 *  doc : document object
 * 
 * Public Methods are documented below above their definition
 *  getEnemies
 *  getPlayer
 *  getInitialPlayerPosition
 *  convertColsToScaledPosition
 *  convertRowsToScaledPosition
 *  isValidCol
 *  isValidRow
 *  getEnemyStartingRow
 *  getEnemySpeed
 *  isWinner
 *  isLoser
 **/ 

//This is singleton and should never have more than one instance. 
var game = (function(PlayerClass, EnemyClass, doc){
    
    //Private Variables
    
    // the game itself
    var instance = null;

    // containers for the player and enemies
    var player = null;
    var enemies = [];
    
    // game configuration
    var numberOfEnemies = 4;
    var cols = 5;
    var rows = 6;
    var validEnemyRows = [1,2,3];
    var xScale = 101;
    var yScale = 83;
    
    // Share state elements
    var gameState = {
        score : null,
        time : null,
        hasRan : false,
        terminated : false,
        scoreBoard : null
    };
    
    // Initial values
    var initialPlayerLocation = {
        x: 2, 
        y: 5
    };
    var initialGameState = {
        score: 0,
        time: 60
    }

    //Private Methods

    /*
     * Setups on the scoreboard DOM elements and exposes the time and score elements
     * Could refactor into singleton pattern (should only ever be one)
     **/
    var ScoreBoard = function() {
        
        // Create DOM elements
        var container = doc.createElement('div');
        var scoreBoard = doc.createElement('h1');
        var scoreBoardText = doc.createTextNode("Score: ");
        var score = doc.createElement('span');
        var timer = doc.createElement('h2');
        var timerText = doc.createTextNode("Time remain: ");
        var time = doc.createElement('span');

        //Configure and append DOM elements
        scoreBoard.appendChild(scoreBoardText);
        scoreBoard.appendChild(score);
        timer.appendChild(timerText);
        timer.appendChild(time);
        container.appendChild(scoreBoard);
        container.appendChild(timer);
        doc.body.appendChild(container); 
        
        //Expose display fields for data binding later
        this.time = time;
        this.score = score;
     }

     // Setup the game
     var setupGame  = function setupGame() {
        
        //Check if game has been terminated
        if(gameState.terminated === true){
            //Stop setup
            return null;
        }
        
        //Check if game has ran
        if(!gameState.hasRan){
            //Check if player wants to play
            if(!confirm("Would you like to play frogger?")) {
                //Stop setup if user does not want to play
                gameState.terminated = true;
                return doc.body.innerHTML = "Game Over";
            }
            //Setup scoreboard and hasRan state
            gameState.hasRan = true;
            gameState.scoreBoard = new ScoreBoard();
        } else {
            //Check if player wants to play again and report score for last round
            if(!confirm("Your score was " + gameState.score + ". Would you like to play again")) 
            {
                gameState.terminated = true;
                return doc.body.innerHTML= "Game Over";
            }
            
        }
        
        //Initial score and time
        gameState.score = initialGameState.score;
        gameState.time = initialGameState.time;

        //Setup data binding to DOM display of score
        gameState.watch("score", function(prop, currentScore, futureScore){
            if(futureScore > 0){
                gameState.scoreBoard.score.textContent = futureScore;
                return futureScore;
            } else {
                gameState.scoreBoard.score.textContent = 0;
                return 0;
            }
        });

        //Setup data binding to DOM display of time
        gameState.watch("time", function(prop, currentTime, futureTime){
            if(futureTime <= 0) setupGame();
            gameState.scoreBoard.time.textContent =  futureTime;
            return futureTime;     
        });

        //Setup timer 
        setInterval(function(){
            gameState.time--;
        },1000);
    }
    // Public Methods

    // Holder variable (make use of named functions to reduce the likelihood of mistyping a names when exposing on singleton instance)
    var methods = [];

    /* 
     * Public functions are all name function that are push into a methods array
     *      methods.push(function name(){ ... })
     * 
     *      Exposing on the singleton instance only requires a loop and name lookup 
     *          methods.forEach(function(fn){
     *              initializingInstance[fn.name] = fn; 
     *          });
     * 
     * Tradtiional method of named functions does allow for same name private and public function and introduce a likelihood and mistyping when returning the objec of the exposed methods
     * 
     *      function name1(){ ... }
     *      function name2(){ ... }
     *      function name3(){ ... }
     *      
     *      Exposing methods through new object literal 
     *      return {
     *          name1 : name1,
     *          name2 : name2,
     *          name3 : name3
     *      }
     **/ 

    // The next two methods are instance methods that return object(s) related to the game
    // getEnemies returns an array of enemies: return signature: [Enemy, ...]
    methods.push(function getEnemies(){
        // If there are no enemies, initialize the enemies set and bind enemy objects to this game instance.
        if(enemies.length === 0)
        {
            for(var i = 0 ; i < numberOfEnemies; i++ ){
                enemies.push(new EnemyClass(getInstance()));
            }
        }
        return enemies;
    });
    // getPlayer return the player object: return signature: Player
    methods.push(function getPlayer(){
        //If player has not be initialized, initialize the player and bind the player object to this game instance
        if(!player){
            player = new PlayerClass(getInstance());
        }
        return player;
    });


    // The next two methods are conversion helper methods
    // convertColsToScaledPosition take a column value and returns a scaled pixel value: return integer
    methods.push(function convertColsToScaledPosition(col) {
        return Math.floor(col * xScale);
    });
    // convertColsToScaledPosition take a row value and returns a scaled pixel value: return integer
    methods.push(function convertRowsToScaledPosition(row) {
        return Math.floor(row * yScale);
    });

    // The next two functions are state validation
    //  isValidCol check if col parameter is a valid column on this game board: return boolean
    methods.push(function isValidCol(col){
        return !!( (0 <= col) && (col <= (cols - 1)));
    });
    //  isValidRow check if row parameter is a valid row on this game board: return boolean
    methods.push(function isValidRow(row){
        return !!( (0 <= row) && (row <= (rows - 1)));
    });

    // The next three methods are helper methods for seting up game board objects
    // getInitialPlayerPosition return an object with the initial x and y positions for the player
    methods.push(function getInitialPlayerPosition() {
        return Object.create(initialPlayerLocation);
    });
    // getEnemyStartingRow returns a row for the enemy object to appear on: return integer
    methods.push(function getEnemyStartingRow(){
        return validEnemyRows[Math.floor(Math.random() * validEnemyRows.length)];
    });
    // getEnemySpeed returns a number representing the speed of the enemy: return number
        // This was implemented on the game because this appears to be more game specific (for example a board with more columns chould have enemies of greater speed) 
    methods.push(function getEnemySpeed(){
        return Math.ceil(Math.random()*4);
    });

    // The next two methods are state check and side effect objects
    // isWinner check if the player object is on the last row : return type boolean
        // This take the parameter of a player object in case there are multiple players
    methods.push(function isWinner(player){
        if(player.yPosition === 0){
            gameState.score++;
            return true;
        }
        return false;
    });
    // isLoser check if the player object has hit an enemy object  : return type boolean
        // This take the parameter of a player object in case there are multiple players
    methods.push(function isLoser(player){
        var returnVal = false;
        enemies.forEach(function(enemy){
            if(enemy.yPosition === player.yPosition && (Math.floor(enemy.xPosition) === player.xPosition || Math.ceil(enemy.xPosition) === player.xPosition)){
                gameState.score--;
                return returnVal = true;
            }
        });
        return returnVal;
    })
    
    //Initializer
    var initialize = function initialize() {
        var initializingInstance = this;
        methods.forEach(function(fn){
            initializingInstance[fn.name] = fn; 
        });
        setupGame();
    };

    //Instance Function
    var getInstance = function getInstance() {
        if( ! instance ) {
            instance = new initialize();
        }
            return instance;
    }

    //Return interface
    return {
        getInstance : getInstance
    }

})(Player, Enemy, document);

// Setup a game
game.getInstance();


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = game.getInstance().getEnemies();


var player = game.getInstance().getPlayer();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
