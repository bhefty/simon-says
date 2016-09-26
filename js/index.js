// Setup game object
var game = {
    round: 1, // current round
    turn: 0, // current turn
    active: false, // whether input will be accepted
    genSeq: [], // array with generated/random colors
    playSeq: [] // array with user's selections
  }
  // Setup initial speed difficulty
var difficulty = 1;
// Setup time variables
var countDown, step, timeLimit;
// Intialize global variables
var turnedOn = false;
var strictMode = false;
var gameWon = false;

// Setup colors and audio files
var green = $('.green');
var greenAudio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');
var red = $('.red');
var redAudio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');
var yellow = $('.yellow');
var yellowAudio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3');
var blue = $('.blue');
var blueAudio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3');
var buzzer = new Audio('http://www.soundjay.com/button/button-4.mp3');
var victory = new Audio('https://d1490khl9dq1ow.cloudfront.net/music/mp3preview/first-prize-winner-flourish_G1KvVlHu.mp3');

// Flash color and play sound
function flash(color, times, speed) {
  if (times > 0) {
    playSound(color);
    $('.' + color).stop().animate({
      opacity: '1'
    }, {
      duration: 200,
      complete: function() {
        $('.' + color).stop().animate({
          opacity: '0.5'
        }, 200);
      }
    });
  }

  // Repeat until complete
  if (times > 0) {
    setTimeout(function() {
      flash(color, times, speed);
    }, 200);
    times--;
  }

  // Play audio associtaed with each color
  function playSound(color) {
    switch (color) {
      case "green":
        greenAudio.play();
        break;
      case "red":
        redAudio.play();
        break;
      case "yellow":
        yellowAudio.play();
        break;
      case "blue":
        blueAudio.play();
        break;
      default:
        console.log("Wrong color input");
    }
  }
}

// Randomly assign color sequence
function randomizePlay() {
  if (game.genSeq.length !== 0) {
    game.genSeq = [];
  }
  for (var i = 0; i < 20; i++) {
    game.genSeq.push(Math.floor(Math.random() * 4) + 1);
    switch (game.genSeq[i]) {
      case 1:
        game.genSeq[i] = "red";
        break;
      case 2:
        game.genSeq[i] = "blue";
        break;
      case 3:
        game.genSeq[i] = "yellow";
        break;
      case 4:
        game.genSeq[i] = "green";
        break;
      default:
        console.log("An error has occurred in generating a random sequence.");
    }

  }
  console.log("Colors added to sequence: " + game.genSeq);
}

// Display color sequence to user
function displaySequence(fast) {
  // Don't allow clicking during display
  game.active = false;
  // Clear timers
  clearTimeout(timeLimit);
  clearInterval(step);
  // Setup duration of display
  var counter = 0;
  var numberFlash = 0;
  if (!gameWon) {
    $.each(game.genSeq, function(index) {
      if (numberFlash < game.round) {
        setTimeout(function() {
          flash(game.genSeq[index], 1, 800);
        }, 0 + counter);
        counter += 1500 * fast;
        numberFlash++;
      }
    });
    //Allow clicks after displaying sequence
    setTimeout(allowClick, counter - 1000);

    // Start countdown for time limit
    timeLimit = setTimeout(function() {
      countDown = 5;
      step = setInterval(timer, 1000);
    }, counter);
  }
}

// Update round text
function displayRound() {
  $('.round').text(game.round);
}

// Allow clicks
function allowClick() {
  game.active = true;
}

// Countdown timer
function timer() {
  countDown -= 1;
  if (countDown <= 0 && strictMode) {
    strictRestart();
  } else if (countDown <= 0) {
    clearInterval(step);
    countDown = 5;
    console.log("Too slow");
    incorrectSequence();
  }
}

// Shake screen when incorrect
function buzzShake() {
  $('.container').effect("shake");
  buzzer.play();
}

// Log player sequence
function playerSequence(color) {
  game.playSeq.push(color);

  // Check each sequence as it's entered for wonrg input
  for (var i = 0; i < game.playSeq.length; i++) {
    if ((game.playSeq[i] !== game.genSeq[i]) && (strictMode)) {
      strictRestart();
      return;
    } else if (game.playSeq[i] !== game.genSeq[i]) {
      incorrectSequence();
    } else if (game.playSeq[i] === game.genSeq[i]) {
      countDown = 5; // Reset timer to 5 seconds if correct
    }
  }

  // If sequence length matches round number, check inputs
  if (game.playSeq.length === game.round) {
    checkSequence(color);
  }

  // Check if chosen color was correct
  function checkSequence(color) {
    // Check if color matches
    if (color !== game.genSeq[game.turn]) {
      incorrectSequence();
      game.playSeq = [];
    } else {
      game.turn++;
    }
    // Advance to next round when complete
    if (game.turn === game.round) {
      clearInterval(step);
      game.playSeq = [];
      game.round++;
      displayRound();
      setTimeout(function() {
        newLevel();
      }, 1000);
    }
    // If sequences were correct through round 20, win game
    if (game.round - 1 === 20) {
      gameWon = true;
      $('.round').html('&#9786;');
      winGame();
    }
    // Adjust speed difficulty as game progresses
    if (game.round < 5) {
      difficulty = 1;
    } else if (game.round < 9) {
      difficulty = 0.75;
    } else if (game.round < 9) {
      difficulty = 0.50;
    }
  }

}

