$(function () {
    "use strict";
    var topoffset = 70; //variable for menu height

    //Scrollspy Plugin
    $('body').scrollspy({
        target: 'header .navbar',
        offset: topoffset
    });

    //For smooth scrolling when clicking on navigation
    $('.navbar a[href*=#]:not([href=#])').click(function () {
        if (location.pathname.replace(/^\//, '') ===
            this.pathname.replace(/^\//, '') &&
            location.hostname === this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: target.offset().top - topoffset + 2
                }, 500);
                return false;
            }
        }
    });
    //For hiding the collapable navbar after click
    $('.nav a').click(function () {
        $('.navbar-collapse').collapse('hide');
    });

    //Making a api call to Instagram API to get images from my account and displaying them in a sleideshow using carousel
    var token = '1728856332.17ee967.4222bba75963437d88157adda965812a',
        userid = 1728856332,//My instagram userId
        num_photos = 10,
        images = ["card", "ornaments", "tree", "wall-hanging", "quotes", "post-box", "drawing", "door-quote", "giraffe", "wood-block"];

    //Making an Ajx call to fetch data from instagram
    $.ajax({
        url: 'https://api.instagram.com/v1/users/' + userid + '/media/recent',
        dataType: 'jsonp',
        type: 'GET',
        scope: "public_content",
        data: {access_token: token, count: num_photos},
        success: function (data) {
            for (var x in data.data) {
                $('#myCarousel .item').eq(x).append('<img src="' + data.data[x].images.standard_resolution.url + '" alt="' + images[x] + '">');
            }
        },
        error: function (data) {
            console.log(data); // if the call fails, error message is displayed
        }
    });

    //To generate carousel indicators and random image on load
    var countSlide = $('#myCarousel .item').length;
    var randomSlide = Math.floor(Math.random() * countSlide);
    $('#myCarousel .item').eq(randomSlide).addClass('active');
    for (var i = countSlide; i > 0; i--) {
        var insertText = '<li data-target="#myCarousel" data-slide-to="' + i + '"';
        if (i === randomSlide) {
            insertText += ' class="active" ';
        }
        insertText += '></li>';
        $('#myCarousel ol').append(insertText);
    }

    //For setting the time interval of slideshow
    $('#myCarousel').carousel({
        pause: false,
        interval: 4000
    });

    //For increasing the progress bar and no of votes based on likes
    $('button[id^=button]').data('votes', 0);
    $('button[id^=button]').prev().find(".progressBar").data('barSize', 0);
    $("button[id^='button']").bind('click', function () {
        var votes = $(this).data('votes');
        votes += 1;
        $(this).data('votes', votes);
        $(this).next().text("Votes: " + votes);
        if (votes % 10 == 0) {
            var barSize = $(this).prev().find(".progressBar").data('barSize');
            barSize += 1;
            $(this).prev().find(".progressBar").data('barSize', barSize);
            $(this).prev().find(".progressBar").css("width", barSize + "%");
        }
    }).bind('click', function () {  // for saving the value of votes and progress bar in firebase
        // Get the values from each of the buttons
        var count = {
            votesJS: $("#buttonJs").data('votes'),
            votesJquery: $("#buttonJquery").data('votes'),
            votesHtml: $("#buttonHtml").data('votes'),
            barSizeJs: $("#buttonJs").prev().find(".progressBar").data('barSize'),
            barSizeJquery: $("#buttonJquery").prev().find(".progressBar").data('barSize'),
            barSizeHtml: $("#buttonHtml").prev().find(".progressBar").data('barSize')
        };

        // Pushing a skills object to the database using these values
        skills.push(count);
    });

    //For submitting the details of user into database
    $("#myForm").submit(function () {
        // input values from each of the form elements
        var name = $("#firstName").val();
        var email = $("#email").val();
        var message = $("#comment").val();
        // Pushing the contact object to the database using form values
        contact.push({
            "name": name,
            "email": email,
            "message": message
        });
    });
});
var config = {
    apiKey: "AIzaSyB27rZ43o_UEcXwGdpQca-SsyTpayJnAq0",
    authDomain: "test-8b7c9.firebaseapp.com",
    databaseURL: "https://test-8b7c9.firebaseio.com",
    storageBucket: "test-8b7c9.appspot.com",
    messagingSenderId: "72503262856"
};

// Initializing Firebase
firebase.initializeApp(config);

// Reference to the skills and contact object in my Firebase database
var skills = firebase.database().ref("skills");
var contact = firebase.database().ref("contact");
skills.limitToLast(1).on('child_added', function (childSnapshot) {
    skill = childSnapshot.val();
    // Update the HTML to display the skills text
    $("#buttonJs").data('votes', skill.votesJS);
    $("#buttonJquery").data('votes', skill.votesJquery);
    $("#buttonHtml").data('votes', skill.votesHtml);
    $("#buttonJs").next().text("Votes: " + skill.votesJS);
    $("#buttonJquery").next().text("Votes: " + skill.votesJquery);
    $("#buttonHtml").next().text("Votes: " + skill.votesHtml);
    $("#buttonJs").prev().find(".progressBar").data('barSize', skill.barSizeJs);
    $("#buttonJs").prev().find(".progressBar").css("width", skill.barSizeJs + "%");
    $("#buttonJquery").prev().find(".progressBar").data('barSize', skill.barSizeJquery);
    $("#buttonJquery").prev().find(".progressBar").css("width", skill.barSizeJquery + "%");
    $("#buttonHtml").prev().find(".progressBar").data('barSize', skill.barSizeHtml);
    $("#buttonHtml").prev().find(".progressBar").css("width", skill.barSizeHtml + "%");
});
contact.limitToLast(1).on('child_added', function (childSnapshot) {
    contacts = childSnapshot.val();
    // Update the HTML to display the contact text
    $("#username").text(contacts.name + " says:");
    $("q").text(contacts.message);
});

