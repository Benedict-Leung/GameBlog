/**
 * Controls for the user
 */
class Control {
    constructor() {
        // Stores user input
        this.input = {
            forward: false,
            backward: false,
            right: false,
            left: false,
            shoot: false,
            turretLeft: false,
            turretRight: false
        }
    }

    /**
     * Initializes keypress events
     */
    create() {
        $(document).keydown((event) => {
            if (event.code == 'KeyW' || event.code == 'ArrowUp') {
                this.input.forward = true;
            }
            
            if (event.code == 'KeyS' || event.code == 'ArrowDown') {
                this.input.backward = true;
            }

            if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
                this.input.left = true;
            }
            
            if (event.code == 'KeyD' || event.code == 'ArrowRight') {
                this.input.right = true;
            }

            if (event.code == 'Space') {
                this.input.shoot = true;
            }

            if (event.code == 'KeyZ') {
                this.input.turretLeft = true;
            }

            if (event.code == 'KeyX') {
                this.input.turretRight = true;
            }
        });

        $(document).keyup((event) => {
            if (event.code == 'KeyW' || event.code == 'ArrowUp') {
                this.input.forward = false;
            }
            
            if (event.code == 'KeyS' || event.code == 'ArrowDown') {
                this.input.backward = false;
            }

            if (event.code == 'KeyA' || event.code == 'ArrowLeft') {
                this.input.left = false;
            }
            
            if (event.code == 'KeyD' || event.code == 'ArrowRight') {
                this.input.right = false;
            }

            if (event.code == 'Space') {
                this.input.shoot = false;
            }

            if (event.code == 'KeyZ') {
                this.input.turretLeft = false;
            }

            if (event.code == 'KeyX') {
                this.input.turretRight = false;
            }
        });

        $(window).blur(() => {
            this.input.forward = false;
            this.input.backward = false;
            this.input.left = false;
            this.input.right = false;
            this.input.shoot = false;
            this.input.turretLeft = false;
            this.input.turretRight = false;
        });

    }

    /**
     * Return input
     */
    getInput() {
        return this.input;
    }
}

module.exports = Control;