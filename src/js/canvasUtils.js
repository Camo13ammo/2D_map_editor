'use strict';

const CanvasUtils = (() => {

    return {

        createCanvas: function () {
            return $('<canvas/>');
        },

        setSize: function(canvas, width, height) {
            canvas.width = width;
            canvas.height = height;
        },

        drawGrid: function (canvas, tileSizeX, tileSizeY, color, lineWidth) {
            // Drawing vertical lines
            lineWidth = lineWidth || 1;
            color = color || 'black';
            const ctx = canvas.getContext('2d');

            for (let x = 0; x <= canvas.width; x += tileSizeX) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
            }

            // Drawing horizontal lines
            for (let y = 0; y <= canvas.height; y += tileSizeY) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
            }

            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = color;
            ctx.stroke();
        },

        setSmoothing: function (canvas, isSmoothed) {
            const ctx = canvas.getContext('2d');
            ctx.mozImageSmoothingEnabled = isSmoothed;
            ctx.webkitImageSmoothingEnabled = isSmoothed;
            ctx.msImageSmoothingEnabled = isSmoothed;
            ctx.imageSmoothingEnabled = isSmoothed;
            ctx.oImageSmoothingEnabled = isSmoothed;
        },

        disableSmoothing: function (canvas) {
            this.setSmoothing(canvas, false);
        },

        enableSmoothing: function (canvas) {
            this.setSmoothing(canvas, true);
        },

        clear: function (canvas) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }

    }

})();