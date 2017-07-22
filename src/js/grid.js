'use strict';

const Grid = function (tileSize, tileCount_X, tileCount_Y, world) {
    this.$canvas = CanvasUtils.createCanvas();
    this.ctx = this.$canvas[0].getContext('2d');
    this.dragging = false;
    this.level = Array(tileCount_Y).fill().map(() => Array(tileCount_X).fill([]));
    this.tileCount_X = tileCount_X;
    this.tileCount_Y = tileCount_Y;
    this.tileSize = tileSize;
    this.world = world;

    this.$canvas[0].width = this.tileCount_X * this.tileSize;
    this.$canvas[0].height = this.tileCount_Y * this.tileSize;
    const $container = $("#grid-container");
    $container.prepend(this.$canvas);

    if (this.$canvas[0].height < $container.height()) {
        $container.addClass("vertical-center");
    }
    if (this.$canvas[0].width < $container.width()) {
        $container.addClass("horizontal-center");
    }

    CanvasUtils.disableSmoothing(this.$canvas[0]);

    // Fill Canvas White
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    CanvasUtils.drawGrid(this.$canvas[0], this.tileSize, this.tileSize);

    // Click to add new sprite to grid
    this.$canvas
    .mousedown(event => {
        event.originalEvent.preventDefault();
        this.dragging = true;
        this.draw(event);
    })
    .mouseup(event => { //TODO: The mouseup might end up outside the element area
        this.dragging = false;
        const snap = this.$canvas[0].toDataURL();
        $("#grid-management").css({
            "background-image": "url(" + snap + ")",
            "background-size": "contain",
            "background-repeat": "no-repeat"
        });
    })
    .mousemove(event => {
        if (this.dragging) this.draw(event);
        const globalOffset = this.$canvas.offset();
        const parentOffset = {
            top: this.$canvas.position().top > 0 ? this.$canvas.position().top : 0,
            left: this.$canvas.position().left > 0 ? this.$canvas.position().left : 0
        }
        const $preview = $("#sprite-preview");
        $preview.show();
        $preview.css({
            'top': parentOffset.top + Math.floor((event.pageY - globalOffset.top) / (this.tileSize)) * this.tileSize,
            'left': parentOffset.left + Math.floor((event.pageX - globalOffset.left) / (this.tileSize)) * this.tileSize
        });
        if (this.world.pallet.selectedSpriteData) {
            $preview.css({
                'border': 'none',
                'background-size': 100 * (this.world.pallet.selectedSheet.width / this.world.pallet.tileSize) + '%', // why is this?
                'image-rendering': 'pixelated',
                'background-image': 'url(' + this.world.pallet.selectedSpriteData.img.src + ')',
                'background-position-x': -1 * (this.world.pallet.selectedSpriteData.x * this.tileSize),
                'background-position-y': -1 * (this.world.pallet.selectedSpriteData.y * this.tileSize),
                'opacity': 0.4,
                'min-width': this.tileSize,
                'height': this.tileSize,
            });
        } else {
            $preview.css({
                'border': '2px solid black',
                'min-width': this.tileSize-4,
                'height': this.tileSize-4,
            });
        }
    }).mouseup(); // Initial click to display grid.

    // On Mouse out of grid, hides the sprite preview
    this.$canvas.mouseout(event => {
        $("#sprite-preview").hide();
    });

}

Grid.prototype.draw = function (event) {
    if (!this.world.pallet.selectedSpriteData) return; // Some error for no sprite selected
    const offset = this.$canvas.offset();
    const tile_x = Math.floor((event.pageX - offset.left) / (this.tileSize));
    const tile_y = Math.floor((event.pageY - offset.top) / (this.tileSize));
    // TODO: Prevent duplicate draws of same image
    this.ctx.drawImage(
        this.world.pallet.selectedSpriteData.img, // Image source
        this.world.pallet.selectedSpriteData.x * this.world.pallet.selectedSpriteData.dx, // x clipping start
        this.world.pallet.selectedSpriteData.y * this.world.pallet.selectedSpriteData.dy, // y clipping start
        this.world.pallet.selectedSpriteData.dx, // dx clipping size
        this.world.pallet.selectedSpriteData.dy, // dy clipping size
        tile_x * this.tileSize, // x placement start
        tile_y * this.tileSize, // y placement start
        this.tileSize, // dx placement size
        this.tileSize // dy placement size
    );
    this.level[tile_y][tile_x] = true; // TODO: Store image data instead
};

Grid.prototype.toggle = function () {
    this.$canvas.toggle();
};
