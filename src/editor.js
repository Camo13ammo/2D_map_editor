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
        this.magnification = 1;
        this.spriteSheets = [];
        this.$canvas = $('<canvas/>');
        this.ctx = this.$canvas[0].getContext("2d");
        $("#pallet-container").prepend(this.$canvas);

        //Prevents the canvas from anti-aliasing tiles
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.oImageSmoothingEnabled = false;

        this.$canvas.click(event => {
            const offset = this.$canvas.offset();
            const magnifiedTileSize = this.tileSize * this.magnification;

            // Place the blue "selected tile" indicator
            $("#selected-tile-indicator").css({
                'left': Math.floor((event.pageX - offset.left) / (magnifiedTileSize)) * magnifiedTileSize,
                'top': Math.floor((event.pageY - offset.top) / (magnifiedTileSize)) * magnifiedTileSize,
                'min-width': magnifiedTileSize,
                'height': magnifiedTileSize
            });

            // Set the selected sprite from the pallet
            this.selectedSpriteData = {
                img: this.selectedSheet,
                x: Math.floor((event.pageX - offset.left) / (magnifiedTileSize)),
                y: Math.floor((event.pageY - offset.top) / (magnifiedTileSize)),
                dx: this.tileSize,
                dy: this.tileSize
            };
        });
    }

    // Zooms the pallet in and out.
    Pallet.prototype.zoom = function (inOut) {
        if ((inOut > 0 && this.magnification === 10) ||
            (inOut < 0 && this.magnification) === 0.25) return;

        this.magnification += inOut > 0 ? 0.25 : -1 * 0.25;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height); // Clear canvas
        this.ctx.canvas.height = this.selectedSheet.height * this.magnification; // Set new height
        this.ctx.canvas.width = this.selectedSheet.width * this.magnification; // Set new width

        // Prevents the canvas from anti-aliasing tiles
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.oImageSmoothingEnabled = false;

        // Draw the whole image the full size of the new canvas
        this.ctx.drawImage(
            this.selectedSheet,
            0, 0, this.selectedSheet.width, this.selectedSheet.height,
            0, 0, this.ctx.canvas.width, this.ctx.canvas.height
        );

        // If a sprite is selected, scale the transparent blue indicator
        if (this.selectedSpriteData) {
            $("#selected-tile-indicator").css({
                'left': this.selectedSpriteData.x * this.selectedSpriteData.dx * this.magnification,
                'top': this.selectedSpriteData.y * this.selectedSpriteData.dy * this.magnification,
                'min-width': this.tileSize * this.magnification,
                'height': this.tileSize * this.magnification
            });
        }

        // Redraw pallet grid lines
        this.drawGridLines();
    };

    // Add a sprite sheet to the pallet and specify size
    Pallet.prototype.addSpriteSheet = function (spriteURL, tileSizeX) {
        this.tileSize = tileSizeX;
        this.magnification = 1;
        const img = new Image();
        img.onload = function() {
            this.ctx.canvas.height = img.height;
            this.ctx.canvas.width = img.width;
            this.toggleSpriteSheet(this.spriteSheets.push(img)-1);
        }.bind(this);
        img.src = spriteURL;
    };

    // For swapping between different sprite sheets in the pallet
    Pallet.prototype.toggleSpriteSheet = function (index) {
        this.selectedSheet = this.spriteSheets[index];
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.drawImage(this.selectedSheet, 0, 0);
        this.drawGridLines();
    };

    // Draw the grid lines over the pallet
    Pallet.prototype.drawGridLines = function () {
        const $gridLines = $('#grid-lines');
        const gridLinesCtx = $gridLines[0].getContext("2d");
        gridLinesCtx.clearRect(0, 0, gridLinesCtx.canvas.width, gridLinesCtx.canvas.height); // Clear old lines
        gridLinesCtx.canvas.height = this.selectedSheet.height * this.magnification;
        gridLinesCtx.canvas.width = this.selectedSheet.width * this.magnification;
        // Drawing vertical lines
        for (let x = 0; x <= gridLinesCtx.canvas.width; x += (this.tileSize * this.magnification)) {
            gridLinesCtx.moveTo(x, 0);
            gridLinesCtx.lineTo(x, gridLinesCtx.canvas.height);
        }

        // Drawing horizontal lines
        for (let y = 0; y <= gridLinesCtx.canvas.height; y += (this.tileSize * this.magnification)) {
            gridLinesCtx.moveTo(0, y);
            gridLinesCtx.lineTo(gridLinesCtx.canvas.width, y);
        }

        gridLinesCtx.lineWidth = 2;
        gridLinesCtx.strokeStyle = "white";
        gridLinesCtx.stroke();
    };

    Pallet.prototype.toggleGridLines = function () {
        $('#grid-lines').toggle();
    }

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
        this.$canvas
        .mousedown(event => {
            event.originalEvent.preventDefault();
            this.dragging = true;
            this.draw(event);
        })
        .mouseup(event => {
            this.dragging = false;
            const snap = this.$canvas[0].toDataURL();
            $("#grid-management").css({
                "background-image" : "url(" + snap + ")",
                "background-size": "contain",
                "background-repeat": "no-repeat"
            });
        })
        .mousemove(event => {
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

    const world = new World(24, 50, 20);
    world.pallet.addSpriteSheet("../sprites/screenshot.png", 24);

    $("#button").click(function () {
        $("#upload").click();
    });

    $("#upload").change(function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();

            reader.onload = function (e) {
                world.pallet.addSpriteSheet(e.target.result, 8);
            }

            reader.readAsDataURL(this.files[0]);
        }
    });

    $("#zoomIn").click(function () {
        world.pallet.zoom(1);
    });

    $("#zoomOut").click(function () {
        world.pallet.zoom(-1);
    });

    $("#togglePalletGridLines").click(function () {
        world.pallet.toggleGridLines();
    });

})();