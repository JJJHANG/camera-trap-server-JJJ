$("body").click(function(){
    $('.message-box').hide();
});

$(".message-box").click(function(e){
    e.stopPropagation();
});

$(".message-btn").click(function(e){
    e.stopPropagation();
    $(".message-box").fadeIn();
});

$('.ham4').on('click', function() {
    if($(window).width()<1025){
        $('.ham4').toggleClass('active');
        $('.header-cont').slideToggle();
    }else{
        $('.ham4').removeClass('active');
        $('.header-cont').css("display", "flex");
    }
});

$('.mbbtn-1').on('click',function (event) {
    if($(window).width()<999){
        $(this).next('.menu-2').slideToggle();
        $(this).toggleClass('now');
    }
});
$('.mbbtn-2').on('click',function (event) {
    if($(window).width()<999) {
        $(this).next('.menu-2').slideToggle();
        $(this).toggleClass('now');
    }
});



$(function(){

	$('.xx').on('click',function (event) {
		$('.pop-box').fadeOut();
		$('body').css("overflow", "initial");
	});


    $(function (){

        gsap.registerPlugin(ScrollTrigger);

        ScrollTrigger.create({
            trigger: ".map-section",
            start: "top-=90% top",
            // markers: true,
            onEnter:function () {
                $('.map-section').addClass('vivi')
            }
        });
        ScrollTrigger.create({
            trigger: ".chart-section",
            start: "top-=80% top",
            // markers: true,
            onEnter:function () {
                $('.chart-section').addClass('vivi')
            }
        });
        ScrollTrigger.create({
            trigger: ".three-iconbox",
            start: "top-=75% top",
            // markers: true,
            onEnter:function () {
                $('.three-iconbox').addClass('vivi')
            }
        });

    })

});


// 以上為2023-09新切版



$(document).ready(function () {


    $('.login-item').on('click', function(){
        $('.login-pop').fadeIn()
    })    

    
    $("li.active").removeClass("active");
    $('a[href="' + location.pathname + '"]')
    .closest(".nav-link")
    .addClass("active");


$('#updateIsRead').on('click',function(){
    $.ajax({
    url: "/update_is_read",
    type: 'GET',
    success: function(){
        $('.has-unread').hide()
    }
    });
})



// tooltip
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});


$('#getAuth').on('click',function(){
    let url = "https://orcid.org/oauth/authorize?client_id=APP-F6POVPAP5L1JOUN1&response_type=code&scope=/authenticate&redirect_uri=" + location.protocol + "//" + location.host + "/callback/orcid/auth?next=" + window.location.pathname ;
    window.location.href = url;
})

$('#alert-box').on('click',function(){
        $.ajax({
        url: "/announcement_is_read",
        type: 'GET',
        success: function(data){
            $('.alert-content').hide();
            document.cookie = 'announcementread='+data.expired_time+';max-age='+data.expired_time+'; path=/';
        }
        });
})



});
