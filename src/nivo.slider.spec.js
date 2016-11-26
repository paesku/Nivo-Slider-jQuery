describe('Nivo Slider', function () {

    beforeEach(function () {
        jasmine.getFixtures().fixturesPath = 'base/spec/fixtures/';
        loadFixtures('slider.html');
    });

    it('Should find jQuery', function () {
        expect($).not.toBeNull();
    });

    it('has class nivoSlider', function (){
        var slider = $('#slider');
        slider.nivoSlider();
        expect(slider).toHaveClass('nivoSlider');
    });
});
