describe('Nivo Slider', function () {

    beforeEach(function () {
        jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';
        loadFixtures('slider.html');
    });

    it('should find jQuery', function () {
        expect($).not.toBeNull();
    });

    it('should have class nivoSlider', function (){
        var slider = $('#slider');
        slider.nivoSlider();
        expect(slider).toHaveClass('nivoSlider');
    });

    it('should have default navigation labels', function () {
        var slider = $('#slider');
        slider.nivoSlider();
        var navPrev = '.nivo-prevNav';
        var navNext = '.nivo-nextNav';
        expect(slider[0].querySelectorAll(navPrev)[0].innerHTML).toBe('Prev');
        expect(slider[0].querySelectorAll(navNext)[0].innerHTML).toBe('Next');
    });

    it('should have custom navigation labels', function () {
        var slider = $('#slider');
        var config = {
            prevText: 'Previous',
            nextText: 'Nextious',
        };
        slider.nivoSlider(config);
        var navPrev = '.nivo-prevNav';
        var navNext = '.nivo-nextNav';
        expect(slider[0].querySelectorAll(navPrev)[0].innerHTML).toBe('Previous');
        expect(slider[0].querySelectorAll(navNext)[0].innerHTML).toBe('Nextious');
    });
});
