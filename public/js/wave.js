$(document).ready(function() {
    $('#wave1').wavify({
        height: 80,
        bones: 5,
        amplitude: 80,
        color: 'rgba(242, 249, 255, 0.5)',
        speed: .15
    });
    
    $('#wave2').wavify({
        height: 80,
        bones: 4,
        amplitude: 60,
        color: 'rgba(159,207,251, 0.5)',
        speed: .25
    });

    $('#wave3').wavify({
        height: 80,
        bones: 3,
        amplitude: 40,
        color: 'rgba(0, 71, 114, 0.5)',
        speed: .35
    });
});