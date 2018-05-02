var simon = function () {
    var moves = []; //an array of 20 randomly generated 0 to 4 numbers representing what area will light up
    var timeSpeeding = 0; //decreases the duration alloted for each area lighting, increasing difficulty
    var presence = false; //0-3 what area has been clicked or where the mouse is
    var animationEnded = true; //true when animations in logic() has ended
    var wr = document.getElementById("wrapper"); //the container for all the game 
    var c = document.getElementById("colors");//the element containing the four areas that are clickable
    var gameStarted = false;//true when start button pressed
    var currIndex = 0;//the level (-1) where the game is
    var timeStamp; //timeInterval var checking how much time has passed since the player could introduce the comnination of moves
    var playerIndex = 0; //where in the moves the player is; advances as the player lights up the correct area
    var timerId;//setInterval var for the animation of each move in moves
    var isStrict = false;//the type of game that is played - does a mistake take the player to 0 (strict) or not
    var isOn = false;//wether the game is on

    //this function animates the computer's moves
    function logic() {
        var timeEndAnimation; //measures the moment when the waiting period for  the player to finish the combination of moves measures with timeStamp
        var i = 0;
        var step = 0;
        timeSpeeding = (currIndex === 9) ? 100 : timeSpeeding;
        timeSpeeding = (currIndex === 13) ? 200 : timeSpeeding;
        (function () {
            timerId = setInterval(changecolors, 500 - timeSpeeding);
            animationEnded = false;
            //this function changes the colors by passing through 4 steps: 0, waiting for a move, 1, lighting the area, 2, darkening it back, and
            //3, preparing for player's moves
            function changecolors() {
                switch (step) {
                    case 1:
                        lightMove(moves[i]);
                        break;
                    case 2:
                        darkMove(moves[i]);
                        break;
                    case 3:
                        step = -1;
                        if (i < currIndex) {
                            i++;
                        } else {
                            clearInterval(timerId);
                            timeEndAnimation = new Date();
                            animationEnded = true;
                            playerIndex = 0;
                            timeStamp = setInterval(function () {
                                if ((new Date() - timeEndAnimation) > 10000) {
                                    animationEnded = false;
                                    clearInterval(timeStamp);
                                    logic();
                                }
                            }, 600);
                        }
                        break;
                }
                step++;
            }
        })();
    }

    //this function allows to track the moves of the mouse, which allows turning the cursor into a pointer when
    //hovering the four areas at the time animation in logic() stops; it finds the center of the wrapper and calculates the distance from
    //mouse position to center; r eturns on what area the mouse is or false if the mouse is not above the four areas 
    function mouseTracker(event) {
        var x = event.clientX;
        var y = event.clientY;
        var centerX, centerY;
        if (c.getBoundingClientRect) {
            var rect = wr.getBoundingClientRect();
            centerX = rect.left + 200;
            centerY = rect.top +  200;
        }
        var radius = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
        if (gameStarted && animationEnded) {
            if (radius > 100) {
                c.style.cursor = "pointer";
                if (x < (centerX - 10)) {
                    if (y < (centerY - 10)) {
                        presence = 0;
                    } else if (y > (centerY - 10)) {
                        presence = 2;
                    } else {
                        presence = false;
                    }
                } else if (x > (centerX + 10)) {
                    if (y < (centerY - 10)) {
                        presence = 1;
                    } else if (y > (centerY - 10)) {
                        presence = 3;
                    } else {
                        presence = false;
                    }
                } else {
                    presence = false;
                }
            } else {
                c.style.cursor = "default";
            }
        } else {
            presence= false;
        }
        return presence;
    }

    //a function called by mousedown, lightens up the area by calling lightMove after updating presence
    function mouseLight() {
        if (gameStarted && animationEnded) {
            presence = mouseTracker(event);
            lightMove(presence);
        }
    }

    //darkens the areas when called by mouseup, it also determines whether the move is correct and takes necessary steps
    function mouseDark() {
        if (gameStarted && animationEnded) {
            presence = mouseTracker(event);
            darkMove(presence);
            if (true) {
                if (moves[playerIndex] === presence) {
                    if (playerIndex === currIndex) {
                        playerIndex = 0;
                        clearInterval(timeStamp);
                        if (currIndex === 19) {
                            endAnimation();
                            gameStarted = false;
                        } else {
                            currIndex++;
                            document.getElementById("level").innerHTML = (currIndex + 1 > 9) ? (currIndex + 1) : "0" + (currIndex + 1);
                            logic();
                        }
                    } else {
                        playerIndex++;
                    }
                } else {
                    clearInterval(timeStamp);
                    document.getElementById("level").innerHTML = "--";
                    var snd = document.getElementById("error");
                    snd.play();
                    playerIndex = 0;
                    if (isStrict) {
                        currIndex = 0;
                    }
                    animationEnded = false;
                    setTimeout(function () {
                        document.getElementById("level").innerHTML = (currIndex + 1 > 9) ? (currIndex + 1) : "0" + (currIndex + 1);
                        logic();
                    }, 1000);
                }
            }
        }
    }

    //basic function lightens areas
    function lightMove(x) {
        var s = 0;
        var snd = document.getElementById("myAudio" + x);
        switch (x) {
            case 1:
                c.style.borderTopColor = "#ff4d4d";
                break;
            case 0:
                c.style.borderLeftColor = "#ffff66";
                break;
            case 2:
                c.style.borderBottomColor = "#8080ff";
                break;
            case 3:
                c.style.borderRightColor = "#66ff66";
                break;
        }
        snd.play();
    }


    //basic function darkens areas
    function darkMove(x) {
        switch (x) {
            case 1:
                c.style.borderTopColor = "#990000";
                break;
            case 0:
                c.style.borderLeftColor = "#cccc00";
                break;
            case 2:
                c.style.borderBottomColor = "#000080";
                break;
            case 3:
                c.style.borderRightColor = "#003300";
                break;
        }
    }

    //when the player wins, this animation is activated
    function endAnimation() {
        var i = 0;
        var endAn = setInterval(function () {
            if (i === 8) {
                clearInterval(endAn);
            } else {
                if (i % 2 > 0) {
                    lightMove(moves[19]);
                } else {
                    darkMove(moves[19]);
                }
                i++;
            }
        },300);
    }

    //selects the type of game through a button
    function setStrict() {
        if (!gameStarted && isOn) {
            document.getElementById("blk").style.backgroundColor = isStrict ? "#800000" : "red";
            isStrict = !isStrict;
        }
    }

    //activates or deactivates the game;if the game is started and button is turned off, it resets it
    function setOn() {
        document.getElementById("onButton").style.left = (isOn) ? "170px" : "200px";
        document.getElementById("level").style.color = (isOn) ? "#800000" : "red";
        isStrict = false;
        isOn = !isOn;
        if (!isOn) {
            clearInterval(timerId);
            clearInterval(timeStamp);
            gameStarted = false;
            currIndex = 0;
            document.getElementById("level").innerHTML = "--";
            document.getElementById("blk").style.backgroundColor = "#800000";
            for (var i = 0; i < 4; i++) {
                darkMove(i);
            }
        }  
    }

    //starts the game - with the animation in logic()
    function start() {
        if (!gameStarted && isOn) {
            moves = [];
            for (var j = 0; j < 20; j++) {
                moves.push(Math.floor(Math.random() * 4));
            }
            
            gameStarted = true;
            document.getElementById("level").innerHTML = (currIndex + 1 > 9) ? (currIndex + 1) : "0" + (currIndex + 1);
            logic();
        }

    }

    return {
        start: start,       
        mouseTracker: mouseTracker,
        mouseLight: mouseLight,
        mouseDark: mouseDark,
        setStrict: setStrict,
        setOn:setOn
    };
}();