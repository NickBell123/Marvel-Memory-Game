$(document).ready(function() {
    class audioControl {
        constructor() {
            this.bgMusic = new Audio('assets/sounds/backgroundMusic.mp3');
            this.flipSound = new Audio('assets/sounds/card-flip.wav');
            this.matchedSound = new Audio('assets/sounds/matchedSound.wav');
            this.victory = new Audio('assets/sounds/badass-victory.wav');
        }
        startMusic() {
            this.bgMusic.currentTime = 0;
            this.bgMusic.play();
        }

        stopMusic() {
            this.bgMusic.pause();
        }

        flip() {
            this.flipSound.play();
        }

        match() {
            this.matchedSound.play();
        }

        victorySound() {
            this.victory.play();
        }
    }

    let audio = new audioControl;
    let timer;
    let resetCounter;
    let matchedCards = [];
    let sound = true;

    //background music toggler
    $('#soundToggler').click(() => {
        if (sound) {
            stopBgSound();

        } else {
            startBgSound();
        }
        // console.log(sound);
        // console.log({ soundToggler });
    })

    function stopBgSound() {
        sound = false
        $('#soundToggler').addClass('soundOff')
        $('#soundToggler').removeClass('soundOn')
        audio.stopMusic();
    }

    function startBgSound() {
        sound = true
        $('#soundToggler').addClass('soundOn')
        $('#soundToggler').removeClass('soundOff')
        audio.startMusic();
    }
    //timer
    function startTimer() {
        timer = 50;
        resetCounter = setInterval(() => {
            let countDown = timer--;
            $('#time-remaining').html(countDown);
            if (countDown === 0) {
                clearInterval(resetCounter);
                audio.stopMusic();
                matchedCards = [];
                timeUp();
                $('#time-remaining').html('0');
            }
        }, 1000);

        function timeUp() {
            setTimeout(function() {
                audio.victorySound();
                $('.memory-card').removeClass('flip');
                $('.memory-card').removeClass('matched');
                $('#game-over-text').addClass('visible');
            }, 1000)
            $('#game-over-text').click(() => {
                sound = true
                $('#game-over-text').removeClass('visible');
                $('#soundToggler').addClass('soundOn')
                $('#soundToggler').removeClass('soundOff')
                $('#pairs').html(0);
                clearInterval(resetCounter);
                shuffleCards();
                audio.startMusic();
                startTimer();
            })
        }
    }
    const cards = document.querySelectorAll('.memory-card');
    // Click to start overlay
    $('#start-overlay').click(function() {
        $('#start-overlay').removeClass('visible');
        audio.startMusic();
        startTimer();
    });

    function shuffleCards() {
        // shuffle using flex order value
        cards.forEach(function(card) {
            let shufflePos = Math.floor(Math.random() * 16);
            card.style.order = shufflePos;
            cards.forEach(function(card) {
                card.addEventListener('click', flipCard, function() {});
            });
        });
    }

    shuffleCards();

    let isCardFlipped = false;
    let lockCards = false;
    let fistCard;
    let secondCard;

    // Flip card with a click
    function flipCard() {
        if (lockCards) return;
        if (this === fistCard) return;

        $(this.classList.toggle('flip'));
        audio.flip();

        if (!isCardFlipped) {
            //first click
            isCardFlipped = true;
            fistCard = this;
            return;
        }
        //second click
        isCardFlipped = false;
        secondCard = this;
        //do cards match?
        checkForMatch();
    }

    function checkForMatch() {
        //  ternary operator 
        let doMatch = fistCard.dataset.image === secondCard.dataset.image;
        doMatch ? disableCards() : unflipCards();
        // if (fistCard.dataset.image === secondCard.dataset.image) {
        //     disableCards();
        // } else {
        //     //does not match. Timeout used to view 2nd card
        //     unflipCards();
        // }
    }

    function disableCards() {
        fistCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        //console.log(fistCard.classList);
        fistCard.classList.add('matched');
        secondCard.classList.add('matched');
        audio.match();
        matchedCards.push(fistCard);
        matchedCards.push(secondCard);

        let matchedPairs = matchedCards.length;
        let matches = matchedPairs / 2;
        $('#pairs').html(matches);


        if (matchedCards.length === 16) {
            clearInterval(resetCounter);
            matchedCards.length = 0;
            matches = 0;
            audio.stopMusic();
            audio.victorySound();
            setTimeout(function() {
                $('.memory-card').removeClass('flip');
                $('#you-won-text').addClass('visible');
                $('.memory-card').removeClass('matched');
                $('#you-won-text').click(function() {
                    sound = true
                    $('#soundToggler').addClass('soundOn')
                    $('#soundToggler').removeClass('soundOff')
                    shuffleCards();
                    $('#pairs').html(0);
                    matchedCards = [];

                });
            }, 1200);

        } else {
            resetGame();
        }
    }

    function unflipCards() {
        lockCards = true;
        setTimeout(function() {
            fistCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            resetGame();
        }, 1500);
    }

    function resetGame() {
        isCardFlipped = false;
        lockCards = false;
        fistCard = null;
        secondCard = null;
    }
});

$('#prizeBtn').click(function() {
    $('#you-won-text').removeClass('visible');
    $('#prize-overlay').addClass('visible');

})

$('#closePrize').click(function() {
    $('#prize-overlay').removeClass('visible');
    $('#start-overlay').addClass('visible');

})

function getData() {
    const baseURL = "https://gateway.marvel.com/v1/public/characters?"
        // const apikey = "&limit=100&ts=1&apikey=2479ac670ffd22a005793a85e2cd6556&hash=148c15d91ce2f088e7a99e28892d0da2"
    let offSet = (Math.floor(Math.random() * 15)) * 10;
    let apikey = `&limit=100&offset=${offSet}&ts=1&apikey=2479ac670ffd22a005793a85e2cd6556&hash=148c15d91ce2f088e7a99e28892d0da2`

    $.getJSON(baseURL + apikey, function(data) {
        $('#footer-text').html(data.attributionText.toUpperCase());
        console.log(data);
        let prizeNum = Math.floor(Math.random() * 101);
        prizeCharacter = (data.data.results[prizeNum]);
        console.log(prizeCharacter.name);
        $('.prize-text').html(prizeCharacter.name.toUpperCase());
        $('.prize-content').html(`<img src="${prizeCharacter.thumbnail.path}/portrait_fantastic.${prizeCharacter.thumbnail.extension}"></img>`);
        $('#prizeBio').html(`<a href="${prizeCharacter.resourceURI}"></a>`);
    });
}


getData();