// Handle incorrect sequence input
function incorrectSequence() {
  buzzShake();
  game.playSeq = [];
  clearInterval(step);
  displayRound();
  setTimeout(function() {
    displaySequence(difficulty);
  }, 1000);
}

// What to do if user fails on strict mode
function strictRestart() {
  buzzShake();
  resetGame();
  newGame();
}

// Restart game from scratch
function resetGame() {
  game = {
    round: 1, // current round
    turn: 0, // current turn
    active: false, // whether input will be accepted
    genSeq: [], // array with generated/random colors
    playSeq: [] // array with user's selections
  }

  // Clear timers
  clearTimeout(timeLimit);
  clearInterval(step);

  // Reset variables
  difficulty = 1;
  countDown = 5;
  step = null;
  timeLimit = null;
  gameWon = false;
}

// Setup color handler
function initColorHandler() {

  $('.tiles').on('mouseup', function() {
    if (game.active === true) {
      countDown = 5;
      var pad = $(this).data('color');
      flash(pad, 1, 500);
      playerSequence(pad);
    }
  });
}

// Setup intial game
function init() {
  initColorHandler();
  newGame();
}

// Restarts game and starts new round
function newGame() {
  game.round = 1;
  randomizePlay();
  setTimeout(function() {
    newLevel();
  }, 1000);
  difficulty = 1;
  displayRound();
}

// Kicks off each additional round
function newLevel() {
  displaySequence(difficulty);
}

// Flash lights during startup
function startupSequence() {
  $('.round').fadeIn(500).fadeOut(500).fadeIn(500);
  setTimeout(function() {
    flash("red", 1, 500);
  }, 0);
  setTimeout(function() {
    flash("blue", 1, 500);
  }, 200);
  setTimeout(function() {
    flash("yellow", 1, 500);
  }, 400);
  setTimeout(function() {
    flash("green", 1, 500);
  }, 600);
}

// Flash lights during shutdown
function shutdownSequence() {
  $('.round').fadeOut(500).fadeIn(500).fadeOut(500);
  setTimeout(function() {
    flash("green", 1, 500);
  }, 0);
  setTimeout(function() {
    flash("yellow", 1, 500);
  }, 200);
  setTimeout(function() {
    flash("blue", 1, 500);
  }, 400);
  setTimeout(function() {
    flash("red", 1, 500);
  }, 600);
}

// Show winner page and play audio after winning 20 rounds
function winGame() {
  victory.play();
  $('#victory').css('visibility', 'visible').velocity("fadeIn", {
      duration: 1500,
      queue: false
    })
    .velocity("slideDown", {
      duration: 1500
    });
}

// Initial laod
$(document).ready(function() {
  // Off/on switch toggles game state
  $('.onoffswitch').on('mouseup', function() {
    if ($('input[name="onoffswitch"]').is(':checked')) {
      if (strictMode) {
        $('.strict-status').css('opacity', '0.3');
        strictMode = false;
      }
      setTimeout(function() {
        $('.round').css('visibility', 'hidden');
      }, 1500);
      shutdownSequence();
      turnedOn = false;
      resetGame();
    } else {
      $('.round').css('visibility', 'visible');
      startupSequence();
      turnedOn = true;
    }
  });
  // Start button begins game
  $('.start-btn').on('mouseup', function() {
    if (turnedOn) {
      init();
    }
  });
  // Strict button enables strict mode
  $('.strict-btn').on('mouseup', function() {
    if (turnedOn) {
      if (!strictMode) {
        $('.strict-status').css('opacity', '1');
        strictMode = true;
      } else {
        $('.strict-status').css('opacity', '0.3');
        strictMode = false;
      }
    }
  });
  // Play again button revealed on win to start another game
  $('#play-again').on('mouseup', function() {
    $('#victory').css('visibility', 'visible').velocity("fadeOut", {
        duration: 500,
        queue: false
      })
      .velocity("slideUp", {
        duration: 500
      });
    resetGame();
    newGame();
  });

});
