describe('Nivo Slider', function () {

    var navPrev = '.nivo-prevNav';
    var navNext = '.nivo-nextNav';
    var mainImg = '.nivo-main-image';

    describe('default', function () {
        var slider;
        var firstImg;

        beforeEach(function () {
            jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';
            loadFixtures('slider.html');

            slider = $('#slider');
            firstImg = slider[0].querySelectorAll('img')[0];
            slider.nivoSlider();
        });

        it('should find jQuery', function () {
            expect($).not.toBeNull();
        });

        it('should have class nivoSlider', function () {
            expect(slider).toHaveClass('nivoSlider');
        });

        it('should have one caption container', function () {
            expect((slider).find('.nivo-caption').length).toBe(1);
        });

        it('should have default navigation labels', function () {
            expect(slider[0].querySelectorAll(navPrev)[0].innerHTML).toBe('Prev');
            expect(slider[0].querySelectorAll(navNext)[0].innerHTML).toBe('Next');
        });


        it('should set first image', function () {
            var firstImgSrc = firstImg.getAttribute('src');
            expect(slider[0].querySelectorAll(mainImg)[0].getAttribute('src')).toContain(firstImgSrc);
        });
    });

    describe('custom config', function () {
        var slider;


        beforeEach(function () {
            jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';
            loadFixtures('slider.html');

            slider = $('#slider');
        });

        it('should have custom navigation labels', function () {
            var config;
            config = {
                prevText: 'Previous',
                nextText: 'Nextious'
            };
            slider.nivoSlider(config);
            expect(slider[0].querySelectorAll(navPrev)[0].innerHTML).toBe(config.prevText);
            expect(slider[0].querySelectorAll(navNext)[0].innerHTML).toBe(config.nextText);
        });

        it('should have no navigation when \'directionNav\' is set to false ', function () {
            var config;
            config = {
                directionNav: false
            };
            slider.nivoSlider(config);
            expect(slider.find($('.nivo-directionNav')).length).toBe(0);
        });

        xit('timeout', function () {
            var caption = 'This is an example of a caption';
            slider.nivoSlider();
            console.log(slider);
            //expect(slider.find($('.nivo-directionNav')).length).toBe(0);
        });
    });

});
