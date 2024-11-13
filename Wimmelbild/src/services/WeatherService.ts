export class WeatherService {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private raindrops: Raindrop[] = [];
    private animationFrame: number | null = null;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.ctx = this.canvas.getContext('2d')!;
    }

    private createRaindrop(): Raindrop {
        return {
            x: Math.random() * window.innerWidth,
            y: -10,
            speed: 15 + Math.random() * 10,
            length: 20 + Math.random() * 30
        };
    }

    private updateRain() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        this.ctx.lineWidth = 1;

        // Update existing raindrops
        for (let i = this.raindrops.length - 1; i >= 0; i--) {
            const drop = this.raindrops[i];
            drop.y += drop.speed;

            // Draw raindrop
            this.ctx.beginPath();
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x + 1, drop.y + drop.length);
            this.ctx.stroke();

            // Remove if off screen
            if (drop.y > window.innerHeight) {
                this.raindrops.splice(i, 1);
            }
        }

        // Add new raindrops
        while (this.raindrops.length < 200) {
            this.raindrops.push(this.createRaindrop());
        }

        this.animationFrame = requestAnimationFrame(() => this.updateRain());
    }

    public start() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        document.body.appendChild(this.canvas);
        this.updateRain();

        // Add resize handler
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    public stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.canvas.remove();
        this.raindrops = [];
    }
}

interface Raindrop {
    x: number;
    y: number;
    speed: number;
    length: number;
} 