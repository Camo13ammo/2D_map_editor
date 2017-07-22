'use strict';

(() => {

    let tileSize = 0;
    let tileCountX = 0;
    let tileCountY = 0;
    let grids = [];

    const world = {

        pallet: null,

        init: function (size, x, y) {
            tileSize = size;
            tileCountX = x;
            tileCountY = y;
            this.pallet = Pallet.init();
            this.pallet.addSpriteSheet("../sprites/sample.png", 32)
            this.addGrid();
        },

        addGrid: function () {
            grids.push(new Grid(tileSize, tileCountX, tileCountY, this));
        },

        getTileCountX: function () {
            return tileCountX;
        },

        getTileCountY: function () {
            return tileCountY;
        },

        getTileSize: function () {
            return tileSize;
        }

    }

    window.world = world;
    world.init(24, 10, 10);

    $("#button").click(function () {
        $("#upload").click();
    });

    $("#upload").change(function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();

            reader.onload = function (e) {
                Pallet.addSpriteSheet(e.target.result, 8);
            }

            reader.readAsDataURL(this.files[0]);
        }
    });

    $("#zoomIn").click(function () {
        Pallet.zoom(1);
    });

    $("#zoomOut").click(function () {
        Pallet.zoom(-1);
    });

    $("#togglePalletGridLines").click(function () {
        Pallet.toggleGridLines();
    });

})();
