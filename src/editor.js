'use strict';

(() => {

    function World (tileSize, tileCount_X, tileCount_Y) {
        this.tileSize = tileSize;
        this.tileCount_X = tileCount_X;
        this.tileCount_Y = tileCount_Y;
        this.grids = [];
        this.pallet = new Pallet(tileSize);
        this.pallet.$canvas.click(event => {
            const offset = this.pallet.$canvas.offset();
            const imgData = {
                img: this.pallet.selectedSheet,
                x: Math.floor((event.pageX - offset.left) / (this.pallet.tileSize)),
                y: Math.floor((event.pageY - offset.top) / (this.pallet.tileSize)),
                dx: this.pallet.tileSize,
                dy: this.pallet.tileSize
            };
            this.grids.forEach(grid => {
                grid.setSprite(imgData);
            })
        });
    }

    World.prototype.addGrid = function () {
        let grid = new Grid(this.tileSize, this.tileCount_X, this.tileCount_Y);
        grid.createAndShow();
        this.grids.push(grid);
    }

    function Pallet (tileSize) {
        this.selectedSheet = null;
        this.tileSize = tileSize;
        this.spriteSheets = [];
        this.$canvas = $('<canvas/>');
        this.ctx = this.$canvas[0].getContext("2d");
        $("#pallet-container").append(this.$canvas);
    }

    // TODO: add functionality for both x and y
    Pallet.prototype.setSpriteSize = function (spriteSizeX, spriteSizeY) {
        this.tileSize = spriteSizeX;
    }

    Pallet.prototype.addSpriteSheet = function (spriteURL) {
        let img = new Image();
        img.onload = function() {
            this.ctx.canvas.height = img.height;
            this.ctx.canvas.width = img.width;
            this.toggleSpriteSheet(this.spriteSheets.push(img)-1);
        }.bind(this);
        img.src = spriteURL;
    }

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
    }

    function Grid (tileSize, tileCount_X, tileCount_Y) {
        this.$canvas = $('<canvas/>');
        this.ctx = this.$canvas[0].getContext("2d");
        this.spriteData = null;
        this.tileSize = tileSize;
        this.tileCount_X = tileCount_X;
        this.tileCount_Y = tileCount_Y;
        this.level = Array(tileCount_Y).fill().map(() => Array(tileCount_X).fill(false));
    }

    Grid.prototype.createAndShow = function () {

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
            if (!this.spriteData) return; // Some error for no sprite selected
            const offset = this.$canvas.offset();
            const tile_x = Math.floor((event.pageX - offset.left) / (this.tileSize));
            const tile_y = Math.floor((event.pageY - offset.top) / (this.tileSize));
            this.ctx.drawImage(this.spriteData.img, // Image source
                this.spriteData.x * this.spriteData.dx, this.spriteData.y * this.spriteData.dy, //x, y coord start
                this.spriteData.dx, this.spriteData.dy, // x, y clipping size
                tile_x * this.tileSize, tile_y * this.tileSize, // x, y placement start
                this.tileSize, this.tileSize); // x, y placement size
            this.level[tile_y][tile_x] = true;
        });

        this.$canvas.mouseup(event => {
            const snap = this.$canvas[0].toDataURL();
            $("#grid-management").css({
                "background-image" : "url(" + snap + ")",
                "background-size": "contain",
                "background-repeat": "no-repeat"
            });
        }).mouseup(); // Initial click to display grid.

        // Hovering over grid previews the sprites
        this.$canvas.mousemove(event => {
            const offset = this.$canvas.offset();
            const $preview = $("#sprite-preview");
            $preview.show();
            $preview.css({
                'top': Math.floor((event.pageY - offset.top) / (this.tileSize)) * this.tileSize,
                'left': Math.floor((event.pageX - offset.left) / (this.tileSize)) * this.tileSize,
            })
            if (this.spriteData) {
                $preview.css({
                    'border': 'none',
                    'background-image': 'url(' + this.spriteData.img.src + ')',
                    'background-position-x': -1 * (this.spriteData.x * this.spriteData.dx),
                    'background-position-y': -1 * (this.spriteData.y * this.spriteData.dy),
                    'opacity': .4,
                    'width': this.spriteData.dx,
                    'height': this.spriteData.dy,
                });
            } else {
                $preview.css({
                    'border': '2px solid black',
                    'min-width': this.tileSize-4,
                    'height': this.tileSize-4,
                })
            }
        });

        // On Mouse out of grid, hides the sprite preview
        this.$canvas.mouseout(event => {
            $("#sprite-preview").hide();
        })
    }

    Grid.prototype.setSprite = function (spriteData) {
        this.spriteData = spriteData;
    }

    Grid.prototype.toggle = function () {
        this.$canvas.toggle();
    }

    var world = new World(48, 20, 19);
    world.addGrid();
    world.pallet.addSpriteSheet("../sprites/screenshot.png");
    world.pallet.setSpriteSize(48);

    $("#button").click(function() {
        $("#upload").click();
    })

    $("#upload").change(function() {
        if (this.files && this.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                world.pallet.addSpriteSheet(e.target.result);
            }

            reader.readAsDataURL(this.files[0]);
        }
    })

    // $("#button").click(() => {

    // })
    // $("#zoom-in").on("click", function () {
    //     world.pallet.addSpriteSheet("../sprites/ss2.png");
    // })
    // $("#zoom-out").on("click", function () {
    //     world.pallet.toggleSpriteSheet(Math.round(Math.random()));
    // })


})();