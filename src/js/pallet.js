'use strict';

const Pallet = (() => {

    const $canvas = $('<canvas/>');
    const ctx = $canvas[0].getContext('2d');
    let magnification = 1;
    let spriteSheets = [];

    return {
        tileSize: 0,
        selectedSheet: null,
        selectedSpriteData: null,

        init: function () {
            $('#pallet-container').prepend($canvas);


            $canvas.click(event => {
                const offset = $canvas.offset();
                const magnifiedTileSize = this.tileSize * magnification;

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

            return this;
        },

        // Add a sprite sheet to the pallet and specify size
        addSpriteSheet: function (spriteURL, tileSizeX) {
            this.tileSize = tileSizeX;
            magnification = 1;
            const img = new Image();
            img.onload = function () {
                ctx.canvas.height = img.height;
                ctx.canvas.width = img.width;
                this.toggleSpriteSheet(spriteSheets.push(img)-1);
            }.bind(this);
            img.src = spriteURL;
        },

        drawGridLines: function () {
            const $gridLines = $('#grid-lines');
            const gridLinesCtx = $gridLines[0].getContext("2d");
            CanvasUtils.clear($('#grid-lines')[0]);
            // CanvasUtils.setSize($('#grid-lines')[0], this.this.selectedSheet * this.magnification, this.this.selectedSheet * this.magnification);
            gridLinesCtx.canvas.height = this.selectedSheet.height * magnification;
            gridLinesCtx.canvas.width = this.selectedSheet.width * magnification;

            CanvasUtils.drawGrid(
                $('#grid-lines')[0], this.tileSize * magnification,
                this.tileSize * magnification, "white", 2
            );
        },

        toggleGridLines: function () {
            $('#grid-lines').toggle();
        },

        // For swapping between different sprite sheets in the pallet
        toggleSpriteSheet: function (index) {
            this.selectedSheet = spriteSheets[index];
            CanvasUtils.clear($canvas[0]);
            ctx.drawImage(this.selectedSheet, 0, 0);
            this.drawGridLines();
        },

        zoom: function (inOut) {
            if ((inOut > 0 && this.magnification === 10) ||
                (inOut < 0 && this.magnification) === 0.25) return;

            magnification += inOut > 0 ? 0.25 : -1 * 0.25;
            CanvasUtils.clear($canvas[0]);
            ctx.canvas.height = this.selectedSheet.height * magnification; // Set new height
            ctx.canvas.width = this.selectedSheet.width * magnification; // Set new width

            CanvasUtils.disableSmoothing($canvas[0]);

            ctx.drawImage(
                this.selectedSheet,
                0, 0, this.selectedSheet.width, this.selectedSheet.height,
                0, 0, ctx.canvas.width, ctx.canvas.height
            );

            // If a sprite is selected, scale the transparent blue indicator
            if (this.selectedSpriteData) {
                $("#selected-tile-indicator").css({
                    'left': this.selectedSpriteData.x * this.selectedSpriteData.dx * magnification,
                    'top': this.selectedSpriteData.y * this.selectedSpriteData.dy * magnification,
                    'min-width': this.tileSize * magnification,
                    'height': this.tileSize * magnification
                });
            }

            // Redraw pallet grid lines
            this.drawGridLines();

        }

        
    }

})();