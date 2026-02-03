// Basic 3D Tilt Effect Library
class VanillaTilt {
    constructor(element, settings = {}) {
        if (!(element instanceof Node)) {
            throw "Can't initialize VanillaTilt on " + element;
        }

        this.width = null;
        this.height = null;
        this.left = null;
        this.top = null;
        this.transitionTimeout = null;
        this.updateCall = null;

        this.updateBind = this.update.bind(this);
        this.resetBind = this.reset.bind(this);

        this.element = element;
        this.settings = this.extendSettings(settings);

        this.reverse = this.settings.reverse ? -1 : 1;

        this.glare = this.isSettingTrue(this.settings.glare);
        this.glarePrerender = this.isSettingTrue(this.settings["glare-prerender"]);
        this.fullPageListening = this.isSettingTrue(this.settings["full-page-listening"]);

        if (this.glare) {
            this.prepareGlare();
        }

        if (this.fullPageListening) {
            this.windowEventListener = true;
        }

        this.addEventListeners();
        this.updateInitialPosition();
    }

    isSettingTrue(setting) {
        return setting === "" || setting === true || setting === 1;
    }

    static init(elements, settings) {
        if (elements instanceof Node) {
            elements = [elements];
        }

        if (elements instanceof NodeList) {
            elements = [].slice.call(elements);
        }

        if (!(elements instanceof Array)) {
            return;
        }

        elements.forEach(element => {
            if (!("vanillaTilt" in element)) {
                element.vanillaTilt = new VanillaTilt(element, settings);
            }
        });
    }

    updateInitialPosition() {
        if (this.settings.startX !== undefined && this.settings.startY !== undefined) {
            this.reset();
            this.updateCall = requestAnimationFrame(this.updateBind);
        }
    }

    addEventListeners() {
        this.onMouseEnterBind = this.onMouseEnter.bind(this);
        this.onMouseMoveBind = this.onMouseMove.bind(this);
        this.onMouseLeaveBind = this.onMouseLeave.bind(this);
        this.onWindowResizeBind = this.onWindowResize.bind(this);

        this.element.addEventListener("mouseenter", this.onMouseEnterBind);
        this.element.addEventListener("mouseleave", this.onMouseLeaveBind);
        this.element.addEventListener("mousemove", this.onMouseMoveBind);

        if (this.glare || this.fullPageListening) {
            window.addEventListener("resize", this.onWindowResizeBind);
        }

        if (this.fullPageListening) {
            window.addEventListener("mousemove", this.onMouseMoveBind);
        }
    }

    removeEventListeners() {
        this.element.removeEventListener("mouseenter", this.onMouseEnterBind);
        this.element.removeEventListener("mouseleave", this.onMouseLeaveBind);
        this.element.removeEventListener("mousemove", this.onMouseMoveBind);

        if (this.glare || this.fullPageListening) {
            window.removeEventListener("resize", this.onWindowResizeBind);
        }

        if (this.fullPageListening) {
            window.removeEventListener("mousemove", this.onMouseMoveBind);
        }
    }

    onMouseEnter() {
        this.updateElementSize();
        this.element.style.willChange = "transform";
        this.setTransition();
    }

    onMouseMove(event) {
        if (this.updateCall !== null) {
            cancelAnimationFrame(this.updateCall);
        }

        this.event = event;
        this.updateCall = requestAnimationFrame(this.updateBind);
    }

    onMouseLeave() {
        this.setTransition();

        if (this.settings.reset) {
            requestAnimationFrame(this.resetBind);
        }
    }

    reset() {
        this.event = {
            clientX: this.left + this.width / 2,
            clientY: this.top + this.height / 2
        };

        if (this.element && this.element.style) {
            this.element.style.transform = `perspective(${this.settings.perspective}px) ` +
                `rotateX(0deg) ` +
                `rotateY(0deg) ` +
                `scale3d(1, 1, 1)`;
        }

        this.resetGlare();
    }

    resetGlare() {
        if (this.glare) {
            this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
            this.glareElement.style.opacity = "0";
        }
    }

    updateElementSize() {
        let rect = this.element.getBoundingClientRect();

        this.width = this.element.offsetWidth;
        this.height = this.element.offsetHeight;
        this.left = rect.left;
        this.top = rect.top;
    }

