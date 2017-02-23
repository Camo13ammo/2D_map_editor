'use strict';

(() => {

    function World (tileSize, tileCount_X, tileCount_Y) {
        this.tileSize = tileSize;
        this.tileCount_X = tileCount_X;
        this.tileCount_Y = tileCount_Y;
        this.grids = [new Grid(tileSize, tileCount_X, tileCount_Y, this)];
        this.pallet = new Pallet(tileSize, this);
    }

    World.prototype.addGrid = function () {
        this.grids.push(new Grid(this.tileSize, this.tileCount_X, this.tileCount_Y));
    };

    function Pallet (tileSize, world) {
        this.world = world;
        this.selectedSheet = null;
        this.selectedSpriteData = null;
        this.tileSize = tileSize;
        this.spriteSheets = [];
        this.$canvas = $('<canvas/>');
        this.ctx = this.$canvas[0].getContext("2d");
        $("#pallet-container").prepend(this.$canvas);
        const $selectedTileIndicator = $("#selected-tile-indicator");
        this.$canvas.click(event => {
            const offset = this.$canvas.offset();
            $selectedTileIndicator.css({
                'left': Math.floor((event.pageX - offset.left) / (this.tileSize)) * this.tileSize,
                'top': Math.floor((event.pageY - offset.top) / (this.tileSize)) * this.tileSize,
                'min-width': this.tileSize,
                'height': this.tileSize

            })
            this.selectedSpriteData = {
                img: this.selectedSheet,
                x: Math.floor((event.pageX - offset.left) / (this.tileSize)),
                y: Math.floor((event.pageY - offset.top) / (this.tileSize)),
                dx: this.tileSize,
                dy: this.tileSize
            };
        });
    }

    // TODO: add functionality for both x and y
    Pallet.prototype.setSpriteSize = function (spriteSizeX, spriteSizeY) {
        this.tileSize = spriteSizeX;
    };

    Pallet.prototype.addSpriteSheet = function (spriteURL) {
        const img = new Image();
        img.onload = function() {
            this.ctx.canvas.height = img.height;
            this.ctx.canvas.width = img.width;
            this.toggleSpriteSheet(this.spriteSheets.push(img)-1);
        }.bind(this);
        img.src = spriteURL;
    };

    Pallet.prototype.toggleSpriteSheet = function (index) {
        this.selectedSheet = this.spriteSheets[index];
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.selectedSheet, 0, 0);

        // Drawing vertical lines
        for (let x = 0; x <= this.ctx.canvas.width; x += this.tileSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.ctx.canvas.height);
        }

        // Drawing horizontal lines
        for (let y = 0; y <= this.ctx.canvas.height; y += this.tileSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.ctx.canvas.width, y);
        }

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
    };

    function Grid (tileSize, tileCount_X, tileCount_Y, world) {
        this.world = world;
        this.$canvas = $('<canvas/>');
        this.ctx = this.$canvas[0].getContext("2d");
        this.tileSize = tileSize;
        this.tileCount_X = tileCount_X;
        this.tileCount_Y = tileCount_Y;
        this.dragging = false;
        this.level = Array(tileCount_Y).fill().map(() => Array(tileCount_X).fill([]));

        this.ctx.canvas.width = this.tileCount_X * this.tileSize;
        this.ctx.canvas.height = this.tileCount_Y * this.tileSize;
        $("#grid-container").prepend(this.$canvas);

        //Prevents the canvas from anti-aliasing tiles
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.oImageSmoothingEnabled = false;

        // Fill Canvas White
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        // Drawing vertical lines
        for (let x = 0; x <= this.ctx.canvas.width; x += this.ctx.canvas.width/this.tileCount_X) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.ctx.canvas.height);
        }

        // Drawing horizontal lines
        for (let y = 0; y <= this.ctx.canvas.height; y += this.ctx.canvas.height/this.tileCount_Y) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.ctx.canvas.width, y);
        }

        this.ctx.strokeStyle = "black";
        this.ctx.stroke();

        // Click to add new sprite to grid
        this.$canvas.mousedown(event => {
            event.originalEvent.preventDefault();
            this.dragging = true;
            this.draw(event);
        });

        // Update minimap when lifting mouse
        this.$canvas.mouseup(event => {
            this.dragging = false;
            const snap = this.$canvas[0].toDataURL();
            $("#grid-management").css({
                "background-image" : "url(" + snap + ")",
                "background-size": "contain",
                "background-repeat": "no-repeat"
            });
        }).mouseup(); // Initial click to display grid.

        // Hovering over grid previews the sprites
        this.$canvas.mousemove(event => {
            if (this.dragging) this.draw(event);
            const offset = this.$canvas.offset();
            const $preview = $("#sprite-preview");
            $preview.show();
            $preview.css({
                'top': Math.floor((event.pageY - offset.top) / (this.tileSize)) * this.tileSize,
                'left': Math.floor((event.pageX - offset.left) / (this.tileSize)) * this.tileSize
            });
            if (this.world.pallet.selectedSpriteData) {
                $preview.css({
                    'border': 'none',
                    'background-size': 100 * (this.world.pallet.ctx.canvas.width / this.world.pallet.tileSize) + '%', // why is this?
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
        });

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

    var world = new World(24, 20, 19);
    world.pallet.addSpriteSheet("../sprites/screenshot.png");
    world.pallet.setSpriteSize(24);

    $("#button").click(function() {
        $("#upload").click();
    });

    $("#upload").change(function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                world.pallet.addSpriteSheet(e.target.result);
            }

            reader.readAsDataURL(this.files[0]);
        }
    });

    // $("#button").click(() => {

    // })
    // $("#zoom-in").on("click", function () {
    //     world.pallet.addSpriteSheet("../sprites/ss2.png");
    // })
    // $("#zoom-out").on("click", function () {
    //     world.pallet.toggleSpriteSheet(Math.round(Math.random()));
    // })


})();