    update() {
        let values = this.getValues();

        this.element.style.transform = `perspective(${this.settings.perspective}px) ` +
            `rotateX(${this.settings.axis === "x" ? 0 : values.tiltX}deg) ` +
            `rotateY(${this.settings.axis === "y" ? 0 : values.tiltY}deg) ` +
            `scale3d(${this.settings.scale}, ${this.settings.scale}, ${this.settings.scale})`;

        if (this.glare) {
            this.glareElement.style.transform = `rotate(${values.angle}deg) translate(-50%, -50%)`;
            this.glareElement.style.opacity = `${values.percentage * this.settings["max-glare"] / 100}`;
        }

        this.element.dispatchEvent(new CustomEvent("tiltChange", {
            "detail": values
        }));

        this.updateCall = null;
    }

    prepareGlare() {
        if (!this.glarePrerender) {
            const glareWrapper = document.createElement("div");
            glareWrapper.classList.add("js-tilt-glare");

            const glareElement = document.createElement("div");
            glareElement.classList.add("js-tilt-glare-inner");

            glareWrapper.appendChild(glareElement);
            this.element.appendChild(glareWrapper);
        }

        this.glareWrapperElement = this.element.querySelector(".js-tilt-glare");
        this.glareElement = this.element.querySelector(".js-tilt-glare-inner");

        if (this.glarePrerender) {
            return;
        }

        Object.assign(this.glareWrapperElement.style, {
            "position": "absolute",
            "top": "0",
            "left": "0",
            "width": "100%",
            "height": "100%",
            "overflow": "hidden",
            "pointer-events": "none",
            "border-radius": "inherit"
        });

        Object.assign(this.glareElement.style, {
            "position": "absolute",
            "top": "50%",
            "left": "50%",
            "pointer-events": "none",
            "background-image": `linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)`,
            "transform": "rotate(180deg) translate(-50%, -50%)",
            "transform-origin": "0% 0%",
            "opacity": "0"
        });

        this.updateGlareSize();
    }

    updateGlareSize() {
        if (this.glare) {
            const glareSize = (this.element.offsetWidth > this.element.offsetHeight ? this.element.offsetWidth : this.element.offsetHeight) * 2;

            Object.assign(this.glareElement.style, {
                "width": `${glareSize}px`,
                "height": `${glareSize}px`
            });
        }
    }

    onWindowResize() {
        this.updateGlareSize();
    }

    setTransition() {
        clearTimeout(this.transitionTimeout);
        this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;

        if (this.glare) {
            this.glareElement.style.transition = `opacity ${this.settings.speed}ms ${this.settings.easing}`;
        }

        this.transitionTimeout = setTimeout(() => {
            if (this.element) this.element.style.transition = "";
            if (this.glare) this.glareElement.style.transition = "";
        }, this.settings.speed);
    }

    extendSettings(settings) {
        let defaultSettings = {
            reverse: false,
            max: 15,
            startX: 0,
            startY: 0,
            perspective: 1000,
            easing: "cubic-bezier(.03,.98,.52,.99)",
            scale: 1,
            speed: 300,
            transition: true,
            axis: null,
            glare: false,
            "max-glare": 1,
            "glare-prerender": false,
            "full-page-listening": false,
            reset: true
        };

        let newSettings = {};
        Object.keys(defaultSettings).forEach(key => {
            if (key in settings) {
                newSettings[key] = settings[key];
            } else {
                newSettings[key] = defaultSettings[key];
            }
        });

        return newSettings;
    }

    getValues() {
        let x = (this.event.clientX - this.left) / this.width;
        let y = (this.event.clientY - this.top) / this.height;

        x = Math.min(Math.max(x, 0), 1);
        y = Math.min(Math.max(y, 0), 1);

        let tiltX = (this.reverse * (this.settings.max / 2 - x * this.settings.max)).toFixed(2);
        let tiltY = (this.reverse * (y * this.settings.max - this.settings.max / 2)).toFixed(2);
        let angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);

        return {
            tiltX: tiltX,
            tiltY: tiltY,
            percentage: x * 100,
            angle: angle
        };
    }
}

// Auto-initialize for boxes
document.addEventListener("DOMContentLoaded", () => {
    VanillaTilt.init(document.querySelectorAll(".glass-card, .service-card, .process-step, .faq-item, .stat-item, .zoom-hover"), {
        max: 25,
        speed: 400,
        glare: true,
        "max-glare": 0.4,
        scale: 1.05,
        perspective: 1000
    });
});

